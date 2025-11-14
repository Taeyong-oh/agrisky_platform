# 🚀 배포 상태 보고서

## 배포 완료 시간
2025년 11월 13일

## 서버 정보
- **IP 주소**: 3.25.181.229
- **OS**: Red Hat Enterprise Linux 10.0 (Coughlan)
- **사용자**: ec2-user

## 설치된 소프트웨어

### ✅ Node.js
- 버전: v20.19.5
- 설치 방법: NVM

### ✅ PostgreSQL
- 버전: 16.10
- 데이터베이스: agrisky_platform
- 사용자: admin
- 비밀번호: admin1234

### ✅ PM2
- 상태: 설치 완료 및 자동 시작 설정 완료

### ✅ Nginx
- 버전: 1.26.3
- 상태: 실행 중

## 배포된 서비스

### 백엔드 API 서버
- **포트**: 3001
- **상태**: ✅ 실행 중 (PM2)
- **프로세스**: agrisky-backend
- **Health Check**: http://localhost:3001/health

### 프론트엔드
- **빌드 상태**: ✅ 완료
- **위치**: ~/agrisky_platform/Plarform_v1/dist
- **서빙**: Nginx

### 데이터베이스
- **마이그레이션**: ✅ 완료
- **테이블**: 7개 테이블 생성 완료

## 접속 URL

- **웹사이트**: http://3.25.181.229
- **API**: http://3.25.181.229/api

## API 엔드포인트

- `GET /api/health` - 서버 상태 확인
- `GET /api/dashboard/stats` - 대시보드 통계
- `GET /api/dashboard/recent-requests` - 최근 작업 요청
- `GET /api/farmlands` - 농지 목록
- `POST /api/farmlands` - 농지 생성
- `PUT /api/farmlands/:id` - 농지 수정
- `DELETE /api/farmlands/:id` - 농지 삭제
- `GET /api/drones` - 드론 목록
- `POST /api/drones` - 드론 생성
- `PUT /api/drones/:id` - 드론 수정
- `DELETE /api/drones/:id` - 드론 삭제
- `GET /api/work-requests` - 작업 요청 목록
- `POST /api/work-requests` - 작업 요청 생성
- `GET /api/work-matches` - 작업 매칭 목록
- `POST /api/work-matches` - 작업 매칭 생성
- `PATCH /api/work-matches/:id/accept` - 작업 매칭 승인
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
ssh -i agri_sky.pem ec2-user@3.25.181.229 "psql -U admin -d agrisky_platform"

# 백업
ssh -i agri_sky.pem ec2-user@3.25.181.229 "pg_dump -U admin agrisky_platform > backup.sql"
```

## 다음 단계

1. ✅ 서버 초기 설정 완료
2. ✅ 데이터베이스 마이그레이션 완료
3. ✅ 백엔드 서버 배포 완료
4. ✅ 프론트엔드 빌드 완료
5. ⚠️  Nginx 프록시 설정 확인 필요
6. ⚠️  프론트엔드 API 클라이언트 설정 확인 필요

## 알려진 이슈

1. Nginx 프록시가 502 에러를 반환하는 경우가 있음
   - 백엔드 서버는 정상 작동 중
   - 로컬에서 `curl http://localhost:3001/health` 정상 작동
   - Nginx 프록시 설정 확인 필요

2. 프론트엔드가 Supabase를 사용 중
   - API 클라이언트로 전환 필요
   - `Plarform_v1/src/lib/api.ts` 파일 생성 필요

## 해결 방법

### Nginx 프록시 문제 해결
```bash
# Nginx 에러 로그 확인
ssh -i agri_sky.pem ec2-user@3.25.181.229 "sudo tail -f /var/log/nginx/error.log"

# 백엔드 서버 직접 테스트
ssh -i agri_sky.pem ec2-user@3.25.181.229 "curl http://localhost:3001/health"
```

### 프론트엔드 API 클라이언트 설정
1. `Plarform_v1/src/lib/api.ts` 파일 생성
2. 모든 컴포넌트에서 `supabase` → `api` 호출로 변경
3. `.env.production` 파일에 `VITE_API_URL=http://3.25.181.229/api` 설정
4. 프론트엔드 재빌드 및 배포

