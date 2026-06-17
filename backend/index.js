import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import inscripcionesRoutes from './src/routes/inscripciones.routes.js';

import pool from './src/config/db.js';
import authRoutes from './src/routes/auth.routes.js';
import cursoRoutes from './src/routes/curso.routes.js';
import statsRoutes from './src/routes/stats.routes.js';
import estudianteRoutes from './src/routes/estudiante.routes.js';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/', authRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/inscripciones', inscripcionesRoutes);

app.use('/api/estudiantes', estudianteRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});