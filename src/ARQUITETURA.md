# Arquitetura do front-end

## Ideia central
Cada pasta de `features/` guarda **tudo de uma parte do negócio** (telas, componentes, hooks e serviços).
O que é usado por várias partes vai para `shared/`. O que é "esqueleto" (rotas, providers) fica em `app/`.

## Onde colocar cada coisa

| Quero criar... | Vai em... |
|---|---|
| Uma tela de um perfil | `features/<perfil>/pages/` |
| Um componente usado só naquela feature | `features/<feature>/components/` |
| Um componente usado por 2+ features (tabela, modal, badge) | `shared/dashboard/` ou `shared/ui/` |
| Uma regra de negócio ou cálculo (sem React) | `features/<feature>/services/` |
| Acesso a dados (hoje localStorage, depois API) | `features/<feature>/services/*Store.js` |
| Um hook | `features/<feature>/hooks/` (ou `shared/hooks/` se for genérico) |
| Uma rota nova | `app/App.jsx` + `app/routes/paths.js` + menu em `app/routes/navigation.js` |
| Cor, tema ou tamanho | `styles/tokens.css` |

## Regras de dependência (da mais "alta" para a mais "baixa")
1. `pages` usam `components`, `hooks` e `services` da própria feature e o que estiver em `shared/`.
2. `components` e `hooks` usam `services`; **não** acessam `localStorage` direto.
3. `services` são JavaScript puro: não importam React nem telas. Só `shared/api/http.js` fala com a rede.
4. `shared/` **nunca** importa de `features/`.
5. Uma feature só importa de outra quando for de domínio comum: `planejamento` é usada por `organizador`, `fornecedor` e `admin`.

## Fluxo de dados do planejamento
`pages` → `useApi` (leituras) / `acoes` (botões e formulários) → `planejamentoApi.js` → `shared/api/http.js` → API Express → MySQL.
As regras de negócio e a validação final ficam no servidor (`backend/services/regras.js`); o front repete só as validações de formulário e a
formatação (`planejamento.js`). Toda tela que depende da API trata os três estados: carregando, erro (com "tentar de novo") e vazio.
## Observações
- `features/cliente/components/OrdersTable.jsx` não é mais usado por nenhuma tela (restou de uma versão anterior). Pode ser apagado.
- Nomes de cor: a antiga cor "roxo" agora se chama `marinho` (classe `card-resumo--marinho`) e a variável de destaque é `--cor-destaque`.
