// 데모 계정 생성 스크립트
import bcrypt from 'bcryptjs';
import { pool, TABLE_NAMES } from '../config/database.js';

const demoAccounts = [
  {
    email: 'farmer@demo.com',
    password: 'demo123456',
    user_type: 'farmer',
    full_name: '김농부 (데모)',
    phone: '010-1234-5678',
    address: '경기도 이천시 마장면',
  },
  {
    email: 'operator@demo.com',
    password: 'demo123456',
    user_type: 'operator',
    full_name: '최드론 (데모)',
    phone: '010-4567-8901',
    address: '경기도 수원시 영통구',
  },
  {
    email: 'admin@admin.com',
    password: 'admin1234',
    user_type: 'operator',
    full_name: '관리자',
    phone: '010-0000-0000',
    address: '시스템 관리자',
  },
];

async function createDemoAccounts() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const account of demoAccounts) {
      // 기존 사용자 확인
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [account.email]
      );

      if (existingUser.rows.length > 0) {
        console.log(`✅ ${account.email} 계정이 이미 존재합니다.`);
        continue;
      }

      // 비밀번호 해시
      const passwordHash = await bcrypt.hash(account.password, 10);

      // 사용자 생성
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, email_verified)
         VALUES ($1, $2, true)
         RETURNING id, email`,
        [account.email, passwordHash]
      );

      const userId = userResult.rows[0].id;

      // 프로필 생성
      await client.query(
        `INSERT INTO ${TABLE_NAMES.USER_PROFILES} 
         (user_id, user_type, full_name, phone, address)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, account.user_type, account.full_name, account.phone, account.address]
      );

      console.log(`✅ ${account.email} 계정 생성 완료`);
    }

    await client.query('COMMIT');
    console.log('\n✅ 모든 데모 계정 생성 완료!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 계정 생성 중 오류:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createDemoAccounts().catch(console.error);

