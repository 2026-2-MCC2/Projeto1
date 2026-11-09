import conexao from '../src/config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validarCnpj, CATEGORIAS, agora } from '../services/regras.js';
import { comTransacao } from '../utils/transacao.js';

export async function cadastrarCliente(req, res) {
    //recebendo dados pelo react
    const { nome, cpf, telefone, email, senha } = req.body;

    //validacao dos campos obrigatorios 
    if(!nome ||  !cpf || !telefone || !email || !senha) {
        return res.status(400).json({
            mensagem: 'Preencha todos os campos obrigatórios.'
        });
    }

     // Validacao basica dos dados
     if (!/^\d{11}$/.test(cpf)) { //^ marca o inicio, \d
        return res.status(400).json({
            mensagem: 'O CPF deve conter 11 números.'
        });
    }
    if (senha.length < 8) {
        return res.status(400).json({
            mensagem: 'A senha deve possuir pelo menos 8 caracteres.'
        });
    }

    //criando conexao para a transacao
    const conexaoBanco = await conexao.getConnection();

    try {
        //iniciando a transacao 
        await conexaoBanco.beginTransaction();
        //criptografia da senha
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        //inserindo os valores na tb_Conta
        const [resultadoConta] = await conexaoBanco.execute(
            `INSERT INTO tb_Conta
            (idtb_TipoConta, Telefone, Email, Senha)
            VALUES (?, ?, ?, ?)`,
            [
                1,
                telefone.trim(),
                email.trim().toLowerCase(),
                senhaCriptografada
            ]
        );

        //recuperando o id da conta
        const idConta = resultadoConta.insertId;

        //inserindo os dados especificos do usuario
        await conexaoBanco.execute(
            `INSERT INTO tb_Usuario
            (PK_IDConta, CPF, Nome)
            VALUES (?, ?, ?)`,
            [
                idConta,
                cpf,
                nome.trim()
            ]
        );

        // Confirmando as duas inserções
        await conexaoBanco.commit();

        return res.status(201).json({
            mensagem: 'Conta criada com sucesso!',
            usuario: {
                idConta,
                nome: nome.trim(),
                email: email.trim().toLowerCase(),
                perfil: 'cliente'
            }
        });

    } catch (erro) {

        // Desfazendo as alteracoes caso tenha algum erro
        await conexaoBanco.rollback();

        console.error('Erro no cadastro:', erro);

        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                mensagem: 'Este e-mail ou CPF já está cadastrado.'
            });
        }

        return res.status(500).json({
            mensagem: 'Erro interno ao realizar o cadastro.'
        });

    } finally {

        // Liberando a conexão
        conexaoBanco.release();
    }
}

export async function loginCliente(req, res) {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                mensagem: 'Informe o e-mail e a senha.'
            });
        }

        const [contas] = await conexao.execute(
            `SELECT
                c.PK_IDConta AS idConta,
                c.Email AS email,
                c.Senha AS senha,
                tc.Nome AS perfil,
                u.Nome AS nome
            FROM tb_Conta c
            INNER JOIN tb_TipoConta tc
                ON c.idtb_TipoConta = tc.PK_IDTipoConta
            INNER JOIN tb_Usuario u
                ON c.PK_IDConta = u.PK_IDConta
            WHERE c.Email = ?
            LIMIT 1`,
            [email.trim().toLowerCase()]
        );

        if (contas.length === 0) {
            return res.status(401).json({
                mensagem: 'E-mail ou senha incorretos.'
            });
        }

        const conta = contas[0];

        if (conta.perfil.toLowerCase() !== 'cliente') {
            return res.status(401).json({
                mensagem: 'E-mail ou senha incorretos.'
            });
        }

        const senhaCorreta = await bcrypt.compare(
            senha,
            conta.senha
        );

        if (!senhaCorreta) {
            return res.status(401).json({
                mensagem: 'E-mail ou senha incorretos.'
            });
        }

        // Gera o token de autenticação
        const token = jwt.sign(
            {
                idConta: conta.idConta,
                role: conta.perfil.toLowerCase()
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '2h'
            }
        );

        return res.status(200).json({
            mensagem: 'Login realizado com sucesso!',
            token: token,
            usuario: {
                idConta: conta.idConta,
                nome: conta.nome,
                email: conta.email,
                perfil: conta.perfil.toLowerCase()
            }
        });

    } catch (erro) {
        console.error('Erro no login:', erro);

        return res.status(500).json({
            mensagem: 'Erro interno ao realizar login.'
        });
    }
}

