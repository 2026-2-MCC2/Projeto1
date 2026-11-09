# 🛢 Explicação do banco de dados – TrocaTicket

<br>

O banco possui **19 tabelas**, organizadas da seguinte forma:

| Tipo | Tabelas |
|---|---|
| Contas e perfis | `tb_TipoConta`, `tb_Conta`, `tb_Usuario`, `tb_Organizador`, `tb_Fornecedor`, `tb_Administrador` |
| Solicitações | `tb_SolicitacaoConta`, `tb_SolicitacaoEvento`, `tb_SolicitacaoAtend_Fornecimento` |
| Eventos e fornecimento | `tb_Evento`, `tb_ListaComponentes`, `tb_ListaItensFornecimentos`, `tb_TipoFornecimento`, `tb_FornecedorTipo`, `tb_CustoEvento` |
| Ingressos e pagamento | `tb_SolicitacaoCompraIngresso`, `tb_Ingresso`, `tb_Pagamento`, `tb_FormaPagamento` |

**Como o sistema foi pensado**

1. Uma conta é criada (cliente, organizador ou fornecedor) e um administrador pode analisar a solicitação.
2. O organizador solicita a criação de um evento e um administrador analisa.
3. O organizador lista os componentes necessários para o evento, e os fornecedores oferecem itens e serviços para atendê-los.
4. Os fornecedores são associados às categorias de fornecimento que atendem.
5. O organizador pode selecionar uma proposta para cada componente e registrar custos adicionais do evento.
6. O usuário compra ingressos e realiza o pagamento.

## 📖 Nomenclaturas utilizadas

| Sigla | Significado |
|---|---|
| **PK** | Chave primária |
| **FK** | Chave estrangeira |
| **UNIQUE** | Valor não pode se repetir |
| **NOT NULL** | Preenchimento obrigatório |
| **AUTO** | `AUTO_INCREMENT` (gerado automaticamente) |

## 🗂️ Tipos de dados

| Tipo de dado | Finalidade | Motivo da escolha |
|---|---|---|
| `INT` | Identificadores, quantidades e capacidade de público. | Armazena números inteiros, sem casas decimais. |
| `VARCHAR(n)` | Nomes, e-mails, telefones, endereços e outros textos curtos. | Permite armazenar textos de tamanhos variados, com limite definido. |
| `CHAR(n)` | CPF e CNPJ. | É adequado para informações com quantidade fixa de caracteres. |
| `TEXT` | Descrições de eventos e itens de fornecimento. | Permite armazenar textos maiores. |
| `DATETIME` | Datas e horários de solicitações, eventos, compras e pagamentos. | Permite registrar data e horário no mesmo campo. |
| `DATE` | Validade de propostas de fornecimento. | Armazena somente a data, sem horário. |
| `DECIMAL(10,2)` | Valores monetários, como preços, ofertas, custos e compras. | Armazena números com duas casas decimais e precisão definida, sendo adequado para valores financeiros. |
| `DECIMAL(5,2)` | Margem de lucro. | Permite armazenar números decimais com até cinco dígitos no total, sendo dois deles após a vírgula. |
| `TINYINT` | Status de solicitações, eventos, ingressos, pagamentos e cancelamentos. | Armazena pequenos números inteiros, adequados para representar códigos de situação. |
| `AUTO_INCREMENT` | Identificadores das tabelas. | Gera automaticamente um novo número para cada registro. |

---

## 🧩 Tabelas do banco

### `tb_TipoConta`

Tipos de conta do sistema.

| Campo | Tipo | Restrições | Descrição |
|---|---|---|---|
| `PK_IDTipoConta` | `INT` | PK, AUTO | Identificador |
| `Nome` | `VARCHAR(50)` | NOT NULL | Nome do tipo |

Registros iniciais: Cliente, Organizador e Fornecedor.

### `tb_FormaPagamento`

Formas de pagamento aceitas.

| Campo | Tipo | Restrições | Descrição |
|---|---|---|---|
| `PK_IDFormaPagamento` | `INT` | PK, AUTO | Identificador |
| `Nome` | `VARCHAR(50)` | NOT NULL | Nome da forma de pagamento |

Registros iniciais: PIX, Cartao e Boleto.

### `tb_TipoFornecimento`

Categorias de fornecimento.

| Campo | Tipo | Restrições | Descrição |
|---|---|---|---|
| `PK_IDTipoFornecimento` | `INT` | PK, AUTO | Identificador |
| `Nome` | `VARCHAR(100)` | NOT NULL | Nome da categoria |

