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

        /* ===== MOEDA ===== */
        function formatarMoeda(valor) {
            return `R$ ${Number(valor).toFixed(2)}`;
        }

        /* ===== TABELA DINÂMICA ===== */
        let contadorItens = 1;

        function criarLinha() {
            const tbody = document.getElementById("corpoTabela");
            const tr = document.createElement("tr");

            tr.innerHTML = `
        <td>${contadorItens}</td>
        <td><input type="number" min="0" oninput="linhaEditada(this)"></td>
        <td><input type="text" oninput="linhaEditada(this)"></td>
        <td>
          <input type="number" min="0" step="0.01" placeholder="0.00"
                 oninput="linhaEditada(this)">
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

        /* ===== PDF ===== */
        function baixarPDF() {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF("p", "mm", "a4");

            const hoje = new Date();
            const dataCarimbo = hoje.toLocaleDateString("pt-BR");
            const dataArquivo = dataCarimbo.split("/").reverse().join("-");

            // Cabeçalho
            doc.setFontSize(11);
            doc.text("Empresa: Consórcio Sanear Litoral Norte", 15, 15);
            doc.text("Endereço: Av Pedro Reginaldo da Costa 455 – Balneários dos Golfinhos", 15, 21);
            doc.text("CNPJ: 40.138.733/0001-01", 15, 27);
            doc.text("A/C Camila Leone – Administradora", 15, 33);

            // Dados da tabela
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
                startY: 40,
                head: [["Item", "Quantidade", "Descrição", "Valor Unitário (R$)", "Valor Total (R$)"]],
                body: linhas,
                styles: { fontSize: 9 },
                didDrawPage: function () {
                    const h = doc.internal.pageSize.height;
                    doc.setFontSize(9);
                    doc.text(`Orçamento emitido em ${dataCarimbo}`, 15, h - 20);
                }
            });

            const totalGeral = document.getElementById("totalGeral").textContent;
            doc.setFontSize(11);
            doc.text(`Total Geral: ${totalGeral}`, 15, doc.lastAutoTable.finalY + 8);

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