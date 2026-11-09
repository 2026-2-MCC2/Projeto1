// Regras de negócio do planejamento de eventos (funções puras: sem React e sem localStorage).
// Quando o back-end existir, estas mesmas regras devem ser validadas também no servidor.

export const CATEGORIAS = ['Iluminação', 'Som', 'Alimentação', 'Bebidas', 'Segurança', 'Estrutura', 'Limpeza', 'Outros'];
export const TIPOS_CUSTO = ['Fiscal', 'Operacional', 'Variável', 'Outro'];
export const COBRANCAS = { total: 'Total do evento', pessoa: 'Por participante' };

export const STATUS_EVENTO = {
  rascunho: 'Rascunho',
  aberto: 'Aberto para cotação',
  encerrado: 'Cotação encerrada',
  fechado: 'Orçamento fechado',
};
// Transições permitidas: de -> [para...]
export const TRANSICOES = {
  [STATUS_EVENTO.rascunho]: [STATUS_EVENTO.aberto],
  [STATUS_EVENTO.aberto]: [STATUS_EVENTO.encerrado, STATUS_EVENTO.rascunho],
  [STATUS_EVENTO.encerrado]: [STATUS_EVENTO.fechado, STATUS_EVENTO.aberto],
  [STATUS_EVENTO.fechado]: [STATUS_EVENTO.encerrado],
};

export const STATUS_PROPOSTA = { enviada: 'Enviada', selecionada: 'Selecionada', nao: 'Não selecionada', cancelada: 'Cancelada' };

// ---------- formatação ----------
export const moeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0);
export const fmtData = (iso) => (iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR') : '—');
export const periodo = (ini, fim) => (!ini ? '—' : ini === fim || !fim ? fmtData(ini) : `${fmtData(ini)} a ${fmtData(fim)}`);
export const hojeISO = () => new Date().toLocaleDateString('sv-SE'); // AAAA-MM-DD no fuso local
export const somaDias = (iso, dias) => { const d = new Date(`${iso}T12:00:00`); d.setDate(d.getDate() + dias); return d.toLocaleDateString('sv-SE'); };

const soma = (lista) => lista.reduce((s, n) => s + (Number(n) || 0), 0);
const arred2 = (v) => Math.round(v * 100) / 100;
// Critério de arredondamento do ticket: SEMPRE PARA CIMA, ao centavo (garante que a margem mínima seja respeitada).
const paraCima = (v) => Math.ceil(Number((v * 100).toFixed(6))) / 100;

// ---------- cálculo do ticket ----------
/**
 * Margem definida sobre a RECEITA (margem em %):
 *   ticket-alvo      = custoTotal / [público × (1 − margem)]
 *   ticket equilíbrio = custoTotal / público           (margem 0%: não dá lucro nem prejuízo)
 */
export function calcularTicket({ custoTotal, publico, margem }) {
  const c = Number(custoTotal), p = Number(publico), m = Number(margem);
  if (!Number.isFinite(c) || c < 0) return { ok: false, erro: 'O custo total deve ser um número maior ou igual a zero.' };
  if (!Number.isInteger(p) || p <= 0) return { ok: false, erro: 'O público deve ser um número inteiro maior que zero.' };
  if (!Number.isFinite(m) || m < 0 || m >= 100) return { ok: false, erro: 'A margem deve estar entre 0% e 99,99%.' };
  const ticketAlvo = paraCima(c / (p * (1 - m / 100)));
  return {
    ok: true, custoTotal: c, publico: p, margem: m,
    ticketEquilibrio: paraCima(c / p), ticketAlvo,
    receita: arred2(ticketAlvo * p), lucro: arred2(ticketAlvo * p - c),
  };
}

// ---------- consolidação do orçamento ----------
export function consolidar({ itens, propostas, custos }) {
  const selecionadas = propostas.filter((p) => p.status === STATUS_PROPOSTA.selecionada);
  const semProposta = itens.filter((i) => !selecionadas.some((p) => p.itemId === i.id));
  const fixosPropostas = soma(selecionadas.map((p) => p.valor));
  const fixosCustos = soma(custos.filter((c) => c.cobranca === 'total').map((c) => c.valor));
  const porPessoa = soma(custos.filter((c) => c.cobranca === 'pessoa').map((c) => c.valor));
  const custoFixo = arred2(fixosPropostas + fixosCustos);
  return {
    fixosPropostas: arred2(fixosPropostas), fixosCustos: arred2(fixosCustos), porPessoa: arred2(porPessoa),
    custoFixo, semProposta, selecionadas,
    custoPara: (publico) => arred2(custoFixo + porPessoa * publico), // custo total para um dado público
  };
}

// Cenários exigidos (RF13): público mínimo e máximo + público esperado (opcional).
export function cenarios(evento, orc) {
  const lista = [{ chave: 'min', rotulo: 'Público mínimo', publico: evento.publicoMin }];
  if (evento.publicoEsperado) lista.push({ chave: 'esp', rotulo: 'Público esperado', publico: evento.publicoEsperado });
  lista.push({ chave: 'max', rotulo: 'Público máximo', publico: evento.publicoMax });
  return lista.map((c) => ({ ...c, ...calcularTicket({ custoTotal: orc.custoPara(c.publico), publico: c.publico, margem: evento.margem }) }));
}

// Série do ticket-alvo em função do público (para o gráfico; base do estudo de máximos/mínimos/concavidade).
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

// ---------- validações ----------
const num = (v) => (v === '' || v === null || v === undefined ? NaN : Number(String(v).replace(',', '.')));
const ehData = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s)) && !Number.isNaN(new Date(`${s}T12:00:00`).getTime());

