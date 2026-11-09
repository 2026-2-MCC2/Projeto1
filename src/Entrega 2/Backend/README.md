# Backend - TrocaTicket

O backend do TrocaTicket foi desenvolvido utilizando Node.js e Express, com integração ao banco de dados MySQL. Ele é responsável por processar as informações enviadas pelo frontend, realizar as operações no banco de dados e controlar as funcionalidades de cada tipo de usuário.

## Como executar o projeto

Os comandos abaixo devem ser executados no terminal, a partir da pasta principal do projeto.

### 1. Configuração do ambiente

O backend utiliza um arquivo `.env` para armazenar as configurações de conexão com o banco de dados e outras informações necessárias para o funcionamento da API.

O arquivo de exemplo está localizado em:

`src/Entrega 2/Backend/.env.example`

Crie o arquivo `.env` na mesma pasta e preencha as informações de acordo com seu ambiente. Caso ele já exista, basta conferir as configurações, sem precisar substituí-lo.

### 2. Banco de dados

O banco de dados utilizado pelo projeto é o MySQL.

Para criar as tabelas, execute o script:

`BD/db_TrocaTicket.sql`

Depois de configurar o banco e o arquivo `.env`, é possível executar o comando de seed para inserir os dados iniciais:

```bash
npm run seed
```

### 3. Iniciar o servidor

Para iniciar o backend, utilize:

```bash
npm run server
```

Por padrão, a API utiliza a porta configurada no arquivo `.env`.

## Principais funcionalidades da API

O backend possui rotas separadas de acordo com as funcionalidades do sistema.

### Autenticação e contas

As rotas de autenticação permitem cadastrar usuários, realizar login e consultar ou atualizar os dados da conta.

- `POST /cadastro` — cadastro de cliente.
- `POST /login` — login de cliente.
- `GET /perfil` — consulta dos dados do perfil.
- `PUT /perfil` — atualização do perfil.
- `POST /cadastro-parceiro` — cadastro de parceiro.
- `POST /login-equipe` — login dos integrantes da equipe.

### Administração

As rotas administrativas permitem acompanhar os cadastros, consultar eventos e visualizar informações do sistema.

- `GET /cadastros` — consulta dos cadastros.
- `PATCH /cadastros/:idConta` — atualização de um cadastro.
- `GET /auditoria` — consulta dos registros de auditoria.
- `GET /eventos` — consulta dos eventos.
- `GET /resumo` — consulta do resumo administrativo.

### Organizador

O organizador pode criar e administrar eventos, cadastrar itens necessários, informar custos e acompanhar as propostas recebidas.

As principais rotas estão organizadas em `/api/eventos`:

- `GET /` — listar eventos.
- `POST /` — criar evento.
- `GET /:id` — consultar um evento.
- `PUT /:id` — atualizar um evento.
- `DELETE /:id` — excluir um evento.
- `PATCH /:id/status` — atualizar o status do evento.
- `POST /:id/itens` — adicionar itens ao evento.
- `DELETE /:id/itens/:itemId` — remover itens.
- `POST /:id/custos` — cadastrar custos.
- `DELETE /:id/custos/:custoId` — remover custos.
- `POST /:id/propostas/:propostaId/selecionar` — selecionar uma proposta.
- `DELETE /:id/itens/:itemId/selecao` — remover a seleção de uma proposta.
- `GET /:id/ticket` — consultar os cálculos relacionados ao ingresso.

O fluxo de status dos eventos segue esta ordem:

**Rascunho → Aberto para cotação → Encerrada → Fechado.**

### Fornecedor

O fornecedor pode consultar eventos que precisam de produtos ou serviços e enviar propostas para os organizadores.

As principais rotas são:

- `GET /api/cotacoes?categoria=&busca=` — consultar cotações.
- `GET /api/cotacoes/:eventoId` — consultar os detalhes de uma cotação.
- `POST /api/cotacoes/:eventoId/itens/:itemId/propostas` — enviar uma proposta.
- `GET /api/propostas/minhas` — consultar as próprias propostas.
- `PUT /api/propostas/:id` — atualizar uma proposta.
- `POST /api/propostas/:id/cancelar` — cancelar uma proposta.

As informações de custos internos, margens e propostas de outros fornecedores não são exibidas para o fornecedor.

## Cálculo dos ingressos

O sistema também possui cálculos para ajudar o organizador a definir o valor dos ingressos.

As fórmulas utilizadas são:

**Custo total:**

`Propostas selecionadas + custos fixos + (custo por participante × público esperado)`

**Ponto de equilíbrio:**

`Custo total ÷ público esperado`

**Valor de ingresso com margem:**

`Custo total ÷ [público esperado × (1 − margem)]`

Os valores são arredondados para duas casas decimais.

## Testes da API

O projeto possui testes automatizados para verificar o funcionamento das rotas e algumas regras do sistema.

Para executar os testes:

```bash
npm run test:api
```

Os testes utilizam um banco SQLite em memória, permitindo verificar as funcionalidades sem precisar conectar ao MySQL durante essa execução.

Também existe uma coleção do Postman no projeto:

`docs/TrocaTicket.postman_collection.json`

Ela pode ser utilizada para testar as requisições da API.

## Organização das pastas

O backend está organizado da seguinte maneira:

```text
src/Entrega 2/Backend/
├── controllers/
├── middlewares/
├── routes/
├── scripts/
├── services/
├── src/
├── tests/
├── utils/
├── .env
├── .env.example
└── README.md
```

Cada pasta possui uma responsabilidade dentro do backend:

- `controllers`: recebem e processam as requisições.
- `middlewares`: realizam verificações antes das rotas.
- `routes`: organizam os caminhos da API.
- `scripts`: possuem scripts auxiliares, como a inserção de dados iniciais.
- `services`: concentram regras e operações utilizadas pelo sistema.
- `tests`: armazenam os testes automatizados.
- `utils`: guardam funções auxiliares.

## Observações

O backend está integrado ao frontend e ao banco de dados do TrocaTicket. Algumas funcionalidades ainda podem passar por ajustes durante o desenvolvimento do projeto, principalmente na integração e nos testes das operações.
