# APRENDER.md — Caderno de Programação do Duvid

Este arquivo cresce junto com o site. Cada vez que implementamos algo novo, a lógica é documentada aqui em português claro — sem jargão, com analogias.

---

## Como o Sistema de Questões Funciona

**Arquivo principal:** `js/jsquestoes-padrao.js`

Imagine o sistema como um baralho de cartas. Quando a página abre:

1. O código lê o `id` da URL (ex: `?id=336`)
2. Busca o arquivo JSON correspondente (`questoes/3ano/336.json`)
3. Embaralha as questões como um baralho
4. Exibe uma por vez

Quando o aluno clica em VERIFICAR:
- Se acertou → painel verde aparece com o `comentario`
- Se errou → painel amarelo aparece com a `ajuda` (dica), perde uma vida

Quando todas as questões acabam → chama `finalizar()`, que calcula a nota e exibe o modal.

**Variáveis de estado** (o "placar" que o jogo guarda na memória):
```js
let questoes = [];     // array com todas as questões embaralhadas
let indiceAtual = 0;  // qual questão estamos vendo agora (começa na 0)
let nota = 0;         // quantas acertou
let vidas = 3;        // vidas restantes
```

---

## Sistema de Vidas ❤️

**Por que existe:** Penaliza o chute. Se o aluno errar sem pensar, perde vida.

**Lógica:**
- Começa com 3 vidas
- Erro → `vidas--` (diminui 1)
- As vidas NÃO resetam entre questões — duram a sessão inteira
- Se terminar com todas as 3 vidas intactas → bônus de 20 globinhos

**Onde fica no código:** função `perderVida()` em `jsquestoes-padrao.js`

---

## Campo `ajuda` — Dica do Professor 💡

**O que é:** Uma frase que guia o raciocínio do aluno ANTES de responder. Não dá a resposta, só aponta o caminho.

**Exemplo bom de ajuda:**
> "Pense em qual país tem a segunda maior população do mundo e como isso pressiona seus recursos naturais."

**Exemplo ruim (dá a resposta):**
> "A resposta correta é a China."

**Como aparece:** Botão "💡 DICA DO PROFESSOR" acima das alternativas. Ao clicar, abre um painel inline.

**Onde fica no código:** função `gerarBotaoDica(q)` — retorna `''` (vazio) se a questão não tiver `ajuda`.

---

## Campo `comentario` — Explicação do Professor 📖

**O que é:** Aparece no painel verde APÓS o acerto. Explica por que a resposta está certa e dá contexto geográfico.

**Diferença do `ajuda`:**
- `ajuda` = antes de responder, orienta
- `comentario` = depois de acertar, aprofunda

---

## Tags e Dificuldade

**`tags`:** Array de tópicos. Serve para no futuro filtrar questões por assunto.
```json
"tags": ["geopolítica", "Ásia", "conflitos territoriais"]
```

**`dificuldade`:** Sempre em lowercase, sem acento:
- `"facil"` — conceito direto, memorização
- `"media"` — precisa relacionar dois conceitos
- `"dificil"` — análise, interpretação, múltiplos conceitos

---

## Features Planejadas

### 🔥 Combo de Acertos *(✅ implementado em junho/2026)*

**O que é:** Contador de respostas certas consecutivas. Errou? Volta pro zero.

**Por que é útil:** Incentiva o aluno a pensar antes de responder (chutar quebra o combo). Cria tensão positiva.

**Lógica:**
```
Acertou → combo++
Errou   → combo = 0
```

**Patamares e recompensas:**

| Combo | Nome | Bônus |
|-------|------|-------|
| 3 seguidas | 🔥 Em Chamas! | +5 globinhos |
| 5 seguidas | ⚡ Imparável! | +10 globinhos |
| 7+ seguidas | 🌟 Lendário! | +15 globinhos |

**Mudanças no código:**
- `jsquestoes-padrao.js`: adicionar variável `combo`, lógica em `verificar()`, badge em `exibirPainelFeedback()`
- Resetar em `tentarNovamente()`

---

### 📋 Modo Revisão dos Erros *(✅ implementado em junho/2026)*

**O que é:** Após terminar todas as questões, o aluno pode clicar em "Refazer só as que errei".

**Lógica:**
- Guardar índice de cada questão errada em um array `questoesErradas[]`
- No modal final, se tiver erros, mostrar botão extra
- Ao clicar, recarregar com apenas essas questões

**Onde guardar:** Variável em memória (não precisa de localStorage — só dura a sessão).

---

### 📅 Streak Diário *(planejado)*

**O que é:** Contador de dias consecutivos que o aluno acessa a plataforma.

**Por que é o recurso #1 de retenção:** Duolingo, Todoist, GitHub — todos usam. O medo de "quebrar a sequência" traz o aluno de volta todo dia.

**Lógica:**
- Salvar no localStorage: `{ ultimoAcesso: "2026-06-03", streak: 5 }`
- Ao abrir a plataforma: comparar data de hoje com `ultimoAcesso`
  - Mesmo dia → não faz nada
  - Dia seguinte → `streak++`, atualiza data
  - Mais de 1 dia de diferença → `streak = 1` (perdeu a sequência)

