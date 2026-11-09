import { useEffect, useState } from 'react';

const passos = [
  ['[data-tour="menu"]', 'Menu principal', 'Aqui você vai para Início, Eventos, Marketplace, Ingressos, Pedidos e sua conta.'],
  ['[data-tour="carrinho"]', 'Carrinho', 'Os ingressos que você escolher ficam aqui até finalizar o pedido.'],
  ['[data-tour="conta"]', 'Sua conta', 'Entre ou crie uma conta para ver ingressos e pedidos.'],
  ['[data-tour="contraste"]', 'Contraste', 'Alterna entre o tema claro e o escuro.'],
  ['[data-tour="acessibilidade"]', '+Acessibilidade', 'Abre as opções de daltonismo, voz narrada, Libras e muito mais.'],
];

export default function TutorialGuide({ onClose }) {
  const [i, setI] = useState(0);
  const [, titulo, texto] = passos[i];

  useEffect(() => {
    const alvo = document.querySelector(passos[i][0]);
    alvo?.classList.add('tour-destaque');
    alvo?.scrollIntoView?.({ block: 'nearest' });
    return () => alvo?.classList.remove('tour-destaque');
  }, [i]);

  return (
    <aside className="tutorial" role="dialog" aria-label="Tutorial do site">
      <span className="eyebrow">Passo {i + 1} de {passos.length}</span>
      <h3>{titulo}</h3>
      <p>{texto}</p>
      <div className="tutorial_acoes">
        <button onClick={onClose}>Sair</button>
        <button onClick={() => setI(i - 1)} disabled={i === 0}>Anterior</button>
        <button className="botao-principal" onClick={() => (i === passos.length - 1 ? onClose() : setI(i + 1))}>{i === passos.length - 1 ? 'Concluir' : 'Próximo'}</button>
      </div>
    </aside>
  );
}
