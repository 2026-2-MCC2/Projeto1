import { useState } from 'react';
import Header from '../../components/layout/Header.jsx';
import Footer from '../../components/layout/Footer.jsx';
import EventModal from '../../components/events/EventModal.jsx';
import Marketplace from '../../components/events/Marketplace.jsx';

export default function EventsPage() {
  const [selected, setSelected] = useState(null);
  return <><Header/><main className="content-page"><section className="page-intro container"><span className="eyebrow">Agenda TrocaTicket</span><h1>Eventos para viver de perto.</h1><p>Explore a programação e descubra sua próxima experiência.</p></section><Marketplace onSelect={setSelected}/></main><Footer/><EventModal event={selected} onClose={() => setSelected(null)}/></>;
}
