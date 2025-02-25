// Ruta: C:\Users\Daniel Lopez\Documents\devsecops\React\proyectox\frontend\pages\api\scrape-twitter.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { brand } = req.body;

    try {
      // Ejecuta el script de scraping con el término de búsqueda
      const scriptPath = path.join(process.cwd(), 'C:\Users\Daniel Lopez\Documents\devsecops\React\proyectox\frontend\twitter.py');
      exec(`python ${scriptPath} ${brand}`, (error, stdout, stderr) => {
        if (error) {
          console.error('Error al ejecutar el script:', error);
          return res.status(500).json({ error: 'Error al ejecutar el script.' });
        }

        // Leer el archivo CSV o procesar la salida si es necesario
        const csvPath = 'C:/Users/Daniel Lopez/Documents/devsecops/Python/twitter/tweets.csv';
        if (fs.existsSync(csvPath)) {
          const csvData = fs.readFileSync(csvPath, 'utf-8');
          return res.status(200).json({ message: 'Scraping completo', data: csvData });
        } else {
          return res.status(500).json({ error: 'No se encontraron resultados.' });
        }
      });
    } catch (error) {
      console.error('Error al realizar el scraping:', error);
      res.status(500).json({ error: 'Error al realizar el scraping.' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
