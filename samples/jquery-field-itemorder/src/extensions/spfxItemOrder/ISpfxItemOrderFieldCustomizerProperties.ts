
/** Represents the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object
 */
export interface ISpfxItemOrderFieldCustomizerProperties {
	//The internal Order column is used by default, 
	// but the internal name of another column can be specified as needed.
	OrderField?: string;

	//Default: true
	//When false, instead of UI Fabric icons, text is used for the indicators
	ShowIcons?: boolean;
}