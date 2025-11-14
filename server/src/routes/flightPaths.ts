import express from 'express';
import { pool, TABLE_NAMES } from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          fp.*,
          f.name as farmland_name,
          d.model as drone_model,
          up.full_name as operator_name
        FROM ${TABLE_NAMES.FLIGHT_PATHS} fp
        LEFT JOIN ${TABLE_NAMES.WORK_MATCHES} wm ON fp.work_match_id = wm.id
        LEFT JOIN ${TABLE_NAMES.WORK_REQUESTS} wr ON wm.work_request_id = wr.id
        LEFT JOIN ${TABLE_NAMES.FARMLANDS} f ON wr.farmland_id = f.id
        LEFT JOIN ${TABLE_NAMES.DRONES} d ON wm.drone_id = d.id
        LEFT JOIN ${TABLE_NAMES.USER_PROFILES} up ON wm.operator_id = up.id
        ORDER BY fp.created_at DESC
      `);

      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('비행 경로 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/work-logs', async (req, res) => {
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          wl.*,
          f.name as farmland_name
        FROM ${TABLE_NAMES.WORK_LOGS} wl
        LEFT JOIN ${TABLE_NAMES.WORK_MATCHES} wm ON wl.work_match_id = wm.id
        LEFT JOIN ${TABLE_NAMES.WORK_REQUESTS} wr ON wm.work_request_id = wr.id
        LEFT JOIN ${TABLE_NAMES.FARMLANDS} f ON wr.farmland_id = f.id
        ORDER BY wl.created_at DESC
      `);

      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('작업 로그 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

