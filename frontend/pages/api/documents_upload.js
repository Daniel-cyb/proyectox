const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Inicializamos la app de Express
const app = express();

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Endpoint para subir un archivo
app.post('/upload', upload.single('document'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No se subió ningún archivo');
    }
    res.send(`Archivo ${req.file.originalname} subido correctamente y guardado como ${req.file.filename}`);
});

// Endpoint para listar archivos subidos
app.get('/documents', (req, res) => {
    const directoryPath = path.join(__dirname, 'uploads');
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send('No se pudieron listar los archivos');
        }
        res.json(files);
    });
});

// Servidor escuchando en el puerto 3051
const PORT = 3051;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