Categorias iniciais: Iluminação, Som, Alimentação, Bebidas, Segurança, Estrutura, Limpeza e Outros.

---

`tb_Conta` guarda os dados de login. Cada conta possui um tipo de perfil e pode estar associada a um registro específico em `tb_Usuario`, `tb_Organizador` ou `tb_Fornecedor` (relação 1:1). Já `tb_Administrador` é independente.

### `tb_Conta`

| Campo | Tipo | Restrições | Descrição |
|---|---|---|---|
| `PK_IDConta` | `INT` | PK, AUTO | Identificador |
| `idtb_TipoConta` | `INT` | FK, NOT NULL | Tipo da conta (`tb_TipoConta`) |
| `Telefone` | `VARCHAR(20)` | – | Telefone (opcional) |
| `Email` | `VARCHAR(150)` | NOT NULL, UNIQUE | E-mail de acesso |
| `Senha` | `VARCHAR(255)` | NOT NULL | Senha |

### `tb_Usuario`

Cliente que compra ingressos.

| Campo | Tipo | Restrições | Descrição |
|---|---|---|---|
| `PK_IDUsuario` | `INT` | PK, AUTO | Identificador |
| `PK_IDConta` | `INT` | FK, NOT NULL, UNIQUE | Conta do usuário (`tb_Conta`) |
| `CPF` | `CHAR(11)` | NOT NULL, UNIQUE | CPF (somente números) |
| `Nome` | `VARCHAR(100)` | NOT NULL | Nome completo |

### `tb_Organizador`

Quem organiza eventos.

| Campo | Tipo | Restrições | Descrição |
|---|---|---|---|
| `PK_IDOrganizador` | `INT` | PK, AUTO | Identificador |
| `PK_IDConta` | `INT` | FK, NOT NULL, UNIQUE | Conta do organizador (`tb_Conta`) |
| `CNPJ` | `CHAR(14)` | NOT NULL, UNIQUE | CNPJ (somente números) |
| `Endereco` | `VARCHAR(200)` | – | Endereço (opcional) |
| `Nome` | `VARCHAR(150)` | NOT NULL, padrão `''` | Nome do organizador |

### `tb_Fornecedor`

Quem fornece itens e serviços para os eventos.

| Campo | Tipo | Restrições | Descrição |
|---|---|---|---|
| `PK_IDFornecedor` | `INT` | PK, AUTO | Identificador |
| `PK_IDConta` | `INT` | FK, NOT NULL, UNIQUE | Conta do fornecedor (`tb_Conta`) |
| `CNPJ` | `CHAR(14)` | NOT NULL, UNIQUE | CNPJ (somente números) |
| `Endereco` | `VARCHAR(200)` | – | Endereço (opcional) |
| `Nome` | `VARCHAR(150)` | NOT NULL, padrão `''` | Nome do fornecedor |

### `tb_Administrador`

Funcionários que analisam as solicitações e administram a plataforma.

| Campo | Tipo | Restrições | Descrição |
|---|---|---|---|
| `PK_CodFunc` | `INT` | PK, AUTO | Código do funcionário |
| `Email` | `VARCHAR(150)` | NOT NULL, UNIQUE | E-mail de acesso |
| `Senha` | `VARCHAR(255)` | NOT NULL | Senha |
| `Genero` | `VARCHAR(30)` | – | Gênero (opcional) |
| `Nome` | `VARCHAR(100)` | NOT NULL | Nome completo |

### `tb_SolicitacaoConta`

Pedido de aprovação de uma conta.

| Campo | Tipo | Restrições | Descrição |
|---|---|---|---|
| `PK_IDSolicitacaoConta` | `INT` | PK, AUTO | Identificador |
| `idtb_Conta` | `INT` | FK, NOT NULL | Conta analisada (`tb_Conta`) |
| `idtb_Administrador` | `INT` | FK | Administrador responsável (`tb_Administrador`); pode ficar vazio até a análise |
| `DataHora` | `DATETIME` | NOT NULL | Data e hora do pedido |
| `StatusSolicitacao` | `TINYINT` | NOT NULL, padrão `0` | Situação do pedido |
| `Justificativa` | `VARCHAR(255)` | – | Justificativa da decisão (opcional) |
| `DataDecisao` | `DATETIME` | – | Data e horário da decisão administrativa |

### `tb_SolicitacaoEvento`

