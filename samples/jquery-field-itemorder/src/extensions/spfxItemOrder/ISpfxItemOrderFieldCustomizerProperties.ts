
/** Represents the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object
 */
export interface ISpfxItemOrderFieldCustomizerProperties {
	//The internal Order column is used by default, 
	// but the internal name of another column can be specified as needed.
	OrderField?: string;
}