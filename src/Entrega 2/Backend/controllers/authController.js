import conexao from '../src/config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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