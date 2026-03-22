// Força o scroll para o topo toda vez que a página recarregar
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
};

// Reforço ao carregar o DOM
document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);

    // Pequeno atraso para garantir que o navegador não "puxe" para baixo
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, 10);
});



window.ganhosAtuais = window.ganhosAtuais || 0;
// Se não existir, ele cria. Se existir, ele mantém o que já tem.

const SONS_ACERTO = ['/audios/acerto1.mp3', '/audios/acerto2.mp3'];
const SONS_ERRO = ['/audios/erro1.mp3', '/audios/erro2.mp3'];

// Sons de encerramento (Média Boa vs Média Ruim)
const SOM_FINAL_BOM = new Audio('/audios/notaFinal.mp3');
const SOM_FINAL_RUIM = new Audio('/audios/notaFinal2.mp3');

const SOM_INCIO_NOME = new Audio('/audios/inicioNome.mp3');

// Valores oficiais para o site pronto
const MARCOS_CONQUISTAS = [500, 2000, 10000];

function playSomFinal(vitoria) {
    if (vitoria) {
        SOM_FINAL_BOM.play().catch(e => console.log("Erro som final: ", e));
    } else {
        SOM_FINAL_RUIM.play().catch(e => console.log("Erro som final: ", e));
    }
}

function playSom(tipo) {
    let caminho = tipo;

    // 2. Lógica de sorteio para o Erro
    if (tipo === 'erro') {
        // Escolhe um rândomico da lista SONS_ERRO
        caminho = SONS_ERRO[Math.floor(Math.random() * SONS_ERRO.length)];
    }
    // 3. Lógica de sorteio para o Acerto (Opcional)
    else if (tipo === 'acerto') {
        caminho = SONS_ACERTO[Math.floor(Math.random() * SONS_ACERTO.length)];
    }

    // 4. Toca o som escolhido
    const audio = new Audio(caminho);
    audio.volume = 0.4; // Volume um pouco mais baixo para erros
    audio.play().catch(e => console.log("Áudio aguardando clique."));
}


function playSomUnico(arquivo) {
    // Se o arquivo for apenas um nome (ex: 'acerto'), você pode mapear
    // Se for um caminho completo (ex: '/audios/inicio.mp3'), ela toca direto
    const audio = new Audio(arquivo);
    audio.volume = 0.5; // Volume padrão para não assustar o aluno
    audio.play().catch(e => console.warn("Áudio bloqueado pelo navegador até o primeiro clique."));
}


// 2. FRASES DINÂMICAS (Para o banner de acerto)
function getFraseSucesso() {
    const frases = [
        "Exato! Você acertou.", "Muito bem! Resposta correta.",
        "Incrível! Você está mandando ver.", "Na mosca! Parabéns.",
        "Isso mesmo! Continue assim.", "Excelente! Seu raciocínio foi perfeito.",
        "Corretíssimo! Você domina o assunto.", "Boa! Você acertou em cheio.",
        "Sensacional! Mais um acerto para a conta.", "Brilhante! Resposta nota 10."
    ];
    return frases[Math.floor(Math.random() * frases.length)];
}

function getFrasePainel() {
    const frases = [
        "Missão cumprida! Você detonou neste desafio.",
        "Aula finalizada com sucesso! Globinhos merecidos.",
        "Espetacular! Você provou que domina este tema.",
        "Isso ai! Mais uma etapa concluída.",
        "Sensacional! Você superou todos os obstáculos desta aula.",
        "Vitória garantida! Seu progresso global foi atualizado.",
        "Uau! Você fechou este ciclo com chave de ouro.",
        "Jornada concluída! Seus globinhos estão rendendo frutos."
    ];
    return frases[Math.floor(Math.random() * frases.length)];
}

