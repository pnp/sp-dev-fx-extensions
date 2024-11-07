/**
 * Defines the SP.Taxonomy.TermSetCollection type
 */
export interface ITermSets {
  _ObjectType_: string;
  _Child_Items_: ITermSet[];
}

/**
 * Defines the SP.Taxonomy.TermSet type
 */
export interface ITermSet {
  displayName: string;
  _ObjectType_: string;
  _ObjectIdentity_: string;
  id: string;
  Name: string;
  Description: string;
  Terms: ITerms;
}

/**
 * SP.Taxonomy.TermCollection
 */
export interface ITerms {
  id: string;
  description: string;
  createdDateTime: string;
  localizedNames: ILocalizedName[],
}

export interface ILocalizedName {
  name: string;
  languageTag: string;

}
/**
 * SP.Taxonomy.Term
 */
export interface ITerm {
  id: any;
  localProperties: any;
  children: any;
  labels: any;
  _ObjectType_: string;
  _ObjectIdentity_: string;
  CreatedDate: string;
  CustomProperties: any;
  CustomSortOrder: string;
  Description: string;
  Id: string;
  IsAvailableForTagging: boolean;
  IsDeprecated: boolean;
  IsKeyword: boolean;
  IsPinned: boolean;
  IsPinnedRoot: boolean;
  IsReused: boolean;
  IsRoot: boolean;
  IsSourceTerm: boolean;
  LastModifiedDate: string;
  LocalCustomProperties: any;
  Name: string;
  Owner: string;
  PathOfTerm: string;
  PathDepth?: number;
  Terms: ITerm[];
  TermsCount: number;
}
