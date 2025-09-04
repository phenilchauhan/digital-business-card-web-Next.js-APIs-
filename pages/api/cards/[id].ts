// pages/api/cards/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

function mapRowToCard(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    profile: row.profile ?? {},
    business: row.business ?? {},
    social: row.social ?? {},
    about: row.about ?? {},
    cta: row.cta ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  try {
    if (req.method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM cards WHERE id = $1', [id]);
      if (!rows[0]) return res.status(404).json({ error: 'Card not found' });
      return res.status(200).json(mapRowToCard(rows[0]));
    }

    if (req.method === 'PUT') {
      const card = req.body;
      // Expect the full card payload (profile, business, social, about, cta)
      await pool.query(
        `UPDATE cards SET profile = $1, business = $2, social = $3, about = $4, cta = $5 WHERE id = $6`,
        [card.profile, card.business, card.social, card.about, card.cta, id]
      );

      const { rows } = await pool.query('SELECT * FROM cards WHERE id = $1', [id]);
      return res.status(200).json(mapRowToCard(rows[0]));
    }

    if (req.method === 'DELETE') {
      await pool.query('DELETE FROM cards WHERE id = $1', [id]);
      return res.status(204).end();
    }

    res.setHeader('Allow', 'GET, PUT, DELETE');
    res.status(405).end('Method Not Allowed');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
