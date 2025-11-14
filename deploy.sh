#!/bin/bash

set -e

SERVER_IP="3.25.181.229"
SERVER_USER="ec2-user"  # 또는 ubuntu
PEM_FILE="agri_sky.pem"
PROJECT_DIR="~/agrisky_platform"

echo "=========================================="
echo "🚀 AgriSky Platform 자동 배포"
echo "=========================================="
echo ""

# PEM 파일 확인
if [ ! -f "$PEM_FILE" ]; then
    echo "❌ PEM 파일을 찾을 수 없습니다: $PEM_FILE"
    exit 1
fi

chmod 400 "$PEM_FILE"
echo "✅ PEM 파일 확인됨"
echo ""

# 1. 서버 접속 테스트
echo "🔍 서버 접속 테스트 중..."
if ssh -F /dev/null -i "$PEM_FILE" -o ConnectTimeout=10 -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "echo 'Connection OK'" 2>/dev/null; then
    echo "✅ 서버 접속 성공"
else
    echo "❌ 서버 접속 실패"
    echo ""
    echo "⚠️  Security Group 설정을 확인하세요:"
    echo "   1. AWS Console → EC2 → Security Groups"
    echo "   2. default 보안 그룹 → 인바운드 규칙"
    echo "   3. SSH (포트 22) 추가: 소스 0.0.0.0/0"
    echo ""
    echo "설정 후 다시 실행하세요."
    exit 1
fi
echo ""

# 2. 서버 초기 설정 실행
echo "⚙️  서버 초기 설정 실행 중..."
if ssh -F /dev/null -i "$PEM_FILE" -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "test -f ~/setup-server.sh" 2>/dev/null; then
    echo "   서버에 setup-server.sh가 이미 있습니다."
else
    echo "   setup-server.sh 업로드 중..."
    scp -F /dev/null -i "$PEM_FILE" -o StrictHostKeyChecking=no server/setup-server.sh $SERVER_USER@$SERVER_IP:~/ 2>/dev/null || true
fi

ssh -F /dev/null -i "$PEM_FILE" -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'ENDSSH'
    chmod +x ~/setup-server.sh
    ~/setup-server.sh
ENDSSH
echo "✅ 서버 초기 설정 완료"
echo ""

# 3. 프로젝트 파일 업로드
echo "📤 프로젝트 파일 업로드 중..."

