let questoes = [];
let indiceAtual = 0;
let nota = 0;
let aulaID = ""; // Variável global

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id) {
        aulaID = id;

        // 1. Garante que o ID e o banco existam
        if (typeof verificarStatusAula === "function") verificarStatusAula(id);

        // 2. Carrega as perguntas
        carregarDados(id);

        // --- O PULO DO GATO AQUI ---
        // 3. Zera os ganhos da aula atual (Nota Branca)
        window.ganhosAtuais = 0;

        // Dentro do seu DOMContentLoaded das questões
        setTimeout(() => {
            if (typeof atualizarInterface === "function") atualizarInterface();
        }, 100);
        // ---------------------------
    }
});



async function carregarDados(id) {
    try {
        const anoPasta = id.startsWith('1') ? '1ano' : id.startsWith('2') ? '2ano' : '3ano';
        // Ajuste o caminho se necessário (removendo ../../../ se estiver na mesma raiz)
        const response = await fetch(`../../../questoes/${anoPasta}/${id}.json`);
        questoes = await response.json();
        renderizarQuestao();
    } catch (error) {
        console.error("Erro ao carregar o JSON:", error);
        document.getElementById('container-questao').innerHTML = "Erro ao carregar questões.";
    }
}

// --- FUNÇÃO PRINCIPAL ---
function renderizarQuestao() {
    
    const q = questoes[indiceAtual];
    const container = document.getElementById('container-questao');
    if (!container || !q) return;

    // 1. Lógica de Progresso (Isolada da renderização)
    const porc = ((indiceAtual + 1) / questoes.length) * 100;
    const progressBarr = document.getElementById('barra-progresso-simulado');
    if (progressBarr) progressBarr.style.width = `${porc}%`;

    // 2. Construção do Layout (Usa as peças de LEGO acima)
    container.innerHTML = `
        <div class="w3-animate-right w3-padding-24">
            <div class="w3-row">
                <div class="w3-col s8"><h4 class="w3-text-green"><b>Questão ${indiceAtual + 1}</b></h4></div>
                <div class="w3-col s4 w3-right-align w3-text-grey"><b>${q.ano || ''}</b></div>
            </div>

            ${gerarBlocoApoio(q)}
            ${gerarImagemApoio(q)}
            
            <p class="w3-large">${q.pergunta}</p>

            ${q.ajuda ? `
                <div class="w3-center w3-margin-top">
                    <button onclick="mostrarDica()" class="w3-button w3-light-grey w3-text-teal w3-round-large w3-small w3-border">
                        💡 <b>DICA DO PROFESSOR</b>
                    </button>
                </div>` : ''}

            <div class="w3-margin-top grupo-respostas">
                ${gerarAlternativas(q.alternativas)}
            </div>

            <button onclick="verificar()" id="btn-verificar" class="btn-acao-duvid w3-margin-top">
                <b>VERIFICAR RESPOSTA</b>
            </button>
        </div>
    `;

    // 3. Pós-renderização (Reaplicar estilos/fontes)
    if (typeof inicializarControleFonte === "function") inicializarControleFonte();
}



// Funções auxiliares para manter a função principal limpa
const gerarBlocoApoio = (q) => !q.texto_apoio ? '' : `
    <div class="w3-panel w3-leftbar w3-sand w3-margin w3-padding-16">
        <p style="font-style: italic; line-height: 1.6;">${q.texto_apoio}</p>
        ${q.fonte_apoio ? `<p class="w3-small w3-opacity w3-right-align">— ${q.fonte_apoio}</p>` : ''}
    </div>`;

const gerarImagemApoio = (q) => !q.imagem_apoio ? '' : `
    <div class="w3-center w3-margin-bottom">
        <img src="${q.imagem_apoio}" class="w3-image w3-card" style="max-height:100%; width:100%; object-fit:contain">
    </div>`;

const gerarAlternativas = (alternativas) => alternativas.map((alt, i) => `
    <div class="item-resposta w3-margin-bottom">
        <input type="radio" name="opcao" id="opt${i}" value="${i}" class="radio-duvid">
        <label for="opt${i}" class="card-opcao w3-block">
            <span><b>${String.fromCharCode(97 + i)})</b> ${alt}</span>
        </label>
    </div>`).join('');






