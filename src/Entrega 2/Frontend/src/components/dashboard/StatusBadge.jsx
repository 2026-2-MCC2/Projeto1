const classes = { Aprovado: 'approved', Confirmado: 'approved', Recusado: 'rejected' };
export default function StatusBadge({ status }) {
  return <span className={`status-pill ${classes[status] || ''}`}>{status}</span>;
}
