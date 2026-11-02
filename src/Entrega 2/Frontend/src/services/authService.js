// Contas de DEMONSTRAÇÃO. Apagar quando o back-end estiver pronto.
const contasDemo = {
  'admin@trocaticket.dev':       { name: 'Admin',       role: 'admin' },
  'fornecedor@trocaticket.dev':  { name: 'Fornecedor',  role: 'fornecedor' },
  'organizador@trocaticket.dev': { name: 'Organizador', role: 'organizador' },
};

// escopo: 'cliente' (/login) ou 'equipe' (/painel/login)
export async function login(email, senha, escopo) {
  const emailLimpo = email.trim().toLowerCase();
  // Procura a conta; se não existir, entra como cliente
  const conta = Object.hasOwn(contasDemo, emailLimpo) ? contasDemo[emailLimpo] : undefined;
  const user = conta ?? { name: emailLimpo.split('@')[0], role: 'cliente' };

  // Cada porta só aceita o seu público
  const authCorreta = escopo === 'equipe' ? user.role !== 'cliente' : user.role === 'cliente';
  if (!authCorreta) throw new Error('E-mail ou senha incorretos.');
  return { ...user, email: emailLimpo };
}
