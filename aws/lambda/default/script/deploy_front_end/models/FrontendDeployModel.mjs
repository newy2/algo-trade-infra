import BaseFrontendModel from "./BaseFrontendModel.mjs";

export default class FrontendDeployModel extends BaseFrontendModel {
  _DEFAULT_MAX_FOLDER_COUNT = 2;

  constructor(objectKeys, maxFolderCount) {
    super(objectKeys);

    this.folders = this._getSortedFolders();
    this._maxFolderCount = maxFolderCount || this._DEFAULT_MAX_FOLDER_COUNT;
  }

  getDistributionOriginPath() {
    if (this.folders.length < 1) {
      throw new Error("버킷이 비었습니다.");
    }

    return this._toOriginPath(this._getFirstFolder(this.folders));
  }

  getDeleteS3ObjectKeys() {
    if (this.folders.length <= this._maxFolderCount) {
      return [];
    }

    const deletableFolders = this.folders.slice(this._maxFolderCount);
    return this._filterDeleteObjectKeys(deletableFolders);
  }
}