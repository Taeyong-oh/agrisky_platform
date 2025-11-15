# agrisky.co.kr 도메인 설정 가이드

## 현재 상태
- ✅ Nginx 설정 완료 (agrisky.co.kr 도메인 추가)
- ⏳ DNS 설정 필요
- ⏳ SSL 인증서 발급 대기 중

## DNS 설정 방법

### 1. 도메인 등록 업체에서 DNS 레코드 추가

도메인 관리 패널에서 다음 A 레코드를 추가하세요:

```
Type: A
Name: @ (또는 agrisky.co.kr)
Value: 3.25.181.229
TTL: 3600 (또는 기본값)
```

```
Type: A
Name: www
Value: 3.25.181.229
TTL: 3600 (또는 기본값)
```

### 2. DNS 전파 확인

DNS 설정 후 전파까지 몇 분~몇 시간이 걸릴 수 있습니다. 다음 명령어로 확인하세요:

```bash
# DNS 확인
nslookup agrisky.co.kr
dig agrisky.co.kr +short

# 결과가 3.25.181.229를 반환해야 합니다
```

### 3. SSL 인증서 발급

DNS 설정이 완료되면 다음 명령어로 SSL 인증서를 발급받으세요:

```bash
ssh -i agri_sky.pem ec2-user@3.25.181.229
sudo certbot --nginx -d agrisky.co.kr -d www.agrisky.co.kr --non-interactive --agree-tos --email admin@agrisky.co.kr --redirect
```

또는 자동 배포 스크립트를 실행:

```bash
./setup-ssl.sh
```

## 현재 Nginx 설정

서버의 `/etc/nginx/conf.d/agrisky.conf` 파일에 다음 도메인이 설정되어 있습니다:
- `3.25.181.229` (IP 주소)
- `agrisky.co.kr`
- `www.agrisky.co.kr`

모든 도메인이 동일한 사이트를 제공합니다.

## 테스트

DNS 설정 후 다음 URL로 접속 가능합니다:
- http://agrisky.co.kr
- http://www.agrisky.co.kr
- https://agrisky.co.kr (SSL 인증서 발급 후)
- https://www.agrisky.co.kr (SSL 인증서 발급 후)

## 참고사항

- DNS 전파는 보통 5분~24시간이 걸릴 수 있습니다
- SSL 인증서는 DNS 설정 완료 후에만 발급 가능합니다
- Let's Encrypt 인증서는 90일마다 자동 갱신됩니다

