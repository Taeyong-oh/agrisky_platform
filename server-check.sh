#!/bin/bash

SERVER_IP="3.25.181.229"
PEM_FILE="/Users/donghokim/Documents/agrisky_platform/agri_sky.pem"

echo "=========================================="
echo "🔍 AWS EC2 서버 연결 진단"
echo "=========================================="
echo ""

echo "📋 서버 정보:"
echo "   IP: $SERVER_IP"
echo "   PEM: $PEM_FILE"
echo ""

echo "1️⃣  네트워크 연결 확인:"
if ping -c 2 -W 2 $SERVER_IP > /dev/null 2>&1; then
    echo "   ✅ 서버가 응답합니다"
else
    echo "   ⚠️  서버가 ping에 응답하지 않습니다"
    echo "      (ICMP가 차단되었을 수 있음 - 정상일 수 있습니다)"
fi
echo ""

echo "2️⃣  포트 확인:"
for port in 22 80 443 3001; do
    if nc -z -v -w 2 $SERVER_IP $port 2>&1 | grep -q "succeeded"; then
        echo "   ✅ 포트 $port: 열려있음"
    else
        echo "   ❌ 포트 $port: 닫혀있음 또는 타임아웃"
    fi
done
echo ""

echo "3️⃣  SSH 접속 시도:"
if [ -f "$PEM_FILE" ]; then
    chmod 400 "$PEM_FILE"
    echo "   ✅ PEM 파일 확인됨"
    
    # ec2-user로 시도
    if ssh -F /dev/null -i "$PEM_FILE" -o ConnectTimeout=5 -o StrictHostKeyChecking=no ec2-user@$SERVER_IP "echo 'success'" 2>/dev/null; then
        echo "   ✅ ec2-user로 접속 성공!"
        USER="ec2-user"
    # ubuntu로 시도
    elif ssh -F /dev/null -i "$PEM_FILE" -o ConnectTimeout=5 -o StrictHostKeyChecking=no ubuntu@$SERVER_IP "echo 'success'" 2>/dev/null; then
        echo "   ✅ ubuntu로 접속 성공!"
        USER="ubuntu"
    else
        echo "   ❌ SSH 접속 실패"
        echo ""
        echo "   🔧 해결 방법:"
        echo "   1. AWS Console → EC2 → Security Groups 확인"
        echo "   2. 인바운드 규칙에 SSH (포트 22) 추가"
        echo "   3. 소스: 0.0.0.0/0 또는 본인 IP"
        echo "   4. 서버가 실행 중인지 확인 (EC2 인스턴스 상태)"
    fi
else
    echo "   ❌ PEM 파일을 찾을 수 없습니다: $PEM_FILE"
fi
echo ""

echo "=========================================="
echo "📊 진단 완료"
echo "=========================================="
echo ""
echo "💡 다음 단계:"
echo "   1. AWS Console에서 Security Group 확인"
echo "   2. 인바운드 규칙에 포트 22 추가"
echo "   3. 서버 인스턴스 상태 확인 (running인지 확인)"
echo ""

