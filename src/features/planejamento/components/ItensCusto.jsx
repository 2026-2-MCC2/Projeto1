import { CATEGORIAS, STATUS_EVENTO, STATUS_PROPOSTA, fmtData, hojeISO, moeda } from '../services/planejamento.js';
import StatusBadge from '../../../shared/dashboard/StatusBadge.jsx';
import { Campo, Erro, useAcao } from './ui.jsx';

// Itens de composição de custo + comparação e seleção das propostas recebidas (RF06, RF11, RF12).
export default function ItensCusto({ evento, itens, propostas, acoes, notify, recarregar }) {
  const [erro, executar] = useAcao(notify);
  const rodar = (promessa, sucesso, depois) => executar(promessa, sucesso, (r) => { recarregar(); depois?.(r); });
  const travado = evento.status === STATUS_EVENTO.fechado;
  const hoje = hojeISO();

  const adicionar = (e) => {
    const form = e.currentTarget;
    e.preventDefault();
    rodar(acoes.adicionarItem(evento.id, Object.fromEntries(new FormData(form))), 'Item adicionado.', () => form.reset());
  };

  return (
    <section className="bloco-tabela plan-bloco" aria-labelledby="sec-itens">
      <div className="bloco-tabela_topo"><h2 id="sec-itens">Itens de composição de custo</h2></div>

      {!travado && (
        <form className="plan-form" onSubmit={adicionar}>
          <Campo id="it-cat" label="Categoria">
            <select id="it-cat" name="categoria" defaultValue={CATEGORIAS[0]}>{CATEGORIAS.map((c) => <option key={c}>{c}</option>)}</select>
          </Campo>
          <Campo id="it-desc" label="Descrição do item" className="plan-campo--cheio">
            <input id="it-desc" name="descricao" required minLength={3} placeholder="Ex.: Iluminação de palco e pista" />
          </Campo>
          <Campo id="it-qtd" label="Quantidade">
            <input id="it-qtd" name="quantidade" type="number" min="1" step="1" defaultValue="1" required />
          </Campo>
          <div className="plan-form_acoes"><button className="botao-principal" type="submit">+ Adicionar item</button></div>
        </form>
      )}
      <Erro texto={erro} />

      {!itens.length && <p className="plan-vazio_texto">Nenhum item cadastrado. Adicione os itens que precisam de fornecedor para abrir a cotação.</p>}

      <div className="plan-itens">
        {itens.map((item) => {
          const doItem = propostas.filter((p) => p.itemId === item.id && p.status !== STATUS_PROPOSTA.cancelada).sort((a, b) => a.valor - b.valor);
          const vigentes = doItem.filter((p) => p.validade >= hoje && p.status !== STATUS_PROPOSTA.nao);
          const menor = vigentes.length > 1 ? Math.min(...vigentes.map((p) => p.valor)) : null;
          const escolhida = doItem.find((p) => p.status === STATUS_PROPOSTA.selecionada);
          return (
            <article className="plan-item" key={item.id}>
              <header>
                <div>
                  <span className="plan-tag">{item.categoria}</span>
                  <h3>{item.descricao} <small>× {item.quantidade}</small></h3>
                </div>
                <div className="plan-item_lado">
                  {escolhida ? <StatusBadge status="Selecionada" /> : <span className="plan-aviso">Sem proposta selecionada</span>}
                  {!travado && <button className="botao-detalhes" type="button" onClick={() => window.confirm('Remover este item e suas propostas?') && rodar(acoes.removerItem(evento.id, item.id), 'Item removido.')}>Remover</button>}
                </div>
              </header>

              {doItem.length ? (
                <div className="table-scroll">
                  <table className="tabela-pedidos plan-tabela">
                    <thead><tr><th>Fornecedor</th><th>Valor</th><th>Validade</th><th>Detalhes</th><th>Status</th>{!travado && <th>Ação</th>}</tr></thead>
                    <tbody>
                      {doItem.map((p) => {
                        const vencida = p.validade < hoje;
                        return (
                          <tr key={p.id} className={p.status === STATUS_PROPOSTA.selecionada ? 'plan-linha--ok' : ''}>
                            <td>{p.fornecedorNome}</td>
                            <td><strong>{moeda(p.valor)}</strong>{menor === p.valor && <span className="plan-tag plan-tag--ok">Menor valor</span>}</td>
                            <td>{fmtData(p.validade)}{vencida && <span className="plan-tag plan-tag--ruim">Vencida</span>}</td>
                            <td className="plan-detalhes">{p.descricao}{p.observacoes && <small>{p.observacoes}</small>}</td>
                            <td><StatusBadge status={p.status} /></td>
                            {!travado && (
                              <td>
                                {p.status === STATUS_PROPOSTA.enviada && <button className="botao-principal plan-mini" disabled={vencida} onClick={() => rodar(acoes.selecionarProposta(evento.id, p.id), 'Proposta selecionada.')}>Selecionar</button>}
                                {p.status === STATUS_PROPOSTA.selecionada && <button className="botao-detalhes" onClick={() => rodar(acoes.desfazerSelecao(evento.id, item.id), 'Seleção desfeita.')}>Desfazer</button>}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : <p className="plan-vazio_texto">{evento.status === STATUS_EVENTO.aberto ? 'Aguardando propostas dos fornecedores.' : 'Nenhuma proposta. Abra o evento para cotação para receber propostas.'}</p>}
            </article>
          );
        })}
      </div>
    </section>
  );
}
