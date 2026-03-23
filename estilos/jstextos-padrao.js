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
let nomeEstudante = localStorage.getItem("duvid_nome") || "Estudante";



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

// --- MOTOR DE IDENTIFICAÇÃO ---
// function NomeAlunos(idResp, idInput) {
//     const input = document.getElementById(idInput);
//     const nome = input.value.trim();

//     // 1. Lógica Centralizada no Core
//     if (!DuvidDB.salvarNome(nome)) {
//         input.style.backgroundColor = "#EF5959";
//         playSom('erro'); 
//         return;
//     }

//     // 2. Visual: Apenas o que muda na tela
//     document.getElementById(idResp).innerHTML = `Bem-vindo(a), <b>${nome}</b>!`;

//     // Esconde os elementos de entrada (você pode criar uma classe CSS .esconder { display: none; })
//     ["caixaNomeAluno", idInput, "buttonConfira"].forEach(id => {
//         const el = document.getElementById(id);
//         if (el) el.style.display = "none";
//     });

//     // 3. Integração com outros componentes
//     if (typeof exibirSaudacao === 'function') exibirSaudacao(nome);

//     const nomeNoPainel = document.querySelector('#painel-usuario b');
//     if (nomeNoPainel) nomeNoPainel.innerText = nome;
// }
// Mostra a resposta correta. Deve ser colocado o nome para ser exibido na tela (resp), o id do globo, a desativação da questão e a mensagem

function ProcessarResposta(selecionado, config) {
    let { correto, idFrase, idGlobo, nomeGrupo, mensagem, pontos } = config;

    // Se a mensagem contiver {TITULO}, substitui pela nossa variável global
    if (mensagem.includes("{TITULO}")) {
        mensagem = mensagem.replace("{TITULO}", tituloAulaGlobal || "este tema");
    }

    // 1. Pontuação e Som
    // 1. Som e Efeitos via CORE
    if (correto) {
        playSom('acerto');
        dispararComemoracao();
        DuvidDB.addGlobinhos(parseFloat(pontos) || 10.0); // Só salva no banco global se acertar
        feedbackVisualAcerto();
    } else {
        playSom('erro'); // Toca o som de erro (aquele random que configuramos)
        // Não chamamos DuvidDB.addGlobinhos aqui para não inflar o saldo global com erros
    }

    // A variável 'nota' interna do script pode continuar para o cálculo do modal final
    nota += correto ? (parseFloat(pontos) || 10.0) : 2.0;

    // 2. Feedback no grupo de opções (Radios)
    document.getElementsByName(nomeGrupo).forEach(opt => {
        opt.disabled = true;
        if (opt.value === "correto") {
            aplicarEstiloResultado(opt, 'correto');
        } else if (opt === selecionado && !correto) {
            aplicarEstiloResultado(opt, 'errado');
        } else {
            opt.style.opacity = "0.6";
            opt.style.filter = "grayscale(0.6)";
        }
    });

    // 3. Interface: Globo e Frase
    const globo = document.getElementById(idGlobo);
    if (globo) {
        globo.style.display = "block";
        globo.style.filter = correto ? "none" : "grayscale(100%)";
    }

    const frase = document.getElementById(idFrase);
    if (frase) frase.innerHTML = `<b>${nomeEstudante || 'Estudante'}</b>, ${correto ? mensagem : mensagem}`; // <--- FRASE DINÂMICA

    atualizarInterface();

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
    // Busca qual rádio do grupo está marcado
    const selecionado = Array.from(document.getElementsByName(nomeGrupo)).find(r => r.checked);

    // --- VALIDAÇÃO DE OPÇÃO SELECIONADA ---
    if (!selecionado) {
        // A mágica acontece lá no Core agora!
        if (typeof playSom === "function") {
            playSom('erro');
        }

        // 2. Transforma o botão: Fica Amarelo + Tremedeira (Shake)
        btnConfirmar.innerHTML = "⚠️ Escolha uma opção!";
        btnConfirmar.classList.add('w3-amber', 'shake-erro');

        // 3. O "Pulo do Gato": Vibração no celular (se o aluno estiver no Android/iOS)
        if (navigator.vibrate) navigator.vibrate(100);

        // 4. Reseta o botão após 1.5 segundos
        setTimeout(() => {
            btnConfirmar.innerHTML = "Confirmar Resposta";
            btnConfirmar.classList.remove('w3-amber', 'shake-erro');
        }, 1500);

        return; // Mata a execução para não dar erro de "undefined" nas próximas linhas
    }

    const ehCorreto = selecionado.value === "correto";

    ProcessarResposta(selecionado, {
        correto: ehCorreto,
        idFrase: idFrase,
        idGlobo: idGlobo,
        nomeGrupo: nomeGrupo,
        // MUDANÇA AQUI: Chamamos a função do Core sem aspas
        mensagem: ehCorreto ? getFraseSucesso() : msg,
        pontos: pts
    });

    btnConfirmar.style.display = 'none'; // Esconde o botão após responder
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
    // 1. IDENTIFICAÇÃO (Lógica de ID)
    const params = new URLSearchParams(window.location.search);
    let aulaID = params.get('id');
    // ... (sua lógica de captura de ID aqui) ...

    // --- MUDANÇAS VISUAIS OBRIGATÓRIAS (Acontecem SEMPRE) ---
    desativarBotoes();   // Bloqueia cliques em rádios e botões de validar
    desativarTextos();   // Aplica o cinza (exceto bibliografia e modal)
    desativarImagens();  // Filtro PB nas imagens
    mostraBiblio();      // REVELA a div .bibliografias (display: block)
    mostrarNota();       // Abre o Modal com o feedback

    // 2. LOGICA DE DADOS (Ponto e Save)
    const jaConcluiu = localStorage.getItem(`concluido_texto_${aulaID}`) === "true";

    if (jaConcluiu) {
        console.log("Modo Revisão: Interface bloqueada para consulta.");
        atualizarInterface();
        return;
    }

    // 3. REGISTRO DE PRIMEIRA CONCLUSÃO
    if (aulaID) {
        DuvidDB.salvarConclusao(aulaID, 'texto');
         DuvidDB.addGlobinhos(10);
    }

    atualizarInterface();
}


