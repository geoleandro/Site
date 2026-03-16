let questoes = [];
let indiceAtual = 0;
let acertos = 0;
let aulaID = "";

// Lista de caminhos dos seus arquivos de áudio
const sonsVitoria = [
    '/audios/audio1.mp3',
    '/audios/audio3.mp3',
    // Você pode adicionar mais aqui futuramente: '/audios/audio3.mp3'
];

// Lista de sons para quando o aluno erra ou esquece de marcar
const sonsErroDinamicos = [
    '/audios/audio2.mp3',
    '/audios/audio4.mp3'
];
const somErro = new Audio('/audios/audio2.mp3');   // Som de erro/alerta
const somFinalBom = new Audio('/audios/notaFinal.mp3'); // Média >= 6
const somFinalRuim = new Audio('/audios/notaFinal2.mp3');  // Média < 6

document.addEventListener('DOMContentLoaded', () => {
    // 1. Pega o ID da URL (ex: template.html?id=101)
    const params = new URLSearchParams(window.location.search);
    aulaID = params.get('id');

    if (aulaID) {
        carregarDados(aulaID);
    } else {
        alert("Erro: ID da aula não encontrado!");
    }
});

async function carregarDados(id) {
    try {
        // Exemplo: vai buscar em questoes/1ano/101.json
        // Você precisa ajustar esse caminho conforme sua pasta real!
        const anoPasta = id.startsWith('1') ? '1ano' : id.startsWith('2') ? '2ano' : '3ano';
        const response = await fetch(`../../../questoes/${anoPasta}/${id}.json`);
        questoes = await response.json();
        renderizarQuestao();
    } catch (error) {
        console.error("Erro ao carregar o JSON:", error);
        document.getElementById('container-questao').innerHTML = "Erro ao carregar questões.";
    }
}

