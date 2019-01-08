
declare interface IPrintCommandSetStrings {
  PrintCommand: string;
  typeCounter: string;
  typeContentType: string;
  typeAttachments: string;
  typeModStat: string;
  typeComputed: string;
  field_ContentTypeId:string;
  field_HasCopyDestinations: string;
  field_CopySource: string;
  fieldowshiddenversion: string;
  fieldWorkflowVersion: string;
  field_UIVersion: string;
  field_UIVersionString: string;
  field_ModerationStatus: string;
  field_ModerationComments: string;
  fieldInstanceID: string;
  fieldGUID: string;
  fieldWorkflowInstanceID: string;
  fieldFileRef: string;
  fieldFileDirRef: string;
  fieldLast_x0020_Modified: string;
  fieldCreated_x0020_Date: string;
  fieldFSObjType: string;
  fieldSortBehavior: string;
  fieldFileLeafRef: string;
  fieldUniqueId: string;
  fieldSyncClientId: string;
  fieldProgId: string;
  fieldScopeId: string;
  fieldFile_x0020_Type: string;
  fieldMetaInfo: string;
  field_Level: string;
  field_IsCurrentVersion: string;
  fieldItemChildCount: string;
  fieldRestricted: string;
  fieldOriginatorId: string;
  fieldNoExecute: string;
  fieldContentVersion: string;
  field_ComplianceAssetId:string;
  field_ComplianceFlags: string;
  field_ComplianceTag: string;
  field_ComplianceTagWrittenTime: string;
  field_ComplianceTagUserId: string;
  fieldAccessPolicy: string;
  field_VirusStatus: string;
  field_VirusVendorID: string;
  field_VirusInfo: string;
  fieldAppAuthor: string;
  fieldAppEditor: string;
  fieldSMTotalSize: string;
  fieldSMLastModifiedDate: string;
  fieldSMTotalFileStreamSize: string;
  fieldSMTotalFileCount: string;
  fieldFolderChildCount: string;
  fieldOrder:string;
}

declare module 'PrintCommandSetStrings' {
  const strings: IPrintCommandSetStrings;
  export = strings;
}
