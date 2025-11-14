import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'agrisky_platform',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin1234',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL 데이터베이스 연결 성공');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL 연결 오류:', err);
  process.exit(-1);
});

export const TABLE_NAMES = {
  USER_PROFILES: 'user_profiles_2025_11_12_19_03',
  FARMLANDS: 'farmlands_2025_11_12_19_03',
  DRONES: 'drones_2025_11_12_19_03',
  WORK_REQUESTS: 'work_requests_2025_11_12_19_03',
  WORK_MATCHES: 'work_matches_2025_11_12_19_03',
  FLIGHT_PATHS: 'flight_paths_2025_11_12_19_03',
  WORK_LOGS: 'work_logs_2025_11_12_19_03',
} as const;

