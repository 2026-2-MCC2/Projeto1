// Cliente HTTP único do front-end: URL da API configurável, token JWT e mensagens de erro claras.
// A URL vem do arquivo .env (VITE_API_URL). Sem ele, usa o back-end local.
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// Token da conta logada (guardado em 'tt-account' pelo StoreContext)
const tokenSalvo = () => {
  try { return JSON.parse(localStorage.getItem('tt-account'))?.token ?? null; } catch { return null; }
};

/**
 * Faz a requisição e devolve o JSON. Em caso de erro lança Error com a mensagem da API
 * (e.status com o código HTTP). Servidor desligado e sessão expirada têm mensagens próprias.
 */
export async function requisitar(caminho, { metodo = 'GET', corpo, token, mensagemPadrao = 'Não foi possível concluir a operação.' } = {}) {
  const jwt = token === undefined ? tokenSalvo() : token;
  let resposta;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method: metodo,
      headers: { 'Content-Type': 'application/json', ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}) },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Verifique se o back-end está rodando.');
  }
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    const erro = new Error(resposta.status === 401 && jwt
      ? 'Sua sessão expirou. Saia e entre novamente.'
      : dados.mensagem || mensagemPadrao);
    erro.status = resposta.status;
    throw erro;
  }
  return dados;
}

// Para ações de formulário: nunca lança; devolve { ok: true, ...dados } ou { ok: false, erro }.
export async function comoResultado(promessa) {
  try { return { ok: true, ...(await promessa) }; } catch (e) { return { ok: false, erro: e.message }; }
}