// 3. CENTRAL DE COMEMORAÇÕES (Os 10 Efeitos de Confete)
function dispararComemoracao() {
    const estilo = Math.floor(Math.random() * 10) + 1;
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min, max) { return Math.random() * (max - min) + min; }

    switch (estilo) {
        case 1: confetti({ ...defaults, particleCount: 150, origin: { y: 0.6 } }); break;
        case 2:
            confetti({ particleCount: 100, angle: 60, spread: 55, origin: { x: 0, y: 0.8 } });
            confetti({ particleCount: 100, angle: 120, spread: 55, origin: { x: 1, y: 0.8 } });
            break;
        case 3:
            var interval = setInterval(function () {
                var timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);
                var particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);
            break;
        case 4: confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#FFD700', '#FFA500', '#FFFACD'] }); break;
        case 5: confetti({ particleCount: 200, spread: 160, colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'] }); break;
        case 6: confetti({ particleCount: 80, spread: 120, startVelocity: 45, gravity: 0.5 }); break;
        case 7: confetti({ particleCount: 100, spread: 100, origin: { y: 0 }, gravity: 0.3, startVelocity: 0 }); break;
        case 8: confetti({ particleCount: 150, angle: 90, spread: 30, startVelocity: 60, origin: { y: 1 } }); break;
        case 9:
            confetti({ particleCount: 100, origin: { x: 0.3, y: 0.7 } });
            setTimeout(() => { confetti({ particleCount: 100, origin: { x: 0.7, y: 0.7 } }); }, 300);
            break;
        case 10:
            var end = Date.now() + 5000;
            (function frame() {
                confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 } });
                confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 } });
                if (Date.now() < end) requestAnimationFrame(frame);
            }());
            break;
    }
}

// 4. CENTRAL DE ECONOMIA (LocalStorage)
const DB_CHAVE = "duvid_globinhos";

