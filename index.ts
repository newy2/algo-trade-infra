import CommonIamInfo from "./aws/common_infra/iam/CommonIamInfo";
import CommonLambdaInfo from "./aws/common_infra/lambda/CommonLambdaInfo";
import BackendInfra from "./aws/backend_infra/BackendInfra";
import FrontendInfra from "./aws/frontend_infra/FrontendInfra";

const commonIamInfo = new CommonIamInfo();
const commonLambdaInfo = new CommonLambdaInfo();

new BackendInfra(commonIamInfo, commonLambdaInfo);
new FrontendInfra(commonIamInfo, commonLambdaInfo);
