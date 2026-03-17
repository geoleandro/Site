async function carregarAulas(ano) {
    const grid = document.getElementById('grid-aulas');

    try {
        const res = await fetch(`/js/aulas-${ano}ano.json`);
        const aulas = await res.json();

        mostrarProgressoGlobal(aulas, ano);

        if (grid) {
            grid.innerHTML = aulas.map(aula => {
                // --- PADRONIZAÇÃO TOTAL AQUI ---
                const leuTexto = localStorage.getItem("concluido_texto_" + aula.id) === "true";
                const fezQuestoes = localStorage.getItem("concluido_questoes_" + aula.id) === "true";

                const concluidaTotal = leuTexto && fezQuestoes;
                const concluidaParcial = leuTexto || fezQuestoes;

                // Define a cor da borda e filtros
                let estiloCard = 'filter: grayscale(1); opacity: 0.7;';
                let iconeStatus = '';
                let corTexto = 'color: #777;';

                if (concluidaTotal) {
                    estiloCard = 'border: 4px solid #4CAF50 !important; filter: grayscale(0); opacity: 1;';
                    iconeStatus = '<i class="fa fa-check-circle w3-text-green w3-xlarge" style="position: absolute; top: 10px; right: 10px; background: white; border-radius: 50%; padding: 2px;"></i>';
                    corTexto = 'color: #2e7d32;';
                } else if (concluidaParcial) {
                    estiloCard = 'border: 4px solid #ff9800 !important; filter: grayscale(0); opacity: 0.9;';
                    iconeStatus = '<i class="fa fa-clock-o w3-text-orange w3-xlarge" style="position: absolute; top: 10px; right: 10px; background: white; border-radius: 50%; padding: 2px;"></i>';
                    corTexto = 'color: #e65100;';
                }

                return `
                <div class="column" style="margin-bottom: 25px;">
                    <div class="wrapper" style="position: relative;">
                        <img class="w3-round-large w3-card w3-hover-opacity" 
                             src="${aula.imagem}" 
                             alt="${aula.titulo}" 
                             onclick="ExpandeDiv('div${aula.id}')"
                             style="width:100%; cursor:pointer; transition: 0.5s; ${estiloCard}">
                        
                        ${iconeStatus}
                    </div>
                    
                    <p style="font-weight: bold; ${corTexto}">
                        ${concluidaTotal ? '✔ ' : (concluidaParcial ? '⏳ ' : '')} ${String(aula.id).slice(-2)}: ${aula.titulo}
                    </p>

                    <div id="div${aula.id}" class="w3-modal" style="display:none">
                        <div class="w3-modal-content w3-card-4 w3-animate-zoom" style="max-width:500px">
                            <div class="w3-center w3-padding-48">
                                <span onclick="document.getElementById('div${aula.id}').style.display='none'"
                                      class="w3-button w3-xlarge w3-hover-red w3-display-topright">&times;</span>
                                
                                <div class="w3-margin">
                                    <h3>Aula ${String(aula.id).slice(-2)}</h3>
                                    ${concluidaTotal ? '<span class="w3-tag w3-green w3-round">Concluída!</span>' : (concluidaParcial ? '<span class="w3-tag w3-orange w3-round">Em andamento</span>' : '')}
                                    <br><br>
                                    <strong>Conteúdo:</strong> ${aula.conteudo}
                                </div>

                                <div class="w3-row w3-padding">
                                    <a href="${aula.linkTexto}" class="w3-button ${leuTexto ? 'w3-green' : 'w3-teal'} w3-margin" style="width:50%">
                                        ${leuTexto ? 'Revisar Texto' : 'Ler Texto'}
                                    </a>
                                    
                                    <a href="${aula.linkQuestoes}" class="w3-button ${fezQuestoes ? 'w3-blue' : 'w3-yellow'} w3-margin" style="width:50%">
                                        ${fezQuestoes ? 'Revisar Questões' : 'Fazer Questões'}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            }).join('');
        }
    } catch (e) {
        console.error("Erro ao carregar as aulas:", e);
        grid.innerHTML = "<p class='w3-center'>Erro ao carregar as aulas.</p>";
    }
}


// ATUALIZE TAMBÉM A CONTAGEM NO PROGRESSO GLOBAL
// VERSÃO COMPACTA DO PROGRESSO GLOBAL
function mostrarProgressoGlobal(aulas, ano) {
    const painel = document.getElementById('painel-usuario');
    if (!painel) return;

    let nome = "Estudante";
    let globinhosTotal = 0;

    try {
        if (typeof DuvidDB !== 'undefined') {
            nome = DuvidDB.getNome() || "Estudante";
            globinhosTotal = DuvidDB.getGlobinhos();
        } else {
            nome = localStorage.getItem("duvid_nome") || "Estudante";
            globinhosTotal = parseFloat(localStorage.getItem("duvid_globinhos")) || 0;
        }
    } catch (e) {
        nome = localStorage.getItem("duvid_nome") || "Estudante";
        globinhosTotal = parseFloat(localStorage.getItem("duvid_globinhos")) || 0;
    }

    const totalAulasAno = aulas.length;
    const concluidasNoAno = aulas.filter(aula => {
        const texto = localStorage.getItem("concluido_texto_" + aula.id) === "true";
        const questoes = localStorage.getItem("concluido_questoes_" + aula.id) === "true";
        return texto && questoes;
    }).length;

    const porcentagem = totalAulasAno > 0 ? Math.round((concluidasNoAno / totalAulasAno) * 100) : 0;
    const saldoFormatado = globinhosTotal.toFixed(1);

    painel.innerHTML = `
        <div class="w3-container w3-card-4 w3-white w3-round-large w3-margin-bottom w3-padding" 
             style="border-left: 6px solid #4CAF50; max-width: 750px; margin: auto;">
            
            <div class="w3-row w3-flex" style="display: flex; align-items: center;">
                <div class="w3-col s8">
                    <h4 class="w3-margin-0" style="font-size: 1.1em;">Olá, <b class="w3-text-green">${nome.toUpperCase()}</b></h4>
                    <p class="w3-tiny w3-text-grey w3-margin-0">Progresso no <b>${ano}º Ano</b></p>
                </div>
                <div class="w3-col s4 w3-right-align">
                    <div class="w3-tag w3-round w3-amber w3-padding-small">
                         <i class="fa fa-globe"></i> <b id="display-globinhos-home">${saldoFormatado}</b>
                    </div>
                </div>
            </div>

            <div class="w3-light-grey w3-round-xlarge w3-margin-top" style="height:10px;">
                <div class="w3-container w3-green w3-round-xlarge" 
                     style="width:${porcentagem}%; height:10px; transition: width 1s;">
                </div>
            </div>
            
            <div class="w3-row w3-margin-bottom">
                <div class="w3-col s6 w3-tiny">
                    <b class="w3-text-green">${porcentagem}%</b> concluído
                </div>
                <div class="w3-col s6 w3-right-align w3-tiny">
                    <b>${concluidasNoAno}/${totalAulasAno}</b> aulas
                </div>
            </div>

          
<div class="w3-row w3-center w3-border-top w3-padding-small">
    <div class="w3-col s4">
        <i class="fa fa-trophy ${globinhosTotal >= MARCOS_CONQUISTAS[0] ? 'w3-text-amber' : 'w3-text-light-grey'}" style="font-size:18px;"></i>
        <p style="font-size:8px; margin:0">${MARCOS_CONQUISTAS[0]} pts</p>
    </div>
    
    <div class="w3-col s4">
        <i class="fa fa-star ${globinhosTotal >= MARCOS_CONQUISTAS[1] ? 'w3-text-blue' : 'w3-text-light-grey'}" style="font-size:18px;"></i>
        <p style="font-size:8px; margin:0">${MARCOS_CONQUISTAS[1] / 1000}k pts</p>
    </div>
    
    <div class="w3-col s4">
        <i class="fa fa-diamond ${globinhosTotal >= MARCOS_CONQUISTAS[2] ? 'w3-text-purple' : 'w3-text-light-grey'}" style="font-size:18px;"></i>
        <p style="font-size:8px; margin:0">Mestre</p>
    </div>
</div>
        </div>`;
}

function ExpandeDiv(id_cadastro) {
    var div_sel = document.getElementById(id_cadastro);
    if (div_sel.style.display === 'block') {
        div_sel.style.display = 'none';
    } else {
        // Fecha outros modais abertos antes de abrir o novo
        var modais = document.getElementsByClassName('w3-modal');
        for (var i = 0; i < modais.length; i++) {
            modais[i].style.display = 'none';
        }
        div_sel.style.display = 'block';
    }
}

function onClick(element) {
    document.getElementById("img01").src = element.src;
    document.getElementById("modal01").style.display = "block";
    document.getElementById("caption").innerHTML = element.alt;
}

// Fecha o modal se o usuário clicar fora da caixa branca (no fundo escuro)
window.onclick = function (event) {
    // Verifica se o que foi clicado tem a classe 'w3-modal'
    if (event.target.className.indexOf('w3-modal') !== -1) {
        event.target.style.display = "none";
    }
}




async function atualizarResumoHome() {
    const painelResumo = document.getElementById('resumo-geral');
    if (!painelResumo) return;

    painelResumo.style.display = "block";

    const anos = ["1", "2", "3"];

    for (const ano of anos) {
        try {
            // Busca o arquivo JSON de cada ano (ex: aulas-1ano.json)
            const resposta = await fetch(`/js/aulas-${ano}ano.json`);
            if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);

            const aulas = await resposta.json();

            // CONTAGEM AUTOMÁTICA: Filtra apenas itens válidos (não nulos)
            const aulasValidas = aulas.filter(a => a !== null && a.id !== undefined);
            const total = aulasValidas.length;

            // Pega as concluídas do LocalStorage (Texto + Questão)
            const concluidas = contarAulasConcluidas(ano);

            const porc = total > 0 ? Math.round((concluidas / total) * 100) : 0;

            // Atualiza os elementos na tela
            const barra = document.getElementById(`bar-${ano}ano`);
            const texto = document.getElementById(`txt-${ano}ano`);
            const iconeConquista = document.getElementById(`conquista-${ano}ano`);

            if (barra) barra.style.width = porc + "%";
            if (texto) texto.innerText = `${concluidas}/${total}`;

            if (iconeConquista) {
                iconeConquista.style.display = (porc >= 100 && total > 0) ? "block" : "none";
            }

        } catch (erro) {
            console.error(`Falha ao processar progresso automático do ano ${ano}:`, erro);
        }
    }
}

function contarAulasConcluidas(anoPrefixo) {
    let contagem = 0;
    for (let i = 1; i <= 50; i++) {
        let idAula = anoPrefixo + (i < 10 ? "0" + i : i);
        // ATUALIZADO PARA O NOVO PADRÃO
        const texto = localStorage.getItem("concluido_texto_" + idAula) === "true";
        const questoes = localStorage.getItem("concluido_questoes_" + idAula) === "true";

        if (texto && questoes) {
            contagem++;
        }
    }
    return contagem;
}