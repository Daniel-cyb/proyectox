// server.js (o tu archivo principal del backend)
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Ruta donde están los documentos
const documentsPath = 'C:/Users/Daniel Lopez/Documents/devsecops/sgsi';

// API para obtener la lista de archivos
app.get('/api/documents', (req, res) => {
  fs.readdir(documentsPath, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading directory' });
    }

    // Filtra solo los archivos (puedes agregar más lógica si lo necesitas)
    const documents = files.map((file, index) => ({
      id: index + 1,
      name: file,
      status: "Available" // Puedes cambiar el estado si tienes más información
    }));

    res.json(documents);
  });
});

// Inicializar el servidor
app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
