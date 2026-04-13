let questoes = [];
let indiceAtual = 0;
let nota = 0;
let aulaID = ""; // Variável global
// << NOVO: sistema de vidas
let vidas = 3;
const TOTAL_VIDAS = 3;
const BONUS_VIDAS = 20; // globinhos extras por terminar sem perder vida

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
        const url = `/questoes/${anoPasta}/${id}.json`;

        const dadosBrutos = await DuvidCache.get(url); // << NOVO

        // Embaralha uma cópia — não o original cacheado
        questoes = embaralharArray([...dadosBrutos]); // << spread para não mutar o cache
        renderizarQuestao();
        configurarSEOAutomatico(id, 'questao');

    } catch (error) {
        console.error("Erro ao carregar questões:", error);
        document.getElementById('container-questao').innerHTML = "Erro ao carregar questões.";
    }
}





function embaralharArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- FUNÇÃO PRINCIPAL ---
function renderizarQuestao() {
    const q = questoes[indiceAtual];
    const container = document.getElementById('container-questao');
    if (!container || !q) return;

    // Progresso
    const porc = ((indiceAtual + 1) / questoes.length) * 100;
    const progressBarr = document.getElementById('barra-progresso-simulado');
    if (progressBarr) progressBarr.style.width = `${porc}%`;

    // Montagem do Layout usando as funções separadas
    container.innerHTML = `
        <div class="w3-animate-right w3-padding-24">
            
            ${gerarHeader(q, indiceAtual)}
            
            ${gerarInfoInstituicao(q)}

            ${gerarTags(q.tags)}

            ${gerarBlocoApoio(q)}
            
            ${gerarImagemApoio(q)}
            
            <p class="w3-large w3-padding">${q.pergunta}</p>

        

            <div class="w3-margin-top grupo-respostas">
                ${gerarAlternativas(q.alternativas)}
            </div>

            <button onclick="verificar()" id="btn-verificar" class="btn-acao-duvid w3-margin-top">
                <b>VERIFICAR RESPOSTA</b>
            </button>
        </div>
    `;

    if (typeof inicializarControleFonte === "function") inicializarControleFonte();
}


// 1. Função para o Título e Nível
const gerarHeader = (q, indice) => `
    <div class="duvid-coracoes-container">
        ${gerarCoracoes()}
         <span id="aviso-vidas-questao" class="aviso-vidas"></span>
    </div>
    <div class="duvid-header-questao">
        <h4 class="duvid-titulo-questao"><b>Questão ${indice + 1}</b></h4>
        <span class="duvid-badge-dificuldade ${definirClasseDificuldade(q.dificuldade)}">
            NÍVEL: ${q.dificuldade || 'MÉDIO'}
        </span>
    </div>
`;

// Função auxiliar que gera os corações com base no estado atual
const gerarCoracoes = () => {
    let html = '';
    for (let i = 0; i < TOTAL_VIDAS; i++) {
        const perdido = i >= vidas;
        html += `<span class="coracao-questao ${perdido ? 'perdido' : ''}">❤️</span>`;
    }
    return html;
};

// 2. Função para Instituição e Ano (Com o padding solicitado)
const gerarInfoInstituicao = (q) => `
    <div class="duvid-info-instituicao">
        <span class="w3-text-grey w3-small"><b>${q.instituicao || ''} ${q.ano || ''}</b></span>
    </div>
`;

// 3. Função para o Botão de Dica
const gerarBotaoDica = (q) => {
    if (!q.ajuda) return '';
    return `
        <div class="w3-center w3-margin-top w3-margin-bottom">
            <button onclick="mostrarDica()" class="w3-button w3-light-grey w3-text-teal w3-round-large w3-small w3-border">
                💡 <b>DICA DO PROFESSOR</b>
            </button>
        </div>
    `;
};

// Função auxiliar para a cor da dificuldade
const definirClasseDificuldade = (dif) => {
    const d = (dif || 'médio').toLowerCase();
    if (d.includes('fácil') || d.includes('facil')) return 'dificuldade-facil';
    if (d.includes('difícil') || d.includes('dificil')) return 'dificuldade-dificil';
    return 'dificuldade-medio';
};

const gerarTags = (tags) => {
    if (!tags || tags.length === 0) return '';
    const badges = tags.map(tag => `<span class="duvid-tag-assunto">#${tag}</span>`).join('');
    return `<div class="container-tags">${badges}</div>`; // Usando a nova classe aqui
};

