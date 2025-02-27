import type { NextApiRequest, NextApiResponse } from 'next';
import prismadb from '@/lib/prismadb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { username } = req.body;

    try {
      const newBrand = await prismadb.brandingMonitoring.create({
        data: {
          brandName: username, // Mapea el nombre de la marca a la propiedad correcta
          domain: '', // Asigna un valor si tienes un dominio asociado
          userId: 'user-id-example', // Reemplaza con el ID del usuario adecuado
        },
      });
      res.status(200).json({ success: true, data: newBrand });
    } catch (error) {
      console.error('Error al insertar en la base de datos:', error);
      res.status(500).json({ success: false, message: 'Hubo un error al intentar monitorear la marca o usuario.' });
    }
  } else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}
