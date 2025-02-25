const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Client } = require('@opensearch-project/opensearch');

const app = express();

app.use(cors());
app.use(express.json());

// Configuración del cliente de OpenSearch
const client = new Client({
  node: 'https://localhost:9201',
  auth: {
    username: 'admin',
    password: 'Soporte18*' // Reemplaza con tu contraseña o utiliza una variable de entorno
  },
  ssl: {
    rejectUnauthorized: false // Desactivar verificación de certificados SSL
  }
});

// Endpoint para procesar la entrada del usuario y generar la respuesta
app.post('/api/consulta', async (req, res) => {
  try {
    const { entrada_usuario } = req.body;

    if (!entrada_usuario || typeof entrada_usuario !== 'string') {
      return res.status(400).json({ error: 'La entrada del usuario es inválida' });
    }

    console.log('Progreso: 0% - Iniciando proceso...');

    // Buscar en OpenSearch en ambos índices
    const context_logs = await buscarEnOpenSearch(entrada_usuario, 'opensearch_dashboards_sample_data_logs');
    const context_lista_negra = await buscarEnOpenSearch(entrada_usuario, 'lista_negra');

    // Verificar si se obtuvieron fragmentos relevantes
    if (!context_logs && !context_lista_negra) {
      return res.status(200).json({ mensaje: 'No se encontraron fragmentos relevantes en ninguno de los índices.' });
    } else {
      console.log('Progreso: 70% - Contexto extraído de OpenSearch en ambos índices.');

      // Definir la pregunta del usuario
      const user_query = `Analiza los datos encontrados en los índices 'opensearch_dashboards_sample_data_logs' y 'lista_negra'. 
      ¿Cuántas veces aparece la dirección '${entrada_usuario}'? Si aparece en el índice 'lista_negra', indica que está en riesgo y si se recomienda bloqueo.`;

      // Crear el prompt combinando el contexto con la pregunta del usuario
      const prompt = `Usa el siguiente contexto para responder a la pregunta.
      Contexto índice 'opensearch_dashboards_sample_data_logs':\n${context_logs}
      Contexto índice 'lista_negra':\n${context_lista_negra}
      
      Pregunta: ${user_query}\nRespuesta:`;

      console.log('Progreso: 80% - Invocando a LLaMA para generar la respuesta...');
      const llama_start_time = Date.now();

      try {
        // Invocar a LLaMA utilizando axios
        const response = await axios.post('http://127.0.0.1:11434/generate', {
          model: 'llama2',
          prompt: prompt
        });

        const llama_time = (Date.now() - llama_start_time) / 1000;
        console.log(`Progreso: 90% - Respuesta generada por LLaMA en ${llama_time.toFixed(2)} segundos`);

        // La respuesta puede venir en response.data
        const response_llama = response.data;

        // Enviar la respuesta al cliente
        console.log('Progreso: 100% - Respuesta generada por LLaMA 3');
        res.json({ respuesta: response_llama });
      } catch (error) {
        console.error(`Error al invocar a LLaMA: ${error.message}`);
        res.status(500).json({ error: 'Error al invocar al modelo LLaMA' });
      }
    }
  } catch (error) {
    console.error('Error en el proceso:', error.message);
    res.status(500).json({ error: 'Error en el procesamiento de la solicitud' });
  }
});

// Función para realizar la consulta en OpenSearch
async function buscarEnOpenSearch(entrada_usuario, indice) {
  console.log(`Progreso: Iniciando búsqueda en OpenSearch para el índice ${indice}...`);

  // Limitar a 10 resultados para mejorar el rendimiento
  const query = {
    size: 10,
    query: {
      match: {
        message: entrada_usuario // Buscar el texto proporcionado por el usuario
      }
    },
    highlight: {
      fields: {
        message: {} // Resaltar el campo "message" en los resultados
      }
    }
  };

  try {
    const start_time = Date.now();
    const response = await client.search({
      index: indice,
      body: query
    });
    const search_time = (Date.now() - start_time) / 1000;
    console.log(`Búsqueda en OpenSearch para el índice ${indice} completada en ${search_time.toFixed(2)} segundos`);

    // Extraer los textos con highlighting o el mensaje completo si no hay highlight
    const hits = response.body.hits.hits;
    const relevant_texts = hits.map(hit => {
      if (hit.highlight && hit.highlight.message) {
        return hit.highlight.message[0];
      } else {
        return hit._source.message;
      }
    });

    if (relevant_texts.length > 0) {
      console.log(`Se encontraron ${relevant_texts.length} resultados en el índice ${indice}:`);
      relevant_texts.forEach((text, idx) => {
        console.log(`Resultado ${idx + 1}: ${text.slice(0, 200)}...`); // Mostrar primeros 200 caracteres
      });
    } else {
      console.log(`No se encontraron resultados en el índice ${indice}.`);
    }

    // Combinar los textos destacados en un solo contexto
    let context = relevant_texts.join('\n');

    // Limitar el tamaño del contexto a 2000 caracteres
    context = context.slice(0, 2000);

    return context;
  } catch (error) {
    console.error(`Error al buscar en OpenSearch en el índice ${indice}: ${error.message}`);
    return '';
  }
}

// Iniciar el servidor
const PORT = 5011;
app.listen(PORT, () => {
  console.log(`Servicio de embeddings corriendo en http://localhost:${PORT}`);
});
