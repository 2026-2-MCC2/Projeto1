import jwt from 'jsonwebtoken';

export function autenticarToken(req, res, next) {

    // recebe o token enviado pelo frontend
    const autorizacao = req.headers.authorization;

    // verifica se o token foi enviado
    if (!autorizacao) {
        return res.status(401).json({
            mensagem: 'Token de autenticação não informado.'
        });
    }

    // separa o token da palavra Bearer
    const token = autorizacao.split(' ')[1];

    try {

        // verifica se o token é válido
        const usuario = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // disponibiliza os dados do usuário para a rota
        req.usuario = usuario;

        next();

    } catch (erro) {

        return res.status(401).json({
            mensagem: 'Token inválido ou expirado.'
        });

    }
}