function desativarBotoes() {
    // Seleciona todos os botões de questões (classe .p4 ou .btnShow)
    const botoesQuestoes = document.querySelectorAll('.p4, .btnShow');

    botoesQuestoes.forEach(btn => {
        btn.disabled = true;
        btn.style.transition = "0.8s"; // Transição suave ao travar
        btn.style.opacity = "1";        // GARANTE que não suma!
        btn.style.filter = "grayscale(0.7)"; // Feedback visual de 'trancado'
        btn.style.cursor = "not-allowed";
    });

    // console.log("Lição finalizada e botões trancados.");
}

function desativarTextos() {
    // 1. Selecionamos todos os tipos de texto e elementos clicáveis
    var todosElementos = document.querySelectorAll('p, h1, h2, h3, h4, span, li, b, strong, i, a, label');

    for (var i = 0; i < todosElementos.length; i++) {
        let el = todosElementos[i];

        // 2. FILTRO DE EXCEÇÃO: Ignora o que está na Bibliografia, no Modal e no Header
        if (!el.closest('.bibliografias') &&
            !el.closest('#id01') &&
            !el.closest('.w3-modal') &&
            !el.closest('#header-placeholder')) {

            el.style.transition = "color 3s ease, opacity 3s ease";
            el.style.color = "#a0a0a0"; // Cinza "desativado"
        }
        // 3. REFORÇO: Garante que o texto da bibliografia permaneça nítido
        else if (el.closest('.bibliografias')) {
            el.style.color = ""; // Volta para a cor padrão do CSS
        }
    }

    
}


