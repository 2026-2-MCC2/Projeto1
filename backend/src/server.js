// Liga o servidor. A aplicação em si está em app.js
import dotenv from 'dotenv';
dotenv.config(); // carrega o .env ANTES de importar o resto

const { default: app } = await import('./app.js');
const { default: conexao } = await import('./config/database.js');

// Teste rápido de conexão com o MySQL
app.get('/testebanco', async (req, res) => {
    try {
        const [resultado] = await conexao.query('SELECT 1 AS conectado');
        res.json({ mensagem: 'Conexão com o MySQL realizada', resultado });
    } catch (erro) {
        console.error('Erro ao conectar:', erro);
        res.status(500).json({ mensagem: 'Erro ao conectar com o banco de dados.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor TrocaTicket rodando na porta ${PORT}`));
