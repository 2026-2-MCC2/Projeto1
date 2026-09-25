// Botão de contraste (claro/escuro)
function toggle(botao) {
    const html = document.documentElement;
    const temaAtual = html.getAttribute("data-theme");

    if (temaAtual === "dark") {
        html.setAttribute("data-theme", "light");
        botao.value = "Modo Escuro";
    } else {
        html.setAttribute("data-theme", "dark");
        botao.value = "Modo Claro";
    }
}
