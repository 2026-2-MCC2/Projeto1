import DataTable from '../../components/dashboard/DataTable.jsx';

const columns = [
  { key: 'id', label: 'ID' }, { key: 'nome', label: 'Evento' }, { key: 'fornecedores', label: 'Fornecedor(es)' },
  { key: 'data', label: 'Data' }, { key: 'status', label: 'Status' }, { key: 'valor', label: 'Valor' },
];

export default function EventosTable({ title, eventos }) {
  return <DataTable title={title} columns={columns} rows={eventos} statusKey="status" empty="Você ainda não criou eventos. Use “Criar evento” para começar." />;
}
