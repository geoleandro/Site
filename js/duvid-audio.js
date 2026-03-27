// --- 1. CONFIGURAÇÃO DOS SONS ---
const AUDIO_PATHS = {
    acerto: ['/audios/acerto1.mp3', '/audios/acerto2.mp3'],
    erro: ['/audios/erro1.mp3', '/audios/erro2.mp3'],
    finalBom: '/audios/notaFinal.mp3',
    finalRuim: '/audios/notaFinal2.mp3',
    inicio: '/audios/inicioNome.mp3'
};

// --- 2. MOTOR DE ÁUDIO ---
const DuvidAudio = {
    // Toca um som aleatório de uma lista ou um arquivo fixo
    play: function (tipo) {
        let caminho = "";

        if (Array.isArray(AUDIO_PATHS[tipo])) {
            // Sorteia um som da lista (para acertos e erros não serem repetitivos)
            const lista = AUDIO_PATHS[tipo];
            caminho = lista[Math.floor(Math.random() * lista.length)];
        } else {
            caminho = AUDIO_PATHS[tipo];
        }

        if (caminho) {
            const audio = new Audio(caminho);
            audio.volume = (tipo === 'erro') ? 0.4 : 0.5; // Erro um pouco mais baixo
            audio.play().catch(e => console.warn("Áudio aguardando interação do usuário."));
        }
    },

    // Função específica para o final das aulas
    playResultadoFinal: function (vitoria) {
        const caminho = vitoria ? AUDIO_PATHS.finalBom : AUDIO_PATHS.finalRuim;
        const audio = new Audio(caminho);
        audio.currentTime = 0; // Rebobina
        audio.play().catch(e => console.log("Erro ao tocar som final."));
    }
};

// --- 3. FUNÇÕES GLOBAIS (Para manter compatibilidade com seu código antigo) ---
// Assim você não precisa mudar nada nos seus HTMLs por enquanto!

// --- No final do duvid-audio.js ---

// Função para tocar o som de boas-vindas (antigo SOM_INCIO_NOME)
function playSomInicio() {
    DuvidAudio.play('inicio');
}

// Mantendo a compatibilidade com seus scripts de texto
function playSom(tipo) {
    DuvidAudio.play(tipo);
}

function playSomFinal(vitoria) {
    DuvidAudio.playResultadoFinal(vitoria);
}