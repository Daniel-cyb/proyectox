import { Client } from '@opensearch-project/opensearch';

// Configuración de OpenSearch
const client = new Client({
  node: 'https://localhost:9201', // URL de tu nodo OpenSearch
  auth: {
    username: 'admin', // Tus credenciales
    password: 'Soporte18*',
  },
  ssl: {
    rejectUnauthorized: false, // Cambia esto según tu entorno
  },
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const response = await client.search({
      index: 'tweets_sentimientos',
      body: {
        size: 1000,  // Aumenta el límite a 1000 resultados
        query: {
          match_all: {}, // Esto replicará la búsqueda de todos los documentos en el índice
        },
      },
    });

    // Procesa los resultados para obtener los datos relevantes, incluyendo los nuevos campos
    const hits = response.body.hits.hits.map((hit) => ({
      tweet_id: hit._source.tweet_id,
      twitter_link: hit._source.twitter_link,
      user_handle: hit._source.user_handle,
      text: hit._source.text,
      date: hit._source.date,
      likes: hit._source.likes,
      comments: hit._source.comments,
      sentiment: hit._source.sentiment,
      score: hit._source.score,
      brand: hit._source.brand || 'N/A', // Campo nuevo agregado
      valencia: hit._source.valencia || 'N/A', // Nuevo campo
      tono: hit._source.tono || 'N/A', // Nuevo campo
      intensidad: hit._source.intensidad || 'N/A', // Nuevo campo
      proposito: hit._source.proposito || 'N/A', // Nuevo campo
      contextualizacion: hit._source.contextualizacion || 'N/A', // Nuevo campo
    }));

    // Devuelve los resultados en formato JSON
    res.status(200).json(hits);
  } catch (error) {
    console.error('Error fetching data from OpenSearch:', error);
    res.status(500).json({ error: 'Error fetching data from OpenSearch', details: error.message });
  }
}
