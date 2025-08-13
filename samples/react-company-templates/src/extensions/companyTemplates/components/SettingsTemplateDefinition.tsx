import * as React from "react";
import { Stack } from "@fluentui/react";
import { FieldPicker } from "@pnp/spfx-controls-react/lib/FieldPicker";
import { SPFxContext } from "../contexts/SPFxContext";
import { FieldsOrderBy } from "@pnp/spfx-controls-react/lib/services/ISPService";
import { ISPField } from "@pnp/spfx-controls-react";
import * as strings from "CompanyTemplatesCommandSetStrings";

export type SettingsTemplateDefinitionProps = {
  settings: { site?: string, list?: string, categoryField?: { Id: string; InternalName: string; } };
  changeSettingsCallback: React.Dispatch<React.SetStateAction<{ site?: string; list?: string; categoryField?: { Id: string; InternalName: string; } }>>;
}
export const SettingsTemplateDefinition: React.FunctionComponent<SettingsTemplateDefinitionProps> = (props: SettingsTemplateDefinitionProps) => {
  const { context } = React.useContext(SPFxContext);

  const onFieldPickerChanged = (fields: ISPField | ISPField[]): void => {
    const fieldData = fields as ISPField;
    props.changeSettingsCallback({
      categoryField: { Id: fieldData.Id, InternalName: fieldData.InternalName }, list: props.settings.list, site: props.settings.site
    });
  }

  return <>
    <Stack tokens={{ childrenGap: 10, }}>
      {/* List: {props.settings.list} / Site: {props.settings.site}
      <br />Category Field Id: {props.settings.categoryField?.Id} */}
      <div dangerouslySetInnerHTML={{ __html: strings.SettingsTemplateDefinition.Description }} />
      <FieldPicker
        label={strings.SettingsTemplateDefinition.TemplateFieldFieldPickerLabel}
        context={context as any}
        placeholder={strings.SettingsTemplateDefinition.TemplateFieldFieldPickerPlaceholder}
        webAbsoluteUrl={props.settings.site}
        includeHidden={false}
        includeReadOnly={false}
        multiSelect={false}
        orderBy={FieldsOrderBy.Title}
        listId={props.settings.list}
        onSelectionChanged={onFieldPickerChanged}
        disabled={props.settings.list === undefined}
        selectedFields={[props.settings.categoryField?.InternalName]}
      />
    </Stack>
  </>
}