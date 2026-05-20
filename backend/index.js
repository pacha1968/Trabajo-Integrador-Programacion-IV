require('dotenv').config(); 
const express = require('express');
const cors = require('cors');

const pool = require('./src/config/db.js');

const authRoutes = require('./src/routes/auth.routes.js');
const cursoRoutes = require('./src/routes/curso.routes.js');
const statsRoutes = require('./src/routes/stats.routes.js');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', authRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/stats', statsRoutes);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});