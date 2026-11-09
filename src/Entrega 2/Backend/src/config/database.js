// Conexão com o MySQL (pool). O pool só é criado no primeiro uso.
// Os controllers importam "conexao" e usam query / execute / getConnection como antes.
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool = null;
const obterPool = () => (pool ??= mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true,    // datas voltam como texto 'AAAA-MM-DD HH:MM:SS' (sem problema de fuso)
    decimalNumbers: true  // DECIMAL volta como número
}));

// Permite trocar o pool nos testes automatizados (banco em memória, sem MySQL).
export const usarPool = (novoPool) => { pool = novoPool; };

const conexao = {
    query: (...args) => obterPool().query(...args),
    execute: (...args) => obterPool().execute(...args),
    getConnection: () => obterPool().getConnection()
};

export default conexao;
