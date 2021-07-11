import { IButtonStyles } from "office-ui-fabric-react/lib/Button";
import { IBasePickerStyles } from "office-ui-fabric-react/lib/Pickers";
export declare const useListPickerStyles: (themeVariant: any) => {
    componentClasses: import("office-ui-fabric-react/lib/Styling").IProcessedStyleSet<{
        eventCircleColor: string;
        separator: string;
        filePickerButtonStyles: string;
        iconStyles: {
            paddingLeft: number;
            fontWeight: number;
            color: any;
        };
        iconStylesGlobeAndList: {
            width: number;
            height: number;
            fontSize: number;
        };
        iconStylesWebUrl: {
            width: number;
            height: number;
            fontSize: number;
        };
    }>;
    pickerStylesMulti: Partial<IBasePickerStyles>;
    pickerStylesSingle: Partial<IBasePickerStyles>;
    renderItemStylesSingle: Partial<import("@uifabric/foundation").IComponentStyles<import("office-ui-fabric-react/lib/Stack").IStackSlots>>;
    renderItemStylesMulti: Partial<import("@uifabric/foundation").IComponentStyles<import("office-ui-fabric-react/lib/Stack").IStackSlots>>;
    renderIconButtonRemoveStyles: Partial<IButtonStyles>;
    stacklabelHoverItem: import("@uifabric/foundation").IComponentStyles<import("office-ui-fabric-react/lib/Stack").IStackSlots>;
};
//# sourceMappingURL=ListPickerStyles.d.ts.map