-- ============================================================
-- TrocaTicket - ajustes do banco para o módulo de PLANEJAMENTO
-- Rode DEPOIS de db_TrocaTicket.sql (o script original do grupo).
-- Cada comando fica em uma linha própria (facilita testar e reaplicar).
-- ============================================================
USE db_TrocaTicket;

-- Nome de exibição de organizadores e fornecedores (tb_Conta não tem nome)
ALTER TABLE tb_Organizador ADD COLUMN Nome VARCHAR(150) NOT NULL DEFAULT '';
ALTER TABLE tb_Fornecedor ADD COLUMN Nome VARCHAR(150) NOT NULL DEFAULT '';

-- Rastreabilidade das decisões do administrador
ALTER TABLE tb_SolicitacaoConta ADD COLUMN DataDecisao DATETIME NULL;

-- Evento: data de fim e status do planejamento
--   StatusEvento: 0 = Rascunho, 1 = Aberto para cotação, 2 = Cotação encerrada, 3 = Orçamento fechado
--   Capacidade = público máximo | PublicoMinimo / PublicoEsperado / MargemLucro já existiam
ALTER TABLE tb_Evento ADD COLUMN DataFim DATETIME NULL;
ALTER TABLE tb_Evento ADD COLUMN StatusEvento TINYINT NOT NULL DEFAULT 0;

-- Itens de custo: categoria do item (tb_TipoFornecimento)
ALTER TABLE tb_ListaComponentes ADD COLUMN idtb_TipoFornecimento INT NULL;
ALTER TABLE tb_ListaComponentes ADD CONSTRAINT fk_ListaComponentes_Tipo FOREIGN KEY (idtb_TipoFornecimento) REFERENCES tb_TipoFornecimento (PK_IDTipoFornecimento);

-- Propostas (tb_ListaItensFornecimentos): validade, observações, data de envio e cancelamento
--   Status da proposta é DERIVADO: Cancelada=1 -> Cancelada | item selecionado = esta proposta -> Selecionada |
--   outro selecionado -> Não selecionada | senão -> Enviada
ALTER TABLE tb_ListaItensFornecimentos ADD COLUMN Validade DATE NULL;
ALTER TABLE tb_ListaItensFornecimentos ADD COLUMN Observacoes VARCHAR(255) NULL;
ALTER TABLE tb_ListaItensFornecimentos ADD COLUMN DataEnvio DATETIME NULL;
ALTER TABLE tb_ListaItensFornecimentos ADD COLUMN Cancelada TINYINT NOT NULL DEFAULT 0;

-- Áreas de atuação do fornecedor (N:N com tb_TipoFornecimento)
CREATE TABLE tb_FornecedorTipo (
    idtb_Fornecedor INT NOT NULL,
    idtb_TipoFornecimento INT NOT NULL,
    PRIMARY KEY (idtb_Fornecedor, idtb_TipoFornecimento),
    FOREIGN KEY (idtb_Fornecedor) REFERENCES tb_Fornecedor (PK_IDFornecedor),
    FOREIGN KEY (idtb_TipoFornecimento) REFERENCES tb_TipoFornecimento (PK_IDTipoFornecimento)
);

-- Custos fiscais, operacionais, variáveis e outros (não vêm de propostas)
--   Cobranca: 'total' = valor fixo do evento | 'pessoa' = valor por participante
CREATE TABLE tb_CustoEvento (
    PK_IDCusto INT AUTO_INCREMENT PRIMARY KEY,
    idtb_Evento INT NOT NULL,
    Tipo VARCHAR(20) NOT NULL,
    Descricao VARCHAR(150) NOT NULL,
    Valor DECIMAL(10,2) NOT NULL,
    Cobranca VARCHAR(10) NOT NULL DEFAULT 'total',
    FOREIGN KEY (idtb_Evento) REFERENCES tb_Evento (PK_IDEvento)
);

-- Categorias de itens (as mesmas do front-end)
INSERT INTO tb_TipoFornecimento (Nome) VALUES
('Iluminação'), ('Som'), ('Alimentação'), ('Bebidas'), ('Segurança'), ('Estrutura'), ('Limpeza'), ('Outros');

-- Códigos de status usados na API
--   tb_SolicitacaoConta.StatusSolicitacao: 0 = Pendente, 1 = Aprovado, 2 = Rejeitado
--   tb_SolicitacaoEvento.Status: 1 = Registrada (criada pelo organizador)
