// 1. CONSTANTES (FORA DE TUDO)
const TIPO_CONCLUSAO = { TEXTO: 'texto', QUESTOES: 'questoes' };
const DB_CHAVE = "duvid_globinhos";
const NOME_CHAVE = "duvid_nome";
const PATENTE_CHAVE = "duvid_patente";
const NIVEL_CHAVE = "duvid_lvl";
const RECOMPENSA_TEXTO = 10;
const RECOMPENSA_QUESTOES = 10;
const RECOMPENSA_GERAL = 20;

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

function playSomFinal(vitoria) {
    // 1. Escolhe o som baseado no resultado
    const som = vitoria ? SOM_FINAL_BOM : SOM_FINAL_RUIM;

    if (som) {
        som.currentTime = 0; // REBOBINA O SOM (Garante que toque sempre do início)
        som.play().catch(e => console.log("Erro som final: ", e));
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


const DuvidDB = {


    getGlobinhos: function () {
        // Usa a constante para ler o saldo
        const saldo = localStorage.getItem(DB_CHAVE);
        return saldo ? parseInt(saldo) : 0;
    },


    addGlobinhos: function (quantidade) {
        // 1. Dados ANTES da soma
        let saldoAnterior = this.getGlobinhos();
        let lvlAnterior = this.getProgressoRPG().lvl;

        // 2. Realiza a soma e salva usando a Constante
        let novoSaldo = saldoAnterior + Number(quantidade);
        localStorage.setItem(DB_CHAVE, novoSaldo);

        // --- NOVIDADE AQUI: Sincroniza Patente e Nível no LocalStorage ---
        const progressoAtual = this.verificarConquistas();
        // ----------------------------------------------------------------
     
        let novoLvl = progressoAtual.lvl;

        // --- LÓGICA DE FEEDBACK (Sem alterações aqui, está ótima!) ---
        if (novoLvl > lvlAnterior) {
            if (typeof playSomFinal === "function") playSomFinal(true);
            if (typeof dispararComemoracao === "function") dispararComemoracao(true);
            this.exibirNotificacaoLevelUp(progressoAtual);
        } else {
            if (typeof playSom === "function") playSom('acerto');
        }

        // Atualiza elementos da interface
        window.ganhosAtuais = (window.ganhosAtuais || 0) + Number(quantidade);
        if (typeof atualizarHeaderGlobinhos === "function") atualizarHeaderGlobinhos();
       
    },

    // Função auxiliar para não poluir o addGlobinhos
    exibirNotificacaoLevelUp: function (progresso) {
        const notificacao = document.createElement('div');
        notificacao.innerHTML = `
            <div class="w3-animate-zoom w3-card-4 w3-round-large w3-padding" 
                 style="position:fixed; top:20px; left:50%; transform:translateX(-50%); z-index:10000; text-align:center; background-color:${progresso.cor}; color:white; min-width:250px;">
                <i class="fa fa-arrow-up w3-xlarge"></i><br>
                <b class="w3-large">SUBIU DE NÍVEL!</b><br>
                <span>Agora você é um <b>${progresso.patente}</b></span><br>
                <span class="w3-tag w3-white w3-text-black w3-round w3-margin-top">LVL ${progresso.lvl}</span>
            </div>
        `;
        document.body.appendChild(notificacao);
        setTimeout(() => {
            notificacao.classList.add('w3-animate-opacity');
            setTimeout(() => notificacao.remove(), 500);
        }, 5000);
    },

    // NOVA FUNÇÃO: O "Leitor" de status blindado
    estaConcluido: function (idAula, tipo) {
        // 'tipo' deve vir da constante TIPO_CONCLUSAO (texto ou questoes)
        // Retorna true se estiver "true" no localStorage, senão retorna false
        return localStorage.getItem(`concluido_${tipo}_${idAula}`) === "true";
    },


    salvarConclusao: function (idAula, tipo) {
        localStorage.setItem(`concluido_${tipo}_${idAula}`, "true");
    },


    getNome: function () {
        return localStorage.getItem(NOME_CHAVE) || "";
    },

    salvarNome: function (nome) {
        if (nome.trim() !== "") {
            localStorage.setItem(NOME_CHAVE, nome.trim());
            return true;
        }
        return false;
    },
    // ADICIONE ESTA LINHA ABAIXO:
    setNome: function (nome) { return this.salvarNome(nome); },


    // NOVA FUNÇÃO CENTRALIZADA (Versão Blindada)
    getProgressoAcademico: function (aulas) {
        if (!aulas || !Array.isArray(aulas)) return { concluidas: 0, total: 0, porc: 0 };

        const aulasValidas = aulas.filter(a => a !== null && a.id !== undefined);
        const total = aulasValidas.length;

        const concluidas = aulasValidas.filter(aula => {
            // Agora usamos a função interna 'estaConcluido' e as Constantes
            // Isso garante que se você mudar o nome das chaves no topo, aqui continua funcionando
            const texto = this.estaConcluido(aula.id, TIPO_CONCLUSAO.TEXTO);
            const questoes = this.estaConcluido(aula.id, TIPO_CONCLUSAO.QUESTOES);

            return texto && questoes;
        }).length;

        return {
            concluidas: concluidas,
            total: total,
            porc: total > 0 ? Math.round((concluidas / total) * 100) : 0
        };
    },

    RANKING_SISTEMA: [
        { lvl: 1, patente: "NOVATO", min: 0, max: 1000, cor: "#9d9d9d" },
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

        // Usando as novas constantes para salvar
        localStorage.setItem(PATENTE_CHAVE, progresso.patente);
        localStorage.setItem(NIVEL_CHAVE, progresso.lvl);

        console.log(`[RPG] Status Sincronizado: ${progresso.patente} (Nível ${progresso.lvl})`);

        return progresso;
    },

};//fIM DAS FUNÇÕES DuvidDB






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
    document.getElementById('lvl-tag').style.backgroundColor = "amber"; // Ou use rpg.cor

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

    // 1. Usando o DuvidDB para pegar o nome e os status (Muito mais limpo!)
    const nome = (typeof DuvidDB !== "undefined" ? DuvidDB.getNome() : "Estudante") || "Estudante";

    const jaFezQuestoes = DuvidDB.estaConcluido(id, TIPO_CONCLUSAO.QUESTOES);
    const jaLeuTexto = DuvidDB.estaConcluido(id, TIPO_CONCLUSAO.TEXTO);

    let msg = "", cor = "w3-teal", icone = "fa-rocket";

    // CASO 1: Já completou TUDO (Checkmate!)
    if (jaFezQuestoes && jaLeuTexto) {
        msg = `Sensacional, <b>${nome}</b>! Você já dominou esta aula 100%. Aproveite para revisar ou seguir adiante!`;
        cor = "w3-green"; icone = "fa-check-circle";
    }
    // CASO 2: Fez questões, mas NÃO leu o texto (Raro, mas acontece)
    else if (jaFezQuestoes && !jaLeuTexto) {
        msg = `Mandou bem nas questões, <b>${nome}</b>! 💡 <b>Dica:</b> Leia o texto base agora para garantir seus globinhos extras de leitura!`;
        cor = "w3-orange"; icone = "fa-book";
    }
    // CASO 3: Leu o texto, mas NÃO fez questões (Fluxo padrão)
    else if (!jaFezQuestoes && jaLeuTexto) {
        msg = `Texto lido <b>${nome}</b>, agora que tal testar seus conhecimentos nas questões e <b>ganhar mais globinhos</b>?`;
        cor = "w3-indigo"; icone = "fa-pencil";
    }
    // CASO 4: Não fez nada ainda (Início da Jornada)
    else {
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


function atualizarInterface() {
    // 1. Saldo Global (Dourado/Header)
    const saldoDisplay = document.getElementById("saldoTotalHeader");
    if (saldoDisplay && typeof DuvidDB !== 'undefined') {
        saldoDisplay.innerHTML = DuvidDB.getGlobinhos().toFixed(1);
    }

    // 2. Nota da Aula/Questão (Branca/NotaFixa)
    const notaDisplay = document.getElementById("notaFixa");
    if (notaDisplay) {
        // Tenta pegar ganhosAtuais (questões) ou nota (texto)
        let valorAula = (typeof window.ganhosAtuais !== 'undefined') ? window.ganhosAtuais : 
                        (typeof nota !== 'undefined') ? nota : 0;
        
        notaDisplay.innerHTML = Number(valorAula).toFixed(1);
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


function executarReset() {
    // 1. Efeito visual: Sobe a página
    window.scrollTo({ top: 0, behavior: 'smooth' });

    console.log("Iniciando Protocolo de Reboot...");

    // 2. Limpeza Inteligente do LocalStorage
    const chaves = Object.keys(localStorage);
    chaves.forEach(key => {
        // Verifica se a chave começa com os prefixos do sistema
        const isConcluido = key.startsWith("concluido_");
        const isDuvid = key.startsWith("duvid_");

        // Também garante a limpeza das chaves específicas que você definiu no topo
        const isChaveGlobal = (key === DB_CHAVE || key === NOME_CHAVE);

        if (isConcluido || isDuvid || isChaveGlobal) {
            localStorage.removeItem(key);
            console.log(`Chave removida: ${key}`);
        }
    });

    // 3. Feedback Visual no Modal (com o texto de RPG)
    const modalContent = document.querySelector("#modalReset .w3-container");
    if (modalContent) {
        modalContent.innerHTML = `
            <div class="w3-animate-zoom w3-center w3-padding-32">
                <h3 class="w3-text-red fontePixel"><b>SISTEMA REBOOTADO!</b></h3>
                <img src="../fotoIndex/globinhoPe.png" width="80" class="w3-spin w3-margin">
                <p>Formatando banco de dados...<br><b>Aguarde a reinicialização.</b></p>
            </div>
        `;
    }

    // 4. Som e Redirecionamento
    if (typeof playSom === "function") playSom('erro');

    setTimeout(() => {
        // Volta para a Splash Screen para o aluno colocar o nome novamente
        window.location.href = "../index.html";
    }, 2200);
}


// 3. Validação do formulário de acesso aos grupos (Senha)
function validateForm() {
    const password = document.getElementById("password").value;
    if (password === "") {
        document.getElementById("errorMessage").innerHTML = "Digite a senha de acesso.";
        return false;
    }
    return true;
}
// --- 2. Função Mestre de Interface ---

function feedbackVisualAcerto() {
    const notaFixa = document.getElementById("notaFixa");
    const displayHome = document.getElementById("display-globinhos-home");
    const imagemGlobo = document.getElementById("imagem50");
    const painelPontos = document.getElementById("painel-pontos");

    const url = window.location.href.toLowerCase();
    const ehAula = url.includes('modelo-') || url.includes('questoes') || url.includes('texto');
    const saldoTotal = Number(localStorage.getItem(DB_CHAVE)) || 0;

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
        // CORREÇÃO AQUI: De setNome para salvarNome
        DuvidDB.salvarNome(nome);

        // Troca as telas
        document.getElementById('form-identificacao').style.display = 'none';
        document.getElementById('display-identificado').style.display = 'block';
        document.getElementById('nome-aluno-texto').innerText = nome.toUpperCase();
        document.getElementById('resumo-geral').style.display = 'block';

        // GATILHO 2
        atualizarSistemaNivelHome();
    }
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
    const nomeSalvo = localStorage.getItem(NOME_CHAVE);
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