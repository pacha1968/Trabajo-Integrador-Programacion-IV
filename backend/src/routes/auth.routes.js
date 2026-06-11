import express from 'express';
import authController from '../controllers/auth.controller.js'; 
import { validarLogin } from '../middlewares/auth.validarors.js'; 

const router = express.Router();

//ruta de login
router.post('/login', validarLogin, authController.login);

export default router;