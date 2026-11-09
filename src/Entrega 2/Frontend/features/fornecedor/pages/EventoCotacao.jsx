import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '../../../app/providers/StoreContext.jsx';
import useApi from '../../../shared/hooks/useApi.js';
import { acoes, leituras } from '../../planejamento/services/planejamentoApi.js';
import { STATUS_EVENTO, fmtData, moeda, periodo } from '../../planejamento/services/planejamento.js';
import PageHeader from '../../../shared/dashboard/PageHeader.jsx';
import StatusBadge from '../../../shared/dashboard/StatusBadge.jsx';
import PropostaForm from '../../planejamento/components/PropostaForm.jsx';
import { AvisoErro, EstadoApi, Vazio } from '../../planejamento/components/ui.jsx';

// Itens de um evento + envio, edição e cancelamento de propostas (RF10).
export default function EventoCotacao() {
  const { id } = useParams();
  const { notify } = useStore();
  const [editando, setEditando] = useState(null);
  const { dados, carregando, erro, recarregar } = useApi(() => leituras.cotacao(id), [id]);

  if (!dados) {
    if (erro && /não dispon|não encontrado/i.test(erro)) {
      return <Vazio titulo="Evento não disponível" texto="Este evento não existe ou ainda não foi aberto para cotação."><Link className="botao-principal" to="/fornecedor/eventos">Ver eventos disponíveis</Link></Vazio>;
    }
    return <EstadoApi carregando={carregando} erro={erro} dados={dados} recarregar={recarregar} />;
  }
  const { evento, itens } = dados;
  const aberto = evento.status === STATUS_EVENTO.aberto;

  const enviar = (itemId) => async (d) => { const r = await acoes.enviarProposta(evento.id, itemId, d); if (r.ok) { notify('Proposta enviada.'); recarregar(); } return r; };
  const salvar = (p) => async (d) => { const r = await acoes.editarProposta(p.id, d); if (r.ok) { notify('Proposta atualizada.'); setEditando(null); recarregar(); } return r; };
  const cancelar = async (p) => {
    if (!window.confirm('Cancelar esta proposta?')) return;
    const r = await acoes.cancelarProposta(p.id);
    notify(r.ok ? 'Proposta cancelada.' : r.erro);
    if (r.ok) recarregar();
  };

  return (
    <>
      <PageHeader eyebrow="Cotação" title={evento.nome} subtitle={`${periodo(evento.inicio, evento.fim)} · ${evento.local} · público de ${evento.publicoMin.toLocaleString('pt-BR')} a ${evento.publicoMax.toLocaleString('pt-BR')}`}>
        <Link className="botao-detalhes" to="/fornecedor/eventos">← Eventos</Link>
      </PageHeader>
      <AvisoErro erro={erro} dados={dados} />
      {!aberto && <p className="plan-alerta" role="status">A cotação deste evento está {evento.status === STATUS_EVENTO.fechado ? 'fechada' : 'encerrada'}. Novas propostas não são aceitas.</p>}
      {evento.descricao && <p className="plan-descricao">{evento.descricao}</p>}

      <div className="plan-itens">
        {itens.map((item) => {
          const p = item.minhaProposta;
          return (
            <article className="plan-item" key={item.id}>
              <header>
                <div><span className="plan-tag">{item.categoria}</span><h3>{item.descricao} <small>× {item.quantidade}</small></h3></div>
                <small className="plan-item_lado">{item.totalPropostas} {item.totalPropostas === 1 ? 'proposta recebida' : 'propostas recebidas'}</small>
              </header>
              {p && editando !== p.id && (
                <div className="plan-minha">
                  <div><strong>{moeda(p.valor)}</strong> <StatusBadge status={p.status} /></div>
                  <p>{p.descricao}{p.observacoes && <small> · {p.observacoes}</small>}</p>
                  <p><small>Válida até {fmtData(p.validade)}</small></p>
                  {p.status === 'Enviada' && aberto && (
                    <div className="plan-form_acoes">
                      <button className="botao-detalhes" onClick={() => setEditando(p.id)}>Editar</button>
                      <button className="botao-detalhes plan-perigo" onClick={() => cancelar(p)}>Cancelar proposta</button>
                    </div>
                  )}
                </div>
              )}
              {p && editando === p.id && <PropostaForm idBase={`ed-${p.id}`} inicial={p} rotulo="Salvar proposta" onSubmit={salvar(p)} onCancelar={() => setEditando(null)} />}
              {!p && aberto && <PropostaForm idBase={`nv-${item.id}`} onSubmit={enviar(item.id)} />}
              {!p && !aberto && <p className="plan-vazio_texto">Você não enviou proposta para este item.</p>}
            </article>
          );
        })}
      </div>
    </>
  );
}
