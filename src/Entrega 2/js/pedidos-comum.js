// Peças compartilhadas pelas telas que listam pedidos (painel do fornecedor e "Solicitações" do admin)

// Para cada status atual: quais botões aparecem [texto, novo status, classe do botão]
const ACOES_POR_STATUS = {
    "Em análise": [["Aprovar", "Aprovado", "botao-aprovar"], ["Cancelar", "Cancelado", "botao-cancelar"]],
    "Aprovado": [["Cancelar", "Cancelado", "botao-cancelar"]],
    "Cancelado": [["Reativar", "Em análise", "botao-detalhes"]]
};

// Pede à API para mudar o status e avisa o resultado na tela
async function mudarStatusDoPedido(pedido, novoStatus, aoConcluir) {
    try {
        await chamarApi("/pedidos/" + pedido.id + "/status", { metodo: "PATCH", corpo: { status: novoStatus } });

        const frases = { "Aprovado": "aprovado", "Cancelado": "cancelado", "Em análise": "reativado (em análise)" };
        mostrarAviso("Pedido " + numeroDoPedido(pedido.id) + " " + frases[novoStatus] + ".");
        aoConcluir();
    } catch (erro) {
        mostrarAviso(erro.message, "erro");
    }
}

// Monta uma linha da tabela: Pedido | Cliente | Data | Status | Ações
function criarLinhaDoPedido(pedido, aoMudar) {
    const linha = document.createElement("tr");

    [numeroDoPedido(pedido.id), pedido.cliente, formatarData(pedido.data)].forEach(function (texto) {
        linha.appendChild(criarElemento("td", "", texto));
    });

    const celulaStatus = document.createElement("td");
    celulaStatus.appendChild(criarPillStatus(pedido.status));
    linha.appendChild(celulaStatus);

    const celulaAcoes = document.createElement("td");
    const grupo = criarElemento("div", "acoes-linha");

    const botaoDetalhes = criarElemento("button", "botao-detalhes", "Ver detalhes");
    botaoDetalhes.type = "button";
    botaoDetalhes.addEventListener("click", function () { abrirModalDoPedido(pedido); });
    grupo.appendChild(botaoDetalhes);

    (ACOES_POR_STATUS[pedido.status] || []).forEach(function (acao) {
        const botao = criarElemento("button", acao[2], acao[0]);
        botao.type = "button";
        botao.addEventListener("click", function () { mudarStatusDoPedido(pedido, acao[1], aoMudar); });
        grupo.appendChild(botao);
    });

    celulaAcoes.appendChild(grupo);
    linha.appendChild(celulaAcoes);
    return linha;
}

// Preenche e abre o modal #modal-pedido
function abrirModalDoPedido(pedido) {
    document.getElementById("modal-pedido-numero").textContent = numeroDoPedido(pedido.id);
    document.getElementById("modal-pedido-cliente").textContent = pedido.cliente;
    document.getElementById("modal-pedido-data").textContent = formatarData(pedido.data);
    document.getElementById("modal-pedido-evento").textContent = pedido.evento_nome || "—";
    document.getElementById("modal-pedido-valor").textContent = formatarMoeda(pedido.valor);
    document.getElementById("modal-pedido-status").textContent = pedido.status;
    abrirModal("modal-pedido");
}
