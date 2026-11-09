import { Router } from 'express';
import { autenticarToken } from '../middlewares/autenticarToken.js';
import { exigirPerfil } from '../middlewares/exigirPerfil.js';
import { listarCadastros, decidirCadastro, auditoria, listarEventosAdmin, resumoGeral } from '../controllers/adminController.js';

const router = Router();
router.use(autenticarToken, exigirPerfil('admin'));

router.get('/cadastros', listarCadastros);
router.patch('/cadastros/:idConta', decidirCadastro);
router.get('/auditoria', auditoria);
router.get('/eventos', listarEventosAdmin);
router.get('/resumo', resumoGeral);

export default router;
