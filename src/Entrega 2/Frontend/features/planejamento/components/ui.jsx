import { useState } from 'react';

// Campo de formulário com rótulo ligado ao input (acessibilidade).
export function Campo({ id, label, dica, children, className = '' }) {
  return (
    <div className={`plan-campo ${className}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {dica && <small>{dica}</small>}
    </div>
  );
}

// Mensagem de erro de formulário (aria-live para leitores de tela).
export const Erro = ({ texto }) => (texto ? <p className="campo-erro" role="alert">{texto}</p> : null);

// Estado "não encontrado" padrão dos painéis.
export function Vazio({ titulo, texto, children }) {
  return (
    <section className="bloco-tabela plan-vazio">
      <h2>{titulo}</h2>
      <p>{texto}</p>
      {children}
    </section>
  );
}

// Telas que dependem da API: mostra "carregando" na primeira vez e "erro + tentar de novo" se falhar.
// Devolve true quando a tela pode continuar a renderizar os dados.
export function EstadoApi({ carregando, erro, dados, recarregar }) {
  if (dados) return null;
  if (carregando) return <section className="bloco-tabela plan-vazio" role="status" aria-live="polite"><p>Carregando…</p></section>;
  return (
    <section className="bloco-tabela plan-vazio" role="alert">
      <h2>Não foi possível carregar</h2>
      <p>{erro || 'Tente novamente em instantes.'}</p>
      <button className="botao-principal" type="button" onClick={recarregar}>Tentar de novo</button>
    </section>
  );
}

// Aviso discreto quando uma ATUALIZAÇÃO falha mas já há dados na tela.
export const AvisoErro = ({ erro, dados }) => (erro && dados ? <p className="campo-erro" role="alert">{erro}</p> : null);

// Hook para formulários e botões: executa a ação (promessa da API), guarda o erro e avisa o sucesso.
export function useAcao(notify) {
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const executar = async (promessa, sucesso, aoSucesso) => {
    setOcupado(true);
    try {
      const resultado = await promessa;
      if (!resultado.ok) { setErro(resultado.erro); return false; }
      setErro('');
      if (sucesso) notify(sucesso);
      aoSucesso?.(resultado);
      return true;
    } finally { setOcupado(false); }
  };
  return [erro, executar, setErro, ocupado];
}
