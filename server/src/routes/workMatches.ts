import express from 'express';
import { pool, TABLE_NAMES } from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          wm.*,
          up.full_name as operator_name,
          d.model as drone_model
        FROM ${TABLE_NAMES.WORK_MATCHES} wm
        LEFT JOIN ${TABLE_NAMES.USER_PROFILES} up ON wm.operator_id = up.id
        LEFT JOIN ${TABLE_NAMES.DRONES} d ON wm.drone_id = d.id
        ORDER BY wm.created_at DESC
      `);

      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('작업 매칭 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { work_request_id, operator_id, drone_id, estimated_duration_minutes, estimated_cost_krw, match_score } = req.body;
    
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        INSERT INTO ${TABLE_NAMES.WORK_MATCHES} 
        (work_request_id, operator_id, drone_id, estimated_duration_minutes, estimated_cost_krw, match_score)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [work_request_id, operator_id, drone_id, estimated_duration_minutes, estimated_cost_krw, match_score]);

      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('작업 매칭 생성 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        UPDATE ${TABLE_NAMES.WORK_MATCHES}
        SET status = 'accepted', updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: '매칭을 찾을 수 없습니다' });
      }

      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('작업 매칭 승인 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

