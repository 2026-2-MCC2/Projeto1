const OK = ['Aprovado', 'Confirmado', 'Selecionada', 'Aberto para cotação', 'Orçamento fechado'];
const RUIM = ['Recusado', 'Rejeitado', 'Cancelada', 'Não selecionada'];
export default function StatusBadge({ status }) {
  const classe = OK.includes(status) ? 'approved' : RUIM.includes(status) ? 'rejected' : '';
  return <span className={`status-pill ${classe}`}>{status}</span>;
}
