async function carregarAulas(ano) {
    const grid = document.getElementById('grid-aulas');
    if (!grid) return;

    try {
       const aulas = await DuvidCache.get(`/js/aulas-${ano}ano.json`); // << NOVO
         
       // 1. Atualiza o Painel de RPG no topo
        mostrarProgressoGlobal(aulas, ano);

        // 2. Desenha o Grid
        grid.innerHTML = aulas.map(aula => {
            const status = obterStatusAula(aula.id);
            const numAula = String(aula.id).slice(-2);

            return `
            <div class="column" style="margin-bottom: 25px;">
                <div class="wrapper" style="position: relative;">
                    <img class="w3-round-large w3-card w3-hover-opacity" 
                         src="${aula.imagem}" 
                         alt="${aula.titulo}" 
                         onclick="document.getElementById('div${aula.id}').style.display='block'"
                         style="width:100%; cursor:pointer; transition: 0.5s; ${status.estilo}">
                    ${status.icone}
                </div>
                
                <p style="font-weight: bold; ${status.corTexto}">
                    ${status.prefixo} ${numAula}: ${aula.titulo}
                </p>

                ${gerarHtmlModal(aula, status)}
            </div>`;
        }).join('');

    } catch (e) {
        console.error("Erro ao carregar as aulas:", e);
        grid.innerHTML = "<p class='w3-center'>Erro ao carregar o mapa de aulas.</p>";
    }

    if (typeof atualizarHeaderGlobinhos === "function") atualizarHeaderGlobinhos();
}

// 1. Lógica de Estilo e Status
function obterStatusAula(aulaId) {

    const leuTexto = DuvidDB.estaConcluido(aulaId, TIPO_CONCLUSAO.TEXTO);
    const fezQuestoes = DuvidDB.estaConcluido(aulaId, TIPO_CONCLUSAO.QUESTOES);

    const total = leuTexto && fezQuestoes;
    const parcial = leuTexto || fezQuestoes;

    if (total) {
        return {
            estilo: 'border: 4px solid #4CAF50 !important; filter: grayscale(0); opacity: 1;',
            icone: '<i class="fa fa-check-circle w3-text-green w3-xlarge status-icon"></i>',
            corTexto: 'color: #2e7d32;',
            prefixo: '✔',
            tag: '<span class="w3-tag w3-green w3-round">Concluída!</span>',
            btnTexto: '🔍 REVISAR TEXTO', btnQuest: '🔄 REVISAR QUESTÕES',
            concluido: { texto: true, quest: true }
        };
    } else if (parcial) {
        return {
            estilo: 'border: 4px solid #ff9800 !important; filter: grayscale(0); opacity: 0.9;',
            icone: '<i class="fa fa-clock-o w3-text-orange w3-xlarge status-icon"></i>',
            corTexto: 'color: #e65100;',
            prefixo: '⏳',
            tag: '<span class="w3-tag w3-orange w3-round">Em andamento</span>',
            btnTexto: leuTexto ? '🔍 REVISAR TEXTO' : '📖 LER TEXTO',
            btnQuest: fezQuestoes ? '🔄 REVISAR QUESTÕES' : '✍️ FAZER QUESTÕES',
            concluido: { texto: leuTexto, quest: fezQuestoes }
        };
    }
    return {
        estilo: 'filter: grayscale(1); opacity: 0.7;',
        icone: '',
        corTexto: 'color: #777;',
        prefixo: '',
        tag: '',
        btnTexto: '📖 LER TEXTO', btnQuest: '✍️ FAZER QUESTÕES',
        concluido: { texto: false, quest: false }
    };
}