const DuvidDB = {
    getGlobinhos: function () {
        return parseInt(localStorage.getItem(DB_CHAVE)) || 0;
    },

    addGlobinhos: function (quantidade) {
        // 1. Pega os dados ANTES da soma
        let saldoAnterior = Number(localStorage.getItem("duvid_globinhos")) || 0;
        let lvlAnterior = this.getProgressoRPG().lvl; // Pega o nível atual antes de somar

        // 2. Realiza a soma no Global
        let novoSaldo = saldoAnterior + Number(quantidade);
        localStorage.setItem("duvid_globinhos", novoSaldo);

        // 3. Pega os dados DEPOIS da soma
        const progressoAtual = this.getProgressoRPG();
        let novoLvl = progressoAtual.lvl;

        // --- LÓGICA DE LEVEL UP (O NOVO "TROFÉU") ---
        if (novoLvl > lvlAnterior) {

            // 1. Toca o som de vitória
            if (typeof playSomFinal === "function") playSomFinal(true);

            // 2. Dispara confetes se a função existir
            if (typeof dispararComemoracao === "function") dispararComemoracao();

            // 3. Notificação Épica de Level Up
            const notificacao = document.createElement('div');
            notificacao.innerHTML = `
            <div class="w3-animate-zoom w3-card-4 w3-round-large w3-padding" 
                 style="position:fixed; top:20px; left:50%; transform:translateX(-50%); z-index:10000; text-align:center; background-color:${progressoAtual.cor}; color:white;">
                <i class="fa fa-arrow-up w3-xlarge"></i><br>
                <b class="w3-large">SUBIU DE NÍVEL!</b><br>
                <span>Agora você é um <b>${progressoAtual.patente}</b></span><br>
                <span class="w3-tag w3-white w3-text-black w3-round w3-margin-top">LVL ${novoLvl}</span>
            </div>
        `;
            document.body.appendChild(notificacao);

            setTimeout(() => {
                notificacao.classList.add('w3-animate-opacity');
                setTimeout(() => notificacao.remove(), 500);
            }, 5000);
        }

        // Mantém o restante da sua lógica (atualizar header, ganhos atuais, etc)
        window.ganhosAtuais += Number(quantidade);
        atualizarHeaderGlobinhos();
        if (typeof feedbackVisualAcerto === "function") feedbackVisualAcerto();
    },


    salvarConclusao: function (idAula, tipo) {
        localStorage.setItem(`concluido_${tipo}_${idAula}`, "true");
    },


    getNome: function () {
        return localStorage.getItem("duvid_nome") || "";
    },

    salvarNome: function (nome) {
        if (nome.trim() !== "") {
            localStorage.setItem("duvid_nome", nome.trim());
            return true;
        }
        return false;
    },
    // NOVA FUNÇÃO CENTRALIZADA
    getProgressoAcademico: function(aulas) {
        if (!aulas || !Array.isArray(aulas)) return { concluidas: 0, total: 0, porc: 0 };

        const aulasValidas = aulas.filter(a => a !== null && a.id !== undefined);
        const total = aulasValidas.length;

        const concluidas = aulasValidas.filter(aula => {
            const texto = localStorage.getItem("concluido_texto_" + aula.id) === "true";
            const questoes = localStorage.getItem("concluido_questoes_" + aula.id) === "true";
            return texto && questoes;
        }).length;

        return {
            concluidas: concluidas,
            total: total,
            porc: total > 0 ? Math.round((concluidas / total) * 100) : 0
        };
    },

    // Configuração de Níveis do RPG
    RANKING_SISTEMA: [
        { lvl: 1, patente: "NOVATO", min: 0, max: 100, cor: "#9d9d9d" },
        { lvl: 2, patente: "EXPLORADOR", min: 1001, max: 3500, cor: "#4caf50" },
        { lvl: 3, patente: "CARTÓGRAFO", min: 3501, max: 8000, cor: "#2196f3" },
        { lvl: 4, patente: "ESTRATEGISTA", min: 8001, max: 15000, cor: "#9c27b0" },
        { lvl: 5, patente: "GEÓGRAFO SÊNIOR", min: 15001, max: 20000, cor: "#ff9800" },
        { lvl: 6, patente: "LENDA DA TERRA", min: 20001, max: 99999, cor: "#f44336" }
    ],

    getProgressoRPG: function () {
        let saldo = this.getGlobinhos();
        // Encontra em qual faixa de nível o saldo atual se encaixa
        let info = this.RANKING_SISTEMA.find(r => saldo <= r.max) || this.RANKING_SISTEMA[this.RANKING_SISTEMA.length - 1];

        // Cálculo de XP para a barra (fórmula de progresso dentro do nível)
        let xpNoNivel = saldo - info.min;
        let totalNecessarioNivel = info.max - info.min;
        let porcentagem = (xpNoNivel / totalNecessarioNivel) * 100;

        return {
            lvl: info.lvl,
            patente: info.patente,
            cor: info.cor,
            proximoLvl: info.max,
            progressoBarra: Math.min(porcentagem, 100),
            saldoAtual: saldo
        };
    },

    verificarConquistas: function () {
        const progresso = this.getProgressoRPG();

        // Salva os dados processados para acesso rápido por outras páginas
        localStorage.setItem("patente", progresso.patente);
        localStorage.setItem("user_lvl", progresso.lvl);

        // Retorna os dados caso a função que chamou precise usar na hora
        return progresso;
    },


    resetarSistema: function () {
        if (confirm("Deseja zerar seu progresso e globinhos? Esta ação não pode ser desfeita.")) {
            // 1. Zera os globinhos
            localStorage.setItem("duvid_globinhos", 0);

            // 2. Remove todas as conclusões de texto e questões
            // Filtramos as chaves que começam com 'concluido_' para não apagar o nome do aluno
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('concluido_')) {
                    localStorage.removeItem(key);
                }
            });

            console.log("Progresso resetado com sucesso!");
            location.reload(); // Recarrega para a Home voltar a ficar cinza
        }
    },// Caso queira resetar APENAS os globinhos (para testes rápidos)

};

