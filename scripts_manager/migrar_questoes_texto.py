#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
migrar_questoes_texto.py
Converte questões do padrão antigo (botões RetirarPontos/MostrarFrase)
para o novo padrão (radio inputs com validarRadio).
"""

import re, argparse
from pathlib import Path
from bs4 import BeautifulSoup

SITE_ROOT = Path(__file__).parent

IGNORAR_SUFIXOS = ['Antigo', 'Antigo2', 'copia', 'Modelo', 'Scrow']
IGNORAR_NOMES   = {'modeloTexto.html', 'ModeloScrowLento.html', 'ModeloTotal2024.html'}

PREFIXOS = {1: 'tp', 2: 'ts', 3: 'tt'}
PASTAS   = {1: 'Textos1', 2: 'Textos2', 3: 'Textos3'}


def extrair_num_questao(classes):
    for cls in classes:
        m = re.search(r'desativar(\d+)', cls)
        if m:
            return int(m.group(1))
    return None


def extrair_msg_sucesso(onclick):
    m = re.search(r"MostrarFrase\([^,]+,[^,]+,[^,]+,\s*'([^']+)'", onclick)
    return m.group(1).replace("'", "\\'") if m else 'muito bem!'


def extrair_pontos(onclick):
    m = re.search(r"MostrarFrase\([^)]+,\s*'([\d.]+)'\s*\)", onclick)
    if m:
        pts = float(m.group(1))
        return str(int(pts) if pts == int(pts) else pts)
    return '10'


def limpar_texto_btn(tag):
    texto = tag.get_text(separator=' ', strip=True)
    texto = re.sub(r'^\s*[a-zA-ZÀ-ü]\)\s*', '', texto)
    return texto.strip()


def migrar_topico(topico):
    btns = [b for b in topico.find_all('button')
            if any('desativar' in c for c in b.get('class', []))]
    if not btns:
        return None

    num = extrair_num_questao(btns[0].get('class', []))
    if num is None:
        return None

    # Pergunta: tenta h2/h3/h4; senao usa o ultimo <p> sem id
    h = topico.find(['h2', 'h3', 'h4'])
    if not h:
        ps = [p for p in topico.find_all('p') if not p.get('id') and not p.get('class')]
        h_texto = ps[-1].get_text(strip=True) if ps else 'Pergunta'
    else:
        h_texto = h.decode_contents().strip()
    pergunta_html = f'<h4 class="fontePixel"><b>{h_texto}</b></h4>'

    alternativas = []
    msg_sucesso = 'muito bem!'
    pontos = '10'

    for btn in btns:
        onclick = btn.get('onclick', '')
        correto = 'MostrarFrase' in onclick
        if correto:
            msg_sucesso = extrair_msg_sucesso(onclick)
            pontos = extrair_pontos(onclick)
        alternativas.append({'texto': limpar_texto_btn(btn), 'correto': correto})

    resp_id  = f'resp{num}'
    globo_id = f'globinho{num}'
    pname    = f'pergunta{num}'
    letras   = 'abcdefghij'

    alts_html = ''
    for i, alt in enumerate(alternativas):
        letra  = letras[i]
        valor  = 'correto' if alt['correto'] else 'errado'
        inp_id = f'p{num}{letra}'
        alts_html += f"""
                <div class="item-resposta">
                    <input type="radio" name="{pname}" id="{inp_id}" value="{valor}" class="radio-duvid">
                    <label for="{inp_id}" class="card-opcao">
                        <span>{letra}) {alt['texto']}</span>
                    </label>
                </div>"""

    novo = f"""<div class="topico pergunta-bloco w3-container w3-padding-24">
            <p class="w3-text-grey w3-small">QUESTÃO PRÁTICA</p>
            {pergunta_html}
            <div class="grupo-respostas w3-margin-top">{alts_html}
            </div>
            <div class="w3-margin-top">
                <button class="btn-acao-duvid"
                    onclick="validarRadio(this, '{pname}', '{resp_id}', '{globo_id}', '{msg_sucesso}', '{pontos}')">
                    Confirmar Resposta
                </button>
            </div>
            <p id="{resp_id}" class="w3-center w3-padding w3-large"></p>
            <div class="area w3-center">
                <img src="../../../fotoIndex/globinhoPe.png" id="{globo_id}" style="display:none" width="64" height="64">
            </div>
        </div>"""

    return novo


def processar_arquivo(path, dry_run=False):
    try:
        html = path.read_bytes().decode('utf-8', errors='replace')
    except Exception as e:
        print(f'  [ERRO ao ler] {path.name}: {e}')
        return 0

    soup = BeautifulSoup(html, 'html.parser')

    count = 0
    for topico in soup.find_all('div', class_='topico'):
        btns = [b for b in topico.find_all('button')
                if any('desativar' in c for c in b.get('class', []))]
        if not btns:
            continue
        novo_html = migrar_topico(topico)
        if not novo_html:
            continue
        topico.replace_with(BeautifulSoup(novo_html, 'html.parser'))
        count += 1

    if count == 0:
        return 0

    resultado = str(soup)

    if dry_run:
        print(f'\n{"─"*60}')
        print(f'[DRY-RUN] {path.relative_to(SITE_ROOT)} — {count} questao(oes)')
        preview = BeautifulSoup(resultado, 'html.parser')
        for pb in list(preview.find_all('div', class_='pergunta-bloco'))[:2]:
            print(pb.prettify()[:700])
            print('  ...')
    else:
        path.write_bytes(resultado.encode('utf-8'))
        print(f'  OK {path.relative_to(SITE_ROOT)} — {count} questao(oes) migrada(s)')

    return count


def deve_ignorar(path, skip_backup=True):
    nome = path.stem
    if path.name in IGNORAR_NOMES:
        return True
    if skip_backup:
        for suf in IGNORAR_SUFIXOS:
            if suf.lower() in nome.lower():
                return True
    return False


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


def tem_padrao_antigo(path):
    try:
        txt = path.read_bytes().decode('utf-8', errors='replace')
        return bool(re.search(r'RetirarPontos|MostrarFrase', txt))
    except:
        return False


def main():
    ap = argparse.ArgumentParser(description='Migra questoes antigas para o novo padrao')
    ap.add_argument('--arquivo', type=str)
    ap.add_argument('--all',    action='store_true')
    ap.add_argument('--ano',    type=int, choices=[1,2,3])
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--incluir-backup', action='store_true')
    args = ap.parse_args()

    skip_backup = not args.incluir_backup

    print(f'Site root: {SITE_ROOT}')
    if args.dry_run:
        print('[MODO DRY-RUN — nenhum arquivo sera alterado]\n')

    if args.arquivo:
        path = SITE_ROOT / args.arquivo
        processar_arquivo(path, dry_run=args.dry_run)

    elif args.all or args.ano:
        anos = [args.ano] if args.ano else [1, 2, 3]
        arquivos = listar_arquivos(anos)
        pendentes = [p for p in arquivos
                     if not deve_ignorar(p, skip_backup) and tem_padrao_antigo(p)]

        print(f'Arquivos com padrao antigo: {len(pendentes)}')
        if skip_backup:
            ignorados = [p for p in arquivos if deve_ignorar(p, True) and tem_padrao_antigo(p)]
            if ignorados:
                print(f'Ignorados (backup/modelo): {len(ignorados)}')
                for p in ignorados:
                    print(f'  - {p.relative_to(SITE_ROOT)}')

        total = 0
        for p in pendentes:
            n = processar_arquivo(p, dry_run=args.dry_run)
            total += n
        print(f'\nTotal: {total} questao(oes) {"analisada(s)" if args.dry_run else "migrada(s)"}')

    else:
        ap.print_help()


if __name__ == '__main__':
    main()
