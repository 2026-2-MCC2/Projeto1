CREATE DATABASE IF NOT EXISTS db_TrocaTicket;
USE db_TrocaTicket;

CREATE TABLE tb_TipoConta (
    PK_IDTipoConta INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(50) NOT NULL
);

CREATE TABLE tb_FormaPagamento (
    PK_IDFormaPagamento INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(50) NOT NULL
);

CREATE TABLE tb_TipoFornecimento (
    PK_IDTipoFornecimento INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(100) NOT NULL
);

CREATE TABLE tb_Conta (
    PK_IDConta INT AUTO_INCREMENT PRIMARY KEY,
    idtb_TipoConta INT NOT NULL,
    Telefone VARCHAR(20),
    Email VARCHAR(150) NOT NULL UNIQUE,
    Senha VARCHAR(255) NOT NULL,

    FOREIGN KEY (idtb_TipoConta)
    REFERENCES tb_TipoConta (PK_IDTipoConta)
);

CREATE TABLE tb_Administrador (
    PK_CodFunc INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(150) NOT NULL UNIQUE,
    Senha VARCHAR(255) NOT NULL,
    Genero VARCHAR(30),
    Nome VARCHAR(100) NOT NULL
);

CREATE TABLE tb_Usuario (
    PK_IDUsuario INT AUTO_INCREMENT PRIMARY KEY,
    PK_IDConta INT NOT NULL UNIQUE,
    CPF CHAR(11) NOT NULL UNIQUE,
    Nome VARCHAR(100) NOT NULL,

    FOREIGN KEY (PK_IDConta)
    REFERENCES tb_Conta (PK_IDConta)
);

CREATE TABLE tb_Organizador (
    PK_IDOrganizador INT AUTO_INCREMENT PRIMARY KEY,
    PK_IDConta INT NOT NULL UNIQUE,
    CNPJ CHAR(14) NOT NULL UNIQUE,
    Endereco VARCHAR(200),

    FOREIGN KEY (PK_IDConta)
    REFERENCES tb_Conta (PK_IDConta)
);

CREATE TABLE tb_Fornecedor (
    PK_IDFornecedor INT AUTO_INCREMENT PRIMARY KEY,
    PK_IDConta INT NOT NULL UNIQUE,
    CNPJ CHAR(14) NOT NULL UNIQUE,
    Endereco VARCHAR(200),

    FOREIGN KEY (PK_IDConta)
    REFERENCES tb_Conta (PK_IDConta)
);

CREATE TABLE tb_SolicitacaoConta (
    PK_IDSolicitacaoConta INT AUTO_INCREMENT PRIMARY KEY,
    idtb_Conta INT NOT NULL,
    idtb_Administrador INT,
    DataHora DATETIME NOT NULL,
    StatusSolicitacao TINYINT NOT NULL DEFAULT 0,
    Justificativa VARCHAR(255),

    FOREIGN KEY (idtb_Conta)
    REFERENCES tb_Conta (PK_IDConta),

    FOREIGN KEY (idtb_Administrador)
    REFERENCES tb_Administrador (PK_CodFunc)
);

CREATE TABLE tb_SolicitacaoEvento (
    PK_IDSolicitacaoEvento INT AUTO_INCREMENT PRIMARY KEY,
    idtb_Organizador INT NOT NULL,
    idtb_Administrador INT,
    DataHora DATETIME NOT NULL,
    Status TINYINT NOT NULL DEFAULT 0,

    FOREIGN KEY (idtb_Organizador)
    REFERENCES tb_Organizador (PK_IDOrganizador),

    FOREIGN KEY (idtb_Administrador)
    REFERENCES tb_Administrador (PK_CodFunc)
);

CREATE TABLE tb_Evento (
    PK_IDEvento INT AUTO_INCREMENT PRIMARY KEY,
    idtb_SolicitacaoEvento INT NOT NULL UNIQUE,
    Titulo VARCHAR(150) NOT NULL,
    Descricao TEXT,
    Local VARCHAR(200) NOT NULL,
    Capacidade INT NOT NULL,
    PublicoMinimo INT,
    PublicoEsperado INT,
    Categoria VARCHAR(100),
    DataHora DATETIME NOT NULL,
    MargemLucro DECIMAL(5,2),

    FOREIGN KEY (idtb_SolicitacaoEvento)
    REFERENCES tb_SolicitacaoEvento (PK_IDSolicitacaoEvento)
);

