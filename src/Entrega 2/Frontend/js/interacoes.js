// Interações da landing page

document.addEventListener("DOMContentLoaded", function () {
    // Carrinho lateral
    const carrinho = document.getElementById("carrinho-drawer");
    const botaoCarrinho = document.getElementById("botao-carrinho");
    const fecharCarrinho = document.getElementById("fechar-carrinho");

    if (botaoCarrinho && carrinho) {
        botaoCarrinho.addEventListener("click", function () {
            carrinho.classList.add("aberto");
        });
    }
    if (fecharCarrinho && carrinho) {
        fecharCarrinho.addEventListener("click", function () {
            carrinho.classList.remove("aberto");
        });
    }

    // Ícone de conta -> vai pro login
    const botaoConta = document.getElementById("botao-conta");
    if (botaoConta) {
        botaoConta.addEventListener("click", function () {
            window.location.href = "login.html";
        });
    }

    // Itens de menu que ainda não têm página própria
    document.querySelectorAll("[data-nav]").forEach(function (link) {
        link.addEventListener("click", function (evento) {
            if (link.getAttribute("href") === "#") {
                evento.preventDefault();
                alert(link.dataset.nav + ": página em construção.");
            }
        });
    });

    // Menu mobile (sanduíche)
    const botaoMenu = document.getElementById("botao-menu");
    const nav = document.querySelector(".cabecalho_nav");
    if (botaoMenu && nav) {
        botaoMenu.addEventListener("click", function () {
            nav.classList.toggle("aberto");
        });
    }

    // Modal de evento (fechar)
    const modalEvento = document.getElementById("modal-evento");
    const fecharModalEvento = document.getElementById("fechar-modal-evento");
    const botaoComprar = document.getElementById("modal-evento-comprar");

    if (fecharModalEvento && modalEvento) {
        fecharModalEvento.addEventListener("click", function () {
            modalEvento.hidden = true;
        });
    }

    if (modalEvento) {
        modalEvento.addEventListener("click", function (evento) {
            if (evento.target === modalEvento) {
                modalEvento.hidden = true;
            }
        });
    }

    if (botaoComprar) {
        botaoComprar.addEventListener("click", function () {
            alert("Fluxo de compra ainda não conectado ao back-end.");
        });
    }
});

// Exposta globalmente pra ser chamada pelo eventos.js quando um card é criado
window.abrirModalEvento = function (nomeEvento) {
    const modalEvento = document.getElementById("modal-evento");
    const modalEventoTitulo = document.getElementById("modal-evento-titulo");
    if (modalEvento && modalEventoTitulo) {
        modalEventoTitulo.textContent = nomeEvento;
        modalEvento.hidden = false;
    }
};
