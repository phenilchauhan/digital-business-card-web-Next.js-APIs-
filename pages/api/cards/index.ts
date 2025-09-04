// pages/api/cards/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';
import { v4 as uuidv4 } from 'uuid';

function mapRowToCard(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    profile: row.profile ?? {
      firstName: '',
      lastName: '',
      photo: '',
      designation: '',
      phone: '',
      email: '',
    },
    business: row.business ?? { company: '', role: '', services: [] },
    social: row.social ?? { linkedin: '', twitter: '', instagram: '', facebook: '', website: '' },
    about: row.about ?? { bio: '', experience: '' },
    cta: row.cta ?? { call: '', whatsapp: '', email: '', website: '' },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const userId = String(req.query.userId || '');
      const { rows } = await pool.query(
        'SELECT * FROM cards WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      res.status(200).json(rows.map(mapRowToCard));
      return;
    }

    if (req.method === 'POST') {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: 'userId required' });

      const id = uuidv4();
      const defaultProfile = { firstName: '', lastName: '', photo: '', designation: '', phone: '', email: '' };
      const business = { company: '', role: '', services: [] };
      const social = { linkedin: '', twitter: '', instagram: '', facebook: '', website: '' };
      const about = { bio: '', experience: '' };
      const cta = { call: '', whatsapp: '', email: '', website: '' };

      await pool.query(
        `INSERT INTO cards (id, user_id, profile, business, social, about, cta)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [id, userId, defaultProfile, business, social, about, cta]
      );

      const { rows } = await pool.query('SELECT * FROM cards WHERE id = $1', [id]);
      res.status(201).json(mapRowToCard(rows[0]));
      return;
    }

    res.setHeader('Allow', 'GET, POST');
    res.status(405).end('Method Not Allowed');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