// FUNÇÃO PARA EXIBIR A DICA
function mostrarDica() {
    const q = questoes[indiceAtual];
    if (q.ajuda && q.ajuda.texto) {
        // Localiza o parágrafo dentro da div e injeta o texto do JSON
        document.getElementById('texto-da-dica').innerText = q.ajuda.texto;
        // Faz a div aparecer
        document.getElementById('modal-dica').style.display = 'block';
    }
}




function verificar() {

    const selecionada = document.querySelector('input[name="opcao"]:checked');
    const btnVerificar = document.getElementById('btn-verificar');

    // Validação inicial
    if (!selecionada) {
        exibirErroSelecao(btnVerificar);
        return;
    }

    const resp = parseInt(selecionada.value);
    const q = questoes[indiceAtual];
    const isCorreto = (resp === q.correta);

    // 1. Visual: Pinta as respostas
    aplicarEstiloRespostas(resp, q.correta);

    // 2. Gamificação: Sons, Pontos e Level Up
    processarRecompensa(isCorreto);

    // 3. Feedback: Monta a barra de explicação
    exibirPainelFeedback(isCorreto, q);

    // 4. Bloqueia botão e desce a tela
    if (btnVerificar) btnVerificar.disabled = true;
    scrollSuaveFeedback();
}

// Função auxiliar para o painel inferior
function exibirPainelFeedback(isCorreto, questao) {
    const feedback = document.getElementById('barra-feedback');
    const msg = document.getElementById('feedback-msg');
    const txt = document.getElementById('feedback-txt');

    feedback.className = `w3-bottom w3-container w3-padding-16 w3-animate-bottom ${isCorreto ? 'w3-green' : 'w3-amber'}`;

    msg.innerHTML = isCorreto
        ? `<b><i class='fa fa-smile-o'></i> ${typeof getFraseSucesso === "function" ? getFraseSucesso() : "Boa!"}</b>`
        : `<b>Opa! A resposta correta é a (${String.fromCharCode(65 + questao.correta)})</b>`;

    txt.innerHTML = `
        <div class="comentario-box">
            ${questao.comentario}
        </div>
    `;
    feedback.classList.remove('w3-hide');
}



