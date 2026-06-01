/**
 * glossario.js — Sistema de Palavras-Clicáveis do Duvid
 *
 * Como usar no HTML:
 *   <span class="termo" data-palavra="Técnica" data-definicao="meios que alteram a natureza">técnica</span>
 *
 * No final do texto, coloque:
 *   <div id="ficha-conceitos"></div>
 *
 * CSS: /estilos/explicacaoPalavra.css
 * JS:  /js/glossario.js
 *
 * Carregue com:
 *   <link rel="stylesheet" href="/estilos/explicacaoPalavra.css">
 *   <script src="/js/glossario.js" defer></script>
 */

(function () {

  // ── Cria (ou encontra) a ficha de conceitos ──────────────────────────────
  function garantirFicha() {
    const ficha = document.getElementById('ficha-conceitos');
    if (!ficha) return null;

    if (!ficha.querySelector('h3')) {
      ficha.innerHTML = `
        <div class="ficha-header">
          <h3>📋 Ficha de Conceitos</h3>
          <span class="ficha-badge" id="ficha-badge">0</span>
        </div>
        <ul id="lista-glossario"></ul>
      `;
    }
    return ficha;
  }

  function atualizarContador() {
    const lista = document.getElementById('lista-glossario');
    const badge = document.getElementById('ficha-badge');
    if (!lista || !badge) return;
    const n = lista.querySelectorAll('li').length;
    badge.textContent = n;
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
      tooltip.innerHTML = `<b>${palavra}</b><br>${definicao}`;
      termo.appendChild(tooltip);

      termo.addEventListener('click', function (e) {
        e.stopPropagation();

        // Já coletado: apenas abre/fecha tooltip
        if (termo.classList.contains('coletado')) {
          tooltip.classList.toggle('visible');
          return;
        }

        // Fecha outros tooltips abertos e remove a classe ativo dos outros termos
        document.querySelectorAll('.termo-tooltip.visible').forEach(function (t) {
          t.classList.remove('visible');
        });
        document.querySelectorAll('.termo.ativo').forEach(function (t) {
          t.classList.remove('ativo');
        });
        tooltip.classList.add('visible');
        termo.classList.add('ativo');

        // Marca como coletado (evita dupla contagem)
        termo.classList.add('coletado');

        // ── Som ───────────────────────────────────────────────────────────
        if (typeof playSom === 'function') {
          playSom('acerto');
        }

        // ── +2 Globinhos ──────────────────────────────────────────────────
        if (typeof DuvidDB !== 'undefined' && DuvidDB.addGlobinhos) {
          DuvidDB.addGlobinhos(2);
          if (typeof atualizarInterface === 'function') atualizarInterface();
          if (typeof feedbackVisualAcerto === 'function') feedbackVisualAcerto();
        }

        // ── Feedback flutuante "+2 🌍" ─────────────────────────────────────
        const fb = document.createElement('span');
        fb.className = 'gloss-feedback';
        fb.textContent = '+2 🌍';
        termo.appendChild(fb);
        setTimeout(function () { fb.remove(); }, 1400);

        // ── Adiciona à Ficha de Conceitos ─────────────────────────────────
        const ficha = garantirFicha();
        if (ficha) {
          ficha.style.display = 'block';
          const lista = document.getElementById('lista-glossario');
          if (lista) {
            const jaExiste = [...lista.querySelectorAll('li')]
              .some(function (li) { return li.dataset.palavra === palavra; });

            if (!jaExiste) {
              const item = document.createElement('li');
              item.dataset.palavra = palavra;
              item.innerHTML = `<b>${palavra}</b>${definicao}`;
              lista.appendChild(item);
              atualizarContador();

              // Rola suavemente para a ficha apenas em desktop
              const isMobile = window.innerWidth <= 600;
              if (!isMobile && lista.querySelectorAll('li').length === 1) {
                setTimeout(function () {
                  ficha.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 400);
              }
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
      document.querySelectorAll('.termo.ativo').forEach(function (t) {
        t.classList.remove('ativo');
      });
    });
  }

  // ── Inicialização ─────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { ativarGlossario(); });
  } else {
    ativarGlossario();
  }

  // Expõe para uso externo (ex: ativar num container carregado dinamicamente)
  window.ativarGlossario = ativarGlossario;

})();
