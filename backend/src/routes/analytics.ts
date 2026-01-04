import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

router.post('/visitor', async (req: Request, res: Response) => {
  const { visitor_id } = req.body;

  if (!visitor_id) {
    return res.status(400).json({ message: 'visitor_id required' });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO visitors (id)
      VALUES ($1)
      ON CONFLICT (id)
      DO UPDATE SET last_seen_at = NOW()
      RETURNING (xmax = 0) AS is_new_visit;
      `,
      [visitor_id]
    );

    res.json({
      message: 'success count',
      data: { is_new_visit: result.rows[0].is_new_visit },
      meta: {},
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'server error' });
  }
});

export default router;