function scrollSuaveFeedback() {
    setTimeout(() => {
        const feedbackTxt = document.getElementById('feedback-txt');
        if (feedbackTxt) feedbackTxt.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
}

// 1. Lógica para quando o aluno esquece de marcar
function exibirErroSelecao(btn) {
    if (typeof playSom === "function") playSom('erro');
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = "<i class='fa fa-exclamation-triangle'></i> ESCOLHA UMA OPÇÃO!";
    btn.classList.add('btn-erro-animado', 'shake-erro');
    if (navigator.vibrate) navigator.vibrate(100);

    setTimeout(() => {
        btn.innerHTML = textoOriginal;
        btn.classList.remove('btn-erro-animado', 'shake-erro');
    }, 2000);
}

// 2. Pintar as opções na tela
function aplicarEstiloRespostas(respUsuario, correta) {
    const todasOpcoes = document.querySelectorAll('.opcao-container');
    todasOpcoes.forEach((div, index) => {
        if (index === correta) {
            div.classList.add('w3-pale-green', 'w3-border-green', 'w3-leftbar');
        }
        if (index === respUsuario && respUsuario !== correta) {
            div.classList.add('w3-pale-red', 'w3-border-red', 'w3-leftbar');
        }
    });
}




function processarRecompensa(isCorreto) {
    if (isCorreto) {
        // 2. A variável 'nota' serve APENAS para contar acertos (1, 2, 3...)
        // Ela NÃO deve ser usada para somar globinhos aqui.
        nota++;

        // 3. Chama o banco APENAS UMA VEZ
        if (typeof DuvidDB !== "undefined") {
            // Se o saldo pular 20 aqui, o erro está DEFINITIVAMENTE 
            // dentro da função addGlobinhos no duvid-core.js
            DuvidDB.addGlobinhos(RECOMPENSA_QUESTOES);
        }

    } else {
        // 3. O "ELSE" é o erro! Como não vai para o banco, o som tem que ser aqui:
        if (typeof playSom === "function") {
            playSom('erro');
        }

        // Opcional: Feedback visual de erro se você tiver a função
        if (typeof feedbackVisualErro === "function") {
            feedbackVisualErro();
        }
    }



}

function proxima() {
    document.getElementById('barra-feedback').classList.add('w3-hide');
    indiceAtual++;

    // Faz a página voltar para o topo para ler a nova questão
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    if (indiceAtual < questoes.length) {
        renderizarQuestao();
    } else {
        finalizar();
    }
}


function finalizar() {
    // 1. Cálculos de Performance
    const total = questoes.length;
    const media = (nota / total) * 10;
    const aprovado = media >= 6;

    // 2. Ações de Estado e Persistência (Cérebro)
    concluirSimuladoNoSistema(aprovado);

    // 3. Efeitos de Áudio e Visual (Sentidos)
    dispararEfeitosFinais(aprovado);

    // 4. Mudança de Tela (Interface)
    exibirTelaDeResultado(aprovado, total);
}

// --- FUNÇÕES AUXILIARES (As peças de baixo nível) ---

function concluirSimuladoNoSistema(aprovado) {
    const barra = document.getElementById('barra-progresso-simulado');
    if (barra) barra.style.width = "100%";

    if (typeof salvarProgressoFinal === "function") {
        salvarProgressoFinal(aprovado);
    }
}

function dispararEfeitosFinais(aprovado) {
    if (typeof playSomFinal === "function") playSomFinal(aprovado);

    if (aprovado && typeof dispararComemoracao === "function") {
        dispararComemoracao();
    }
}

function exibirTelaDeResultado(aprovado, total) {
    // Esconde o container de perguntas
    document.getElementById('container-questao')?.classList.add('w3-hide');

    // Mostra e renderiza o resultado
    const resContainer = document.getElementById('resultado-final');
    if (resContainer) {
        resContainer.classList.remove('w3-hide');
        resContainer.innerHTML = gerarHtmlResultado(aprovado, total);
    }
}


// Gera o HTML da tela final
function gerarHtmlResultado(passou, total) {
    return `
        <div class="w3-container w3-padding-32 w3-center w3-animate-zoom">
            <div class="w3-margin-bottom pulse">
                <img src="../../../fotoIndex/globinhoPe.png" width="80" height="80" 
                     style="filter: ${passou ? 'none' : 'grayscale(100%)'};">
            </div>

            <h2 class="${passou ? 'w3-text-green' : 'w3-text-orange'} fontePixel">
                ${passou ? '🎉 SIMULADO CONCLUÍDO!' : '👍 VALEU O ESFORÇO!'}
            </h2>
            
            <div class="w3-padding-16">
                <p class="w3-xlarge">Você acertou <b>${nota}</b> de ${total} questões!</p>
                <p class="w3-text-grey" style="font-style: italic;">
                    ${passou ? 'Excelente! Você dominou este conteúdo.' : 'Que tal revisar os pontos onde teve dúvida?'}
                </p>
            </div>

            <div class="w3-container w3-padding-24">
                <div class="w3-center">
                    <button onclick="location.reload()" class="w3-button ${passou ? 'w3-light-grey' : 'w3-blue'} w3-round-large w3-margin-bottom btn-final">
                        🔄 REFAZER SIMULADO
                    </button>
                </div>
                <div class="w3-center">
                    <button onclick="window.location.href='/home.html'" class="w3-button w3-green w3-round-large btn-final">
                        🏠 VOLTAR PARA A HOME
                    </button>
                </div>
            </div>
        </div>`;
}


// Salva os dados no DuvidDB usando Constantes
function salvarProgressoFinal(passou) {
    if (typeof aulaID !== "undefined" && aulaID && typeof DuvidDB !== "undefined") {

        // TROCA: Sai 'questoes' (texto fixo) -> Entra TIPO_CONCLUSAO.QUESTOES (variável global)
        DuvidDB.salvarConclusao(aulaID, TIPO_CONCLUSAO.QUESTOES);

        if (passou) {
            DuvidDB.addGlobinhos(RECOMPENSA_GERAL); // Bônus por passar no simulado

        }
    } else {
        console.warn("[RPG] Erro ao salvar: aulaID ou DuvidDB não encontrados.");
    }
}