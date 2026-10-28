import useSolicitacoes from '../../hooks/useSolicitacoes.js';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import SolicitacoesTable from '../../components/dashboard/SolicitacoesTable.jsx';

export default function Solicitacoes() {
  const { lista, alterarStatus } = useSolicitacoes();
  return (
    <>
      <PageHeader eyebrow="Administração" title="Solicitações" subtitle="Analise e responda às solicitações de fornecedores e organizadores." />
      <SolicitacoesTable title="Todas as solicitações" rows={lista} canReview onReview={alterarStatus} />
    </>
  );
}
