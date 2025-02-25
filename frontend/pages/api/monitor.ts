import { NextApiRequest, NextApiResponse } from 'next';
import prismadb from '@/lib/prismadb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    if (method === 'POST') {
      // Crear un nuevo objetivo
      const { username, domain, email } = req.body;

      if (!username) {
        return res.status(400).json({ success: false, error: 'El nombre de la marca es requerido' });
      }

      const newBrand = await prismadb.brandingMonitoring.create({
        data: {
          brandName: username,
          domain: domain || '',
          userId: 'user-id-example', // Reemplaza con el ID del usuario autenticado
          createdAt: new Date(),
        },
      });

      return res.status(200).json({ success: true, message: 'Monitoreo iniciado', data: newBrand });
    }

    if (method === 'PUT') {
      // Modificar un objetivo existente
      const { id, username, domain, vipName } = req.body;

      if (!id) {
        return res.status(400).json({ success: false, error: 'El ID del objetivo es requerido' });
      }

      const updatedBrand = await prismadb.brandingMonitoring.update({
        where: { id },
        data: {
          ...(username && { brandName: username }), // Solo actualiza si está presente
          ...(domain && { domain }),
          ...(vipName && { vipName }),
        },
      });

      return res.status(200).json({ success: true, message: 'Objetivo actualizado correctamente', data: updatedBrand });
    }

    if (method === 'DELETE') {
      // Eliminar un objetivo existente
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ success: false, error: 'El ID del objetivo es requerido' });
      }

      const target = await prismadb.brandingMonitoring.findUnique({ where: { id } });
      if (!target) {
        return res.status(404).json({ success: false, error: 'El objetivo no fue encontrado' });
      }

      await prismadb.brandingMonitoring.delete({ where: { id } });

      return res.status(200).json({ success: true, message: 'Objetivo eliminado correctamente' });
    }

    // Método no permitido
    return res.status(405).json({ success: false, error: 'Método no permitido' });
  } catch (error) {
    console.error('Error en la API:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}
