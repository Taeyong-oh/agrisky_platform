import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool, TABLE_NAMES } from '../config/database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// JWT 토큰 생성
const generateToken = (userId: string, email: string) => {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// 회원가입
router.post('/signup', async (req, res) => {
  try {
    const { email, password, user_type, full_name, phone, address } = req.body;

    if (!email || !password || !user_type || !full_name) {
      return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
    }

    // 이메일 중복 확인
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: '이미 존재하는 이메일입니다.' });
    }

    // 비밀번호 해시
    const passwordHash = await bcrypt.hash(password, 10);

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 사용자 생성
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, email_verified)
         VALUES ($1, $2, true)
         RETURNING id, email, created_at`,
        [email, passwordHash]
      );

      const userId = userResult.rows[0].id;

      // 프로필 생성
      await client.query(
        `INSERT INTO ${TABLE_NAMES.USER_PROFILES} 
         (user_id, user_type, full_name, phone, address)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, user_type, full_name, phone || null, address || null]
      );

      await client.query('COMMIT');

      // 토큰 생성
      const token = generateToken(userId, email);

      res.status(201).json({
        user: {
          id: userId,
          email: userResult.rows[0].email,
        },
        token,
        message: '회원가입이 완료되었습니다.',
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('회원가입 오류:', error);
    res.status(500).json({ error: error.message || '회원가입 중 오류가 발생했습니다.' });
  }
});

// 로그인
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
    }

    // 사용자 조회
    const userResult = await pool.query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const user = userResult.rows[0];

    // 비밀번호 확인
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 프로필 조회
    const profileResult = await pool.query(
      `SELECT * FROM ${TABLE_NAMES.USER_PROFILES} WHERE user_id = $1`,
      [user.id]
    );

    // 토큰 생성
    const token = generateToken(user.id, user.email);

    res.json({
      user: {
        id: user.id,
        email: user.email,
      },
      profile: profileResult.rows[0] || null,
      token,
      message: '로그인 성공',
    });
  } catch (error: any) {
    console.error('로그인 오류:', error);
    res.status(500).json({ error: error.message || '로그인 중 오류가 발생했습니다.' });
  }
});

// 토큰 검증 미들웨어
export const authenticateToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    
    // 사용자 확인
    const userResult = await pool.query(
      'SELECT id, email FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }

    (req as any).user = userResult.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
  }
};

// 현재 사용자 정보 조회
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;

    // 프로필 조회
    const profileResult = await pool.query(
      `SELECT * FROM ${TABLE_NAMES.USER_PROFILES} WHERE user_id = $1`,
      [userId]
    );

    res.json({
      user: (req as any).user,
      profile: profileResult.rows[0] || null,
    });
  } catch (error: any) {
    console.error('사용자 정보 조회 오류:', error);
    res.status(500).json({ error: error.message || '사용자 정보 조회 중 오류가 발생했습니다.' });
  }
});

export default router;

