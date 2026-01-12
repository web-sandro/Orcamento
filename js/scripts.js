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
    navigator.serviceWorker.register("sw.js");
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

/* ======================
   TABELA DINÂMICA
====================== */
function criarLinha() {
    const tbody = document.getElementById("corpoTabela");
    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td>${contadorItens}</td>

        <!-- CÓDIGO -->
        <td>
            <input type="text"
                   oninput="produtoDigitado(this, 'codigo')">
        </td>

        <!-- QUANTIDADE -->
        <td>
            <input type="text"
                   inputmode="numeric"
                   value=""
                   oninput="somenteNumero(this); linhaEditada(this)">
        </td>

        <!-- DESCRIÇÃO -->
        <td>
            <input type="text"
                   oninput="produtoDigitado(this, 'nome')">
        </td>

        <!-- VALOR UNITÁRIO -->
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
        tr.children[2].querySelector("input").value.replace(",", ".")
    ) || 0;

    const unit = parseFloat(
        tr.children[4].querySelector("input").value.replace(",", ".")
    ) || 0;

    const total = qtd * unit;
    tr.querySelector(".totalLinha").textContent = formatarMoeda(total);

    calcularTotalGeral();
    verificarNovaLinha();
}

function verificarNovaLinha() {
    const linhas = document.querySelectorAll("#corpoTabela tr");
    const ultima = linhas[linhas.length - 1];
    const inputs = ultima.querySelectorAll("input");

    if ([...inputs].some(i => i.value.trim() !== "")) {
        criarLinha();
    }
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
    focarPrimeiroCampo();
};

function verificarNovaLinha() {
    const linhas = document.querySelectorAll("#corpoTabela tr");
    const ultima = linhas[linhas.length - 1];
    const inputs = ultima.querySelectorAll("input");

    if ([...inputs].some(i => i.value.trim() !== "")) {
        criarLinha();
    }
}

/* ===== DATA NA TELA ===== */
function gerarDataTela() {
    document.getElementById("dataCarimboTela").textContent =
        `Orçamento emitido em ${new Date().toLocaleDateString("pt-BR")}`;
}

/* ======================
   LOGO EM ALTA QUALIDADE
====================== */
async function carregarImagemBase64(src) {
    const response = await fetch(src);
    const blob = await response.blob();

    return await new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
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
<<<<<<< HEAD
        const logo = await carregarImagemBase64("img/icon-512.png");
        doc.addImage(logo, "PNG", 15, 10, 25, 25);
=======
        const imgLogo = document.querySelector(".logo");

        if (imgLogo) {
            const canvas = document.createElement("canvas");
            canvas.width = imgLogo.naturalWidth;
            canvas.height = imgLogo.naturalHeight;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(imgLogo, 0, 0);

            const imgData = canvas.toDataURL("image/png");
            doc.addImage(imgData, "PNG", 15, 10, 25, 25);
        }
>>>>>>> 782ffef78dd230bc1ae1f9623de57e5146ff0916

        // === LOGO VIA FETCH (SEM CANVAS) ===
        // const response = await fetch("img/icon-512.png");
        // const blob = await response.blob();

        // const reader = new FileReader();
        // const imgData = await new Promise(resolve => {
        //     reader.onloadend = () => resolve(reader.result);
        //     reader.readAsDataURL(blob);
        // });

        // doc.addImage(imgData, "PNG", 15, 10, 25, 25);


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
        const codigo = tr.children[1].querySelector("input")?.value || "";
        const qtd = tr.children[2].querySelector("input")?.value || "";
        const desc = tr.children[3].querySelector("input")?.value || "";
        const unit = tr.children[4].querySelector("input")?.value || "";
        const total = tr.children[5]?.textContent || "";

        // só adiciona linhas preenchidas
        if (codigo || qtd || desc || unit) {
            linhas.push([
                tr.children[0].textContent, // Item
                codigo,                     // Código
                qtd,                        // Quantidade
                desc,                       // Descrição
                formatarMoeda(unit || 0),   // Unitário
                total                       // Total
            ]);
        }
    });

    // ===== TABELA PDF =====
    doc.autoTable({
        startY: 45,
        head: [[
            "Item",
            "Código",
            "Qtd",
            "Descrição",
            "Unit (R$)",
            "Total (R$)"
        ]],
        body: linhas,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [31, 79, 216] }, // azul profissional
         didDrawPage: function () {
            const h = doc.internal.pageSize.height;
            doc.setFontSize(9);
            doc.text(`Orçamento emitido em ${dataCarimbo}`, 15, h - 20);
        }
    });

    // ===== TOTAL GERAL =====
    doc.setFontSize(11);
    doc.text(
        `Total Geral: ${document.getElementById("totalGeral").textContent}`,
        15,
        doc.lastAutoTable.finalY + 10
    );

    // ===== DOWNLOAD =====
    doc.save(`orcamento-${dataArquivo}.pdf`);
}






