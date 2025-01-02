export default class BaseFrontendModel {
  _FOLDER_SEPARATOR = "/";

  constructor(objectKeys) {
    this._objectKeys = objectKeys;
  }

  getDistributionOriginPath() {
    throw new Error("Override me.");
  }

  getDeleteS3ObjectKeys() {
    throw new Error("Override me.");
  }

  _filterDeleteObjectKeys(deletableFolders) {
    return this._objectKeys.filter((eachObjectKey) =>
      deletableFolders.some((eachFolderKey) =>
        eachObjectKey.startsWith(eachFolderKey)
      )
    );
  }

  _getSortedFolders() {
    const results = this._objectKeys.map((each) => each.split(this._FOLDER_SEPARATOR)[0]);

    return Array.from(new Set(results)).sort(this._sortByDesc);
  }

  _sortByDesc(a, b) {
    if (a < b) return 1;
    if (a > b) return -1;
    return 0;
  }

  _getFirstFolder(folders) {
    return folders[0];
  }

  _getSecondFolder(folders) {
    return folders[1];
  }

  _toOriginPath(folder) {
    return this._FOLDER_SEPARATOR + folder;
  }
}