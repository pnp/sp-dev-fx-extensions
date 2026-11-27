import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { NotificationService } from '../../../shared/NotificationService';

const componentId: string = '50e2a56c-f19f-40f5-8d8a-fc4d073da842';
const actionName: string = 'SiteNotificationBanner';
const location: string = 'ClientSideExtension.ApplicationCustomizer';
const definitions: string[] = [
  '<Field Type="Note" Name="Message" StaticName="Message" DisplayName="Message" Required="TRUE" RichText="TRUE" RichTextMode="FullHtml" NumLines="6" />',
  '<Field Type="Choice" Name="NotificationType" StaticName="NotificationType" DisplayName="Notification type" Required="TRUE" FillInChoice="FALSE"><CHOICES><CHOICE>Notification</CHOICE><CHOICE>Warning</CHOICE><CHOICE>Error</CHOICE></CHOICES></Field>',
  '<Field Type="URL" Name="TargetSiteUrl" StaticName="TargetSiteUrl" DisplayName="Target site URL" Required="TRUE" Format="Hyperlink" />',
  '<Field Type="Boolean" Name="IncludeSubsites" StaticName="IncludeSubsites" DisplayName="Include subsites"><Default>0</Default></Field>',
  '<Field Type="Boolean" Name="IsActive" StaticName="IsActive" DisplayName="Active" Indexed="TRUE"><Default>0</Default></Field>',
  '<Field Type="Boolean" Name="IsModal" StaticName="IsModal" DisplayName="Modal"><Default>0</Default></Field>',
  '<Field Type="Boolean" Name="IsDismissible" StaticName="IsDismissible" DisplayName="Dismissible"><Default>1</Default></Field>',
  '<Field Type="DateTime" Name="StartDateTime" StaticName="StartDateTime" DisplayName="Start date and time" Format="DateTime" StorageTZ="UTC" />',
  '<Field Type="DateTime" Name="EndDateTime" StaticName="EndDateTime" DisplayName="End date and time" Format="DateTime" StorageTZ="UTC" />'
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

interface CustomAction {
  Name: string | undefined;
  Location: string | undefined;
  ClientSideComponentId: string | undefined;
  ClientSideComponentProperties: string | undefined;
}

export type ListStatus =
  | { kind: 'ready'; id: string }
  | { kind: 'missing' }
  | { kind: 'invalid'; id: string; errors: string[] };

export type RegistrationStatus =
  | { kind: 'registered' }
  | { kind: 'missing' }
  | { kind: 'conflict'; message: string };

export class GuidedSetup {
  private readonly root: string;
  private readonly service: NotificationService;

  public constructor(private readonly client: SPHttpClient, rootUrl: string) {
    this.root = rootUrl.replace(/\/$/, '');
    this.service = new NotificationService(client, this.root);
  }

  private async getCollection(url: string, signal: AbortSignal): Promise<unknown[]> {
    const response: SPHttpClientResponse = await this.client.get(url, SPHttpClient.configurations.v1, { signal });
    if (!response.ok) throw new Error(`SharePoint request failed (HTTP ${response.status}).`);
    const data: unknown = await response.json();
    if (!isRecord(data) || !Array.isArray(data.value) ||
      data['@odata.nextLink'] !== undefined || data['odata.nextLink'] !== undefined) {
      throw new Error('SharePoint returned incomplete or invalid setup information. No further changes were made.');
    }
    return data.value;
  }

  private async post(url: string, body: object, signal: AbortSignal, merge: boolean = false): Promise<SPHttpClientResponse> {
    const headers: Record<string, string> = {
      'accept': 'application/json;odata=nometadata',
      'content-type': 'application/json;odata=verbose',
      'odata-version': ''
    };
    if (merge) {
      headers['IF-MATCH'] = '*';
      headers['X-HTTP-Method'] = 'MERGE';
    }
    const response: SPHttpClientResponse = await this.client.post(url, SPHttpClient.configurations.v1, {
      headers, body: JSON.stringify(body), signal
    });
    if (!response.ok) throw new Error(`SharePoint request failed (HTTP ${response.status}).`);
    return response;
  }

  private async findList(signal: AbortSignal): Promise<string | undefined> {
    const expected: string = `${decodeURIComponent(new URL(this.root).pathname).replace(/\/$/, '')}/Lists/SiteNotifications`;
    const values: unknown[] = await this.getCollection(
      `${this.root}/_api/web/lists?$select=Id,Title,RootFolder/ServerRelativeUrl&$expand=RootFolder&$top=5000`, signal
    );
    let found: string | undefined;
    for (const value of values) {
      if (!isRecord(value) || typeof value.Id !== 'string' || !value.Id || typeof value.Title !== 'string' || !isRecord(value.RootFolder) ||
        typeof value.RootFolder.ServerRelativeUrl !== 'string') {
        throw new Error('SharePoint returned incomplete list information. No changes were made.');
      }
      const path: string = value.RootFolder.ServerRelativeUrl.replace(/\/$/, '');
      if (path.toLowerCase() === expected.toLowerCase()) {
        if (found) throw new Error('Multiple lists were returned at the notification URL.');
        found = value.Id;
      } else if (value.Title.toLowerCase() === 'site notifications') {
        throw new Error('A list named Site Notifications exists at a different URL. Resolve the conflict before setup.');
      }
    }
    return found;
  }

  private async verifySchema(signal: AbortSignal): Promise<void> {
    const errors: string[] = await this.service.checkSchema(signal);
    if (errors.length) throw new Error(`The notification list is incompatible or incomplete: ${errors.join(' ')}`);
  }

  public async checkList(signal: AbortSignal): Promise<ListStatus> {
    const id: string | undefined = await this.findList(signal);
    if (!id) return { kind: 'missing' };
    const errors: string[] = await this.service.checkSchema(signal);
    return errors.length ? { kind: 'invalid', id, errors } : { kind: 'ready', id };
  }

  public async getListVisibility(signal: AbortSignal): Promise<boolean> {
    const response: SPHttpClientResponse = await this.client.get(
      `${this.service.getListUrl()}?$select=Hidden&${this.service.getListParameter()}`,
      SPHttpClient.configurations.v1, { signal }
    );
    if (!response.ok) throw new Error(`List visibility check failed (HTTP ${response.status}).`);
    const list: unknown = await response.json();
    if (!isRecord(list) || typeof list.Hidden !== 'boolean') {
      throw new Error('SharePoint returned incomplete list visibility information.');
    }
    return list.Hidden;
  }

  public async setListVisibility(hidden: boolean, signal: AbortSignal): Promise<string> {
    const status: ListStatus = await this.checkList(signal);
    if (status.kind !== 'ready') {
      throw new Error('The notification list must be ready before its visibility can be changed.');
    }
    if (await this.getListVisibility(signal) === hidden) {
      return `The notification list is already ${hidden ? 'hidden' : 'visible'} in Site contents.`;
    }
    try {
      await this.post(`${this.service.getListUrl()}?${this.service.getListParameter()}`, {
        __metadata: { type: 'SP.List' }, Hidden: hidden
      }, signal, true);
      if (await this.getListVisibility(signal) !== hidden) {
        throw new Error('SharePoint did not return the requested visibility.');
      }
    } catch (error) {
      throw new Error(`List visibility could not be changed or verified; refresh status before retrying. ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    return `The notification list is ${hidden ? 'hidden from' : 'visible in'} Site contents.`;
  }

  public async createOrCheckList(signal: AbortSignal): Promise<string> {
    if (await this.findList(signal)) {
      await this.verifySchema(signal);
      return 'Existing notification list and schema verified. No changes were made.';
    }
    try {
      const createdResponse: SPHttpClientResponse = await this.post(`${this.root}/_api/web/lists/add`, {
        parameters: {
          __metadata: { type: 'SP.ListCreationInformation' },
          Title: 'Site Notifications', Url: 'Lists/SiteNotifications', TemplateType: 100
        }
      }, signal);
      const created: unknown = await createdResponse.json();
      if (!isRecord(created) || typeof created.Id !== 'string' || !created.Id ||
        (await this.findList(signal))?.toLowerCase() !== created.Id.toLowerCase()) {
        throw new Error('The created list could not be verified at the expected URL.');
      }
      const listUrl: string = this.service.getListUrl();
      const listParameter: string = this.service.getListParameter();
      await this.post(`${listUrl}?${listParameter}`, {
        __metadata: { type: 'SP.List' }, EnableVersioning: true, Hidden: true
      }, signal, true);
      if (!await this.getListVisibility(signal)) {
        throw new Error('The new list could not be verified as hidden.');
      }
      await this.post(`${listUrl}/fields/getbyinternalnameortitle('Title')?${listParameter}`, {
        __metadata: { type: 'SP.Field' }, Required: false
      }, signal, true);
      for (const schema of definitions) {
        await this.post(`${listUrl}/fields/createfieldasxml?${listParameter}`, {
          parameters: { __metadata: { type: 'SP.XmlSchemaFieldCreationInformation' }, SchemaXml: schema, Options: 25 }
        }, signal);
      }
      await this.verifySchema(signal);
    } catch (error) {
      throw new Error(`List creation did not complete. A partial list may remain; inspect it before retrying. ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    return 'Hidden notification list created and schema verified. It inherits root-site permissions; separately restrict editors and verify viewer access before activation.';
  }

  private async getActions(scope: 'site' | 'web', signal: AbortSignal): Promise<CustomAction[]> {
    const values: unknown[] = await this.getCollection(
      `${this.root}/_api/${scope}/usercustomactions?$select=Name,Location,ClientSideComponentId,ClientSideComponentProperties&$top=5000`,
      signal
    );
    return values.map(value => {
      if (!isRecord(value) || (typeof value.Name !== 'string' && value.Name !== null) ||
        (typeof value.Location !== 'string' && value.Location !== null) ||
        (typeof value.ClientSideComponentId !== 'string' && value.ClientSideComponentId !== null) ||
        (typeof value.ClientSideComponentProperties !== 'string' && value.ClientSideComponentProperties !== null)) {
        throw new Error('SharePoint returned incomplete registration information. No changes were made.');
      }
      return {
        Name: value.Name ?? undefined, Location: value.Location ?? undefined,
        ClientSideComponentId: value.ClientSideComponentId ?? undefined,
        ClientSideComponentProperties: value.ClientSideComponentProperties ?? undefined
      };
    }).filter(action => action.Name?.toLowerCase() === actionName.toLowerCase() ||
      action.ClientSideComponentId?.toLowerCase() === componentId);
  }

  public async checkRegistration(signal: AbortSignal): Promise<RegistrationStatus> {
    if ((await this.getActions('web', signal)).length) {
      return { kind: 'conflict', message: 'A conflicting root-web custom action exists. Resolve it before activation.' };
    }
    const actions: CustomAction[] = await this.getActions('site', signal);
    if (actions.length === 0) return { kind: 'missing' };
    if (actions.length !== 1 || actions[0].Name !== actionName || actions[0].Location !== location ||
      actions[0].ClientSideComponentId?.toLowerCase() !== componentId ||
      ['', '{}'].indexOf((actions[0].ClientSideComponentProperties || '').replace(/\s/g, '')) < 0) {
      return { kind: 'conflict', message: 'Extension registration is conflicting or could not be verified. No registration was removed or modified.' };
    }
    return { kind: 'registered' };
  }

  public async activate(permissionsConfirmed: boolean, signal: AbortSignal): Promise<string> {
    if (!permissionsConfirmed) throw new Error('Confirm that list permissions have been configured and verified before activation.');
    if (!await this.findList(signal)) throw new Error('The notification list does not exist. Create or check the list first.');
    await this.verifySchema(signal);
    let registration: RegistrationStatus = await this.checkRegistration(signal);
    if (registration.kind === 'conflict') throw new Error(registration.message);
    if (registration.kind === 'missing') {
      try {
        await this.post(`${this.root}/_api/site/usercustomactions`, {
          __metadata: { type: 'SP.UserCustomAction' }, Name: actionName,
          Title: 'Site notification banners', Location: location,
          ClientSideComponentId: componentId, ClientSideComponentProperties: '{}'
        }, signal);
        registration = await this.checkRegistration(signal);
      } catch (error) {
        throw new Error(`Registration may have been created but could not be verified; inspect registrations before retrying. ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    if (registration.kind !== 'registered') {
      throw new Error('Extension registration is conflicting or could not be verified. No registration was removed or modified.');
    }
    return 'Site-collection extension registration verified. Verify banner display and visitor access on your site.';
  }
}