/* ======================
   NAVEGAÇÃO ENTER
====================== */
document.addEventListener("keydown", e => {
        if (e.key !== "Enter") return;

        const ativo = document.activeElement;
        if (!ativo || ativo.tagName !== "INPUT") return;

        e.preventDefault();

        const inputs = [...document.querySelectorAll("#corpoTabela input")];
        const index = inputs.indexOf(ativo);

        if (index === inputs.length - 1) criarLinha();
        inputs[index + 1]?.focus();
    });

    /* ======================
       FOCO INICIAL
    ====================== */
    function focarPrimeiroCampo() {
        const primeiro = document.querySelector("#corpoTabela input");
        if (primeiro) {
            primeiro.focus();
            primeiro.select();
        }
    }

    /* ======================
       INIT
    ====================== */
    window.onload = () => {
        criarLinha();
        criarLinha();
        gerarDataTela();
        focarPrimeiroCampo();
    };

    /* ======================
        CADASTRO DE PRODUTOS
    ====================== */
    function abrirCadastroProduto() {
        document.getElementById("cadastroProduto").style.display = "block";
    }

    /* ======================
        FECHAR CADASTRO PRODUTO
    ====================== */
    function fecharCadastroProduto() {
        document.getElementById("cadastroProduto").style.display = "none";
        document.getElementById("msgProduto").textContent = "";
    }

    /* ======================
        SALVAR PRODUTO
    ====================== */
    function salvarProduto() {
        const codigo = document.getElementById("produtoCodigo").value.trim();
        const nome = document.getElementById("produtoNome").value.trim();
        const valor = document.getElementById("produtoValor").value
            .replace(",", ".")
            .trim();

        if (!codigo || !nome || !valor) {
            alert("Preencha código, nome e valor");
            return;
        }

        if (isNaN(valor)) {
            alert("Valor inválido");
            return;
        }

        const produtos = JSON.parse(localStorage.getItem("produtos")) || [];

        // evita código duplicado
        if (produtos.find(p => p.codigo === codigo)) {
            alert("Código já cadastrado");
            return;
        }

        produtos.push({
            codigo,
            nome,
            valor: parseFloat(valor)
        });

        localStorage.setItem("produtos", JSON.stringify(produtos));

        document.getElementById("msgProduto").textContent =
            "Produto salvo com sucesso!";

        document.getElementById("produtoCodigo").value = "";
        document.getElementById("produtoNome").value = "";
        document.getElementById("produtoValor").value = "";
    }

    /* ======================
        AUTOCOMPLETE PRODUTOS
    ====================== */
    function produtoDigitado(input, tipo) {
        const tr = input.closest("tr");

        const codigoInput = tr.children[1].querySelector("input");
        const qtdInput = tr.children[2].querySelector("input");
        const nomeInput = tr.children[3].querySelector("input");
        const valorInput = tr.children[4].querySelector("input");

        const produtos = JSON.parse(localStorage.getItem("produtos")) || [];

        let produto;

        if (tipo === "codigo") {
            produto = produtos.find(p => p.codigo === codigoInput.value.trim());
        }

        if (tipo === "nome") {
            produto = produtos.find(
                p => p.nome.toLowerCase() === nomeInput.value.trim().toLowerCase()
            );
        }

        if (!produto) return;

        // Autocomplete cruzado
        codigoInput.value = produto.codigo;
        nomeInput.value = produto.nome;
        valorInput.value = produto.valor.toFixed(2);

        // Quantidade automática
        if (!qtdInput.value) qtdInput.value = 1;

        linhaEditada(qtdInput);
    }

    /* ======================
        LISTA DE PRODUTOS
    ====================== */
    function abrirCadastroProduto() {
        document.getElementById("cadastroProduto").style.display = "block";
    }

    /* ======================
        FECHAR CADASTRO PRODUTO
    ====================== */
    function fecharCadastroProduto() {
        document.getElementById("cadastroProduto").style.display = "none";
        document.getElementById("msgProduto").textContent = "";
    }

    /* ======================
        SALVAR PRODUTO
    ====================== */
    function salvarProduto() {
        const codigo = document.getElementById("produtoCodigo").value.trim();
        const nome = document.getElementById("produtoNome").value.trim();
        const valor = document.getElementById("produtoValor").value
            .replace(",", ".")
            .trim();

        if (!codigo || !nome || !valor) {
            alert("Preencha código, nome e valor");
            return;
        }

        if (isNaN(valor)) {
            alert("Valor inválido");
            return;
        }

        const produtos = JSON.parse(localStorage.getItem("produtos")) || [];

        // evita código duplicado
        if (produtos.find(p => p.codigo === codigo)) {
            alert("Código já cadastrado");
            return;
        }

        produtos.push({
            codigo,
            nome,
            valor: parseFloat(valor)
        });

        localStorage.setItem("produtos", JSON.stringify(produtos));

        // limpa campos
        document.getElementById("produtoCodigo").value = "";
        document.getElementById("produtoNome").value = "";
        document.getElementById("produtoValor").value = "";

        // FECHA O MODAL
        fecharCadastroProduto();
    }

    /* ======================
        LISTA DE PRODUTOS
    ====================== */
    function abrirListaProdutos() {
        renderizarListaProdutos();
        document.getElementById("modalProdutos").classList.remove("hidden");
    }

    /* ======================
        FECHAR LISTA DE PRODUTOS
    ====================== */
    function fecharListaProdutos() {
        document.getElementById("modalProdutos").classList.add("hidden");
    }

    /* ======================
        RENDERIZAR LISTA DE PRODUTOS
    ====================== */
    function renderizarListaProdutos() {
        const tbody = document.getElementById("listaProdutos");
        tbody.innerHTML = "";

        const produtos = JSON.parse(localStorage.getItem("produtos")) || [];

        if (produtos.length === 0) {
            tbody.innerHTML = `
            <tr>
                <td colspan="4">Nenhum produto cadastrado</td>
            </tr>
        `;
            return;
        }

        produtos.forEach((p, index) => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
            <td>${p.codigo}</td>
            <td>${p.nome}</td>
            <td>R$ ${Number(p.valor).toFixed(2)}</td>
            <td>
                <button onclick="editarProduto(${index})">✏️</button>
                <button onclick="excluirProduto(${index})">🗑️</button>
            </td>
        `;

            tbody.appendChild(tr);
        });
    }

    /* ======================
        EXCLUIR PRODUTO
    ====================== */
    function excluirProduto(index) {
        if (!confirm("Deseja excluir este produto?")) return;

        const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
        produtos.splice(index, 1);
        localStorage.setItem("produtos", JSON.stringify(produtos));
        renderizarListaProdutos();
    }

    /* ======================
        EDITAR PRODUTO
    ====================== */
    function editarProduto(index) {
        const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
        const produto = produtos[index];

        const novoNome = prompt("Nome do produto:", produto.nome);
        if (novoNome === null) return;

        const novoValor = prompt("Valor do produto:", produto.valor);
        if (novoValor === null || isNaN(novoValor)) return;

        produtos[index] = {
            ...produto,
            nome: novoNome,
            valor: Number(novoValor)
        };

        localStorage.setItem("produtos", JSON.stringify(produtos));
        renderizarListaProdutos();
    }
