# CLAUDE.md — Instruções para o Assistente

Este arquivo é lido automaticamente pelo assistente toda vez que o projeto é aberto.

## Regra Principal: Aprender Junto

**Antes de implementar qualquer feature ou modificação de código, explique:**
1. O que a feature faz (em português simples, sem jargão)
2. A lógica por trás (como o código vai pensar)
3. O que vai mudar no projeto (quais arquivos, quais funções)

Só implemente depois que o usuário confirmar que entendeu e quer prosseguir.

Se o usuário pedir uma explicação sobre qualquer parte do código existente, responda com analogias e exemplos concretos antes de mostrar código.

## Sobre o Projeto

**Duvid** — plataforma gamificada de Geografia para o Ensino Médio brasileiro.
- Moeda: globinhos
- Sistema: vidas, RPG, ranking, streak
- Stack: HTML/CSS/JS puro + W3.CSS + JSON estático
- Sem framework, sem build step — tudo vai direto por FTP

## Arquivos-chave

| Arquivo | Função |
|---|---|
| `js/jsquestoes-padrao.js` | Motor das questões (renderiza, verifica, feedback) |
| `js/duvid-ui.js` | UI compartilhada (modais, animações, globinhos) |
| `js/duvid-db.js` | Persistência local (localStorage) |
| `js/duvid-core.js` | Constantes globais (recompensas, tipos) |
| `js/aulas-3ano.json` | Catálogo de aulas do 3º ano |
| `questoes/Xano/*.json` | Banco de questões por ano |
| `questoes/modelo-questoes.html` | Template HTML das páginas de questões |

## Convenções do Projeto

- `dificuldade`: sempre `"facil"` / `"media"` / `"dificil"` (lowercase, sem acento)
- `ajuda`: string simples — dica pedagógica mostrada ANTES de responder
- `comentario`: string — explicação mostrada APÓS acerto (painel verde)
- `tags`: array de 2–5 strings com tópicos do currículo de Geografia

## Estrutura Pedagógica dos Textos (PHC)

Os textos de aula seguem a **Pedagogia Histórico-Crítica de Saviani** (5 momentos dialéticos).
Esta estrutura deve ser aplicada em todos os textos novos ou revisados.

### Os 5 momentos e como se traduzem nos blocos HTML:

| Momento PHC | Bloco no arquivo | Como escrever |
|---|---|---|
| Prática Social Inicial | Bloco 2 (antes: "Introdução") | 1–2 perguntas que ativam o que o aluno já vive e já sabe. Não abrir com estatística — abrir com experiência. Ex: "Tem alguém na sua família que migrou?" |
| Problematização | Bloco 3 (novo, curto) | 1 parágrafo explícito: qual problema social esta aula vai ajudar a entender? Não "vamos estudar X", mas "por que Y acontece enquanto Z?" |
| Instrumentalização | Blocos 4–8 (conteúdo) | Conceitos, glossário, imagens, questões práticas. Já funciona bem. |
| Catarse | Bloco 9 (antes: "Resumo") | Síntese transformadora, NÃO recapitulação. Começa com "Antes parecia que... agora você vê que...". O resumo dos conceitos pode vir depois, mas a frase de síntese vem primeiro. |
| Prática Social Final | Bloco 12 (antes: "Produção") | Fechar o ciclo: retornar ao ponto de partida (prática social inicial) agora com olhar transformado. Se abriu perguntando sobre a família, fechar pedindo para o aluno explicar aquela história com o que aprendeu. |

### Regra para as 10 questões do caderno:
- Mínimo de **3 questões analíticas/críticas**: "por que isso acontece", "quem se beneficia", "o que mudaria se...", "como isso afeta sua vida"
- Máximo de 7 questões de recuperação factual ("o que é", "cite", "explique")

### Checklist antes de criar cada texto:
1. O bloco 2 começa com pergunta sobre a vida do aluno, não com dado do professor?
2. O bloco 3 explicita o problema social que o conteúdo vai iluminar?
3. O bloco 9 (catarse) tem a frase "Antes parecia... agora você vê..."?
4. O bloco 12 (produção) retorna à realidade do aluno com o olhar transformado?
5. Há pelo menos 3 questões críticas/analíticas nas 10 do caderno?
6. `Saviani` e `Gasparin` estão no array `bibliografia` da aula em `aulas-2ano.json` / `aulas-3ano.json`?

## Pendências Conhecidas

Ver `APRENDER.md` para lista de features planejadas e explicações de implementação.
