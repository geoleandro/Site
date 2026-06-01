# Duvid — Melhorias Futuras

## ts14.html — Mapa clicável dos Climas do Brasil

**Estado atual:** Funcional. Clique nas áreas do mapa abre um card com climograma e descrição da cidade. CSS inline no `<head>` com `.card`, `.map-container`, `.content`. JS inline com `openModal` / `closeModal`.

**Melhorias planejadas:**

### 1. Extrair CSS para arquivo dedicado
- Mover o bloco `<style>` do `<head>` para `estilos/mapa-clima.css` (ou `estilos/ModeloCss.css`)
- Isso elimina o estilo inline e mantém o arquivo limpo
- Outros textos com mapas clicáveis poderiam reutilizar o mesmo CSS

### 2. Card responsivo para mobile
- No mobile atual, os cards usam `position: absolute` centralizado sobre o mapa — pode sair da tela em telas pequenas
- Melhorar o card para aparecer como modal fullscreen em mobile (já existe `.btn-modal` com display controlado por media query, mas o card em si não está otimizado)
- Alternativa: usar um painel lateral ou drawer em vez de card flutuante

### 3. Extrair `openModal` / `closeModal` para `jstextos-padrao.js` ou módulo separado
- As funções `openModal(id, event)` e `closeModal()` são genéricas e poderiam estar no JS global
- Permitiria reutilizar o padrão de mapa clicável em outros textos

### 4. Suporte a mais cidades / expandir o mapa
- Atualmente cobre 5 cidades: Belém, Salvador, Brasília, Belo Horizonte, Porto Alegre
- Faltam: Manaus (equatorial), Recife (litorâneo úmido NE), Cuiabá (tropical continental), Fortaleza (semiárido)
- Acrescentar `<area>` no `<map>` e novos `<div class="content">` para cada cidade nova

### 5. Climogramas dinâmicos com Chart.js
- Os climogramas atuais são imagens estáticas (ts14f02.png … ts14f06.png)
- Substituir por gráficos interativos com Chart.js (barras para chuva, linha para temperatura)
- Dados em JSON embutido ou em arquivo separado `ts14-dados.json`

### 6. Migrar para `jstextos-padrao.js`
- O arquivo ainda usa `jstextos.js` (versão antiga) com `NomeAlunos` e `MostrarFrase` (linha 1129)
- Para migrar: substituir `NomeAlunos('resp0','pq0')` pelo padrão novo de nome, e remover/adaptar `MostrarFrase` no botão do Desafio
- Remover o `MostrarProximo` / `addProgressBar` inline e usar a versão padrão (ajustar o divisor `/ 8` conforme número de tópicos)

---

## Simulados — Melhorias futuras

**Estado atual (Opção A aplicada):** Os 4 simulados (ENEM, FUVEST, UNESP, UNICAMP 2023) já têm o navbar padrão do site via `header-placeholder` + `footer-placeholder`. A lógica do quiz (form único, 10+ questões, Ajuda/Resposta colapsáveis) está intacta.

### Opção B — Visual update

- Trocar `<link href="../../../estilos/w3.css">` (arquivo local) pelo CDN: `https://www.w3schools.com/w3css/4/w3.css`
- Remover `body { max-width: 700px }` do `questoes.css` e envolver o conteúdo num `<div class="w3-content" style="max-width:750px; margin-bottom:80px">`
- Alinhar `.p2` (cabeçalho de questão) e `.h1` com o verde e fonte pixel do restante do site
- Extrair `questoes.css` inline para variáveis CSS compartilhadas

### Opção C — Questões em JSON (data-driven)

- Criar `simulados-data/<vestibular><ano>.json` com array de questões: `{ num, enunciado, ajuda, resposta, alternativas[], gabarito }`
- Criar `js/simulado-renderer.js` que lê o JSON e monta o `<form id="quiz">` dinamicamente
- Benefícios: adicionar novos simulados sem escrever HTML, habilitar filtro por tema/ano, salvar progresso no localStorage
- Pré-requisito: padronizar estrutura das questões (hoje a FUVEST tem imagens inline, a UNICAMP tem formatos distintos)

---

## Gamificação — Melhorias futuras

### Prioridade 1 — Streak diário
- Contador no `DuvidDB` que reseta à meia-noite
- Bônus de globinhos por dias consecutivos (ex: dia 3 = +10, dia 7 = +30)
- Badge de "sequência ativa" no header

### Prioridade 2 — Tela de recompensa estilo Zelda
- Ao finalizar aula: modal com baú se abrindo (pixel art), fanfarra de 3s
- Exibe nome da habilidade desbloqueada ("Você aprendeu: Placas Tectônicas")
- Animação de globinhos caindo antes de fechar

### Prioridade 3 — Batalha por turnos (RPG de questões)
- Questão = combate contra inimigo geográfico com nome e barra de vida
- Alternativas = ataques com nome de técnica geográfica
- Acerto → dano crítico + som de golpe + animação pixel art
- Erro → contra-ataque do inimigo + perde coração com animação de dano
- Ver detalhamento completo abaixo ↓

### Prioridade 4 — Cartas colecionáveis geográficas
- Cada aula concluída dropa 1 carta pixel (conceito, país ou fenômeno)
- Raridade: comum / raro / lendário
- Álbum de cartas no perfil do aluno

### Prioridade 5 — Mapa de fases estilo Super Mario World
- Substituir lista de aulas por mapa pixel navegável
- Regiões do Brasil ou do mundo como "mundos"
- Aulas concluídas com bandeirinha; bloqueadas aparecem escuras

---

## Geral — Melhorias de plataforma

- **migrar_questoes_abertas.py**: `tp3.html` e `tp3Novo.html` têm estrutura multi-form complexa (`PerAberta`, `PerguntasAbertas4`, `PerguntasAbertasDesafio`, IDs `quiz1`–`quiz4`) — precisam de migração manual
- **tp2.html (Texto29)**: `PerguntasAbertas` definida inline com gabaritos (`noroeste`, `sudeste`) — migrar manualmente extraindo as respostas da função inline

---

## Scripts de manutenção — pasta `scripts_manager/`

Os scripts Python de manutenção do site estão centralizados em `scripts_manager/`.

### Concluídos
- ✅ **tp19–22 (1ano)**: Remoção de cores excessivas, emojis, ícones e excesso de `<strong>` (máx. 5 por texto). `<b class="fontePixel">OUVIR AULA</b>` corrigido em todos os 4 arquivos.
- ✅ **validarRadio**: Padronização do parâmetro `nota` para `'10'` em todos os textos.
- ✅ **tp13 jogo das rochas**: Substituição de `Play()` / `Play2()` por `playSom('acerto')` / `playSom('erro')`.
- ✅ **Simulados (Opção A)**: Navbar padrão adicionado aos 4 simulados (ENEM, FUVEST, UNESP, UNICAMP 2023).
- ✅ **`.gitignore`**: Criado na raiz do repositório para bloquear binários (imagens, áudio, fontes, PDF, DOCX).

### Pendentes
- **Opção B / C dos Simulados**: Visual update e versão JSON-driven (ver seção Simulados acima)
- **ts14.html**: Migração para `jstextos-padrao.js` e melhorias do mapa clicável (ver seção ts14 acima)
