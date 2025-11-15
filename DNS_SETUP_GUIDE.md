# 🔧 agrisky.co.kr DNS 설정 가이드

## 현재 상태
- ✅ 서버 설정 완료 (Nginx에 도메인 추가됨)
- ❌ DNS 레코드 미설정 (도메인 등록 업체에서 설정 필요)
- ✅ IP 주소로는 접속 가능: http://3.25.181.229

## DNS 설정 방법

### 1단계: 도메인 등록 업체 로그인
도메인 `agrisky.co.kr`을 구매한 업체의 관리 패널에 로그인하세요.
- 가비아 (gabia.com)
- 후이즈 (whois.co.kr)
- 닷네임코리아 (dn.kr)
- 기타 도메인 등록 업체

### 2단계: DNS 레코드 추가

도메인 관리 패널에서 **DNS 관리** 또는 **네임서버 설정** 메뉴로 이동하여 다음 레코드를 추가하세요:

#### A 레코드 추가

**레코드 1:**
```
Type: A
Name: @ (또는 agrisky.co.kr 또는 비워두기)
Value: 3.25.181.229
TTL: 3600 (또는 기본값)
```

**레코드 2:**
```
Type: A
Name: www
Value: 3.25.181.229
TTL: 3600 (또는 기본값)
```

### 3단계: DNS 전파 대기

DNS 설정 후 전파까지 시간이 걸립니다:
- **일반적으로**: 5분 ~ 1시간
- **최대**: 24시간 ~ 48시간

### 4단계: DNS 전파 확인

다음 명령어로 DNS 전파 상태를 확인하세요:

```bash
# 방법 1: nslookup
nslookup agrisky.co.kr

# 방법 2: dig
dig agrisky.co.kr +short

# 방법 3: 온라인 도구
# https://www.whatsmydns.net/#A/agrisky.co.kr
```

**정상적인 경우:**
```
agrisky.co.kr -> 3.25.181.229
```

### 5단계: SSL 인증서 발급 (DNS 설정 후)

DNS 전파가 완료되면 SSL 인증서를 발급받으세요:

```bash
./setup-ssl.sh
```

또는 수동으로:

```bash
ssh -i agri_sky.pem ec2-user@3.25.181.229
sudo certbot --nginx -d agrisky.co.kr -d www.agrisky.co.kr --non-interactive --agree-tos --email admin@agrisky.co.kr --redirect
```

## 현재 접속 방법

DNS 설정이 완료될 때까지는 IP 주소로 접속하세요:

- **HTTP**: http://3.25.181.229
- **도메인 (DNS 설정 후)**: http://agrisky.co.kr
- **HTTPS (SSL 발급 후)**: https://agrisky.co.kr

## 문제 해결

### DNS가 설정되지 않았는데 접속이 안되는 경우
1. 도메인 등록 업체에서 DNS 레코드가 올바르게 설정되었는지 확인
2. TTL 값을 낮춰서 빠른 전파 시도 (예: 300초)
3. 여러 DNS 서버에서 확인: `dig @8.8.8.8 agrisky.co.kr`

### DNS는 설정되었는데 접속이 안되는 경우
1. 서버 상태 확인: `ssh -i agri_sky.pem ec2-user@3.25.181.229 "sudo systemctl status nginx"`
2. Nginx 설정 확인: `ssh -i agri_sky.pem ec2-user@3.25.181.229 "sudo nginx -t"`
3. 방화벽 확인: AWS Security Group에서 포트 80, 443이 열려있는지 확인

## 참고사항

- DNS 전파는 전 세계적으로 시간이 다를 수 있습니다
- 일부 지역에서는 빠르게, 일부 지역에서는 느리게 전파될 수 있습니다
- DNS 캐시를 클리어하려면: `sudo dscacheutil -flushcache` (macOS) 또는 `ipconfig /flushdns` (Windows)

