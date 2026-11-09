// Usado DEPOIS de autenticarToken: só deixa passar os perfis permitidos (admin, organizador, fornecedor...).
export const exigirPerfil = (...perfis) => (req, res, next) => {
    if (!perfis.includes(req.usuario?.role)) {
        return res.status(403).json({ mensagem: 'Você não tem permissão para acessar este recurso.' });
    }
    next();
};
