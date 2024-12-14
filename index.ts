import BackendInfra from "./aws/backend_infra/BackendInfra";
import BackendAppInfra from "./aws/backend_app_infra/BackendAppInfra";
import CommonInfra from "./aws/common_infra/CommonInfra";
import FrontendInfra from "./aws/frontend_infra/FrontendInfra";

const commonInfra = new CommonInfra();
new BackendInfra(
  [
    new BackendAppInfra({
      commonInfra,
      appEnv: "test",
      httpPort: 9090,
    }),
    new BackendAppInfra({
      commonInfra,
      appEnv: "prod",
      httpPort: 8181,
    }),
  ],
  commonInfra,
);
new FrontendInfra("test", commonInfra);
new FrontendInfra("prod", commonInfra);
