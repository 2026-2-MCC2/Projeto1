import eventsData from '../../data/eventos.json';
import useSolicitacoes from '../../hooks/useSolicitacoes.js';
import PageHeader from '../../components/dashboard/PageHeader.jsx';

export default function EventosFornecedor() {
  const { criar } = useSolicitacoes();
  return (
    <>
      <PageHeader eyebrow="Eventos" title="Eventos disponíveis" subtitle="Escolha o próximo evento para fornecer!" />
      <section className="eventos-grid">
        {eventsData.map((e) => (
          <article className="evento-fornecedor" key={e.id}>
            <img src={e.imagem} alt={e.imagemAlt || ''} loading="lazy" />
            <div className="evento-fornecedor_corpo">
              <h3>{e.nome}</h3>
              <p>{e.local}</p>
              <p className="muted">Período: {e.data}</p>
              <div className="evento-fornecedor_rodape">
                <strong>{e.preco}</strong>
                <button className="botao-detalhes" onClick={() => criar({ tipo: 'Fornecimento', problema: `Fornecer para ${e.nome}` })} aria-label={`Solicitar fornecimento para ${e.nome}`}>Solicitar ↗</button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