Pedido de criação de evento feito por um organizador.

| Campo | Tipo | Restrições | Descrição |
|---|---|---|---|
| `PK_IDSolicitacaoEvento` | `INT` | PK, AUTO | Identificador |
| `idtb_Organizador` | `INT` | FK, NOT NULL | Organizador que fez o pedido (`tb_Organizador`) |
| `idtb_Administrador` | `INT` | FK | Administrador responsável (`tb_Administrador`); pode ficar vazio até a análise |
| `DataHora` | `DATETIME` | NOT NULL | Data e hora do pedido |
| `Status` | `TINYINT` | NOT NULL, padrão `0` | Situação do pedido |

### `tb_Evento`

Evento criado a partir de uma solicitação (relação 1:1).

| Campo | Tipo | Restrições | Descrição |
|---|---|---|---|
| `PK_IDEvento` | `INT` | PK, AUTO | Identificador |
| `idtb_SolicitacaoEvento` | `INT` | FK, NOT NULL, UNIQUE | Solicitação de origem (`tb_SolicitacaoEvento`) |
| `Titulo` | `VARCHAR(150)` | NOT NULL | Título |
| `Descricao` | `TEXT` | – | Descrição |
| `Local` | `VARCHAR(200)` | NOT NULL | Local do evento |
| `Capacidade` | `INT` | NOT NULL | Capacidade máxima |
| `PublicoMinimo` | `INT` | – | Público mínimo |
| `PublicoEsperado` | `INT` | – | Público esperado |
| `Categoria` | `VARCHAR(100)` | – | Categoria |
| `DataHora` | `DATETIME` | NOT NULL | Data e hora de início do evento |
| `DataFim` | `DATETIME` | – | Data e hora de término do evento |
| `MargemLucro` | `DECIMAL(5,2)` | – | Margem de lucro |
| `StatusEvento` | `TINYINT` | NOT NULL, padrão `0` | Situação do evento |

### `tb_ListaComponentes`

Itens que o evento precisa para acontecer.

| Campo | Tipo | Restrições | Descrição |
|---|---|---|---|
| `PK_IDLista` | `INT` | PK, AUTO | Identificador |
| `idtb_Evento` | `INT` | FK, NOT NULL | Evento (`tb_Evento`) |
| `NomeItem` | `VARCHAR(100)` | NOT NULL | Nome do componente |
| `Quantidade` | `INT` | NOT NULL | Quantidade necessária |
| `ValorEstimado` | `DECIMAL(10,2)` | – | Valor estimado |
| `idtb_ItemSelecionado` | `INT` | FK | Item escolhido (`tb_ListaItensFornecimentos`); fica vazio até a escolha |
| `idtb_TipoFornecimento` | `INT` | FK | Categoria do componente (`tb_TipoFornecimento`) |

### `tb_SolicitacaoAtend_Fornecimento`

Pedido de um fornecedor para atender um evento.

| Campo | Tipo | Restrições | Descrição |
|---|---|---|---|
| `PK_IDSolicitacaoAtend_Fornecedor` | `INT` | PK, AUTO | Identificador |
| `idtb_Fornecedor` | `INT` | FK, NOT NULL | Fornecedor (`tb_Fornecedor`) |
| `idtb_Evento` | `INT` | FK, NOT NULL | Evento atendido (`tb_Evento`) |
| `DataHora` | `DATETIME` | NOT NULL | Data e hora do pedido |
| `Status` | `TINYINT` | NOT NULL, padrão `0` | Situação do pedido |

**Restrição adicional:** a combinação `idtb_Fornecedor` e `idtb_Evento` é `UNIQUE`, impedindo que o mesmo fornecedor tenha mais de uma solicitação de atendimento para o mesmo evento.

### `tb_ListaItensFornecimentos`

Item oferecido por um fornecedor para atender a um componente do evento.

| Campo | Tipo | Restrições | Descrição |
|---|---|---|---|
| `PK_IDItem` | `INT` | PK, AUTO | Identificador |
| `idtb_SolicitacaoAtend_Fornecimento` | `INT` | FK, NOT NULL | Pedido de atendimento (`tb_SolicitacaoAtend_Fornecimento`) |
| `idtb_Lista` | `INT` | FK, NOT NULL | Componente atendido (`tb_ListaComponentes`) |
| `idtb_TipoFornecimento` | `INT` | FK | Categoria (`tb_TipoFornecimento`, opcional) |
| `Valor` | `DECIMAL(10,2)` | NOT NULL | Valor oferecido |
| `Quantidade` | `INT` | NOT NULL | Quantidade oferecida |
| `Descricao` | `TEXT` | – | Descrição do item |
| `Validade` | `DATE` | – | Data de validade da proposta |
| `Observacoes` | `VARCHAR(255)` | – | Observações adicionais |
| `DataEnvio` | `DATETIME` | – | Data e horário do envio da proposta |
| `Cancelada` | `TINYINT` | NOT NULL, padrão `0` | Indica se a proposta foi cancelada |