CREATE TABLE tb_ListaComponentes (
    PK_IDLista INT AUTO_INCREMENT PRIMARY KEY,
    idtb_Evento INT NOT NULL,
    NomeItem VARCHAR(100) NOT NULL,
    Quantidade INT NOT NULL,
    ValorEstimado DECIMAL(10,2),
    idtb_ItemSelecionado INT,

    FOREIGN KEY (idtb_Evento)
    REFERENCES tb_Evento (PK_IDEvento)
);

CREATE TABLE tb_SolicitacaoAtend_Fornecimento (
    PK_IDSolicitacaoAtend_Fornecedor INT AUTO_INCREMENT PRIMARY KEY,
    idtb_Fornecedor INT NOT NULL,
    idtb_Evento INT NOT NULL,
    DataHora DATETIME NOT NULL,
    Status TINYINT NOT NULL DEFAULT 0,

    FOREIGN KEY (idtb_Fornecedor)
    REFERENCES tb_Fornecedor (PK_IDFornecedor),

    FOREIGN KEY (idtb_Evento)
    REFERENCES tb_Evento (PK_IDEvento),

    UNIQUE (idtb_Fornecedor, idtb_Evento)
);

CREATE TABLE tb_ListaItensFornecimentos (
    PK_IDItem INT AUTO_INCREMENT PRIMARY KEY,
    idtb_SolicitacaoAtend_Fornecimento INT NOT NULL,
    idtb_Lista INT NOT NULL,
    idtb_TipoFornecimento INT,
    Valor DECIMAL(10,2) NOT NULL,
    Quantidade INT NOT NULL,
    Descricao TEXT,

    FOREIGN KEY (idtb_SolicitacaoAtend_Fornecimento)
    REFERENCES tb_SolicitacaoAtend_Fornecimento
    (PK_IDSolicitacaoAtend_Fornecedor),

    FOREIGN KEY (idtb_Lista)
    REFERENCES tb_ListaComponentes (PK_IDLista),

    FOREIGN KEY (idtb_TipoFornecimento)
    REFERENCES tb_TipoFornecimento (PK_IDTipoFornecimento),

    UNIQUE (idtb_SolicitacaoAtend_Fornecimento, idtb_Lista)
);

CREATE TABLE tb_SolicitacaoCompraIngresso (
    PK_IDCompraIngresso INT AUTO_INCREMENT PRIMARY KEY,
    idtb_Usuario INT NOT NULL,
    DataHora DATETIME NOT NULL,
    ValorTotal DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (idtb_Usuario)
    REFERENCES tb_Usuario (PK_IDUsuario)
);

CREATE TABLE tb_Ingresso (
    PK_IDIngresso INT AUTO_INCREMENT PRIMARY KEY,
    idtb_SolicitacaoCompraIngresso INT NOT NULL,
    idtb_Evento INT NOT NULL,
    Status TINYINT NOT NULL DEFAULT 0,
    ValorUnitario DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (idtb_SolicitacaoCompraIngresso)
    REFERENCES tb_SolicitacaoCompraIngresso
    (PK_IDCompraIngresso),

    FOREIGN KEY (idtb_Evento)
    REFERENCES tb_Evento (PK_IDEvento)
);

CREATE TABLE tb_Pagamento (
    PK_IDPagamento INT AUTO_INCREMENT PRIMARY KEY,
    idtb_CompraIngresso INT NOT NULL,
    idtb_FormaPagamento INT NOT NULL,
    DataHora DATETIME NOT NULL,
    Valor DECIMAL(10,2) NOT NULL,
    Status TINYINT NOT NULL DEFAULT 0,

    FOREIGN KEY (idtb_CompraIngresso)
    REFERENCES tb_SolicitacaoCompraIngresso
    (PK_IDCompraIngresso),

    FOREIGN KEY (idtb_FormaPagamento)
    REFERENCES tb_FormaPagamento (PK_IDFormaPagamento)
);

ALTER TABLE tb_ListaComponentes
ADD CONSTRAINT fk_ListaComponentes_ItemSelecionado
FOREIGN KEY (idtb_ItemSelecionado)
REFERENCES tb_ListaItensFornecimentos (PK_IDItem);

INSERT INTO tb_TipoConta (Nome) VALUES
('Cliente'),
('Organizador'),
('Fornecedor');

INSERT INTO tb_FormaPagamento (Nome) VALUES
('PIX'),
('Cartao'),
('Boleto');
