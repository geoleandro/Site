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
                                    <h3> ${(aula.titulo)}</h3>
                                    ${concluidaTotal ? '<span class="w3-tag w3-green w3-round">Concluída!</span>' : (concluidaParcial ? '<span class="w3-tag w3-orange w3-round">Em andamento</span>' : '')}
                                    <br><br>
                                    <strong>Conteúdo:</strong> ${aula.conteudo}
                                </div>

                               <div class="w3-container w3-padding-16">
                                    <div class="w3-center">
                                        <a href="${aula.linkTexto}" 
                                           class="w3-button ${leuTexto ? 'w3-green' : 'w3-teal'} w3-round-large w3-margin-bottom" 
                                           style="width: 85%; max-width: 300px; font-weight: bold; padding: 12px;">
                                            ${leuTexto ? '🔍 REVISAR TEXTO' : '📖 LER TEXTO'}
                                        </a>
                                    </div>
                                    
                                    <div class="w3-center">
                                        <a href="${aula.linkQuestoes}" 
                                           class="w3-button ${fezQuestoes ? 'w3-blue' : 'w3-yellow'} w3-round-large" 
                                           style="width: 85%; max-width: 300px; font-weight: bold; padding: 12px;">
                                            ${fezQuestoes ? '🔄 REVISAR QUESTÕES' : '✍️ FAZER QUESTÕES'}
                                        </a>
                                    </div>
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
    // APÓS desenhar tudo no HTML:
    if (typeof atualizarHeaderGlobinhos === "function") {
        atualizarHeaderGlobinhos();
    }
}


// ATUALIZE TAMBÉM A CONTAGEM NO PROGRESSO GLOBAL
// VERSÃO COMPACTA DO PROGRESSO GLOBAL

function mostrarProgressoGlobal(aulas, ano) {
    const painel = document.getElementById('painel-usuario');
    if (!painel) return;

    // 1. Pede os dados ao Core (Cálculo centralizado!)
    const progresso = DuvidDB.getProgressoAcademico(aulas);
    const rpg = DuvidDB.getProgressoRPG();
    const nome = DuvidDB.getNome();

    // 2. Validação de Login
    if (!nome) {
        document.getElementById('loading-painel')?.style.setProperty('display', 'none');
        document.getElementById('form-identificacao')?.style.setProperty('display', 'block');
        return;
    }
// 2. Renderiza o HTML usando as variáveis do Core
    painel.innerHTML = `
        <div class="w3-container w3-card-4 w3-white w3-round-large w3-margin-bottom w3-padding" 
             style="border-left: 6px solid ${rpg.cor}; max-width: 750px; margin: auto;">
            
            ${gerarCabecalhoPainel(nome, rpg)}
            
            <div class="w3-light-grey w3-round-xlarge w3-margin-top" style="height:10px;">
                <div class="w3-container w3-green w3-round-xlarge" 
                     style="width:${progresso.porc}%; height:10px; transition: width 1.5s ease-in-out;">
                </div>
            </div>
            
            <div class="w3-row w3-margin-bottom">
                <div class="w3-col s6 w3-small"><b class="w3-text-green">${progresso.porc}%</b> concluído</div>
                <div class="w3-col s6 w3-right-align w3-small"><b>${progresso.concluidas}/${progresso.total}</b> aulas</div>
            </div>

            <div class="w3-row w3-center w3-border-top w3-padding-top-8">
                ${gerarHtmlTrofeus(rpg.saldoAtual)}
            </div>
        </div>`;
}

