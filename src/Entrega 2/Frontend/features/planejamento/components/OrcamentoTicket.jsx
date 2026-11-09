import { lazy, Suspense } from 'react';
import { calcularTicket, cenarios, consolidar, moeda, serieTicket } from '../services/planejamento.js';

const TicketChart = lazy(() => import('./TicketChart.jsx'));

// Orçamento consolidado e ticket estimado (RF12 e RF13).
export default function OrcamentoTicket({ evento, itens, propostas, custos }) {
  const orc = consolidar({ itens, propostas, custos });
  const lista = cenarios(evento, orc);
  const invalido = lista.find((c) => !c.ok);
  const serie = serieTicket(evento, orc);
  const pubRef = evento.publicoEsperado || evento.publicoMax;
  const exemplo = calcularTicket({ custoTotal: orc.custoPara(pubRef), publico: pubRef, margem: evento.margem });

  return (
    <section className="bloco-tabela plan-bloco" aria-labelledby="sec-orc">
      <div className="bloco-tabela_topo"><h2 id="sec-orc">Orçamento consolidado e ticket</h2></div>

      {!!orc.semProposta.length && (
        <p className="plan-alerta" role="status">
          {orc.semProposta.length === 1 ? '1 item ainda não tem' : `${orc.semProposta.length} itens ainda não têm`} proposta selecionada ({orc.semProposta.map((i) => i.descricao).join('; ')}).
          O ticket abaixo está subestimado até que todos sejam fechados.
        </p>
      )}

      <div className="plan-resumo">
        <div><span>Propostas selecionadas</span><strong>{moeda(orc.fixosPropostas)}</strong></div>
        <div><span>Custos fixos do evento</span><strong>{moeda(orc.fixosCustos)}</strong></div>
        <div><span>Custo variável por participante</span><strong>{moeda(orc.porPessoa)}</strong></div>
        <div className="plan-resumo--destaque"><span>Custo fixo consolidado</span><strong>{moeda(orc.custoFixo)}</strong></div>
      </div>

      {invalido ? <p className="campo-erro" role="alert">{invalido.erro}</p> : (
        <div className="table-scroll">
          <table className="tabela-pedidos plan-tabela">
            <caption className="plan-legenda">Margem de lucro definida: <strong>{String(evento.margem).replace('.', ',')}%</strong> sobre a receita</caption>
            <thead><tr><th>Cenário</th><th>Público</th><th>Custo total</th><th>Ticket de equilíbrio</th><th>Ticket-alvo</th><th>Lucro estimado</th></tr></thead>
            <tbody>
              {lista.map((c) => (
                <tr key={c.chave}>
                  <td>{c.rotulo}</td><td>{c.publico.toLocaleString('pt-BR')}</td><td>{moeda(c.custoTotal)}</td>
                  <td>{moeda(c.ticketEquilibrio)}</td><td><strong className="plan-destaque">{moeda(c.ticketAlvo)}</strong></td><td>{moeda(c.lucro)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!invalido && serie.length > 1 && (
        <div className="plan-grafico">
          <h3>Ticket-alvo conforme o público</h3>
          <Suspense fallback={<p role="status">Carregando gráfico…</p>}><TicketChart dados={serie} /></Suspense>
        </div>
      )}

      <details className="plan-formula">
        <summary>Como o ticket é calculado</summary>
        <p><strong>Ticket-alvo</strong> = Custo total ÷ [Público × (1 − Margem)]. A margem é aplicada sobre a <em>receita</em>.</p>
        <p><strong>Ticket de equilíbrio</strong> = Custo total ÷ Público (margem 0%: sem lucro nem prejuízo).</p>
        <p><strong>Custo total</strong> = propostas selecionadas + custos fixos + (custo variável por participante × Público).</p>
        <p><strong>Arredondamento:</strong> sempre para cima, ao centavo, para garantir a margem definida. Validações: público inteiro maior que zero, custo maior ou igual a zero e margem de 0% a 99,99%.</p>
        {exemplo.ok && <p><strong>Exemplo ({pubRef.toLocaleString('pt-BR')} pessoas):</strong> {moeda(exemplo.custoTotal)} ÷ [{pubRef.toLocaleString('pt-BR')} × (1 − {evento.margem / 100})] = {moeda(exemplo.ticketAlvo)}.</p>}
      </details>
    </section>
  );
}
