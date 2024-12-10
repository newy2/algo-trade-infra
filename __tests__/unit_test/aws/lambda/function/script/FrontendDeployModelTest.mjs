import FrontendDeployModel
  from "../../../../../../frontend_infra/lambda/default/script/frontend_delivery/models/FrontendDeployModel.mjs";
import assert from "assert";
import { assertDeepEquals, assertEquals } from "../../../../../helper/Assertions.mjs";

describe("프론트엔드 배포용 모델 테스트", () => {
  const MAX_FOLDER_COUNT = 2;

  describe("S3 Bucket 에 데이터가 없는 경우", () => {
    let model;

    beforeEach(() => {
      const emptyObjectKeys = [];
      model = new FrontendDeployModel(emptyObjectKeys, MAX_FOLDER_COUNT);
    });

    it("배포 대상 폴더 가져오기", () => {
      assert.throws(() => {
        model.getDistributionOriginPath();
      }, "배포할 폴더가 없어서, 에러가 발생해야 한다");
    });

    it("삭제할 object key 리스트 가져오기", () => {
      assertDeepEquals([], model.getDeleteS3ObjectKeys());
    });
  });

  describe("S3 Bucket 에 폴더가 1개만 있는 경우", () => {
    let model;

    beforeEach(() => {
      const objectKeys = [
        "2024-11-01_00-00-00/index.html",
        "2024-11-01_00-00-00/static/js/main.js"
      ];
      model = new FrontendDeployModel(objectKeys, MAX_FOLDER_COUNT);
    });

    it("배포 대상 폴더 가져오기", () => {
      assertEquals(
        "/2024-11-01_00-00-00",
        model.getDistributionOriginPath(),
        "가장 최근에 생성된 폴더. CloudFront origin path 에 사용할 데이터여서 접두사로 slash(/)가 있어야 한다"
      );
    });

    it("삭제할 object key 리스트 가져오기", () => {
      assertDeepEquals([], model.getDeleteS3ObjectKeys(), "삭제 대상 object 가 없음");
    });
  });

  describe("S3 Bucket 에 폴더 개수가 maxFolderCount(2개) 와 같은 경우", () => {
    let model;

    beforeEach(() => {
      const objectKeys = [
        "2024-11-01_00-00-00/index.html",
        "2024-11-01_00-00-00/static/js/main.js",
        "2024-11-02_00-00-00/index.html",
        "2024-11-02_00-00-00/static/js/main.js"
      ];
      model = new FrontendDeployModel(objectKeys, MAX_FOLDER_COUNT);
    });

    it("배포 대상 폴더 가져오기", () => {
      assertEquals("/2024-11-02_00-00-00", model.getDistributionOriginPath());
    });

    it("삭제할 object key 리스트 가져오기", () => {
      assertDeepEquals([], model.getDeleteS3ObjectKeys(), "삭제 대상 object 가 없음");
    });
  });

  describe("S3 Bucket 에 폴더 개수가 maxFolderCount(2개) 보다 많은(4개) 경우", () => {
    let model;

    beforeEach(() => {
      const objectKeys = [
        "2024-11-01_00-00-00/index.html",
        "2024-11-01_00-00-00/static/js/main.js",
        "2024-11-02_00-00-00/index.html",
        "2024-11-02_00-00-00/static/js/main.js",
        "2024-11-03_00-00-00/index.html",
        "2024-11-03_00-00-00/static/js/main.js",
        "2024-11-04_00-00-00/index.html",
        "2024-11-04_00-00-00/static/js/main.js"
      ];
      model = new FrontendDeployModel(objectKeys, MAX_FOLDER_COUNT);
    });

    it("배포 대상 폴더 가져오기", () => {
      assertEquals("/2024-11-04_00-00-00", model.getDistributionOriginPath());
    });

    it("삭제할 object key 리스트 가져오기", () => {
      assertDeepEquals(
        [
          "2024-11-01_00-00-00/index.html",
          "2024-11-01_00-00-00/static/js/main.js",
          "2024-11-02_00-00-00/index.html",
          "2024-11-02_00-00-00/static/js/main.js"
        ],
        model.getDeleteS3ObjectKeys(),
        "prefix 가 가장 과거에 생성된 폴더 이름인 object 리스트가 나와야 한다"
      );
    });
  });
});