// Interações do painel (Fornecedor)

document.addEventListener("DOMContentLoaded", function () {
    // Botão Filtrar
    const botaoFiltrar = document.getElementById("botao-filtrar");
    const filtroDropdown = document.getElementById("filtro-dropdown");

    if (botaoFiltrar && filtroDropdown) {
        botaoFiltrar.addEventListener("click", function () {
            filtroDropdown.hidden = !filtroDropdown.hidden;
        });

        document.addEventListener("click", function (evento) {
            const cliqueForaDoFiltro =
                !filtroDropdown.contains(evento.target) && evento.target !== botaoFiltrar;
            if (cliqueForaDoFiltro) {
                filtroDropdown.hidden = true;
            }
        });
    }

    // Modal "Ver detalhes"
    const modalPedido = document.getElementById("modal-pedido");
    const fecharModalPedido = document.getElementById("fechar-modal-pedido");

    document.querySelectorAll(".botao-ver-detalhes").forEach(function (botao) {
        botao.addEventListener("click", function () {
            document.getElementById("modal-pedido-numero").textContent = botao.dataset.pedido;
            document.getElementById("modal-pedido-cliente").textContent = botao.dataset.cliente;
            document.getElementById("modal-pedido-data").textContent = botao.dataset.data;
            document.getElementById("modal-pedido-status").textContent = botao.dataset.status;
            modalPedido.hidden = false;
        });
    });

    if (fecharModalPedido && modalPedido) {
        fecharModalPedido.addEventListener("click", function () {
            modalPedido.hidden = true;
        });
    }

    if (modalPedido) {
        modalPedido.addEventListener("click", function (evento) {
            if (evento.target === modalPedido) {
                modalPedido.hidden = true;
            }
        });
    }
});
