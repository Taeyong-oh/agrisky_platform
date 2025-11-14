import express from 'express';
import { pool, TABLE_NAMES } from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          wr.*,
          f.name as farmland_name,
          up.full_name as farmer_name
        FROM ${TABLE_NAMES.WORK_REQUESTS} wr
        LEFT JOIN ${TABLE_NAMES.FARMLANDS} f ON wr.farmland_id = f.id
        LEFT JOIN ${TABLE_NAMES.USER_PROFILES} up ON wr.farmer_id = up.id
        ORDER BY wr.created_at DESC
      `);

      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('작업 요청 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { farmer_id, farmland_id, work_type, scheduled_date, area_to_spray, chemical_type, urgency_level, budget_krw } = req.body;
    
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        INSERT INTO ${TABLE_NAMES.WORK_REQUESTS} 
        (farmer_id, farmland_id, work_type, scheduled_date, area_to_spray, chemical_type, urgency_level, budget_krw)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [farmer_id, farmland_id, work_type, scheduled_date, area_to_spray, chemical_type, urgency_level || 'normal', budget_krw]);

      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('작업 요청 생성 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

