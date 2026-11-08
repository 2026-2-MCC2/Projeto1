/** Simulações aproximadas de alterações na percepção das cores.
 * São aplicadas também às fotografias e artes; não representam tratamento
 * nem substituem testes com pessoas com deficiência de visão cromática.
 */
export default function ColorFilters() {
  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
      <defs>
        <filter id="tt-protanopia" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0" />
        </filter>
        <filter id="tt-deuteranopia" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0" />
        </filter>
        <filter id="tt-tritanopia" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0" />
        </filter>
      </defs>
    </svg>
  );
}
