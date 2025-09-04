// pages/api/cards/upload/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import pool from '../../../../lib/db';

export const config = {
  api: {
    bodyParser: false, // let formidable handle it
  },
};

const UPLOAD_DIR = path.join(process.cwd(), '/public/uploads');

async function parseForm(req: NextApiRequest): Promise<{ fields: any; files: any }> {
  const form = new formidable.IncomingForm({
    multiples: false,
    uploadDir: UPLOAD_DIR,
    keepExtensions: true,
  });

  // ensure upload dir exists
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  return new Promise((resolve, reject) => {
    form.parse(req as any, (err: any, fields: any, files: any) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { files } = await parseForm(req);

    const file = files.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    // In some versions of formidable, path is file.filepath or file.path
    const filepath = file.filepath ?? file.path;
    const filename = path.basename(filepath);
    const fileUrl = `/uploads/${filename}`;

    // fetch existing profile, update photo and save full profile JSON
    const { rows } = await pool.query('SELECT profile FROM cards WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Card not found' });

    const profile = rows[0].profile ?? {};
    profile.photo = fileUrl;

    await pool.query('UPDATE cards SET profile = $1 WHERE id = $2', [profile, id]);

    return res.status(200).json({ url: fileUrl });
  } catch (err) {
    console.error('upload error', err);
    res.status(500).json({ error: 'Upload failed' });
  }
}
