// --- 1. CONFIGURAÇÃO DE CORES E TEXTOS ---
const DuvidUI = {
    // 2. ATUALIZAÇÃO DO SALDO (HEADER E HOME)
    atualizarInterface: function () {
        const progresso = DuvidDB.getProgressoRPG();
        const saldoFormatado = progresso.saldoAtual.toFixed(1);

        this.atualizarMedalhas(progresso.patente);

        // 1. Atualiza Header (Globinhos Dourados)
        const elHeader = document.getElementById("saldoTotalHeader");
        if (elHeader) {
            // Se o valor mudou, dá um "pulso" visual
            if (elHeader.innerText !== saldoFormatado) {
                elHeader.classList.add('w3-animate-zoom');
                setTimeout(() => elHeader.classList.remove('w3-animate-zoom'), 500);
            }
            elHeader.innerText = saldoFormatado;
        }
        // Atualiza Nota da Aula (Nota Fixa Branca)
        const elNota = document.getElementById("notaFixa");
        if (elNota) {
            let valorAula = (typeof window.ganhosAtuais !== 'undefined') ? window.ganhosAtuais : 0;
            elNota.innerText = Number(valorAula).toFixed(1);
        }

        // Se estiver na Home, dispara a atualização do Painel RPG
        if (document.getElementById('valor-total-central')) {
            this.atualizarPainelHome(progresso);
        }
    },



    // 3. O NOVO PAINEL DE NÍVEIS (A trilha que você desenhou)


    // 3. A Função Mestra (Orquestradora)
    desenharTrilhaNiveis: function () {
        const placeholder = document.getElementById('icones-trilha-placeholder');
        const pFrase = document.getElementById('frase-motivacional-trilha');

        if (!placeholder) return;

        const progresso = DuvidDB.getProgressoRPG();
        const ranking = DuvidDB.RANKING_SISTEMA;

        // Atualiza Frase
        if (pFrase) pFrase.innerText = this.obterFraseMotivacional(progresso);

        // Reconstrói Pontos
        placeholder.innerHTML = "";
        ranking.forEach(marco => {
            placeholder.appendChild(this._criarPontoNivel(marco, progresso));
        });

        // Atualiza Linha
        this._atualizarLinhaTrilha(progresso, ranking);

        // Executa Scroll com um micro-delay para o DOM renderizar
        requestAnimationFrame(() => this._focarNivelAtual());
    },

    // 1. Função Auxiliar para criar o nó do ponto (Pura e isolada)
    // 1. ESPECIALISTA: Cria o elemento HTML da bolinha
    _criarPontoNivel: function (marco, progresso) {
        const isAtivo = progresso.lvl >= marco.lvl;
        const isAtual = progresso.lvl === marco.lvl;

        const ponto = document.createElement('div');
        ponto.className = `ponto-nivel ${isAtivo ? 'ativo' : ''} ${isAtual ? 'atual' : ''}`;

        // O SEGREDO: Colocamos o texto aqui e o CSS exibe abaixo
        ponto.setAttribute('data-label', `Level ${marco.lvl} `);


        return ponto;
    },

    // 2. ESPECIALISTA: Desenha a linha de conexão entre os pontos
    _atualizarLinhaTrilha: function (progresso, ranking) {
        const linhaAtiva = document.getElementById('linha-trilha-progresso');
        if (linhaAtiva) {
            const porcentagem = ((progresso.lvl - 1) / (ranking.length - 1)) * 100;
            linhaAtiva.style.width = `${Math.max(0, porcentagem)}%`;
        }
    },

    // 3. ESPECIALISTA: Centraliza o scroll no nível atual (UX Sênior)
    _focarNivelAtual: function () {
        const areaScroll = document.querySelector('.trilha-scroll-area');
        const pontoAtual = document.querySelector('.ponto-nivel.atual');

        if (areaScroll && pontoAtual) {
            // Cálculo para centralizar: posição da bolinha - metade da largura da tela
            const centro = pontoAtual.offsetLeft - (areaScroll.offsetWidth / 2) + (pontoAtual.offsetWidth / 2);

            areaScroll.scrollTo({
                left: centro,
                behavior: 'smooth'
            });
        }
    },

    // Dentro do objeto DuvidUI:

    obterFraseMotivacional: function (progresso) {
        const nome = (typeof DuvidDB !== "undefined") ? DuvidDB.getNome() : "Estudante";
        const faltaParaProximo = progresso.proximoLvl - progresso.saldoAtual;

        // 1. Prioridade: Se estiver quase subindo de nível (menos de 100 XP)
        if (faltaParaProximo > 0 && faltaParaProximo <= 100) {
            return `Segura o coração, ${nome}! Faltam apenas ${Math.floor(faltaParaProximo)} XP para o próximo nível! ⚡`;
        }

        // 2. Frases fixas por Patente/Level
        const frasesPorLevel = {
            1: `Olá ${nome}! O mundo é vasto. Comece sua exploração pelas aulas abaixo! 🚀`,
            2: `Mandou bem, Explorador! Seus primeiros passos na geografia estão rendendo frutos. ✨`,
            3: `O mapa está ganhando forma, ${nome}! Um Cartógrafo de respeito. 🗺️`,
            4: `Visão estratégica ativada! Você está dominando as escalas do mundo. 🧠`,
            5: `Respeito máximo ao Geógrafo Sênior! Quase no topo da montanha. 🌍`,
            6: `Você é uma LENDA DA TERRA! Domínio total do espaço geográfico. 🏆`
        };

        return frasesPorLevel[progresso.lvl] || `Continue focado, ${nome}! Cada aula te deixa mais sábio.`;
    },

    // 4. ANIMAÇÕES (Confete e Contador)
    // 4. ANIMAÇÕES (Confete e Contador)
    dispararComemoracao: function () {
        // Verifica se a biblioteca confetti está carregada
        if (typeof confetti !== "function") {
            console.warn("Biblioteca 'canvas-confetti' não encontrada.");
            return;
        } // <--- Fecha o IF aqui e continua a função

        // --- SEU BLOCO GIGANTE DE 10 EFEITOS ---
        const estilo = Math.floor(Math.random() * 10) + 1;
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        // Aumentei o zIndex para 99999 para garantir que apareça nas questões
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 99999 };

        function randomInRange(min, max) { return Math.random() * (max - min) + min; }

        switch (estilo) {
            case 1: confetti({ ...defaults, particleCount: 150, origin: { y: 0.6 } }); break;
            case 2:
                confetti({ ...defaults, particleCount: 100, angle: 60, spread: 55, origin: { x: 0, y: 0.8 } });
                confetti({ ...defaults, particleCount: 100, angle: 120, spread: 55, origin: { x: 1, y: 0.8 } });
                break;
            case 3:
                var interval = setInterval(function () {
                    var timeLeft = animationEnd - Date.now();
                    if (timeLeft <= 0) return clearInterval(interval);
                    var particleCount = 50 * (timeLeft / duration);
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
                }, 250);
                break;
            case 4: confetti({ ...defaults, particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#FFD700', '#FFA500', '#FFFACD'] }); break;
            case 5: confetti({ ...defaults, particleCount: 200, spread: 160, colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'] }); break;
            case 6: confetti({ ...defaults, particleCount: 80, spread: 120, startVelocity: 45, gravity: 0.5 }); break;
            case 7: confetti({ ...defaults, particleCount: 100, spread: 100, origin: { y: 0 }, gravity: 0.3, startVelocity: 0 }); break;
            case 8: confetti({ ...defaults, particleCount: 150, angle: 90, spread: 30, startVelocity: 60, origin: { y: 1 } }); break;
            case 9:
                confetti({ ...defaults, particleCount: 100, origin: { x: 0.3, y: 0.7 } });
                setTimeout(() => { confetti({ ...defaults, particleCount: 100, origin: { x: 0.7, y: 0.7 } }); }, 300);
                break;
            case 10:
                var end = Date.now() + 5000;
                (function frame() {
                    confetti({ ...defaults, particleCount: 2, angle: 60, spread: 55, origin: { x: 0 } });
                    confetti({ ...defaults, particleCount: 2, angle: 120, spread: 55, origin: { x: 1 } });
                    if (Date.now() < end) requestAnimationFrame(frame);
                }());
                break;
        }
    }, // <--- FECHA A FUNÇÃO dispararComemoracao AQUI




    animarContador: function (id, valorFinal) {
        const el = document.getElementById(id);
        if (!el) return;
        let atual = parseFloat(el.innerText) || 0;
        const inc = (valorFinal - atual) / 20;
        const timer = setInterval(() => {
            atual += inc;
            if (Math.abs(atual - valorFinal) < 1) {
                el.innerText = valorFinal.toFixed(1);
                clearInterval(timer);
            } else {
                el.innerText = atual.toFixed(1);
            }
        }, 30);
    },




    atualizarPainelHome: function (progresso) {
        // 1. O VALOR REAL (O que o aluno vê nos textos)
        // Usamos o saldo total vindo do DB para não confundir o usuário
        const xpReal = Math.floor(progresso.saldoAtual);
        const objetivoReal = Math.floor(progresso.proximoLvl);

        this.animarContador('valor-total-central', xpReal);

        // CORREÇÃO DOS TEXTOS: Exibe o número real que está no badge amarelo
        this._atualizarElemento('xp-atual', xpReal);
        this._atualizarElemento('xp-proximo', objetivoReal);

        this._atualizarElemento('rank-nome', progresso.patente);

        // 2. ESTILO DINÂMICO
        const tag = this._atualizarElemento('lvl-tag', `LEVEL ${progresso.lvl}`);
        if (tag) tag.style.backgroundColor = progresso.cor;

        const rank = document.getElementById('rank-nome');
        if (rank) rank.style.color = progresso.cor;

        // 3. A BARRA (Aqui a matemática de "mínimo" acontece nos bastidores)
        const barraXP = document.getElementById('barra-xp-total');
        if (barraXP) {
            requestAnimationFrame(() => {
                // A largura usa a porcentagem relativa (ex: 86%), mas o texto acima é o real
                barraXP.style.width = `${progresso.progressoBarra}%`;
            });
        }

        this.desenharTrilhaNiveis();
    },
    // Funções Auxiliares Internas (Encapsulamento)
    _atualizarElemento: function (id, valor, propriedade = 'innerText') {
        const el = document.getElementById(id);
        if (el) el[propriedade] = valor;
        return el;
    },


    // No duvid-ui.js, dentro do objeto DuvidUI:

    feedbackVisualAcerto: function () {
        const imagemGlobo = document.getElementById("imagem50") || document.querySelector('.fa-globe');
        const painelPontos = document.getElementById("painel-pontos") || document.getElementById("saldoTotalHeader");

        // 1. O PULO/GIRO DO GLOBINHO
        if (imagemGlobo) {
            // Remove as animações para poder disparar de novo
            imagemGlobo.classList.remove('giro-globinho', 'pulo-elastico');
            void imagemGlobo.offsetWidth; // Truque para resetar a animação

            // Você pode escolher: 'giro-globinho' para rodar ou 'pulo-elastico' para pular
            imagemGlobo.classList.add('giro-globinho');
        }

        // 2. O PULO DO NÚMERO (Feedback no saldo)
        if (painelPontos) {
            painelPontos.classList.remove('pulo-elastico');
            void painelPontos.offsetWidth;
            painelPontos.classList.add('pulo-elastico');
        }

        // // 3. Atualiza os números na tela
        // this.atualizarInterface();
    },

    feedbackVisualErro: function () {
        const elHeader = document.getElementById("saldoTotalHeader");
        const imagemGlobo = document.getElementById("imagem50") || document.querySelector('.fa-globe');

        // 1. Efeito de tremer (Shake) no saldo
        if (elHeader) {
            elHeader.style.color = "#ff5252"; // Vermelho vibrante
            elHeader.classList.add('shake-erro');

            // Volta ao normal depois de 1 segundo
            setTimeout(() => {
                elHeader.style.color = "";
                elHeader.classList.remove('shake-erro');
            }, 1000);
        }

        // 2. Filtro avermelhado no globinho por um instante
        if (imagemGlobo) {
            imagemGlobo.style.filter = "sepia(1) saturate(5) hue-rotate(-50deg)";
            setTimeout(() => {
                imagemGlobo.style.filter = "";
            }, 500);
        }
        // 3. Atualiza os números na tela
        this.atualizarInterface();
    },

    mostrarXPFlutuante: function (pontos, correto = true) {
        const ancora = document.getElementById('notaFixa');
        if (!ancora) return;

        const rect = ancora.getBoundingClientRect();
        const el = document.createElement('div');

        el.className = 'xp-flutuante' + (correto ? '' : ' erro');
        el.innerText = correto ? `+${pontos} XP` : '-♥';

        // Com position: fixed, usamos rect.top diretamente
        // Isso posiciona o elemento exatamente sobre o saldo no topo
        el.style.left = `${rect.left + (rect.width / 2)}px`;
        el.style.top = `${rect.top}px`;
        el.style.transform = 'translateX(-50%)';

        document.body.appendChild(el);

        el.addEventListener('animationend', () => el.remove());
    },


    avisoSelecaoPendente: function (botao) {
        if (!botao) return;

        // 1. Som de Erro
        if (typeof playSom === "function") playSom('erro');

        // 2. Transforma o botão (Visual)
        const textoOriginal = botao.innerHTML;
        botao.innerHTML = "⚠️ Escolha uma opção!";
        botao.classList.add('w3-amber', 'shake-erro');

        // 3. Vibração (Mobile)
        if (navigator.vibrate) navigator.vibrate(100);

        // 4. Reseta após 1.5s
        setTimeout(() => {
            botao.innerHTML = textoOriginal;
            botao.classList.remove('w3-amber', 'shake-erro');
        }, 1500);
    },

    atualizarMedalhas: function (patente) {
        if (!patente) return;

        // 1. O "TRADUTOR": Converte "GEÓGRAFO SÊNIOR" em "geografo-senior"
        const slug = patente.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, '-');

        const caminhoImg = `fotoIndex/icones/duvid-patentes-${slug}.png`;

        // 2. O "ALVO": Procura os IDs no HTML (Header e Painel Home)
        const idsMedalhas = ["medalha-header", "medalha-patente"];

        idsMedalhas.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                // Só troca se a imagem for diferente da atual
                if (!el.src.includes(caminhoImg)) {
                    el.src = caminhoImg;

                    // 3. O "TOQUE DE MESTRE": Animação de subida de nível
                    el.classList.add('w3-animate-zoom');
                    setTimeout(() => el.classList.remove('w3-animate-zoom'), 500);
                }
            }
        });
    },

    executarGatilhoResultado: function (correto, pontos = 0) {
        if (correto) {
            playSom('acerto');
            this.dispararComemoracao();   // ← usa o método do objeto, não a global
            this.feedbackVisualAcerto();  // ← só giro + pulo, sem confete
            this.mostrarXPFlutuante(pontos, true);  // << NOVO
            if (typeof DuvidDB !== "undefined") {
                DuvidDB.addGlobinhos(pontos);
            }
        } else {
            playSom('erro');
            this.feedbackVisualErro();
            this.mostrarXPFlutuante(0, false);      // << NOVO — mostra -♥
        }
    },

