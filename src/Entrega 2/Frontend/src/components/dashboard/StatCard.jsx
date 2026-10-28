export default function StatCard({ label, value, tone = 'rosa' }) {
  return (
    <article className={`card-resumo card-resumo--${tone}`}>
      <span className="card-resumo_rotulo">{label}</span>
      <span className="card-resumo_valor">{value}</span>
    </article>
  );
}
