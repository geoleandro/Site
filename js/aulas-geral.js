async function carregarAulas(ano) {
    const grid = document.getElementById('grid-aulas');

    try {
        const res = await fetch(`/js/aulas-${ano}ano.json`);
        const aulas = await res.json();

        mostrarProgressoGlobal(aulas, ano);

        if (grid) {
            grid.innerHTML = aulas.map(aula => {
                // --- NOVA LÓGICA DE VERIFICAÇÃO ---
                const leuTexto = localStorage.getItem("concluido_texto_" + aula.id) === "true";
                const fezQuestoes = localStorage.getItem("duvid_" + aula.id + "_questoes") === "true";

                const concluidaTotal = leuTexto && fezQuestoes;
                const concluidaParcial = leuTexto || fezQuestoes;

                // Define a cor da borda e filtros
                let estiloCard = 'filter: grayscale(1); opacity: 0.7;';
                let iconeStatus = '';
                let corTexto = 'color: #777;';

                if (concluidaTotal) {
                    estiloCard = 'border: 4px solid #4CAF50 !important; filter: grayscale(0); opacity: 1;';
                    iconeStatus = '<i class="fa fa-check-circle w3-text-green w3-xlarge" style="position: absolute; top: 10px; right: 10px; background: white; border-radius: 50%; padding: 2px;"></i>';
                    corTexto = 'color: #2e7d32;';
                } else if (concluidaParcial) {
                    estiloCard = 'border: 4px solid #ff9800 !important; filter: grayscale(0); opacity: 0.9;';
                    iconeStatus = '<i class="fa fa-clock-o w3-text-orange w3-xlarge" style="position: absolute; top: 10px; right: 10px; background: white; border-radius: 50%; padding: 2px;"></i>';
                    corTexto = 'color: #e65100;';
                }

                return `
                <div class="column" style="margin-bottom: 25px;">
                    <div class="wrapper" style="position: relative;">
                        <img class="w3-round-large w3-card w3-hover-opacity" 
                             src="${aula.imagem}" 
                             alt="${aula.titulo}" 
                             onclick="ExpandeDiv('div${aula.id}')"
                             style="width:100%; cursor:pointer; transition: 0.5s; ${estiloCard}">
                        
                        ${iconeStatus}
                    </div>
                    
                    <p style="font-weight: bold; ${corTexto}">
                        ${concluidaTotal ? '✔ ' : (concluidaParcial ? '⏳ ' : '')} ${String(aula.id).slice(-2)}: ${aula.titulo}
                    </p>

                    <div id="div${aula.id}" class="w3-modal" style="display:none">
                        <div class="w3-modal-content w3-card-4 w3-animate-zoom" style="max-width:500px">
                            <div class="w3-center w3-padding-48">
                                <span onclick="document.getElementById('div${aula.id}').style.display='none'"
                                      class="w3-button w3-xlarge w3-hover-red w3-display-topright">&times;</span>
                                
                                <div class="w3-margin">
                                    <h3>Aula ${String(aula.id).slice(-2)}</h3>
                                    ${concluidaTotal ? '<span class="w3-tag w3-green w3-round">Concluída!</span>' : (concluidaParcial ? '<span class="w3-tag w3-orange w3-round">Em andamento</span>' : '')}
                                    <br><br>
                                    <strong>Conteúdo:</strong> ${aula.conteudo}
                                </div>

                                <div class="w3-row w3-padding">
                                    <a href="${aula.linkTexto}" class="w3-button ${leuTexto ? 'w3-green' : 'w3-teal'} w3-margin" style="width:50%">
                                        ${leuTexto ? 'Revisar Texto' : 'Ler Texto'}
                                    </a>
                                    
                                    <a href="${aula.linkQuestoes}" class="w3-button ${fezQuestoes ? 'w3-blue' : 'w3-yellow'} w3-margin" style="width:50%">
                                        ${fezQuestoes ? 'Revisar Questões' : 'Fazer Questões'}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            }).join('');
        }
    } catch (e) {
        console.error("Erro ao carregar as aulas:", e);
        grid.innerHTML = "<p class='w3-center'>Erro ao carregar as aulas.</p>";
    }
}


// ATUALIZE TAMBÉM A CONTAGEM NO PROGRESSO GLOBAL
function mostrarProgressoGlobal(aulas, ano) {
    const painel = document.getElementById('painel-usuario');
    if (!painel) return;

    const nome = localStorage.getItem("duvid_nome") || "Estudante";

    // Agora só conta como aula concluída se o Texto E as Questões estiverem prontos
    const concluidasNoAno = aulas.filter(aula =>
        localStorage.getItem("concluido_texto_" + aula.id) === "true" &&
        localStorage.getItem("duvid_" + aula.id + "_questoes") === "true"
    ).length;

    const totalAulasAno = aulas.length;
    const porcentagem = Math.round((concluidasNoAno / totalAulasAno) * 100) || 0;

    painel.innerHTML = `
        <div class="w3-container w3-card-4 w3-light-grey w3-round-large w3-margin-bottom w3-padding-16">
            <h4>Bem-vindo(a) de volta, <b>${nome}</b>!</h4>
            <p>Seu progresso no <b>${ano}º Ano</b> (Aulas 100% concluídas):</p>
            <div class="w3-grey w3-round-xlarge w3-small" style="height:20px">
                <div class="w3-container w3-center w3-round-xlarge w3-green" 
                     style="width:${porcentagem}%; height:20px; transition: width 1s;">
                    ${porcentagem}%
                </div>
            </div>
            <p class="w3-small w3-margin-top">
                Você finalizou <b>${concluidasNoAno}</b> de <b>${totalAulasAno}</b> aulas (Texto + Exercícios).
            </p>
        </div>`;
}

function ExpandeDiv(id_cadastro) {
    var div_sel = document.getElementById(id_cadastro);
    if (div_sel.style.display === 'block') {
        div_sel.style.display = 'none';
    } else {
        // Fecha outros modais abertos antes de abrir o novo
        var modais = document.getElementsByClassName('w3-modal');
        for (var i = 0; i < modais.length; i++) {
            modais[i].style.display = 'none';
        }
        div_sel.style.display = 'block';
    }
}

function onClick(element) {
    document.getElementById("img01").src = element.src;
    document.getElementById("modal01").style.display = "block";
    document.getElementById("caption").innerHTML = element.alt;
}

// Fecha o modal se o usuário clicar fora da caixa branca (no fundo escuro)
window.onclick = function (event) {
    // Verifica se o que foi clicado tem a classe 'w3-modal'
    if (event.target.className.indexOf('w3-modal') !== -1) {
        event.target.style.display = "none";
    }
}





// Atualiza o resumo geral na Home (chamado no onload da Home)
// function atualizarResumoHome() {
//     const painelResumo = document.getElementById('resumo-geral');
//     if (!painelResumo) {
//         console.error("Painel 'resumo-geral' não encontrado no HTML!");
//         return;
//     }

//     painelResumo.style.display = "block";

//     // Defina aqui exatamente quantas aulas você tem em cada ano
//     const totais = {
//         "1": 15, 
//         "2": 12,
//         "3": 22 
//     };

//     ["1", "2", "3"].forEach(ano => {
//         const concluidas = contarAulasConcluidas(ano);
//         const total = totais[ano];
//         const porc = total > 0 ? Math.round((concluidas / total) * 100) : 0;

//         // Tentei usar o padrão que você usou nas mensagens de erro (1ano, 2ano...)
//         const barra = document.getElementById(`bar-${ano}ano`);
//         const texto = document.getElementById(`txt-${ano}ano`);
//         const iconeConquista = document.getElementById(`conquista-${ano}ano`);

//         if (barra) {
//             barra.style.width = porc + "%";
//             // Se quiser que a cor mude conforme o progresso:
//             if(porc === 100) barra.className = "w3-container w3-center w3-round-xlarge w3-blue";
//         }

//         if (texto) {
//             texto.innerText = `${concluidas}/${total}`;
//         }

//         if (iconeConquista) {
//             iconeConquista.style.display = (concluidas >= total && total > 0) ? "block" : "none";
//         }
//     });
// }
async function atualizarResumoHome() {
    const painelResumo = document.getElementById('resumo-geral');
    if (!painelResumo) return;

    painelResumo.style.display = "block";

    const anos = ["1", "2", "3"];

    for (const ano of anos) {
        try {
            // Busca o arquivo JSON de cada ano (ex: aulas-1ano.json)
            const resposta = await fetch(`/js/aulas-${ano}ano.json`);
            if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);
            
            const aulas = await resposta.json();

            // CONTAGEM AUTOMÁTICA: Filtra apenas itens válidos (não nulos)
            const aulasValidas = aulas.filter(a => a !== null && a.id !== undefined);
            const total = aulasValidas.length;

            // Pega as concluídas do LocalStorage (Texto + Questão)
            const concluidas = contarAulasConcluidas(ano); 
            
            const porc = total > 0 ? Math.round((concluidas / total) * 100) : 0;

            // Atualiza os elementos na tela
            const barra = document.getElementById(`bar-${ano}ano`);
            const texto = document.getElementById(`txt-${ano}ano`);
            const iconeConquista = document.getElementById(`conquista-${ano}ano`);

            if (barra) barra.style.width = porc + "%";
            if (texto) texto.innerText = `${concluidas}/${total}`;
            
            if (iconeConquista) {
                iconeConquista.style.display = (porc >= 100 && total > 0) ? "block" : "none";
            }

        } catch (erro) {
            console.error(`Falha ao processar progresso automático do ano ${ano}:`, erro);
        }
    }
}


function contarAulasConcluidas(anoPrefixo) {
    let contagem = 0;
    // Se o ano for "1", ele testa 101, 102... até 150
    // Se o ano for "2", ele testa 201, 202... 
    for (let i = 1; i <= 50; i++) {
        let idAula = anoPrefixo + (i < 10 ? "0" + i : i);

        const texto = localStorage.getItem("concluido_texto_" + idAula) === "true";
        const questoes = localStorage.getItem("duvid_" + idAula + "_questoes") === "true";

        if (texto && questoes) {
            contagem++;
        }
    }
    return contagem;
}