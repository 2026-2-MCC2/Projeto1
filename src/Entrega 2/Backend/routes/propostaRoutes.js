import { Router } from 'express';
import { autenticarToken } from '../middlewares/autenticarToken.js';
import { exigirPerfil } from '../middlewares/exigirPerfil.js';
import { minhasPropostas, editarProposta, cancelarProposta } from '../controllers/propostaController.js';

const router = Router();
router.use(autenticarToken, exigirPerfil('fornecedor'));

router.get('/minhas', minhasPropostas);
router.put('/:id', editarProposta);
router.post('/:id/cancelar', cancelarProposta);

export default router;
