# API do TrocaTicket (Node.js + Express + MySQL)

## Rodar
```bash
cp backend/.env.example backend/.env   # preencha a senha do MySQL e o JWT_SECRET
# crie o banco: veja BD/README.md (db_TrocaTicket.sql e 02_planejamento.sql)
npm run seed     # contas e eventos de demonstração (senha: Troca@123)
npm run server   # http://localhost:3000
npm run test:api # testes automatizados (não precisam de MySQL)
```
Autenticação: `Authorization: Bearer <token>` (JWT de 2 horas). Erros sempre no formato `{ "mensagem": "..." }`.
Collection do Postman: `docs/TrocaTicket.postman_collection.json` (46 requisições com testes; rode com o Collection Runner depois do `npm run seed`).

## Códigos de status
`200` ok · `201` criado · `400` dados inválidos · `401` sem login / senha errada · `403` perfil sem permissão ou cadastro não aprovado ·
`404` não encontrado (inclui recursos de outro usuário) · `409` conflito de regra (ex.: transição de status inválida, proposta duplicada, orçamento fechado) · `500` erro interno

## Rotas

### Autenticação — `/api/auth`
| Método | Rota | Quem | O que faz |
|---|---|---|---|
| POST | `/cadastro` | público | Cadastro de cliente |
| POST | `/login` | público | Login de cliente |
| GET / PUT | `/perfil` | cliente | Consulta e atualiza o perfil |
| POST | `/cadastro-parceiro` | público | Autocadastro de organizador/fornecedor (**fica pendente**) |
| POST | `/login-equipe` | público | Login de admin, organizador ou fornecedor **aprovado** |

### Administrador — `/api/admin`
| Método | Rota | O que faz |
|---|---|---|
| GET | `/cadastros` | Lista organizadores e fornecedores com status |
| PATCH | `/cadastros/:idConta` | Aprova ou rejeita: `{ "status": "Aprovado" \| "Rejeitado", "justificativa": "..." }` |
| GET | `/auditoria` | Histórico das decisões |
| GET | `/eventos` | Todos os eventos com resumo (itens fechados, custo, ticket-alvo) |
| GET | `/resumo` | Totais para relatórios |

### Organizador — `/api/eventos`
| Método | Rota | O que faz |
|---|---|---|
| GET / POST | `/` | Lista meus eventos / cria evento (nasce como Rascunho) |
| GET / PUT / DELETE | `/:id` | Detalhe (itens, custos, propostas, orçamento, cenários) / edita / exclui |
| PATCH | `/:id/status` | `{ "status": "Aberto para cotação" }` (Rascunho → Aberto → Encerrada → Fechado) |
| POST | `/:id/itens` | `{ categoria, descricao, quantidade }` |
| DELETE | `/:id/itens/:itemId` | Remove item e suas propostas |
| POST / DELETE | `/:id/custos` · `/:id/custos/:custoId` | `{ tipo, descricao, valor, cobranca: "total" \| "pessoa" }` |
| POST | `/:id/propostas/:propostaId/selecionar` | Seleciona a proposta (uma por item) |
| DELETE | `/:id/itens/:itemId/selecao` | Desfaz a seleção |
| GET | `/:id/ticket` | Orçamento consolidado, cenários (mín/esperado/máx) e curva ticket × público |

### Fornecedor — `/api/cotacoes` e `/api/propostas`
O fornecedor **não vê** margem, custos nem propostas de concorrentes.
| Método | Rota | O que faz |
|---|---|---|
| GET | `/api/cotacoes?categoria=&busca=` | Eventos abertos para cotação |
| GET | `/api/cotacoes/:eventoId` | Itens do evento e minha proposta em cada um |
| POST | `/api/cotacoes/:eventoId/itens/:itemId/propostas` | `{ valor, descricao, validade, observacoes }` |
| GET | `/api/propostas/minhas` | Histórico e status das minhas propostas |
| PUT | `/api/propostas/:id` | Edita (só "Enviada" e evento aberto) |
| POST | `/api/propostas/:id/cancelar` | Cancela (só "Enviada") |

## Fórmula do ticket
`Ticket-alvo = Custo total ÷ [Público × (1 − Margem)]` e `Equilíbrio = Custo total ÷ Público`.
`Custo total = propostas selecionadas + custos fixos + (custo por participante × Público)`. Arredondamento sempre **para cima**, ao centavo.

## Organização
```
backend/
  src/app.js, server.js      aplicação Express e inicialização
  src/config/database.js     pool MySQL
  routes/                    rotas por perfil
  controllers/               regras de cada rota
  middlewares/               autenticarToken (JWT) e exigirPerfil
  services/regras.js         validações e cálculo do ticket (funções puras)
  services/eventosRepo.js    leitura de eventos com itens, custos e propostas
  utils/                     transação e respostas de erro
  scripts/semear.js          dados de demonstração
  tests/                     testes de ponta a ponta (SQLite em memória, mesmos scripts SQL)
```
