export default function Switch({ checked, onChange, label, id }) {
  return (
    <label className="switch" htmlFor={id}>
      <input id={id} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="switch_trilho" aria-hidden="true" />
      <span className="switch_rotulo">{label}</span>
    </label>
  );
}
