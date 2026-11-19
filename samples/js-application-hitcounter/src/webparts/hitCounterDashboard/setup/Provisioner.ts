import { SpRest } from '../../../shared/spRest';
import {
  IBasePermissions,
  IHitCounterSettings,
  IListDefinition,
  PERMISSION_LEVEL_DESCRIPTION,
  PERMISSION_LEVEL_KINDS,
  PERMISSION_LEVEL_NAME,
  PermissionKind,
  SCHEMA_VERSION,
  SETTINGS_KEY,
  STATE_LIST,
  allListDefinitions,
  everyoneExceptExternalClaim,
  parseSettings,
  fieldSchemaXml,
  hasPermission,
  toBasePermissions
} from '../../../shared/schema';

/** One line of progress, shown to the admin while Set up runs. */
export interface IProgress {
  level: 'info' | 'done' | 'warn' | 'error';
  message: string;
}

export type ProgressCallback = (progress: IProgress) => void;

export type SetupState = 'not-set-up' | 'needs-update' | 'ready';

export interface ISetupStatus {
  state: SetupState;
  missingLists: string[];
  installedSchemaVersion: number | undefined;
  settings: IHitCounterSettings | undefined;
}

interface IListInfo {
  Id: string;
  Title: string;
  Hidden: boolean;
  NoCrawl: boolean;
  EnableVersioning: boolean;
  EnableAttachments?: boolean;
  HasUniqueRoleAssignments: boolean;
  ReadSecurity?: number;
  WriteSecurity?: number;
}

interface IFieldInfo {
  InternalName: string;
  Indexed: boolean;
  EnforceUniqueValues: boolean;
  Required: boolean;
}

interface IPrincipal {
  Id: number;
  Title?: string;
}

interface IRoleAssignment {
  PrincipalId: number;
}

interface IItem {
  Id: number;
  Title: string;
  Data?: string;
}

/**
 * Creates, repairs and upgrades everything HitCounter needs on the central
 * site (scope F6). Safe to run repeatedly: each step checks first and only
 * creates or changes what is missing or different.
 */
export class Provisioner {
  private readonly _rest: SpRest;
  private readonly _tenantId: string;

  constructor(rest: SpRest, tenantId: string) {
    this._rest = rest;
    this._tenantId = tenantId;
  }

  /** True when the current user has owner-level permissions on this web. */
  public async currentUserIsOwner(): Promise<boolean> {
    const mask: { Low: string; High: string } = await this._rest.get('/_api/web/effectiveBasePermissions');
    return hasPermission(mask, PermissionKind.ManagePermissions) && hasPermission(mask, PermissionKind.ManageWeb);
  }

  /** Quick status: which lists exist and which schema version is installed. */
  public async getStatus(): Promise<ISetupStatus> {
    const existing: string[] = await this._existingListTitles();
    const missingLists: string[] = allListDefinitions()
      .map((d: IListDefinition) => d.title)
      .filter((title: string) => existing.indexOf(title.toLowerCase()) === -1);

    let settings: IHitCounterSettings | undefined;
    if (existing.indexOf(STATE_LIST.toLowerCase()) !== -1) {
      settings = await this._readSettings();
    }
    const installed: number | undefined = settings ? settings.schemaVersion : undefined;

    let state: SetupState;
    if (missingLists.length === allListDefinitions().length) {
      state = 'not-set-up';
    } else if (missingLists.length > 0 || installed === undefined || installed < SCHEMA_VERSION) {
      state = 'needs-update';
    } else {
      state = 'ready';
    }
    return { state, missingLists, installedSchemaVersion: installed, settings };
  }

