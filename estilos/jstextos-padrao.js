document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id) {
        aulaID = id;

        // 1. Verifica status e metadados (Título/Conteúdo)
        if (typeof verificarStatusAula === "function") {
            verificarStatusAula(id);
        }

        if (typeof injetarMetadadosAula === "function") {
            injetarMetadadosAula();
        }

        // 2. ATUALIZAÇÃO ÚNICA DA INTERFACE
        // Como o Core já está carregado, uma única chamada basta.
        if (typeof atualizarInterface === "function") {
            atualizarInterface();
        }

        // 3. Opcional: Um único delay curto de segurança
        // apenas se o seu JSON de metadados demorar a carregar o DOM.
        setTimeout(() => {
            if (typeof atualizarInterface === "function") atualizarInterface();
        }, 100);
    }

    // 4. Botão discreto "Salvar PDF" no primeiro tópico (cabeçalho da aula)
    injetarBotaoSalvarPDF();
});


// --- BOTÃO DISCRETO DE SALVAR EM PDF ---
// Injeta um link pequeno no primeiro .topico para o professor/aluno baixar o
// conteúdo da aula como PDF, usando o diálogo nativo de impressão do navegador.
function injetarBotaoSalvarPDF() {
    const primeiroTopico = document.querySelector('.topico');
    if (!primeiroTopico) return;
    if (primeiroTopico.querySelector('.btn-salvar-pdf')) return; // idempotente

    const wrapper = document.createElement('div');
    wrapper.className = 'btn-salvar-pdf-wrapper w3-center';
    wrapper.style.cssText = 'margin-top: 8px;';

    const link = document.createElement('a');
    link.className = 'btn-salvar-pdf w3-text-grey w3-small';
    link.style.cssText = 'cursor: pointer; text-decoration: none; border-bottom: 1px dotted #999;';
    link.innerHTML = '<i class="fa fa-file-pdf-o"></i> Salvar este texto em PDF';
    link.title = 'Abre o diálogo de impressão — escolha "Salvar como PDF"';
    link.onclick = (e) => {
        e.preventDefault();
        // Marca o body para o CSS @media print mostrar todos os tópicos
        document.body.classList.add('imprimindo-texto');
        window.print();
        // Remove a classe depois (Chrome dispara afterprint)
        setTimeout(() => {
            document.body.classList.remove('imprimindo-texto');
        }, 500);
    };

    wrapper.appendChild(link);

    // POSICIONAMENTO (em ordem de preferência):
    //   1. Logo após o painel "OUVIR AULA" (se existir <audio> no primeiro tópico)
    //   2. Antes do bloco Conteúdo/Objetivo (fallback)
    //   3. Antes do <hr> do primeiro tópico (fallback)
    //   4. Final do primeiro tópico (último recurso)
    const audio = primeiroTopico.querySelector('audio');
    const painelAudio = audio ? audio.closest('.w3-panel') : null;
    const blocoConteudo = primeiroTopico.querySelector('#descricao-aula')?.closest('.w3-container');
    const hr = primeiroTopico.querySelector('hr');

    if (painelAudio && painelAudio.parentNode === primeiroTopico) {
        painelAudio.insertAdjacentElement('afterend', wrapper);
    } else if (blocoConteudo && blocoConteudo.parentNode === primeiroTopico) {
        primeiroTopico.insertBefore(wrapper, blocoConteudo);
    } else if (hr && hr.parentNode === primeiroTopico) {
        primeiroTopico.insertBefore(wrapper, hr);
    } else {
        primeiroTopico.appendChild(wrapper);
    }
}




let nota = 0;
const fontes = ["Tahoma", "Verdana", "Arial"];
let tituloAulaGlobal = ""; // Variável que guardará o nome da aula
// ADICIONE ESTA LINHA AQUI:
let nomeEstudante = (typeof DuvidDB !== "undefined") ? DuvidDB.getNome() : "Estudante";



// --- MOTOR DE NAVEGAÇÃO (A que resolve o problema do container) ---
function MostrarProximo(botao) {
    // Acha o tópico pai, não importa quão fundo o botão esteja
    const topicoAtual = botao.closest('.topico');
    const proximoTopico = topicoAtual.nextElementSibling;

    if (proximoTopico && !proximoTopico.classList.contains('mostrar')) {
        proximoTopico.classList.add('mostrar');
        proximoTopico.scrollIntoView({ behavior: 'smooth', block: 'start' });

        atualizarInterface();
        addProgressBar();
        botao.style.display = 'none';
    }
}



