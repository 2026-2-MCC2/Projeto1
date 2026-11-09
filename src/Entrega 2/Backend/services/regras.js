// Regras de negócio do planejamento (mesmas do front-end: src/features/planejamento/services/planejamento.js).
// O servidor valida TUDO de novo: nunca confie só na validação do navegador.

export const CATEGORIAS = ['Iluminação', 'Som', 'Alimentação', 'Bebidas', 'Segurança', 'Estrutura', 'Limpeza', 'Outros'];
export const TIPOS_CUSTO = ['Fiscal', 'Operacional', 'Variável', 'Outro'];
export const COBRANCAS = ['total', 'pessoa'];

// StatusEvento no banco (TINYINT) <-> nome exibido
export const STATUS_EVENTO = ['Rascunho', 'Aberto para cotação', 'Cotação encerrada', 'Orçamento fechado'];
export const RASCUNHO = 0, ABERTO = 1, ENCERRADO = 2, FECHADO = 3;
export const TRANSICOES = { 0: [1], 1: [2, 0], 2: [3, 1], 3: [2] };

export const hojeISO = () => new Date().toISOString().slice(0, 10);
export const agora = () => new Date().toISOString().slice(0, 19).replace('T', ' ');
const soma = (v) => v.reduce((s, n) => s + (Number(n) || 0), 0);
const arred2 = (v) => Math.round(v * 100) / 100;
const paraCima = (v) => Math.ceil(Number((v * 100).toFixed(6))) / 100; // sempre para cima, ao centavo
const num = (v) => (v === '' || v === null || v === undefined ? NaN : Number(String(v).replace(',', '.')));
const ehData = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s)) && !Number.isNaN(new Date(`${s}T12:00:00Z`).getTime());

// ---------- status de proposta (derivado) ----------
export function statusProposta({ cancelada, id, selecionadoId }) {
  if (cancelada) return 'Cancelada';
  if (selecionadoId === id) return 'Selecionada';
  if (selecionadoId !== null && selecionadoId !== undefined) return 'Não selecionada';
  return 'Enviada';
}

// ---------- ticket ----------
// Ticket-alvo = Custo total / [Público x (1 - Margem)] | Equilíbrio = Custo total / Público
export function calcularTicket({ custoTotal, publico, margem }) {
  const c = Number(custoTotal), p = Number(publico), m = Number(margem);
  if (!Number.isFinite(c) || c < 0) return { ok: false, erro: 'O custo total deve ser um número maior ou igual a zero.' };
  if (!Number.isInteger(p) || p <= 0) return { ok: false, erro: 'O público deve ser um número inteiro maior que zero.' };
  if (!Number.isFinite(m) || m < 0 || m >= 100) return { ok: false, erro: 'A margem deve estar entre 0% e 99,99%.' };
  const ticketAlvo = paraCima(c / (p * (1 - m / 100)));
  return { ok: true, custoTotal: c, publico: p, margem: m, ticketEquilibrio: paraCima(c / p), ticketAlvo, receita: arred2(ticketAlvo * p), lucro: arred2(ticketAlvo * p - c) };
}

export function consolidar({ itens, propostas, custos }) {
  const selecionadas = propostas.filter((p) => p.status === 'Selecionada');
  const semProposta = itens.filter((i) => !selecionadas.some((p) => p.itemId === i.id));
  const fixosPropostas = arred2(soma(selecionadas.map((p) => p.valor)));
  const fixosCustos = arred2(soma(custos.filter((c) => c.cobranca === 'total').map((c) => c.valor)));
  const porPessoa = arred2(soma(custos.filter((c) => c.cobranca === 'pessoa').map((c) => c.valor)));
  const custoFixo = arred2(fixosPropostas + fixosCustos);
  return { fixosPropostas, fixosCustos, porPessoa, custoFixo, semProposta, selecionadas, custoPara: (publico) => arred2(custoFixo + porPessoa * publico) };
}

export function cenarios(evento, orc) {
  const lista = [{ chave: 'min', rotulo: 'Público mínimo', publico: evento.publicoMin }];
  if (evento.publicoEsperado) lista.push({ chave: 'esp', rotulo: 'Público esperado', publico: evento.publicoEsperado });
  lista.push({ chave: 'max', rotulo: 'Público máximo', publico: evento.publicoMax });
  return lista.map((c) => ({ ...c, ...calcularTicket({ custoTotal: orc.custoPara(c.publico), publico: c.publico, margem: evento.margem }) }));
}

export function serieTicket(evento, orc, pontos = 24) {
  const { publicoMin: a, publicoMax: b } = evento;
  const passo = Math.max(1, Math.round((b - a) / pontos));
  const xs = [];
  for (let x = a; x < b; x += passo) xs.push(x);
  xs.push(b);
  return xs.map((publico) => {
    const r = calcularTicket({ custoTotal: orc.custoPara(publico), publico, margem: evento.margem });
    return { publico, ticket: r.ok ? r.ticketAlvo : null };
  });
}