  /** Runs Set up / repair. Reports each step through onProgress. */
  public async run(requested: IHitCounterSettings, onProgress: ProgressCallback): Promise<void> {
    const report = (level: IProgress['level'], message: string): void => onProgress({ level, message });

    report('info', 'Checking your permissions');
    if (!(await this.currentUserIsOwner())) {
      throw new Error('You need to be an owner of this site to set up HitCounter.');
    }

    report('info', `Permission level "${PERMISSION_LEVEL_NAME}"`);
    const addRoleId: number = await this._ensurePermissionLevel(report);

    const fullControlId: number = (await this._rest.get<IPrincipal>('/_api/web/roledefinitions/getbytype(5)')).Id;
    const readId: number = (await this._rest.get<IPrincipal>('/_api/web/roledefinitions/getbytype(2)')).Id;
    const ownersGroup: IPrincipal | undefined = await this._rest.tryGet<IPrincipal>('/_api/web/associatedownergroup');
    if (!ownersGroup || !ownersGroup.Id) {
      report('warn', 'This site has no Owners group. Only site collection admins will be able to manage HitCounter.');
    }
    const everyone: IPrincipal = await this._rest.post<IPrincipal>('/_api/web/ensureuser', {
      logonName: everyoneExceptExternalClaim(this._tenantId)
    });

    const existing: string[] = await this._existingListTitles();
    for (const definition of allListDefinitions()) {
      await this._ensureList(definition, existing, {
        addRoleId,
        fullControlId,
        readId,
        ownersGroupId: ownersGroup && ownersGroup.Id ? ownersGroup.Id : undefined,
        everyoneId: everyone.Id
      }, report);
    }

    report('info', 'Settings');
    await this._writeSettings(requested);
    report('done', `Settings saved (schema version ${SCHEMA_VERSION})`);
  }

  // ---------------------------------------------------------------- lists

  private async _existingListTitles(): Promise<string[]> {
    const result: { value: { Title: string }[] } = await this._rest.get('/_api/web/lists?$select=Title&$top=5000');
    return result.value.map((l: { Title: string }) => l.Title.toLowerCase());
  }

  private async _ensureList(
    definition: IListDefinition,
    existing: string[],
    roles: { addRoleId: number; fullControlId: number; readId: number; ownersGroupId: number | undefined; everyoneId: number },
    report: (level: IProgress['level'], message: string) => void
  ): Promise<void> {
    const listPath: string = `/_api/web/lists/getbytitle('${SpRest.quote(definition.title)}')`;
    const changes: string[] = [];

    if (existing.indexOf(definition.title.toLowerCase()) === -1) {
      await this._rest.post('/_api/web/lists', {
        __metadata: { type: 'SP.List' },
        Title: definition.title,
        Description: definition.description,
        BaseTemplate: definition.baseTemplate,
        AllowContentTypes: false,
        ContentTypesEnabled: false
      });
      changes.push('created');
    }

    // List settings: hidden, out of search, no versions or attachments, own-items security.
    const info: IListInfo = await this._rest.get<IListInfo>(
      `${listPath}?$select=Id,Title,Hidden,NoCrawl,EnableVersioning,EnableAttachments,HasUniqueRoleAssignments,ReadSecurity,WriteSecurity`
    );
    const update: { [key: string]: unknown } = {};
    if (!info.Hidden) { update.Hidden = true; }
    if (!info.NoCrawl) { update.NoCrawl = true; }
    if (info.EnableVersioning) { update.EnableVersioning = false; }
    if (definition.baseTemplate === 100 && info.EnableAttachments) { update.EnableAttachments = false; }
    if (definition.ownItemsOnly) {
      if (info.ReadSecurity !== 2) { update.ReadSecurity = 2; }
      if (info.WriteSecurity !== 2) { update.WriteSecurity = 2; }
    }
    if (Object.keys(update).length > 0) {
      update.__metadata = { type: 'SP.List' };
      await this._rest.merge(listPath, update);
      changes.push('settings');
    }

    // Columns.
    const fieldsChanged: number = await this._ensureFields(definition, listPath);
    if (fieldsChanged > 0) {
      changes.push(`${fieldsChanged} column change(s)`);
    }

    // Permissions.
    if (await this._ensurePermissions(definition, listPath, info.HasUniqueRoleAssignments, roles)) {
      changes.push('permissions');
    }

    report('done', `${definition.title}: ${changes.length > 0 ? changes.join(', ') : 'already correct'}`);
  }

