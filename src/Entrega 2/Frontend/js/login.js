document.addEventListener("DOMContentLoaded", function (){
//Selecionando e declarando os elementos
    const formulario = document.querySelector(".auth-card");
    const campoEmail = document.getElementById("email");
    const campoSenha = document.getElementById("senha");
    const mensagemErro = document.getElementById("erro-login");

    if (!formulario || !campoEmail || !campoSenha || !mensagemErro) {
        return;
    }
    //Pega o formulário enviado e escuta
    formulario.addEventListener("submit", function (evento) {

        evento.preventDefault();

        //Pega os valores enviados

        const email = campoEmail.value.trim(); //trim remove espaços em branco no começo e/ou fim
        const senha = campoSenha.value;

        //Se email e/ou senha estiverem vazios
        if (!email || !senha) {
            mensagemErro.textContent =
                "Preencha o e-mail e a senha.";

            mensagemErro.hidden = false; 
            return;
        }
        if (!campoEmail.validity.valid) {
            mensagemErro.textContent =
                "Digite um e-mail válido.";

            mensagemErro.hidden = false;
            return;
        }
        //Se os dados n forem preenchidos é falso e repete até que satisfaça a condição, caso contrário:
        mensagemErro.hidden = true;
        console.log("Logado.");
    });

    function obterLogin(){
        const campoEmail = document.getElementById("email").trim;
        const campoSenha = document.getElementById("senha"); //N vou colocar .trim pois nunca se sabe 
    }
});