import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Carrega dados da API ao abrir a tela e quando as dependências mudam.
 * Devolve { dados, carregando, erro, recarregar }. Ao recarregar, mantém os dados antigos na tela (sem piscar).
 */
export default function useApi(carregar, deps = []) {
  const [estado, setEstado] = useState({ dados: null, carregando: true, erro: '' });
  const [versao, setVersao] = useState(0);
  const funcao = useRef(carregar);
  funcao.current = carregar;

  useEffect(() => {
    let ativo = true;
    setEstado((s) => ({ ...s, carregando: true }));
    Promise.resolve()
      .then(() => funcao.current())
      .then((dados) => { if (ativo) setEstado({ dados, carregando: false, erro: '' }); })
      .catch((e) => { if (ativo) setEstado((s) => ({ dados: s.dados, carregando: false, erro: e.message })); });
    return () => { ativo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, versao]);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);
  return { ...estado, recarregar };
}
