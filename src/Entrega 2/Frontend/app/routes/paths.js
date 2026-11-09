export const paths = {
  home: '/',
  events: '/eventos',
  marketplace: '/marketplace',
  tickets: '/ingressos',
  orders: '/pedidos',
  account: '/minha-conta',
  login: '/login',
  signup: '/cadastro',
  contact: '/contato',
  admin: '/admin/dashboard',
  vendor: '/fornecedor/dashboard',
  organizer: '/organizador/dashboard',
  staffLogin: '/painel/login', //login para quem trabalha na TrocaTicket
  partnerSignup: '/painel/cadastro' //autocadastro de organizador e fornecedor
};
export const route = (path) => paths[path] || path;

// Página inicial de cada perfil depois do login
export const homeFor = (role) => (role && role !== 'cliente' ? `/${role}/dashboard` : paths.account);
