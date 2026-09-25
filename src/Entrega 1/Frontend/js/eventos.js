// Consumo assíncrono de dados (API mockada em data/eventos.json)

document.addEventListener("DOMContentLoaded", function () {
    const botaoTentarNovamente = document.getElementById("eventos-tentar-novamente");
    if (botaoTentarNovamente) {
        botaoTentarNovamente.addEventListener("click", carregarEventos);
    }
    carregarEventos();
});

async function carregarEventos() {
    const lista = document.getElementById("lista-eventos");
    const carregando = document.getElementById("eventos-carregando");
    const erro = document.getElementById("eventos-erro");

    if (!lista) return;

    carregando.hidden = false;
    erro.hidden = true;
    lista.innerHTML = "";

    try {
        const resposta = await fetch("data/eventos.json");

        if (!resposta.ok) {
            throw new Error("Falha ao buscar eventos (status " + resposta.status + ")");
        }

        const eventos = await resposta.json();
        renderizarEventos(eventos);
    } catch (erroCapturado) {
        console.error("Erro ao carregar eventos:", erroCapturado);
        erro.hidden = false;
    } finally {
        carregando.hidden = true;
    }
}

function renderizarEventos(eventos) {
    const lista = document.getElementById("lista-eventos");

    eventos.forEach(function (evento) {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "evento-card evento-card--" + evento.cor;

        const span = document.createElement("span");
        span.textContent = evento.nome;
        botao.appendChild(span);

        botao.addEventListener("click", function () {
            if (window.abrirModalEvento) {
                window.abrirModalEvento(evento.nome);
            }
        });

        lista.appendChild(botao);
    });
}
