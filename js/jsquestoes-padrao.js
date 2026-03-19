let questoes = [];
let indiceAtual = 0;
let acertos = 0;
let aulaID = ""; // Variável global

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id) {
        aulaID = id; // Garante que o ID global seja usado no finalizar()

        // 1. Mostra o aviso (Ler texto, ganhar +20 globinhos, etc)
        if (typeof verificarStatusAula === "function") verificarStatusAula(id);

        // 2. Prepara os dados da aula (JSON)
        if (typeof inicializarAula === "function") inicializarAula(id);

        // 3. Carrega as perguntas específicas dessa aula
        carregarDados(id);

        // 4. ATUALIZA A NAVBAR (Garante que o saldo de globinhos apareça na hora)
        if (typeof atualizarInterface === "function") atualizarInterface();
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
    if (!container) return;

    // Barra de progresso
    // Soma +1 para a barra chegar no final na última questão
    const porc = ((indiceAtual + 1) / questoes.length) * 100;
    const progressBarr = document.getElementById('barra-progresso-simulado');
    if (progressBarr) progressBarr.style.width = porc + "%";

    container.innerHTML = `
        <div class="w3-animate-right w3-padding-24">
            <div class="w3-row">
                <div class="w3-col s8"><h4 class="w3-text-green"><b>Questão ${indiceAtual + 1}</b></h4></div>
                <div class="w3-col s4 w3-right-align w3-text-grey"><b>${q.ano || ''}</b></div>
            </div>

             


            ${q.texto_apoio ? `
                <div class="w3-panel w3-leftbar w3-sand w3-margin w3-padding-16">
                    <p style="font-style: italic; line-height: 1.6;">${q.texto_apoio}</p>
                    ${q.fonte_apoio ? `<p class="w3-small w3-opacity w3-right-align">— ${q.fonte_apoio}</p>` : ''}
                </div>
            ` : ''}

            ${q.imagem_apoio ? `
                <div class="w3-center w3-margin-bottom">
                    <img src="${q.imagem_apoio}" class="w3-image w3-card" style="max-height:100%; width:100%; object-fit:contain">
                </div>
            ` : ''}
            
            <p class="w3-large">${q.pergunta}</p>

             ${q.ajuda ? `
                <div class="w3-center w3-margin-top">
                    <button onclick="mostrarDica()" class="w3-button w3-light-grey w3-text-teal w3-round-large w3-small w3-border">
                        💡 <b>DICA DO PROFESSOR</b>
                    </button>
                </div>
            ` : ''}

            <div class="w3-margin-top grupo-respostas">
                ${q.alternativas.map((alt, i) => `
                    <div class="item-resposta w3-margin-bottom">
                        <input type="radio" name="opcao" id="opt${i}" value="${i}" class="radio-duvid">
                        <label for="opt${i}" class="card-opcao w3-block">
                            <span><b>${String.fromCharCode(97 + i)})</b> ${alt}</span>
                        </label>
                    </div>
                `).join('')}
            </div>

          
            <button onclick="verificar()" id="btn-verificar" class="btn-acao-duvid w3-margin-top">
                <b>VERIFICAR RESPOSTA</b>
            </button>
        </div>
    `;
}


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
        <div style="max-height: 600px; overflow-y: auto; background: rgba(255, 255, 255, 0.15); padding: 12px; border-radius: 8px; margin: 10px 0 20px 0; border: 1px solid rgba(255,255,255,0.1); text-align: left; position: relative; z-index: 1;">
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
    
    // Força a barra a encher totalmente no final
    const progressBarr = document.getElementById('barra-progresso-simulado');
    if (progressBarr) progressBarr.style.width = "100%";
    
    // 1. Esconde as questões e mostra o container de resultado
    document.getElementById('container-questao').classList.add('w3-hide');
    const res = document.getElementById('resultado-final');
    res.classList.remove('w3-hide');

    // 2. Cálculos e Lógica
    const media = (acertos / questoes.length) * 10;
    const passou = media >= 6;
    const notaFormatada = media.toFixed(1);

    // 3. Som e Comemoração
    if (typeof playSomFinal === "function") playSomFinal(passou);
    if (passou && typeof dispararComemoracao === "function") dispararComemoracao();

    // 4. Montando o HTML DINÂMICO (Igual ao do Texto para padronizar)
    // Vamos injetar o layout espaçado dentro do container de resultado
    res.innerHTML = `
        <div class="w3-container w3-padding-32 w3-center w3-animate-zoom">
            <div class="w3-margin-bottom pulse">
                <img src="../../../fotoIndex/globinhoPe.png" width="80" height="80" 
                     style="filter: ${passou ? 'none' : 'grayscale(100%)'};">
            </div>

            <h2 class="${passou ? 'w3-text-green' : 'w3-text-orange'} fontePixel">
                ${passou ? '🎉 SIMULADO CONCLUÍDO!' : '👍 VALEU O ESFORÇO!'}
            </h2>
            
            <div class="w3-padding-16">
                <p class="w3-xlarge">Você acertou <b>${acertos}</b> de ${questoes.length} questões!</p>
                <p class="w3-text-grey" style="font-style: italic;">
                    ${passou ? 'Excelente! Você dominou este conteúdo.' : 'Que tal revisar os pontos onde teve dúvida?'}
                </p>
            </div>

            <div class="w3-container w3-padding-24">
                <div class="w3-center">
                    <button onclick="location.reload()" 
                            class="w3-button ${passou ? 'w3-light-grey' : 'w3-blue'} w3-round-large w3-margin-bottom" 
                            style="width: 85%; max-width: 300px; font-weight: bold; padding: 15px;">
                        🔄 REFAZER SIMULADO
                    </button>
                </div>

                <div class="w3-center">
                    <button onclick="window.location.href='/home.html'" 
                            class="w3-button w3-green w3-round-large" 
                            style="width: 85%; max-width: 300px; font-weight: bold; padding: 15px;">
                        🏠 VOLTAR PARA A HOME
                    </button>
                </div>
            </div>
        </div>
    `;

    // 5. Gravação de Progresso no Banco (CORE)
    if (typeof aulaID !== "undefined" && aulaID) {
        if (typeof DuvidDB !== "undefined") {
            // Salva que as questões foram concluídas
            DuvidDB.salvarConclusao(aulaID, 'questoes');

            // Dá bônus de globinhos se passar
            if (passou) {
                DuvidDB.addGlobinhos(20);
                console.log("Progresso e Globinhos gravados para: " + aulaID);
            }
        }
    } else {
        console.error("Erro: aulaID não definido nas questões.");
    }

    // 6. Atualiza a interface global (Navbar)
    if (typeof atualizarInterface === "function") atualizarInterface();
}

