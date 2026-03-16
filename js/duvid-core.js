/* ==========================================================
   DUVID CORE - Central de Gamificação, Sons e LocalStorage
   ========================================================== */

// 1. CONFIGURAÇÕES DE SOM (Global)
const SONS_VITORIA = ['/audios/acerto1.mp3', '/audios/acerto2.mp3'];
const SONS_ERRO = ['/audios/erro1.mp3', '/audios/erro2.mp3'];

// Sons de encerramento (Média Boa vs Média Ruim)
const SOM_FINAL_BOM = new Audio('/audios/notaFinal.mp3');
const SOM_FINAL_RUIM = new Audio('/audios/notaFinal2.mp3');

function playSomFinal(vitoria) {
    if (vitoria) {
        SOM_FINAL_BOM.play().catch(e => console.log("Erro som final: ", e));
    } else {
        SOM_FINAL_RUIM.play().catch(e => console.log("Erro som final: ", e));
    }
}

function playSom(tipo) {
    const lista = (tipo === 'acerto') ? SONS_VITORIA : SONS_ERRO;
    const sorteado = lista[Math.floor(Math.random() * lista.length)];
    const audio = new Audio(sorteado);
    audio.volume = (tipo === 'acerto') ? 0.7 : 0.4;
    audio.play().catch(e => console.log("Áudio aguardando interação."));
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
        // Pega o valor atual e garante que seja um número
        let atual = Number(localStorage.getItem("duvid_globinhos")) || 0;
        let novoTotal = atual + Number(quantidade);

        // Salva o novo total
        localStorage.setItem("duvid_globinhos", novoTotal);

        console.log(`Globinhos adicionados: ${quantidade}. Novo total: ${novoTotal}`);

        // Se estivermos em uma aula, tenta balançar o globinho da navbar
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

    verificarConquistas: function () {
        let saldo = this.getGlobinhos();
        if (saldo >= 12000) localStorage.setItem("patente", "Lenda da Terra");
        else if (saldo >= 5000) localStorage.setItem("patente", "Geógrafo Sênior");
        else if (saldo >= 500) localStorage.setItem("patente", "Explorador");
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

            alert("Progresso resetado com sucesso!");
            location.reload(); // Recarrega para a Home voltar a ficar cinza
        }
    },// Caso queira resetar APENAS os globinhos (para testes rápidos)

};


function verificarStatusAula(id) {
    const areaAviso = document.getElementById('aviso-status');
    if (!areaAviso || !id) return;

    const nome = DuvidDB.getNome() || "Estudante";
    const jaFezQuestoes = localStorage.getItem(`concluido_questoes_${id}`) === "true";
    const jaLeuTexto = localStorage.getItem(`concluido_texto_${id}`) === "true";

    let msg = "", cor = "w3-teal", icone = "fa-rocket";

    if (jaFezQuestoes && jaLeuTexto) {
        msg = `Olá, <b>${nome}</b>! Você já dominou esta aula. Revisar ajuda a fixar!`;
        cor = "w3-green"; icone = "fa-check-circle";
    } else if (jaFezQuestoes && !jaLeuTexto) {
        msg = `Parabéns pelas questões, <b>${nome}</b>! Mas você ainda não leu o texto base.`;
        cor = "w3-orange"; icone = "fa-book";
    } else if (!jaFezQuestoes && !jaLeuTexto) {
        msg = `Bem-vindo! Recomendo ler o texto antes, mas pode começar o desafio agora!`;
    }

    if (msg) {
        areaAviso.innerHTML = `
            <div class="w3-panel ${cor} w3-display-container w3-round-large w3-animate-top">
                <span onclick="this.parentElement.style.display='none'" class="w3-button w3-display-topright w3-round-large">&times;</span>
                <p class="w3-padding-16"><i class="fa ${icone}"></i> ${msg}</p>
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
    const pts = DuvidDB.getGlobinhos();

    // 1. Tenta atualizar o painel da Home
    const elHome = document.getElementById('display-globinhos-home');
    if (elHome) elHome.innerText = pts;

    // 2. Tenta atualizar o contador da Navbar (nas aulas)
    const elAula = document.getElementById('globinhos-aula');
    if (elAula) {
        elAula.innerText = pts;
        // Adiciona um efeito de "pulso" para o aluno ver que ganhou
        elAula.classList.add('w3-animate-zoom');
        setTimeout(() => elAula.classList.remove('w3-animate-zoom'), 500);
    }
}

function resetarGlobinhos() {

    localStorage.setItem("duvid_globinhos", 0);

}
function feedbackVisualAcerto() {
    // 1. Pega o valor e garante que seja um número (Trata o saldo como 'saldo')
    const saldo = Number((typeof DuvidDB !== 'undefined') ? DuvidDB.getGlobinhos() : localStorage.getItem("duvid_globinhos")) || 0;

    console.log("Iniciando feedback visual. Saldo atualizado:", saldo);

    // 2. Atualiza o notaFixa (Header) com o .0
    const notaFixa = document.getElementById("notaFixa");
    if (notaFixa) {
        notaFixa.innerText = saldo.toFixed(1); 
        notaFixa.classList.add('w3-animate-zoom');
        setTimeout(() => notaFixa.classList.remove('w3-animate-zoom'), 500);
    }

    // 3. Atualiza o painel da Home ou da página de aulas
    const displayHome = document.getElementById("display-globinhos-home");
    if (displayHome) {
        displayHome.innerText = saldo.toFixed(1);
    }

    // 4. Garante que o painel-pontos apareça
    const painel = document.getElementById('painel-pontos');
    if (painel) {
        painel.classList.remove('w3-hide');
        painel.style.display = 'flex';
    }
}