  private async _ensureFields(definition: IListDefinition, listPath: string): Promise<number> {
    const result: { value: IFieldInfo[] } = await this._rest.get(
      `${listPath}/fields?$select=InternalName,Indexed,EnforceUniqueValues,Required&$top=500`
    );
    const byName: { [name: string]: IFieldInfo } = {};
    for (const f of result.value) {
      byName[f.InternalName] = f;
    }
    let changed: number = 0;

    for (const field of definition.fields) {
      const current: IFieldInfo | undefined = byName[field.name];
      if (!current) {
        await this._rest.post(`${listPath}/fields/createfieldasxml`, {
          parameters: {
            __metadata: { type: 'SP.XmlSchemaFieldCreationInformation' },
            SchemaXml: fieldSchemaXml(field),
            // 8 = AddFieldInternalNameHint: keep the internal name exactly as defined.
            Options: 8
          }
        });
        changed++;
        continue;
      }
      const fieldUpdate: { [key: string]: unknown } = {};
      if (field.indexed && !current.Indexed) { fieldUpdate.Indexed = true; }
      if (field.unique && !current.EnforceUniqueValues) { fieldUpdate.EnforceUniqueValues = true; }
      if (Object.keys(fieldUpdate).length > 0) {
        fieldUpdate.__metadata = { type: 'SP.Field' };
        await this._rest.merge(`${listPath}/fields/getbyinternalnameortitle('${field.name}')`, fieldUpdate);
        changed++;
      }
    }

    // Built-in Title column.
    const title: IFieldInfo | undefined = byName.Title;
    if (title && definition.baseTemplate === 100) {
      const titleUpdate: { [key: string]: unknown } = {};
      if (definition.titleOptional && title.Required) { titleUpdate.Required = false; }
      if (definition.titleUnique) {
        if (!title.Indexed) { titleUpdate.Indexed = true; }
        if (!title.EnforceUniqueValues) { titleUpdate.EnforceUniqueValues = true; }
      }
      if (Object.keys(titleUpdate).length > 0) {
        titleUpdate.__metadata = { type: 'SP.Field' };
        await this._rest.merge(`${listPath}/fields/getbyinternalnameortitle('Title')`, titleUpdate);
        changed++;
      }
    }
    return changed;
  }

  /**
   * Gives the list its own permissions: Owners group Full Control, plus normal
   * users' access for the list's audience. Removes any other inherited access
   * (for example site Members' Edit). Returns true if anything changed.
   */
  private async _ensurePermissions(
    definition: IListDefinition,
    listPath: string,
    hasUnique: boolean,
    roles: { addRoleId: number; fullControlId: number; readId: number; ownersGroupId: number | undefined; everyoneId: number }
  ): Promise<boolean> {
    let changed: boolean = false;
    if (!hasUnique) {
      // Copy first so the person running setup never loses access mid-way.
      await this._rest.post(`${listPath}/breakroleinheritance(copyRoleAssignments=true,clearSubscopes=true)`);
      changed = true;
    }

    const wanted: { principalId: number; roleId: number }[] = [];
    if (roles.ownersGroupId !== undefined) {
      wanted.push({ principalId: roles.ownersGroupId, roleId: roles.fullControlId });
    }
    if (definition.audience === 'record') {
      wanted.push({ principalId: roles.everyoneId, roleId: roles.addRoleId });
    } else if (definition.audience === 'read') {
      wanted.push({ principalId: roles.everyoneId, roleId: roles.readId });
    }

    const current: { value: IRoleAssignment[] } = await this._rest.get(`${listPath}/roleassignments?$select=PrincipalId`);
    const wantedIds: number[] = wanted.map((w: { principalId: number }) => w.principalId);

    // Remove anyone else (inherited Members, Visitors and so on).
    for (const assignment of current.value) {
      if (wantedIds.indexOf(assignment.PrincipalId) === -1) {
        await this._rest.del(`${listPath}/roleassignments/getbyprincipalid(${assignment.PrincipalId})`);
        changed = true;
      }
    }

    // Make sure each wanted principal has exactly the wanted role.
    // Only ask for bindings of principals that already have an assignment:
    // getbyprincipalid() throws (not 404) for a principal with no access.
    const currentIds: number[] = current.value.map((a: IRoleAssignment) => a.PrincipalId);
    for (const w of wanted) {
      let roleIds: number[] = [];
      if (currentIds.indexOf(w.principalId) !== -1) {
        const bindings: { value: { Id: number }[] } = await this._rest.get(
          `${listPath}/roleassignments/getbyprincipalid(${w.principalId})/roledefinitionbindings?$select=Id`
        );
        roleIds = bindings.value.map((b: { Id: number }) => b.Id);
      }
      if (roleIds.length === 1 && roleIds[0] === w.roleId) {
        continue;
      }
      if (roleIds.length > 0) {
        await this._rest.del(`${listPath}/roleassignments/getbyprincipalid(${w.principalId})`);
      }
      await this._rest.post(`${listPath}/roleassignments/addroleassignment(principalid=${w.principalId},roledefid=${w.roleId})`);
      changed = true;
    }
    return changed;
  }