export async function consultarPerfil (req, res) {
    try {
        const idConta = req.usuario.idConta;

        const [contas] = await conexao.execute(
            `SELECT
                c.PK_IDConta AS idConta,
                c.Email AS email,
                tc.Nome AS perfil,
                u.Nome AS nome
            FROM tb_Conta c
            INNER JOIN tb_TipoConta tc
                ON c.idtb_TipoConta = tc.PK_IDTipoConta
            INNER JOIN tb_Usuario u
                ON c.PK_IDConta = u.PK_IDConta
            WHERE c.PK_IDConta = ?
            LIMIT 1`,
            [idConta]
        );

        if (contas.length === 0) {
            return res.status(404).json({
                mensagem: 'Usuário não encontrado.'
            });
        }

        const conta = contas[0];

        return res.status(200).json({
            mensagem: 'Perfil consultado com sucesso!',
            usuario: {
                idConta: conta.idConta,
                nome: conta.nome,
                email: conta.email,
                perfil: conta.perfil.toLowerCase()
            }
        });

    } catch (erro) {
        console.error('Erro ao consultar perfil:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao consultar perfil.'
        });
    }
}

export async function atualizarPerfil(req, res) {
    try {
        const idConta = req.usuario.idConta;
        const { nome } = req.body;

        // Verifica se o nome foi informado
        if (!nome || typeof nome !== 'string' || !nome.trim()) {
            return res.status(400).json({
                mensagem: 'Informe um nome válido.'
            });
        }

        // Atualiza o nome do usuário no banco
        const [resultado] = await conexao.execute(
            `UPDATE tb_Usuario
            SET Nome = ?
            WHERE PK_IDConta = ?`,
            [
                nome.trim(),
                idConta
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: 'Usuário não encontrado.'
            });
        }

        // Consulta os dados atualizados
        const [usuarios] = await conexao.execute(
            `SELECT
                c.PK_IDConta AS idConta,
                c.Email AS email,
                tc.Nome AS perfil,
                u.Nome AS nome
            FROM tb_Conta c
            INNER JOIN tb_TipoConta tc
                ON c.idtb_TipoConta = tc.PK_IDTipoConta
            INNER JOIN tb_Usuario u
                ON c.PK_IDConta = u.PK_IDConta
            WHERE c.PK_IDConta = ?
            LIMIT 1`,
            [idConta]
        );

        const usuario = usuarios[0];

        return res.status(200).json({
            mensagem: 'Perfil atualizado com sucesso!',
            usuario: {
                idConta: usuario.idConta,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil.toLowerCase()
            }
        });

    } catch (erro) {
        console.error('Erro ao atualizar perfil:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao atualizar perfil.'
        });
    }
}
// ============================================================
// Organizador, Fornecedor e Administrador
// ============================================================

const TIPO_CONTA = { organizador: 2, fornecedor: 3 };

// Autocadastro de organizador/fornecedor: nasce PENDENTE até o administrador aprovar (RF01 e RF02)
export async function cadastrarParceiro(req, res) {
    const { role, nome, empresa, cnpj, telefone, email, senha, endereco } = req.body ?? {};
    const atuacao = Array.isArray(req.body?.atuacao) ? req.body.atuacao : [];

    if (!TIPO_CONTA[role]) return res.status(400).json({ mensagem: 'Informe se você é "organizador" ou "fornecedor".' });
    if (!nome || String(nome).trim().length < 3) return res.status(400).json({ mensagem: 'Informe o nome (mínimo de 3 caracteres).' });
    if (!/^\S+@\S+\.\S+$/.test(String(email ?? '').trim())) return res.status(400).json({ mensagem: 'Informe um e-mail válido.' });
    if (!validarCnpj(cnpj)) return res.status(400).json({ mensagem: 'CNPJ inválido. Confira os 14 dígitos.' });
    if (!senha || String(senha).length < 8) return res.status(400).json({ mensagem: 'A senha deve possuir pelo menos 8 caracteres.' });
    if (role === 'fornecedor' && (!atuacao.length || !atuacao.every((a) => CATEGORIAS.includes(a)))) {
        return res.status(400).json({ mensagem: 'Informe ao menos uma área de atuação válida.' });
    }

    try {
        const senhaCriptografada = await bcrypt.hash(String(senha), 10);
        const emailLimpo = String(email).trim().toLowerCase();
        const idConta = await comTransacao(async (cx) => {
            const [conta] = await cx.query(
                'INSERT INTO tb_Conta (idtb_TipoConta, Telefone, Email, Senha) VALUES (?, ?, ?, ?)',
                [TIPO_CONTA[role], String(telefone ?? '').trim() || null, emailLimpo, senhaCriptografada]);
            const nomeExibicao = String(empresa || nome).trim();
            const tabela = role === 'organizador' ? 'tb_Organizador' : 'tb_Fornecedor';
            const [parceiro] = await cx.query(
                `INSERT INTO ${tabela} (PK_IDConta, CNPJ, Endereco, Nome) VALUES (?, ?, ?, ?)`,
                [conta.insertId, String(cnpj).replace(/\D/g, ''), String(endereco ?? '').trim() || null, nomeExibicao]);
            if (role === 'fornecedor') {
                for (const categoria of [...new Set(atuacao)]) {
                    await cx.query(
                        `INSERT INTO tb_FornecedorTipo (idtb_Fornecedor, idtb_TipoFornecimento)
                         SELECT ?, PK_IDTipoFornecimento FROM tb_TipoFornecimento WHERE Nome = ?`, [parceiro.insertId, categoria]);
                }
            }
            await cx.query('INSERT INTO tb_SolicitacaoConta (idtb_Conta, DataHora, StatusSolicitacao) VALUES (?, ?, 0)', [conta.insertId, agora()]);
            return conta.insertId;
        });
        return res.status(201).json({
            mensagem: 'Cadastro enviado! Aguarde a aprovação do administrador.',
            usuario: { idConta, nome: String(nome).trim(), email: emailLimpo, perfil: role, status: 'Pendente' }
        });
    } catch (erro) {
        if (erro.code === 'ER_DUP_ENTRY') return res.status(409).json({ mensagem: 'Este e-mail ou CNPJ já está cadastrado.' });
        console.error('Erro no cadastro de parceiro:', erro);
        return res.status(500).json({ mensagem: 'Erro interno ao realizar o cadastro.' });
    }
}

