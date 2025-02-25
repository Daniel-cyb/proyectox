const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3005;

// Middleware para parsear el cuerpo de las solicitudes como JSON
app.use(bodyParser.json());

// Configurar CORS para permitir todas las solicitudes
app.use(cors());

app.post('/check_blacklist', async (req, res) => {
    const ip = req.body.ip;
    console.log('IP recibida:', ip);
    
    if (!ip) {
        console.error('No se proporcionó IP');
        return res.status(400).json({ error: 'No IP provided' });
    }

    try {
        const response = await axios.post('https://threatfox-api.abuse.ch/api/v1/', {
            query: "search_ioc",
            search_term: ip
        });

        if (response.data.query_status !== 'ok') {
            console.error('Consulta a ThreatFox fallida:', response.data);
            return res.status(400).json({ error: 'ThreatFox query failed', details: response.data });
        }

        res.json(response.data);
    } catch (error) {
        console.error('Error al obtener datos de ThreatFox:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
