import { useEffect } from 'react';

const ALVOS = 'a,button,h1,h2,h3,h4,label,p,li,summary,[role="button"],img[alt]';
const textoDe = (el) => (el.getAttribute('aria-label') || el.alt || el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 220);

// Voz narrada (Web Speech API) e Libras (plugin VLibras do governo federal)
export default function useAssistive({ voz, libras }) {
  useEffect(() => {
    if (!voz || !('speechSynthesis' in window)) return undefined;
    let timer;
    const falar = (e) => {
      const alvo = e.target.closest?.(ALVOS);
      const texto = alvo && textoDe(alvo);
      if (!texto) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        window.speechSynthesis.cancel();
        const fala = new SpeechSynthesisUtterance(texto);
        fala.lang = 'pt-BR';
        window.speechSynthesis.speak(fala);
      }, e.type === 'focusin' ? 0 : 450);
    };
    document.addEventListener('focusin', falar);
    document.addEventListener('mouseover', falar);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('focusin', falar);
      document.removeEventListener('mouseover', falar);
      window.speechSynthesis.cancel();
    };
  }, [voz]);

  useEffect(() => {
    let host = document.getElementById('vlibras-host');
    if (!libras) { if (host) host.hidden = true; return; }
    if (host) { host.hidden = false; return; }
    host = document.createElement('div');
    host.id = 'vlibras-host';
    host.innerHTML = '<div vw class="enabled"><div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div></div>';
    document.body.appendChild(host);
    const script = document.createElement('script');
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.onload = () => new window.VLibras.Widget('https://vlibras.gov.br/app');
    document.body.appendChild(script);
  }, [libras]);
}