# 백엔드 서버 파일 업로드
echo "   백엔드 서버 업로드 중..."
ssh -F /dev/null -i "$PEM_FILE" -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "mkdir -p $PROJECT_DIR/server" 2>/dev/null
scp -F /dev/null -i "$PEM_FILE" -o StrictHostKeyChecking=no -r server/* $SERVER_USER@$SERVER_IP:$PROJECT_DIR/server/ 2>/dev/null

# 프론트엔드 파일 업로드
echo "   프론트엔드 소스 업로드 중..."
ssh -F /dev/null -i "$PEM_FILE" -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "mkdir -p $PROJECT_DIR/Plarform_v1" 2>/dev/null
scp -F /dev/null -i "$PEM_FILE" -o StrictHostKeyChecking=no -r Plarform_v1/* $SERVER_USER@$SERVER_IP:$PROJECT_DIR/Plarform_v1/ 2>/dev/null

# 마이그레이션 파일 업로드
echo "   마이그레이션 파일 업로드 중..."
scp -F /dev/null -i "$PEM_FILE" -o StrictHostKeyChecking=no -r server/migrations $SERVER_USER@$SERVER_IP:$PROJECT_DIR/server/ 2>/dev/null
scp -F /dev/null -i "$PEM_FILE" -o StrictHostKeyChecking=no -r Plarform_v1/supabase/migrations $SERVER_USER@$SERVER_IP:$PROJECT_DIR/Plarform_v1/supabase/ 2>/dev/null || true

echo "✅ 파일 업로드 완료"
echo ""

# 4. 서버에서 배포 실행
echo "🔧 서버에서 배포 실행 중..."
ssh -F /dev/null -i "$PEM_FILE" -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'ENDSSH'
    cd ~/agrisky_platform
    
    # 환경 변수 설정
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    # 1. 데이터베이스 마이그레이션
    echo "📊 데이터베이스 마이그레이션 실행 중..."
    if [ -f server/migrations/create_tables.sql ]; then
        psql -U admin -d agrisky_platform -f server/migrations/create_tables.sql 2>&1 | grep -v "already exists" || true
        echo "✅ 마이그레이션 완료"
    elif [ -f Plarform_v1/supabase/migrations/create_users_and_profiles_2025_11_12_19_03.sql ]; then
        # 기존 마이그레이션 파일 사용 (RLS 정책은 무시)
        psql -U admin -d agrisky_platform -f Plarform_v1/supabase/migrations/create_users_and_profiles_2025_11_12_19_03.sql 2>&1 | grep -v "auth.users" | grep -v "RLS" | grep -v "POLICY" || true
        echo "✅ 마이그레이션 완료"
    else
        echo "⚠️  마이그레이션 파일을 찾을 수 없습니다"
    fi
    echo ""
    
    # 2. 백엔드 서버 설정
    echo "🔧 백엔드 서버 설정 중..."
    cd server
    npm install
    cp .env.example .env 2>/dev/null || true
    
    # .env 파일 수정
    cat > .env << 'ENVFILE'
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agrisky_platform
DB_USER=admin
DB_PASSWORD=admin1234
PORT=3001
NODE_ENV=production
CORS_ORIGIN=http://3.25.181.229
ENVFILE
    
    # TypeScript 빌드
    npm run build 2>/dev/null || true
    
    # PM2로 백엔드 서버 실행
    echo "🚀 백엔드 서버 시작 중..."
    pm2 delete agrisky-backend 2>/dev/null || true
    pm2 start npm --name "agrisky-backend" -- run start 2>/dev/null || pm2 start src/index.ts --name "agrisky-backend" --interpreter tsx
    pm2 save
    echo "✅ 백엔드 서버 실행 완료"
    echo ""
    
    # 3. 프론트엔드 빌드
    echo "🏗️  프론트엔드 빌드 중..."
    cd ../Plarform_v1
    
    # .env.production 파일 생성
    cat > .env.production << 'ENVFILE'
VITE_API_URL=http://3.25.181.229/api
ENVFILE
    
    npm install
    npm run build
    echo "✅ 프론트엔드 빌드 완료"
    echo ""
    
    # 4. Nginx 설정
    echo "🌐 Nginx 설정 중..."
    sudo tee /etc/nginx/conf.d/agrisky.conf > /dev/null << 'NGINXCONF'
upstream backend {
    server localhost:3001;
}

server {
    listen 80;
    server_name 3.25.181.229;

    root /home/ec2-user/agrisky_platform/Plarform_v1/dist;
    index index.html;

    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINXCONF
    
    # ubuntu 사용자인 경우 경로 수정
    if [ "$USER" = "ubuntu" ]; then
        sudo sed -i 's|/home/ec2-user|/home/ubuntu|g' /etc/nginx/conf.d/agrisky.conf
    fi
    
    sudo nginx -t
    sudo systemctl restart nginx
    echo "✅ Nginx 설정 완료"
    echo ""
    
    echo "=========================================="
    echo "✅ 배포 완료!"
    echo "=========================================="
    echo ""
    echo "📊 서비스 상태:"
    pm2 status
    echo ""
    echo "🌐 접속 URL:"
    echo "   http://3.25.181.229"
    echo ""
ENDSSH

echo ""
echo "=========================================="
echo "🎉 배포 완료!"
echo "=========================================="
echo ""
echo "✅ 서비스가 실행 중입니다:"
echo "   http://3.25.181.229"
echo ""
echo "📊 서버 상태 확인:"
echo "   ssh -i $PEM_FILE $SERVER_USER@$SERVER_IP 'pm2 status'"
echo ""

