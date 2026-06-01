// 1. CONSTANTES (FORA DE TUDO)


// Força o scroll para o topo toda vez que a página recarregar
// window.onbeforeunload = function () {
//     window.scrollTo(0, 0);
// };

// Reforço ao carregar o DOM
document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);

    // FORÇA A ATUALIZAÇÃO DOS PONTOS ASSIM QUE A HOME ABRE
    if (typeof atualizarInterface === "function") {
        atualizarInterface();
    }

    // Pequeno atraso para garantir que o navegador não "puxe" para baixo
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, 10);
});



window.ganhosAtuais = window.ganhosAtuais || 0;
// Se não existir, ele cria. Se existir, ele mantém o que já tem.



// Valores oficiais para o site pronto





// 4. CENTRAL DE ECONOMIA (LocalStorage)
//fIM DAS FUNÇÕES DuvidDB






// Chame assim dentro da sua atualizarSistemaNivelHome:
// animarContador('valor-total-central', rpg.saldoAtual);
function verificarStatusAula(id) {
    const areaAviso = document.getElementById('aviso-status');
    if (!areaAviso || !id) return;

    // 1. Usando o DuvidDB para pegar o nome e os status (Muito mais limpo!)
    const nome = (typeof DuvidDB !== "undefined" ? DuvidDB.getNome() : "Estudante") || "Estudante";

    const jaFezQuestoes = DuvidDB.estaConcluido(id, TIPO_CONCLUSAO.QUESTOES);
    const jaLeuTexto = DuvidDB.estaConcluido(id, TIPO_CONCLUSAO.TEXTO);

    let msg = "", cor = "w3-teal", icone = "fa-rocket";

    // CASO 1: Já completou TUDO (Checkmate!)
    if (jaFezQuestoes && jaLeuTexto) {
        msg = `Sensacional, <b>${nome}</b>! Você já dominou esta aula 100%. Aproveite para revisar ou seguir adiante!`;
        cor = "w3-green"; icone = "fa-check-circle";
    }
    // CASO 2: Fez questões, mas NÃO leu o texto (Raro, mas acontece)
    else if (jaFezQuestoes && !jaLeuTexto) {
        msg = `Mandou bem nas questões, <b>${nome}</b>! 💡 <b>Dica:</b> Leia o texto base agora para garantir seus globinhos extras de leitura!`;
        cor = "w3-orange"; icone = "fa-book";
    }
    // CASO 3: Leu o texto, mas NÃO fez questões (Fluxo padrão)
    else if (!jaFezQuestoes && jaLeuTexto) {
        msg = `Texto lido <b>${nome}</b>, agora que tal testar seus conhecimentos nas questões e <b>ganhar mais globinhos</b>?`;
        cor = "w3-indigo"; 
    }
    // CASO 4: Não fez nada ainda (Início da Jornada)
    else {
        msg = `Olá! Começar pelo texto é uma ótima ideia! As questões também já estão liberadas para você ganhar pontos!`;
    }

    if (msg) {
        areaAviso.innerHTML = `
            <div class="aviso-pergaminho aviso-pergaminho2 w3-animate-top">
                <span onclick="this.parentElement.style.display='none'" 
                      class="btn-fechar-rpg">&times;</span>
                
                <div class="permaginho-texto">
                    </i> &nbsp; ${msg}
                </div>
            </div>`;
    }
}


// Adicione esta função ao seu DuvidCore ou como função global no core.js
function inicializarAula(tipo) {
    // 1. Recupera o nome globalmente
    const nome = DuvidDB.getNome();

    // 2. Atualiza a interface global (Globinhos e Nome no Painel)
    if (typeof atualizarInterface === "function") atualizarInterface();

    const nomeNoPainel = document.querySelector('#painel-usuario b');
    if (nomeNoPainel && nome) nomeNoPainel.innerText = nome;

    // 3. Verifica se é modo revisão
    const params = new URLSearchParams(window.location.search);
    const aulaID = params.get('id');

    if (aulaID) {
        const jaConcluiu = localStorage.getItem(`concluido_${tipo}_${aulaID}`) === "true";
        if (jaConcluiu) {
            console.log(`Modo Revisão: ${tipo} ${aulaID} já finalizado.`);
            // Opcional: injetar aviso visual
            const aviso = document.getElementById('aviso-revisao');
            if (aviso) aviso.style.display = 'block';
        }
    }

    return aulaID;
}



