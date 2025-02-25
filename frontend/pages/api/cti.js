import { Client } from '@opensearch-project/opensearch';

// Configuración de OpenSearch
const client = new Client({
  node: 'https://localhost:9201', // URL de tu nodo OpenSearch
  auth: {
    username: 'admin', // Tus credenciales de OpenSearch
    password: 'Soporte18*',
  },
  ssl: {
    rejectUnauthorized: false, // Cambia esto según tu entorno
  },
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const response = await client.search({
        index: 'cti_stix2', // El índice en OpenSearch
        body: {
          size: 1000, // Número máximo de resultados a devolver
          query: {
            match_all: {}, // Obtén todos los documentos
          },
        },
      });

      // Procesa los resultados para obtener solo los campos relevantes
      const hits = response.body.hits.hits.map((hit) => ({
        id: hit._id,
        threat_actor_id: hit._source['Threat Actor ID'] || null,
        threat_actor_name: hit._source['Threat Actor Name'] || null,
        threat_actor_description: hit._source['Threat Actor Description'] || null,
        confidence: hit._source['Confidence'] || null,
        indicator_id: hit._source['Indicator ID'] || null,
        indicator_pattern: hit._source['Indicator Pattern'] || null,
        Indicator_Type: hit._source['Indicator Type'] || null,
        ioc: hit._source['IOC'] || null,
        labels: [
          hit._source['Label_1'],
          hit._source['Label_2'],
          hit._source['Label_3'],
          hit._source['Label_4'],
          hit._source['Label_5'],
          hit._source['Label_6'],
          hit._source['Label_7'],
          hit._source['Label_8'],
          hit._source['Label_9'],
        ].filter(Boolean), // Filtra etiquetas vacías o nulas
        timestamp: hit._source['Timestamp'] || null,
      }));

      // Envía los resultados en formato JSON
      res.status(200).json(hits);
    } catch (error) {
      console.error('Error al obtener los datos desde OpenSearch:', error);
      res
        .status(500)
        .json({ error: 'Error al obtener los datos desde OpenSearch', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Método ${req.method} no permitido`);
  }
}
