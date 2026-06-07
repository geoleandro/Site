/**
 * glossario.js - Sistema de Palavras-Clicaveis do Duvid
 *
 * Como usar no HTML:
 *   <span class="termo" data-palavra="Tecnica" data-definicao="meios que alteram a natureza">tecnica</span>
 *
 * No final do texto, coloque:
 *   <div id="ficha-conceitos"></div>
 *
 * Carregue este script com <script src="/estilos/glossario.js" defer></script>
 */

(function () {

  // -- Injeta o CSS da ficha e dos termos se ainda nao existir
  if (!document.getElementById('glossario-style')) {
    var style = document.createElement('style');
    style.id = 'glossario-style';
    style.textContent = [
      '/* Palavra destacada no texto */',
      '.termo {',
      '  position: relative;',
      '  z-index: 1;',
      '  cursor: pointer;',
      '  font-weight: bold;',
      '  color: #1a4d8f;',
      '  background: #fff9c4;',
      '  padding: 1px 5px;',
      '  border-radius: 5px;',
      '  border-bottom: 2px dashed #f9a825;',
      '  transition: background 0.25s, transform 0.15s;',
      '  display: inline-block;',
      '}',
      '.termo::after { content: " "; font-size: 0.8em; }',
      '.termo:hover  { background: #ffe082; transform: scale(1.04); }',
      '.termo.coletado {',
      '  background: #c8e6c9;',
      '  border-bottom: 2px solid #388e3c;',
      '  color: #1b5e20;',
      '  cursor: default;',
      '}',
      '.termo.coletado::after { content: " ok"; font-size: 0.75em; }',
      '/* Eleva o .termo ativo acima dos demais */',
      '.termo.ativo { z-index: 200 !important; }',

      '/* Tooltip balao - desktop */',
      '.termo-tooltip {',
      '  display: none;',
      '  position: absolute;',
      '  top: calc(100% + 10px);',
      '  left: 0;',
      '  min-width: 240px;',
      '  max-width: 320px;',
      '  max-height: 220px;',
      '  overflow-y: auto;',
      '  background: #fff;',
      '  border-left: 5px solid #1976d2;',
      '  border-radius: 8px;',
      '  padding: 10px 14px;',
      '  box-shadow: 0 6px 20px rgba(0,0,0,0.18);',
      '  font-size: 1em;',
      '  font-weight: normal;',
      '  line-height: 1.5;',
      '  z-index: 9999;',
      '  animation: glossFadeIn 0.2s ease;',
      '  white-space: normal;',
      '}',
      '.termo-tooltip::before {',
      '  content: "";',
      '  position: absolute;',
      '  top: -9px; left: 14px;',
      '  border: 9px solid transparent;',
      '  border-bottom-color: #1976d2;',
      '}',
      '.termo-tooltip.visible { display: block; }',

      '/* Tooltip mobile - vive em <body>, fora de qualquer transform */',
      '#gloss-mobile-tooltip {',
      '  display: none;',
      '  position: fixed;',
      '  left: 4px;',
      '  right: 4px;',
      '  bottom: 16px;',
      '  max-height: 38vh;',
      '  overflow-y: auto;',
      '  background: #fff;',
      '  border-left: 5px solid #1976d2;',
      '  border-radius: 12px;',
      '  padding: 12px 16px;',
      '  box-shadow: 0 -4px 24px rgba(0,0,0,0.3);',
      '  font-size: 0.9em;',
      '  font-weight: normal;',
      '  line-height: 1.5;',
      '  z-index: 99999;',
      '  white-space: normal;',
      '}',
      '#gloss-mobile-tooltip.visible { display: block; }',

      '/* Mini feedback flutuante */',
      '.gloss-feedback {',
      '  position: absolute;',
      '  top: -28px;',
      '  left: 50%;',
      '  transform: translateX(-50%);',
      '  background: #43a047;',
      '  color: #fff;',
      '  font-size: 1em;',
      '  font-weight: bold;',
      '  padding: 2px 8px;',
      '  border-radius: 20px;',
      '  pointer-events: none;',
      '  animation: glossSubir 1.2s ease forwards;',
      '  white-space: nowrap;',
      '  z-index: 1000;',
      '}',
      '@keyframes glossSubir {',
      '  0%   { opacity: 1; transform: translateX(-50%) translateY(0); }',
      '  100% { opacity: 0; transform: translateX(-50%) translateY(-30px); }',
      '}',
      '@keyframes glossFadeIn {',
      '  from { opacity: 0; transform: translateY(-6px); }',
      '  to   { opacity: 1; transform: translateY(0); }',
      '}',

      '/* Ficha de Conceitos */',
      '#ficha-conceitos {',
      '  margin-top: 32px;',
      '  border: 2px solid #a5d6a7;',
      '  border-radius: 12px;',
      '  padding: 20px 24px;',
      '  background: #f1f8e9;',
      '  display: none;',
      '}',
      '#ficha-conceitos h3 {',
      '  margin: 0 0 12px;',
      '  font-size: 1em;',
      '  color: #2e7d32;',
      '  text-transform: uppercase;',
      '  letter-spacing: 0.05em;',
      '}',
      '#ficha-conceitos .contador {',
      '  font-size: 0.8em;',
      '  color: #558b2f;',
      '  margin-bottom: 14px;',
      '}',
      '#lista-glossario {',
      '  list-style: none;',
      '  margin: 0;',
      '  padding: 0;',
      '  display: flex;',
      '  flex-wrap: wrap;',
      '  gap: 10px;',
      '}',
      '#lista-glossario li {',
      '  background: #fff;',
      '  border: 1px solid #c5e1a5;',
      '  border-left: 4px solid #66bb6a;',
      '  border-radius: 8px;',
      '  padding: 8px 12px;',
      '  font-size: 0.88em;',
      '  line-height: 1.4;',
      '  animation: glossFadeIn 0.3s ease;',
      '  max-width: 280px;',
      '}',
      '#lista-glossario li b { color: #2e7d32; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  // -- Tooltip mobile global (vive em body, fora de qualquer transform)
  function obterTooltipMobile() {
    var el = document.getElementById('gloss-mobile-tooltip');
    if (!el) {
      el = document.createElement('div');
      el.id = 'gloss-mobile-tooltip';
      document.body.appendChild(el);
      document.addEventListener('click', function () {
        el.classList.remove('visible');
      });
    }
    return el;
  }

  function isMobile() {
    return window.innerWidth <= 768;
  }

  // -- Cria (ou encontra) a ficha de conceitos
  function garantirFicha() {
    var ficha = document.getElementById('ficha-conceitos');
    if (!ficha) return null;
    if (!ficha.querySelector('h3')) {
      ficha.innerHTML =
        '<h3>Ficha de Conceitos</h3>' +
        '<p class="contador" id="gloss-contador">0 termos coletados</p>' +
        '<ul id="lista-glossario"></ul>';
    }
    return ficha;
  }

  function atualizarContador() {
    var contador = document.getElementById('gloss-contador');
    if (!contador) return;
    var n = document.querySelectorAll('#lista-glossario li').length;
    contador.textContent = n + ' ' + (n === 1 ? 'termo coletado' : 'termos coletados');
  }

  // -- Ativa todos os .termo da pagina
  function ativarGlossario(container) {
    container = container || document;
    container.querySelectorAll('.termo').forEach(function (termo) {
      if (termo.dataset.glossarioAtivo) return;
      termo.dataset.glossarioAtivo = 'true';

      var palavra   = termo.dataset.palavra   || termo.textContent.trim();
      var definicao = termo.dataset.definicao || '';

      // Tooltip desktop (filho do .termo)
      var tooltipDesktop = document.createElement('span');
      tooltipDesktop.className = 'termo-tooltip';
      tooltipDesktop.innerHTML = '<b>' + palavra + '</b>: ' + definicao;
      termo.appendChild(tooltipDesktop);

      termo.addEventListener('click', function (e) {
        e.stopPropagation();

        // -- 1. Mostra/fecha tooltip
        if (isMobile()) {
          var mobileTooltip = obterTooltipMobile();
          var jaAberto = mobileTooltip.classList.contains('visible') &&
                         mobileTooltip.dataset.termo === palavra;
          mobileTooltip.classList.remove('visible');
          if (!jaAberto) {
            mobileTooltip.innerHTML = '<b>' + palavra + '</b>: ' + definicao;
            mobileTooltip.dataset.termo = palavra;
            void mobileTooltip.offsetWidth; // forca re-animacao
            mobileTooltip.classList.add('visible');
          }
        } else {
          var jaAbertoD = tooltipDesktop.classList.contains('visible');
          // Fecha todos os outros tooltips e remove .ativo
          document.querySelectorAll('.termo-tooltip.visible').forEach(function (t) {
            t.classList.remove('visible');
          });
          document.querySelectorAll('.termo.ativo').forEach(function (t) {
            t.classList.remove('ativo');
          });
          if (!jaAbertoD) {
            // Resetar posicao antes de medir
            tooltipDesktop.style.left  = '0';
            tooltipDesktop.style.right = 'auto';
            tooltipDesktop.classList.add('visible');
            termo.classList.add('ativo');

            // Corrigir se ultrapassar borda direita ou esquerda do viewport
            var rect = tooltipDesktop.getBoundingClientRect();
            if (rect.right > window.innerWidth - 8) {
              tooltipDesktop.style.left  = 'auto';
              tooltipDesktop.style.right = '0';
            } else if (rect.left < 8) {
              tooltipDesktop.style.left = (8 - rect.left) + 'px';
            }
          }
        }

        // -- 2. Se ja foi coletado, so mostra tooltip
        if (termo.classList.contains('coletado')) return;

        // -- 3. Marca como coletado
        termo.classList.add('coletado');

        // -- 4. Som
        if (typeof playSom === 'function') playSom('acerto');

        // -- 5. +2 Globinhos
        if (typeof DuvidDB !== 'undefined' && DuvidDB.addGlobinhos) {
          DuvidDB.addGlobinhos(2);
          if (typeof atualizarInterface === 'function') atualizarInterface();
          if (typeof feedbackVisualAcerto === 'function') feedbackVisualAcerto();
        }

        // -- 6. Mini feedback flutuante "+2"
        var fb = document.createElement('span');
        fb.className = 'gloss-feedback';
        fb.textContent = '+2';
        termo.appendChild(fb);
        setTimeout(function () { fb.remove(); }, 1300);

        // -- 7. Adiciona a Ficha de Conceitos
        var ficha = garantirFicha();
        if (ficha) {
          ficha.style.display = 'block';
          var lista = document.getElementById('lista-glossario');
          var jaExiste = lista && Array.from(lista.querySelectorAll('li'))
            .some(function (li) { return li.dataset.palavra === palavra; });

          if (!jaExiste && lista) {
            var item = document.createElement('li');
            item.dataset.palavra = palavra;
            item.innerHTML = '<b>' + palavra + '</b>: ' + definicao;
            lista.appendChild(item);
            atualizarContador();

            if (lista.querySelectorAll('li').length === 1) {
              setTimeout(function () {
                ficha.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }, 400);
            }
          }
        }
      });
    });

    // Fecha tooltip desktop ao clicar fora (adiciona apenas uma vez)
    if (!document._glossarioClickListener) {
      document._glossarioClickListener = true;
      function fecharTodosTooltips() {
        document.querySelectorAll('.termo-tooltip.visible').forEach(function (t) {
          t.classList.remove('visible');
        });
        document.querySelectorAll('.termo.ativo').forEach(function (t) {
          t.classList.remove('ativo');
        });
        var mob = document.getElementById('gloss-mobile-tooltip');
        if (mob) mob.classList.remove('visible');      }
      document.addEventListener('click', fecharTodosTooltips);
      // Fecha tambem ao rolar a pagina
      window.addEventListener('scroll', fecharTodosTooltips, { passive: true });
    }
  }

  // -- Inicializacao
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { ativarGlossario(); });
  } else {
    ativarGlossario();
  }

  window.ativarGlossario = ativarGlossario;

})()