function renderizarQuestao() {
    const q = questoes[indiceAtual];
    const container = document.getElementById('container-questao');

    const porc = (indiceAtual / questoes.length) * 100;
    document.getElementById('barra-progresso-simulado').style.width = porc + "%";

    container.innerHTML = `
        <div class="w3-animate-right w3-padding-24">
            <div class="w3-row">
                <div class="w3-col s8"><h4 class="w3-text-green"><b>Questão ${indiceAtual + 1}</b></h4></div>
                <div class="w3-col s4 w3-right-align w3-text-grey"><b>${q.ano || ''}</b></div>
            </div>

            ${q.imagem_apoio ? `
                <div class="w3-center w3-margin-bottom">
                    <img src="${q.imagem_apoio}" class="w3-image w3-card" style="max-height:350px; width:100%; object-fit:contain">
                </div>
            ` : ''}
            
            ${q.texto_contexto ? `<div class="w3-panel w3-leftbar w3-light-grey w3-padding-small"><i>${q.texto_contexto}</i></div>` : ''}

            ${q.ajuda ? `
                <button onclick="document.getElementById('modal-ajuda').style.display='block'" class="w3-button w3-tiny w3-round-xxlarge w3-amber w3-margin-bottom">
                    <i class="fa fa-lightbulb-o"></i> DICA DO PROFESSOR
                </button>
            ` : ''}
            
            <p class="w3-large"><b>${q.pergunta}</b></p>

            <div class="w3-margin-top">
                ${q.alternativas.map((alt, i) => `
                    <label class="w3-padding w3-card-1 w3-border w3-round w3-margin-bottom w3-block w3-hover-pale-green" style="cursor:pointer">
                        <input type="radio" name="opcao" value="${i}" class="w3-radio" style="margin-right:10px">
                        <b>${String.fromCharCode(97 + i)})</b> ${alt}
                    </label>
                `).join('')}
            </div>

            <div id="msg-erro" class="w3-text-red w3-margin-top w3-hide"><b>⚠️ Escolha uma alternativa!</b></div>

            <button onclick="verificar()" id="btn-verificar" class="w3-button w3-green w3-block w3-round-large w3-padding-16 w3-margin-top">
                <b>VERIFICAR RESPOSTA</b>
            </button>
        </div>

        <div id="modal-ajuda" class="w3-modal">
            <div class="w3-modal-content w3-animate-zoom w3-card-4 w3-round-large">
                <header class="w3-container w3-amber w3-round-large"> 
                    <span onclick="document.getElementById('modal-ajuda').style.display='none'" class="w3-button w3-display-topright w3-large">&times;</span>
                    <h4>Dica de Estudo</h4>
                </header>
                <div class="w3-container w3-padding-16">
                    <p>${q.ajuda ? q.ajuda.texto : ''}</p>
                    ${q.ajuda && q.ajuda.imagem ? `<img src="${q.ajuda.imagem}" class="w3-image">` : ''}
                </div>
            </div>
        </div>
    `;
}
function verificar() {
    const selecionada = document.querySelector('input[name="opcao"]:checked');
    const btnVerificar = document.getElementById('btn-verificar');

    // --- AJUSTE: Se não marcou nada, toca o som e para aqui ---
    // --- LÓGICA DO BOTÃO DINÂMICO ---
    if (!selecionada) {
        tocarSomErro(); // Som de erro aqui também

        const textoOriginal = btnVerificar.innerHTML;
        btnVerificar.innerHTML = "<i class='fa fa-exclamation-triangle'></i> ESCOLHA UMA ALTERNATIVA!";
        btnVerificar.classList.replace('w3-green', 'w3-red'); // Troca a cor para chamar atenção

        // Volta ao normal após 2 segundos
        setTimeout(() => {
            btnVerificar.innerHTML = textoOriginal;
            btnVerificar.classList.replace('w3-red', 'w3-green');
        }, 2000);

        return;
    }

    const resp = parseInt(selecionada.value);
    const q = questoes[indiceAtual];
    const feedback = document.getElementById('barra-feedback');
    const msg = document.getElementById('feedback-msg');
    const txt = document.getElementById('feedback-txt');

    // 1. Destaca as opções no formulário
    const todasOpcoes = document.querySelectorAll('.opcao-container');
    todasOpcoes.forEach((div, index) => {
        if (index === q.correta) {
            div.classList.add('w3-pale-green', 'w3-border-green', 'w3-leftbar');
        }
        if (index === resp && resp !== q.correta) {
            div.classList.add('w3-pale-red', 'w3-border-red', 'w3-leftbar');
        }
    });

    // 2. Lógica do Banner (Cores e Mensagens)
    if (resp === q.correta) {
        acertos++;
        // AGORA CHAMA A FUNÇÃO RANDOM DE SOM
        tocarSomAcerto();
        // Dispara um dos 10 efeitos aleatoriamente
        dispararComemoracao();
        feedback.className = "w3-bottom w3-container w3-padding-16 w3-animate-bottom w3-green";
        msg.innerHTML = "<b><i class='fa fa-smile-o'></i> Boa! Resposta correta.</b>";
    } else {
        tocarSomErro(); // AGORA O SOM DE ERRO É RANDOM TAMBÉM
        feedback.className = "w3-bottom w3-container w3-padding-16 w3-animate-bottom w3-amber";
        msg.innerHTML = "<b>Opa! A resposta correta é a (" + String.fromCharCode(65 + q.correta) + ")</b>";
    }

    // 3. AJUSTE: Exibe o comentário com Rolagem Automática
    // Adicionamos um max-height e overflow para caber comentários longos
    txt.innerHTML = `
    <div style="
        max-height: 400px; 
        overflow-y: auto; 
        background: rgba(255, 255, 255, 0.15); 
        padding: 12px; 
        border-radius: 8px; 
        margin: 10px 0 20px 0; 
        position: relative; 
        z-index: 1; /* Garante que ele fique abaixo do botão se houver sobreposição */
        border: 1px solid rgba(255,255,255,0.1);
        text-align: left;
    ">
        ${q.comentario}
    </div>
`;



    feedback.classList.remove('w3-hide');

    // Desativa o botão verificar para não clicar duas vezes na mesma questão

    if (btnVerificar) btnVerificar.disabled = true;
}