// Resumo pronto para listas e relatórios
export function resumoDoEvento({ evento, itens, custos, propostas }) {
  const orc = consolidar({ itens, propostas, custos });
  const publicoRef = evento.publicoEsperado || evento.publicoMax;
  const t = calcularTicket({ custoTotal: orc.custoPara(publicoRef), publico: publicoRef, margem: evento.margem });
  return {
    totalItens: itens.length, itensFechados: orc.selecionadas.length,
    propostasAtivas: propostas.filter((p) => p.status !== 'Cancelada').length,
    custoFixo: orc.custoFixo, publicoReferencia: publicoRef, custoReferencia: orc.custoPara(publicoRef),
    ticketAlvo: t.ok ? t.ticketAlvo : null, ticketEquilibrio: t.ok ? t.ticketEquilibrio : null,
  };
}

// Versão do orçamento sem funções (pode ir no JSON)
export const orcamentoParaJson = (orc) => ({
  fixosPropostas: orc.fixosPropostas, fixosCustos: orc.fixosCustos, porPessoa: orc.porPessoa, custoFixo: orc.custoFixo,
  itensSemProposta: orc.semProposta.map((i) => i.id), propostasSelecionadas: orc.selecionadas.map((p) => p.id),
});

// ---------- validações ----------
export function validarEvento(d) {
  const nome = String(d.nome ?? '').trim(), local = String(d.local ?? '').trim();
  const publicoMin = num(d.publicoMin), publicoMax = num(d.publicoMax), margem = num(d.margem);
  const temEsperado = String(d.publicoEsperado ?? '').trim() !== '';
  const publicoEsperado = temEsperado ? num(d.publicoEsperado) : null;
  if (nome.length < 3) return { ok: false, erro: 'Informe o nome do evento (mínimo de 3 caracteres).' };
  if (!ehData(d.inicio) || !ehData(d.fim)) return { ok: false, erro: 'Informe as datas de início e fim do evento (AAAA-MM-DD).' };
  if (d.fim < d.inicio) return { ok: false, erro: 'A data de fim não pode ser anterior à data de início.' };
  if (local.length < 3) return { ok: false, erro: 'Informe o local do evento.' };
  if (!Number.isInteger(publicoMin) || publicoMin <= 0) return { ok: false, erro: 'O público mínimo deve ser um número inteiro maior que zero.' };
  if (!Number.isInteger(publicoMax) || publicoMax < publicoMin) return { ok: false, erro: 'O público máximo deve ser um inteiro maior ou igual ao mínimo.' };
  if (temEsperado && (!Number.isInteger(publicoEsperado) || publicoEsperado < publicoMin || publicoEsperado > publicoMax)) return { ok: false, erro: 'O público esperado deve estar entre o mínimo e o máximo.' };
  if (!Number.isFinite(margem) || margem < 0 || margem >= 100) return { ok: false, erro: 'A margem de lucro deve estar entre 0% e 99,99%.' };
  return { ok: true, dados: { nome, descricao: String(d.descricao ?? '').trim(), inicio: d.inicio, fim: d.fim, local, publicoMin, publicoMax, publicoEsperado, margem } };
}

export function validarItem(d) {
  const quantidade = num(d.quantidade ?? 1), descricao = String(d.descricao ?? '').trim();
  if (!CATEGORIAS.includes(d.categoria)) return { ok: false, erro: 'Escolha uma categoria válida para o item.' };
  if (descricao.length < 3) return { ok: false, erro: 'Descreva o item (mínimo de 3 caracteres).' };
  if (!Number.isInteger(quantidade) || quantidade < 1) return { ok: false, erro: 'A quantidade deve ser um inteiro maior que zero.' };
  return { ok: true, dados: { categoria: d.categoria, descricao, quantidade } };
}

export function validarCusto(d) {
  const valor = num(d.valor), descricao = String(d.descricao ?? '').trim();
  if (!TIPOS_CUSTO.includes(d.tipo)) return { ok: false, erro: 'Escolha o tipo do custo (Fiscal, Operacional, Variável ou Outro).' };
  if (descricao.length < 3) return { ok: false, erro: 'Descreva o custo.' };
  if (!Number.isFinite(valor) || valor <= 0) return { ok: false, erro: 'Informe um valor maior que zero.' };
  if (!COBRANCAS.includes(d.cobranca)) return { ok: false, erro: 'A cobrança deve ser "total" ou "pessoa".' };
  return { ok: true, dados: { tipo: d.tipo, descricao, valor: arred2(valor), cobranca: d.cobranca } };
}

export function validarProposta(d) {
  const valor = num(d.valor), descricao = String(d.descricao ?? '').trim();
  if (!Number.isFinite(valor) || valor <= 0) return { ok: false, erro: 'Informe um valor maior que zero.' };
  if (descricao.length < 3) return { ok: false, erro: 'Descreva o que está incluído na proposta.' };
  if (!ehData(d.validade) || d.validade < hojeISO()) return { ok: false, erro: 'A validade deve ser uma data de hoje em diante (AAAA-MM-DD).' };
  return { ok: true, dados: { valor: arred2(valor), descricao, validade: d.validade, observacoes: String(d.observacoes ?? '').trim().slice(0, 255) } };
}

export function validarCnpj(valor) {
  const c = String(valor ?? '').replace(/\D/g, '');
  if (c.length !== 14 || /^(\d)\1+$/.test(c)) return false;
  const dig = (base) => {
    const pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const r = base.split('').reduce((s, n, i) => s + Number(n) * pesos[i], 0) % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const d1 = dig(c.slice(0, 12));
  return c.endsWith(`${d1}${dig(c.slice(0, 12) + d1)}`);
}
