import CommonIamInfo from "./common_infra/iam/CommonIamInfo";
import CommonLambdaInfo from "./common_infra/lambda/CommonLambdaInfo";
import BackendInfra from "./aws/BackendInfra";
import FrontendInfra from "./frontend_infra/FrontendInfra";

const commonIamInfo = new CommonIamInfo();
const commonLambdaInfo = new CommonLambdaInfo();

new BackendInfra(commonIamInfo, commonLambdaInfo);
new FrontendInfra(commonIamInfo, commonLambdaInfo);
