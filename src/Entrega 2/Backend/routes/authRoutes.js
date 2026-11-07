import express from 'express';

//importa a funcao cadastrarCliente que contem a logica que sera executada quando a requisicao chegar
import {
    cadastrarCliente,
    loginCliente,
    consultarPerfil,
    atualizarPerfil
} from '../controllers/authController.js';
import { autenticarToken } from '../middlewares/autenticarToken.js';

const router = express.Router();

// cadastro de cliente 
router.post('/cadastro', cadastrarCliente);
// login do cliente
router.post('/login', loginCliente);
// rota protegida
router.get('/perfil', autenticarToken, consultarPerfil);

router.put('/perfil', autenticarToken, atualizarPerfil);

export default router;