export function validarEvento(d) {
  const nome = String(d.nome ?? '').trim();
  const local = String(d.local ?? '').trim();
  const publicoMin = num(d.publicoMin), publicoMax = num(d.publicoMax), margem = num(d.margem);
  const temEsperado = String(d.publicoEsperado ?? '').trim() !== '';
  const publicoEsperado = temEsperado ? num(d.publicoEsperado) : null;
  if (nome.length < 3) return { ok: false, erro: 'Informe o nome do evento (mínimo de 3 caracteres).' };
  if (!ehData(d.inicio) || !ehData(d.fim)) return { ok: false, erro: 'Informe as datas de início e fim do evento.' };
  if (d.fim < d.inicio) return { ok: false, erro: 'A data de fim não pode ser anterior à data de início.' };
  if (local.length < 3) return { ok: false, erro: 'Informe o local do evento.' };
  if (!Number.isInteger(publicoMin) || publicoMin <= 0) return { ok: false, erro: 'O público mínimo deve ser um número inteiro maior que zero.' };
  if (!Number.isInteger(publicoMax) || publicoMax < publicoMin) return { ok: false, erro: 'O público máximo deve ser um inteiro maior ou igual ao mínimo.' };
  if (temEsperado && (!Number.isInteger(publicoEsperado) || publicoEsperado < publicoMin || publicoEsperado > publicoMax)) {
    return { ok: false, erro: 'O público esperado deve estar entre o mínimo e o máximo.' };
  }
  if (!Number.isFinite(margem) || margem < 0 || margem >= 100) return { ok: false, erro: 'A margem de lucro deve estar entre 0% e 99,99%.' };
  return { ok: true, dados: { nome, descricao: String(d.descricao ?? '').trim(), inicio: d.inicio, fim: d.fim, local, publicoMin, publicoMax, publicoEsperado, margem } };
}

export function validarProposta(d) {
  const valor = num(d.valor), descricao = String(d.descricao ?? '').trim();
  if (!Number.isFinite(valor) || valor <= 0) return { ok: false, erro: 'Informe um valor maior que zero.' };
  if (descricao.length < 3) return { ok: false, erro: 'Descreva o que está incluído na proposta.' };
  if (!ehData(d.validade) || d.validade < hojeISO()) return { ok: false, erro: 'A validade deve ser uma data de hoje em diante.' };
  return { ok: true, dados: { valor: arred2(valor), descricao, validade: d.validade, observacoes: String(d.observacoes ?? '').trim() } };
}

export function validarCusto(d) {
  const valor = num(d.valor), descricao = String(d.descricao ?? '').trim();
  if (!TIPOS_CUSTO.includes(d.tipo)) return { ok: false, erro: 'Escolha o tipo do custo.' };
  if (descricao.length < 3) return { ok: false, erro: 'Descreva o custo.' };
  if (!Number.isFinite(valor) || valor <= 0) return { ok: false, erro: 'Informe um valor maior que zero.' };
  if (!COBRANCAS[d.cobranca]) return { ok: false, erro: 'Escolha como o custo é cobrado.' };
  return { ok: true, dados: { tipo: d.tipo, descricao, valor: arred2(valor), cobranca: d.cobranca } };
}

export function validarItem(d) {
  const quantidade = num(d.quantidade || 1), descricao = String(d.descricao ?? '').trim();
  if (!CATEGORIAS.includes(d.categoria)) return { ok: false, erro: 'Escolha a categoria do item.' };
  if (descricao.length < 3) return { ok: false, erro: 'Descreva o item (mínimo de 3 caracteres).' };
  if (!Number.isInteger(quantidade) || quantidade < 1) return { ok: false, erro: 'A quantidade deve ser um inteiro maior que zero.' };
  return { ok: true, dados: { categoria: d.categoria, descricao, quantidade } };
}

export function validarCnpj(valor) {
  const c = String(valor ?? '').replace(/\D/g, '');
  if (c.length !== 14 || /^(\d)\1+$/.test(c)) return false;
  const dig = (base) => {
    let pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const r = base.split('').reduce((s, n, i) => s + Number(n) * pesos[i], 0) % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const d1 = dig(c.slice(0, 12));
  const d2 = dig(c.slice(0, 12) + d1);
  return c.endsWith(`${d1}${d2}`);
}

// ---------- consultas sobre o estado ----------
export function dadosDoEvento(estado, id) {
  const evento = estado.eventos.find((e) => e.id === id);
  if (!evento) return null;
  const itens = estado.itens.filter((i) => i.eventoId === id);
  const ids = new Set(itens.map((i) => i.id));
  return {
    evento, itens,
    custos: estado.custos.filter((c) => c.eventoId === id),
    propostas: estado.propostas.filter((p) => ids.has(p.itemId)),
  };
}

// Ticket-alvo de referência do evento: público esperado, se houver; senão o máximo.
export function resumoDoEvento(estado, id) {
  const d = dadosDoEvento(estado, id);
  if (!d) return null;
  const orc = consolidar(d);
  const publico = d.evento.publicoEsperado || d.evento.publicoMax;
  const t = calcularTicket({ custoTotal: orc.custoPara(publico), publico, margem: d.evento.margem });
  return { ...d, orc, publicoRef: publico, ticket: t.ok ? t : null };
}
