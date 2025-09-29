
// 🎯 Função para gerar quiz
function gerarQuiz() {
  const termos = Object.keys(definicoes);
  const quizContainer = document.getElementById('quiz-container');
  quizContainer.innerHTML = ""; // limpa antes de gerar

  termos.forEach(palavra => {
    let correta = definicoes[palavra];
    let alternativas = [correta];

    // Escolher 3 incorretas
    let incorretas = termos.filter(t => t !== palavra);
    incorretas = incorretas.sort(() => 0.5 - Math.random()).slice(0, 3);
    incorretas.forEach(i => alternativas.push(definicoes[i]));

    // Embaralhar
    alternativas = alternativas.sort(() => 0.5 - Math.random());

    // Criar bloco
    let div = document.createElement('div');
    div.className = "w3-card w3-padding w3-margin-bottom";

    let pergunta = document.createElement('p');
    pergunta.innerHTML = `<b>O que significa "${palavra}"?</b>`;
    div.appendChild(pergunta);

    alternativas.forEach(opcao => {
      let btn = document.createElement('button');
      btn.className = "w3-button w3-light-grey w3-round w3-margin-right w3-margin-top";
      btn.textContent = opcao;

      btn.addEventListener('click', () => {
        if (opcao === correta) {
          btn.className = "w3-button w3-green w3-round w3-margin-right w3-margin-top";
        } else {
          btn.className = "w3-button w3-red w3-round w3-margin-right w3-margin-top";
        }
      });

      div.appendChild(btn);
    });

    quizContainer.appendChild(div);
  });
}

document.querySelectorAll('.timeline-event').forEach(evento => {
  evento.addEventListener('click', () => {
    const infoBox = document.getElementById('timeline-info');
    infoBox.innerHTML = `<b>${evento.dataset.ano}:</b> ${evento.dataset.info}`;
  });
});


// 🔘 Gerar quiz quando clicar no botão
document.getElementById("btnQuiz").addEventListener("click", gerarQuiz);