// Funções auxiliares para manter a função principal limpa
const gerarBlocoApoio = (q) => {
    if (!q.texto_apoio) return '';

    // .trim() remove os espaços vazios invisíveis do começo e do fim
    const textoLimpo = q.texto_apoio.trim();

    return `
    <div class="duvid-bloco-apoio">
        <div class="duvid-texto-citacao">${textoLimpo}</div>

        ${q.fonte_apoio ? `
            <div class="duvid-fonte-texto">
                — ${q.fonte_apoio}
            </div>` : ''}
    </div>`;
};

const gerarImagemApoio = (q) => {
    if (!q.imagem_apoio) return '';

    const criarBloco = (img, legenda) => `
            <div class="w3-center">
                <div class="duvid-img-container">
                    <img src="${img}" class="duvid-img-principal" alt="Apoio Pedagógico">
                    
                    ${legenda ? `
                        <div class="duvid-legenda-box">
                            <p class="duvid-legenda-texto">
                                ${legenda}
                            </p>
                        </div>` : ''}
                </div>
            </div>
        `;

    let htmlFinal = criarBloco(q.imagem_apoio, q.legenda_imagem);

    if (q.imagem_apoio_2) {
        htmlFinal += criarBloco(q.imagem_apoio_2, q.legenda_imagem_2);
    }

    return htmlFinal;
};

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
    if (!q.ajuda) return;

    let painelDica = document.getElementById('painel-dica-container');

    if (!painelDica) {
        // Encontra o container do botão de dica
        const btnDica = document.querySelector('button[onclick="mostrarDica()"]').parentNode;

        btnDica.insertAdjacentHTML('afterend', `
                <div id="painel-dica-container" class="w3-animate-opacity">
                    <div class="duvid-painel-dica w3-card-2">
                        <button onclick="this.parentElement.parentElement.style.display='none'" 
                                class="duvid-dica-fechar">&times;</button>
                        
                        <h5 class="duvid-dica-titulo">
                            <i class="fa fa-lightbulb-o"></i> <b>Vamos analisar...</b>
                        </h5>
                        
                        <p class="w3-small" id="texto-dica-conteudo"></p>
                    </div>
                </div>
            `);
        painelDica = document.getElementById('painel-dica-container');
    }

    // Injeta o texto e exibe
    document.getElementById('texto-dica-conteudo').innerText = q.ajuda;
    painelDica.style.display = 'block';

    // Scroll suave
    painelDica.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}


function verificar() {
    const selecionada = document.querySelector('input[name="opcao"]:checked');
    const btnVerificar = document.getElementById('btn-verificar');

    if (!selecionada) {
        avisoSelecaoPendente(btnVerificar);
        return;
    }

    const resp = parseInt(selecionada.value);
    const q = questoes[indiceAtual];
    const isCorreto = (resp === q.correta);

    if (isCorreto) {
        // ACERTO — mostra resposta correta normalmente
        DuvidUI.estilizarResultadoQuestao(resp, q.correta);
        DuvidUI.executarGatilhoResultado(true, RECOMPENSA_QUESTOES);
        nota++;
    } else {
        // ERRO — não revela a resposta, só some as alternativas
        perderVida();
        DuvidUI.executarGatilhoResultado(false, 0);

        // Esmaece todas as alternativas sem marcar a correta
        document.querySelectorAll('.item-resposta').forEach(item => {
            item.style.opacity = '0.3';
            item.style.filter = 'grayscale(1)';
            const radio = item.querySelector('input');
            if (radio) radio.disabled = true;
        });
    }

    exibirPainelFeedback(isCorreto, q);
    if (btnVerificar) btnVerificar.disabled = true;
    DuvidUI.scrollParaElemento('feedback-txt', 'center');
}

function perderVida() {
    if (vidas <= 0) return;
    vidas--;

    // Atualiza corações já renderizados
    const coracoes = document.querySelectorAll('.coracao-questao');
    coracoes.forEach((c, i) => {
        if (i >= vidas) c.classList.add('perdido');
    });

    // Shake no container
    const container = document.querySelector('.duvid-coracoes-container');
    if (container) {
        container.classList.add('shake-erro');
        setTimeout(() => container.classList.remove('shake-erro'), 500);
    }

    // Aviso contextual
    const aviso = document.getElementById('aviso-vidas-questao');
    if (aviso) {
        aviso.innerText = vidas === 1 ? '❗ Última vida!' : '';
        aviso.style.display = vidas <= 1 ? 'inline' : 'none';
    }
}




