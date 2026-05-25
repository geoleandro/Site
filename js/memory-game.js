/* =====================================================
   memory-game.js — Jogo da Memória
   
   Como usar:
   1. Defina a variável PAIRS antes de carregar este script
      (ou deixe vazia para usar o exemplo padrão)
   2. Adicione ao HTML:
        <div id="memory-game-root"></div>
   3. O jogo monta a si mesmo automaticamente.
   ===================================================== */

(function () {

    /* --------------------------------------------------
       Pares padrão (substituídos por window.PAIRS se definido)
    -------------------------------------------------- */
    const DEFAULT_PAIRS = [
        { id: 1, emoji: '🏭', concept: 'Industrialização',  pair: 'Fábricas',           group: 'Produção',         color: '#1D9E75' },
        { id: 2, emoji: '🌐', concept: 'Globalização',      pair: 'Conexão mundial',     group: 'Economia',         color: '#185FA5' },
        { id: 3, emoji: '💡', concept: 'Tecnologia',         pair: 'Inovação',            group: 'MTCI',             color: '#BA7517' },
        { id: 4, emoji: '🏢', concept: 'Multinacionais',     pair: 'Presença global',     group: 'Empresas',         color: '#993556' },
        { id: 5, emoji: '🔩', concept: 'Fordismo',           pair: 'Produção em massa',   group: 'Sistemas',         color: '#534AB7' },
        { id: 6, emoji: '🏛️', concept: 'Keynesianismo',      pair: 'Intervenção estatal', group: 'Política econômica', color: '#993C1D' },
    ];

    /* --------------------------------------------------
       Estado do jogo
    -------------------------------------------------- */
    let flipped  = [];
    let matched  = [];
    let tries    = 0;
    let locked   = false;

    /* --------------------------------------------------
       Utilitários
    -------------------------------------------------- */
    function shuffle(arr) {
        return [...arr].sort(() => Math.random() - 0.5);
    }

    function buildCards(pairs) {
        const cards = [];
        pairs.forEach(p => {
            cards.push({ id: p.id, text: p.concept, emoji: p.emoji, group: p.group, color: p.color });
            cards.push({ id: p.id, text: p.pair,    emoji: p.emoji, group: p.group, color: p.color });
        });
        return shuffle(cards);
    }

    /* --------------------------------------------------
       Renderiza o HTML do jogo no elemento #memory-game-root
    -------------------------------------------------- */
    function renderShell(root, title, pairs) {
        root.innerHTML = `
        <div class="memory-game-wrap">

            <div class="memory-header">
                <div class="memory-title">Memória: <span>${title}</span></div>
                <div class="memory-stats">
                    <div class="memory-stat-pill">
                        Tentativas <span class="val" id="mg-tries">0</span>
                    </div>
                    <div class="memory-stat-pill">
                        Pares <span class="val" id="mg-pairs">0</span>/${pairs.length}
                    </div>
                    <button class="memory-btn-restart" id="mg-restart" aria-label="Novo jogo">
                        ↺ Novo jogo
                    </button>
                </div>
            </div>

            <div class="memory-board" id="mg-board" role="grid" aria-label="Jogo da memória">
            </div>

            <div class="memory-win-banner" id="mg-win">
                <div class="memory-win-big">🎉</div>
                <p id="mg-win-msg"></p>
            </div>

            <div class="memory-legend" id="mg-legend"></div>

        </div>`;

        document.getElementById('mg-restart').addEventListener('click', initGame);
    }

    /* --------------------------------------------------
       Inicia (ou reinicia) o jogo
    -------------------------------------------------- */
    function initGame() {
        const pairs = (window.PAIRS && window.PAIRS.length) ? window.PAIRS : DEFAULT_PAIRS;

        flipped = [];
        matched = [];
        tries   = 0;
        locked  = false;

        document.getElementById('mg-tries').textContent = 0;
        document.getElementById('mg-pairs').textContent = 0;
        document.getElementById('mg-win').classList.remove('show');

        renderBoard(pairs);
        renderLegend(pairs);
    }

    /* --------------------------------------------------
       Monta o tabuleiro com as cartas embaralhadas
    -------------------------------------------------- */
    function renderBoard(pairs) {
        const board = document.getElementById('mg-board');
        board.innerHTML = '';

        buildCards(pairs).forEach((card) => {
            const slot = document.createElement('div');
            slot.className = 'memory-card-slot';
            slot.setAttribute('role', 'gridcell');
            slot.setAttribute('aria-label', 'Carta oculta');
            slot.dataset.id = card.id;

            slot.innerHTML = `
                <div class="memory-card-inner">

                    <div class="memory-card-face memory-card-back" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none"
                             stroke="white" stroke-width="2" stroke-linecap="round">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                    </div>

                    <div class="memory-card-face memory-card-front">
                        <div class="memory-card-emoji">${card.emoji}</div>
                        <div class="memory-card-label">${card.text}</div>
                        <div class="memory-card-group">${card.group}</div>
                    </div>

                </div>`;

            slot.addEventListener('click', () => onCardClick(slot, card, pairs));
            board.appendChild(slot);
        });
    }

    /* --------------------------------------------------
       Clique em uma carta
    -------------------------------------------------- */
    function onCardClick(slot, card, pairs) {
        if (locked) return;
        if (slot.classList.contains('flipped'))  return;
        if (slot.classList.contains('matched'))  return;

        slot.classList.add('flipped');
        slot.setAttribute('aria-label', card.text);
        flipped.push({ slot, card });

        if (flipped.length === 2) {
            locked = true;
            tries++;
            document.getElementById('mg-tries').textContent = tries;
            checkMatch(pairs);
        }
    }

    /* --------------------------------------------------
       Toca som via DuvidAudio (se disponível na página)
    -------------------------------------------------- */
 

    /* --------------------------------------------------
       Verifica se as duas cartas viradas formam par
    -------------------------------------------------- */
    function checkMatch(pairs) {
        const [a, b] = flipped;

        if (a.card.id === b.card.id) {

            /* Par correto */
            matched.push(a.card.id);
            playSom('acerto'); // Som de acerto

            setTimeout(() => {
                a.slot.classList.add('matched');
                b.slot.classList.add('matched');
                flipped = [];
                locked  = false;

                document.getElementById('mg-pairs').textContent = matched.length;

                if (matched.length === pairs.length) {
                    showWin();
                }
            }, 400);

        } else {

            /* Par errado: shake e vira de volta */
            playSom('erro'); // Som de erro

            setTimeout(() => {
                a.slot.classList.add('wrong');
                b.slot.classList.add('wrong');

                setTimeout(() => {
                    a.slot.classList.remove('flipped', 'wrong');
                    b.slot.classList.remove('flipped', 'wrong');
                    a.slot.setAttribute('aria-label', 'Carta oculta');
                    b.slot.setAttribute('aria-label', 'Carta oculta');
                    flipped = [];
                    locked  = false;
                }, 500);
            }, 700);
        }
    }

    /* --------------------------------------------------
       Exibe banner de vitória com avaliação
    -------------------------------------------------- */
    function showWin() {
        const banner = document.getElementById('mg-win');
        const msg    = document.getElementById('mg-win-msg');
        const pairs  = (window.PAIRS && window.PAIRS.length) ? window.PAIRS : DEFAULT_PAIRS;

        const ideal  = pairs.length;
        const bom    = tries <= ideal + 6;

        const rating = tries <= ideal + 2 ? '🌟 Excelente!'
                     : bom                ? '👍 Muito bem!'
                     :                     '✅ Completado!';

        /* Som de vitória: finalBom se foi bem, finalRuim se demorou */
        playSound(bom ? 'finalBom' : 'finalRuim');

        msg.textContent = `${rating} Todos os pares em ${tries} tentativas.`;
        banner.classList.add('show');
    }

    /* --------------------------------------------------
       Legenda de categorias
    -------------------------------------------------- */
    function renderLegend(pairs) {
        const leg = document.getElementById('mg-legend');
        leg.innerHTML = '';

        const seen = new Set();
        pairs.forEach(p => {
            if (seen.has(p.group)) return;
            seen.add(p.group);

            const item = document.createElement('div');
            item.className = 'memory-legend-item';
            item.innerHTML = `
                <span class="memory-legend-dot" style="background:${p.color}"></span>
                ${p.group}`;
            leg.appendChild(item);
        });
    }

    /* --------------------------------------------------
       Bootstrap: aguarda o DOM e monta o jogo
    -------------------------------------------------- */
    function mount() {
        const root = document.getElementById('memory-game-root');
        if (!root) {
            console.warn('[memory-game.js] Elemento #memory-game-root não encontrado.');
            return;
        }

        const pairs = (window.PAIRS && window.PAIRS.length) ? window.PAIRS : DEFAULT_PAIRS;
        const title = window.MEMORY_TITLE || 'Conceitos';

        renderShell(root, title, pairs);
        initGame();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mount);
    } else {
        mount();
    }

})();