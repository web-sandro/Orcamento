function limparTabela() {
    const tbody = document.getElementById("corpoTabela");

    // Remove todas as linhas
    tbody.innerHTML = "";

    // Reseta contador
    contadorItens = 1;

    // Zera total
    document.getElementById("totalGeral").textContent = "R$ 0.00";

    // Cria novamente as 2 linhas iniciais
    criarLinha();
    criarLinha();

    // Coloca o foco no primeiro campo
    setTimeout(() => {
        const primeiroInput = tbody.querySelector("input");
        if (primeiroInput) primeiroInput.focus();
    }, 0);
}

/* ===== PWA ===== */
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
}

/* ===== MOEDA ===== */
function formatarMoeda(valor) {
    return `R$ ${Number(valor).toFixed(2)}`;
}

/* ===== TABELA DINÂMICA ===== */
let contadorItens = 1;

// Aceita SOMENTE números inteiros
function somenteNumero(input) {
    input.value = input.value.replace(/\D/g, "");
}

// Aceita SOMENTE texto (remove números)
function somenteTexto(input) {
    input.value = input.value.replace(/[0-9]/g, "");
}

// Aceita números decimais (1 ponto apenas)
function somenteDecimal(input) {
    input.value = input.value
        .replace(/[^0-9.]/g, "")   // remove letras
        .replace(/(\..*)\./g, "$1"); // impede dois pontos
}


function criarLinha() {
    const tbody = document.getElementById("corpoTabela");
    const tr = document.createElement("tr");

    tr.innerHTML = `
  <td>${contadorItens}</td>

  <!-- SOMENTE NÚMEROS INTEIROS -->
  <td>
    <input type="text"
           inputmode="numeric"
           oninput="somenteNumero(this); linhaEditada(this)">
  </td>

  <!-- SOMENTE TEXTO -->
  <td>
    <input type="text"
           oninput="somenteTexto(this); linhaEditada(this)">
  </td>

  <!-- SOMENTE NÚMEROS DECIMAIS -->
  <td>
    <input type="text"
           inputmode="decimal"
           placeholder="0.00"
           oninput="somenteDecimal(this); linhaEditada(this)">
  </td>

  <td class="totalLinha">R$ 0.00</td>
`;


    contadorItens++;
    tbody.appendChild(tr);
}

function linhaEditada(input) {
    const tr = input.closest("tr");

    const qtd = parseFloat(
        tr.children[1].querySelector("input").value.replace(",", ".")
    ) || 0;

    const valorUnit = parseFloat(
        tr.children[3].querySelector("input").value.replace(",", ".")
    ) || 0;

    const total = qtd * valorUnit;
    tr.querySelector(".totalLinha").textContent = formatarMoeda(total);

    calcularTotalGeral();
    verificarNovaLinha();
}

function verificarNovaLinha() {
    const linhas = document.querySelectorAll("#corpoTabela tr");
    const ultima = linhas[linhas.length - 1];
    const inputs = ultima.querySelectorAll("input");

    let preenchido = false;
    inputs.forEach(i => {
        if (i.value.trim() !== "") preenchido = true;
    });

    if (preenchido) criarLinha();
}

function calcularTotalGeral() {
    let total = 0;
    document.querySelectorAll(".totalLinha").forEach(td => {
        total += parseFloat(td.textContent.replace("R$", ""));
    });
    document.getElementById("totalGeral").textContent = formatarMoeda(total);
}

window.onload = () => {
    criarLinha();
    criarLinha();
    gerarDataTela();
};

/* ===== DATA NA TELA ===== */
function gerarDataTela() {
    const hoje = new Date().toLocaleDateString("pt-BR");
    document.getElementById("dataCarimboTela").textContent =
        `Orçamento emitido em ${hoje}`;
}

function carregarImagemBase64(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = reject;
        img.src = src;
    });
}


/* ===== PDF ===== */
async function baixarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    const hoje = new Date();
    const dataCarimbo = hoje.toLocaleDateString("pt-BR");
    const dataArquivo = dataCarimbo.split("/").reverse().join("-");

    // === LOGO ===
    try {
        const logoBase64 = await carregarImagemBase64("img/icon-512.png");

        // Logo (x, y, largura, altura)
        doc.addImage(logoBase64, "PNG", 15, 10, 25, 25);
    } catch (e) {
        console.warn("Logo não carregada no PDF", e);
    }

    // === CABEÇALHO ===
    doc.setFontSize(11);
    doc.text("Empresa: litoralnortesoftware.com.br", 45, 15);
    doc.text("Endereço: Rua Maria Fernandes de Moura, 120, Tinga", 45, 21);
    doc.text("CNPJ: XX.ZZZ.XXX/ZZZZ-XX", 45, 27);
    doc.text("Fone: 012 991485333", 45, 33);

    // === TABELA ===
    const linhas = [];
    document.querySelectorAll("#corpoTabela tr").forEach(tr => {
        const qtd = tr.children[1].querySelector("input").value;
        const desc = tr.children[2].querySelector("input").value;
        const unit = tr.children[3].querySelector("input").value;
        const total = tr.children[4].textContent;

        if (qtd || desc || unit) {
            linhas.push([
                tr.children[0].textContent,
                qtd,
                desc,
                formatarMoeda(unit || 0),
                total
            ]);
        }
    });

    doc.autoTable({
        startY: 45,
        head: [["Item", "Quantidade", "Descrição", "Valor Unitário (R$)", "Valor Total (R$)"]],
        body: linhas,
        styles: { fontSize: 9 },
        didDrawPage: function () {
            const h = doc.internal.pageSize.height;
            doc.setFontSize(9);
            doc.text(`Orçamento emitido em ${dataCarimbo}`, 15, h - 20);
        }
    });

    // === TOTAL ===
    const totalGeral = document.getElementById("totalGeral").textContent;
    doc.setFontSize(11);
    doc.text(
        `Total Geral: ${totalGeral}`,
        15,
        doc.lastAutoTable.finalY + 10
    );

    // === DOWNLOAD ===
    doc.save(`orcamento-${dataArquivo}.pdf`);
}


document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;

    const ativo = document.activeElement;

    // Só age se estiver em um input da tabela
    if (!ativo || ativo.tagName !== "INPUT") return;

    e.preventDefault(); // impede submit / quebra de linha

    const inputs = Array.from(
        document.querySelectorAll("#corpoTabela input")
    );

    const indexAtual = inputs.indexOf(ativo);

    if (indexAtual === -1) return;

    // Se estiver no último input, cria nova linha
    if (indexAtual === inputs.length - 1) {
        criarLinha();
    }

    // Move foco para o próximo input
    setTimeout(() => {
        inputs[indexAtual + 1]?.focus();
    }, 0);
});

function focarPrimeiroCampo() {
    const primeiroInput = document.querySelector("#corpoTabela input");
    if (primeiroInput) {
        primeiroInput.focus();
        primeiroInput.select(); // opcional: seleciona o conteúdo
    }
}

window.onload = () => {
    criarLinha();
    criarLinha();
    gerarDataTela();
    focarPrimeiroCampo(); // Foca o primeiro campo ao carregar a página
};