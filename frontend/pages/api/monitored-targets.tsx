import { NextApiRequest, NextApiResponse } from 'next';
import prismadb from '@/lib/prismadb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const targets = await prismadb.brandingMonitoring.findMany();
      res.status(200).json({ targets });
    } catch (error) {
      console.error('Error al obtener los objetivos monitoreados:', error);
      res.status(500).json({ error: 'Error al obtener los objetivos monitoreados.' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
