#!/bin/bash

# SSL 인증서 설정 스크립트
set -e

SERVER_IP="3.25.181.229"
PEM_FILE="agri_sky.pem"
SERVER_USER="ec2-user"
DOMAIN="agrisky.co.kr"

echo "🔒 SSL 인증서 설정 시작..."

# SSH 옵션
SSH_OPTS="-F /dev/null -i $PEM_FILE -o StrictHostKeyChecking=no"

# DNS 확인
echo "🔍 DNS 설정 확인 중..."
DNS_IP=$(dig +short $DOMAIN | tail -1)

if [ -z "$DNS_IP" ]; then
    echo "❌ 오류: $DOMAIN의 DNS 레코드를 찾을 수 없습니다."
    echo "   도메인 관리 패널에서 다음 A 레코드를 추가하세요:"
    echo "   Type: A, Name: @, Value: $SERVER_IP"
    echo "   Type: A, Name: www, Value: $SERVER_IP"
    exit 1
fi

if [ "$DNS_IP" != "$SERVER_IP" ]; then
    echo "⚠️  경고: DNS가 서버 IP를 가리키지 않습니다."
    echo "   DNS IP: $DNS_IP"
    echo "   서버 IP: $SERVER_IP"
    read -p "계속하시겠습니까? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ DNS 확인 완료: $DOMAIN -> $DNS_IP"

# SSL 인증서 발급
echo "🔒 SSL 인증서 발급 중..."
ssh $SSH_OPTS $SERVER_USER@$SERVER_IP << ENDSSH
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN \
        --non-interactive \
        --agree-tos \
        --email admin@$DOMAIN \
        --redirect \
        --expand
ENDSSH

echo "✅ SSL 인증서 설정 완료!"
echo "🌐 접속: https://$DOMAIN"

