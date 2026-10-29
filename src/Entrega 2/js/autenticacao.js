// Funções compartilhadas por todas as telas: sessão (login), chamadas à API,
// avisos na tela e utilidades. Precisa ser carregado ANTES dos outros scripts da página.

// Endereço da API. Ao publicar o back-end, troque pela URL pública
// (ex.: "https://troca-ticket-api.onrender.com/api").
const API_URL = "http://localhost:3000/api";

// Para onde cada tipo de conta vai depois de entrar
const PAGINA_POR_PERFIL = {
    usuario: "dashboard-usuario.html",
    organizador: "dashboard-organizador.html",
    fornecedor: "dashboard-fornecedor.html",
    administrador: "dashboard-admin.html"
};

/* ---------- Sessão (guardada no localStorage) ---------- */

function obterSessao() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    return {
        token: token,
        perfil: localStorage.getItem("perfil"),
        email: localStorage.getItem("email")
    };
}

function salvarSessao(dados) {
    localStorage.setItem("token", dados.token);
    localStorage.setItem("perfil", dados.usuario.perfil);
    localStorage.setItem("email", dados.usuario.email);
}

function limparSessao() {
    ["token", "perfil", "email"].forEach(function (chave) {
        localStorage.removeItem(chave);
    });
}

function paginaDoPerfil(perfil) {
    return PAGINA_POR_PERFIL[perfil] || "index.html";
}

// Protege uma página: sem login volta para o login; com o perfil errado vai para o painel certo.
// Devolve a sessão (ou null, e nesse caso a página deve parar de carregar).
function exigirLogin(perfisPermitidos) {
    const sessao = obterSessao();

    if (!sessao) {
        window.location.href = "login.html";
        return null;
    }

    if (perfisPermitidos && !perfisPermitidos.includes(sessao.perfil)) {
        window.location.href = paginaDoPerfil(sessao.perfil);
        return null;
    }

    return sessao;
}

/* ---------- Chamadas à API ---------- */

class ErroApi extends Error {
    constructor(mensagem, status) {
        super(mensagem);
        this.status = status;
    }
}

// Faz uma chamada à API e devolve o JSON. Em caso de erro lança ErroApi com a mensagem
// padronizada que veio do servidor ({ erro: "..." }).
async function chamarApi(caminho, opcoes) {
    const config = opcoes || {};
    const metodo = config.metodo || "GET";
    const autenticado = config.autenticado !== false;
    const sessao = obterSessao();

    const headers = {};
    if (config.corpo !== undefined) headers["Content-Type"] = "application/json";
    if (autenticado && sessao) headers["Authorization"] = "Bearer " + sessao.token;

    let resposta;
    try {
        resposta = await fetch(API_URL + caminho, {
            method: metodo,
            headers: headers,
            body: config.corpo !== undefined ? JSON.stringify(config.corpo) : undefined
        });
    } catch (erro) {
        throw new ErroApi("Não foi possível conectar ao servidor. Verifique se a API está rodando.", 0);
    }

    const dados = await resposta.json().catch(function () { return {}; });

    if (!resposta.ok) {
        // Token vencido ou inválido: encerra a sessão e volta para o login
        if (resposta.status === 401 && autenticado && sessao) {
            limparSessao();
            window.location.href = "login.html?expirada=1";
        }
        throw new ErroApi(dados.erro || "Erro inesperado (status " + resposta.status + ").", resposta.status);
    }

    return dados;
}

/* ---------- Carregamento de uma área da página (carregando / erro / conteúdo) ---------- */

// Procura os elementos #prefixo-carregando, #prefixo-erro, #prefixo-erro-texto e #prefixo-conteudo.
// "silencioso" = atualização automática: não pisca "Carregando..." e não apaga o que já está na tela.
async function carregarArea(prefixo, buscar, renderizar, silencioso) {
    const carregando = document.getElementById(prefixo + "-carregando");
    const erro = document.getElementById(prefixo + "-erro");
    const erroTexto = document.getElementById(prefixo + "-erro-texto");
    const conteudo = document.getElementById(prefixo + "-conteudo");

    if (!silencioso) {
        carregando.hidden = false;
        erro.hidden = true;
        conteudo.hidden = true;
    }

    try {
        const dados = await buscar();
        renderizar(dados);
        conteudo.hidden = false;
        erro.hidden = true;
        marcarAtualizacao(true);
    } catch (erroCapturado) {
        console.error(erroCapturado);

        if (silencioso) {
            marcarAtualizacao(false);
        } else {
            erroTexto.textContent = erroCapturado.message;
            erro.hidden = false;
            conteudo.hidden = true;
        }
    } finally {
        carregando.hidden = true;
    }
}