//Mostra a nota no final da aula
// --- DENTRO DA FUNÇÃO mostrarNota ---
function mostrarNota() {
    const notaThreshold = 6;
    const modal = document.getElementById('id01');
    if (!modal) return;

    // 1. Definições de Sucesso
    const passou = nota >= notaThreshold;
    const notaFormatada = nota.toFixed(1);

    // 2. Montando o HTML interno do Modal de forma BONITA e ESPAÇADA
    const containerModal = modal.querySelector('.w3-modal-content');

    // Injetando o novo layout
    containerModal.innerHTML = `
        <div class="w3-container w3-padding-32 w3-center">
            <div class="w3-margin-bottom pulse">
                <img src="../../../fotoIndex/globinhoPe.png" width="80" height="80" 
                     style="filter: ${passou ? 'none' : 'grayscale(100%)'};">
            </div>

            <h2 class="fontePixel">${passou ? '🎉 PARABÉNS!' : '👍 VALEU O ESFORÇO!'}</h2>
            
            <div class="w3-padding-16">
                <p class="w3-xlarge">Você conquistou <br>
                   <span class="w3-text-green w3-xxlarge"><b>${notaFormatada}</b></span> <br>
                   globinhos nesta aula!
                </p>
                <p class="w3-text-grey" style="font-style: italic;">
                    ${passou ? getFrasePainel() : 'Que tal revisar o conteúdo para melhorar sua pontuação?'}
                </p>
            </div>

            <div class="w3-container w3-padding-24">
                <div class="w3-center">
                    <button onclick="document.getElementById('id01').style.display='none'" 
                            class="w3-button w3-green w3-round-large w3-margin-bottom" 
                            style="width: 85%; max-width: 300px; font-weight: bold; padding: 15px;">
                        🎯 CONTINUAR ESTUDANDO
                    </button>
                </div>

                <div class="w3-center">
                    <button onclick="window.location.href='/home.html'" 
                            class="w3-button w3-light-grey w3-round-large" 
                            style="width: 85%; max-width: 300px; font-weight: bold; padding: 12px;">
                        🏠 VOLTAR PARA A HOME
                    </button>
                </div>
            </div>
        </div>
    `;

    // 3. Efeitos de som e confete
    if (typeof playSomFinal === "function") playSomFinal(passou);
    if (passou && typeof dispararComemoracao === "function") dispararComemoracao();

    // Exibe o modal
    modal.style.display = "block";

    // Atualiza o saldo global se necessário
    if (typeof atualizarInterface === "function") atualizarInterface();
}



function mostraBiblio() {
    var b = document.getElementsByClassName("bibliografias");

    for (var i = 0; i < b.length; i++) {
        // 1. Torna visível
        b[i].style.display = "block";

        // 2. Adiciona a animação de fade-in do W3.CSS
        b[i].classList.add("w3-animate-opacity");

        // 3. Garante que a cor do texto na bibliografia seja legível (preto/padrão)
        // Isso anula qualquer efeito do desativarTextos que tenha "vazado"
        b[i].style.color = "black";
    }

    // 4. Scroll suave para a primeira bibliografia encontrada
    if (b.length > 0) {
        setTimeout(function () {
            b[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 800); // Aguarda um pouco a animação do modal/cinza antes de rolar
    }

  
    
}




function desativarImagens() {
    // Seleciona imagens de tópicos, quadrinhos e áreas de conteúdo
    var imagensAula = document.querySelectorAll('.topico img, .w3-row-padding img, main img');

    for (var i = 0; i < imagensAula.length; i++) {
        let img = imagensAula[i];

        // EXCEÇÃO: Não desativa imagens dentro do Modal ou da Bibliografia
        if (!img.closest('#id01') && !img.closest('.bibliografias')) {
            img.style.transition = "filter 3s ease, opacity 3s ease";
            img.style.filter = "grayscale(100%)";
            img.style.opacity = "0.5";
        }
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
        // 2. Busca o JSON correspondente ao ano
        const res = await fetch(`/js/aulas-${ano}ano.json`);
        const aulas = await res.json();

        // 3. Encontra a aula que tem o linkTexto igual ao caminho atual
        // Procuramos o final da string para evitar problemas de caminho absoluto/relativo
        const aulaDados = aulas.find(a => a.linkTexto.includes(aulaArquivo));

        if (aulaDados) {
            tituloAulaGlobal = aulaDados.titulo; // SALVA NA VARIÁVEL GLOBAL

            const tituloH1 = document.getElementById('h1');
            if (tituloH1) tituloH1.innerText = tituloAulaGlobal;

            document.title = `Duvid - ${tituloAulaGlobal}`;


            // Injeta na descrição (se houver um ID para isso)
            const desc = document.getElementById('descricao-aula');
            if (desc) desc.innerText = aulaDados.conteudo;

            // console.log("Metadados injetados: " + aulaDados.titulo);
        }
    } catch (e) {
        console.error("Erro ao injetar metadados:", e);
    }
}




function Aparecer(imagem, paragrafo) {

    document.getElementById(imagem).style.display = "block";
    document.getElementById(paragrafo).style.display = "block";


}


