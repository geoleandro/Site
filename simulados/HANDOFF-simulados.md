# Handoff — Módulo de Simulados (Duvid Geografia)

Resumo para continuar o trabalho dos simulados numa nova sessão.

## Objetivo

Criar simulados (ENEM, Fuvest, etc.) no **formato novo de JSON** — o mesmo das aulas,
com questões embaralhadas, dica do professor e correção comentada por alternativa.
Substitui aos poucos os simulados antigos em HTML estático (ex: `enem23.html`).

## Como está montado (já pronto e funcionando)

Fluxo de navegação:
**Navbar SIMULADOS → `capasimuladoenem.html` → card do ano → `modelo-simulado.html?prova=...`**

Arquivos:

- `simulados/modelo-simulado.html` — página única do simulado. Reusa o motor das aulas
  (vidas, combo, dica, feedback por alternativa, confete). Lê o parâmetro `?prova=`.
- `js/jssimulado-padrao.js` — loader fino. Carregado DEPOIS de `jsquestoes-padrao.js`.
  Só troca a origem das questões: busca `/simulados/bancos/<prova>.json`, embaralha e
  renderiza. Deixa `aulaID` vazio de propósito → **simulado NÃO grava progresso de aula**.
- `simulados/bancos/<prova>.json` — o banco de questões de cada simulado.
  Já existe: `simulados/bancos/enem2024-geografia.json`.
- `simulados/capasimuladoenem.html` — capa do ENEM. É AQUI que ficam os **cards por ano**
  (grid `.grid-provas`). Cada card aponta para `modelo-simulado.html?prova=<arquivo>`.

## Onde adicionar um novo ano/prova (2 passos)

1. Criar o banco: `simulados/bancos/enemAAAA-geografia.json` (array no formato abaixo).
2. Adicionar o card em `capasimuladoenem.html`, dentro de `.grid-provas`:

```html
<div class="card-prova">
    <a href="modelo-simulado.html?prova=enem2024-geografia">
        <img src="enem/enem24.png" alt="ENEM 2024" class="w3-hover-opacity"
             onerror="this.src='enem/capaenem.png'">
        <p>ENEM 2024</p>
    </a>
</div>
```

(A imagem `enem/enem24.png` ainda precisa ser adicionada; enquanto não houver, o
`onerror` mostra a capa genérica `enem/capaenem.png`.)

## Formato do JSON (uma questão)

Mesmos campos das aulas. O motor lê: `instituicao`, `ano`, `dificuldade`, `tags`,
`texto_apoio`, `fonte_apoio`, `imagem_apoio`, `pergunta`, `alternativas`, `correta`,
`comentario`, `ajuda`, `feedbacks`.

```json
{
  "id": 1,
  "instituicao": "ENEM",
  "ano": "2024",
  "dificuldade": "media",
  "tags": ["cartografia", "poder e território"],
  "texto_apoio": "Citação do enunciado...",
  "fonte_apoio": "AUTOR. Obra. Local: Editora, ano (adaptado).",
  "pergunta": "Enunciado da pergunta.",
  "alternativas": ["a...", "b...", "c...", "d...", "e..."],
  "correta": 4,
  "comentario": "Explicação do porquê da resposta certa (aparece no acerto).",
  "ajuda": "Dica do professor (botão durante a questão).",
  "feedbacks": {
    "0": "Por que a alternativa A está errada.",
    "1": "Por que a B está errada.",
    "2": "Por que a C está errada.",
    "3": "Por que a D está errada."
  }
}
```

Regras dos `feedbacks` (mesmo padrão das questões 103–106):
- Chave = índice da alternativa ERRADA (string: "0", "1", ...). A correta NÃO recebe feedback.
- Sem travessões (—): usar vírgula, ponto e vírgula, dois-pontos ou conjunções.
- Linguagem direta, pedagógica, para aluno do Ensino Médio.
- `imagem_apoio` (opcional): caminho de imagem do mapa/gráfico, ex: `enem/enem2024/q03.png`.

## De onde vêm as questões (com fidelidade)

- Enunciado + alternativas + gabarito: páginas do Descomplica em HTML, ex:
  `descomplica.com.br/gabarito-enem/questoes/2024/primeiro-dia/<slug>/` (vêm como texto limpo).
- Conferir gabarito contra o oficial do INEP:
  `download.inep.gov.br/enem/provas_e_gabaritos/2024_GB_impresso_D1_CD1.pdf` (Dia 1 = Cienc. Humanas/Geografia).
- Questões com mapa/gráfico/charge: incluir com `imagem_apoio` apontando para um arquivo
  que deve ser adicionado à mão em `simulados/...` (o PDF do INEP não extrai imagem automaticamente).

## Status atual (ENEM 2024 geografia)

Banco `enem2024-geografia.json` tem **2 questões reais** (piloto):
- Q1 = ENEM 2024 (Q83 azul), cartografia/poder, gabarito E.
- Q2 = ENEM 2024 (Q84 azul), regatão/Amazônia, gabarito D.

**Próximo passo:** completar até 10 questões de geografia do ENEM 2024, priorizando as de
texto e marcando as que dependem de imagem. Depois, replicar para outros anos (cada um vira
um banco em `simulados/bancos/` + um card em `capasimuladoenem.html`).
