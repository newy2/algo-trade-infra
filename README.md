# AWS 주의사항

## ECR 과거 이미지 자동으로 삭제하기

ECR 의 Lifecycle Policy 를 사용하면 최대 이미지 개수를 기준으로 과거 이미지를 자동으로 제거할 수 있지만, 이미지 PUSH 이벤트에 실시간으로 실행되지 않고, 최대 24시간 이내에 실행된다.

차선책으로 Amazon EventBridge 와 Lambda 를 사용해서 ECR 과거 이미지를 자동으로 삭제하는 로직으로 사용한다.

[BaseAwsInfo#isFastCleanupEcrImage](https://github.com/newy2/algo-trade-infra/blob/e05c7664abae851fd2aea8e63d1a726b235eba27/aws/BaseAwsInfo.ts#L50-L52)
플래그로 ECR 과거 이미지 자동으로 삭제하는 전략을 선택할 수 있다.

#### 참조 링크:

- [Amazon ECR의 수명 주기 정책을 사용하여 이미지 정리 자동화](https://docs.aws.amazon.com/ko_kr/AmazonECR/latest/userguide/LifecyclePolicies.html)
- [ECR Lifecycle policy not executing](https://repost.aws/questions/QUW-16BgYnSLC6jTHt2QjcmQ/ecr-lifecycle-policy-not-executing)

## Bastion Host 없이 Private RDS 에 접속하기 (ECI Endpoint 사용)

EIC Endpoint 를 사용하면 추가 비용 없이 개발 PC 에서 Private RDS 에 접속할 수 있다.

(참고) 2024년 11월 24일 기준으로 RDS Port 값이 3389 인 경우에만 사용 가능하다.

해당 프로젝트에서는 아래 명령어로 ECI Endpoint 를 사용한다.

```bash
aws ec2-instance-connect open-tunnel --instance-connect-endpoint-id $(aws ssm get-parameter --name "/vpc/eice/rds-connect/id" --query "Parameter.Value" --output text) --private-ip-address $(nslookup $(aws ssm get-parameter --name "/rds/address" --query "Parameter.Value" --output text) | grep "Address" | tail -n 1 | awk '{print $2}') --local-port 3389 --remote-port 3389
```

#### 참조 링크:

- [(LV.200)Amazon RDS 인증과 접속 (feat.Bastion 없이 Private RDS 접속 방법)](https://www.youtube.com/watch?v=Ft-rW0hJVqU&t=0s)
- [EC2 Instance Connect Endpoint를 이용해 Amazon EC2및 Amazon RDS 인스턴스에 안전하게 접속하기
  ](https://aws.amazon.com/ko/blogs/tech/ec2-instance-connect-endpoint-bastion/)