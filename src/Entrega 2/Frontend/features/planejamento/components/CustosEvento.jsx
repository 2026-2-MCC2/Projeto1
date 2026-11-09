import { COBRANCAS, STATUS_EVENTO, TIPOS_CUSTO, moeda } from '../services/planejamento.js';
import { Campo, Erro, useAcao } from './ui.jsx';

// Custos fiscais, operacionais, variáveis e outros, que não vêm de propostas (RF07).
export default function CustosEvento({ evento, custos, acoes, notify, recarregar }) {
  const [erro, executar] = useAcao(notify);
  const rodar = (promessa, sucesso, depois) => executar(promessa, sucesso, (r) => { recarregar(); depois?.(r); });
  const travado = evento.status === STATUS_EVENTO.fechado;
  const adicionar = (e) => {
    const form = e.currentTarget;
    e.preventDefault();
    rodar(acoes.adicionarCusto(evento.id, Object.fromEntries(new FormData(form))), 'Custo adicionado.', () => form.reset());
  };
  return (
    <section className="bloco-tabela plan-bloco" aria-labelledby="sec-custos">
      <div className="bloco-tabela_topo"><h2 id="sec-custos">Outros custos do evento</h2></div>
      {!travado && (
        <form className="plan-form" onSubmit={adicionar}>
          <Campo id="cu-tipo" label="Tipo"><select id="cu-tipo" name="tipo" defaultValue="Fiscal">{TIPOS_CUSTO.map((t) => <option key={t}>{t}</option>)}</select></Campo>
          <Campo id="cu-desc" label="Descrição" className="plan-campo--cheio"><input id="cu-desc" name="descricao" required minLength={3} placeholder="Ex.: ECAD e impostos" /></Campo>
          <Campo id="cu-valor" label="Valor (R$)"><input id="cu-valor" name="valor" type="number" min="0.01" step="0.01" required /></Campo>
          <Campo id="cu-cob" label="Cobrança" dica="“Por participante” é multiplicado pelo público no cálculo do ticket.">
            <select id="cu-cob" name="cobranca" defaultValue="total">{Object.entries(COBRANCAS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          </Campo>
          <div className="plan-form_acoes"><button className="botao-principal" type="submit">+ Adicionar custo</button></div>
        </form>
      )}
      <Erro texto={erro} />
      {custos.length ? (
        <div className="table-scroll">
          <table className="tabela-pedidos plan-tabela">
            <thead><tr><th>Tipo</th><th>Descrição</th><th>Cobrança</th><th>Valor</th>{!travado && <th>Ação</th>}</tr></thead>
            <tbody>
              {custos.map((c) => (
                <tr key={c.id}>
                  <td>{c.tipo}</td><td>{c.descricao}</td><td>{COBRANCAS[c.cobranca]}</td><td><strong>{moeda(c.valor)}</strong></td>
                  {!travado && <td><button className="botao-detalhes" onClick={() => rodar(acoes.removerCusto(evento.id, c.id), 'Custo removido.')}>Remover</button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="plan-vazio_texto">Nenhum custo cadastrado ainda.</p>}
    </section>
  );
}
