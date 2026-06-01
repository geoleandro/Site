#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
migrar_questoes_abertas.py
Converte blocos de questões abertas do padrão antigo (PerguntasAbertas)
para o novo padrão (validarAberta + btnHide "Próximo").

O gabarito NÃO está no HTML antigo — o script usa o placeholder 'GABARITO'
que deve ser substituído manualmente após a migração.

Uso:
  python migrar_questoes_abertas.py --arquivo 1ano/Textos1/Texto08/tp8.html --dry-run
  python migrar_questoes_abertas.py --all --dry-run
  python migrar_questoes_abertas.py --all
  python migrar_questoes_abertas.py --ano 1
"""

import re, argparse
from pathlib import Path
from bs4 import BeautifulSoup, NavigableString

SITE_ROOT = Path(__file__).parent

IGNORAR_SUFIXOS = ['Antigo', 'Antigo2', 'copia', 'Modelo', 'Scrow']
IGNORAR_NOMES   = {'modeloTexto.html', 'ModeloScrowLento.html', 'ModeloTotal2024.html',
                   'questoesTexto.html', 'ModeloTextoAntigo.html'}

PASTAS = {1: 'Textos1', 2: 'Textos2', 3: 'Textos3'}


# ── Utilitários ─────────────────────────────────────────────────────────────

def tem_padrao_aberto(path):
    """Verifica se o arquivo contém PerguntasAbertas."""
    try:
        return bool(re.search(r'PerguntasAbertas', path.read_bytes().decode('utf-8', errors='replace')))
    except:
        return False


def deve_ignorar(path):
    nome = path.stem
    if path.name in IGNORAR_NOMES:
        return True
    for suf in IGNORAR_SUFIXOS:
        if suf.lower() in nome.lower():
            return True
    return False


# ── Extratores ───────────────────────────────────────────────────────────────

def _texto_anterior(inp):
    """
    Retorna o texto do <p> imediatamente antes do <input> na árvore.
    O input pode estar diretamente no form OU dentro de um <div class="w3-margin">;
    em ambos os casos busca o <p> como irmão do elemento-contêiner.
    """
    # Ponto de busca: se o pai for um div-wrapper, sobe até ele
    ref = inp
    if inp.parent and inp.parent.name == 'div':
        ref = inp.parent

    for sib in ref.previous_siblings:
        if isinstance(sib, NavigableString):
            continue
        if sib.name == 'p' and not sib.get('id'):
            return sib.decode_contents().strip()
        # H4 dentro do form serve de título geral — não é enunciado individual
        if sib.name in ('h2', 'h3', 'h4'):
            break
    return ''


def _ids_da_questao(inp_id):
    """
    Deriva resp_id e globinho_id a partir do input_id.
    Convenção: q1a → resp1a, globinho1a
               q2b → resp2b, globinho2b
    """
    sufixo = inp_id.lstrip('q')          # '1a', '1b', '2c' …
    return f'resp{sufixo}', f'globinho{sufixo}'


# ── Conversor de um bloco topico ─────────────────────────────────────────────

def migrar_topico_aberto(topico):
    """
    Recebe um tag BeautifulSoup <div class="topico"> que contém
    um <form id="quiz"> com chamadas a PerguntasAbertas.
    Retorna o HTML novo (string) ou None se não aplicável.
    """
    form = topico.find('form', id='quiz')
    if not form:
        return None

    # Precisa ter pelo menos um botão com PerguntasAbertas
    btns_conf = [b for b in form.find_all('input', {'type': 'button'})
                 if 'PerguntasAbertas' in b.get('onclick', '')]
    if not btns_conf:
        return None

    # ── Título do bloco ──────────────────────────────────────────────────────
    # Procura h2/h3/h4 dentro do form, ou p.caixa no topico
    h = form.find(['h2', 'h3', 'h4'])
    if not h:
        h = topico.find('p', class_='caixa')
    titulo_html = h.decode_contents().strip() if h else 'Complete com as palavras corretas:'

    # ── Entradas de texto ────────────────────────────────────────────────────
    inputs_txt = form.find_all('input', {'type': 'text'})
    if not inputs_txt:
        return None

    partes_html = []
    for inp in inputs_txt:
        inp_id          = inp.get('id', '').strip()
        if not inp_id:
            continue

        resp_id, glob_id = _ids_da_questao(inp_id)
        enunciado        = _texto_anterior(inp)

        parte = f'''\n    <p>{enunciado}</p>
    <div class="w3-margin">
        <input type="text" id="{inp_id}" class="input" placeholder="sua resposta...">
    </div>
    <p id="{resp_id}" class="w3-center w3-padding"></p>
    <div class="w3-margin-top">
        <button class="btn-acao-duvid"
            onclick="validarAberta('{inp_id}', 'GABARITO', '{resp_id}', this, '{glob_id}')">
            Conferir
        </button>
    </div>
    <div class="area w3-center">
        <img src="../../../fotoIndex/globinhoPe.png" id="{glob_id}"
             style="display:none" width="64" height="64">
    </div>'''
        partes_html.append(parte)

    questoes_html = ''.join(partes_html)

    novo = f'''<div class="topico pergunta-aberta-bloco w3-container w3-padding-24">
        <p class="w3-text-grey w3-small">QUESTÃO ABERTA</p>
        <h4 class="fontePixel"><b>{titulo_html}</b></h4>
        {questoes_html}
        <div class="w3-margin-top">
            <button class="btnHide" style="display:none"
                onclick="MostrarProximo(this)">
                Próximo ➜
            </button>
        </div>
    </div>'''

    return novo


# ── Processar arquivo ─────────────────────────────────────────────────────────

def processar_arquivo(path, dry_run=False):
    try:
        html = path.read_bytes().decode('utf-8', errors='replace')
    except Exception as e:
        print(f'  [ERRO ao ler] {path.name}: {e}')
        return 0

    soup  = BeautifulSoup(html, 'html.parser')
    count = 0

    for topico in soup.find_all('div', class_='topico'):
        form = topico.find('form', id='quiz')
        if not form:
            continue
        if not any('PerguntasAbertas' in b.get('onclick', '')
                   for b in form.find_all('input', {'type': 'button'})):
            continue

        novo_html = migrar_topico_aberto(topico)
        if not novo_html:
            continue

        topico.replace_with(BeautifulSoup(novo_html, 'html.parser'))
        count += 1

    if count == 0:
        return 0

    resultado = str(soup)

    if dry_run:
        print(f'\n{"─"*60}')
        print(f'[DRY-RUN] {path.relative_to(SITE_ROOT)} — {count} bloco(s)')
        preview = BeautifulSoup(resultado, 'html.parser')
        for pb in list(preview.find_all('div', class_='pergunta-aberta-bloco'))[:2]:
            print(pb.prettify()[:800])
            print('  ...')
    else:
        path.write_bytes(resultado.encode('utf-8'))
        print(f'  ✓ {path.relative_to(SITE_ROOT)} — {count} bloco(s) migrado(s)')
        # Lembra o usuário dos gabaritos pendentes
        n_gab = resultado.count("'GABARITO'")
        if n_gab:
            print(f'    ⚠  {n_gab} gabarito(s) com placeholder GABARITO — preencha manualmente!')

    return count


# ── Descoberta de arquivos ────────────────────────────────────────────────────

def listar_arquivos(anos=None):
    anos = anos or [1, 2, 3]
    arquivos = []
    for ano in anos:
        pasta = SITE_ROOT / f'{ano}ano' / PASTAS[ano]
        if not pasta.exists():
            continue
        for html in sorted(pasta.rglob('*.html')):
            arquivos.append(html)
    return arquivos


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser(
        description='Migra questões abertas (PerguntasAbertas) para validarAberta')
    ap.add_argument('--arquivo', type=str,
                    help='Caminho relativo ao site root')
    ap.add_argument('--all',     action='store_true')
    ap.add_argument('--ano',     type=int, choices=[1, 2, 3])
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()

    print(f'Site root: {SITE_ROOT}')
    if args.dry_run:
        print('[MODO DRY-RUN — nenhum arquivo será alterado]\n')

    if args.arquivo:
        path = SITE_ROOT / args.arquivo
        processar_arquivo(path, dry_run=args.dry_run)

    elif args.all or args.ano:
        anos      = [args.ano] if args.ano else [1, 2, 3]
        arquivos  = listar_arquivos(anos)
        pendentes = [p for p in arquivos
                     if not deve_ignorar(p) and tem_padrao_aberto(p)]

        print(f'Arquivos com PerguntasAbertas: {len(pendentes)}')
        total = 0
        for p in pendentes:
            n = processar_arquivo(p, dry_run=args.dry_run)
            total += n
        print(f'\nTotal: {total} bloco(s) {"analisado(s)" if args.dry_run else "migrado(s)"}')

    else:
        ap.print_help()
        print('\nExemplos:')
        print('  python migrar_questoes_abertas.py --arquivo 1ano/Textos1/Texto08/tp8.html --dry-run')
        print('  python migrar_questoes_abertas.py --all --dry-run')
        print('  python migrar_questoes_abertas.py --all')


if __name__ == '__main__':
    main()
