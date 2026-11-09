import { useNavigate } from 'react-router-dom';
import DataTable from '../../../shared/dashboard/DataTable.jsx';

const columns = [
  { key: 'codigo', label: 'ID' }, { key: 'nome', label: 'Evento' }, { key: 'periodo', label: 'Período' },
  { key: 'local', label: 'Local' }, { key: 'publico', label: 'Público' }, { key: 'itens', label: 'Itens' },
  { key: 'propostas', label: 'Propostas' }, { key: 'ticket', label: 'Ticket-alvo' }, { key: 'status', label: 'Status' },
];

export default function EventosTable({ title, eventos }) {
  const navigate = useNavigate();
  return (
    <DataTable title={title} columns={columns} rows={eventos} statusKey="status" actionLabel="Abrir"
      onAction={(e) => navigate(`/organizador/eventos/${e.id}`)}
      empty="Você ainda não criou eventos. Use “Criar evento” para começar." />
  );
}