  // ------------------------------------------------------ permission level

  private async _ensurePermissionLevel(report: (level: IProgress['level'], message: string) => void): Promise<number> {
    const wanted: IBasePermissions = toBasePermissions(PERMISSION_LEVEL_KINDS);
    // Look the level up in the full list: roledefinitions/getbyname() returns
    // 500 "Permission level cannot be found" (not 404) when it doesn't exist.
    const all: { value: { Id: number; Name: string; BasePermissions: { Low: string; High: string } }[] } =
      await this._rest.get('/_api/web/roledefinitions?$select=Id,Name,BasePermissions');
    const matches = all.value.filter((r: { Name: string }) => r.Name.toLowerCase() === PERMISSION_LEVEL_NAME.toLowerCase());
    const existing: { Id: number; BasePermissions: { Low: string; High: string } } | undefined =
      matches.length > 0 ? matches[0] : undefined;

    const body = {
      __metadata: { type: 'SP.RoleDefinition' },
      BasePermissions: { __metadata: { type: 'SP.BasePermissions' }, Low: String(wanted.Low), High: String(wanted.High) },
      Description: PERMISSION_LEVEL_DESCRIPTION
    };

    if (!existing) {
      const created: IPrincipal = await this._rest.post<IPrincipal>('/_api/web/roledefinitions', {
        ...body,
        Name: PERMISSION_LEVEL_NAME,
        Order: 160
      });
      report('done', `Permission level "${PERMISSION_LEVEL_NAME}": created`);
      return created.Id;
    }
    if (Number(existing.BasePermissions.Low) >>> 0 !== wanted.Low || Number(existing.BasePermissions.High) >>> 0 !== wanted.High) {
      await this._rest.merge(`/_api/web/roledefinitions(${existing.Id})`, body);
      report('done', `Permission level "${PERMISSION_LEVEL_NAME}": updated`);
    } else {
      report('done', `Permission level "${PERMISSION_LEVEL_NAME}": already correct`);
    }
    return existing.Id;
  }

  // ------------------------------------------------------------- settings

  private async _findSettingsItem(): Promise<IItem | undefined> {
    const result: { value: IItem[] } = await this._rest.get(
      `/_api/web/lists/getbytitle('${SpRest.quote(STATE_LIST)}')/items?$select=Id,Title,Data&$filter=Title eq '${SETTINGS_KEY}'&$top=1`
    );
    return result.value.length > 0 ? result.value[0] : undefined;
  }

  private async _readSettings(): Promise<IHitCounterSettings | undefined> {
    try {
      const item: IItem | undefined = await this._findSettingsItem();
      return parseSettings(item ? item.Data : undefined);
    } catch {
      return undefined;
    }
  }

  private async _writeSettings(requested: IHitCounterSettings): Promise<void> {
    const data: string = JSON.stringify({ ...requested, schemaVersion: SCHEMA_VERSION });
    const listPath: string = `/_api/web/lists/getbytitle('${SpRest.quote(STATE_LIST)}')`;
    const item: IItem | undefined = await this._findSettingsItem();
    const itemType: { ListItemEntityTypeFullName: string } = await this._rest.get(`${listPath}?$select=ListItemEntityTypeFullName`);
    const body = { __metadata: { type: itemType.ListItemEntityTypeFullName }, Title: SETTINGS_KEY, Data: data };
    if (item) {
      await this._rest.merge(`${listPath}/items(${item.Id})`, body);
    } else {
      await this._rest.post(`${listPath}/items`, body);
    }
  }
}