exibirModalSimulado: function (passou, acertos, total, ganhouBonus = false) {
    const modal = document.getElementById('id01');
    if (!modal) return;

    // Título — 3 cenários
    let titulo, frase;

    if (passou && ganhouBonus) {
        titulo = '🏆 AULA PERFEITA!';
        frase = 'Você terminou sem perder nenhuma vida. Bônus de +' + BONUS_VIDAS + ' globinhos conquistado!';
    } else if (passou) {
        titulo = '🎉 PARABÉNS!';
        frase = typeof getFrasePainel === "function" ? getFrasePainel() : 'Missão cumprida!';
    } else {
        titulo = '↺ TENTAR NOVAMENTE';
        frase = 'Você não atingiu 60%. Releia o texto e tente de novo — você consegue!';
    }

    this._atualizarElemento('modal-titulo', titulo);
    this._atualizarElemento('modal-frase-motivacional', frase);

    const pFeedback = document.getElementById('modal-feedback-principal');
    if (pFeedback) {
        pFeedback.innerHTML = `Você acertou <br>
            <span class="w3-xxlarge"><b>${acertos}</b></span> de ${total} questões!
            ${ganhouBonus ? '<br><span class="w3-text-amber"><b>+' + BONUS_VIDAS + ' bônus ❤️❤️❤️</b></span>' : ''}`;
    }

    // Efeitos — bônus tem comemoração especial
    if (passou) {
        if (typeof playSomFinal === "function") playSomFinal(true);
        if (ganhouBonus) {
            // Confete duplo para o bônus
            if (typeof dispararComemoracao === "function") {
                dispararComemoracao();
                setTimeout(dispararComemoracao, 600);
            }
        } else {
            if (typeof dispararComemoracao === "function") dispararComemoracao();
        }
    } else {
        if (typeof playSomFinal === "function") playSomFinal(false);
    }

    // Botão de tentar novamente — só aparece se não passou
    const btnTentar = document.getElementById('btn-tentar-novamente');
    if (btnTentar) {
        btnTentar.style.display = passou ? 'none' : 'block';
    }

    modal.style.display = 'block';
},

    // Dentro do objeto DuvidUI:

    /**
     * Estiliza um grupo de opções (Radio Buttons) com base no acerto/erro.
     * @param {NodeList|Array} opcoes - Lista de elementos radio.
     * @param {HTMLElement} selecionado - O elemento que o aluno clicou.
     * @param {boolean} isCorreto - Se a resposta foi certa.
     */

    // Dentro do objeto DuvidUI:

    estilizarResultadoQuestao: function (indexUsuario, indexCorreto) {
        // Busca todas as alternativas da questão atual na tela
        const itens = document.querySelectorAll('.item-resposta');

        itens.forEach((container, i) => {
            // Bloqueia o rádio para não mudar a resposta
            const radio = container.querySelector('input');
            if (radio) radio.disabled = true;

            const label = container.querySelector('label');
            const isAcerto = (i === indexCorreto);
            const isErroUsuario = (i === indexUsuario && indexUsuario !== indexCorreto);

            // Definição das Cores (Com suporte a Dark Mode)
            const cores = {
                correto: { bg: "#e8f5e9", texto: "#2e7d32" },
                errado: { bg: "#ffebee", texto: "#c62828" }
            };



            // APLICAÇÃO DOS ESTILOS
            if (isAcerto) {
                this._aplicarCoresFieis(container, label, cores.correto);
            }
            else if (isErroUsuario) {
                this._aplicarCoresFieis(container, label, cores.errado);
            }
            else {
                // Esmaece as outras para dar foco no resultado
                container.style.opacity = "0.4";
                container.style.filter = "grayscale(1)";
            }
        });
    },

    // Helper para manter o padrão visual fiel ao seu original
    _aplicarCoresFieis: function (container, label, c) {
        if (container) {
            container.style.backgroundColor = c.bg;
            container.style.transition = "all 0.4s ease";
        }
        if (label) {
            label.style.color = c.texto;
            label.style.fontWeight = "bold";
        }
    },

    /**
     * Faz um scroll suave até um elemento específico.
     * @param {string} id - O ID do elemento de destino.
     * @param {string} bloco - Alinhamento: 'start', 'center' ou 'end'. Padrão: 'start'.
     */
    scrollParaElemento: function (id, bloco = 'start') {
        // Pequeno delay para garantir que animações de modal ou transições de cor já começaram
        setTimeout(() => {
            const elemento = document.getElementById(id);

            if (elemento) {
                elemento.scrollIntoView({
                    behavior: 'smooth',
                    block: bloco
                });
            } else {
                console.warn(`[DuvidUI] Elemento com ID "${id}" não encontrado para scroll.`);
            }
        }, 300); // 300ms é o tempo ideal para não parecer travado e esperar o DOM
    },
}


