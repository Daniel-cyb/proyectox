const express = require('express');
const cors = require('cors');
const { Client } = require('@opensearch-project/opensearch');

const app = express();

// Middleware para CORS y JSON
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Configuración del cliente de OpenSearch
const client = new Client({
  node: 'https://localhost:9201',
  auth: {
    username: 'admin',
    password: 'Soporte18*'
  },
  ssl: {
    rejectUnauthorized: false // Desactivar verificación de certificados SSL
  }
});

// Endpoint para búsqueda semántica en OpenSearch
app.post('/api/search', async (req, res) => {
  try {
    const { embeddings } = req.body;

    if (!embeddings) {
      return res.status(400).json({ error: 'Embeddings no proporcionados' });
    }

    // Realizar la búsqueda KNN en OpenSearch
    const { body } = await client.search({
      index: 'documents_index',
      size: 5,
      body: {
        query: {
          knn: {
            content_vector: {
              vector: embeddings,
              k: 5
            }
          }
        }
      }
    });

    // Procesar los resultados
    const results = body.hits.hits.map(hit => ({
      document: hit._source.content,
      score: hit._score
    }));

    res.json({ results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al realizar la búsqueda' });
  }
});

// Iniciar el servicio en el puerto 5002
const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Servicio de Búsqueda corriendo en http://localhost:${PORT}`);
});
