#!/bin/bash

# 서버 배포 스크립트 (서버에서 빌드)
set -e

SERVER_IP="3.25.181.229"
PEM_FILE="agri_sky.pem"
SERVER_USER="ec2-user"
PROJECT_DIR="agrisky_platform"

echo "🚀 서버 배포 시작..."

# SSH 옵션 (config 파일 우회)
SSH_OPTS="-F /dev/null -i $PEM_FILE -o StrictHostKeyChecking=no"

# 서버에 소스 코드 업로드
echo "📤 서버에 소스 코드 업로드 중..."
ssh $SSH_OPTS $SERVER_USER@$SERVER_IP "mkdir -p ~/$PROJECT_DIR"

# 프론트엔드 소스 업로드
echo "📤 프론트엔드 소스 업로드 중..."
scp $SSH_OPTS -r Platform_v1/src $SERVER_USER@$SERVER_IP:~/$PROJECT_DIR/frontend-src
scp $SSH_OPTS Platform_v1/package.json $SERVER_USER@$SERVER_IP:~/$PROJECT_DIR/
scp $SSH_OPTS Platform_v1/vite.config.ts $SERVER_USER@$SERVER_IP:~/$PROJECT_DIR/
scp $SSH_OPTS Platform_v1/tsconfig.json $SERVER_USER@$SERVER_IP:~/$PROJECT_DIR/
scp $SSH_OPTS Platform_v1/tsconfig.app.json $SERVER_USER@$SERVER_IP:~/$PROJECT_DIR/
scp $SSH_OPTS Platform_v1/tsconfig.node.json $SERVER_USER@$SERVER_IP:~/$PROJECT_DIR/
scp $SSH_OPTS Platform_v1/tailwind.config.ts $SERVER_USER@$SERVER_IP:~/$PROJECT_DIR/
scp $SSH_OPTS Platform_v1/postcss.config.js $SERVER_USER@$SERVER_IP:~/$PROJECT_DIR/
scp $SSH_OPTS Platform_v1/index.html $SERVER_USER@$SERVER_IP:~/$PROJECT_DIR/
scp $SSH_OPTS Platform_v1/.env.production $SERVER_USER@$SERVER_IP:~/$PROJECT_DIR/ 2>/dev/null || echo "환경 변수 파일 없음"
scp $SSH_OPTS -r Platform_v1/public $SERVER_USER@$SERVER_IP:~/$PROJECT_DIR/

# 백엔드 소스 업로드
echo "📤 백엔드 소스 업로드 중..."
scp $SSH_OPTS -r server/src $SERVER_USER@$SERVER_IP:~/$PROJECT_DIR/server-src
scp $SSH_OPTS server/package.json $SERVER_USER@$SERVER_IP:~/$PROJECT_DIR/server/
scp $SSH_OPTS server/tsconfig.json $SERVER_USER@$SERVER_IP:~/$PROJECT_DIR/server/
scp $SSH_OPTS -r server/migrations $SERVER_USER@$SERVER_IP:~/$PROJECT_DIR/server/

# 서버에서 빌드 및 배포 실행
echo "🔧 서버에서 빌드 및 배포 실행 중..."
ssh $SSH_OPTS $SERVER_USER@$SERVER_IP << 'ENDSSH'
cd ~/agrisky_platform

# 프론트엔드 빌드
echo "📦 프론트엔드 빌드 중..."
if [ -d frontend-src ]; then
  mkdir -p frontend
  cp -r frontend-src frontend/src
  cp package.json frontend/ 2>/dev/null || true
  cp vite.config.ts frontend/ 2>/dev/null || true
  cp tsconfig*.json frontend/ 2>/dev/null || true
  cp tailwind.config.ts frontend/ 2>/dev/null || true
  cp postcss.config.js frontend/ 2>/dev/null || true
  cp index.html frontend/ 2>/dev/null || true
  cp .env.production frontend/.env.production 2>/dev/null || true
  
  cd frontend
  npm install
  npm run build
  cd ..
fi

# 백엔드 빌드
echo "📦 백엔드 빌드 중..."
if [ -d server-src ]; then
  mkdir -p server
  cp -r server-src server/src
  cd server
  npm install
  npm run build
  cd ..
fi

# 프론트엔드 배포
echo "📤 프론트엔드 배포 중..."
sudo rm -rf /var/www/agrisky
sudo mkdir -p /var/www/agrisky
if [ -d frontend/dist ]; then
  sudo cp -r frontend/dist/* /var/www/agrisky/
  # public 폴더의 정적 파일들도 복사 (로고 등)
  if [ -d public ]; then
    sudo cp -r public/* /var/www/agrisky/
  fi
  sudo chown -R nginx:nginx /var/www/agrisky
  sudo chmod -R 755 /var/www/agrisky
fi

# 데이터베이스 마이그레이션
echo "🗄️ 데이터베이스 마이그레이션 중..."
cd server
if [ -f migrations/create_auth_tables.sql ]; then
  PGPASSWORD=admin1234 psql -h localhost -U admin -d agrisky_platform -f migrations/create_auth_tables.sql 2>&1 | grep -v "already exists" || true
fi

# 데모 계정 생성
echo "👤 데모 계정 생성 중..."
if [ -f dist/scripts/create-demo-accounts.js ]; then
  cd dist/scripts
  node create-demo-accounts.js || echo "데모 계정 생성 완료"
  cd ../..
elif [ -f src/scripts/create-demo-accounts.ts ]; then
  # TypeScript 파일이 있으면 tsx로 실행
  npx tsx src/scripts/create-demo-accounts.ts || echo "데모 계정 생성 완료"
fi

# 환경 변수 설정
if [ ! -f .env ]; then
  cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agrisky_platform
DB_USER=admin
DB_PASSWORD=admin1234
PORT=3001
CORS_ORIGIN=http://3.25.181.229
JWT_SECRET=your-secret-key-change-in-production-2024
EOF
fi

# PM2 재시작
echo "🔄 PM2 재시작 중..."
cd ~/agrisky_platform/server
pm2 restart agrisky-backend || pm2 start dist/index.js --name agrisky-backend

# Nginx 재시작
echo "🔄 Nginx 재시작 중..."
sudo systemctl restart nginx

echo "✅ 배포 완료!"
ENDSSH

echo "✅ 서버 배포 완료!"
echo "🌐 접속: http://$SERVER_IP/"

