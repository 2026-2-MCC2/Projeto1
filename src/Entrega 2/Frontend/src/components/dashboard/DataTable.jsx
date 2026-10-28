import { useMemo, useState } from 'react';
import StatusBadge from './StatusBadge.jsx';

const norm = (v) => String(v ?? '').toLocaleLowerCase('pt-BR');

/**
 * columns: [{ key, label, render?(row) }]
 * statusKey: coluna usada no filtro "Filtrar" e no selo de status
 * onAction: se existir, adiciona a coluna "Ações" com o botão actionLabel
 */
export default function DataTable({ title, columns, rows, statusKey, onAction, actionLabel = 'Ver detalhes', empty = 'Nada por aqui ainda.' }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Todos');
  const [sortKey, setSortKey] = useState('');

  const statuses = useMemo(() => (statusKey ? ['Todos', ...new Set(rows.map((r) => r[statusKey]))] : []), [rows, statusKey]);
  const visible = useMemo(() => {
    const found = rows.filter((r) => (status === 'Todos' || r[statusKey] === status) && norm(Object.values(r).join(' ')).includes(norm(query)));
    return sortKey ? [...found].sort((a, b) => String(a[sortKey]).localeCompare(String(b[sortKey]), 'pt-BR', { numeric: true })) : found;
  }, [rows, query, status, sortKey, statusKey]);

  return (
    <section className="bloco-tabela">
      <div className="bloco-tabela_topo">
        <h2>{title}</h2>
        <div className="filter-tools">
          <input type="search" placeholder="Buscar..." aria-label="Buscar na tabela" value={query} onChange={(e) => setQuery(e.target.value)} />
          {statusKey && <select aria-label="Filtrar por status" value={status} onChange={(e) => setStatus(e.target.value)}>{statuses.map((s) => <option key={s}>{s}</option>)}</select>}
          <select aria-label="Ordenar por" value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
            <option value="">Ordenar por</option>
            {columns.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
      </div>
      {visible.length ? (
        <div className="table-scroll">
          <table className="tabela-pedidos">
            <thead><tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}{onAction && <th>Ações</th>}</tr></thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id}>
                  {columns.map((c) => <td key={c.key}>{c.render ? c.render(row) : c.key === statusKey ? <StatusBadge status={row[c.key]} /> : row[c.key]}</td>)}
                  {onAction && <td><button className="botao-detalhes" onClick={() => onAction(row)}>{actionLabel}</button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <div className="no-results"><strong>{rows.length ? 'Nenhum resultado para essa busca.' : empty}</strong></div>}
    </section>
  );
}
