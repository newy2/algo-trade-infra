import BackendInfra from "./aws/backend_infra/BackendInfra";
import CommonInfra from "./aws/common_infra/CommonInfra";
import FrontendInfra from "./aws/frontend_infra/FrontendInfra";

const commonInfra = new CommonInfra();
new BackendInfra(commonInfra);
new FrontendInfra(commonInfra);
