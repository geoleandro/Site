document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id) {
        aulaID = id; // Crucial para o finalizar() do texto salvar os pontos

        // 1. Mostra o aviso (Incentiva a fazer as questões depois)
        if (typeof verificarStatusAula === "function") verificarStatusAula(id);
        
        // 2. Busca o título e conteúdo da aula no JSON
        if (typeof injetarMetadadosAula === "function") injetarMetadadosAula();

        // 3. Verifica se o aluno já concluiu para travar/liberar botões
        if (typeof verificarStatusAula === "function") verificarStatusAula(id);

        // 4. ATUALIZA A NAVBAR (Saldo de globinhos sempre visível)
        if (typeof atualizarInterface === "function") atualizarInterface();
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
    if (frase) frase.innerHTML = `<b>${nomeEstudante || 'Estudante'}</b>, ${correto ? getFraseSucesso() : mensagem}`; // <--- FRASE DINÂMICA

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
    // 1. IDENTIFICAÇÃO DO ID (Mantendo sua lógica sênior)
    const params = new URLSearchParams(window.location.search);
    let aulaID = params.get('id');

    if (!aulaID) {
        const nomeArquivo = window.location.pathname.split('/').pop();
        const numero = nomeArquivo.replace(/\D/g, "");
        const path = window.location.pathname;

        if (path.includes("1ano")) aulaID = 100 + parseInt(numero);
        else if (path.includes("2ano")) aulaID = 200 + parseInt(numero);
        else if (path.includes("3ano")) aulaID = 300 + parseInt(numero);
    }

    // 2. TRAVA DE SEGURANÇA (Usando a lógica centralizada)
    const jaConcluiu = localStorage.getItem(`concluido_texto_${aulaID}`) === "true";

    if (jaConcluiu) {
        console.log("Modo Revisão: Texto " + aulaID + " já lido.");
        mostrarNota(); // Abre o modal direto, mas sem dar novos pontos
        return;
    }

    // 3. FLUXO NORMAL (Primeira vez que lê)
    desativarBotoes();
    desativarTextos();
    mostrarNota();
    mostraBiblio();
    desativarImagens();
    atualizarInterface();

    // 4. SALVA USANDO O CORE
    if (aulaID) {
        DuvidDB.salvarConclusao(aulaID, 'texto');
        // Se quiser dar pontos fixos pela leitura completa:
        DuvidDB.addGlobinhos(5);
    }
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
    // Selecionamos todos os elementos de texto
    var todosElementos = document.querySelectorAll('p, h1, h2, h3, h4, span, li');
    for (var i = 0; i < todosElementos.length; i++) {
        // Se o elemento NÃO estiver dentro da bibliografia E NÃO estiver dentro do Modal (id01)
        if (!todosElementos[i].closest('.bibliografias') && !todosElementos[i].closest('#id01')) {
            todosElementos[i].style.color = "gray";
            todosElementos[i].style.transition = "3s";
        } else {
            todosElementos[i].style.color = "black";
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



// Mostra a bibliografia no final
function mostraBiblio() {

    var b = document.getElementsByClassName("bibliografias");
    for (var i = 0; i < b.length; i++) {
        b[i].style.display = "block";


    }
}

// Função para aplicar o efeito de escala de cinza em todas as imagens
function desativarImagens() {
    // Seleciona TODAS as imagens que estão dentro de tópicos ou da linha de quadrinhos
    var imagensAula = document.querySelectorAll('.topico img, .w3-row-padding img');

    for (var i = 0; i < imagensAula.length; i++) {
        // Aplica o filtro de cinza
        imagensAula[i].style.filter = "grayscale(100%)";

        // Deixa um pouco transparente para dar o efeito de "desativado"
        imagensAula[i].style.opacity = "0.5";

        // Suaviza a transição (3 segundos como você já usava)
        imagensAula[i].style.transition = "3s";
    }
    // console.log("Imagens e Quadrinhos desativados.");
}




function atualizarInterface() {
    const notaDisplay = document.getElementById("notaFixa");
    // Só tenta mudar o texto se o elemento realmente existir na página
    if (notaDisplay) {
        notaDisplay.innerHTML = nota.toFixed(1);
    } else {
        console.warn("Aviso: O elemento #notaFixa ainda não foi carregado.");
    }
}
// Mecanica da contagem das aulas






function exibirSaudacao(nome) {
    const container = document.getElementById('container-login');
    if (!container) return;

    const nomeSalvo = localStorage.getItem("duvid_nome");

    if (nomeSalvo) {
        // CASO A: Já tem nome. Injetamos a saudação e ligamos a div
        container.innerHTML = `
            <div class="w3-center">
                <p class="paragrafo">Bem-vindo(a) de volta, <b class="w3-text-teal">${nomeSalvo}</b>!</p>
                <button onclick="resetarNome()" class="w3-button w3-small w3-text-grey w3-hover-text-red">
                    <i class="fa fa-refresh"></i> Trocar nome
                </button>
            </div>
        `;
        container.style.display = "block"; // Liga a div já com a saudação
    } else {
        // CASO B: Não tem nome. Apenas liga o formulário original que já está lá
        container.style.display = "block";
        console.log("Aluno novo: formulário de identificação ativado.");
    }
}

function resetarNome() {
    // Se ele quiser trocar o nome, limpamos apenas o nome e recarregamos a identificação
    localStorage.removeItem("duvid_nome");
    location.reload();
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
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    // Esta função deve rodar independente de ter ID ou não (ela tem lógica própria de fallback)
    injetarMetadadosAula();

    if (id) {
        aulaID = id; 
        if (typeof verificarStatusAula === "function") verificarStatusAula(id);
        if (typeof inicializarAula === "function") inicializarAula(id);
        carregarDados(id);
    }
});