// ── Botões auxiliares ──────────────────────────────────────────
function MostraButton(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'block';
}
function EscondeButton(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

// ── Exercício de múltiplas checkboxes ─────────────────────────
// Uso: confereBox('acertou!', 'resp40', 'globinho40', [1,2,4])
// respostasCorretas: array com os índices (1-based) das checkboxes certas
// O botão "Próximo" (id="buttoncheck2") só aparece quando o aluno acerta tudo
function confereBox(mensagem, idFrase, idGlobinho, respostasCorretas) {
    const form     = document.getElementById('check');
    const frase    = document.getElementById(idFrase);
    const globo    = document.getElementById(idGlobinho);

    // Coleta quais checkboxes estão marcadas (índice 1-based)
    const checkboxes = form
        ? form.querySelectorAll('input[type="checkbox"]')
        : document.querySelectorAll('input[type="checkbox"]');

    const marcadas = [];
    checkboxes.forEach((cb, i) => { if (cb.checked) marcadas.push(i + 1); });

    // Compara marcadas com corretas (tamanho + conteúdo)
    const corretas = respostasCorretas || [];
    const acertou  =
        marcadas.length === corretas.length &&
        marcadas.every(n => corretas.includes(n));

    if (acertou) {
        // Feedback positivo
        if (frase)  frase.innerHTML  = nomeEstudante + ', ' + mensagem + '.';
        if (globo)  globo.style.display = 'block';

        // Pontuação
        nota += 2;
        const notaEl = document.getElementById('notaFixa');
        if (notaEl) notaEl.innerHTML = nota.toFixed(1);

        // Áudio de acerto (se disponível)
        if (typeof Play === 'function') Play('../audio1.mp3');

        // Desabilita checkboxes e troca botões
        checkboxes.forEach(cb => cb.disabled = true);
        EscondeButton('buttoncheck1');
        MostraButton('buttoncheck2');

    } else {
        // Feedback negativo — mantém "Próximo" escondido
        if (frase) frase.innerHTML = nomeEstudante + ', marque apenas as opções corretas para prosseguir.';
        if (typeof Play2 === 'function') Play2('../audio2.mp3');
    }
}

function ProcessarResposta(selecionado, config) {
    let { correto, idFrase, idGlobo, nomeGrupo, mensagem, pontos } = config;
    const pts = parseFloat(pontos) || 10.0;

    // 1. LÓGICA DE TEXTO
    if (mensagem.includes("{TITULO}")) {
        mensagem = mensagem.replace("{TITULO}", tituloAulaGlobal || "este tema");
    }

    // 2. O GRANDE GATILHO (Substitui todo aquele bloco de IFs)
    executarGatilhoResultado(correto, pts);

    // 3. PONTUAÇÃO INTERNA (Para o modal final da aula)
    nota += correto ? pts : 2.0;

    // 4. INTERFACE (Funções que já limpamos antes)
    estilizarGrupoRadios(nomeGrupo, selecionado, correto);
    exibirFeedbackQuestao(idFrase, idGlobo, mensagem, correto);
}


function exibirFeedbackQuestao(idFrase, idGlobo, mensagem, correto) {
    const globo = document.getElementById(idGlobo);
    const frase = document.getElementById(idFrase);
    const nome = (typeof DuvidDB !== "undefined") ? DuvidDB.getNome() : "Estudante";

    // 1. O Globinho (Lógica de exibição e cor)
    if (globo) {
        globo.style.display = "block";
        globo.style.filter = correto ? "none" : "grayscale(100%)";
        // Se acertou, faz o globinho da questão também dar um pulinho
        if (correto) globo.classList.add('pulo-elastico');
    }

    // 2. A Frase (Montagem do texto)
    if (frase) {
        frase.innerHTML = `<b>${nome}</b>, ${mensagem}`;
        frase.classList.add('w3-animate-opacity'); // Efeito suave de aparecimento
    }
}

function estilizarGrupoRadios(nomeGrupo, selecionado, correto) {
    const opcoes = document.getElementsByName(nomeGrupo);

    opcoes.forEach(opt => {
        opt.disabled = true; // Trava a questão

        if (opt.value === "correto") {
            aplicarEstiloResultado(opt, 'correto');
        } else if (opt === selecionado && !correto) {
            aplicarEstiloResultado(opt, 'errado');
        } else {
            // Deixa as outras opções "apagadinhas"
            opt.style.opacity = "0.5";
            opt.style.filter = "grayscale(1)";
        }
    });
}




function aplicarEstiloResultado(el, tipo) {
    const cores = {
        correto: { bg: "#e8f5e9", border: "#69CB60", texto: "#2e7d32" },
        errado: { bg: "#ffebee", border: "#ef5350", texto: "#c62828" }
    };
    const c = cores[tipo];

    el.style.backgroundColor = c.bg;
    el.style.borderColor = c.border;
    el.style.color = c.texto;

    // Pinta o label (texto da opção) se ele existir
    const label = el.nextElementSibling;
    if (label && label.tagName === "LABEL") {
        label.style.color = c.texto;
        label.style.fontWeight = "bold";
    }
}



function validarRadio(btnConfirmar, nomeGrupo, idFrase, idGlobo, msg, pts) {
    // 1. Busca a seleção
    const selecionado = Array.from(document.getElementsByName(nomeGrupo)).find(r => r.checked);

    // 2. SE NÃO SELECIONOU: Chama o especialista do UI
    if (!selecionado) {
        avisoSelecaoPendente(btnConfirmar);
        return;
    }

    // 3. SE SELECIONOU: Processa a resposta normalmente
    const ehCorreto = selecionado.value === "correto";

    ProcessarResposta(selecionado, {
        correto: ehCorreto,
        idFrase: idFrase,
        idGlobo: idGlobo,
        nomeGrupo: nomeGrupo,
        mensagem: ehCorreto ? getFraseSucesso() : msg,
        pontos: pts
    });

    // 4. Finalização visual
    btnConfirmar.style.display = 'none';
    if (typeof MostrarProximo === "function") MostrarProximo(btnConfirmar);
}



function addProgressBar() {
    const barra = document.getElementById("progress");
    const txtBarra = document.getElementById("txtBarra");

    // 1. Conta quantos tópicos existem na aula atual
    const totalTopicos = document.querySelectorAll('.topico').length;

    // 2. Calcula quanto cada passo deve valer (ex: 100 / 11 = 9.09)
    const incremento = 100 / (totalTopicos - 1);

    // 3. Atualiza o valor
    let novoValor = parseFloat(barra.value) + incremento;

    // 4. Garante que não passe de 100 e arredonda para o texto
    if (novoValor > 99) novoValor = 100; // Ajuste para arredondamento final

    barra.value = novoValor;
    txtBarra.innerHTML = Math.round(novoValor) + "%";
}

function mostraCinza() {
    const params = new URLSearchParams(window.location.search);
    const aulaID = params.get('id');

    aplicarEstadoFinalAula();  // ✅ função global, chamada direta
    mostraBiblio();            // ✅ idem
    mostrarNota();             // ✅ idem

    if (aulaID && typeof DuvidDB !== "undefined") {
        const jaConcluiu = DuvidDB.estaConcluido(aulaID, TIPO_CONCLUSAO.TEXTO);
        if (!jaConcluiu) {
            DuvidDB.salvarConclusao(aulaID, TIPO_CONCLUSAO.TEXTO);
            DuvidDB.addGlobinhos(RECOMPENSA_TEXTO);
        }
    }

    if (typeof atualizarInterface === "function") atualizarInterface();
}



function aplicarEstadoFinalAula() {
    // Selecionamos TUDO o que queremos "desativar" de uma vez só
    const seletores = 'p, h1, h2, h3, h4, span, li, b, strong, i, a, label, img, button, input';
    const elementos = document.querySelectorAll(seletores);

    elementos.forEach(el => {
        // FILTRO DE EXCEÇÃO: Ignora Header, Modal e Bibliografia
        if (el.closest('.bibliografias') || el.closest('#id01') || el.closest('#header-placeholder')) {
            return; // Pula este elemento
        }

        // 1. Aplica a transição suave
        el.style.transition = "all 3s ease";

        // 2. Lógica por tipo de elemento
        if (el.tagName === 'IMG') {
            el.style.filter = "grayscale(100%)";
            el.style.opacity = "0.5";
        }
        else if (el.tagName === 'BUTTON' || el.tagName === 'INPUT') {
            el.disabled = true;
            el.style.cursor = "not-allowed";
            el.style.filter = "grayscale(0.8)";
        }
        else {
            // Textos em geral
            el.style.color = "#a0a0a0";
        }
    });
}





//Mostra a nota no final da aula
function mostrarNota() {
    const notaThreshold = 6;
    const modal = document.getElementById('id01');
    if (!modal) return;

    const passou = nota >= notaThreshold;
    const notaFormatada = nota.toFixed(1);

    // 1. ATUALIZAÇÃO DOS ELEMENTOS (Busca pelos IDs que criamos no HTML)

    // Título
    const titulo = document.getElementById('modal-titulo');
    if (titulo) titulo.innerText = passou ? '🎉 PARABÉNS!' : '👍 VALEU O ESFORÇO!';

    // Valor da Nota
    const notaDisplay = document.getElementById('modal-nota-valor');
    if (notaDisplay) notaDisplay.innerText = notaFormatada;

    // Frase Motivacional (Usa a função auxiliar que já criamos ou a getFrasePainel)
    const frase = document.getElementById('modal-frase-feedback');
    if (frase) {
        frase.innerText = passou ? getFrasePainel() : 'Que tal revisar o conteúdo para melhorar sua pontuação?';
    }

    // Imagem do Globinho (Filtro Cinza se não passar)
    const imgGlobinho = document.getElementById('modal-img-globinho');
    if (imgGlobinho) {
        imgGlobinho.style.filter = passou ? 'none' : 'grayscale(100%)';
    }

    // 2. DISPARO DE EFEITOS (O Gatilho Sênior que unificamos)
    if (typeof playSomFinal === "function") playSomFinal(passou);

    if (passou && typeof dispararComemoracao === "function") {
        dispararComemoracao();
        setTimeout(dispararComemoracao, 500);
    }

    // 3. EXIBIÇÃO
    modal.style.display = "block";

    // 4. SINCRONIZAÇÃO GLOBAL
    if (typeof atualizarInterface === "function") atualizarInterface();
}

function mostraBiblio() {
    const bibliografias = document.querySelectorAll(".bibliografias");

    // 1. Processamento Moderno (Iteração Única)
    bibliografias.forEach(bib => {
        bib.style.display = "block";
        bib.style.color = "black"; // Garante legibilidade pós-cinza
        bib.classList.add("w3-animate-opacity");
    });

    // 2. Scroll Inteligente (Usando o Maestro de UI)
    if (bibliografias.length > 0) {
        // Aguarda a transição do modal antes de rolar para as referências
        setTimeout(() => {
            if (typeof DuvidUI !== "undefined") {
                // Se você já moveu a função de scroll para o DuvidUI:
                DuvidUI.scrollParaElemento(bibliografias[0].id || 'final-da-aula');
            } else {
                // Fallback seguro caso ainda não tenha movido
                bibliografias[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 800);
    }
}

// Função para injetar os metadados da aula (Título e Descrição) a partir do JSON
async function injetarMetadadosAula() {
    // 1. Identifica o ano e a aula pela URL
    const path = window.location.pathname;
    const anoMatch = path.match(/(\d)ano/); // Pega o "1", "2" ou "3"
    const aulaArquivo = path.split('/').pop(); // Pega "tt1.html"

    if (!anoMatch) return;
    const ano = anoMatch[1];

    try {
        const aulas = await DuvidCache.get(`/js/aulas-${ano}ano.json`); // << NOVO

        // 2. Busca os dados da aula atual no JSON
        // Usa optional chaining (?.) para não quebrar se linkTexto for null
        // (ex: aulas de revisão que só têm questões, sem texto)
        if (!Array.isArray(aulas) || !aulaArquivo) return;
        const aulaDados = aulas.find(a => a.linkTexto?.includes(aulaArquivo));

        if (aulaDados) {
            tituloAulaGlobal = aulaDados.titulo;

            const tituloH1 = document.getElementById('h1');
            if (tituloH1) tituloH1.innerText = tituloAulaGlobal;

            document.title = `Duvid - ${tituloAulaGlobal}`;

            const desc = document.getElementById('descricao-aula');
            if (desc) desc.innerText = aulaDados.conteudo;

            const obj = document.getElementById('objetivo-aula');
            if (obj && aulaDados.objetivo) obj.innerText = aulaDados.objetivo;

            const audioSource = document.getElementById('audioSource');
            if (audioSource && aulaDados.audio) audioSource.src = aulaDados.audio;

            configurarSEOAutomatico(aulaDados.id, 'texto');

            await injetarBibliografiaAula(aulaDados.bibliografia);
            await injetarLinksAula(aulaDados.links);
        }
    } catch (e) {
        console.error("Erro ao injetar metadados:", e);
    }
  

}



function Aparecer(imagem, paragrafo) {

    document.getElementById(imagem).style.display = "block";
    document.getElementById(paragrafo).style.display = "block";


}


/**
 * Valida respostas abertas de forma flexível.
 * A resposta do aluno é aceita se CONTIVER o gabarito (case-insensitive).
 *
 * @param {string}      inputId    - ID do campo de texto
 * @param {string}      gabarito   - Palavra/frase correta esperada
 * @param {string}      feedbackId - ID do <p> onde exibir o retorno
 * @param {HTMLElement} btn        - O botão "Conferir" clicado
 * @param {string}      globinhoId - ID da imagem do globinho
 */
function validarAberta(inputId, gabarito, feedbackId, btn, globinhoId) {
    const inputEl    = document.getElementById(inputId);
    const feedbackEl = document.getElementById(feedbackId);
    const globoEl    = document.getElementById(globinhoId);

    const respostaUser = inputEl.value.toLowerCase().trim();

    // 1. Vazio
    if (respostaUser === '') {
        feedbackEl.innerHTML = "<span class='w3-text-red'>Escreva algo antes de conferir!</span>";
        if (typeof Play2 === 'function') Play2('../audio2.mp3');
        return;
    }

    // 2. Compara (contém o gabarito)
    if (respostaUser.includes(gabarito.toLowerCase())) {
        // ── ACERTO ──────────────────────────────────────────────
        inputEl.disabled = true;
        inputEl.classList.remove('w3-border-red');
        inputEl.classList.add('w3-pale-green');
        btn.style.display = 'none';

        feedbackEl.innerHTML = `<span class='w3-text-green'><b>Correto! ✔</b></span>`;

        if (globoEl) {
            globoEl.style.display  = 'inline-block';
            globoEl.style.filter   = 'none';
            globoEl.classList.add('pulo-elastico');
        }

        // Pontuação interna
        nota += 2;
        const notaEl = document.getElementById('notaFixa');
        if (notaEl) notaEl.innerHTML = nota.toFixed(1);

        if (typeof Play === 'function') Play('../audio1.mp3');
        if (typeof executarGatilhoResultado === 'function') executarGatilhoResultado(true, 2);

        // Libera o botão "Próximo" quando todo o bloco estiver resolvido
        verificarProgressoBloco(btn);

    } else {
        // ── ERRO ────────────────────────────────────────────────
        inputEl.classList.add('w3-border-red');
        feedbackEl.innerHTML = "<span class='w3-text-red'>Não é bem isso — tente novamente!</span>";
        if (typeof Play2 === 'function') Play2('../audio2.mp3');
    }
}

/**
 * Verifica se todos os inputs de texto do bloco já foram respondidos.
 * Quando sim, exibe o botão "Próximo" do tópico.
 *
 * @param {HTMLElement} [triggerEl] - Elemento que disparou a ação
 *   (usado para localizar o tópico pai via closest).
 *   Se omitido, busca o primeiro tópico visível.
 */
function verificarProgressoBloco(triggerEl) {
    // 1. Acha o tópico pai
    const topicoAtual = triggerEl
        ? triggerEl.closest('.topico')
        : document.querySelector('.topico.mostrar') ||
          document.querySelector('.topico:first-child');
    if (!topicoAtual) return;

    // 2. Conta apenas inputs de texto (ignora radios, checkboxes, botões)
    const perguntas   = topicoAtual.querySelectorAll('input[type="text"]');
    const respondidas = topicoAtual.querySelectorAll('input[type="text"]:disabled');

    if (perguntas.length === 0 || respondidas.length < perguntas.length) return;

    // 3. Exibe o botão "Próximo" do bloco
    const btnNext = topicoAtual.querySelector('.btnHide');
    if (btnNext) {
        btnNext.style.display = 'block';
        btnNext.classList.add('w3-animate-zoom');
        if (typeof Play === 'function') Play('../audio1.mp3');
    }
}

// Arquivo: js-textos.js

const injetarModalFinalizacao = () => {
    const modalHTML = `
    <div id="id01" class="w3-modal" style="z-index: 999;">
        <div class="w3-modal-content w3-card-4 w3-animate-zoom w3-round-large" style="max-width:450px">
            <div class="w3-container w3-padding-32 w3-center">
                <div class="w3-margin-bottom pulse">
                    <img id="modal-img-globinho" src="/fotoIndex/globinhoPe.png" width="64" height="64">
                </div>
                <h2 id="modal-titulo" class="fontePixel"></h2>
                <div class="w3-padding-16">
                    <p class="w3-xlarge">Você conquistou <br>
                        <span class="w3-text-green w3-xxlarge"><b id="modal-nota-valor">0.0</b></span> <br>
                        globinhos nesta aula!
                    </p>
                    <p id="modal-frase-feedback" class="w3-text-grey" style="font-style: italic;"></p>
                </div>
                <div class="w3-container w3-padding-16">
                    <button onclick="document.getElementById('id01').style.display='none'"
                        class="w3-button w3-green w3-round-large w3-block w3-margin-bottom w3-padding-large"
                        style="font-weight: bold;">
                        🎯 CONTINUAR ESTUDANDO
                    </button>
                    <!-- AQUI VOCÊ PODE ACRESCENTAR O BOTÃO DE QUESTÕES FACILMENTE NO FUTURO -->
                    <button id="btn-questoes-modal" style="display:none;" class="w3-button w3-orange w3-round-large w3-block w3-margin-bottom w3-padding-large">
                        📝 FAZER QUESTÕES
                    </button>
                    <button onclick="window.location.href='/home.html'"
                        class="w3-button w3-light-grey w3-round-large w3-block w3-padding-large"
                        style="font-weight: bold;">
                        🏠 VOLTAR PARA A HOME
                    </button>
                </div>
            </div>
        </div>
    </div>`;

    // Injeta o HTML no final do body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

// ================================================
// MÓDULO DE BIBLIOGRAFIA
// ================================================

/**
 * Busca o arquivo central de bibliografias
 * @returns {Object|null} objeto com todas as referências ou null
 */
async function carregarBibliografias() {
    try {
        const biblio = await DuvidCache.get('/js/bibliografias.json');
        return biblio || null;
    } catch (e) {
        console.error("Erro ao carregar bibliografias.json:", e);
        return null;
    }
}

/**
 * Filtra as referências de uma aula específica
 * @param {string[]} chaves - array de chaves da aula ex: ["MiltonSantos", "BNCC"]
 * @param {Object} biblio - objeto completo de bibliografias
 * @returns {Object[]} array de referências encontradas
 */
function filtrarBibliografiasAula(chaves, biblio) {
    if (!chaves || chaves.length === 0 || !biblio) return [];

    return chaves
        .map(chave => {
            const ref = biblio[chave];
            if (!ref) {
                console.warn(`Bibliografia não encontrada: "${chave}"`);
                return null;
            }
            if (!ref.texto || !ref.complemento) {
                console.warn(`Bibliografia incompleta: "${chave}"`);
                return null;
            }
            return { chave, ...ref };
        })
        .filter(ref => ref !== null);
}

/**
 * Gera o HTML de um card de referência
 * @param {Object} ref - objeto da referência
 * @returns {string} HTML do card
 */
function renderizarCardBibliografia(ref) {
    const cor = ref.cor || 'w3-green';
    const tag = ref.tag || 'Referência';
    const borderCor = cor.replace('w3-', '');

    return `
    <div class="w3-row w3-margin-bottom">
        <div class="w3-card-4 w3-white w3-border-left w3-border-${borderCor} w3-padding-16"
            style="border-left-width:8px !important; border-radius:0 10px 10px 0;">
            <div class="w3-container">
                <span class="w3-tag ${cor} w3-small fontePixel">${tag}</span>
                <p class="w3-large w3-margin-top">
                    ${ref.texto}
                    <span class="w3-opacity w3-medium">${ref.complemento}</span>
                </p>
            </div>
        </div>
    </div>`;
}

/**
 * Injeta as referências no container da página
 * @param {string[]} chaves - chaves da aula
 * @param {string} containerId - ID do elemento HTML alvo
 */
async function injetarBibliografiaAula(chaves, containerId = 'biblio-gerada') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!chaves || chaves.length === 0) {
        container.innerHTML = '';
        return;
    }

    const biblio = await carregarBibliografias();
    if (!biblio) {
        container.innerHTML = '';
        return;
    }

    const refs = filtrarBibliografiasAula(chaves, biblio);
    container.innerHTML = refs.map(renderizarCardBibliografia).join('');
}

// ================================================
// MÓDULO DE LINKS
// ================================================

/**
 * Busca o arquivo central de links
 * @returns {Object|null}
 */
async function carregarLinks() {
    try {
        const links = await DuvidCache.get('/js/links.json');
        return links || null;
    } catch (e) {
        console.error("Erro ao carregar links.json:", e);
        return null;
    }
}

/**
 * Filtra os links de uma aula específica
 * @param {string[]} chaves
 * @param {Object} links
 * @returns {Object[]}
 */
function filtrarLinksAula(chaves, links) {
    if (!chaves || chaves.length === 0 || !links) return [];

    return chaves
        .map(chave => {
            const link = links[chave];
            if (!link) {
                console.warn(`Link não encontrado: "${chave}"`);
                return null;
            }
            if (!link.texto || !link.url) {
                console.warn(`Link incompleto: "${chave}"`);
                return null;
            }
            return { chave, ...link };
        })
        .filter(link => link !== null);
}

/**
 * Gera o HTML de um postit
 * @param {Object} link
 * @returns {string}
 */
function renderizarPostit(link) {
    const cor = link.cor || 'w3-green';
    const corTexto = link.corTexto || 'w3-text-white';

    return `
    <div class="w3-col m6 w3-margin-bottom">
        <div class="postit-tp9 ${cor} w3-card-4 pulsar">
            <a href="${link.url}" target="_blank">
                <span class="${corTexto}">${link.texto}</span>
            </a>
        </div>
    </div>`;
}

/**
 * Injeta os links no container da página
 * @param {string[]} chaves
 * @param {string} containerId
 */
async function injetarLinksAula(chaves, containerId = 'links-gerados') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!chaves || chaves.length === 0) {
        container.innerHTML = '';
        return;
    }

    const links = await carregarLinks();
    if (!links) {
        container.innerHTML = '';
        return;
    }

    const refs = filtrarLinksAula(chaves, links);
    container.innerHTML = refs.map(renderizarPostit).join('');
}


// Chama a injeção automaticamente quando o script carregar
document.addEventListener('DOMContentLoaded', injetarModalFinalizacao);


// ── Frases aleatórias para a seção P&R ──────────────────────────────────────
const PR_FRASES = [
    "Essas perguntas parecem simples. Elas não são.",
    "Todo geógrafo começou com exatamente essas dúvidas.",
    "As perguntas que ninguém faz em voz alta, mas todo mundo tem.",
    "Pergunta boa não é a mais difícil. É a mais honesta.",
    "Antes de responder, você precisava saber o que perguntar.",
    "Não existe pergunta boba. Existe pergunta não feita.",
    "Questionar é o que separa quem entende do que passou os olhos.",
    "Toda descoberta começa com uma dúvida que alguém teve coragem de fazer.",
    "A ciência avança porque alguém achou que valia a pena perguntar.",
    "Se você teve essa dúvida, está no caminho certo.",
    "A pergunta que parece óbvia costuma ser a mais difícil de responder.",
    "Quem não pergunta, não aprende. Quem pergunta aprende mais."
];

function sortearFrasePR() {
    const el = document.getElementById('titulo-pr');
    if (!el) return;
    const i = Math.floor(Math.random() * PR_FRASES.length);
    el.textContent = PR_FRASES[i];
}

document.addEventListener('DOMContentLoaded', sortearFrasePR);