function atualizarSistemaNivelHome() {
    // Pede os dados processados ao Core
    const rpg = DuvidDB.getProgressoRPG();

    // Atualiza a Interface da Home
    // 3. Atualiza o contador central da Home
    const displayTotal = document.getElementById('valor-total-central');
    if (displayTotal) {
        // Usamos a animação para mostrar que todos os pontos foram somados
        animarContador('valor-total-central', rpg.saldoAtual);
    }

    document.getElementById('lvl-tag').innerText = `LEVEL ${rpg.lvl}`;
    document.getElementById('lvl-tag').style.backgroundColor = "black"; // Ou use rpg.cor

    document.getElementById('rank-nome').innerText = rpg.patente;
    document.getElementById('rank-nome').style.color = rpg.cor; // Cor dinâmica da patente!

    document.getElementById('xp-atual').innerText = Math.floor(rpg.saldoAtual);
    document.getElementById('xp-proximo').innerText = rpg.proximoLvl;

    // Anima a barra azul com a porcentagem calculada pelo Core
    const barra = document.getElementById('barra-xp-total');
    if (barra) {
        barra.style.width = rpg.progressoBarra + "%";
        barra.style.backgroundColor = "#2196f3"; // Cor de XP
    }
}

function animarContador(idElemento, valorFinal) {
    const el = document.getElementById(idElemento);
    if (!el) return;

    let valorAtual = parseFloat(el.innerText) || 0;
    let incremento = (valorFinal - valorAtual) / 20; // Divide a subida em 20 passos

    let timer = setInterval(() => {
        valorAtual += incremento;
        if ((incremento > 0 && valorAtual >= valorFinal) || (incremento < 0 && valorAtual <= valorFinal)) {
            el.innerText = valorFinal.toFixed(1);
            clearInterval(timer);
        } else {
            el.innerText = valorAtual.toFixed(1);
        }
    }, 30);
}

// Chame assim dentro da sua atualizarSistemaNivelHome:
// animarContador('valor-total-central', rpg.saldoAtual);


function verificarStatusAula(id) {
    const areaAviso = document.getElementById('aviso-status');
    if (!areaAviso || !id) return;

    const nome = (typeof DuvidDB !== "undefined" ? DuvidDB.getNome() : "Estudante") || "Estudante";
    const jaFezQuestoes = localStorage.getItem(`concluido_questoes_${id}`) === "true";
    const jaLeuTexto = localStorage.getItem(`concluido_texto_${id}`) === "true";

    let msg = "", cor = "w3-teal", icone = "fa-rocket";

    // CASO 1: Já completou TUDO
    if (jaFezQuestoes && jaLeuTexto) {
        msg = `Sensacional, <b>${nome}</b>! Você já dominou esta aula 100%. Aproveite para revisar ou seguir adiante!`;
        cor = "w3-green"; icone = "fa-check-circle";
    }
    // CASO 2: Fez questões, mas NÃO leu o texto
    else if (jaFezQuestoes && !jaLeuTexto) {
        msg = `Mandou bem nas questões, <b>${nome}</b>! 💡 <b>Dica:</b> Leia o texto base agora para garantir seus globinhos extras de leitura!`;
        cor = "w3-orange"; icone = "fa-book";
    }
    // CASO 3: Leu o texto, mas NÃO fez questões (O mais comum)
    else if (!jaFezQuestoes && jaLeuTexto) {
        msg = `Texto lido <b>${nome}</b>, agora que tal testar seus conhecimentos nas questões e <b>ganhar mais globinhos</b>?`;
        cor = "w3-indigo"; icone = "fa-pencil";
    }
    // CASO 4: Não fez nada ainda (Aluno novo na aula)
    else if (!jaFezQuestoes && !jaLeuTexto) {
        msg = `Olá! Começar pelo texto é uma ótima ideia! As questões também já estão liberadas para você ganhar pontos!`;
    }

    if (msg) {
        areaAviso.innerHTML = `
            <div class="w3-panel ${cor} w3-display-container w3-round-large w3-animate-top w3-card-4">
                <span onclick="this.parentElement.style.display='none'" 
                      class="w3-button w3-display-topright w3-round-large" style="padding:12px 16px">&times;</span>
                <p class="w3-padding-16 w3-medium w3-text-white" style="margin-right:20px">
                    <i class="fa ${icone} w3-xlarge"></i> &nbsp; ${msg}
                </p>
            </div>`;
    }
}


