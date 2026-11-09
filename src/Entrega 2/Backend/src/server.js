import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const caminhoEnv = path.resolve(__dirname, '../.env');

const resultadoEnv = dotenv.config({
    path: caminhoEnv,
});

if (resultadoEnv.error) {
    console.error('Erro ao localizar .env:', resultadoEnv.error);
} else {
    console.log('Arquivo .env carregado:', caminhoEnv);
}

const { default: app } = await import('./app.js');
const { default: conexao } = await import('./config/database.js');

// Inicia o servidor
const PORT = process.env.PORT || 3000;

// Rota inexistente
app.use((req, res) => {
    res.status(404).json({
        mensagem: 'Rota não encontrada.'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor TrocaTicket rodando na porta ${PORT}`);
});