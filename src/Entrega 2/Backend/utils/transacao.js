import conexao from '../src/config/database.js';

// Executa várias queries como UMA transação: se algo falhar, tudo é desfeito (rollback).
export async function comTransacao(trabalho) {
    const cx = await conexao.getConnection();
    try {
        await cx.beginTransaction();
        const resultado = await trabalho(cx);
        await cx.commit();
        return resultado;
    } catch (erro) {
        await cx.rollback();
        throw erro;
    } finally {
        cx.release();
    }
}
