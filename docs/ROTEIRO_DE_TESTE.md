# Roteiro de teste e de apresentação

Pré-requisitos: MySQL com os scripts da pasta `BD`, `backend/.env` preenchido, `npm run seed`, `npm run server` e `npm run dev`.
Todas as contas usam a senha `Troca@123`.

## Fluxo completo (cenário do enunciado)
1. **Autocadastro.** Em `/painel/login` clique em "Cadastre-se" e cadastre um organizador (CNPJ válido). Tente entrar: aparece "cadastro em análise".
2. **Aprovação.** Entre como `admin@trocaticket.dev`, abra **Cadastros**, clique em "Ver detalhes", escreva uma observação e **Aprove**. O histórico registra quem decidiu.
3. **Evento.** Entre como o organizador aprovado. Em **Eventos > Criar evento** informe período, local, público mínimo, máximo e esperado e a margem.
4. **Itens e custos.** No detalhe do evento, adicione itens (ex.: Som) e custos (um fixo e um "por participante"). Tente abrir a cotação sem itens (a API recusa).
5. **Cotação.** Clique em **Abrir para cotação**.
6. **Propostas.** Em outra janela anônima entre como `fornecedor@trocaticket.dev` (e outra com `contato@palcoseguro.com`), abra o evento e envie propostas. O fornecedor não vê a margem nem as propostas do concorrente.
7. **Seleção.** Como organizador, recarregue o evento: compare as propostas (aparece "Menor valor"), selecione uma. As outras do mesmo item viram "Não selecionada".
8. **Ticket.** Na seção "Orçamento consolidado e ticket" confira o custo, os cenários mínimo, esperado e máximo e o gráfico. Fórmula: `Custo total ÷ [Público × (1 − Margem)]`.
9. **Visão administrativa.** Como admin, veja **Eventos** (custo e ticket de cada um) e **Análise** (relatórios, gráficos e exportação em CSV).

## Casos de erro para mostrar
- Login com senha errada (401), cadastro pendente ou rejeitado (403), rota de outro perfil (403), sem login (401).
- Evento com fim antes do início, público máximo menor que o mínimo, margem 100% (400).
- Proposta duplicada para o mesmo item, edição de proposta já selecionada, alteração com o orçamento fechado (409).

## Testes automatizados
- `npm run test:api`: 11 testes de ponta a ponta da API (regras, permissões, integridade, ticket) + a collection do Postman inteira. Não precisam de MySQL.
- Postman: `docs/TrocaTicket.postman_collection.json` (46 requisições; rode no Collection Runner depois do `npm run seed`).