function ligarTentarNovamente(prefixo, recarregar) {
    const botao = document.getElementById(prefixo + "-tentar-novamente");
    if (botao) {
        botao.addEventListener("click", function () { recarregar(false); });
    }
}

/* ---------- Atualização automática dos números ---------- */

function atualizarAutomaticamente(funcao, segundos) {
    setInterval(function () {
        if (!document.hidden) funcao(true);
    }, (segundos || 10) * 1000);

    document.addEventListener("visibilitychange", function () {
        if (!document.hidden) funcao(true);
    });
}

function marcarAtualizacao(sucesso) {
    const indicador = document.getElementById("ultima-atualizacao");
    if (!indicador) return;

    indicador.textContent = sucesso
        ? "Atualizado às " + new Date().toLocaleTimeString("pt-BR")
        : "Falha ao atualizar. Tentando de novo...";
    indicador.classList.toggle("indicador-vivo--erro", !sucesso);
}

/* ---------- Avisos na tela ---------- */

function mostrarAviso(texto, tipo) {
    let area = document.getElementById("area-avisos");
    if (!area) {
        area = document.createElement("div");
        area.id = "area-avisos";
        area.className = "area-avisos";
        area.setAttribute("role", "status");
        area.setAttribute("aria-live", "polite");
        document.body.appendChild(area);
    }

    const aviso = document.createElement("div");
    aviso.className = "aviso aviso--" + (tipo || "sucesso");
    aviso.textContent = texto;
    area.appendChild(aviso);

    setTimeout(function () { aviso.remove(); }, 4000);
}

/* ---------- Modais (usam o atributo hidden) ---------- */

function abrirModal(id) {
    document.getElementById(id).hidden = false;
}

function fecharModal(id) {
    document.getElementById(id).hidden = true;
}

// Fecha o modal ao clicar no X, fora da caixa ou apertando Esc
function configurarModal(id, idBotaoFechar) {
    const modal = document.getElementById(id);
    if (!modal) return;

    const botao = document.getElementById(idBotaoFechar);
    if (botao) botao.addEventListener("click", function () { modal.hidden = true; });

    modal.addEventListener("click", function (evento) {
        if (evento.target === modal) modal.hidden = true;
    });

    document.addEventListener("keydown", function (evento) {
        if (evento.key === "Escape") modal.hidden = true;
    });
}

/* ---------- Formatação e construção de elementos ---------- */

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// "2026-10-27" -> "27/10/2026" (sem converter fuso, para o dia não "pular")
function formatarData(iso) {
    if (!iso) return "—";
    const partes = String(iso).slice(0, 10).split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

function dataDeHoje() {
    const agora = new Date();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");
    return agora.getFullYear() + "-" + mes + "-" + dia;
}

function numeroDoPedido(id) {
    return "#" + String(id).padStart(4, "0");
}

function nomeDoEmail(email) {
    const nome = String(email || "").split("@")[0];
    return nome.charAt(0).toUpperCase() + nome.slice(1);
}

// Cria um elemento com texto seguro (textContent evita injeção de HTML)
function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
}

const CLASSE_DO_STATUS = { "Em análise": "analise", "Aprovado": "aprovado", "Cancelado": "cancelado" };

function criarPillStatus(status) {
    return criarElemento("span", "status-pill status-pill--" + (CLASSE_DO_STATUS[status] || "analise"), status);
}

/* ---------- Configuração comum das telas com menu lateral ---------- */

function configurarPainel(sessao) {
    document.querySelectorAll("[data-saudacao]").forEach(function (elemento) {
        elemento.textContent = "Olá, " + nomeDoEmail(sessao.email) + "!";
    });

    // "Sair" encerra a sessão (o link já leva para o index.html)
    document.querySelectorAll(".sidebar_sair").forEach(function (link) {
        link.addEventListener("click", limparSessao);
    });

    // Itens de menu que ainda não têm página própria
    document.querySelectorAll(".sidebar [data-nav]").forEach(function (link) {
        link.addEventListener("click", function (evento) {
            evento.preventDefault();
            mostrarAviso(link.dataset.nav + ": página em construção.", "info");
        });
    });
}

// Links "Meu painel" (qualquer elemento com data-meu-painel) apontam para o painel certo
document.addEventListener("DOMContentLoaded", function () {
    const sessao = obterSessao();

    document.querySelectorAll("[data-meu-painel]").forEach(function (link) {
        link.setAttribute("href", sessao ? paginaDoPerfil(sessao.perfil) : "login.html");
    });
});
