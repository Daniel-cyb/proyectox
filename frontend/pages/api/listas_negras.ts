import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@opensearch-project/opensearch';

// Configuración del cliente de OpenSearch
const client = new Client({
  node: 'https://localhost:9201', // Cambia esto según la URL de tu OpenSearch
  auth: {
    username: 'admin', // Usuario de OpenSearch
    password: 'Soporte18*' // Contraseña de OpenSearch
  },
  ssl: {
    rejectUnauthorized: false // Ignorar certificados SSL no válidos en entornos locales
  }
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Realiza la consulta al índice listas_negras en OpenSearch
    const response = await client.search({
      index: 'listas_negras', // Nombre del índice
      body: {
        query: {
          match_all: {} // Consulta todos los documentos
        }
      }
    });

    // Devuelve los resultados obtenidos
    const hits = response.body.hits.hits.map((hit: any) => hit._source);
    res.status(200).json(hits);
  } catch (error) {
    console.error('Error en la consulta a OpenSearch:', error);
    res.status(500).json({ message: 'Error al obtener datos de OpenSearch' });
  }
}
