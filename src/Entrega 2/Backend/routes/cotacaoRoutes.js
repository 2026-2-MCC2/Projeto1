import { Router } from 'express';
import { autenticarToken } from '../middlewares/autenticarToken.js';
import { exigirPerfil } from '../middlewares/exigirPerfil.js';
import { listarCotacoes, obterCotacao, enviarProposta } from '../controllers/cotacaoController.js';

const router = Router();
router.use(autenticarToken, exigirPerfil('fornecedor'));

router.get('/', listarCotacoes);
router.get('/:eventoId', obterCotacao);
router.post('/:eventoId/itens/:itemId/propostas', enviarProposta);

export default router;
