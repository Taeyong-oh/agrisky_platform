#!/bin/bash

# 자동 배포 스크립트
# Security Group이 열리면 자동으로 배포 실행

SERVER_IP="3.25.181.229"
PEM_FILE="agri_sky.pem"
MAX_RETRIES=30
RETRY_INTERVAL=10

echo "=========================================="
echo "🔄 자동 배포 대기 중..."
echo "=========================================="
echo ""
echo "Security Group 설정을 확인하고 있습니다..."
echo "포트 22가 열릴 때까지 대기합니다..."
echo ""

# Security Group이 열릴 때까지 대기
for i in $(seq 1 $MAX_RETRIES); do
    echo "[$i/$MAX_RETRIES] SSH 포트 확인 중..."
    
    if nc -z -v -w 2 $SERVER_IP 22 2>&1 | grep -q "succeeded"; then
        echo "✅ SSH 포트가 열렸습니다!"
        echo ""
        break
    fi
    
    if [ $i -eq $MAX_RETRIES ]; then
        echo "❌ 타임아웃: SSH 포트가 열리지 않았습니다"
        echo ""
        echo "⚠️  Security Group 설정을 확인하세요:"
        echo "   1. AWS Console → EC2 → Security Groups"
        echo "   2. default 보안 그룹 → 인바운드 규칙 편집"
        echo "   3. SSH (포트 22) 추가: 소스 0.0.0.0/0"
        echo ""
        echo "설정 후 다시 실행하세요:"
        echo "   ./auto-deploy.sh"
        exit 1
    fi
    
    sleep $RETRY_INTERVAL
done

# 배포 실행
echo "🚀 배포 시작..."
./deploy.sh