**Restrição adicional:** a combinação `idtb_SolicitacaoAtend_Fornecimento` e `idtb_Lista` é `UNIQUE`, impedindo registros duplicados para o mesmo componente dentro de uma solicitação de atendimento.

### `tb_FornecedorTipo`

Relaciona fornecedores às categorias de fornecimento que oferecem.

| Campo | Tipo | Restrições | Descrição |
|---|---|---|---|
| `idtb_Fornecedor` | `INT` | PK composta, FK, NOT NULL | Fornecedor (`tb_Fornecedor`) |
| `idtb_TipoFornecimento` | `INT` | PK composta, FK, NOT NULL | Categoria de fornecimento (`tb_TipoFornecimento`) |

A chave primária é composta pelos dois campos. Assim, um fornecedor pode oferecer diferentes categorias e uma mesma categoria pode estar associada a vários fornecedores.

### `tb_CustoEvento`

Custos adicionais relacionados à realização de um evento, como custos fiscais, operacionais e variáveis. Esses custos não são provenientes das propostas dos fornecedores.

| Campo | Tipo | Restrições | Descrição |
|---|---|---|---|
| `PK_IDCusto` | `INT` | PK, AUTO | Identificador |
| `idtb_Evento` | `INT` | FK, NOT NULL | Evento relacionado (`tb_Evento`) |
| `Tipo` | `VARCHAR(20)` | NOT NULL | Tipo do custo |
| `Descricao` | `VARCHAR(150)` | NOT NULL | Descrição do custo |
| `Valor` | `DECIMAL(10,2)` | NOT NULL | Valor do custo |
| `Cobranca` | `VARCHAR(10)` | NOT NULL, padrão `'total'` | Forma de cobrança: `'total'` para valor fixo do evento ou `'pessoa'` para valor por participante |

### `tb_SolicitacaoCompraIngresso`

Compra feita por um usuário. Pode ter vários ingressos.

| Campo | Tipo | Restrições | Descrição |
|---|---|---|---|
| `PK_IDCompraIngresso` | `INT` | PK, AUTO | Identificador |
| `idtb_Usuario` | `INT` | FK, NOT NULL | Comprador (`tb_Usuario`) |
| `DataHora` | `DATETIME` | NOT NULL | Data e hora da compra |
| `ValorTotal` | `DECIMAL(10,2)` | NOT NULL | Valor total da compra |

### `tb_Ingresso`

Ingresso de um evento, ligado a uma compra.

| Campo | Tipo | Restrições | Descrição |
|---|---|---|---|
| `PK_IDIngresso` | `INT` | PK, AUTO | Identificador |
| `idtb_SolicitacaoCompraIngresso` | `INT` | FK, NOT NULL | Compra (`tb_SolicitacaoCompraIngresso`) |
| `idtb_Evento` | `INT` | FK, NOT NULL | Evento (`tb_Evento`) |
| `Status` | `TINYINT` | NOT NULL, padrão `0` | Situação do ingresso |
| `ValorUnitario` | `DECIMAL(10,2)` | NOT NULL | Valor unitário do ingresso |

### `tb_Pagamento`

Pagamento de uma compra.

| Campo | Tipo | Restrições | Descrição |
|---|---|---|---|
| `PK_IDPagamento` | `INT` | PK, AUTO | Identificador |
| `idtb_CompraIngresso` | `INT` | FK, NOT NULL | Compra paga (`tb_SolicitacaoCompraIngresso`) |
| `idtb_FormaPagamento` | `INT` | FK, NOT NULL | Forma de pagamento (`tb_FormaPagamento`) |
| `DataHora` | `DATETIME` | NOT NULL | Data e hora do pagamento |
| `Valor` | `DECIMAL(10,2)` | NOT NULL | Valor pago |
| `Status` | `TINYINT` | NOT NULL, padrão `0` | Situação do pagamento |

---