// Login da equipe: administrador (tb_Administrador) ou organizador/fornecedor APROVADO
export async function loginEquipe(req, res) {
    try {
        const { email, senha } = req.body ?? {};
        if (!email || !senha) return res.status(400).json({ mensagem: 'Informe o e-mail e a senha.' });
        const emailLimpo = String(email).trim().toLowerCase();
        const incorreto = () => res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
        const sign = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

        // 1) administrador
        const [admins] = await conexao.query('SELECT PK_CodFunc AS idAdmin, Nome AS nome, Email AS email, Senha AS senha FROM tb_Administrador WHERE Email = ? LIMIT 1', [emailLimpo]);
        if (admins.length) {
            const a = admins[0];
            if (!(await bcrypt.compare(String(senha), a.senha))) return incorreto();
            return res.status(200).json({
                mensagem: 'Login realizado com sucesso!',
                token: sign({ idAdmin: a.idAdmin, role: 'admin', nome: a.nome }),
                usuario: { idAdmin: a.idAdmin, nome: a.nome, email: a.email, perfil: 'admin' }
            });
        }

        // 2) organizador ou fornecedor
        const [contas] = await conexao.query(
            `SELECT c.PK_IDConta AS idConta, c.Email AS email, c.Senha AS senha, tc.Nome AS perfil,
                    COALESCE(o.Nome, f.Nome) AS nome, o.PK_IDOrganizador AS idOrganizador, f.PK_IDFornecedor AS idFornecedor
             FROM tb_Conta c
             INNER JOIN tb_TipoConta tc ON tc.PK_IDTipoConta = c.idtb_TipoConta
             LEFT JOIN tb_Organizador o ON o.PK_IDConta = c.PK_IDConta
             LEFT JOIN tb_Fornecedor f ON f.PK_IDConta = c.PK_IDConta
             WHERE c.Email = ? AND c.idtb_TipoConta IN (2, 3) LIMIT 1`, [emailLimpo]);
        if (!contas.length) return incorreto();
        const c = contas[0];
        if (!(await bcrypt.compare(String(senha), c.senha))) return incorreto();

        const [solicitacoes] = await conexao.query(
            'SELECT StatusSolicitacao AS status FROM tb_SolicitacaoConta WHERE idtb_Conta = ? ORDER BY PK_IDSolicitacaoConta DESC LIMIT 1', [c.idConta]);
        const status = solicitacoes[0]?.status ?? 0;
        if (status === 0) return res.status(403).json({ mensagem: 'Seu cadastro ainda está em análise pelo administrador.' });
        if (status === 2) return res.status(403).json({ mensagem: 'Seu cadastro não foi aprovado. Fale com o suporte da TrocaTicket.' });

        const role = c.perfil.toLowerCase();
        return res.status(200).json({
            mensagem: 'Login realizado com sucesso!',
            token: sign({ idConta: c.idConta, idOrganizador: c.idOrganizador ?? undefined, idFornecedor: c.idFornecedor ?? undefined, role, nome: c.nome }),
            usuario: { idConta: c.idConta, nome: c.nome, email: c.email, perfil: role }
        });
    } catch (erro) {
        console.error('Erro no login da equipe:', erro);
        return res.status(500).json({ mensagem: 'Erro interno ao realizar login.' });
    }
}
