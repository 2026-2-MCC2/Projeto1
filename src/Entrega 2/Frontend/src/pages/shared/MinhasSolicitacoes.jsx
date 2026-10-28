import { useStore } from '../../context/StoreContext.jsx';
import useSolicitacoes from '../../hooks/useSolicitacoes.js';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import SolicitacoesTable from '../../components/dashboard/SolicitacoesTable.jsx';

export default function MinhasSolicitacoes() {
  const { account } = useStore();
  const { lista } = useSolicitacoes();
  const minhas = lista.filter((s) => s.autor === account.role);
  return (
    <>
      <PageHeader eyebrow="Solicitações" title="Análise de solicitações" subtitle="Histórico de todas as solicitações a serem resolvidas ou que já foram resolvidas." />
      <SolicitacoesTable title="Minhas solicitações" rows={minhas} />
    </>
  );
}
