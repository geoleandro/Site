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
        configurarSEOAutomatico(id, 'questao');



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
    <div class="w3-panel w3-leftbar w3-margin w3-padding-16 bloco-apoio-duvid">
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

function verificar() {
    const selecionada = document.querySelector('input[name="opcao"]:checked');
    const btnVerificar = document.getElementById('btn-verificar');

    // 1. VALIDAÇÃO
    if (!selecionada) {
        if (typeof avisoSelecaoPendente === "function") {
            avisoSelecaoPendente(btnVerificar);
        } else if (typeof DuvidUI !== "undefined") {
            DuvidUI.avisoSelecaoPendente(btnVerificar);
        }
        return;
    }

    const resp = parseInt(selecionada.value);
    const q = questoes[indiceAtual];
    const isCorreto = (resp === q.correta);

    // 2. INTERFACE: Pinta as respostas (Verde ou Vermelho)
    if (typeof DuvidUI !== "undefined") {
        DuvidUI.estilizarResultadoQuestao(resp, q.correta);
    }

    // 3. GAMIFICAÇÃO & PONTUAÇÃO (Lógica de Acerto ou Erro)
    // 3. O GRANDE GATILHO (A única chamada de efeito/pontos necessária)
    if (typeof DuvidUI !== "undefined" && typeof DuvidUI.executarGatilhoResultado === "function") {
        // Se acertou, passa os pontos da constante. Se errou, passa 0.
        const pontosParaDar = isCorreto ? (typeof RECOMPENSA_QUESTOES !== "undefined" ? RECOMPENSA_QUESTOES : 10) : 0;
        
        // Esta função abaixo já faz TUDO: som, confete, erro, salvar pontos e girar a moeda
        DuvidUI.executarGatilhoResultado(isCorreto, pontosParaDar);
    }

    // 4. CONTROLE LOCAL: Para o modal de conclusão no final do simulado
    if (isCorreto) {
        nota++; 
    }

     this.atualizarInterface();

    // 5. EXIBIR PAINEL DE COMENTÁRIOS E SCROLL
    exibirPainelFeedback(isCorreto, q);

    if (btnVerificar) btnVerificar.disabled = true;

    // Scroll suave para o comentário do professor
    if (typeof DuvidUI !== "undefined") {
        DuvidUI.scrollParaElemento('feedback-txt', 'center');
    }
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






function processarRecompensa(isCorreto) {
    if (isCorreto) {
        nota++; // Mantemos o contador interno para o modal final
    }

    // O GRANDE GATILHO (A única linha necessária)
    // Ele já cuida de: Som, Confete, Giro do Globinho, Salvar Pontos e Atualizar Interface
    if (typeof executarGatilhoResultado === "function") {
        const pontos = isCorreto ? (typeof RECOMPENSA_QUESTOES !== "undefined" ? RECOMPENSA_QUESTOES : 10) : 0;
        executarGatilhoResultado(isCorreto, pontos);
    } else {
        // Fallback caso o UI não carregue (segurança)
        if (typeof playSom === "function") playSom(isCorreto ? 'acerto' : 'erro');
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
    const total = questoes.length;
    const acertos = nota; // 'nota' aqui são os acertos acumulados
    const aprovado = (acertos / total) >= 0.6; // 60% de aproveitamento

    // 1. Dados e Persistência
    if (typeof DuvidDB !== "undefined" && typeof aulaID !== "undefined") {
        DuvidDB.salvarConclusao(aulaID, TIPO_CONCLUSAO.QUESTOES);
        if (aprovado) DuvidDB.addGlobinhos(RECOMPENSA_GERAL);
    }

    // 2. Interface (Chama o Maestro)
    if (typeof DuvidUI !== "undefined") {
        DuvidUI.exibirModalSimulado(aprovado, acertos, total);
    }
}

// --- FUNÇÕES AUXILIARES (As peças de baixo nível) ---

