import { useState } from 'react';
import DataTable from './DataTable.jsx';
import DetailsModal from './DetailsModal.jsx';

const columns = [
  { key: 'id', label: 'ID' }, { key: 'nome', label: 'Nome' }, { key: 'tipo', label: 'Tipo' },
  { key: 'data', label: 'Data', render: (r) => new Date(`${r.data}T12:00`).toLocaleDateString('pt-BR') },
  { key: 'problema', label: 'Problema' }, { key: 'status', label: 'Status' },
];

// canReview: admin pode aprovar/recusar dentro dos detalhes.
export default function SolicitacoesTable({ title, rows, canReview = false, onReview }) {
  const [selected, setSelected] = useState(null);
  const decide = (status) => { onReview(selected.id, status); setSelected(null); };
  return (
    <>
      <DataTable title={title} columns={columns} rows={rows} statusKey="status" onAction={setSelected} empty="Nenhuma solicitação por aqui ainda." />
      {selected && (
        <DetailsModal title={selected.id} onClose={() => setSelected(null)}
          fields={[['Nome', selected.nome], ['Tipo', selected.tipo], ['Problema', selected.problema], ['Status', selected.status]]}>
          {canReview && selected.status === 'Em análise' && (
            <div className="modal-acoes">
              <button className="botao-principal" onClick={() => decide('Aprovado')}>Aprovar</button>
              <button className="botao-detalhes" onClick={() => decide('Recusado')}>Recusar</button>
            </div>
          )}
        </DetailsModal>
      )}
    </>
  );
}
