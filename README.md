# TrocaTicket

Aplicação de página única em React, com Vite e React Router. A interface é renderizada por componentes React; `index.html` é o único arquivo HTML de entrada.

## Estrutura

O código é organizado **por funcionalidade** (cada pasta em `features/` é um pedaço do negócio). Detalhes e regras em [`src/ARQUITETURA.md`](src/ARQUITETURA.md).

```
src/
  main.jsx                    ponto de entrada (importa os estilos e monta o App)
  app/                        "esqueleto" da aplicação
    App.jsx                   rotas e layout geral
    providers/                Theme, Accessibility e Store (estado global)
    routes/                   paths, ProtectedRoute, navigation (menus por perfil), NavigationBridge
  features/
    auth/                     login, cadastro, cadastro de parceiro, authService
    planejamento/             regras de negócio, store e componentes do ticket/propostas/orçamento
    organizador/              painel do organizador (eventos, detalhe, calendário)
    fornecedor/               painel do fornecedor (cotação e propostas)
    admin/                    painel do administrador (aprovações, eventos, relatórios)
    cliente/                  conta, pedidos e ingressos do cliente
    publico/                  home, eventos, marketplace e contato
    suporte/                  solicitações e suporte
    painel/                   Análise e Configurações (comuns aos perfis)
    acessibilidade/           painel de acessibilidade, filtros de cor e tutorial
  shared/                     reaproveitado por várias features
    dashboard/ layout/ ui/ hooks/
  data/                       dados de demonstração (eventos.json, painelMock.js)
  assets/images/              logos
  styles/                     tokens.css (cores e temas), style.css, styles.css, dashboard.css, recursos.css, planejamento.css
```

## Rotas

- Públicas: `/`, `/eventos`, `/marketplace`, `/contato`, `/login`, `/cadastro`
- Cliente: `/ingressos`, `/pedidos`, `/minha-conta`
- Admin: `/admin/dashboard`, `/solicitacoes`, `/analise`, `/suporte`, `/configuracoes`
- Fornecedor: `/fornecedor/dashboard`, `/eventos`, `/solicitacoes`, `/analise`, `/suporte`, `/configuracoes`
- Organizador: `/organizador/dashboard`, `/eventos`, `/eventos/novo`, `/solicitacoes`, `/analise`, `/suporte`, `/configuracoes`

Cada painel só abre para o perfil correspondente. No login de demonstração você escolhe o perfil.