// Adicione esta função ao seu DuvidCore ou como função global no core.js
function inicializarAula(tipo) {
    // 1. Recupera o nome globalmente
    const nome = DuvidDB.getNome();

    // 2. Atualiza a interface global (Globinhos e Nome no Painel)
    if (typeof atualizarInterface === "function") atualizarInterface();

    const nomeNoPainel = document.querySelector('#painel-usuario b');
    if (nomeNoPainel && nome) nomeNoPainel.innerText = nome;

    // 3. Verifica se é modo revisão
    const params = new URLSearchParams(window.location.search);
    const aulaID = params.get('id');

    if (aulaID) {
        const jaConcluiu = localStorage.getItem(`concluido_${tipo}_${aulaID}`) === "true";
        if (jaConcluiu) {
            console.log(`Modo Revisão: ${tipo} ${aulaID} já finalizado.`);
            // Opcional: injetar aviso visual
            const aviso = document.getElementById('aviso-revisao');
            if (aviso) aviso.style.display = 'block';
        }
    }

    return aulaID;
}
function atualizarGlobinhosGeral() {
    if (typeof DuvidDB === 'undefined') return;

    const saldo = DuvidDB.getGlobinhos();
    const pts = saldo.toFixed(1);

    // 1. Atualiza o saldo total na Navbar (O novo span que criamos)
    const elTotal = document.getElementById('saldoTotalHeader');
    if (elTotal) elTotal.innerText = pts;

    // 2. Se estiver na Home, atualiza o card central também
    const elHome = document.getElementById('valor-total-central');
    if (elHome) elHome.innerText = pts;
}




// 2. A função que realmente faz o trabalho (só roda ao clicar no botão do modal)
function executarReset() {
    console.log("Iniciando reset total do sistema...");

    // Lista de chaves para remoção segura
    const chavesParaRemover = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        // Critérios: Progresso novo, Progresso antigo e Globinhos
        if (
            key.startsWith("concluido_") ||
            (key.startsWith("duvid_") && key.endsWith("_questoes")) ||
            key === "duvid_globinhos"
        ) {
            if (key !== "duvid_nome") {
                chavesParaRemover.push(key);
            }
        }
    }

    // Executa a limpeza
    chavesParaRemover.forEach(key => localStorage.removeItem(key));

    // Zera explicitamente o saldo
    localStorage.setItem("duvid_globinhos", "0");

    // 3. Feedback Visual dentro do Modal
    const modalContent = document.querySelector("#modalReset .w3-container");
    if (modalContent) {
        modalContent.innerHTML = `
                <div class="w3-animate-zoom w3-center w3-padding-32">
                    <h3 class="fontePixel w3-text-red"><b>SISTEMA REBOOTADO!</b></h3>
                    <img src="../fotoIndex/globinhoPe.png" width="80" class="w3-spin w3-margin">
                    <p>Limpando memórias... <b>Aguarde.</b></p>
                </div>
            `;
    }

    // Som de erro/reset
    if (typeof playSom === "function") playSom('erro');

    // 4. Redireciona para a Home zerada após 1.8s
    setTimeout(() => {
        window.location.href = "/index.html";
    }, 1800);
}

// --- 2. Função Mestre de Interface ---

function feedbackVisualAcerto() {
    const notaFixa = document.getElementById("notaFixa");
    const displayHome = document.getElementById("display-globinhos-home");
    const imagemGlobo = document.getElementById("imagem50");
    const painelPontos = document.getElementById("painel-pontos");

    const url = window.location.href.toLowerCase();
    const ehAula = url.includes('modelo-') || url.includes('questoes') || url.includes('texto');
    const saldoTotal = Number(localStorage.getItem("duvid_globinhos")) || 0;

    // 1. ATUALIZA VALORES E CORES
    if (notaFixa) {
        if (ehAula) {
            notaFixa.innerText = (window.ganhosAtuais || 0).toFixed(1);
            notaFixa.style.color = "#ffffff";
            notaFixa.style.fontWeight = "bold";
        } else {
            notaFixa.innerText = saldoTotal.toFixed(1);
            notaFixa.style.color = "";
            notaFixa.style.fontWeight = "normal";
        }
    }

    if (displayHome) displayHome.innerText = saldoTotal.toFixed(1);

    // 2. DISPARA AS ANIMAÇÕES INDIVIDUAIS

    // Faz o painel (número) pular
    if (painelPontos) {
        painelPontos.classList.remove('pulo-elastico');
        void painelPontos.offsetWidth; // Reset da animação
        painelPontos.classList.add('pulo-elastico');
    }

    // Faz o globinho girar
    if (imagemGlobo) {
        imagemGlobo.classList.remove('giro-globinho');
        void imagemGlobo.offsetWidth; // Reset da animação
        imagemGlobo.classList.add('giro-globinho');
    }
}
// --- 3. Atalhos e Inicialização ---
function atualizarHeaderGlobinhos() {
    feedbackVisualAcerto();
}

