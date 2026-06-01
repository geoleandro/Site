/**
 * glossario.js — Sistema de Palavras-Clicáveis do Duvid
 *
 * Como usar no HTML:
 *   <span class="termo" data-palavra="Técnica" data-definicao="meios que alteram a natureza">técnica</span>
 *
 * No final do texto, coloque:
 *   <div id="ficha-conceitos"></div>
 *
 * Carregue este script com <script src="/estilos/glossario.js" defer></script>
 */

(function () {

  // ── Injeta o CSS da ficha e dos termos se ainda não existir ──────────────
  if (!document.getElementById('glossario-style')) {
    const style = document.createElement('style');
    style.id = 'glossario-style';
    style.textContent = `
      /* Palavra destacada no texto */
      .termo {
        position: relative;
        cursor: pointer;
        font-weight: bold;
        color: #1a4d8f;
        background: #fff9c4;
        padding: 1px 5px;
        border-radius: 5px;
        border-bottom: 2px dashed #f9a825;
        transition: background 0.25s, transform 0.15s;
        display: inline-block;
      }
      .termo::after { content: " 💡"; font-size: 0.8em; }
      .termo:hover  { background: #ffe082; transform: scale(1.04); }
      .termo.coletado {
        background: #c8e6c9;
        border-bottom: 2px solid #388e3c;
        color: #1b5e20;
        cursor: default;
      }
      .termo.coletado::after { content: " ✅"; }

      /* Tooltip balão */
      .termo-tooltip {
        display: none;
        position: absolute;
        top: calc(100% + 10px);
        left: 0;
        min-width: 240px;
        max-width: 320px;
        background: #fff;
        border-left: 5px solid #1976d2;
        border-radius: 8px;
        padding: 10px 14px;
        box-shadow: 0 6px 20px rgba(0,0,0,0.18);
        font-size: 0.88em;
        font-weight: normal;
        line-height: 1.5;
        z-index: 999;
        animation: glossFadeIn 0.2s ease;
        white-space: normal;
      }
      .termo-tooltip::before {
        content: "";
        position: absolute;
        top: -9px; left: 14px;
        border: 9px solid transparent;
        border-bottom-color: #1976d2;
      }
      .termo-tooltip.visible { display: block; }

      /* Mini feedback "+2 🌍" flutuante */
      .gloss-feedback {
        position: absolute;
        top: -28px;
        left: 50%;
        transform: translateX(-50%);
        background: #43a047;
        color: #fff;
        font-size: 0.78em;
        font-weight: bold;
        padding: 2px 8px;
        border-radius: 20px;
        pointer-events: none;
        animation: glossSubir 1.2s ease forwards;
        white-space: nowrap;
        z-index: 1000;
      }
      @keyframes glossSubir {
        0%   { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-30px); }
      }
      @keyframes glossFadeIn {
        from { opacity: 0; transform: translateY(-6px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      /* Ficha de Conceitos */
      #ficha-conceitos {
        margin-top: 32px;
        border: 2px solid #a5d6a7;
        border-radius: 12px;
        padding: 20px 24px;
        background: #f1f8e9;
        display: none; /* aparece ao primeiro conceito coletado */
      }
      #ficha-conceitos h3 {
        margin: 0 0 12px;
        font-size: 1em;
        color: #2e7d32;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      #ficha-conceitos .contador {
        font-size: 0.8em;
        color: #558b2f;
        margin-bottom: 14px;
      }
      #lista-glossario {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      #lista-glossario li {
        background: #fff;
        border: 1px solid #c5e1a5;
        border-left: 4px solid #66bb6a;
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 0.88em;
        line-height: 1.4;
        animation: glossFadeIn 0.3s ease;
        max-width: 280px;
      }
      #lista-glossario li b { color: #2e7d32; }
    `;
    document.head.appendChild(style);
  }

  // ── Cria (ou encontra) a ficha de conceitos ──────────────────────────────
  function garantirFicha() {
    let ficha = document.getElementById('ficha-conceitos');
    if (!ficha) return null;

    // Adiciona estrutura interna se ainda não tiver
    if (!ficha.querySelector('h3')) {
      ficha.innerHTML = `
        <h3>📋 Ficha de Conceitos</h3>
        <p class="contador" id="gloss-contador">0 termos coletados</p>
        <ul id="lista-glossario"></ul>
      `;
    }
    return ficha;
  }

  function atualizarContador() {
    const contador = document.getElementById('gloss-contador');
    if (!contador) return;
    const n = document.querySelectorAll('#lista-glossario li').length;
    contador.textContent = `${n} ${n === 1 ? 'termo coletado' : 'termos coletados'}`;
  }

  // ── Ativa todos os .termo da página ──────────────────────────────────────
  function ativarGlossario(container) {
    container = container || document;
    container.querySelectorAll('.termo').forEach(function (termo) {
      if (termo.dataset.glossarioAtivo) return;
      termo.dataset.glossarioAtivo = 'true';

      const palavra   = termo.dataset.palavra   || termo.textContent.trim();
      const definicao = termo.dataset.definicao || '';

      // Cria tooltip
      const tooltip = document.createElement('span');
      tooltip.className = 'termo-tooltip';
      tooltip.innerHTML = `<b>${palavra}</b>: ${definicao}`;
      termo.appendChild(tooltip);

      termo.addEventListener('click', function (e) {
        e.stopPropagation();

        // ── 1. Mostra/fecha tooltip ────────────────────────────────────────
        const jaAberto = tooltip.classList.contains('visible');
        document.querySelectorAll('.termo-tooltip.visible').forEach(function (t) {
          t.classList.remove('visible');
        });
        if (jaAberto) return;
        tooltip.classList.add('visible');

        // ── 2. Se já foi coletado, só mostra tooltip ───────────────────────
        if (termo.classList.contains('coletado')) return;

        // ── 3. Marca como coletado ─────────────────────────────────────────
        termo.classList.add('coletado');

        // ── 4. Som ────────────────────────────────────────────────────────
        if (typeof playSom === 'function') {
          playSom('acerto');
        }

        // ── 5. +2 Globinhos ───────────────────────────────────────────────
        if (typeof DuvidDB !== 'undefined' && DuvidDB.addGlobinhos) {
          DuvidDB.addGlobinhos(2);
          if (typeof atualizarInterface === 'function') atualizarInterface();
          if (typeof feedbackVisualAcerto === 'function') feedbackVisualAcerto();
        }

        // ── 6. Mini feedback flutuante "+2 🌍" ────────────────────────────
        const fb = document.createElement('span');
        fb.className = 'gloss-feedback';
        fb.textContent = '+2 🌍';
        termo.appendChild(fb);
        setTimeout(function () { fb.remove(); }, 1300);

        // ── 7. Adiciona à Ficha de Conceitos ──────────────────────────────
        const ficha = garantirFicha();
        if (ficha) {
          ficha.style.display = 'block';
          const lista = document.getElementById('lista-glossario');
          const jaExiste = lista && [...lista.querySelectorAll('li')]
            .some(function (li) { return li.dataset.palavra === palavra; });

          if (!jaExiste && lista) {
            const item = document.createElement('li');
            item.dataset.palavra = palavra;
            item.innerHTML = `<b>${palavra}</b>: ${definicao}`;
            lista.appendChild(item);
            atualizarContador();

            // Rolagem suave para a ficha na primeira coleta
            if (lista.querySelectorAll('li').length === 1) {
              setTimeout(function () {
                ficha.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }, 400);
            }
          }
        }
      });
    });

    // Fecha tooltip ao clicar fora
    document.addEventListener('click', function () {
      document.querySelectorAll('.termo-tooltip.visible').forEach(function (t) {
        t.classList.remove('visible');
      });
    });
  }

  // ── Inicialização ─────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { ativarGlossario(); });
  } else {
    ativarGlossario();
  }

  // Expõe para uso externo (caso queira ativar num container específico depois)
  window.ativarGlossario = ativarGlossario;

})();
