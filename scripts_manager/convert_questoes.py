#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
convert_questoes.py  —  Migra questoes HTML antigas para JSON (Duvid)

FORMATO ANTIGO:
  1ano/Aulas1/Aula{NN}/p{N}.html
  2ano/Aulas2/Aula{NN}/s{N}.html
  3ano/Aulas3/Aula{NN}/t{N}.html

FORMATO NOVO:
  questoes/{ano}ano/{id}.json   (id = ano*100 + aula)

Uso:
  python convert_questoes.py --ano 3 --aula 2
  python convert_questoes.py --ano 3 --all
  python convert_questoes.py --all
  python convert_questoes.py --ano 3 --aula 2 --dry-run
  python convert_questoes.py --all --skip-done
"""

import re, json, argparse
from pathlib import Path
from bs4 import BeautifulSoup

PREFIXO     = {1: 'p', 2: 's', 3: 't'}
PASTA_AULAS = {1: 'Aulas1', 2: 'Aulas2', 3: 'Aulas3'}
SITE_ROOT   = Path(__file__).parent


# -- Caminhos ------------------------------------------------------------------

def get_old_path(ano, aula):
    return SITE_ROOT / f"{ano}ano" / PASTA_AULAS[ano] / f"Aula{aula:02d}" / f"{PREFIXO[ano]}{aula}.html"

def get_new_path(ano, aula):
    return SITE_ROOT / "questoes" / f"{ano}ano" / f"{ano*100+aula}.json"

def img_new_path(ano, aula, filename):
    return f"{ano}ano/img/{ano*100+aula}/{filename}"


# -- Gabarito ------------------------------------------------------------------

def extrair_gabarito(html_text):
    gab = {}
    # Padrao 1: if (pq1 == "c")
    for num, letra in re.findall(r'if\s*\(\s*pq(\d+)\s*={2,3}\s*["\']([a-e])["\']\s*\)', html_text):
        gab[int(num)] = letra
    # Padrao 2: gabarito["q1"] = "c"
    for num, letra in re.findall(r'gabarito\[["\']q(\d+)["\']\]\s*=\s*["\']([a-e])["\']', html_text):
        gab[int(num)] = letra
    # Padrao 3: {q1:"c", q2:"d"}
    for num, letra in re.findall(r'q(\d+)\s*:\s*["\']([a-e])["\']', html_text):
        if int(num) not in gab:
            gab[int(num)] = letra
    # Padrao 4: var respostasCertas = ["b","a","a",...] -- indice 0 = questao 1
    if not gab:
        for _m in re.finditer(r'respostasCertas\s*=\s*\[([^\]]+)\]', html_text):
            _itens = re.findall(r'["\x27]([a-e])["\x27]', _m.group(1))
            if _itens:
                for i, letra in enumerate(_itens, 1):
                    gab[i] = letra
                break
    return gab

def letra_para_indice(letra):
    return ord(letra.lower()) - ord('a')


# -- Limpeza -------------------------------------------------------------------

def limpar(texto):
    return re.sub(r'\s+', ' ', texto.replace('\r', '')).strip()

def sem_prefixo(texto):
    return re.sub(r'^[a-eA-E]\)\s*', '', texto).strip()

def extrair_banca(texto):
    m = re.search(r'\(\s*([A-Z][A-Z0-9\-/]*(?:[- ][A-Z]+)?)\s+(\d{4})\s*\)', texto)
    return (m.group(1).strip(), m.group(2).strip()) if m else ("", "")


# -- Parser de um card ---------------------------------------------------------

def parse_card(card, numero, gabarito, ano, aula):
    q = {
        "id": numero,
        "instituicao": "",
        "ano": "",
        "dificuldade": "",
        "tags": [],
        "texto_apoio": "",
        "fonte_apoio": "",
        "imagem_apoio": "",
        "legenda_imagem": "",
        "imagem_apoio_2": "",
        "legenda_imagem_2": "",
        "pergunta": "",
        "alternativas": [],
        "correta": -1,
        "ajuda": "",
        "comentario": ""
    }

    # Gabarito
    letra = gabarito.get(numero, "")
    if letra:
        q["correta"] = letra_para_indice(letra)

    # Comentario
    div_coment = card.find("div", class_="comentarios")
    if div_coment:
        q["comentario"] = str(div_coment.decode_contents()).strip()
        div_coment.decompose()

    # Alternativas -- formato 1: p.bordaQuestoes / formato 2: label com input radio
    alts = []
    for p in card.find_all("p", class_="bordaQuestoes"):
        for inp in p.find_all("input"):
            inp.decompose()
        alts.append(sem_prefixo(limpar(p.get_text())))
        p.decompose()
    if not alts:
        for lbl in card.find_all("label"):
            for inp in lbl.find_all("input"):
                inp.decompose()
            alts.append(sem_prefixo(limpar(lbl.get_text())))
            lbl.decompose()
    q["alternativas"] = alts

    # Bloco de apoio (w3-leftbar)
    div_apoio = card.find("div", class_=re.compile(r'w3-leftbar'))
    if div_apoio:
        textos, fonte = [], ""
        for p in div_apoio.find_all("p"):
            cls = p.get("class") or []
            t = limpar(p.get_text())
            if "w3-small" in cls:
                fonte = t
            elif t:
                textos.append(t)
        q["texto_apoio"] = " ".join(textos)
        q["fonte_apoio"] = fonte
        div_apoio.decompose()

    # Imagens
    for idx, img in enumerate(card.find_all("img")):
        src = img.get("src", "")
        novo_src = img_new_path(ano, aula, Path(src).name)
        legenda = ""
        nxt = img.find_next_sibling()
        if nxt and nxt.name in ("p", "span", "figcaption"):
            leg = limpar(nxt.get_text())
            if len(leg) < 200:
                legenda = leg
        if idx == 0:
            q["imagem_apoio"] = novo_src
            q["legenda_imagem"] = legenda
        elif idx == 1:
            q["imagem_apoio_2"] = novo_src
            q["legenda_imagem_2"] = legenda

    # Banca -- procura em todos os <p> nao-p2
    for p in card.find_all("p"):
        if "p2" in (p.get("class") or []):
            continue
        inst, ano_banca = extrair_banca(limpar(p.get_text()))
        if inst:
            q["instituicao"] = inst
            q["ano"] = ano_banca
            novo_txt = re.sub(r'\s*\([^)]+\d{4}[^)]*\)\s*', ' ', p.get_text()).strip()
            if novo_txt:
                p.string = novo_txt
            else:
                p.decompose()
            break

    # Pergunta -- paragrafos restantes (exclui p2 e fontes w3-small)
    partes = []
    for p in card.find_all("p"):
        cls = p.get("class") or []
        if "p2" in cls:
            continue
        if "w3-small" in cls:
            t = limpar(p.get_text())
            if t and not q.get("fonte_apoio"):
                q["fonte_apoio"] = t
            continue
        t = limpar(p.get_text())
        if t:
            partes.append(t)
    q["pergunta"] = "\n\n".join(partes)

    # Remove campos opcionais vazios
    for campo in ["imagem_apoio", "imagem_apoio_2", "legenda_imagem", "legenda_imagem_2",
                  "ajuda", "fonte_apoio", "texto_apoio"]:
        if not q.get(campo):
            q.pop(campo, None)

    return q


# -- Processar um arquivo ------------------------------------------------------

def processar_arquivo(ano, aula, dry_run=False):
    html_path = get_old_path(ano, aula)
    json_path = get_new_path(ano, aula)
    id_ = ano * 100 + aula

    if not html_path.exists():
        print(f"  [PULO] Nao encontrado: {html_path.relative_to(SITE_ROOT)}")
        return False

    print(f"\n{'--'*30}")
    print(f"  {html_path.relative_to(SITE_ROOT)}")
    print(f"  -> questoes/{ano}ano/{id_}.json")

    html_text = html_path.read_bytes().decode("utf-8", errors="replace")
    gabarito  = extrair_gabarito(html_text)
    soup      = BeautifulSoup(html_text, "html.parser")
    cards     = soup.find_all("div", class_="w3-card-4")
    # Fallback: alguns arquivos usam div.w3-card (sem -4)
    # Usa o set alternativo se o gabarito sugere mais questoes do que cards encontrados
    n_gab = len(gabarito)
    if len(cards) < max(n_gab, 1):
        all_cards = soup.find_all("div", class_="w3-card")
        alt_cards = [c for c in all_cards if "w3-card-4" not in c.get("class", [])]
        if len(alt_cards) > len(cards):
            cards = alt_cards

    print(f"  Questoes: {len(cards)}  |  Gabarito: {gabarito}")

    if not cards:
        print(f"  [AVISO] Nenhum card encontrado")
        return False

    questoes, imagens = [], []
    for i, card in enumerate(cards, 1):
        q = parse_card(card, i, gabarito, ano, aula)
        questoes.append(q)
        for campo in ["imagem_apoio", "imagem_apoio_2"]:
            v = q.get(campo, "")
            if v:
                origem = html_path.parent / Path(v).name
                imagens.append((str(origem.relative_to(SITE_ROOT)), v))
        status = f"correta={q['correta']}({chr(q['correta']+97)})" if q['correta'] >= 0 else "SEM_GAB"
        print(f"    Q{i}: {q.get('instituicao','')} {q.get('ano','')} | {len(q['alternativas'])} alt | {status}")

    if imagens:
        print(f"\n  Imagens para copiar:")
        for orig, dest in imagens:
            print(f"    DE: {orig}")
            print(f"    ->  questoes/{dest}")

    if not dry_run:
        json_path.parent.mkdir(parents=True, exist_ok=True)
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(questoes, f, ensure_ascii=False, indent=2)
        print(f"\n  Salvo: {json_path.relative_to(SITE_ROOT)}")
    else:
        print(f"\n  [DRY-RUN] Nao salvo. Previa da Q1:")
        print(json.dumps(questoes[0], ensure_ascii=False, indent=2)[:1500])

    return True


# -- Descoberta de aulas -------------------------------------------------------

def listar_aulas(ano):
    base = SITE_ROOT / f"{ano}ano" / PASTA_AULAS[ano]
    if not base.exists():
        return []
    aulas = []
    for d in sorted(base.iterdir()):
        if not d.is_dir():
            continue
        m = re.match(r'Aula(\d+)$', d.name)
        if not m:
            continue
        num = int(m.group(1))
        if num == 0:
            continue
        if (d / f"{PREFIXO[ano]}{num}.html").exists():
            aulas.append(num)
    return aulas


# -- Main ----------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser(description="Migra questoes HTML Duvid -> JSON")
    ap.add_argument("--ano",  type=int, choices=[1,2,3])
    ap.add_argument("--aula", type=int)
    ap.add_argument("--all",       action="store_true")
    ap.add_argument("--dry-run",   action="store_true")
    ap.add_argument("--skip-done", action="store_true")
    ap.add_argument("--root", type=str)
    args = ap.parse_args()

    global SITE_ROOT
    if args.root:
        SITE_ROOT = Path(args.root)

    print(f"Site root: {SITE_ROOT}")

    if args.all:
        anos = [args.ano] if args.ano else [1, 2, 3]
        total = 0
        for ano in anos:
            aulas = listar_aulas(ano)
            print(f"\n{'=='*30}\n  {ano}o ANO -- {len(aulas)} aulas: {aulas}\n{'=='*30}")
            for aula in aulas:
                if args.skip_done and get_new_path(ano, aula).exists():
                    print(f"  [JA FEITO] questoes/{ano}ano/{ano*100+aula}.json")
                    continue
                if processar_arquivo(ano, aula, dry_run=args.dry_run):
                    total += 1
        print(f"\n\nTotal convertido: {total} arquivo(s)")

    elif args.ano and args.aula:
        processar_arquivo(args.ano, args.aula, dry_run=args.dry_run)

    else:
        ap.print_help()
        print("\nExemplos:")
        print("  python convert_questoes.py --ano 3 --aula 2")
        print("  python convert_questoes.py --ano 3 --all")
        print("  python convert_questoes.py --all")
        print("  python convert_questoes.py --ano 3 --aula 2 --dry-run")
        print("  python convert_questoes.py --all --skip-done")

if __name__ == "__main__":
    main()
