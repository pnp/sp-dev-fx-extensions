/** Describes the bare minimum information we need about a list field */
export interface IListField {
	InternalName: string;
	TypeAsString: string;
	IsDependentLookup?: boolean;
}