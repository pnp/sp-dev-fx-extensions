import * as React from 'react';
import { FormDisplayMode } from '@microsoft/sp-core-library';
import { FormCustomizerContext } from '@microsoft/sp-listview-extensibility';
import { DynamicForm } from '@pnp/spfx-controls-react/lib/DynamicForm';
import { ILocationPickerItem, LocationPicker } from '@pnp/spfx-controls-react/lib/LocationPicker';
import { IDynamicFieldProps } from '@pnp/spfx-controls-react/lib/controls/dynamicForm/dynamicField';
import styles from './CustomForm.module.scss';
import * as strings from 'CustomFormFormCustomizerStrings';

export interface ICustomFormProps {
    context: FormCustomizerContext;
    displayMode: FormDisplayMode;
    emailDomain: string;
    managedPath?: string;
    onSave: () => void;
    onClose: () => void;
}

export default function CustomForm(props:ICustomFormProps): React.ReactElement<ICustomFormProps> {
    
    const fieldOverrides: { [columnInternalName: string]: (fieldProperties: IDynamicFieldProps) => React.ReactElement<IDynamicFieldProps> } = {
        "Location": (fieldProperties: IDynamicFieldProps) => <>
            <LocationPicker
                context={props.context as never}
                label={fieldProperties.label}
                defaultValue={fieldProperties.fieldDefaultValue !== undefined ? JSON.parse(fieldProperties.fieldDefaultValue) : undefined}
                onChange={(locValue: ILocationPickerItem) => {
                    fieldProperties.newValue = JSON.stringify(locValue);
                }}
            />
        </>
    };
        
    return <>
        <div className={styles.customForm}>
            <h1>{strings.FormHeader}</h1>
            <DynamicForm
                context={props.context as never}
                listId={props.context.list.guid.toString()}
                listItemId={props.context.itemId}
                onCancelled={props.onClose}
                onSubmitted={props.onSave}
                onSubmitError={(listItemData: unknown, error: Error) => { console.log(error.message); }}
                disabled={props.displayMode === FormDisplayMode.Display}
                fieldOverrides={fieldOverrides}
            />
        </div>
    </>;
}