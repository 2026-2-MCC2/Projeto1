// Validação do formulário de cadastro
document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.querySelector(".auth-card");
    const campoSenha = document.getElementById("senha");
    const campoConfirmarSenha = document.getElementById("confirmar-senha");
    const mensagemErro = document.getElementById("erro-senha");

    if (!formulario) return;

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const senhasIguais = campoSenha.value === campoConfirmarSenha.value;

        if (!senhasIguais) {
            mensagemErro.hidden = false;
            return;
        }

        mensagemErro.hidden = true;

        // Aqui depois entra a chamada pro back-end (fetch/POST pra criar o usuário)
        console.log("Formulário válido, pronto para enviar ao back-end.");
    });
});
