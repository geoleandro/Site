#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
completar_rodape.py
Insere o bloco padrão de rodapé (Finalizar + bibliografia + footer + progress)
nos arquivos de texto que estão sem ele.

Usa substituição de string pura — NÃO usa BeautifulSoup para evitar truncamento.

Uso:
  python completar_rodape.py --all --dry-run
  python completar_rodape.py --all
  python completar_rodape.py --arquivo 1ano/Textos1/Texto08/tp8.html
"""

import re, argparse
from pathlib import Path

SITE_ROOT = Path(__file__).parent
PASTAS = {1: 'Textos1', 2: 'Textos2', 3: 'Textos3'}
IGNORAR = ['Antigo', 'Antigo2', 'copia', 'Modelo', 'Scrow',
           'modeloTexto', 'questoesTexto', 'exemplo-uso']

RODAPE = '''
        <!-- TÓPICO FINALIZAR -->
        <div class="topico">
            <button class="btnShow" onclick="mostraCinza(); this.style='display:none'">Finalizar</button>
        </div>

        </main>

        <div class="bibliografias w3-content w3-padding-64" id="final-da-aula" style="max-width:700px">
            <hr>
            <h3 class="w3-center w3-text-green fontePixel"><strong>Para saber mais:</strong></h3>
            <div class="w3-row-padding" id="links-gerados"></div>
            <div class="w3-container w3-padding-64">
                <h3 class="fontePixel w3-center w3-text-green">
                    <strong><i class="fa fa-book"></i> Referências Bibliográficas</strong>
                </h3>
                <div id="biblio-gerada"></div>
            </div>
            <br><br>
            <div class="w3-padding-48">
                <span id="numero"></span>
                <span id="txtBarra">0%</span>
                <progress id="progress" max="100" value="0"></progress>
            </div>
        </div>

        <div id="footer-placeholder"></div>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-DPX55DSFZ0"></script>

</body>
</html>'''

# Rodapé parcial: já tem </main> mas falta o resto
RODAPE_SEM_MAIN = '''
        <div class="bibliografias w3-content w3-padding-64" id="final-da-aula" style="max-width:700px">
            <hr>
            <h3 class="w3-center w3-text-green fontePixel"><strong>Para saber mais:</strong></h3>
            <div class="w3-row-padding" id="links-gerados"></div>
            <div class="w3-container w3-padding-64">
                <h3 class="fontePixel w3-center w3-text-green">
                    <strong><i class="fa fa-book"></i> Referências Bibliográficas</strong>
                </h3>
                <div id="biblio-gerada"></div>
            </div>
            <br><br>
            <div class="w3-padding-48">
                <span id="numero"></span>
                <span id="txtBarra">0%</span>
                <progress id="progress" max="100" value="0"></progress>
            </div>
        </div>

        <div id="footer-placeholder"></div>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-DPX55DSFZ0"></script>

</body>
</html>'''


def tem_elemento(html, elem_id):
    return bool(re.search(rf'id=["\']?{re.escape(elem_id)}["\']?', html))


def precisa_rodape(html):
    """Retorna lista de elementos faltando."""
    faltando = []
    if not re.search(r'Finalizar', html):        faltando.append('Finalizar')
    if not tem_elemento(html, 'biblio-gerada'):   faltando.append('biblio-gerada')
    if not tem_elemento(html, 'footer-placeholder'): faltando.append('footer-placeholder')
    if not tem_elemento(html, 'progress'):        faltando.append('progress')
    if not tem_elemento(html, 'final-da-aula'):   faltando.append('final-da-aula')
    return faltando


def encontrar_ponto_insercao(html):
    """
    Retorna (idx, modo) onde inserir o rodapé.
    Modos:
      'antes_body_end'  – inserir antes de </body>
      'antes_main_end'  – substituir </main> pelo bloco completo
      'append'          – arquivo sem </body>, simplesmente adicionar no final
    """
    # Caso 1: já tem </main> e </body> → substitui </main>...</body></html>
    m = re.search(r'</main>', html, re.IGNORECASE)
    if m:
        return m.start(), 'tem_main'

    # Caso 2: tem </body> mas não </main>
    m = re.search(r'</body>', html, re.IGNORECASE)
    if m:
        return m.start(), 'antes_body_end'

    # Caso 3: arquivo truncado, sem nenhum fechamento
    return len(html), 'append'


def completar(path, dry_run=False):
    html = path.read_bytes().decode('utf-8', errors='replace')
    faltando = precisa_rodape(html)
    if not faltando:
        return False, []

    idx, modo = encontrar_ponto_insercao(html)

    tem_finalizar = bool(re.search(r'Finalizar', html))
    tem_biblio    = tem_elemento(html, 'biblio-gerada')

    if modo == 'tem_main':
        # Há um </main> — o que vem depois?
        resto = html[idx:]
        # Se já tem Finalizar mas falta biblio: injeta só a parte da biblio depois de </main>
        if tem_finalizar and not tem_biblio:
            novo = html[:idx] + '</main>\n' + RODAPE_SEM_MAIN
        else:
            # Remove tudo a partir de </main> e insere o bloco completo (com Finalizar)
            novo = html[:idx] + RODAPE
    elif modo == 'antes_body_end':
        novo = html[:idx] + RODAPE + html[idx:]
    else:  # append
        novo = html.rstrip() + '\n' + RODAPE

    if dry_run:
        print(f'  [DRY-RUN] {path.relative_to(SITE_ROOT)}')
        print(f'    Modo: {modo} | Faltando: {", ".join(faltando)}')
    else:
        path.write_bytes(novo.encode('utf-8'))
        print(f'  OK {path.relative_to(SITE_ROOT)} | Faltando era: {", ".join(faltando)}')

    return True, faltando


def deve_ignorar(path):
    for s in IGNORAR:
        if s.lower() in path.stem.lower():
            return True
    return False


def listar_arquivos(anos=None):
    anos = anos or [1, 2, 3]
    arquivos = []
    for ano in anos:
        pasta = SITE_ROOT / f'{ano}ano' / PASTAS[ano]
        if not pasta.exists():
            continue
        for f in sorted(pasta.rglob('*.html')):
            if not deve_ignorar(f):
                arquivos.append(f)
    return arquivos


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--arquivo', type=str)
    ap.add_argument('--all',    action='store_true')
    ap.add_argument('--ano',    type=int, choices=[1,2,3])
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()

    if args.dry_run:
        print('[DRY-RUN]\n')

    if args.arquivo:
        p = SITE_ROOT / args.arquivo
        completar(p, dry_run=args.dry_run)

    elif args.all or args.ano:
        anos = [args.ano] if args.ano else [1, 2, 3]
        total = 0
        for p in listar_arquivos(anos):
            ok, _ = completar(p, dry_run=args.dry_run)
            if ok:
                total += 1
        print(f'\nTotal: {total} arquivo(s) {"analisado(s)" if args.dry_run else "completado(s)"}')
    else:
        ap.print_help()


if __name__ == '__main__':
    main()
