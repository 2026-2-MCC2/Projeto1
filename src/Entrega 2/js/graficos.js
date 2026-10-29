// Gráfico de barras simples (feito só com CSS + JS, sem biblioteca)

const NOMES_DOS_MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

// "2026-05" -> "mai/26"
function rotuloDoMes(anoMes) {
    const partes = anoMes.split("-");
    return NOMES_DOS_MESES[Number(partes[1]) - 1] + "/" + partes[0].slice(2);
}

// itens = [{ rotulo: "mai/26", valor: 3, texto: "3" (opcional, o que aparece em cima da barra) }]
function desenharBarras(idBarras, idRotulos, itens) {
    const barras = document.getElementById(idBarras);
    const rotulos = idRotulos ? document.getElementById(idRotulos) : null;
    if (!barras) return;

    barras.innerHTML = "";
    if (rotulos) rotulos.innerHTML = "";

    const maior = Math.max(0, ...itens.map(function (item) { return item.valor; }));

    itens.forEach(function (item) {
        const barra = document.createElement("span");
        const porcentagem = maior > 0 ? (item.valor / maior) * 100 : 0;
        const rotuloDoValor = item.texto !== undefined ? item.texto : String(item.valor);

        // barras com valor ficam sempre visíveis, mesmo sendo pequenas
        barra.style.height = (item.valor > 0 ? Math.max(porcentagem, 4) : 0) + "%";
        barra.dataset.valor = rotuloDoValor;
        barra.title = item.rotulo + ": " + rotuloDoValor;
        barras.appendChild(barra);

        if (rotulos) {
            const legenda = document.createElement("span");
            legenda.textContent = item.rotulo;
            rotulos.appendChild(legenda);
        }
    });
}