// 2. FRASES DINÂMICAS (Para o banner de acerto)
function getFraseSucesso() {
    const frases = [
        "Exato! Você acertou.", "Muito bem! Resposta correta.",
        "Incrível! Você está mandando ver.", "Na mosca! Parabéns.",
        "Isso mesmo! Continue assim.", "Excelente! Seu raciocínio foi perfeito.",
        "Corretíssimo! Você domina o assunto.", "Boa! Você acertou em cheio.",
        "Sensacional! Mais um acerto para a conta.", "Brilhante! Resposta nota 10."
    ];
    return frases[Math.floor(Math.random() * frases.length)];
}

function getFrasePainel() {
    const frases = [
        "Missão cumprida! Você detonou neste desafio.",
        "Aula finalizada com sucesso! Globinhos merecidos.",
        "Espetacular! Você provou que domina este tema.",
        "Isso ai! Mais uma etapa concluída.",
        "Sensacional! Você superou todos os obstáculos desta aula.",
        "Vitória garantida! Seu progresso global foi atualizado.",
        "Uau! Você fechou este ciclo com chave de ouro.",
        "Jornada concluída! Seus globinhos estão rendendo frutos."
    ];
    return frases[Math.floor(Math.random() * frases.length)];
}

function getFraseAnalise() {
    const frases = [
        "Análise de campo: Vamos observar os detalhes que passaram despercebidos?",
        "Recalculando rota! As evidências do texto sugerem outro caminho...",
        "Atenção aos sinais! No vestibular, cada palavra é uma pista.",
        "Mapeando o erro: Use a dica do professor para iluminar sua escolha.",
        "Quase lá, desbravador! Geografia exige olhar atento aos detalhes.",
        "Opa! Encontramos uma zona de dúvida. Vamos investigar a alternativa correta?",
        "Estratégia falhou? Sem problemas! Aprender com o erro é a melhor tática.",
        "Pausa para reconhecimento! Veja por que o gabarito seguiu por este lado."
    ];
    return frases[Math.floor(Math.random() * frases.length)];
}


