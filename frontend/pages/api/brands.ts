// Ruta: C:\Users\Daniel Lopez\Documents\devsecops\React\proyectox\frontend\pages\api\brands.ts

import { NextApiRequest, NextApiResponse } from 'next';
import prismadb from '@/lib/prismadb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const brands = await prismadb.brandingMonitoring.findMany();
      res.status(200).json(brands);
    } catch (error) {
      console.error('Error al obtener las marcas:', error);
      res.status(500).json({ error: 'Error al obtener las marcas.' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
