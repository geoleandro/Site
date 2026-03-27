// --- 1. CONSTANTES DE CONFIGURAÇÃO ---
const DB_CHAVE = "duvid_globinhos";
const NOME_CHAVE = "duvid_nome";
const PATENTE_CHAVE = "duvid_patente";
const NIVEL_CHAVE = "duvid_lvl";
const RECOMPENSA_TEXTO = 10;
const RECOMPENSA_QUESTOES = 10;
const RECOMPENSA_GERAL = 20;
const TIPO_CONCLUSAO = { TEXTO: 'texto', QUESTOES: 'questoes' };




const DuvidDB = {


    getGlobinhos: function () {
        // Usa a constante para ler o saldo
        const saldo = localStorage.getItem(DB_CHAVE);
        return saldo ? parseInt(saldo) : 0;
    },


    addGlobinhos: function (quantidade) {
        // 1. Dados ANTES da soma
        let saldoAnterior = this.getGlobinhos();
        let lvlAnterior = this.getProgressoRPG().lvl;

        // 2. Realiza a soma e salva usando a Constante
        let novoSaldo = saldoAnterior + Number(quantidade);
        localStorage.setItem(DB_CHAVE, novoSaldo);

        // --- NOVIDADE AQUI: Sincroniza Patente e Nível no LocalStorage ---
        const progressoAtual = this.verificarConquistas();
        // ----------------------------------------------------------------

        let novoLvl = progressoAtual.lvl;

        // --- LÓGICA DE FEEDBACK (Sem alterações aqui, está ótima!) ---
        if (novoLvl > lvlAnterior) {

            if (typeof playSomFinal === "function") playSomFinal(true);
            if (typeof dispararComemoracao === "function") dispararComemoracao(true);
            this.exibirNotificacaoLevelUp(progressoAtual);
        } else {
            if (typeof playSom === "function") playSom('acerto');
        }

        // Atualiza elementos da interface
        window.ganhosAtuais = (window.ganhosAtuais || 0) + Number(quantidade);
        if (typeof atualizarHeaderGlobinhos === "function") atualizarHeaderGlobinhos();


    },

    // Função auxiliar para não poluir o addGlobinhos
    exibirNotificacaoLevelUp: function (progresso) {
        const notificacao = document.createElement('div');
        notificacao.innerHTML = `
            <div class="w3-animate-zoom w3-card-4 w3-round-large w3-padding" 
                 style="position:fixed; top:20px; left:50%; transform:translateX(-50%); z-index:10000; text-align:center; background-color:${progresso.cor}; color:white; min-width:250px;">
                <i class="fa fa-arrow-up w3-xlarge"></i><br>
                <b class="w3-large">SUBIU DE NÍVEL!</b><br>
                <span>Agora você é um <b>${progresso.patente}</b></span><br>
                <span class="w3-tag w3-white w3-text-black w3-round w3-margin-top">Level ${progresso.lvl}</span>
            </div>
        `;
        document.body.appendChild(notificacao);
        setTimeout(() => {
            notificacao.classList.add('w3-animate-opacity');
            setTimeout(() => notificacao.remove(), 500);
        }, 5000);
    },

    // NOVA FUNÇÃO: O "Leitor" de status blindado
    estaConcluido: function (idAula, tipo) {
        // 'tipo' deve vir da constante TIPO_CONCLUSAO (texto ou questoes)
        // Retorna true se estiver "true" no localStorage, senão retorna false
        return localStorage.getItem(`concluido_${tipo}_${idAula}`) === "true";
    },


    salvarConclusao: function (idAula, tipo) {
        localStorage.setItem(`concluido_${tipo}_${idAula}`, "true");
    },

  

    getNome: function () {
        return localStorage.getItem(NOME_CHAVE) || "";
    },

    salvarNome: function (nome) {
        if (nome.trim() !== "") {
            localStorage.setItem(NOME_CHAVE, nome.trim());
            return true;
        }
        return false;
    },
    // ADICIONE ESTA LINHA ABAIXO:
    setNome: function (nome) { return this.salvarNome(nome); },


    // NOVA FUNÇÃO CENTRALIZADA (Versão Blindada)
    // --- No duvid-db.js ---

    getProgressoAcademico: function (aulas) {
        // 1. Cláusula de Guarda (Fail Fast)
        if (!Array.isArray(aulas) || aulas.length === 0) {
            return { concluidas: 0, total: 0, porc: 0 };
        }

        // 2. Filtramos apenas aulas que realmente existem (Segurança)
        const aulasValidas = aulas.filter(aula => aula && aula.id);
        const total = aulasValidas.length;

        // 3. Processamento Único (Single Responsibility)
        // Uma aula só conta como "concluída" se tiver Texto E Questões
        const concluidas = aulasValidas.filter(aula => {
            return this.estaConcluido(aula.id, TIPO_CONCLUSAO.TEXTO) &&
                this.estaConcluido(aula.id, TIPO_CONCLUSAO.QUESTOES);
        }).length;


        // 4. Objeto de Retorno Calculado
        return {
            concluidas,
            total,
            porc: total > 0 ? Math.round((concluidas / total) * 100) : 0
        };

    },

    RANKING_SISTEMA: [
        { lvl: 1, patente: "NOVATO", min: 0, max: 1000, cor: "#9d9d9d" },
        { lvl: 2, patente: "EXPLORADOR", min: 1001, max: 3500, cor: "#4caf50" },
        { lvl: 3, patente: "CARTÓGRAFO", min: 3501, max: 8000, cor: "#2196f3" },
        { lvl: 4, patente: "ESTRATEGISTA", min: 8001, max: 15000, cor: "#9c27b0" },
        { lvl: 5, patente: "GEÓGRAFO SÊNIOR", min: 15001, max: 20000, cor: "#ff9800" },
        { lvl: 6, patente: "LENDA DA TERRA", min: 20001, max: 99999, cor: "#f44336" }
    ],

    getProgressoRPG: function () {
    let saldo = this.getGlobinhos();

    // 1. Encontra o nível ATUAL
    const indexAtual = this.RANKING_SISTEMA.findIndex(r => saldo >= r.min && saldo <= r.max);
    const i = indexAtual !== -1 ? indexAtual : this.RANKING_SISTEMA.length - 1;
    const info = this.RANKING_SISTEMA[i];

    // 2. Cálculo de XP Relativo (O segredo da barra honesta)
    // Subtraímos o 'min' para a barra começar do zero em cada nível
    let xpNoNivel = saldo - info.min;
    let totalFaixaNivel = info.max - info.min;
    let porcentagem = (xpNoNivel / totalFaixaNivel) * 100;

    return {
        lvl: info.lvl,
        patente: info.patente,
        cor: info.cor,
        
        // CORREÇÃO AQUI: O objetivo visual deve ser o MAX do nível ATUAL.
        // Assim, quando chegar em 3500, a barra enche e o texto diz 3500.
        proximoLvl: info.max, 
        
        // Enviamos o valor mínimo para a UI saber onde "zerar" o contador se precisar
        xpMinimo: info.min,

        progressoBarra: Math.min(Math.max(porcentagem, 2), 100), // Mínimo 2% para não sumir
        saldoAtual: saldo
    };
},



    verificarConquistas: function () {
        const progresso = this.getProgressoRPG();

        // Usando as novas constantes para salvar
        localStorage.setItem(PATENTE_CHAVE, progresso.patente);
        localStorage.setItem(NIVEL_CHAVE, progresso.lvl);

        console.log(`[RPG] Status Sincronizado: ${progresso.patente} (Nível ${progresso.lvl})`);

        return progresso;
    },

};

