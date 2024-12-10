import * as assert from "assert";
import { assertDeepEquals, assertEquals } from "../../../../../helper/Assertions.mjs";
import FrontendRollbackModel
  from "../../../../../../aws/lambda/default/script/frontend_delivery/models/FrontendRollbackModel.mjs";


describe("프론트엔드 롤백용 모델 테스트", () => {
  describe("S3 Bucket 에 데이터가 없는 경우", () => {
    let model;

    beforeEach(() => {
      const emptyObjectKeys = [];
      model = new FrontendRollbackModel(emptyObjectKeys);
    });

    it("배포 대상 폴더 가져오기", () => {
      assert.throws(() => {
        model.getDistributionOriginPath();
      }, "롤백할 폴더가 없어서, 에러가 발생해야 한다");
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
      model = new FrontendRollbackModel(objectKeys);
    });

    it("배포 대상 폴더 가져오기", () => {
      assert.throws(() => {
        model.getDistributionOriginPath();
      }, "현재 폴더('/2024-11-01_00-00-00') 이전에 생성된 폴더가 없어서, 에러가 발생해야 한다");
    });

    it("삭제할 object key 리스트 가져오기", () => {
      assertDeepEquals([], model.getDeleteS3ObjectKeys());
    });
  });

  describe("Bucket 에 폴더가 2개 있는 경우", () => {
    let model;
    beforeEach(() => {
      const objectKeys = [
        "2024-11-01_00-00-00/index.html",
        "2024-11-01_00-00-00/static/js/main.js",
        "2024-11-02_00-00-00/index.html",
        "2024-11-02_00-00-00/static/js/main.js"
      ];
      model = new FrontendRollbackModel(objectKeys);
    });

    it("배포 대상 폴더 가져오기", () => {
      assertEquals(
        "/2024-11-01_00-00-00",
        model.getDistributionOriginPath(),
        "현재 폴더('/2024-11-02_00-00-00') 바로 이전에 생성된 폴더('/2024-11-01_00-00-00')가 나와야 한다. CloudFront origin path 에 사용할 데이터여서 접두사로 slash(/)가 있어야 한다"
      );
    });

    it("삭제할 object key 리스트 가져오기", () => {
      assertDeepEquals(
        [
          "2024-11-02_00-00-00/index.html",
          "2024-11-02_00-00-00/static/js/main.js"
        ],
        model.getDeleteS3ObjectKeys(),
        "prefix 가 현재 폴더('/2024-11-02_00-00-00')인 object 리스트가 나와야 한다"
      );
    });
  });

  describe("Bucket 에 폴더가 2개 이상인 경우", () => {
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
      model = new FrontendRollbackModel(objectKeys);
    });

    it("배포 대상 폴더 가져오기", () => {
      assertEquals("/2024-11-03_00-00-00", model.getDistributionOriginPath());
    });

    it("삭제할 object key 리스트 가져오기", () => {
      assertDeepEquals(
        [
          "2024-11-04_00-00-00/index.html",
          "2024-11-04_00-00-00/static/js/main.js"
        ],
        model.getDeleteS3ObjectKeys()
      );
    });
  });
});