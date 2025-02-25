const express = require('express');
const cors = require('cors');
const { Client } = require('@opensearch-project/opensearch');
const app = express();
const port = 3026; // Asegúrate de que el puerto sea el correcto

app.use(express.json());

// Habilitar CORS
app.use(cors({
  origin: 'http://localhost:3000', // Permitir solicitudes desde el frontend en el puerto 3000
}));

const client = new Client({
  node: 'https://localhost:9201',
  auth: {
    username: 'admin',
    password: 'Soporte18*'
  },
  ssl: {
    rejectUnauthorized: false
  }
});

// Ruta para buscar controles (traer todos los documentos o una cantidad especificada)
app.get('/api/search', async (req, res) => {
  try {
    const { size = 1000 } = req.query; // Permite pasar un tamaño personalizado por query
    const { body } = await client.search({
      index: 'soa_iso_27001',
      body: {
        query: {
          match_all: {}
        },
        size: parseInt(size) // Define cuántos registros traer (por defecto trae 1000)
      }
    });
    res.json(body);
  } catch (error) {
    console.error('Error buscando datos:', error);
    res.status(500).json({ error: 'Error buscando datos' });
  }
});

// Ruta para actualizar el estado de cumplimiento
app.post('/api/update/:id', async (req, res) => {
  const { id } = req.params;
  const { 'Implementado SI / NO': implementado, Aplica, 'Justificación de la inclusión o exclusión': justificacion, 'Soporte/Evidencia': soporte } = req.body;

  try {
    // Actualizar el documento en OpenSearch
    await client.update({
      index: 'soa_iso_27001',
      id: id,
      body: {
        doc: {
          'Implementado SI / NO': implementado,
          Aplica: Aplica,
          'Justificación de la inclusión o exclusión': justificacion,
          'Soporte/Evidencia': soporte
        }
      }
    });
    res.send('Estado actualizado');
  } catch (error) {
    console.error('Error actualizando el documento:', error);
    res.status(500).json({ error: 'Error actualizando el documento' });
  }
});

app.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`);
});