function executarReset() {
    // 1. Efeito visual: Sobe a página
    window.scrollTo({ top: 0, behavior: 'smooth' });



    // 2. Limpeza Inteligente do LocalStorage
    const chaves = Object.keys(localStorage);
    chaves.forEach(key => {
        // Verifica se a chave começa com os prefixos do sistema
        const isConcluido = key.startsWith("concluido_");
        const isDuvid = key.startsWith("duvid_");

        // Também garante a limpeza das chaves específicas que você definiu no topo
        const isChaveGlobal = (key === DB_CHAVE || key === NOME_CHAVE);

        if (isConcluido || isDuvid || isChaveGlobal) {
            localStorage.removeItem(key);
            console.log(`Chave removida: ${key}`);
        }
    });

    // 3. Feedback Visual no Modal (com o texto de RPG)
    const modalContent = document.querySelector("#modalReset .w3-container");
    if (modalContent) {
        modalContent.innerHTML = `
            <div class="w3-animate-zoom w3-center w3-padding-32">
                <h3 class="w3-text-red fontePixel"><b>SISTEMA REBOOTADO!</b></h3>
                <img src="../fotoIndex/globinhoPe.png" width="80" class="w3-spin w3-margin">
                <p>Formatando banco de dados...<br><b>Aguarde a reinicialização.</b></p>
            </div>
        `;
    }

    // 4. Som e Redirecionamento
    if (typeof playSom === "function") playSom('erro');

    setTimeout(() => {
        // Volta para a Splash Screen para o aluno colocar o nome novamente
        window.location.href = "../index.html";
    }, 2200);
}


// 3. Validação do formulário de acesso aos grupos (Senha)
function validateForm() {
    const password = document.getElementById("password").value;
    if (password === "") {
        document.getElementById("errorMessage").innerHTML = "Digite a senha de acesso.";
        return false;
    }
    return true;
}
// --- 2. Função Mestre de Interface ---


// --- LÓGICA DE IDENTIFICAÇÃO (LOGIN / TROCA DE NOME) ---
function gerenciarIdentificacaoHome() {
    const nomeSalvo = DuvidDB.getNome();
    const loading = document.getElementById('loading-painel');
    const form = document.getElementById('form-identificacao');
    const display = document.getElementById('display-identificado');
    const nomeTexto = document.getElementById('nome-aluno-texto');

    if (loading) loading.style.display = 'none';

    if (nomeSalvo) {
        if (form) form.style.display = 'none';
        if (display) display.style.display = 'block';
        if (nomeTexto) nomeTexto.innerText = nomeSalvo.toUpperCase();

        // --- GATILHOS DE RPG ---
        // 1. Atualiza o Nível, Patente e Barra de XP Total
        if (typeof atualizarSistemaNivelHome === "function") {
            atualizarSistemaNivelHome();
        }

        // 2. Dispara o resumo das aulas (1, 2 e 3 ano)
        if (typeof atualizarResumoHome === "function") {
            atualizarResumoHome();
        }
    } else {
        if (display) display.style.display = 'none';
        if (form) form.style.display = 'block';
    }
}

function NomeAlunos(respid, inputid) {
    const nome = document.getElementById(inputid).value;
    if (nome.trim() !== "") {
        // CORREÇÃO AQUI: De setNome para salvarNome
        DuvidDB.salvarNome(nome);

        // Troca as telas
        document.getElementById('form-identificacao').style.display = 'none';
        document.getElementById('display-identificado').style.display = 'block';
        document.getElementById('nome-aluno-texto').innerText = nome.toUpperCase();
        document.getElementById('resumo-geral').style.display = 'block';

        // GATILHO 2
        atualizarSistemaNivelHome();
    }
}


function prepararTrocaNome() {
    const form = document.getElementById('form-identificacao');
    const display = document.getElementById('display-identificado');
    const input = document.getElementById('pq0');

    // Inverte a visualização
    if (display) display.style.display = 'none';
    if (form) {
        form.style.display = 'block';
        if (input) {
            input.value = DuvidDB.getNome();
            input.focus();
        }
    }
}


