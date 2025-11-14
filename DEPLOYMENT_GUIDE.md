# 🚀 AgriSky Platform 배포 가이드

## 현재 상태
- ✅ 서버 인스턴스: 실행 중 (3.25.181.229)
- ⚠️  Security Group: 포트 22, 80, 443 닫혀있음
- ✅ 배포 스크립트: 준비 완료

## 배포 단계

### 1단계: Security Group 설정 (필수)

**AWS Console에서 설정:**

1. https://console.aws.amazon.com/ec2/ 접속
2. 왼쪽 메뉴 → "보안 그룹" 클릭
3. `default` 보안 그룹 선택
4. "인바운드 규칙" 탭 → "인바운드 규칙 편집" 클릭
5. 다음 규칙 추가:

| 유형 | 프로토콜 | 포트 범위 | 소스 | 설명 |
|------|---------|----------|------|------|
| SSH | TCP | 22 | 0.0.0.0/0 | SSH 접속 |
| HTTP | TCP | 80 | 0.0.0.0/0 | 웹 서버 |
| HTTPS | TCP | 443 | 0.0.0.0/0 | HTTPS |
| Custom TCP | TCP | 3001 | 0.0.0.0/0 | 백엔드 API |

6. "규칙 저장" 클릭
7. **1-2분 대기** (설정 적용 시간)

### 2단계: 자동 배포 실행

Security Group 설정 후:

```bash
cd /Users/donghokim/Documents/agrisky_platform
./auto-deploy.sh
```

이 스크립트는:
- SSH 포트가 열릴 때까지 자동 대기
- 포트가 열리면 자동으로 배포 실행
- 서버 초기 설정 → 파일 업로드 → 배포까지 자동 진행

### 3단계: 수동 배포 (선택사항)

자동 배포가 실패하면:

```bash
./deploy.sh
```

## 배포 내용

자동 배포 스크립트가 수행하는 작업:

1. **서버 초기 설정**
   - Node.js 20 설치
   - PostgreSQL 설치 및 설정
   - PM2 설치
   - Nginx 설치
   - 방화벽 설정

2. **데이터베이스 설정**
   - 데이터베이스 생성 (agrisky_platform)
   - 사용자 생성 (admin/admin1234)
   - 테이블 생성 (마이그레이션 실행)

3. **백엔드 서버 배포**
   - 파일 업로드
   - npm 패키지 설치
   - 환경 변수 설정
   - PM2로 서버 실행

4. **프론트엔드 배포**
   - 파일 업로드
   - 빌드 실행
   - Nginx 설정

5. **서비스 시작**
   - 백엔드 API: http://3.25.181.229:3001
   - 프론트엔드: http://3.25.181.229

## 배포 후 확인

### 서버 상태 확인

```bash
ssh -i agri_sky.pem ec2-user@3.25.181.229 "pm2 status"
```

### 로그 확인

```bash
# 백엔드 로그
ssh -i agri_sky.pem ec2-user@3.25.181.229 "pm2 logs agrisky-backend"

# Nginx 로그
ssh -i agri_sky.pem ec2-user@3.25.181.229 "sudo tail -f /var/log/nginx/error.log"
```

### 웹 브라우저에서 확인

- http://3.25.181.229 접속
- 대시보드가 정상적으로 표시되는지 확인

## 문제 해결

### SSH 접속 실패

1. Security Group에서 포트 22 확인
2. 인스턴스 상태가 "running"인지 확인
3. PEM 파일 권한 확인: `chmod 400 agri_sky.pem`

### 배포 실패

1. 서버 로그 확인: `pm2 logs`
2. 데이터베이스 연결 확인
3. 포트 확인: `netstat -tulpn`

### 서비스 접속 불가

1. Security Group에서 포트 80, 443 확인
2. Nginx 상태 확인: `sudo systemctl status nginx`
3. 백엔드 서버 상태 확인: `pm2 status`

## 다음 단계

배포 완료 후:

1. ✅ 도메인 연결 (선택사항)
2. ✅ SSL 인증서 설정 (Let's Encrypt)
3. ✅ 모니터링 설정
4. ✅ 백업 설정

## 파일 구조

```
agrisky_platform/
├── deploy.sh              # 메인 배포 스크립트
├── auto-deploy.sh         # 자동 배포 (Security Group 대기)
├── server-check.sh        # 서버 연결 테스트
├── SECURITY_GROUP_SETUP.md # Security Group 설정 가이드
├── DEPLOYMENT_GUIDE.md    # 이 파일
├── server/
│   ├── setup-server.sh    # 서버 초기 설정
│   └── migrations/
│       └── create_tables.sql  # PostgreSQL 마이그레이션
└── Plarform_v1/           # 프론트엔드
```

