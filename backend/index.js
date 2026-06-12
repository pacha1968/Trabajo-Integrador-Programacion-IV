import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import inscripcionesRoutes from './src/routes/inscripciones.routes.js';

import pool from './src/config/db.js';
import authRoutes from './src/routes/auth.routes.js';
import cursoRoutes from './src/routes/curso.routes.js';
import statsRoutes from './src/routes/stats.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', authRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/inscripciones', inscripcionesRoutes);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});