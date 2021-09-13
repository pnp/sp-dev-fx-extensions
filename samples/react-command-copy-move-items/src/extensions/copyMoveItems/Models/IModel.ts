export enum LoaderType {
	Spinner = 0,
	Indicator = 1
}

export enum MessageScope {
	Success = 0,
	Failure = 1,
	Warning = 2,
	Info = 3
}

export interface IMessageInfo {
    msg: string;
    scope: MessageScope;
}

export interface ISiteListInfo {
    Id: string;
    ItemCount: number;
    Title: string;
}

export interface IListInfo {
    Id: string;
    EntityTypeName: string;
    Title: string;
    ItemCount: number;
}

export interface IMappingFieldInfo {
    SFId: string;
    SFInternalName: string;
    SFDisplayName: string;
    SFType: string;
    SFTypeName: string;
    DFId?: string;
    DFInternalName?: string;
    DFDisplayName?: string;
    DFType?: string;
    DFTypeName?: string;
    Enabled: boolean;
}

export interface IFieldInfo {
    Id: string;
    EntityPropertyName: string;
    InternalName: string;
    MaxLength: number;
    Required: boolean;
    SchemaXml: string;
    Scope: string;
    StaticName: string;
    Title: string;
    TypeAsString: string;
    TypeDisplayName: string;
    TermSetId: string;
    CustomFormatter: string;
    Choices: string[];
    CanBeDeleted:boolean;
}

export const qry_itembyids = `
<View>
    <Query>
        <Where>
            <In>
                <FieldRef Name="ID"/>
                <Values>
                    {{Ids}}
                </Values>
            </In>
        </Where>
		<OrderBy>
			<FieldRef Name="Created" Ascending='FALSE'/>
		</OrderBy>
    </Query>
	<ViewFields>{{viewfields}}</ViewFields>
</View>
`;