function proxima() {
    document.getElementById('barra-feedback').classList.add('w3-hide');
    indiceAtual++;

    if (indiceAtual < questoes.length) {
        renderizarQuestao();
    } else {
        finalizar();
    }
}
function finalizar() {
    document.getElementById('container-questao').classList.add('w3-hide');
    const res = document.getElementById('resultado-final');
    res.classList.remove('w3-hide');

    const media = (acertos / questoes.length) * 10;
    document.getElementById('placar-final').innerHTML = `Você acertou <b>${acertos}</b> de ${questoes.length} questões!`;

    // Lógica de Som Final baseada na média 6
    if (media >= 6) {
        somFinalBom.play();
        res.querySelector('h2').innerText = "Parabéns! Continue estudando!";
        res.querySelector('h2').className = "w3-text-green";
    } else {
        somFinalRuim.play();
        res.querySelector('h2').innerText = "Você pode revisar sempre!";
        res.querySelector('h2').className = "w3-text-red";
    }

    const params = new URLSearchParams(window.location.search);
    const aulaID = params.get('id');

    if (aulaID) {
        // GRAVA A CONCLUSÃO DAS QUESTÕES
        localStorage.setItem(`duvid_${aulaID}_questoes`, "true");
    }
}


function dispararComemoracao() {
    const estilo = Math.floor(Math.random() * 10) + 1; // Sorteia de 1 a 10
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    switch (estilo) {
        case 1: // 1. O CLÁSSICO (Explosão Central)
            confetti({ ...defaults, particleCount: 150, origin: { y: 0.6 } });
            break;

        case 2: // 2. CANHÕES LATERAIS (Estilo Final de Campeonato)
            confetti({ particleCount: 100, angle: 60, spread: 55, origin: { x: 0, y: 0.8 } });
            confetti({ particleCount: 100, angle: 120, spread: 55, origin: { x: 1, y: 0.8 } });
            break;

        case 3: // 3. FOGOS DE ARTIFÍCIO (Várias explosões aleatórias)
            var interval = setInterval(function () {
                var timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);
                var particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);
            break;

        case 4: // 4. CHUVA DE OURO (Só partículas amarelas e douradas)
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#FFD700', '#FFA500', '#FFFACD'] });
            break;

        case 5: // 5. ESCOLA DE SAMBA (Muitas cores e muito rápido)
            confetti({ particleCount: 200, spread: 160, colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'] });
            break;

        case 6: // 6. ESTRELAS CADENTES (Usa formato de estrela se a lib permitir ou cores vibrantes)
            confetti({ particleCount: 80, spread: 120, startVelocity: 45, gravity: 0.5 });
            break;

        case 7: // 7. A NEVE (Cai devagar do topo)
            confetti({ particleCount: 100, spread: 100, origin: { y: 0 }, gravity: 0.3, startVelocity: 0 });
            break;

        case 8: // 8. VULCÃO (Sai de baixo para cima com força)
            confetti({ particleCount: 150, angle: 90, spread: 30, startVelocity: 60, origin: { y: 1 } });
            break;

        case 9: // 9. O "POPORECO" (Dois estouros rápidos seguidos)
            confetti({ particleCount: 100, origin: { x: 0.3, y: 0.7 } });
            setTimeout(() => { confetti({ particleCount: 100, origin: { x: 0.7, y: 0.7 } }); }, 300);
            break;

        case 10: // 10. INFINITY (Dura 5 segundos caindo pouco a pouco)
            var end = Date.now() + 5000;
            (function frame() {
                confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 } });
                confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 } });
                if (Date.now() < end) requestAnimationFrame(frame);
            }());
            break;
    }
}

function tocarSomAcerto() {
    // Sorteia um índice da lista
    const indiceSorteado = Math.floor(Math.random() * sonsVitoria.length);

    // Cria e toca o áudio sorteado
    const som = new Audio(sonsVitoria[indiceSorteado]);

    // Ajuste de volume opcional (0.0 a 1.0)
    som.volume = 0.7;

    som.play().catch(e => console.log("Erro ao tocar som: ", e));
}

function tocarSomErro() {
    // Sorteia um índice da lista de erros
    const indiceSorteado = Math.floor(Math.random() * sonsErroDinamicos.length);

    // Cria e toca o áudio
    const som = new Audio(sonsErroDinamicos[indiceSorteado]);

    // Volume um pouco mais baixo para o erro não ser agressivo
    som.volume = 0.5;

    som.play().catch(e => console.log("Erro ao tocar áudio:", e));
}