// --- LÓGICA DE IDENTIFICAÇÃO (LOGIN / TROCA DE NOME) ---
function gerenciarIdentificacaoHome() {
    const nomeSalvo = DuvidDB.getNome();
    const loading = document.getElementById('loading-painel');
    const form = document.getElementById('form-identificacao');
    const display = document.getElementById('display-identificado');
    const nomeTexto = document.getElementById('nome-aluno-texto');

    if (loading) loading.style.display = 'none';

    if (nomeSalvo) {
        if (form) form.style.display = 'none';
        if (display) display.style.display = 'block';
        if (nomeTexto) nomeTexto.innerText = nomeSalvo.toUpperCase();

        // --- GATILHOS DE RPG ---
        // 1. Atualiza o Nível, Patente e Barra de XP Total
        if (typeof atualizarSistemaNivelHome === "function") {
            atualizarSistemaNivelHome();
        }

        // 2. Dispara o resumo das aulas (1, 2 e 3 ano)
        if (typeof atualizarResumoHome === "function") {
            atualizarResumoHome();
        }
    } else {
        if (display) display.style.display = 'none';
        if (form) form.style.display = 'block';
    }
}

function NomeAlunos(respid, inputid) {
    const nome = document.getElementById(inputid).value;
    if (nome.trim() !== "") {
        // Salva o nome
        DuvidDB.setNome(nome);

        // Troca as telas
        document.getElementById('form-identificacao').style.display = 'none';
        document.getElementById('display-identificado').style.display = 'block';
        document.getElementById('nome-aluno-texto').innerText = nome.toUpperCase();
        document.getElementById('resumo-geral').style.display = 'block';

        // GATILHO 2: Inicializa o sistema de nível para o novo jogador
        atualizarSistemaNivelHome();
    }
}


function atualizarResumoHome() {
    // Configuração: Total de aulas que existem em cada ano no seu projeto
    const totaisPorAno = { "1ano": 32, "2ano": 36, "3ano": 36 };

    Object.keys(totaisPorAno).forEach(ano => {
        let concluidas = 0;
        const total = totaisPorAno[ano];

        // Percorre o localStorage procurando conclusões desse ano
        // Ex: concluido_questoes_101, concluido_questoes_205...
        for (let i = 0; i < localStorage.length; i++) {
            let chave = localStorage.key(i);

            // Lógica: Se a chave começa com 'concluido_questoes_' e o ID bate com o ano
            // IDs 100+ (1º ano), 200+ (2º ano), 300+ (3º ano)
            if (chave.startsWith("concluido_questoes_")) {
                let id = parseInt(chave.replace("concluido_questoes_", ""));

                if (ano === "1ano" && id >= 100 && id < 200) concluidas++;
                if (ano === "2ano" && id >= 200 && id < 300) concluidas++;
                if (ano === "3ano" && id >= 300 && id < 400) concluidas++;
            }
        }

        // Calcula porcentagem e atualiza a interface
        const porcentagem = Math.round((concluidas / total) * 100);

        const barra = document.getElementById(`bar-${ano}`);
        const texto = document.getElementById(`txt-${ano}`);
        const conquista = document.getElementById(`conquista-${ano}`);

        if (barra) barra.style.width = porcentagem + "%";
        if (texto) texto.innerText = `${concluidas}/${total}`;

        // Se completou 100%, mostra o troféu do card
        if (conquista && porcentagem >= 100) conquista.style.display = 'block';
    });

    // Mostra o container dos resumos agora que está preenchido
    const resumoGeral = document.getElementById('resumo-geral');
    if (resumoGeral) resumoGeral.style.display = 'block';
}