// 2. Gerador do Modal (O conteúdo que abre)
function gerarHtmlModal(aula, status) {
    return `
    <div id="div${aula.id}" class="w3-modal" style="display:none">
        <div class="w3-modal-content w3-card-4 w3-animate-zoom w3-round-large" style="max-width:500px">
            <div class="w3-center w3-padding-48">
                <span onclick="document.getElementById('div${aula.id}').style.display='none'"
                      class="w3-button w3-xlarge w3-display-topright w3-round-large">&times;</span>
                <div class="w3-margin">
                    <h3>${aula.titulo}</h3>
                    ${status.tag}<br><br>
                    <strong>Conteúdo:</strong> ${aula.conteudo}
                </div>
                <div class="w3-container w3-padding-16">
                    <a href="${aula.linkTexto}" class="w3-button ${status.concluido.texto ? 'w3-green' : 'w3-teal'} btn-aula">
                        ${status.btnTexto}
                    </a>
                    <a href="${aula.linkQuestoes}" class="w3-button ${status.concluido.quest ? 'w3-blue' : 'w3-yellow'} btn-aula">
                        ${status.btnQuest}
                    </a>
                </div>
            </div>
        </div>
    </div>`;
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
            <div class="w3-col s8 ">
                <h4 class="w3-margin-0 " style="font-size: 1.1em; ">
                    <span class="w3-tag w3-round w3-small w3-green"><strong>LEVEL</strong> ${rpg.lvl}</span> 
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
        { info: DuvidDB.RANKING_SISTEMA[0], img: 'duvid-patentes-novato.png' },
        { info: DuvidDB.RANKING_SISTEMA[1], img: 'duvid-patentes-explorador.png' },
        { info: DuvidDB.RANKING_SISTEMA[2], img: 'duvid-patentes-cartografo.png' },
        { info: DuvidDB.RANKING_SISTEMA[3], img: 'duvid-patentes-estrategista.png' },
        { info: DuvidDB.RANKING_SISTEMA[4], img: 'duvid-patentes-geografo.png' },
        { info: DuvidDB.RANKING_SISTEMA[5], img: 'duvid-patentes-lenda.png' } // A imagem que você enviou
    ];

    return marcos.map(marco => {
        const conquistado = saldoTotal >= marco.info.min;

        // Classe de animação e classe de "bloqueado"
        const animacao = conquistado ? 'w3-animate-zoom icon-conquistado' : 'icon-bloqueado';

        return `
            <div class="w3-col s4 w3-center" style="margin-bottom: 8px;">
        <img src="fotoIndex/icones/${marco.img}" 
             alt="${marco.info.patente}"
             class="img-trofeu-pixel ${animacao}">
        
        <span style="display: block; margin-top: -2px; 
               color: ${conquistado ? '#333' : '#bbb'}; 
               font-size: 12px !important; 
               font-weight: bold;
               text-transform: uppercase;
               line-height: 1;">
            ${marco.info.patente}
        </span>
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
            const aulas = await DuvidCache.get(`/js/aulas-${ano}ano.json`); // << NOVO

            const aulasValidas = aulas.filter(a => a && a.id !== undefined);
            const total = aulasValidas.length;
            const concluidas = contarAulasConcluidas(ano);
            const porc = total > 0 ? Math.round((concluidas / total) * 100) : 0;

            const barra = document.getElementById(`bar-${ano}ano`);
            const texto = document.getElementById(`txt-${ano}ano`);
            const icone = document.getElementById(`conquista-${ano}ano`);

            if (barra) barra.style.width = porc + "%";
            if (texto) texto.innerText = `${concluidas}/${total}`;
            if (icone) icone.style.display = (porc >= 100 && total > 0) ? "block" : "none";

        } catch (erro) {
            console.error(`Falha ao processar ${ano}º ano:`, erro);
        }
    }

    if (typeof atualizarSistemaNivelHome === "function") atualizarSistemaNivelHome();
}



//conta os troféus para o seu sistema de RPG
function contarAulasConcluidas(anoPrefixo) {
    let contagem = 0;

    // 1. Criamos o prefixo de busca usando a nossa constante Global
    // Isso vai gerar algo como "concluido_questoes_"
    const prefixoBusca = `concluido_${TIPO_CONCLUSAO.QUESTOES}_`;

    for (let i = 0; i < localStorage.length; i++) {
        let chave = localStorage.key(i);

        // 2. Procuramos as chaves que começam com o prefixo + o ano (ex: 1 para 1º ano)
        if (chave.startsWith(prefixoBusca + anoPrefixo)) {

            // Extraímos o ID da aula da chave (ex: de "concluido_questoes_101" sobra "101")
            let idAula = chave.replace(prefixoBusca, "");

            // 3. Usamos o nosso "Gerente" DuvidDB para checar se o texto também foi lido
            // Passamos a constante TIPO_CONCLUSAO.TEXTO para garantir a simetria
            const textoLido = DuvidDB.estaConcluido(idAula, TIPO_CONCLUSAO.TEXTO);

            if (textoLido) {
                contagem++;
            }
        }
    }

    return contagem;
}