## Executar

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build
npm run preview
```

O build gera um único `index.html` e os arquivos em `dist/assets/`. O host de produção precisa encaminhar rotas desconhecidas para `index.html`; `public/_redirects` inclui essa regra para hosts compatíveis com o padrão Netlify.

## Limites do protótipo

Cadastro, login, pedidos, mensagens, newsletter e carrinho usam `localStorage` deste navegador. Senhas não são salvas. Não há API, autenticação real, e-mail, processamento de pagamento ou sincronização entre dispositivos.

## Login separado por público

- `/login` e `/cadastro`: só clientes (o cadastro público sempre cria `cliente`).
- `/painel/login`: administrador, fornecedor e organizador (sem link no site público).
- Toda a autenticação está em `src/features/auth/services/authService.js`. Hoje usa contas de demonstração (`admin@`, `fornecedor@`, `organizador@trocaticket.dev`, qualquer senha); troque pelo back-end depois.
- A segurança real (verificar senha e perfil) precisa acontecer no servidor.

## Acessibilidade

`src/app/providers/AccessibilityContext.jsx` guarda as opções (fonte, daltonismo, voz narrada, Libras via VLibras, tutorial, links, espaçamento, animações). O mesmo conteúdo aparece no painel "+Acessibilidade" do site e em Configurações dos painéis.

## Revisão visual e acessibilidade (01/11/2026)
- A página Eventos agora utiliza a mesma família tipográfica da página inicial.
- Os ícones de pesquisa, calendário, localização, menu, carrinho e conta usam Lucide.
- Os filtros de categoria seguem o padrão de chips escuros do protótipo e mantêm estado selecionado perceptível por contorno.
- As artes da página inicial usam versões claras e escuras enviadas pela equipe, mantendo dois quadros quadrados compactos próximos ao rodapé.
- As opções de daltonismo aplicam paletas de interface com contornos reforçados, sem filtro global que distorça fotografias. São ajustes de interface, não correção clínica individual.
- O calendário do organizador interpreta datas completas e períodos no formato `09–10 jan 2027` pela data inicial.

Para testar localmente: `npm install` e `npm run dev`.

---

## Módulos de planejamento (fluxo do enunciado)

Fluxo ponta a ponta: **autocadastro → aprovação → evento → itens de custo → propostas → seleção → cálculo do ticket → visão do administrador**.

| Perfil | Rotas | O que faz |
|---|---|---|
| Público | `/painel/cadastro` | Autocadastro de organizador/fornecedor (CNPJ validado). Nasce **Pendente**. |
| Administrador | `/admin/cadastros` | Aprova/rejeita cadastros, com histórico de decisões. |
| Administrador | `/admin/eventos`, `/admin/analise` | Eventos, custos, andamento das cotações e relatórios (exporta CSV). |
| Organizador | `/organizador/eventos`, `/organizador/eventos/novo`, `/organizador/eventos/:id` | CRUD de eventos, itens de custo, custos fiscais/operacionais/variáveis, comparação e seleção de propostas, orçamento e ticket. |
| Fornecedor | `/fornecedor/eventos`, `/fornecedor/eventos/:id`, `/fornecedor/propostas` | Vê eventos abertos, envia/edita/cancela propostas e acompanha o status. |

### Cálculo do ticket (documentado)
- **Ticket-alvo** = Custo total ÷ [Público × (1 − Margem)] (margem sobre a receita).
- **Ticket de equilíbrio** = Custo total ÷ Público.
- **Custo total** = propostas selecionadas + custos fixos + (custo variável por participante × Público).
- **Arredondamento:** sempre para cima, ao centavo. **Validações:** público inteiro > 0, custo ≥ 0, margem entre 0% e 99,99%.
- Cenários: público mínimo, esperado (opcional) e máximo. A tela mostra também a curva do ticket × público (útil para o estudo de máximos, mínimos e concavidade de Cálculo II).

### Onde está o código
- `src/features/planejamento/services/planejamentoApi.js`: todas as chamadas à API do planejamento (`leituras` e `acoes`).
- `src/shared/api/http.js`: cliente HTTP único (URL configurável por `VITE_API_URL`, token JWT, mensagens de erro).
- `src/shared/hooks/useApi.js`: carrega dados da API com estados de carregando, erro e "tentar de novo".
- `src/features/planejamento/services/planejamento.js`: formatação e validações do formulário (o servidor valida de novo).
- `src/features/planejamento/components/` e `src/features/{admin,organizador,fornecedor}/pages/`: telas.

### Contas de demonstração
Criadas por `npm run seed` (senha de todas: `Troca@123`): `admin@trocaticket.dev`, `organizador@trocaticket.dev`,
`fornecedor@trocaticket.dev` e `cliente@trocaticket.dev`. O seed também cria eventos, propostas e cadastros pendentes de exemplo.

## Como rodar (front-end + back-end)

1. Entre na pasta do projeto (a que tem o `package.json`) e instale: `npm install`
2. **Banco de dados:** rode no MySQL `BD/db_TrocaTicket.sql` e depois `BD/02_planejamento.sql` (detalhes e DER em [`BD/README.md`](BD/README.md)).
3. **Back-end:** copie `backend/.env.example` para `backend/.env` e preencha a senha do MySQL e o `JWT_SECRET`
   (o `.env` **não é versionado**). Rode `npm run seed` para criar contas e eventos de demonstração e `npm run server` (porta 3000).
   Documentação das rotas em [`backend/README.md`](backend/README.md); collection do Postman em `docs/TrocaTicket.postman_collection.json`.
4. **Front-end:** em outro terminal, `npm run dev` (porta 5173). A URL da API é configurável pelo `.env` da raiz
   (modelo em `.env.example`): `VITE_API_URL=http://localhost:3000`.
5. **Testes da API:** `npm run test:api` (não precisam de MySQL).

**Contas da API** (depois do `npm run seed`, senha `Troca@123`): `admin@`, `organizador@`, `fornecedor@` e `cliente@trocaticket.dev`.

**Situação atual:** o front-end inteiro (cliente, organizador, fornecedor e administrador) usa a API real e o MySQL.
Nada do fluxo do planejamento fica mais no navegador. O login de todos os perfis é feito pela API (por isso é preciso rodar o `npm run seed`
uma vez para ter contas de teste). Se o back-end estiver desligado, as telas mostram "Não foi possível conectar ao servidor" com um botão para tentar de novo.

Roteiro de apresentação e de testes: [`docs/ROTEIRO_DE_TESTE.md`](docs/ROTEIRO_DE_TESTE.md).

## Tema de cores
O site usa o azul da logo. **Claro:** `#1050A0` com variações mais escuras. **Escuro:** azul mais claro em degradê.
Os degradês ficam todos em `src/styles/tema-azul.css` (tokens `--grad-*`); as cores-base em `src/styles/tokens.css`.