// Sub-função para o topo do painel
function gerarCabecalhoPainel(nome, rpg) {
    return `
        <div class="w3-row" style="display: flex; align-items: center;">
            <div class="w3-col s8">
                <h4 class="w3-margin-0" style="font-size: 1.1em;">
                    <span class="w3-tag w3-black w3-round w3-tiny">LEVEL ${rpg.lvl}</span> 
                    Olá, <b class="w3-text-green">${nome.toUpperCase()}</b>
                    <button onclick="prepararTrocaNome()" class="w3-button w3-tiny w3-round-xlarge w3-light-grey">
                        <i class="fa fa-pencil"></i>
                    </button>
                </h4>
                <p class="w3-tiny w3-text-grey w3-margin-0">Patente: <b style="color:${rpg.cor}">${rpg.patente}</b></p>
            </div>
            <div class="w3-col s4 w3-right-align">
                <div class="w3-tag w3-round w3-amber w3-padding-small">
                     <i class="fa fa-globe"></i> <b>${rpg.saldoAtual.toFixed(1)}</b>
                </div>
            </div>
        </div>`;
}
function gerarHtmlTrofeus(saldoTotal) {
    const marcos = [
        { info: DuvidDB.RANKING_SISTEMA[0], icone: 'fa-seedling' }, 
        { info: DuvidDB.RANKING_SISTEMA[1], icone: 'fa-shoe-prints' }, 
        { info: DuvidDB.RANKING_SISTEMA[2], icone: 'fa-map' }, 
        { info: DuvidDB.RANKING_SISTEMA[3], icone: 'fa-chess-knight' }, 
        { info: DuvidDB.RANKING_SISTEMA[4], icone: 'fa-graduation-cap' }, 
        { info: DuvidDB.RANKING_SISTEMA[5], icone: 'fa-gem' } 
    ];

    return marcos.map(marco => {
        const conquistado = saldoTotal >= marco.info.min;
        const corIcone = conquistado ? marco.info.cor : '#e0e0e0';
        
        // Adicionamos a classe 'w3-animate-zoom' apenas se conquistado for true
        const animacao = conquistado ? 'w3-animate-zoom' : '';

        return `
            <div class="w3-col s4 w3-center w3-padding-small">
                <i class="fa ${marco.icone} ${animacao}" 
                   style="font-size:32px; transition: 0.8s; color: ${corIcone}; 
                   text-shadow: ${conquistado ? '0 0 12px ' + corIcone : 'none'}; 
                   opacity: ${conquistado ? '1' : '0.4'}"></i>
                <p class="w3-tiny" style="margin:0; font-weight:bold; color: ${conquistado ? '#333' : '#bbb'}; font-size:8px !important;">
                    ${marco.info.patente}
                </p>
            </div>
        `;
    }).join('');
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
            // Busca o arquivo JSON (Certifique-se que o caminho está correto)
            const resposta = await fetch(`./js/aulas-${ano}ano.json`); 
            if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);

            const aulas = await resposta.json();

            // CONTAGEM AUTOMÁTICA
            const aulasValidas = aulas.filter(a => a !== null && a.id !== undefined);
            const total = aulasValidas.length;

            // Pega as concluídas (Baseado na sua função contarAulasConcluidas)
            const concluidas = contarAulasConcluidas(ano);
            const porc = total > 0 ? Math.round((concluidas / total) * 100) : 0;

            // --- CORREÇÃO DE IDS AQUI ---
            const barra = document.getElementById(`bar-${ano}ano`);
            const texto = document.getElementById(`txt-${ano}ano`);
            const iconeConquista = document.getElementById(`conquista-${ano}ano`);

            if (barra) barra.style.width = porc + "%";
            if (texto) texto.innerText = `${concluidas}/${total}`;

            if (iconeConquista) {
                iconeConquista.style.display = (porc >= 100 && total > 0) ? "block" : "none";
            }

        } catch (erro) {
            console.error(`Falha ao processar progresso do ano ${ano}:`, erro);
        }
    }

    // --- O PULO DO GATO: Sincronização com o RPG ---
    // Após carregar os anos, garantimos que o nível global e XP apareçam no topo
    if (typeof atualizarSistemaNivelHome === "function") {
        atualizarSistemaNivelHome();
    }
}





function contarAulasConcluidas(anoPrefixo) {
    let contagem = 0;
    // Percorre o localStorage uma única vez (Mais rápido que loop de 1 a 50)
    for (let i = 0; i < localStorage.length; i++) {
        let chave = localStorage.key(i);
        
        // Procuramos apenas as chaves de questões concluídas desse ano
        if (chave.startsWith("concluido_questoes_" + anoPrefixo)) {
            let idAula = chave.replace("concluido_questoes_", "");
            
            // Verifica se o texto daquela mesma aula também foi lido
            const textoLido = localStorage.getItem("concluido_texto_" + idAula) === "true";
            
            if (textoLido) {
                contagem++;
               
            }
        }
    }
    return contagem;
    
}