**Onde implementar:** `js/duvid-db.js`

---

## Estrutura de um JSON de Questões

```json
{
  "id": 1,
  "instituicao": "ENEM",
  "ano": "2019",
  "dificuldade": "media",
  "tags": ["urbanização", "Brasil", "demografia"],
  "texto_apoio": "Texto base opcional que contextualiza a questão...",
  "pergunta": "O enunciado da questão fica aqui.",
  "alternativas": [
    "Alternativa A",
    "Alternativa B",
    "Alternativa C (correta)",
    "Alternativa D",
    "Alternativa E"
  ],
  "correta": 2,
  "ajuda": "Pense em qual processo histórico concentrou a população nas cidades brasileiras.",
  "comentario": "A industrialização do século XX foi o principal motor da urbanização acelerada no Brasil..."
}
```

> **Atenção:** `correta` usa índice começando em 0. Alternativa A = 0, B = 1, C = 2...

---

# TODO.md — Próximas Implementações do Duvid

Arquivo de pendências técnicas. Cada item tem o que fazer, por que fazer e o que muda no projeto.

---

## Técnica 1 Feedback por Alternativa *(✅ implementado em junho/2026)*

**O que é:**
Em vez de uma dica genérica no campo `ajuda`, cada alternativa errada tem uma explicação específica pro erro que o aluno cometeu.

**Por que vale a pena:**
O aluno sente que o sistema entendeu *onde* ele errou — não só *que* ele errou. Parece IA. É JSON bem escrito.

**O que muda no projeto:**

| O que | Como |
|-------|------|
| Estrutura do JSON | Adicionar campo `feedbacks` com chave por índice de alternativa |
| `jsquestoes-padrao.js` | Função `exibirPainelFeedback()` lê `feedbacks[indiceSelecionado]` |
| `modelo-questoes.html` | Nenhuma mudança visual necessária |

**Exemplo de JSON novo:**
```json
"feedbacks": {
  "0": "Você marcou A — esse erro é comum. A URSS era socialista, não capitalista.",
  "1": "Você marcou B — quase! Mas o Plano Marshall foi americano, não soviético.",
  "3": "Você marcou D — confundiu datas. O muro caiu em 1989, não 1991."
}
```

> ⚠️ `feedbacks` usa índice começando em 0. Igual ao campo `correta`.
> Só precisa das alternativas **erradas** — a certa já tem o `comentario`.

**Convenção de escrita dos textos de feedback:**

Nunca usar travessão (—) nem hífen como conector entre orações. Em vez disso, use a pontuação que melhor serve ao contexto:

| Situação | Use |
|----------|-----|
| O trecho seguinte continua ou detalha a ideia | vírgula |
| Há uma pausa mais forte ou mudança de foco | ponto final |
| O trecho seguinte é explicação ou conclusão direta | dois pontos |
| A informação é um aposto no meio da frase | parênteses |
| Há relação de causa | "pois" |
| Há contraste | "mas" |

Exemplo errado: `"Essa definição descreve a superfície física — não inclui o humano."`
Exemplo certo: `"Essa definição descreve a superfície física, mas não inclui o elemento humano."`

---

## Técnica 2 — Trilha Adaptativa *(prioridade média)*

**O que é:**
Ao terminar a sessão, o JS analisa o desempenho e redireciona o aluno pra questões adequadas ao nível dele.

**Por que vale a pena:**
O aluno sente que o jogo responde ao desempenho dele. Cria progressão real, não só repetição.

**Lógica:**
```
Acertou 80%+ → redireciona pra questões difíceis do mesmo tema
Acertou 50–79% → repete questões médias + mostra dica de revisão
Acertou menos de 50% → redireciona pra questões fáceis + mensagem de encorajamento
```

**O que muda no projeto:**

| O que | Como |
|-------|------|
| `jsquestoes-padrao.js` | Função `finalizar()` calcula percentual e define próxima rota |
| `aulas-3ano.json` | Adicionar campo `nivel_anterior` e `nivel_avancado` por aula |
| Modal final | Botão "Próximo desafio" com destino dinâmico |

---

## Técnica 3 — Comentário em Áudio do Professor *(prioridade média)*

**O que é:**
O campo `comentario` pós-acerto pode incluir um áudio curto do professor explicando o conceito — em vez de só texto.

**Por que vale a pena:**
A voz do professor no momento em que o aluno acabou de acertar é pedagogicamente poderoso. Ele está receptivo. Você já fez o trabalho uma vez, o JS toca na hora certa pra sempre.

**Lógica:**
```
Aluno acerta → painel verde aparece → se tiver áudio, toca automaticamente
Se não tiver áudio → comportamento atual (só texto)
```

**O que muda no projeto:**

