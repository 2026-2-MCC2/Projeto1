// Importacao de bibliotecas
// express - criar e administrar o servidor
// cors - permite a comunicação entre frontend e backend
// dotenv - carregar configuracoes de um arquivo .env

import express from 'express'; 
import cors from 'cors';
import dotenv from 'dotenv';
import conexao from './config/database.js';
import authRouter from '../routes/authRoutes.js';

dotenv.config(); //vai carregar as informacoes armazenadas do arquivo .env

const app = express(); //esta criando a aplicacao express, express (): cria, app: representa a aplicacaos/servidor

app.use(cors({ //permite que o front (executado em 5137) faca requisicoes para o back 
    origin: 'http://localhost:5173'
}))

app.use(express.json()); //permite que a aplicacao interprete os dados enviados em json

app.use('/api/auth', authRouter); //informa o express que todas as rotas definidas em authRoutes comecaram com /api/auth

// app.use('/api/evento', eventoRouter);

// app.use('/api/ingresso', ingressoRouter);

// app.use('/api/pedido', pedidoRouter);

// Primeira rota da API, parametros sao req (requisicao) e res (resposta)
app.get('/', (req, res) => { 
    res.json({
        mensagem: 'Backend do TrocaTicket funcionando!'
    });
});

// Inicializacao do servidor, se existir uma porta em .env ela sera usada caso contrario ira criar uma na porta 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => { //faz com que a aplicacao execute na porta escolhida
    console.log(`Servidor TrocaTicket rodando na porta ${PORT}`);
});

//Implementado apos importar database.js

app.get('/testebanco', async (req,res) => {
    try {
        const [resultado] = await conexao.query('Select 1 AS conectado');

        res.json({
            mensagem: 'Conexão com o MySQL realizada',
            resultado
        });
    }

    catch (erro) {
        console.error('Erro ao conectar:', erro);

        res.status(500).json({
            mensagem: 'Erro ao conectar com o banco de dados.'
        });
    }
});

