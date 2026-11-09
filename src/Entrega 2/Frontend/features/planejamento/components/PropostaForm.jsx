import { useState } from 'react';
import { hojeISO, somaDias } from '../services/planejamento.js';
import { Campo, Erro } from './ui.jsx';

// Formulário de proposta do fornecedor (criar ou editar). onSubmit devolve { ok, erro }.
export default function PropostaForm({ idBase, inicial, onSubmit, onCancelar, rotulo = 'Enviar proposta' }) {
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    const r = await onSubmit(Object.fromEntries(new FormData(e.currentTarget)));
    setEnviando(false);
    setErro(r.ok ? '' : r.erro);
  };
  return (
    <form className="plan-form plan-form--proposta" onSubmit={submit}>
      <Campo id={`${idBase}-valor`} label="Valor total (R$)">
        <input id={`${idBase}-valor`} name="valor" type="number" min="0.01" step="0.01" required defaultValue={inicial?.valor} />
      </Campo>
      <Campo id={`${idBase}-validade`} label="Validade da proposta">
        <input id={`${idBase}-validade`} name="validade" type="date" min={hojeISO()} required defaultValue={inicial?.validade || somaDias(hojeISO(), 15)} />
      </Campo>
      <Campo id={`${idBase}-desc`} label="O que está incluído" className="plan-campo--cheio">
        <textarea id={`${idBase}-desc`} name="descricao" rows="2" required minLength={3} defaultValue={inicial?.descricao} />
      </Campo>
      <Campo id={`${idBase}-obs`} label="Observações (opcional)" className="plan-campo--cheio">
        <input id={`${idBase}-obs`} name="observacoes" defaultValue={inicial?.observacoes} />
      </Campo>
      <Erro texto={erro} />
      <div className="plan-form_acoes">
        <button className="botao-principal" type="submit" disabled={enviando}>{enviando ? 'Enviando…' : rotulo}</button>
        {onCancelar && <button className="botao-detalhes" type="button" onClick={onCancelar}>Cancelar</button>}
      </div>
    </form>
  );
}
