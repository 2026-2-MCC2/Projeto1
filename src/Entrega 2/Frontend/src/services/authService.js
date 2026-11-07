
const API_URL = 'http://localhost:3000/api/auth';

// Cadastro de cliente no backend
export async function cadastrarCliente(dados) {
    const resposta = await fetch(`${API_URL}/cadastro`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
        throw new Error(
            resultado.mensagem || 'Erro ao realizar cadastro.'
        );
    }

    return {
        name: resultado.usuario.nome,
        email: resultado.usuario.email,
        role: resultado.usuario.perfil
    };
}


// Login de usuário
export async function login(email, senha, escopo) {
    const emailLimpo = email.trim().toLowerCase();

    // Login real de cliente pelo banco de dados
    if (escopo === 'cliente') {
        const resposta = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: emailLimpo,
                senha
            })
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                resultado.mensagem || 'Erro ao realizar login.'
            );
        }

        // Retorna os dados do usuário e o JWT
        return {
            name: resultado.usuario.nome,
            email: resultado.usuario.email,
            role: resultado.usuario.perfil,
            token: resultado.token
        };
    }

    // Login de demonstração da equipe (temporário)
    const contasDemo = {
        'admin@trocaticket.dev': {
            name: 'Admin',
            role: 'admin'
        },

        'fornecedor@trocaticket.dev': {
            name: 'Fornecedor',
            role: 'fornecedor'
        },

        'organizador@trocaticket.dev': {
            name: 'Organizador',
            role: 'organizador'
        }
    };

    const conta = contasDemo[emailLimpo];

    if (!conta) {
        throw new Error('E-mail ou senha incorretos.');
    }

    return {
        ...conta,
        email: emailLimpo
    };
}


// Consulta o perfil utilizando o JWT
export async function consultarPerfil(token) {
    const resposta = await fetch(`${API_URL}/perfil`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
        throw new Error(
            resultado.mensagem || 'Erro ao consultar perfil.'
        );
    }

    return resultado.usuario;
}

// Atualiza o perfil utilizando o JWT
export async function atualizarPerfil(token, dados) {
  const resposta = await fetch(`${API_URL}/perfil`, {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(dados)
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
      throw new Error(
          resultado.mensagem || 'Erro ao atualizar perfil.'
      );
  }

  return resultado.usuario;
}