# Banco de dados (MySQL) — TrocaTicket

## Como criar o banco

Execute o script abaixo uma única vez, utilizando o MySQL Workbench ou o terminal:

1. `BD/db_TrocaTicket.sql`: cria o banco, as tabelas, os relacionamentos, as restrições de integridade e os dados fixos necessários ao sistema, incluindo os módulos de contas, eventos, ingressos, pagamentos e planejamento.

Depois de criar o banco, execute na raiz do projeto:

```bash
npm run seed
```

Esse comando cria as contas e os eventos de demonstração utilizados pela aplicação.

As credenciais de demonstração estão definidas no script de seed. Elas devem ser utilizadas somente no ambiente de desenvolvimento.

## Como o planejamento utiliza as tabelas

| Conceito do sistema | Tabela / coluna |
|---|---|
| Organizador, fornecedor e cliente | `tb_Conta` + `tb_Organizador` / `tb_Fornecedor` / `tb_Usuario` |
| Administrador | `tb_Administrador` (criado diretamente no banco, sem autocadastro) |
| Cadastro pendente / aprovado / rejeitado | `tb_SolicitacaoConta.StatusSolicitacao` = 0 / 1 / 2 |
| Evento | `tb_Evento`: `Titulo`, `Local`, `DataHora`, `DataFim`, `PublicoMinimo`, `PublicoEsperado`, `Capacidade`, `MargemLucro` |
| Status do evento | `tb_Evento.StatusEvento`: 0 Rascunho, 1 Aberto para cotação, 2 Cotação encerrada, 3 Orçamento fechado |
| Item de composição de custo | `tb_ListaComponentes` (`NomeItem`, `Quantidade`, categoria em `idtb_TipoFornecimento`) |
| Custos fiscais, operacionais e variáveis | `tb_CustoEvento` (`Cobranca`: `total` = valor fixo, `pessoa` = por participante) |
| Participação de fornecedor em evento | `tb_SolicitacaoAtend_Fornecimento` |
| Proposta de fornecedor para um item | `tb_ListaItensFornecimentos` |
| Proposta selecionada | `tb_ListaComponentes.idtb_ItemSelecionado` |

**Status da proposta:** é derivado, não armazenado diretamente. Uma proposta cancelada é identificada por `Cancelada = 1`; caso contrário, pode estar selecionada, não selecionada ou enviada, conforme a proposta vinculada ao item.

## Integridade

- As relações utilizam chaves estrangeiras para manter a integridade dos dados.
- A exclusão de eventos pela API é realizada em transação e na ordem necessária para evitar registros órfãos.
- Restrições `UNIQUE` são utilizadas para evitar duplicidade de e-mail, CPF, CNPJ e propostas para o mesmo fornecedor e item.
- As senhas são armazenadas com hash bcrypt, nunca em texto puro.