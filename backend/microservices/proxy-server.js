const https = require('https');
const httpProxy = require('http-proxy');
const cors = require('cors');
const express = require('express');
const fs = require('fs');
const path = require('path');
const base64 = require('base-64');
const crypto = require('crypto');

const app = express();
const proxy = httpProxy.createProxyServer({
  secure: false, // Ignora la verificación del certificado TLS (solo para desarrollo)
  changeOrigin: true
});

// Configura CORS para permitir todos los orígenes
app.use(cors());

// Nombre de usuario y contraseña para autenticación básica
const username = 'admin';
const password = 'Soporte18*';
const authHeader = 'Basic ' + base64.encode(username + ':' + password);

// Middleware para generar y agregar el nonce a CSP y Autenticación Básica
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;
  res.setHeader("Content-Security-Policy", `script-src 'self' 'nonce-${nonce}';`);
  req.headers['Authorization'] = authHeader;
  next();
});

// Redirigir todas las solicitudes a través del proxy
app.use((req, res) => {
  //const target = 'http://127.0.0.1:5601'; // OpenSearch usando HTTP
  //const target = 'http://localhost:5601'; // OpenSearch Dashboards usando HTTP
  const target = 'http://opensearch-dashboards:5601'; // OpenSearch Dashboards usando el nombre del servicio en Docker Compose


  
  proxy.web(req, res, { target: target }, (error) => {
    console.error('Error en el proxy:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Algo salió mal. Verifica los logs del servidor.');
  });
});

// Opciones HTTPS
const options = {
  key: fs.readFileSync(path.resolve(__dirname, 'server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, 'server.cert'))
};

// Escuchar en el puerto 5019 con HTTPS
const server = https.createServer(options, app);
server.listen(5019, () => {
  console.log('Proxy server escuchando en el puerto 5019');
});