// function gerarPaginaRevisao() {
//     const container = document.getElementById('container-questao');
//     if (!container) return;

//     // Limpa o container e prepara para o "listão"
//     container.innerHTML = '<h2 class="w3-center fontePixel w3-text-teal">Modo de Revisão Geral</h2>';

//     questoes.forEach((q, index) => {
//         const divQuestao = document.createElement('div');
//         divQuestao.className = "w3-card-4 w3-white w3-margin-bottom w3-padding-24 w3-border-bottom";
//         divQuestao.style.borderLeft = "6px solid #4CAF50"; // Uma bordinha verde para separar

//         divQuestao.innerHTML = `
//             <div class="w3-row w3-margin-bottom">
//                 <div class="w3-col s8"><b class="w3-text-green">Questão ${index + 1}</b></div>
//                 <div class="w3-col s4 w3-right-align w3-text-grey">ID: ${q.id} | ${q.ano || ''}</div>
//             </div>

//             ${q.texto_apoio ? `
//                 <div class="w3-panel w3-leftbar w3-sand w3-padding-small w3-small" style="white-space: pre-line;">
//                     <i>${q.texto_apoio}</i>
//                     ${q.fonte_apoio ? `<p class="w3-tiny w3-right-align">— ${q.fonte_apoio}</p>` : ''}
//                 </div>
//             ` : ''}

//             ${q.imagem_apoio ? `
//                 <div class="w3-center w3-margin-bottom">
//                     <img src="${q.imagem_apoio}" style="max-height:150px; border:1px solid #ddd">
//                     <p class="w3-tiny w3-text-red">Caminho: ${q.imagem_apoio}</p>
//                 </div>
//             ` : ''}

//             <p class="w3-medium" style="white-space: pre-line;">${q.pergunta}</p>

//             <div class="w3-light-grey w3-padding w3-round w3-small">
//                 <b>Alternativas:</b><br>
//                 ${q.alternativas.map((alt, i) => `
//                     <span style="${i === q.correta ? 'color: green; font-weight: bold;' : 'color: #777;'}">
//                         ${String.fromCharCode(97 + i)}) ${alt} ${i === q.correta ? ' ✅' : ''}
//                     </span><br>
//                 `).join('')}
//             </div>

//             <div class="w3-margin-top w3-padding w3-pale-blue w3-border w3-border-blue w3-round w3-small">
//                 <b>Comentário Cadastrado:</b><br>
//                 ${q.comentario || '<span class="w3-text-red">Sem comentário!</span>'}
//             </div>
//         `;
//         container.appendChild(divQuestao);
//     });

//     // Remove botões de navegação para não atrapalhar a leitura
//     const btnVerificar = document.getElementById('btn-verificar');
//     if (btnVerificar) btnVerificar.style.display = 'none';
// }