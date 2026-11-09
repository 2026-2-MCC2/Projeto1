import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../../../shared/hooks/useApi.js';
import { leituras } from '../../planejamento/services/planejamentoApi.js';
import { CATEGORIAS, periodo } from '../../planejamento/services/planejamento.js';
import PageHeader from '../../../shared/dashboard/PageHeader.jsx';
import { AvisoErro, EstadoApi } from '../../planejamento/components/ui.jsx';

// Eventos abertos para cotação (RF08 e RF09).
export default function EventosFornecedor() {
  const { dados, carregando, erro, recarregar } = useApi(() => leituras.cotacoes(), []);
  const [categoria, setCategoria] = useState('Todas');
  const [busca, setBusca] = useState('');

  const lista = useMemo(() => (dados?.eventos ?? []).filter((e) => (categoria === 'Todas' || e.categorias.includes(categoria))
    && `${e.nome} ${e.local}`.toLocaleLowerCase('pt-BR').includes(busca.trim().toLocaleLowerCase('pt-BR'))), [dados, categoria, busca]);

  return (
    <>
      <PageHeader eyebrow="Oportunidades" title="Eventos disponíveis" subtitle="Veja os eventos abertos para cotação e envie propostas para os itens que você atende." />
      <EstadoApi carregando={carregando} erro={erro} dados={dados} recarregar={recarregar} />
      <AvisoErro erro={erro} dados={dados} />
      {dados && (
        <>
          <div className="plan-filtros">
            <input type="search" placeholder="Buscar por evento ou local…" aria-label="Buscar eventos" value={busca} onChange={(e) => setBusca(e.target.value)} />
            <select aria-label="Filtrar por categoria de item" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              {['Todas', ...CATEGORIAS].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          {lista.length ? (
            <div className="plan-cards">
              {lista.map((e) => (
                <article className="plan-card" key={e.id}>
                  <h2>{e.nome}</h2>
                  <p className="plan-card_meta">{periodo(e.inicio, e.fim)} · {e.local}</p>
                  <p className="plan-card_meta">Público: {e.publicoMin.toLocaleString('pt-BR')} a {e.publicoMax.toLocaleString('pt-BR')}</p>
                  <ul className="plan-card_tags">{e.categorias.map((c) => <li key={c} className="plan-tag">{c}</li>)}</ul>
                  <p className="plan-card_meta"><strong>{e.totalItens}</strong> {e.totalItens === 1 ? 'item' : 'itens'} para cotar{e.minhasPropostas ? ` · ${e.minhasPropostas} proposta(s) sua(s)` : ''}</p>
                  <Link className="botao-principal" to={`/fornecedor/eventos/${e.id}`}>Ver itens e enviar proposta</Link>
                </article>
              ))}
            </div>
          ) : <section className="bloco-tabela plan-vazio"><h2>Nenhum evento encontrado</h2><p>Não há eventos abertos para cotação com esses filtros no momento.</p></section>}
        </>
      )}
    </>
  );
}
