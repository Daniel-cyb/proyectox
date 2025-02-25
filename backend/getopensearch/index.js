const express = require('express');
const sentimentRoutes = require('./routes/sentiment');

const app = express();
const PORT = process.env.PORT || 5011; // Puedes cambiar el puerto aquí

app.use('/api', sentimentRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
