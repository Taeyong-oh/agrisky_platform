# ✅ AgriSky Platform 배포 완료 보고서

## 배포 완료 시간
2025년 11월 13일 21:10 (KST)

## 서버 정보
- **IP 주소**: 3.25.181.229
- **OS**: Red Hat Enterprise Linux 10.0
- **사용자**: ec2-user
- **SSH 접속**: `ssh -i agri_sky.pem ec2-user@3.25.181.229`

## 설치 완료된 소프트웨어

### ✅ Node.js v20.19.5
- NVM을 통해 설치
- 경로: `~/.nvm/versions/node/v20.19.5`

### ✅ PostgreSQL 16.10
- 데이터베이스: `agrisky_platform`
- 사용자: `admin` / 비밀번호: `admin1234`
- 포트: 5432
- 상태: 실행 중

### ✅ PM2
- 백엔드 서버 프로세스 관리
- 자동 시작 설정 완료
- 프로세스명: `agrisky-backend`

### ✅ Nginx 1.26.3
- 웹 서버 및 리버스 프록시
- 프론트엔드 서빙: `/var/www/agrisky`
- API 프록시: `/api` → `http://127.0.0.1:3001`

## 배포된 서비스

### 백엔드 API 서버
- **포트**: 3001
- **상태**: ✅ 실행 중
- **프로세스**: PM2로 관리
- **Health Check**: http://3.25.181.229/api/health

### 프론트엔드
- **위치**: `/var/www/agrisky`
- **빌드 상태**: ✅ 완료
- **서빙**: Nginx

### 데이터베이스
- **마이그레이션**: ✅ 완료
- **테이블**: 7개 테이블 생성 완료
  - user_profiles_2025_11_12_19_03
  - farmlands_2025_11_12_19_03
  - drones_2025_11_12_19_03
  - work_requests_2025_11_12_19_03
  - work_matches_2025_11_12_19_03
  - flight_paths_2025_11_12_19_03
  - work_logs_2025_11_12_19_03

## 접속 URL

- **웹사이트**: http://3.25.181.229
- **API Health**: http://3.25.181.229/api/health
- **API Dashboard**: http://3.25.181.229/api/dashboard/stats

## API 엔드포인트

### Dashboard
- `GET /api/health` - 서버 상태 확인
- `GET /api/dashboard/stats` - 대시보드 통계
- `GET /api/dashboard/recent-requests` - 최근 작업 요청

### Farmlands
- `GET /api/farmlands` - 농지 목록
- `POST /api/farmlands` - 농지 생성
- `PUT /api/farmlands/:id` - 농지 수정
- `DELETE /api/farmlands/:id` - 농지 삭제

### Drones
- `GET /api/drones` - 드론 목록
- `POST /api/drones` - 드론 생성
- `PUT /api/drones/:id` - 드론 수정
- `DELETE /api/drones/:id` - 드론 삭제

### Work Requests
- `GET /api/work-requests` - 작업 요청 목록
- `POST /api/work-requests` - 작업 요청 생성

### Work Matches
- `GET /api/work-matches` - 작업 매칭 목록
- `POST /api/work-matches` - 작업 매칭 생성
- `PATCH /api/work-matches/:id/accept` - 작업 매칭 승인

### Flight Paths
- `GET /api/flight-paths` - 비행 경로 목록
- `GET /api/flight-paths/work-logs` - 작업 로그 목록

## 서버 관리 명령어

### PM2 관리
```bash
# 서버 상태 확인
ssh -i agri_sky.pem ec2-user@3.25.181.229 "pm2 status"

# 로그 확인
ssh -i agri_sky.pem ec2-user@3.25.181.229 "pm2 logs agrisky-backend"

# 서버 재시작
ssh -i agri_sky.pem ec2-user@3.25.181.229 "pm2 restart agrisky-backend"

# 서버 중지
ssh -i agri_sky.pem ec2-user@3.25.181.229 "pm2 stop agrisky-backend"
```

### Nginx 관리
```bash
# 상태 확인
ssh -i agri_sky.pem ec2-user@3.25.181.229 "sudo systemctl status nginx"

# 재시작
ssh -i agri_sky.pem ec2-user@3.25.181.229 "sudo systemctl restart nginx"

# 로그 확인
ssh -i agri_sky.pem ec2-user@3.25.181.229 "sudo tail -f /var/log/nginx/error.log"
```

### PostgreSQL 관리
```bash
# 데이터베이스 접속
ssh -i agri_sky.pem ec2-user@3.25.181.229 "psql -U admin -d agrisky_platform -h localhost"

# 백업
ssh -i agri_sky.pem ec2-user@3.25.181.229 "pg_dump -U admin -h localhost agrisky_platform > backup.sql"
```

## 현재 상태

### ✅ 정상 작동 중
- 백엔드 API 서버 (포트 3001)
- PostgreSQL 데이터베이스
- PM2 프로세스 관리
- API 엔드포인트

### ⚠️ 확인 필요
- 프론트엔드 웹사이트 접속 (로컬에서는 정상, 외부 접속 확인 필요)
- 프론트엔드가 아직 Supabase를 사용 중 (API 클라이언트로 전환 필요)

## 다음 단계

1. **프론트엔드 API 클라이언트 설정**
   - `Plarform_v1/src/lib/api.ts` 파일 생성
   - 모든 컴포넌트에서 `supabase` → `api` 호출로 변경
   - 프론트엔드 재빌드 및 배포

2. **프론트엔드 재배포**
   ```bash
   cd Plarform_v1
   npm run build
   scp -i agri_sky.pem -r dist/* ec2-user@3.25.181.229:/var/www/agrisky/
   ```

3. **도메인 연결** (선택사항)
   - 도메인을 서버 IP에 연결
   - SSL 인증서 설정 (Let's Encrypt)

## 배포 완료!

서버 설정이 완료되었고, 백엔드 API는 정상 작동 중입니다. 
프론트엔드만 API 클라이언트로 전환하면 완전한 배포가 완료됩니다.

