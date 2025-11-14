import express from 'express';
import { pool, TABLE_NAMES } from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          f.*,
          up.full_name as farmer_name
        FROM ${TABLE_NAMES.FARMLANDS} f
        LEFT JOIN ${TABLE_NAMES.USER_PROFILES} up ON f.farmer_id = up.id
        ORDER BY f.created_at DESC
      `);

      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('농지 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, location_lat, location_lng, area_hectares, crop_type, soil_type, farmer_id } = req.body;
    
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        INSERT INTO ${TABLE_NAMES.FARMLANDS} 
        (name, location_lat, location_lng, area_hectares, crop_type, soil_type, farmer_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [name, location_lat, location_lng, area_hectares, crop_type, soil_type, farmer_id]);

      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('농지 생성 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location_lat, location_lng, area_hectares, crop_type, soil_type } = req.body;
    
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        UPDATE ${TABLE_NAMES.FARMLANDS}
        SET name = $1, location_lat = $2, location_lng = $3, 
            area_hectares = $4, crop_type = $5, soil_type = $6,
            updated_at = NOW()
        WHERE id = $7
        RETURNING *
      `, [name, location_lat, location_lng, area_hectares, crop_type, soil_type, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: '농지를 찾을 수 없습니다' });
      }

      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('농지 수정 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        DELETE FROM ${TABLE_NAMES.FARMLANDS}
        WHERE id = $1
        RETURNING id
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: '농지를 찾을 수 없습니다' });
      }

      res.json({ message: '농지가 삭제되었습니다', id: result.rows[0].id });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('농지 삭제 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

