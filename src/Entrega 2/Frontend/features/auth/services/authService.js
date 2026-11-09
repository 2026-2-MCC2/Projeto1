import { requisitar } from '../../../shared/api/http.js';

// Todas as contas (cliente, administrador, organizador e fornecedor) usam a API real.
// Para criar contas de teste: npm run seed (senha de todas: Troca@123).

// Cadastro de cliente
export async function cadastrarCliente(dados) {
  const r = await requisitar('/api/auth/cadastro', { metodo: 'POST', corpo: dados, token: null, mensagemPadrao: 'Erro ao realizar cadastro.' });
  return { name: r.usuario.nome, email: r.usuario.email, role: r.usuario.perfil };
}

// escopo: 'cliente' (/login) ou 'equipe' (/painel/login: admin, organizador e fornecedor aprovados)
export async function login(email, senha, escopo) {
  const caminho = escopo === 'equipe' ? '/api/auth/login-equipe' : '/api/auth/login';
  const r = await requisitar(caminho, { metodo: 'POST', corpo: { email: email.trim().toLowerCase(), senha }, token: null, mensagemPadrao: 'Erro ao realizar login.' });
  return { name: r.usuario.nome, email: r.usuario.email, role: r.usuario.perfil, token: r.token };
}

// Consulta o perfil usando o JWT
export async function consultarPerfil(token) {
  const r = await requisitar('/api/auth/perfil', { token, mensagemPadrao: 'Erro ao consultar perfil.' });
  return r.usuario;
}

// Atualiza o perfil usando o JWT
export async function atualizarPerfil(token, dados) {
  const r = await requisitar('/api/auth/perfil', { metodo: 'PUT', corpo: dados, token, mensagemPadrao: 'Erro ao atualizar perfil.' });
  return r.usuario;
}
