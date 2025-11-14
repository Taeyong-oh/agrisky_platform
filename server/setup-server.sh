#!/bin/bash

set -e

echo "=========================================="
echo "🚀 AgriSky Platform 서버 초기 설정"
echo "=========================================="
echo ""

# 시스템 정보 확인
echo "📋 시스템 정보:"
cat /etc/os-release | grep PRETTY_NAME
echo ""

# 1. 시스템 업데이트
echo "📦 시스템 패키지 업데이트 중..."
if [ -f /etc/redhat-release ]; then
    # Amazon Linux / CentOS
    sudo yum update -y
    PKG_MANAGER="yum"
else
    # Ubuntu / Debian
    sudo apt-get update -y
    sudo apt-get upgrade -y
    PKG_MANAGER="apt-get"
fi
echo "✅ 업데이트 완료"
echo ""

# 2. Node.js 설치
echo "📦 Node.js 설치 중..."
if ! command -v node &> /dev/null; then
    # NVM 설치
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    # Node.js 20 설치
    nvm install 20
    nvm use 20
    nvm alias default 20
    
    # .bashrc에 추가
    echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
    echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
    echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> ~/.bashrc
    
    echo "✅ Node.js $(node --version) 설치 완료"
else
    echo "✅ Node.js 이미 설치됨: $(node --version)"
fi
echo ""

# 3. PostgreSQL 설치
echo "📦 PostgreSQL 설치 중..."
if ! command -v psql &> /dev/null; then
    if [ "$PKG_MANAGER" = "yum" ]; then
        # Amazon Linux / RHEL
        if command -v amazon-linux-extras &> /dev/null; then
            sudo amazon-linux-extras install postgresql14 -y
        else
            # RHEL 10 / Amazon Linux 2023
            sudo dnf install -y postgresql postgresql-server postgresql-contrib
        fi
        sudo postgresql-setup --initdb 2>/dev/null || sudo postgresql-setup initdb
    else
        # Ubuntu
        sudo apt-get install postgresql postgresql-contrib -y
    fi
    
    # PostgreSQL 시작 및 자동 시작 설정
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    echo "✅ PostgreSQL 설치 완료"
else
    echo "✅ PostgreSQL 이미 설치됨: $(psql --version)"
fi
echo ""

# 4. PostgreSQL 데이터베이스 설정
echo "🗄️ PostgreSQL 데이터베이스 설정 중..."
sudo -u postgres psql <<EOF || true
-- admin 사용자 생성 (비밀번호: admin1234)
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'admin') THEN
        CREATE USER admin WITH PASSWORD 'admin1234';
        ALTER USER admin CREATEDB;
    END IF;
END
\$\$;

-- 데이터베이스 생성
SELECT 'CREATE DATABASE agrisky_platform OWNER admin'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'agrisky_platform')\gexec

-- 권한 부여
GRANT ALL PRIVILEGES ON DATABASE agrisky_platform TO admin;
\q
EOF

# PostgreSQL 설정 파일 수정 (로컬 접속 허용)
if [ -f /var/lib/pgsql/data/pg_hba.conf ]; then
    sudo sed -i 's/ident$/md5/g' /var/lib/pgsql/data/pg_hba.conf
    sudo systemctl restart postgresql
elif [ -f /etc/postgresql/*/main/pg_hba.conf ]; then
    sudo sed -i 's/peer$/md5/g' /etc/postgresql/*/main/pg_hba.conf
    sudo systemctl restart postgresql
fi

echo "✅ 데이터베이스 설정 완료"
echo ""

# 5. PM2 설치
echo "📦 PM2 설치 중..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo "✅ PM2 설치 완료"
else
    echo "✅ PM2 이미 설치됨: $(pm2 --version)"
fi
echo ""

# 6. Nginx 설치
echo "📦 Nginx 설치 중..."
if ! command -v nginx &> /dev/null; then
    if [ "$PKG_MANAGER" = "yum" ]; then
        sudo yum install nginx -y
    else
        sudo apt-get install nginx -y
    fi
    
    sudo systemctl start nginx
    sudo systemctl enable nginx
    echo "✅ Nginx 설치 완료"
else
    echo "✅ Nginx 이미 설치됨"
fi
echo ""

# 7. 방화벽 설정 (firewalld)
if command -v firewall-cmd &> /dev/null; then
    echo "🔥 방화벽 설정 중..."
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --permanent --add-port=3001/tcp
    sudo firewall-cmd --reload
    echo "✅ 방화벽 설정 완료"
    echo ""
fi

# 8. 작업 디렉토리 생성
echo "📁 작업 디렉토리 생성 중..."
mkdir -p ~/agrisky_platform
cd ~/agrisky_platform
echo "✅ 디렉토리 생성 완료: ~/agrisky_platform"
echo ""

echo "=========================================="
echo "✅ 서버 초기 설정 완료!"
echo "=========================================="
echo ""
echo "📊 설치된 소프트웨어:"
echo "   Node.js: $(node --version 2>/dev/null || echo 'N/A')"
echo "   npm: $(npm --version 2>/dev/null || echo 'N/A')"
echo "   PostgreSQL: $(psql --version 2>/dev/null || echo 'N/A')"
echo "   PM2: $(pm2 --version 2>/dev/null || echo 'N/A')"
echo "   Nginx: $(nginx -v 2>&1 | head -1 || echo 'N/A')"
echo ""
echo "다음 단계:"
echo "1. 프로젝트 파일 업로드"
echo "2. 데이터베이스 마이그레이션 실행"
echo "3. 백엔드 서버 설정 및 실행"
echo "4. 프론트엔드 빌드 및 배포"
echo ""

