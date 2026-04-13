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
});




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


async function injetarMetadadosAula() {
    // 1. Identifica o ano e a aula pela URL
    const path = window.location.pathname;
    const anoMatch = path.match(/(\d)ano/); // Pega o "1", "2" ou "3"
    const aulaArquivo = path.split('/').pop(); // Pega "tt1.html"

    if (!anoMatch) return;
    const ano = anoMatch[1];

   try {
        const aulas = await DuvidCache.get(`/js/aulas-${ano}ano.json`); // << NOVO

        const aulaDados = aulas.find(a => a.linkTexto.includes(aulaArquivo));

        if (aulaDados) {
            tituloAulaGlobal = aulaDados.titulo;

            const tituloH1 = document.getElementById('h1');
            if (tituloH1) tituloH1.innerText = tituloAulaGlobal;

            document.title = `Duvid - ${tituloAulaGlobal}`;

            const desc = document.getElementById('descricao-aula');
            if (desc) desc.innerText = aulaDados.conteudo;

            configurarSEOAutomatico(aulaDados.id, 'texto');
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
 * Valida respostas abertas de forma flexível
 * @param {string} inputId - ID do campo de texto
 * @param {string} gabarito - Resposta correta esperada
 * @param {string} feedbackId - Onde exibir o texto de retorno
 * @param {HTMLElement} btn - O botão que foi clicado
 * @param {string} globinhoId - ID da imagem do globinho
 */
function validarAberta(inputId, gabarito, feedbackId, btn, globinhoId) {
    const inputElement = document.getElementById(inputId);
    const feedbackElement = document.getElementById(feedbackId);
    
    // 1. Tratamento da string (O "pulo do gato" sênior)
    // Converte para minúsculo e remove espaços inúteis no início/fim
    let respostaUser = inputElement.value.toLowerCase().trim();
    
    // 2. Lógica de validação
    if (respostaUser === "") {
        feedbackElement.innerHTML = "<span class='w3-text-red'>Escreva algo antes de conferir!</span>";
        playSom('erro'); // ou Play2("../audio2.mp3");
        return;
    }

    // Compara a resposta (pode usar regex se quiser aceitar "no noroeste" e "noroeste")
    if (respostaUser.includes(gabarito)) {
        // ACERTO
        inputElement.disabled = true;
        inputElement.classList.add("w3-pale-green");
        btn.style.display = 'none';
        
        feedbackElement.innerHTML = `<span class='w3-text-green'><b>Correto!</b> A resposta é ${gabarito}.</span>`;
        
        // Gamificação
        document.getElementById(globinhoId).style.display = "inline-block";
        executarGatilhoResultado(true, 10); // Função do seu UI.js que soma pontos e faz confete
        
        // Verifica se todas do bloco foram respondidas para mostrar o "Próximo"
        verificarProgressoBloco(); 
    } else {
        // ERRO
        inputElement.classList.add("w3-border-red");
        feedbackElement.innerHTML = "<span class='w3-text-red'>Tente novamente! Observe a rosa dos ventos.</span>";
        playSom('erro');
    }
}

/**
 * Verifica se todas as perguntas do tópico atual foram respondidas
 * para liberar o botão de próximo de forma automática.
 */
function verificarProgressoBloco() {
    // 1. Encontra o tópico que está visível no momento
    const topicoAtual = document.querySelector('.topico.mostrar');
    if (!topicoAtual) return;

    // 2. Conta quantos inputs de texto ou rádio existem neste tópico
    // (Ajuste os seletores conforme sua necessidade)
    const perguntas = topicoAtual.querySelectorAll('input[type="text"], .grupo-respostas');
    const totalPerguntas = perguntas.length;

    // 3. Conta quantos desses já foram "concluídos" (Inputs desativados)
    const respondidas = topicoAtual.querySelectorAll('input:disabled').length;

    // Se for um bloco de rádio, a lógica muda um pouco, 
    // mas para campos de texto desativados:
    if (respondidas >= totalPerguntas && totalPerguntas > 0) {
        // 4. Localiza o botão de próximo deste tópico específico e o exibe
        const btnNext = topicoAtual.querySelector('.btnShow[style*="display: none"], .btnHide');
        if (btnNext) {
            btnNext.style.display = 'block';
            btnNext.classList.add('w3-animate-zoom'); // Efeito visual de "liberado"
            
            // Opcional: Tocar um som de "Seção Concluída"
            if (typeof playSom === 'function') playSom('click'); 
             
        }
    }
}

// Arquivo: js-textos.js

const injetarModalFinalizacao = () => {
    const modalHTML = `
    <div id="id01" class="w3-modal" style="z-index: 999;">
        <div class="w3-modal-content w3-card-4 w3-animate-zoom w3-round-large" style="max-width:450px">
            <div class="w3-container w3-padding-32 w3-center">
                <div class="w3-margin-bottom pulse">
                    <img id="modal-img-globinho" src="../../../fotoIndex/globinhoPe.png" width="64" height="64">
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

// Chama a injeção automaticamente quando o script carregar
document.addEventListener('DOMContentLoaded', injetarModalFinalizacao);