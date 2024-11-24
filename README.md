# AWS 주의사항

## CloudFront 와 S3 를 사용한 정적 웹사이트(React 앱) 배포 시, CloudFront Function 으로 리다이렉션 로직을 추가해야 한다

CloudFront 와 S3를 사용한 정적 웹사이트에 사용자가 URL을 직접 입력해서 방문하는 경우 403 에러가 발생한다.  
(오류 페이지를 적용하면 403 에러 발생 시, 홈화면으로 리다이렉션 할 수 있지만 사용자가 원하는 페이지로 리다이렉션할 수 없다)

CloudFront 의 Function 을 사용해서 아래와 같은 로직을 적용하면, 사용자가 입력한 URL 로 페이지를 리다이렉션할 수 있다.

1. `static 폴더의 하위 파일(/static/*)`과 `루트 폴더의 파일(/*.*)`은 bypass 로 리턴한다.
2. 그 외의 URL은 CloudFront 의 Function 으로 리다이렉트 URL 을 생성하고, 302 상태 값을 리턴한다.
3. 리다이렉트 URL 형식은 루트 경로에 쿼리스트링(redirect_path)을 붙여서 생성한다.
4. 리다이렉트 URL 예시:
    1. 첫 진입 URL: `https://xxx.cloudfront.net/product/1234?name=john&group_ids=1&group_ids=2`
    2. 리다이렉트
       URL: `https://xxx.cloudfront.net/?redirect_path={Base64 인코딩("/product/1234?name=john&group_ids=1&group_ids=2")}`
5. 프론트엔드 코드에서 쿼리스트링에 `redirect_path`키가 있는 경우 페이지 라우팅 처리를 한다.

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

---

# Pulumi 주의사항

## AWS CloudFront Distribution 생성 시, retainOnDelete 옵션을 true 로 설정하면 연관된 resource 가 제대로 삭제되지 않는다

Distribution 는 삭제까지 시간이 오래 걸린다. retainOnDelete 옵션 값을 true 로 설정하고 `pulumi down` 명령어를 호출하면 실제 삭제되기까지 기다리지 않는다.

위 옵션을 적용하면, OriginAccessControl 같은 Distribution 와 연관된 리소스 제대로 삭제되지 않는 현상이 발생한다.

추후, deleteWithMe 같은 옵션을 테스트할 예정이다. 