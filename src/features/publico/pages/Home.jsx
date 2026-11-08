import React, { useState } from 'react';
import eventsData from '../../../data/eventos.json';
import Header from '../../../shared/layout/Header.jsx';
import Footer from '../../../shared/layout/Footer.jsx';
import EventModal from '../components/EventModal.jsx';
import Marketplace from '../components/Marketplace.jsx';

export default function Home() {
  const events = eventsData;
  const status = events.length ? 'ready' : 'empty';
  const [selected, setSelected] = useState(null); const [active, setActive] = useState(0); const [email, setEmail] = useState(''); const [feedback, setFeedback] = useState('');
  const track = React.useRef(null);
  const scroll = (index) => { const node = track.current; if (!node) return; const item = node.querySelector('.evento-card-item'); const step = item ? item.getBoundingClientRect().width + 16 : node.clientWidth; const max = Math.max(0, Math.ceil(node.scrollWidth / step) - 1); const next = Math.max(0, Math.min(index, max)); node.scrollTo({ left: next * step, behavior: 'smooth' }); setActive(next); };
  const submit = (e) => { e.preventDefault(); const subscriptions = JSON.parse(localStorage.getItem('tt-newsletter') || '[]'); if (!subscriptions.includes(email.trim().toLowerCase())) subscriptions.push(email.trim().toLowerCase()); localStorage.setItem('tt-newsletter', JSON.stringify(subscriptions)); setFeedback('Inscrição salva neste navegador.'); setEmail(''); };
  return <><Header/><main><section className="container secao-eventos" id="eventos-destaque"><header className="secao-eventos_topo"><div><span className="eyebrow">Viva o próximo momento</span><h1 className="titulo-secao">Encontre seu próximo<br/><span className="accent">grande evento.</span></h1><p className="secao-eventos_subtitulo">Shows, festivais e experiências selecionadas para você.</p></div>{status === 'ready' && <div className="carrossel_controles"><button className="carrossel_seta" onClick={() => scroll(active - 1)} aria-label="Eventos anteriores">←</button><button className="carrossel_seta" onClick={() => scroll(active + 1)} aria-label="Próximos eventos">→</button></div>}</header>
      {status === 'empty' && <p>Nenhum evento em destaque no momento. Volte em breve.</p>}
      {status === 'ready' && <><div className="carrossel"><div className="carrossel_viewport"><div className="carrossel_trilha" ref={track} role="list">{events.map((event) => <article className="evento-card-item" role="listitem" key={event.id}><button className="evento-card" onClick={() => setSelected(event)}><div className={`evento-card_capa evento-card_capa--${event.cor || 'marinho'}`}>{event.imagem && <img src={event.imagem} alt={event.imagemAlt || ''} loading="lazy"/>}<span className="evento-card_badge">{event.categoria}</span><span className="card-arrow">↗</span></div><div className="evento-card_corpo"><h2 className="evento-card_titulo">{event.nome}</h2><dl className="polaroid-meta"><div><dt>Quando</dt><dd>{event.data}{event.periodo ? ` · ${event.periodo}` : ''}</dd></div><div><dt>Horário</dt><dd>{event.horario || 'A confirmar'}</dd></div><div><dt>Onde</dt><dd title={event.local}>{event.local}</dd></div><div><dt>Organiza</dt><dd title={event.organizador || 'Organização a confirmar'}>{event.organizador || 'A confirmar'}</dd></div><div className="polaroid-meta_preco"><dt>Preço médio</dt><dd>{event.precoMedio || event.preco}</dd></div></dl></div></button></article>)}</div></div></div><div className="carrossel_pontos">{events.map((event, i) => <button key={event.id} className={`carrossel_ponto ${active === i ? 'ativo' : ''}`} aria-label={`Ir para ${event.nome}`} onClick={() => scroll(i)}/>)}</div></>}
      <aside className="patrocinado"><span className="patrocinado_icone">✳</span><div className="patrocinado_conteudo"><span className="eyebrow">Fique por dentro</span><h2 className="patrocinado_titulo">Os melhores eventos chegam primeiro.</h2><p>Receba novidades e experiências selecionadas direto no seu e-mail.</p><form className="newsletter-form" onSubmit={submit}><label htmlFor="newsletter-email" className="visually-hidden">Seu e-mail</label><input type="email" id="newsletter-email" placeholder="seu@email.com" value={email} onChange={e=>setEmail(e.target.value)} required/><button type="submit" className="botao-principal">Quero receber <span>→</span></button></form>{feedback && <p className="newsletter-feedback">{feedback}</p>}</div></aside></section>
      <Marketplace onSelect={setSelected}/>
      <section className="home-artwork container" aria-label="A identidade TrocaTicket">
        <figure className="home-artwork_item home-artwork_item--descubra">
          <img className="home-artwork_dark" src="/images/trocaticket-descubra-dark.png" alt="Descubra experiências únicas. Sinta a energia dos shows e eventos." loading="lazy"/>
          <img className="home-artwork_light" src="/images/trocaticket-descubra-light.png" alt="" aria-hidden="true" loading="lazy"/>
        </figure>
        <figure className="home-artwork_item home-artwork_item--memorias">
          <img className="home-artwork_dark" src="/images/trocaticket-memorias-dark.png" alt="Crie memórias e eternize momentos." loading="lazy"/>
          <img className="home-artwork_light" src="/images/trocaticket-memorias-light.png" alt="" aria-hidden="true" loading="lazy"/>
        </figure>
      </section>
    </main><Footer/><EventModal event={selected} onClose={() => setSelected(null)}/></>;
}