/**
 * Mestre de Metadados: Busca no JSON do ano correto e aplica o SEO
 * @param {string|number} id - O ID da aula (ex: 101, 205)
 * @param {string} tipo - 'texto' ou 'questao' para personalizar o título
 */
// duvid-ui.js

async function configurarSEOAutomatico(id, tipo = 'texto') {
    if (!id) return;

    // Converte para string e pega o primeiro dígito
    const idStr = id.toString();
    const ano = idStr.charAt(0); // Pega '1', '2' ou '3'



    try {
        // CORREÇÃO AQUI: Use crases (atrás do P no teclado) e verifique o caminho
        // Se o arquivo estiver em /js/aulas-1ano.json, o caminho abaixo está correto
        const caminhoJson = `/js/aulas-${ano}ano.json`;

        const res = await fetch(caminhoJson);

        if (!res.ok) throw new Error(`Arquivo não encontrado: ${caminhoJson}`);

        const aulas = await res.json();

        // Encontra os dados
        const aulaDados = aulas.find(a => a.id == id);

        if (aulaDados) {
            const prefixo = tipo === 'questao' ? 'Exercícios: ' : '';

            // Chama a função de aplicação (certifique-se que ela existe no duvid-ui)
            aplicarSEO({
                titulo: `${prefixo}${aulaDados.titulo}`,
                conteudo: aulaDados.conteudo,
                imagem: aulaDados.imagem
            });

            // Atualiza o título visual
            const h1 = document.getElementById('h1') || document.getElementById('h1-questoes');
            if (h1) h1.innerText = `${prefixo}${aulaDados.titulo}`;

        } else {
            console.warn(`⚠️ Aula ${id} não encontrada no JSON do ${ano}º ano.`);
        }
    } catch (e) {
        console.error("🚨 Erro ao configurar SEO automático:", e);
    }
}
/**
 * Função Universal de SEO para o Duvid
 * @param {Object} dados - Objeto contendo titulo, conteudo (resumo) e imagem
 */
