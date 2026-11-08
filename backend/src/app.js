// Monta a aplicação Express (sem ligar o servidor): assim os testes importam o "app" sem abrir porta.
import express from 'express';
import cors from 'cors';
import authRouter from '../routes/authRoutes.js';
import eventoRouter from '../routes/eventoRoutes.js';
import cotacaoRouter from '../routes/cotacaoRoutes.js';
import propostaRouter from '../routes/propostaRoutes.js';
import adminRouter from '../routes/adminRoutes.js';

const app = express();

app.use(cors({ origin: process.env.FRONT_URL || 'http://localhost:5173' })); // endereço do front-end
app.use(express.json());

app.get('/', (req, res) => res.json({ mensagem: 'Backend do TrocaTicket funcionando!' }));

app.use('/api/auth', authRouter);
app.use('/api/eventos', eventoRouter);      // organizador
app.use('/api/cotacoes', cotacaoRouter);    // fornecedor
app.use('/api/propostas', propostaRouter);  // fornecedor
app.use('/api/admin', adminRouter);         // administrador

// Rota inexistente
app.use((req, res) => res.status(404).json({ mensagem: 'Rota não encontrada.' }));

// Erros não tratados: JSON inválido -> 400; duplicidade -> 409; o resto -> 500 (sem vazar detalhes)
app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    if (err.type === 'entity.parse.failed') return res.status(400).json({ mensagem: 'JSON inválido no corpo da requisição.' });
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ mensagem: 'Registro duplicado.' });
    console.error('Erro não tratado:', err);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
});

export default app;
