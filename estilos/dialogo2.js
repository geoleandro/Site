


	  // Variáveis globais
	  let currentDialogueIndex = 0;
  
	  // Função para exibir o próximo diálogo
	  function showCurrentDialogue() {
		const currentDialogue = dialogues[currentDialogueIndex];
		const dialogueElement = document.getElementById(`dialogue${currentDialogueIndex % 2 + 1}`);
		dialogueElement.textContent = `${currentDialogue.speaker}: ${currentDialogue.text}`;
  
		// Alternar a exibição dos balões
		const balloons = document.querySelectorAll('.balloon');
		balloons.forEach(balloon => {
		  balloon.style.display = 'none';
		});
		dialogueElement.parentElement.style.display = 'block';
	  }
  
	  // Função para avançar para o próximo diálogo
	  function nextDialogue() {
		currentDialogueIndex++;
  
		// Verifica se ainda há diálogos para exibir
		if (currentDialogueIndex < dialogues.length) {
		  // Exibe o próximo diálogo
		  showCurrentDialogue();
		} else {
		  // Caso contrário, todos os diálogos foram exibidos
		  alert("Fim do diálogo.");
		}
	  }
  
	  // Inicializa exibindo o primeiro diálogo
	  showCurrentDialogue();