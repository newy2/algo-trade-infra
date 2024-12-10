import BaseFrontendModel from "./BaseFrontendModel.mjs";

export default class FrontendRollbackModel extends BaseFrontendModel {
  _REQUIRE_MIN_FOLDER_COUNT = 2;

  constructor(objectKeys) {
    super(objectKeys);
    this.folders = this._getSortedFolders();
  }

  getDistributionOriginPath() {
    if (this._isInvalidRollback()) {
      throw new Error("롤벡할 수 없습니다.");
    }

    return this._toOriginPath(this._getSecondFolder(this.folders));
  }

  getDeleteS3ObjectKeys() {
    if (this._isInvalidRollback()) {
      return [];
    }

    return this._filterDeleteObjectKeys([this._getFirstFolder(this.folders)]);
  }

  _isInvalidRollback() {
    return this.folders.length < this._REQUIRE_MIN_FOLDER_COUNT;
  }
}