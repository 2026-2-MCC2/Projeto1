export default function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <header className="painel_topo page-header">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="painel_titulo">{title}</h1>
        {subtitle && <p className="painel_subtitulo">{subtitle}</p>}
      </div>
      {children}
    </header>
  );
}
