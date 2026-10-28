import eventsData from '../data/eventos.json';
import { useStore } from '../context/StoreContext.jsx';
import useLocalState from './useLocalState.js';

const inicial = eventsData.slice(0, 3).map((e, i) => ({
  id: `EV-${100 + i}`, nome: e.nome, fornecedores: i + 1, data: e.data, status: i === 2 ? 'Em análise' : 'Aprovado', valor: e.preco,
}));

export default function useMeusEventos() {
  const { notify } = useStore();
  const [eventos, setEventos] = useLocalState('tt-org-eventos', inicial);
  const criar = ({ nome, data, valor }) => {
    setEventos((atual) => [{ id: `EV-${Date.now().toString().slice(-5)}`, nome, fornecedores: 0, data, status: 'Em análise', valor }, ...atual]);
    notify('Evento criado e enviado para análise.');
  };
  return { eventos, criar };
}
