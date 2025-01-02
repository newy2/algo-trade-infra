import BaseFrontendModel from "./BaseFrontendModel.mjs";

export default class FrontendRollbackModel extends BaseFrontendModel {
  _REQUIRE_MIN_FOLDER_COUNT = 2;

  constructor(objectKeys) {
    super(objectKeys);
    this._folders = this._getSortedFolders();
  }

  getDistributionOriginPath() {
    if (this._isInvalidRollback()) {
      throw new Error("롤벡할 수 없습니다.");
    }

    return this._toOriginPath(this._getSecondFolder(this._folders));
  }

  getDeleteS3ObjectKeys() {
    if (this._isInvalidRollback()) {
      return [];
    }

    return this._filterDeleteObjectKeys([this._getFirstFolder(this._folders)]);
  }

  _isInvalidRollback() {
    return this._folders.length < this._REQUIRE_MIN_FOLDER_COUNT;
  }
}