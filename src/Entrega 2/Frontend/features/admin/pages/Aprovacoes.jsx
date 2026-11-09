import { useMemo, useState } from 'react';
import { useStore } from '../../../app/providers/StoreContext.jsx';
import useApi from '../../../shared/hooks/useApi.js';
import { acoes, leituras } from '../../planejamento/services/planejamentoApi.js';
import { fmtData } from '../../planejamento/services/planejamento.js';
import DataTable from '../../../shared/dashboard/DataTable.jsx';
import DetailsModal from '../../../shared/dashboard/DetailsModal.jsx';
import PageHeader from '../../../shared/dashboard/PageHeader.jsx';
import { AvisoErro, Erro, EstadoApi } from '../../planejamento/components/ui.jsx';

const PAPEL = { organizador: 'Organizador', fornecedor: 'Fornecedor' };

export const colunasCadastros = [
  { key: 'codigo', label: 'ID' }, { key: 'nome', label: 'Nome' }, { key: 'papel', label: 'Perfil' },
  { key: 'email', label: 'E-mail' }, { key: 'criado', label: 'Cadastro em' }, { key: 'status', label: 'Status' },
];
export const linhasCadastros = (cadastros) => cadastros.map((c) => ({ ...c, codigo: `PA-${String(c.id).padStart(3, '0')}`, papel: PAPEL[c.perfil], criado: fmtData(c.criadoEm) }));

// Aprovação de cadastros de Organizadores e Fornecedores (RF03) com histórico de decisões.
export default function Aprovacoes() {
  const { notify } = useStore();
  const { dados, carregando, erro: erroCarga, recarregar } = useApi(async () => {
    const [cadastros, auditoria] = await Promise.all([leituras.cadastros(), leituras.auditoria()]);
    return { cadastros: cadastros.cadastros, decisoes: auditoria.decisoes };
  }, []);
  const [sel, setSel] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [erro, setErro] = useState('');
  const linhas = useMemo(() => linhasCadastros(dados?.cadastros ?? []), [dados]);
  const atual = sel && linhas.find((p) => p.id === sel);

  const fechar = () => { setSel(null); setMotivo(''); setErro(''); };
  const decidir = async (status) => {
    const r = await acoes.decidirCadastro(atual.id, status, motivo);
    if (!r.ok) return setErro(r.erro);
    notify(`Cadastro ${status === 'Aprovado' ? 'aprovado' : 'rejeitado'}.`);
    fechar();
    recarregar();
  };

  return (
    <>
      <PageHeader eyebrow="Administração" title="Aprovação de cadastros" subtitle="Organizadores e fornecedores só operam na plataforma depois da sua aprovação." />
      <EstadoApi carregando={carregando} erro={erroCarga} dados={dados} recarregar={recarregar} />
      <AvisoErro erro={erroCarga} dados={dados} />
      {dados && (
        <>
          <DataTable title="Cadastros" columns={colunasCadastros} rows={linhas} statusKey="status" onAction={(r) => setSel(r.id)} empty="Nenhum cadastro recebido ainda." />
          {atual && (
            <DetailsModal title={`${atual.codigo} — ${atual.nome}`} onClose={fechar}
              fields={[['Perfil', PAPEL[atual.perfil]], ['CNPJ', atual.cnpj], ['E-mail', atual.email], ['Telefone', atual.telefone || '—'],
                ...(atual.perfil === 'fornecedor' ? [['Atuação', atual.atuacao.join(', ') || '—']] : []),
                ['Status', atual.status], ...(atual.justificativa ? [['Última observação', atual.justificativa]] : [])]}>
              <label htmlFor="ap-motivo" className="plan-rotulo">Observação da decisão (opcional)</label>
              <input id="ap-motivo" className="plan-input" value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={255} />
              <Erro texto={erro} />
              <div className="modal-acoes">
                {atual.status !== 'Aprovado' && <button className="botao-principal" onClick={() => decidir('Aprovado')}>Aprovar</button>}
                {atual.status !== 'Rejeitado' && <button className="botao-detalhes" onClick={() => decidir('Rejeitado')}>Rejeitar</button>}
              </div>
            </DetailsModal>
          )}
          <section className="bloco-tabela plan-bloco" aria-labelledby="sec-hist">
            <div className="bloco-tabela_topo"><h2 id="sec-hist">Histórico de decisões</h2></div>
            {dados.decisoes.length ? (
              <div className="table-scroll">
                <table className="tabela-pedidos plan-tabela">
                  <thead><tr><th>Quando</th><th>Cadastro</th><th>Decisão</th><th>Por</th><th>Observação</th></tr></thead>
                  <tbody>{dados.decisoes.slice(0, 20).map((a) => (
                    <tr key={a.id}><td>{a.quando ? new Date(a.quando.replace(' ', 'T') + 'Z').toLocaleString('pt-BR') : '—'}</td><td>{a.cadastro}</td><td>{a.decisao}</td><td>{a.administrador ?? '—'}</td><td>{a.justificativa || '—'}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            ) : <p className="plan-vazio_texto">Nenhuma decisão registrada ainda.</p>}
          </section>
        </>
      )}
    </>
  );
}
