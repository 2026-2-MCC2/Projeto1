// Dados de demonstração dos painéis. Troque por chamadas à API quando existir back-end.
export const solicitacoesIniciais = [
  { id: 'SOL-1001', nome: 'Luz & Som Produções', autor: 'fornecedor', tipo: 'Fornecimento', data: '2026-10-20', problema: 'Iluminação para o Festival Indie', status: 'Em análise' },
  { id: 'SOL-1002', nome: 'Rede Palco Seguro', autor: 'fornecedor', tipo: 'Cadastro', data: '2026-10-18', problema: 'Documentos do novo fornecedor', status: 'Aprovado' },
  { id: 'SOL-1003', nome: 'Noite Viva Eventos', autor: 'organizador', tipo: 'Evento', data: '2026-10-15', problema: 'Publicação do Show de Rock', status: 'Aprovado' },
  { id: 'SOL-1004', nome: 'Coletivo Recife Cultural', autor: 'organizador', tipo: 'Suporte', data: '2026-10-12', problema: 'Dúvida sobre repasse de valores', status: 'Recusado' },
];

export const resumoAdmin = { usuarios: 128, fornecedores: 14 };

export const notificacoes = [
  { id: 1, cor: 'verde', texto: 'Seu pedido SOL-1002 foi aprovado.' },
  { id: 2, cor: 'vermelho', texto: 'Documento pendente em SOL-1001.' },
  { id: 3, cor: 'laranja', texto: 'Novo evento disponível para fornecer.' },
];

export const faq = [
  ['Como acompanho uma solicitação?', 'Abra "Minhas Solicitações" e consulte o status de cada pedido.'],
  ['Quanto tempo leva a análise?', 'Em geral, até 2 dias úteis. Você verá o status mudar na lista.'],
  ['Como altero meus dados?', 'Vá em Configurações e salve o novo nome.'],
];
