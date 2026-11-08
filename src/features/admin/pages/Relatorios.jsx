import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import useApi from '../../../shared/hooks/useApi.js';
import { leituras } from '../../planejamento/services/planejamentoApi.js';
import { moeda, periodo } from '../../planejamento/services/planejamento.js';
import { codigoEvento } from '../../organizador/hooks/useMeusEventos.js';
import { AvisoErro, EstadoApi } from '../../planejamento/components/ui.jsx';
import DataTable from '../../../shared/dashboard/DataTable.jsx';
import PageHeader from '../../../shared/dashboard/PageHeader.jsx';
import StatCard from '../../../shared/dashboard/StatCard.jsx';

const csv = (linhas) => linhas.map((l) => l.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(';')).join('\r\n');

// Relatórios gerenciais (RF14): usuários, eventos, propostas e valores do planejamento.
export default function Relatorios() {
  const { dados, carregando, erro, recarregar } = useApi(async () => {
    const [resumo, eventos] = await Promise.all([leituras.resumo(), leituras.eventosAdmin()]);
    return { resumo, eventos: eventos.eventos };
  }, []);

  const porEvento = useMemo(() => (dados?.eventos ?? []).map((e) => ({
    id: e.id, codigo: codigoEvento(e.id), evento: e.nome, organizador: e.organizadorNome, periodo: periodo(e.inicio, e.fim), status: e.status,
    itens: e.resumo.totalItens, fechados: e.resumo.itensFechados, custo: e.resumo.custoReferencia, publicoRef: e.resumo.publicoReferencia,
    ticket: e.resumo.ticketAlvo ?? '',
  })), [dados]);

  const fornecedores = useMemo(() => {
    const mapa = {};
    (dados?.eventos ?? []).flatMap((e) => e.propostas).filter((p) => p.status !== 'Cancelada').forEach((p) => {
      const f = (mapa[p.fornecedorId] ||= { id: p.fornecedorId, fornecedor: p.fornecedorNome, enviadas: 0, selecionadas: 0, valor: 0 });
      f.enviadas += 1;
      if (p.status === 'Selecionada') { f.selecionadas += 1; f.valor += p.valor; }
    });
    return Object.values(mapa).sort((a, b) => b.selecionadas - a.selecionadas || b.enviadas - a.enviadas);
  }, [dados]);

  const exportar = () => {
    const cab = ['ID', 'Evento', 'Organizador', 'Período', 'Status', 'Itens', 'Itens fechados', 'Público de referência', 'Custo total', 'Ticket-alvo'];
    const corpo = porEvento.map((e) => [e.codigo, e.evento, e.organizador, e.periodo, e.status, e.itens, e.fechados, e.publicoRef, e.custo.toFixed(2).replace('.', ','), e.ticket === '' ? '' : e.ticket.toFixed(2).replace('.', ',')]);
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv([cab, ...corpo])}`], { type: 'text/csv;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'relatorio-eventos.csv' });
    a.click();
    URL.revokeObjectURL(url);
  };

  const colEventos = [
    { key: 'codigo', label: 'ID' }, { key: 'evento', label: 'Evento' }, { key: 'organizador', label: 'Organizador' }, { key: 'status', label: 'Status' },
    { key: 'fechados', label: 'Itens fechados', render: (r) => `${r.fechados}/${r.itens}` },
    { key: 'custo', label: 'Custo total', render: (r) => moeda(r.custo) },
    { key: 'ticket', label: 'Ticket-alvo', render: (r) => (r.ticket === '' ? '—' : moeda(r.ticket)) },
  ];
  const colForn = [
    { key: 'fornecedor', label: 'Fornecedor' }, { key: 'enviadas', label: 'Propostas enviadas' }, { key: 'selecionadas', label: 'Selecionadas' },
    { key: 'valor', label: 'Valor selecionado', render: (r) => moeda(r.valor) },
  ];
  const grafico = (titulo, lista) => (
    <section className="grafico-card grafico-recharts">
      <h2>{titulo}</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={lista} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="nome" tickLine={false} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fillOpacity: 0.08 }} />
          <Bar dataKey="total" name="Quantidade" fill="var(--accent)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );

  const r = dados?.resumo;
  return (
    <>
      <PageHeader eyebrow="Gestão" title="Relatórios" subtitle="Consultas gerenciais sobre usuários, eventos, propostas e valores do planejamento.">
        <button className="botao-detalhes" onClick={exportar} disabled={!dados}>Exportar eventos (CSV)</button>
      </PageHeader>
      <EstadoApi carregando={carregando} erro={erro} dados={dados} recarregar={recarregar} />
      <AvisoErro erro={erro} dados={dados} />
      {dados && (
        <>
          <section className="cards-resumo">
            <StatCard tone="rosa" label="Cadastros de parceiros" value={r.cadastros.total} />
            <StatCard tone="laranja" label="Pendentes de aprovação" value={r.cadastros.pendentes} />
            <StatCard tone="marinho" label="Eventos" value={r.eventos.total} />
            <StatCard tone="azul" label="Propostas ativas" value={r.propostas.total} />
            <StatCard tone="verde" label="Valor das propostas selecionadas" value={moeda(r.propostas.valorSelecionado)} />
          </section>
          <div className="plan-graficos">
            {grafico('Eventos por status', r.eventos.porStatus)}
            {grafico('Propostas por status', r.propostas.porStatus)}
          </div>
          <DataTable title="Planejamento por evento" columns={colEventos} rows={porEvento} statusKey="status" empty="Nenhum evento cadastrado." />
          <DataTable title="Fornecedores" columns={colForn} rows={fornecedores} empty="Nenhuma proposta enviada ainda." />
        </>
      )}
    </>
  );
}