// DEPOIS: fetch só na primeira vez
async function carregarFrase() {
    const f = document.getElementById('frase');
    const a = document.getElementById('autor');
    const imgAutor = document.getElementById('autor-img');
    if (!f) return;

    try {
        f.style.opacity = 0;
        if (imgAutor) imgAutor.style.opacity = 0;

        const frases = await DuvidCache.get('/estilos/frases.json'); // << NOVO

        setTimeout(() => {
            const aleatoria = frases[Math.floor(Math.random() * frases.length)];
            f.innerText = `"${aleatoria.frase}"`;
            if (a) a.innerText = `— ${aleatoria.autor}`;

            if (imgAutor && aleatoria.imagem) {
                imgAutor.src = "/" + aleatoria.imagem;
                imgAutor.onload = () => {
                    imgAutor.style.display = 'block';
                    imgAutor.style.opacity = 1;
                };
            } else if (imgAutor) {
                imgAutor.style.display = 'none';
            }
            f.style.opacity = 1;
        }, 500);

    } catch (erro) {
        console.error("Erro ao carregar frases:", erro);
        f.innerText = "A geografia é a arte de ler o mundo.";
        f.style.opacity = 1;
    }
}


function sincronizarNomeGlobal() {
    // 1. Pega o nome atualizado
    const nomeSalvo = localStorage.getItem(NOME_CHAVE);
    if (!nomeSalvo) return; // Se não tem nome, não faz nada

    // 2. Atualiza no Header das Aulas (se houver o ID 'nome-aluno-header')
    const elHeader = document.getElementById("nome-aluno-header");
    if (elHeader) elHeader.innerText = nomeSalvo.toUpperCase();

    // 3. Atualiza em qualquer Span ou Div que use a classe 'nome-dinamico'
    const elementosDinamicos = document.querySelectorAll(".nome-dinamico");
    elementosDinamicos.forEach(el => {
        el.innerText = nomeSalvo;
    });

    // 4. Se você usa aquele "Olá, Fulano" no topo das aulas
    const bNome = document.querySelector(".w3-col.s8 b.w3-text-green");
    if (bNome) bNome.innerText = nomeSalvo.toUpperCase();
}


//Função quando se clica na palavra (padrão antigo: onclick="revelarParentese(this, '...')")
function revelarParentese(elemento, definicao) {
    // 1. Cláusula de Guarda
    if (!elemento || elemento.classList.contains('desbloqueado')) return;

    // Recupera o texto original da palavra antes de modificar o innerHTML
    const palavra = elemento.dataset.palavra || elemento.textContent.trim();

    // 2. Injeta a definição inline com efeito de fade
    elemento.innerHTML += ` <span class="definicao-fade">(${definicao})</span>`;

    // 3. Marca visualmente como desbloqueado
    elemento.classList.add('desbloqueado');
    elemento.style.color = "#155724";
    elemento.style.fontWeight = "bold";
    elemento.style.cursor = "default";

    // 4. Mini feedback flutuante "+2 🌍"
    const fb = document.createElement('span');
    fb.style.cssText = 'position:absolute;top:-28px;left:50%;transform:translateX(-50%);background:#43a047;color:#fff;font-size:0.78em;font-weight:bold;padding:2px 8px;border-radius:20px;pointer-events:none;white-space:nowrap;z-index:1000;animation:glossSubir 1.2s ease forwards';
    fb.textContent = '+2 🌍';
    elemento.style.position = 'relative';
    elemento.appendChild(fb);
    setTimeout(() => fb.remove(), 1300);

    // 5. Recompensa: som + globinhos
    if (typeof playSom === "function") playSom('acerto');

    if (typeof DuvidDB !== "undefined") {
        DuvidDB.addGlobinhos(2);
        if (typeof atualizarInterface === "function") atualizarInterface();
        if (typeof feedbackVisualAcerto === "function") feedbackVisualAcerto();
    }

    // 6. Alimenta a Ficha de Conceitos (se existir #ficha-conceitos na página)
    const ficha = document.getElementById('ficha-conceitos');
    if (ficha) {
        ficha.style.display = 'block';
        // Garante estrutura interna
        if (!ficha.querySelector('h3')) {
            ficha.innerHTML = `<h3>📋 Ficha de Conceitos</h3><p class="contador" id="gloss-contador">0 termos coletados</p><ul id="lista-glossario"></ul>`;
        }
        const lista = document.getElementById('lista-glossario');
        if (lista) {
            const jaExiste = [...lista.querySelectorAll('li')].some(li => li.dataset.palavra === palavra);
            if (!jaExiste) {
                const item = document.createElement('li');
                item.dataset.palavra = palavra;
                item.innerHTML = `<b>${palavra}</b>: ${definicao}`;
                lista.appendChild(item);
                const contador = document.getElementById('gloss-contador');
                if (contador) {
                    const n = lista.querySelectorAll('li').length;
                    contador.textContent = `${n} ${n === 1 ? 'termo coletado' : 'termos coletados'}`;
                }
            }
        }
    }
}