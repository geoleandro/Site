let questoes = [];
let indiceAtual = 0;
let acertos = 0;
let aulaID = ""; // Variável global

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id) {
        aulaID = id; // CORREÇÃO: Agora a global recebe o ID para ser usado no finalizar()

        if (typeof verificarStatusAula === "function") verificarStatusAula(id);
        if (typeof inicializarAula === "function") inicializarAula(id);

        carregarDados(id);
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

function renderizarQuestao() {
    const q = questoes[indiceAtual];
    const container = document.getElementById('container-questao');
    const porc = (indiceAtual / questoes.length) * 100;

    const progressBarr = document.getElementById('barra-progresso-simulado');
    if (progressBarr) progressBarr.style.width = porc + "%";

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

            <p class="w3-large"><b>${q.pergunta}</b></p>

            <div class="w3-margin-top">
                ${q.alternativas.map((alt, i) => `
                    <label class="w3-padding w3-card-1 w3-border w3-round w3-margin-bottom w3-block w3-hover-pale-green opcao-container" style="cursor:pointer">
                        <input type="radio" name="opcao" value="${i}" class="w3-radio" style="margin-right:10px">
                        <b>${String.fromCharCode(97 + i)})</b> ${alt}
                    </label>
                `).join('')}
            </div>

            <button onclick="verificar()" id="btn-verificar" class="w3-button w3-green w3-block w3-round-large w3-padding-16 w3-margin-top">
                <b>VERIFICAR RESPOSTA</b>
            </button>
        </div>
    `;
}

function verificar() {
    const selecionada = document.querySelector('input[name="opcao"]:checked');
    const btnVerificar = document.getElementById('btn-verificar');

    if (!selecionada) {
        if (typeof playSom === "function") playSom('erro');
        const textoOriginal = btnVerificar.innerHTML;
        btnVerificar.innerHTML = "<i class='fa fa-exclamation-triangle'></i> ESCOLHA UMA ALTERNATIVA!";
        btnVerificar.classList.replace('w3-green', 'w3-red');

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

    const todasOpcoes = document.querySelectorAll('.opcao-container');
    todasOpcoes.forEach((div, index) => {
        if (index === q.correta) {
            div.classList.add('w3-pale-green', 'w3-border-green', 'w3-leftbar');
        }
        if (index === resp && resp !== q.correta) {
            div.classList.add('w3-pale-red', 'w3-border-red', 'w3-leftbar');
        }
    });

    if (resp === q.correta) {
        acertos++;
        if (typeof playSom === "function") playSom('acerto');
        if (typeof dispararComemoracao === "function") dispararComemoracao();
        if (typeof DuvidDB !== "undefined") {
            DuvidDB.addGlobinhos(10); // <--- Adiciona 10 globinhos por acerto
        }
       

        // Dá um fôlego de 100ms para o banco salvar e a tela atualizar
            setTimeout(() => {
                if (typeof feedbackVisualAcerto === "function") feedbackVisualAcerto();
            }, 100);

        feedback.className = "w3-bottom w3-container w3-padding-16 w3-animate-bottom w3-green";
        msg.innerHTML = `<b><i class='fa fa-smile-o'></i> ${typeof getFraseSucesso === "function" ? getFraseSucesso() : "Boa!"}</b>`;
    } else {
        if (typeof playSom === "function") playSom('erro');
        feedback.className = "w3-bottom w3-container w3-padding-16 w3-animate-bottom w3-amber";
        msg.innerHTML = `<b>Opa! A resposta correta é a (${String.fromCharCode(65 + q.correta)})</b>`;
    }

    txt.innerHTML = `
        <div style="max-height: 200px; overflow-y: auto; background: rgba(255, 255, 255, 0.15); padding: 12px; border-radius: 8px; margin: 10px 0 20px 0; border: 1px solid rgba(255,255,255,0.1); text-align: left; position: relative; z-index: 1;">
            ${q.comentario}
        </div>
    `;

    feedback.classList.remove('w3-hide');
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

    const passou = media >= 6;
    if (typeof playSomFinal === "function") playSomFinal(passou);

    if (passou) {
        if (typeof dispararComemoracao === "function") dispararComemoracao();
        res.querySelector('h2').innerText = "Parabéns! Continue estudando!";
        res.querySelector('h2').className = "w3-text-green";
    } else {
        res.querySelector('h2').innerText = "Você pode revisar sempre!";
        res.querySelector('h2').className = "w3-text-red";
    }

    // --- A MÁGICA ACONTECE AQUI ---
    if (aulaID) {
        // Agora o aulaID existe de verdade!
        if (typeof DuvidDB !== "undefined") {
            DuvidDB.salvarConclusao(aulaID, 'questoes');
            if (media >= 6) DuvidDB.addGlobinhos(20);
        }
        console.log("Progresso gravado para: " + aulaID);
    } else {
        console.error("Erro: aulaID não capturado.");
    }
}