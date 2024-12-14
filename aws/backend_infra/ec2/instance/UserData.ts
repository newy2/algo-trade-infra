import BackendAppInfra from "../../../backend_app_infra/BackendAppInfra";

export default class UserData {
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

  private backendAppInfraList: BackendAppInfra[];

  constructor(backendAppInfraList: BackendAppInfra[]) {
    this.backendAppInfraList = backendAppInfraList;
  }

  public toBase64String() {
    return Buffer.from(this.getUserData()).toString("base64");
  }

  private getUserData() {
    return [
      this.updateYum,
      this.installDocker,
      this.setVirtualMemory,
      ...this.backendAppInfraList.map((each) =>
        each.ec2Info.userData.getUserData(),
      ),
    ].join("\n\n");
  }
}
