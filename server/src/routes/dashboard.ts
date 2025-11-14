import express from 'express';
import { pool, TABLE_NAMES } from '../config/database.js';

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const client = await pool.connect();
    
    try {
      const [
        dronesResult,
        farmlandsResult,
        requestsResult,
        operatorsResult,
        worksResult
      ] = await Promise.all([
        client.query(`SELECT status FROM ${TABLE_NAMES.DRONES}`),
        client.query(`SELECT id FROM ${TABLE_NAMES.FARMLANDS}`),
        client.query(`SELECT * FROM ${TABLE_NAMES.WORK_REQUESTS}`),
        client.query(`SELECT user_type FROM ${TABLE_NAMES.USER_PROFILES} WHERE user_type = $1`, ['operator']),
        client.query(`SELECT completion_status FROM ${TABLE_NAMES.WORK_LOGS} WHERE completion_status = $1`, ['completed'])
      ]);

      const drones = dronesResult.rows;
      const activeDrones = drones.filter(d => d.status === 'available' || d.status === 'in_use').length;
      const pendingRequests = requestsResult.rows.filter(r => r.status === 'pending').length;

      res.json({
        totalDrones: drones.length,
        activeDrones,
        totalFarmlands: farmlandsResult.rows.length,
        pendingRequests,
        completedWorks: worksResult.rows.length,
        totalOperators: operatorsResult.rows.length,
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('대시보드 통계 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/recent-requests', async (req, res) => {
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          wr.id,
          wr.work_type,
          wr.urgency_level,
          wr.scheduled_date,
          wr.status,
          wr.area_to_spray,
          f.name as farmland_name
        FROM ${TABLE_NAMES.WORK_REQUESTS} wr
        LEFT JOIN ${TABLE_NAMES.FARMLANDS} f ON wr.farmland_id = f.id
        ORDER BY wr.created_at DESC
        LIMIT 5
      `);

      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('최근 작업 요청 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

