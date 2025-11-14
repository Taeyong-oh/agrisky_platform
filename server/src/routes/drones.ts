import express from 'express';
import { pool, TABLE_NAMES } from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          d.*,
          up.full_name as operator_name
        FROM ${TABLE_NAMES.DRONES} d
        LEFT JOIN ${TABLE_NAMES.USER_PROFILES} up ON d.operator_id = up.id
        ORDER BY d.created_at DESC
      `);

      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('드론 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { model, max_payload_kg, max_flight_time_minutes, max_speed_kmh, spray_width_meters, status, operator_id } = req.body;
    
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        INSERT INTO ${TABLE_NAMES.DRONES} 
        (model, max_payload_kg, max_flight_time_minutes, max_speed_kmh, spray_width_meters, status, operator_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [model, max_payload_kg, max_flight_time_minutes, max_speed_kmh, spray_width_meters, status || 'available', operator_id]);

      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('드론 생성 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { model, max_payload_kg, max_flight_time_minutes, max_speed_kmh, spray_width_meters, status } = req.body;
    
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        UPDATE ${TABLE_NAMES.DRONES}
        SET model = $1, max_payload_kg = $2, max_flight_time_minutes = $3,
            max_speed_kmh = $4, spray_width_meters = $5, status = $6,
            updated_at = NOW()
        WHERE id = $7
        RETURNING *
      `, [model, max_payload_kg, max_flight_time_minutes, max_speed_kmh, spray_width_meters, status, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: '드론을 찾을 수 없습니다' });
      }

      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('드론 수정 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        DELETE FROM ${TABLE_NAMES.DRONES}
        WHERE id = $1
        RETURNING id
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: '드론을 찾을 수 없습니다' });
      }

      res.json({ message: '드론이 삭제되었습니다', id: result.rows[0].id });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('드론 삭제 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

