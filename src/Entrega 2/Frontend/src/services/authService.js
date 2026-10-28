//Apagar qndo o back estiver pronto 

const contasDemo = {
    'admin@trocaticket.dev':       { name: 'Admin',       role: 'admin' },
    'fornecedor@trocaticket.dev':  { name: 'Fornecedor',  role: 'fornecedor' },
    'organizador@trocaticket.dev': { name: 'Organizador', role: 'organizador' },
};

//Uma funcao assincrona do login para cliente
async function login(email, senha, escopo) {
    //Vai procurar a conta
    const conta = contasDemo[email]
    //se a conta existe ok, se n (nulo ou undefined) use os dados a seguir
    const user = conta ?? { name: email.split('@')[0], role: 'cliente'};
    const authCorreta = 
        escopo = 'equipe' //se for verdadeira, vai checar se o user é diff de cliente
            ? user.role !== 'cliente'  //caso contrario vai ser cliente (:)
            : user.role === 'cliente';
    if (!authCorreta) throw new Error('E-mail ou senha incorretos.');
    return {...user, email};
}