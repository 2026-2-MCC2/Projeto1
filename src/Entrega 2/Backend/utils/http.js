// Respostas de erro padronizadas: { mensagem }
export const erro = (res, status, mensagem) => res.status(status).json({ mensagem });
export const idValido = (valor) => /^\d+$/.test(String(valor)) && Number(valor) > 0;
