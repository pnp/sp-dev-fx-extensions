export var getShortName = function (name) {
    if (!name)
        return '';
    var splitedName = name.split(".");
    var displayCreatedFileName = splitedName[0].substr(0, 25);
    var displayCreatedFileNameExt = splitedName[splitedName.length - 1];
    var displayCreatedFile = displayCreatedFileName + "..." + displayCreatedFileNameExt;
    return displayCreatedFile;
};
//# sourceMappingURL=utils.js.map