| O que | Como |
|-------|------|
| Estrutura do JSON | Adicionar campo opcional `audio_comentario` com caminho do arquivo |
| `jsquestoes-padrao.js` | Função `exibirPainelAcerto()` verifica se existe `audio_comentario` |
| Servidor | Criar pasta `/audio/` pra guardar os arquivos `.mp3` |
| `modelo-questoes.html` | Adicionar elemento `<audio>` invisível |

**Exemplo de JSON novo:**
```json
"comentario": "A industrialização do século XX foi o principal motor da urbanização acelerada no Brasil.",
"audio_comentario": "audio/336-q1-comentario.mp3"
```

> 💡 Grave áudios curtos (20–40 segundos). Qualidade de celular já basta.
> Nome do arquivo: `[id-aula]-q[numero]-comentario.mp3` pra organizar.

---

## Limpeza de fonte_apoio nos JSONs de questões *(pendente)*

**O problema:**
Alguns arquivos JSON têm a fonte da questão (banca, autor, publicação) embutida dentro do campo `texto_apoio` ou `pergunta`, em vez de estar no campo próprio `fonte_apoio`.

**O que precisa ser feito:**
Percorrer todos os JSONs e, onde a fonte aparecer colada ao texto ou à pergunta (geralmente entre parênteses ou após travessão no final), extraí-la e colocá-la no campo `fonte_apoio`.

**Exemplo do problema:**
```json
"texto_apoio": "A urbanização brasileira ocorreu de forma acelerada... (IBGE, 2020)"
"fonte_apoio": null
```

**Como deve ficar:**
```json
"texto_apoio": "A urbanização brasileira ocorreu de forma acelerada..."
"fonte_apoio": "IBGE, 2020"
```

**Quando fazer:** após terminar os feedbacks por alternativa em todos os arquivos.

---

## GIFs da Jéssica por Tema de Aula *(pendente — tarefa do bolsista)*

**O que é:**
A personagem Jéssica aparece animada nas questões com 4 estados emocionais. Cada bloco temático de aulas tem seu próprio pacote de GIFs, com a Jéssica segurando objetos do conteúdo (mapa, globo, dinossauro etc.).

**Os 4 GIFs que cada tema precisa:**

| Arquivo | Quando aparece | Tamanho na tela |
|---|---|---|
| `acerto.gif` | Resposta certa (sem combo) | Overlay centralizado, some após 2s |
| `inteligente.gif` | Resposta certa com 3+ acertos seguidos | Overlay centralizado, some após 2s |
| `erro.gif` | Resposta errada | Inline no painel amarelo (160px) |
| `duvida.gif` | Aluno abre a dica do professor | Inline no painel de dica (100px) |

**Onde salvar os arquivos:**
```
questoes/personagem/{nome-do-tema}/acerto.gif
questoes/personagem/{nome-do-tema}/inteligente.gif
questoes/personagem/{nome-do-tema}/erro.gif
questoes/personagem/{nome-do-tema}/duvida.gif
```

**Temas planejados e aulas correspondentes:**

| Pasta | Aulas | Tema visual sugerido |
|---|---|---|
| `default` | Todas sem tema próprio | Jéssica padrão (já existe) |
| `cartografia` | 103, 104, 105, 106 | Jéssica com mapa, bússola, GPS |
| `africa` | 325, 326, 327 | Jéssica com mapa da África, máscaras |
| `oriente-medio` | 328, 329 | Jéssica com globo destacando a região |
| `asia` | 331, 332, 333, 334, 335 | Jéssica com elementos asiáticos |
| `brasil` | 201–215 (2º ano) | Jéssica com bandeira, mapa do Brasil |

> Adicione novas pastas conforme o bolsista entregar. Não precisa mexer no código — só criar a pasta com os 4 arquivos e descomentar o mapeamento em `jsquestoes-padrao.js`.

**Para ativar um tema após receber os GIFs:**

Abra `js/jsquestoes-padrao.js`, localize o objeto `PERSONAGEM_TEMAS` e descomente as linhas do tema:

```js
const PERSONAGEM_TEMAS = {
    103: 'cartografia', 104: 'cartografia', 105: 'cartografia', 106: 'cartografia',
    // 325: 'africa', 326: 'africa', 327: 'africa',
};
```

**Especificações técnicas para o bolsista:**
- Formato: GIF animado com fundo transparente
- Dimensões sugeridas: 300×400px (retrato)
- Fundo: transparente (`.gif` com transparência ou fundo escuro que combine)
- Duração da animação: 2–4 segundos em loop
- O `acerto.gif` e `inteligente.gif` ficam no centro da tela — devem ser impactantes
- O `erro.gif` e `duvida.gif` ficam menores, ao lado do texto — devem ser discretos

---

## Ordem Sugerida de Implementação

1. **Técnica 1** — menor esforço, maior impacto imediato na experiência do aluno
2. **Técnica 3** — você pode gravar áudios em paralelo enquanto planeja a Técnica 2
3. **Técnica 2** — exige repensar a estrutura de navegação entre aulas

---

*Atualizado em: junho 2026*
*Ver também: APRENDER.md (lógica das features) | CLAUDE.md (convenções do projeto)*

*Atualizado em: junho 2026*
