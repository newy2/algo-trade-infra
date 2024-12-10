import BaseAwsInfo from "../../BaseAwsInfo";
import ParameterStoreInfo from "../../../frontend_infra/ssm/application_management/ParameterStoreInfo";

export default class UserData extends BaseAwsInfo {
  private readonly updateYum = `#!/bin/bash
sudo yum update -y`;

  private readonly installDocker = `# docker 설치
sudo yum install docker -y
sudo service docker start
sudo usermod -aG docker ec2-user`;

  private readonly setVirtualMemory = `# 가상 메모리 설정
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab`;

  private readonly runBackendServerContainer = `# 백엔드 서버 실행
PORT=80
ECR_URL=$(aws ssm get-parameter --name "${ParameterStoreInfo.ECR_PRIVATE_REPOSITORY_URL_KEY}" --query "Parameter.Value" --output text)
DB_URL=$(aws ssm get-parameter --name "${ParameterStoreInfo.RDS_ENDPOINT_KEY}" --query "Parameter.Value" --output text)
DB_USERNAME=$(aws ssm get-parameter --name "${ParameterStoreInfo.RDS_USERNAME_KEY}" --query "Parameter.Value" --output text)
DB_PASSWORD=$(aws ssm get-parameter --name "${ParameterStoreInfo.RDS_PASSWORD_KEY}" --with-decryption --query "Parameter.Value" --output text)
FRONTEND_URL=$(aws ssm get-parameter --name "${ParameterStoreInfo.CODE_DELIVERY_FRONTEND_DISTRIBUTION_URL_KEY}" --with-decryption --query "Parameter.Value" --output text)
aws ecr get-login-password --region ${this.getCurrentRegion()} | docker login --username AWS --password-stdin "$ECR_URL"
docker pull "$ECR_URL":latest
if docker images | grep latest > /dev/null; then
  docker run -d \
-p $PORT:$PORT \
-e X_PORT=$PORT \
-e X_DB_URL=$DB_URL \
-e X_DB_URL=$DB_URL \
-e X_DB_USERNAME=$DB_USERNAME \
-e X_DB_PASSWORD=$DB_PASSWORD \
-e X_FRONTEND_URL=$FRONTEND_URL \
"$ECR_URL";
else
  echo "Image not found. Container not started.";
fi`;

  public getUserData() {
    return [
      this.updateYum,
      this.installDocker,
      this.setVirtualMemory,
      this.runBackendServerContainer,
    ].join("\n\n");
  }

  public toBase64String() {
    return Buffer.from(this.getUserData()).toString("base64");
  }
}
