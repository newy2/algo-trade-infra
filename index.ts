import BackendInfra from "./aws/backend_infra/BackendInfra";
import BackendAppInfra from "./aws/backend_app_infra/BackendAppInfra";
import CommonInfra from "./aws/common_infra/CommonInfra";
import FrontendInfra from "./aws/frontend_infra/FrontendInfra";

const commonInfra = new CommonInfra();
new BackendInfra(
  [
    new BackendAppInfra({
      commonInfra,
      appEnv: "dev",
      httpPort: 9090,
    }),
    new BackendAppInfra({
      commonInfra,
      appEnv: "prd",
      httpPort: 8181,
    }),
  ],
  commonInfra,
);
new FrontendInfra("dev", commonInfra);
new FrontendInfra("prd", commonInfra);
