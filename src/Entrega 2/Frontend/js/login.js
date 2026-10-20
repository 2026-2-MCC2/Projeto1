document.addEventListener("DOMContentLoaded", function () {

    const formulario = document.querySelector(".auth-card");
    const campoEmail = document.getElementById("email");
    const campoSenha = document.getElementById("senha");
    const mensagemErro = document.getElementById("erro-login");

    if (!formulario || !campoEmail || !campoSenha || !mensagemErro) {
        return;
    }

    function obterLogin() {
        const email = campoEmail.value.trim();
        const senha = campoSenha.value;

        return { email, senha };
    }

    function validarLogin(email, senha) {
        if (!email || !senha) {
            return "Preencha o e-mail e a senha.";
        }

        if (!campoEmail.validity.valid) {
            return "Digite um e-mail válido.";
        }

        return null;
    }
    //mensagem de erro
    function exibirMensagem(texto) {
        mensagemErro.textContent = texto;
        mensagemErro.hidden = !texto;
    }

    //processo de login
    async function loginUsuario() {
        const { email, senha } = obterLogin();
        // armazena os resultados de validar login e chama a função validar login (que checa os valores inseridos)
        const erro = validarLogin(email, senha);
        // se houver dados n preenchidps exibe o erro
        if (erro) {
            exibirMensagem(erro);
            return;
        }
        //se n limpa a mensagem
        exibirMensagem("");
        // e espera realizar o login e logo em seguida trata a resposta 
        try {
            const resposta = await realizarLogin(email, senha);
            tratarRespostaLogin(resposta);
        } catch (erro) { //mostra erro se der errado
            exibirMensagem(
                "Não foi possível realizar o login. Tente novamente."
            );

            console.error(erro);
        }
    }

    //enviando os dados ao backend, realiza a função sem estar sincrona (ou seja, realiza sem ter q parar e esperar outras tarefas)
    async function realizarLogin(email, senha) {
        // usar o fetch quando a API estiver pronta
        // a função ainda não autentica ninguém

        console.log("Dados validados para envio ao backend.");

        return {
            sucesso: false,
            mensagem: "A autenticação ainda não foi implementada."
        };
    }

    //interpretando a resposta do backend, precisa esperar o realizarLogin (sincrona)
    function tratarRespostaLogin(resposta) {
        if (!resposta.sucesso) {
            exibirMensagem(
                resposta.mensagem || "E-mail ou senha inválidos."
            );
            return;
        }

        redirecionarPorPerfil(resposta.perfil);
    }

    //redirecionando conforme o perfil
    function redirecionarPorPerfil(perfil) {
        const paginas = {
            usuario: "dashboard-usuario.html",
            organizador: "dashboard-organizador.html",
            fornecedor: "dashboard-fornecedor.html",
            administrador: "dashboard-admin.html"
        };

        const pagina = paginas[perfil];

        if (!pagina) {
            exibirMensagem("Perfil de usuário inválido.");
            return;
        }

        window.location.href = pagina;
    }

    //o envio do formulário
    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();
        loginUsuario(); //chama o login do user
    });

});