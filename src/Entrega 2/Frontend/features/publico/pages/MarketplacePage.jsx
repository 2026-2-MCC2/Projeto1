import { useState } from 'react';
import Header from '../../../shared/layout/Header.jsx';
import Footer from '../../../shared/layout/Footer.jsx';
import EventModal from '../components/EventModal.jsx';
import Marketplace from '../components/Marketplace.jsx';

export default function MarketplacePage() {
  const [selected, setSelected] = useState(null);
  return <><Header/><main className="content-page"><Marketplace onSelect={setSelected}/></main><Footer/><EventModal event={selected} onClose={() => setSelected(null)}/></>;
}