function prepararTrocaNome() {
    const form = document.getElementById('form-identificacao');
    const display = document.getElementById('display-identificado');
    const input = document.getElementById('pq0');

    // Inverte a visualização
    if (display) display.style.display = 'none';
    if (form) {
        form.style.display = 'block';
        if (input) {
            input.value = DuvidDB.getNome();
            input.focus();
        }
    }
}



async function carregarFrase() {
    const f = document.getElementById('frase');
    const a = document.getElementById('autor');
    const imgAutor = document.getElementById('autor-img');

    if (!f) return;

    try {
        // Efeito visual de saída
        f.style.opacity = 0;
        if (imgAutor) imgAutor.style.opacity = 0;

        // Busca o JSON (o "/" inicial evita erro no blog)
        const resposta = await fetch('/estilos/frases.json');
        const frases = await resposta.json();

        // Sorteio
        const aleatoria = frases[Math.floor(Math.random() * frases.length)];

        // Pequena pausa para a transição do CSS
        setTimeout(() => {
            f.innerText = `"${aleatoria.frase}"`;
            if (a) a.innerText = `— ${aleatoria.autor}`;

            if (imgAutor && aleatoria.imagem) {
                // Monta o caminho: /imgFrases/milton.jpg
                imgAutor.src = "/" + aleatoria.imagem;

                // Só exibe quando a imagem terminar de carregar
                imgAutor.onload = () => {
                    imgAutor.style.display = 'block';
                    imgAutor.style.opacity = 1;
                };
            } else if (imgAutor) {
                imgAutor.style.display = 'none';
            }

            f.style.opacity = 1;
        }, 500);

    } catch (erro) {
        console.error("Erro ao carregar JSON:", erro);
        f.innerText = "A geografia é a arte de ler o mundo.";
        f.style.opacity = 1;
    }
}


function sincronizarNomeGlobal() {
    // 1. Pega o nome atualizado
    const nomeSalvo = localStorage.getItem("duvid_nome");
    if (!nomeSalvo) return; // Se não tem nome, não faz nada

    // 2. Atualiza no Header das Aulas (se houver o ID 'nome-aluno-header')
    const elHeader = document.getElementById("nome-aluno-header");
    if (elHeader) elHeader.innerText = nomeSalvo.toUpperCase();

    // 3. Atualiza em qualquer Span ou Div que use a classe 'nome-dinamico'
    const elementosDinamicos = document.querySelectorAll(".nome-dinamico");
    elementosDinamicos.forEach(el => {
        el.innerText = nomeSalvo;
    });

    // 4. Se você usa aquele "Olá, Fulano" no topo das aulas
    const bNome = document.querySelector(".w3-col.s8 b.w3-text-green");
    if (bNome) bNome.innerText = nomeSalvo.toUpperCase();
}


//Função quando se clica na palavra

function revelarParentese(elemento, definicao) {
    if (elemento.classList.contains('desbloqueado')) return;

    // 1. Mantém a palavra e adiciona o parêntese DEPOIS dela
    elemento.innerHTML += ` <span class="definicao-fade">(${definicao})</span>`;

    // 2. Estiliza a palavra original para mostrar que foi "coletada"
    elemento.classList.add('desbloqueado');
    elemento.style.color = "#155724"; // Verde escuro
    elemento.style.fontWeight = "bold";
    elemento.style.cursor = "default";

    // 3. Feedback Sonoro e XP (Opcional, mas recomendado para o 'vício')
    if (typeof playSom === "function") playSom('acerto');
    if (typeof DuvidDB !== "undefined") {
        DuvidDB.addGlobinhos(2);
        if (typeof atualizarGlobinhosGeral === "function") atualizarGlobinhosGeral();
    }
}