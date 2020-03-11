export class Constants {
  // https://support.office.com/en-us/article/invalid-file-names-and-file-types-in-onedrive-onedrive-for-business-and-sharepoint-64883a5d-228e-48f5-b3d2-eb39e07630fa
  public static readonly maxTotalUrlLength: number = 400;
  public static readonly folderNameRegEx: RegExp = new RegExp('^((((L|l)(P|p)(T|t))|(C|c)(O|o)(M|m))[0-9])$|(^(P|p)(R|r)(N|n))$|^(A|a)(U|u)(X|x)$|^(N|n)(U|u)(L|l)$|^(C|c)(O|o)(N|n)$|_vti_|^[\~$]|[«\*:<>\?\/\\\\\|]');
  public static readonly folderNameRootFolderRegEx: RegExp = new RegExp('^(F|f)(O|o)(R|r)(M|m)(S|s)$');

  // https://github.com/SharePoint/PnP-JS-Core/wiki/Batching#large-batch-processing
  public static readonly maxParallelFolders:number = 50;


}
