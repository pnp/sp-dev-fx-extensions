export const getShortName = (name:string):string =>{
  if (!name) return '';
  const splitedName = name.split(".");
  const displayCreatedFileName = splitedName[0].substr(0, 25);
  const displayCreatedFileNameExt = splitedName[splitedName.length-1];
  const displayCreatedFile = `${displayCreatedFileName}...${displayCreatedFileNameExt}`;
  return displayCreatedFile;
};
