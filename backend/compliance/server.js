const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

app.get('/uploads', (req, res) => {
  const uploadPath = path.join(__dirname, 'uploads');
  
  fs.readdir(uploadPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error al leer los archivos' });
    }
    res.json(files);
  });
});

app.post('/upload', upload.array('documents'), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No se subió ningún archivo');
  }
  res.send('Archivos subidos correctamente');
});

const PORT = 3052;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
