// Cadastro: validação no navegador + criação da conta pela API
document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.querySelector(".auth-card");
    const campoPerfil = document.getElementById("perfil");
    const campoEmail = document.getElementById("email");
    const campoSenha = document.getElementById("senha");
    const campoConfirmarSenha = document.getElementById("confirmar-senha");
    const mensagemErro = document.getElementById("erro-senha");

    if (!formulario) return;

    function exibirErro(texto) {
        mensagemErro.textContent = texto;
        mensagemErro.hidden = !texto;
    }

    // Validação antes do envio. Devolve o texto do erro (ou "" se estiver tudo certo)
    function validarCadastro() {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campoEmail.value.trim())) {
            return "Digite um e-mail válido.";
        }
        if (campoSenha.value.length < 8) {
            return "A senha precisa ter pelo menos 8 caracteres.";
        }
        if (campoSenha.value !== campoConfirmarSenha.value) {
            return "As senhas não coincidem.";
        }
        return "";
    }

    function mostrarSucesso() {
        formulario.innerHTML =
            '<div class="auth-sucesso">' +
            '<span class="auth-sucesso_icone">✅</span>' +
            "<h2>Conta criada com sucesso!</h2>" +
            '<p class="auth-sucesso_texto">Redirecionando para o login...</p>' +
            "</div>";

        setTimeout(function () {
            window.location.href = "login.html?cadastro=ok";
        }, 1800);
    }

    formulario.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        const erro = validarCadastro();
        if (erro) {
            exibirErro(erro);
            return;
        }
        exibirErro("");

        try {
            // chamarApi (js/autenticacao.js) faz o fetch para POST /api/auth/cadastro
            await chamarApi("/auth/cadastro", {
                metodo: "POST",
                autenticado: false,
                corpo: {
                    email: campoEmail.value.trim(),
                    senha: campoSenha.value,
                    perfil: campoPerfil.value
                }
            });
            mostrarSucesso();
        } catch (erroApi) {
            exibirErro(erroApi.message);
        }
    });
});
