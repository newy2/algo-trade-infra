import FrontendInfraParameterStoreInfo from "../../../frontend_infra/ssm/application_management/ParameterStoreInfo";
import { AppEnv } from "../../../util/enums";
import ParameterStoreInfo from "../../ssm/application_management/ParameterStoreInfo";
import BackendInfraParameterStore from "../../../backend_infra/ssm/application_management/ParameterStoreInfo";
import AwsConfig from "../../../util/AwsConfig";

export default class UserData extends AwsConfig {
  private readonly appEnv: AppEnv;

  constructor(appEnv: AppEnv) {
    super();

    this.appEnv = appEnv;
  }

  public getUserData() {
    const variablePrefix = this.appEnv.toUpperCase();
    const dbUrl = `${variablePrefix}_DB_URL`;
    const dbUsername = `${variablePrefix}_DB_USERNAME`;
    const dbPassword = `${variablePrefix}_DB_PASSWORD`;
    const httpPort = `${variablePrefix}_HTTP_PORT`;
    const ecrUrl = `${variablePrefix}_ECR_URL`;
    const frontendUrl = `${variablePrefix}_FRONTEND_URL`;

    return `# [${this.appEnv}] 백엔드 서버 실행
${dbUrl}=$(aws ssm get-parameter --name "${BackendInfraParameterStore.RDS_ENDPOINT_KEY}" --query "Parameter.Value" --output text)
${dbUsername}=$(aws ssm get-parameter --name "${BackendInfraParameterStore.RDS_USERNAME_KEY}" --query "Parameter.Value" --output text)
${dbPassword}=$(aws ssm get-parameter --name "${BackendInfraParameterStore.RDS_PASSWORD_KEY}" --with-decryption --query "Parameter.Value" --output text)
${httpPort}=$(aws ssm get-parameter --name "${ParameterStoreInfo.getCodeDeliveryBackendEc2HttpPort(this.appEnv)}" --query "Parameter.Value" --output text)
${ecrUrl}=$(aws ssm get-parameter --name "${ParameterStoreInfo.getCodeDeliveryBackendEcrRepositoryUrl(this.appEnv)}" --query "Parameter.Value" --output text)
${frontendUrl}=$(aws ssm get-parameter --name "${FrontendInfraParameterStoreInfo.getCodeDeliveryFrontendDistributionUrlKey(this.appEnv)}" --with-decryption --query "Parameter.Value" --output text)
aws ecr get-login-password | docker login --username AWS --password-stdin "$${ecrUrl}"
docker pull "$${ecrUrl}":latest
if docker images | grep "$${ecrUrl}" > /dev/null; then
  docker run -d \
--name ${this.appEnv}-api-server \
-p $${httpPort}:$${httpPort} \
-e X_PORT=$${httpPort} \
-e X_DB_URL=$${dbUrl} \
-e X_DB_SCHEMA=${this.appEnv}_algo_trade \
-e X_DB_USERNAME=$${dbUsername} \
-e X_DB_PASSWORD=$${dbPassword} \
-e X_FRONTEND_URLS=$${frontendUrl}${this.isDevMode() ? `,${this.getLocalFrontendUrl()}` : ""} \
-e spring_profiles_active=${this.appEnv} \
"$${ecrUrl}";
else
  echo "[${this.appEnv}] Image not found. Container not started.";
fi`;
  }
}