function aplicarSEO(dados) {
    // Título da Aba
    document.title = `${dados.titulo} | Duvid Geografia`;

    // Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        // Limita o resumo a 160 caracteres para o Google
        const resumo = dados.conteudo ? dados.conteudo.substring(0, 160) + "..." : "Aprenda Geografia de forma gamificada.";
        metaDesc.setAttribute('content', resumo);
    }

    // Open Graph (Redes Sociais)
    const ogTags = {
        'og:title': dados.titulo,
        'og:description': dados.conteudo,
        'og:image': window.location.origin + "/" + (dados.imagem || "fotoIndex/icones/duvid-icone.png"),
        'og:url': window.location.href
    };

    for (let prop in ogTags) {
        let el = document.querySelector(`meta[property="${prop}"]`);
        if (el) el.setAttribute('content', ogTags[prop]);
    }
}



// --- 5. FUNÇÕES GLOBAIS (Compatibilidade) ---
// Estas funções permitem que seus scripts antigos continuem funcionando chamando o novo motor UI
function atualizarInterface() {
    DuvidUI.atualizarInterface();
}

function dispararComemoracao() {
    DuvidUI.dispararComemoracao();
}

// No final do duvid-ui.js
function feedbackVisualAcerto() {
    DuvidUI.feedbackVisualAcerto();
}

function feedbackVisualErro() {
    DuvidUI.feedbackVisualErro();
}

function avisoSelecaoPendente(btn) {
    DuvidUI.avisoSelecaoPendente(btn);
}
function executarGatilhoResultado(c, p) {
    DuvidUI.executarGatilhoResultado(c, p);
}