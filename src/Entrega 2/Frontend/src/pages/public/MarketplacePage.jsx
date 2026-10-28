import { useState } from 'react';
import Header from '../../components/layout/Header.jsx';
import Footer from '../../components/layout/Footer.jsx';
import EventModal from '../../components/events/EventModal.jsx';
import Marketplace from '../../components/events/Marketplace.jsx';

export default function MarketplacePage() {
  const [selected, setSelected] = useState(null);
  return <><Header/><main className="content-page"><Marketplace onSelect={setSelected}/></main><Footer/><EventModal event={selected} onClose={() => setSelected(null)}/></>;
}