// Função auxiliar para o painel inferior
function exibirPainelFeedback(isCorreto, questao) {
    const feedback = document.getElementById('barra-feedback');
    const msg = document.getElementById('feedback-msg');
    const txt = document.getElementById('feedback-txt');

    feedback.className = `w3-bottom w3-container w3-padding-16 w3-animate-bottom ${isCorreto ? 'w3-green' : 'w3-amber'}`;

    if (isCorreto) {
        // ACERTO — mensagem de sucesso + comentário completo do professor
        msg.innerHTML = `<b><i class='fa fa-smile-o'></i> ${getFraseSucesso()}</b>`;
        txt.innerHTML = `
            <div class="comentario-box">
                ${questao.comentario}
                ${gerarImagemComentario(questao)}
            </div>
        `;
    } else {
        // ERRO — mensagem neutra + só a dica, sem revelar resposta
      msg.innerHTML = `<b><i class='fa fa-search'></i> ${getFraseAnalise()}</b>`;

        // Se tiver dica, mostra ela. Se não tiver, mensagem genérica.
        txt.innerHTML = questao.ajuda
            ? `<div class="duvid-painel-dica w3-card-2">
                   <h5 class="duvid-dica-titulo">
                       <i class="fa fa-lightbulb-o"></i> <b>Vamos analisar...</b>
                   </h5>
                   <p class="w3-small">${questao.ajuda}</p>
               </div>`
            : `<p class="w3-small w3-text-grey">
                   Revise o conteúdo desta aula e tente novamente!
               </p>`;
    }

    feedback.classList.remove('w3-hide');
}



const gerarImagemComentario = (q) => {
    if (!q.imagem_comentario) return '';

    return `
        <div class="duvid-container-comentario">
            <img src="${q.imagem_comentario}" class="duvid-img-comentario" alt="Reforço Visual">
            ${q.legenda_comentario ? `
                <div class="duvid-legenda-box">
                    <p class="duvid-legenda-texto"><i>${q.legenda_comentario}</i></p>
                </div>` : ''}
        </div>
    `;
};



function scrollSuaveFeedback() {
    setTimeout(() => {
        const feedbackTxt = document.getElementById('feedback-txt');
        if (feedbackTxt) feedbackTxt.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
}




function proxima() {
    document.getElementById('barra-feedback').classList.add('w3-hide');
    indiceAtual++;

    // Vidas NÃO resetam aqui — carregam durante toda a sessão
    // Só resetam ao tentar novamente (no finalizar)

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (indiceAtual < questoes.length) {
        renderizarQuestao();
    } else {
        finalizar();
    }
}

function finalizar() {
    const total = questoes.length;
    const acertos = nota;
    const aprovado = (acertos / total) >= 0.6;
    const ganhouBonus = aprovado && vidas === TOTAL_VIDAS; // << vidas intactas

    // 1. Persistência
    if (typeof DuvidDB !== "undefined" && aulaID) {
        if (aprovado) {
            DuvidDB.salvarConclusao(aulaID, TIPO_CONCLUSAO.QUESTOES);
            DuvidDB.addGlobinhos(RECOMPENSA_GERAL);

            // Bônus extra por vidas intactas
            if (ganhouBonus) {
                DuvidDB.addGlobinhos(BONUS_VIDAS);
            }
        }
    }

    // 2. Modal
    if (typeof DuvidUI !== "undefined") {
        DuvidUI.exibirModalSimulado(aprovado, acertos, total, ganhouBonus);
    }
}

// Função global chamada pelo botão do modal
function tentarNovamente() {
    // Reseta tudo para uma sessão nova limpa
    indiceAtual = 0;
    nota = 0;
    vidas = TOTAL_VIDAS; // << vidas voltam para 3

    // Fecha o modal
    const modal = document.getElementById('id01');
    if (modal) modal.style.display = 'none';

    // Reembaralha — aluno não vê as mesmas questões na mesma ordem
    questoes = embaralharArray([...questoes]);

    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderizarQuestao();
}
// --- FUNÇÕES AUXILIARES (As peças de baixo nível) ---

