/* ===========================================
   DICIONÁRIO INTERATIVO + QUIZ + FAVORITOS
   =========================================== */

/* ========= 1. DEFINIÇÕES ========= */
const definicoes = {
  conjuntura: "Combinação ou concorrência de acontecimentos ou eventos em um dado momento; situação.",
  geopolítica: "Estudo da relação entre poder político e espaço geográfico.",
  hegemonia: "Supremacia ou liderança de um Estado ou grupo sobre os demais.",
  "organizações internacionais": "Instituições formadas por países para cooperar em questões políticas, econômicas ou sociais.",
  "conflitos híbridos": "Guerras que combinam estratégias militares tradicionais com ciberataques, desinformação e pressões econômicas."
};

/* ========= 2. TOOLTIP + GLOSSÁRIO ========= */
document.querySelectorAll('.termo').forEach(termo => {
  termo.addEventListener('click', () => {
    const palavra = termo.dataset.palavra.toLowerCase();
    
    // Cria tooltip se não existir
    let tooltip = termo.querySelector('.tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'tooltip w3-animate-opacity';
      tooltip.innerHTML = `
        <p>${definicoes[palavra] || "Definição não encontrada."}</p>
        <div class="actions" style="text-align:right; margin-top:8px;">
          <button class="w3-button w3-small w3-yellow" data-action="fav">⭐</button>
          <button class="w3-button w3-small w3-light-blue" data-action="note">✎</button>
        </div>
      `;
      termo.appendChild(tooltip);

      // Botão Favoritar
      tooltip.querySelector('[data-action="fav"]').addEventListener('click', () => {
        adicionarFavorito(palavra);
      });

      // Botão Anotar
      tooltip.querySelector('[data-action="note"]').addEventListener('click', () => {
        let nota = prompt(`Digite sua anotação para "${palavra}":`);
        if (nota) {
          adicionarFavorito(palavra, nota);
        }
      });
    }

    // Toggle exibição do tooltip
    tooltip.classList.toggle('show');

    // Adiciona ao glossário da aula automaticamente
    const glossario = document.querySelector('#glossario ul');
    if (!glossario.querySelector(`[data-gloss="${palavra}"]`)) {
      const li = document.createElement('li');
      li.setAttribute('data-gloss', palavra);
      li.innerHTML = `<b>${palavra}</b>: ${definicoes[palavra]}`;
      glossario.appendChild(li);
    }
  });
});

/* ========= 3. FAVORITOS / ANOTAÇÕES ========= */
function adicionarFavorito(palavra, nota = "") {
  const favoritos = document.querySelector('#favoritos div');
  let itemExistente = favoritos.querySelector(`[data-fav="${palavra}"]`);

  if (!itemExistente) {
    const p = document.createElement('p');
    p.setAttribute('data-fav', palavra);
    p.innerHTML = `<b>${palavra}:</b> ${definicoes[palavra]} ${nota ? `<br><i>✎ ${nota}</i>` : ""}`;
    favoritos.appendChild(p);
  } else if (nota) {
    itemExistente.innerHTML = `<b>${palavra}:</b> ${definicoes[palavra]} <br><i>✎ ${nota}</i>`;
  }
}

/* ========= 4. QUIZ ========= */
function gerarQuiz() {
  const termos = Object.keys(definicoes);
  const quizContainer = document.getElementById('quiz-container');
  quizContainer.innerHTML = ""; // limpa antes de gerar

  termos.forEach(palavra => {
    const correta = definicoes[palavra];
    let alternativas = [correta];

    // Seleciona 3 incorretas aleatórias
    let incorretas = termos.filter(t => t !== palavra)
                           .sort(() => 0.5 - Math.random())
                           .slice(0,3);
    incorretas.forEach(i => alternativas.push(definicoes[i]));

    // Embaralha alternativas
    alternativas = alternativas.sort(() => 0.5 - Math.random());

    // Cria o bloco de pergunta
    const div = document.createElement('div');
    div.className = "w3-card w3-padding w3-margin-bottom quiz-pergunta";

    const p = document.createElement('p');
    p.innerHTML = `<b>O que significa "${palavra}"?</b>`;
    div.appendChild(p);

    // Cria botões das alternativas
    alternativas.forEach(opcao => {
      const btn = document.createElement('button');
      btn.className = "w3-button w3-light-grey w3-round w3-margin-right w3-margin-top quiz-opcao";
      btn.textContent = opcao;

      btn.addEventListener('click', () => {
        if (opcao === correta) {
          btn.classList.add("quiz-correta");
        } else {
          btn.classList.add("quiz-incorreta");
        }
      });

      div.appendChild(btn);
    });

    quizContainer.appendChild(div);
  });
}


// TIMELINE
const character = document.querySelector('.character');
const gameInfo = document.getElementById('game-info');

document.querySelectorAll('.timeline-block').forEach((block, index) => {
  block.addEventListener('click', () => {
    // Move o personagem até o bloco clicado
    character.style.left = `${block.offsetLeft}px`;

    // Mostra info do evento
    gameInfo.innerHTML = `<b>${block.dataset.ano}:</b> ${block.dataset.info}`;
  });
});



/* ========= 5. BOTÃO DO QUIZ ========= */
document.getElementById("btnQuiz").addEventListener("click", gerarQuiz);
