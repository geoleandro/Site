// --- 1. CONFIGURAÇÃO DOS SONS ---
const AUDIO_PATHS = {
    acerto: ['/audios/acerto1.mp3', '/audios/acerto2.mp3', '/audios/acerto3.mp3', '/audios/acerto4.mp3'],
    erro: ['/audios/erro1.mp3', '/audios/erro2.mp3', '/audios/erro3.mp3', '/audios/erro4.mp3'],
    combo: ['/audios/combo.mp3'],   // << marco de combo (3/5/7) — coloque seu mp3 retrô aqui
    dica: ['/audios/dica.mp3'],     // << ao abrir a dica do professor
    finalBom: '/audios/notaFinal.mp3',
    finalRuim: '/audios/notaFinal2.mp3',
    inicio: '/audios/inicioNome.mp3'
};

// --- 2. MOTOR DE ÁUDIO ---
const DuvidAudio = {

    _pool: {},
    _pronto: false,
    _muto: false,   // << liga/desliga global de todos os sons

    // Pré-carrega todos os sons na primeira interação do usuário
    // (browsers bloqueiam áudio antes de qualquer clique — por isso não é no load)
    inicializar: function () {
        if (this._pronto) return;

        for (const tipo in AUDIO_PATHS) {
            const caminhos = Array.isArray(AUDIO_PATHS[tipo])
                ? AUDIO_PATHS[tipo]
                : [AUDIO_PATHS[tipo]];

            this._pool[tipo] = caminhos.map(caminho => {
                const audio = new Audio(caminho);
                audio.volume = (tipo === 'erro') ? 0.4 : 0.5;
                audio.load(); // pré-carrega sem tocar
                return audio;
            });
        }

        this._pronto = true;
    },

    // Pega um Audio do pool e toca — sem criar objeto novo
    play: function (tipo) {
        if (this._muto) return;        // << respeita o liga/desliga
        this.inicializar(); // garante que o pool existe

        const lista = this._pool[tipo];
        if (!lista || lista.length === 0) return;

        // Sorteia um da lista (acerto1 ou acerto2, etc.)
        const audio = lista[Math.floor(Math.random() * lista.length)];

        // Rebobina caso o som anterior ainda não tenha terminado
        audio.currentTime = 0;
        audio.play().catch(() => {
            // Silencia o erro de "autoplay bloqueado" ou arquivo ausente — normal
        });
    },

    playResultadoFinal: function (vitoria) {
        if (this._muto) return;        // << respeita o liga/desliga
        this.inicializar();

        const tipo = vitoria ? 'finalBom' : 'finalRuim';
        const lista = this._pool[tipo];
        if (!lista || lista.length === 0) return;

        const audio = lista[0];
        audio.currentTime = 0;
        audio.play().catch(() => { });
    },


    // ============================================================
    // LIGA / DESLIGA — controla todos os sons de uma vez só.
    // A preferência fica salva e vale entre páginas.
    // ============================================================
    _carregarPreferencia: function () {
        try { this._muto = localStorage.getItem('duvid_som_muto') === '1'; } catch (e) { }
    },
    setMuto: function (v) {
        this._muto = !!v;
        try { localStorage.setItem('duvid_som_muto', this._muto ? '1' : '0'); } catch (e) { }
        return this._muto;
    },
    toggleMuto: function () { return this.setMuto(!this._muto); },
    estaMudo: function () { return this._muto; }
};

// Inicializa o pool no primeiro clique em qualquer lugar da página
// Isso respeita a política de autoplay dos browsers
document.addEventListener('click', () => DuvidAudio.inicializar(), { once: true });

// Carrega a preferência de mute salva (se houver)
DuvidAudio._carregarPreferencia();

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

// Ganchos das questões + liga/desliga global
function playSomCombo() { DuvidAudio.play('combo'); }
function playSomDica() { DuvidAudio.play('dica'); }
function toggleSom() { return DuvidAudio.toggleMuto(); }
function somEstaMudo() { return DuvidAudio.estaMudo(); }
