import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../../app/providers/StoreContext.jsx';
import useApi from '../../../shared/hooks/useApi.js';
import { leituras } from '../../planejamento/services/planejamentoApi.js';
import PageHeader from '../../../shared/dashboard/PageHeader.jsx';
import StatCard from '../../../shared/dashboard/StatCard.jsx';
import DataTable from '../../../shared/dashboard/DataTable.jsx';
import { AvisoErro, EstadoApi } from '../../planejamento/components/ui.jsx';
import { colunasCadastros, linhasCadastros } from './Aprovacoes.jsx';

export default function AdminDashboard() {
  const { account } = useStore();
  const navigate = useNavigate();
  const { dados, carregando, erro, recarregar } = useApi(async () => {
    const [resumo, cadastros] = await Promise.all([leituras.resumo(), leituras.cadastros()]);
    return { resumo, cadastros: cadastros.cadastros };
  }, []);
  const pendentes = (dados?.cadastros ?? []).filter((c) => c.status === 'Pendente');
  const emCotacao = dados?.resumo.eventos.porStatus.find((s) => s.nome === 'Aberto para cotação')?.total ?? 0;
  return (
    <>
      <PageHeader eyebrow="Painel do administrador" title={`Olá, ${account.name}!`} subtitle="Visão geral dos cadastros, eventos e cotações da plataforma." />
      <EstadoApi carregando={carregando} erro={erro} dados={dados} recarregar={recarregar} />
      <AvisoErro erro={erro} dados={dados} />
      {dados && (
        <>
          <section className="cards-resumo">
            <StatCard tone="laranja" label="Cadastros pendentes" value={dados.resumo.cadastros.pendentes} />
            <StatCard tone="rosa" label="Organizadores aprovados" value={dados.resumo.cadastros.organizadores} />
            <StatCard tone="verde" label="Fornecedores aprovados" value={dados.resumo.cadastros.fornecedores} />
            <StatCard tone="marinho" label="Eventos em cotação" value={emCotacao} />
            <StatCard tone="azul" label="Propostas ativas" value={dados.resumo.propostas.total} />
          </section>
          <DataTable title="Cadastros aguardando análise" columns={colunasCadastros} rows={linhasCadastros(pendentes)} statusKey="status"
            actionLabel="Analisar" onAction={() => navigate('/admin/cadastros')} empty="Nenhum cadastro pendente. Tudo em dia!" />
          <p><Link className="botao-detalhes" to="/admin/eventos">Ver eventos da plataforma</Link></p>
        </>
      )}
    </>
  );
}
