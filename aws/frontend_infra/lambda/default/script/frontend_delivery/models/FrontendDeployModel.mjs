import BaseFrontendModel from "./BaseFrontendModel.mjs";

export default class FrontendDeployModel extends BaseFrontendModel {
  _DEFAULT_MAX_FOLDER_COUNT = 2;

  constructor(objectKeys, maxFolderCount) {
    super(objectKeys);

    this._folders = this._getSortedFolders();
    this._maxFolderCount = maxFolderCount || this._DEFAULT_MAX_FOLDER_COUNT;
  }

  getDistributionOriginPath() {
    if (this._folders.length < 1) {
      throw new Error("버킷이 비었습니다.");
    }

    return this._toOriginPath(this._getFirstFolder(this._folders));
  }

  getDeleteS3ObjectKeys() {
    if (this._folders.length <= this._maxFolderCount) {
      return [];
    }

    const deletableFolders = this._folders.slice(this._maxFolderCount);
    return this._filterDeleteObjectKeys(deletableFolders);
  }
}