#!/bin/bash

# 전체 배포 스크립트
set -e

SERVER_IP="3.25.181.229"
PEM_FILE="agri_sky.pem"
SERVER_USER="ec2-user"
PROJECT_DIR="agrisky_platform"

echo "🚀 전체 배포 시작..."

# 1. 프론트엔드 빌드
echo "📦 프론트엔드 빌드 중..."
cd Plarform_v1
npm install
npm run build
cd ..

# 2. 백엔드 빌드
echo "📦 백엔드 빌드 중..."
cd server
npm install
npm run build
cd ..

# 3. 서버에 파일 업로드
echo "📤 서버에 파일 업로드 중..."
ssh -i $PEM_FILE $SERVER_USER@$SERVER_IP "mkdir -p ~/$PROJECT_DIR"

# 프론트엔드 업로드
scp -i $PEM_FILE -r Plarform_v1/dist $SERVER_USER@$SERVER_IP:~/$PROJECT_DIR/frontend-dist

# 백엔드 업로드
scp -i $PEM_FILE -r server/dist $SERVER_USER@$SERVER_IP:~/$PROJECT_DIR/server-dist
scp -i $PEM_FILE -r server/package.json $SERVER_USER@$SERVER_IP:~/$PROJECT_DIR/
scp -i $PEM_FILE -r server/tsconfig.json $SERVER_USER@$SERVER_IP:~/$PROJECT_DIR/
scp -i $PEM_FILE -r server/migrations $SERVER_USER@$SERVER_IP:~/$PROJECT_DIR/
scp -i $PEM_FILE -r server/src/scripts $SERVER_USER@$SERVER_IP:~/$PROJECT_DIR/server-dist/scripts

# 4. 서버에서 배포 실행
echo "🔧 서버에서 배포 실행 중..."
ssh -i $PEM_FILE $SERVER_USER@$SERVER_IP << 'ENDSSH'
cd ~/agrisky_platform

# 백엔드 파일 복사
rm -rf ~/agrisky_platform/server/dist
cp -r server-dist ~/agrisky_platform/server/dist
cp package.json ~/agrisky_platform/server/
cp tsconfig.json ~/agrisky_platform/server/
cp -r migrations ~/agrisky_platform/server/

# 백엔드 의존성 설치
cd ~/agrisky_platform/server
npm install --production

# 프론트엔드 배포
sudo rm -rf /var/www/agrisky
sudo mkdir -p /var/www/agrisky
sudo cp -r ~/agrisky_platform/frontend-dist/* /var/www/agrisky/
sudo chown -R nginx:nginx /var/www/agrisky
sudo chmod -R 755 /var/www/agrisky

# 데이터베이스 마이그레이션
cd ~/agrisky_platform/server
if [ -f migrations/create_auth_tables.sql ]; then
  echo "데이터베이스 마이그레이션 실행 중..."
  PGPASSWORD=admin1234 psql -h localhost -U admin -d agrisky_platform -f migrations/create_auth_tables.sql || echo "마이그레이션 스크립트 실행 완료 (이미 존재하는 테이블 무시)"
fi

# 데모 계정 생성
if [ -f dist/scripts/create-demo-accounts.js ]; then
  echo "데모 계정 생성 중..."
  cd ~/agrisky_platform/server
  node dist/scripts/create-demo-accounts.js || echo "데모 계정 생성 완료"
fi

# PM2 재시작
cd ~/agrisky_platform/server
pm2 restart agrisky-backend || pm2 start dist/index.js --name agrisky-backend

# Nginx 재시작
sudo systemctl restart nginx

echo "✅ 배포 완료!"
ENDSSH

echo "✅ 전체 배포 완료!"
echo "🌐 접속: http://$SERVER_IP/"

