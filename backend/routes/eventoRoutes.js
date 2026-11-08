import { Router } from 'express';
import { autenticarToken } from '../middlewares/autenticarToken.js';
import { exigirPerfil } from '../middlewares/exigirPerfil.js';
import * as c from '../controllers/eventoController.js';

const router = Router();
router.use(autenticarToken, exigirPerfil('organizador'));

router.get('/', c.listarEventos);
router.post('/', c.criarEvento);
router.get('/:id', c.obterEvento);
router.put('/:id', c.atualizarEvento);
router.delete('/:id', c.excluirEvento);
router.patch('/:id/status', c.alterarStatus);
router.get('/:id/ticket', c.calcularTicketDoEvento);
router.post('/:id/itens', c.adicionarItem);
router.delete('/:id/itens/:itemId', c.removerItem);
router.delete('/:id/itens/:itemId/selecao', c.desfazerSelecao);
router.post('/:id/custos', c.adicionarCusto);
router.delete('/:id/custos/:custoId', c.removerCusto);
router.post('/:id/propostas/:propostaId/selecionar', c.selecionarProposta);

export default router;
