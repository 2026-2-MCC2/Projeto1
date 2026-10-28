import { useStore } from '../context/StoreContext.jsx';
import { solicitacoesIniciais } from '../data/painelMock.js';
import useLocalState from './useLocalState.js';

export default function useSolicitacoes() {
  const { account, notify } = useStore();
  const [lista, setLista] = useLocalState('tt-solicitacoes', solicitacoesIniciais);

  const criar = ({ tipo, problema }) => {
    const nova = {
      id: `SOL-${Date.now().toString().slice(-5)}`, nome: account?.name || 'Sem nome', autor: account?.role,
      tipo, problema, data: new Date().toISOString().slice(0, 10), status: 'Em análise',
    };
    setLista((atual) => [nova, ...atual]);
    notify('Solicitação enviada para análise.');
  };
  const alterarStatus = (id, status) => {
    setLista((atual) => atual.map((s) => (s.id === id ? { ...s, status } : s)));
    notify(`Solicitação ${status.toLowerCase()}.`);
  };
  return { lista, criar, alterarStatus };
}
