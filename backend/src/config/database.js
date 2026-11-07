// Codigo para estabelecer a conexao do back com o banco

// mysql - para acessar funcoes e colocar no banco
// dotenv - carregar configuracoes de um arquivo .env

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

//Config da conexao do banco

const conexao = mysql.createPool({ //cria um conjunto de funcoes para a conexao com o banco
    host: process.env.DB_HOST, //endereco do serv
    user: process.env.DB_USER, //usuario do banco
    password: process.env.DB_PASSWORD, //senha do banco
    database: process.env.DB_NAME, //nome do banco
    waitForConnections: true,
    connectionLimit: 10, //limite de conexoes
    queueLimit: 0 //sem fila de espera 
});

export default conexao;