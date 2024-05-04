const botaoDialogo = document.getElementById('botaoDialogo');

const botaoDialogo2 = document.getElementById('botaoDialogo2');

const typingSound = new Audio('../../../audios/dialogsound.mp3');


// Inicia o som junto com a exibição do primeiro diálogo
// Variáveis globais
let currentDialogueIndex = 0;

// Função para exibir o próximo diálogo letra por letra
function showCurrentDialogue(idPrefix, nomeDialogo) {

    DesativarBtnIniciar(true);

    // botaoReiniciar.disabled = true;

    const currentDialogue = nomeDialogo[currentDialogueIndex];

    const dialogueElement = document.getElementById(`${idPrefix}${currentDialogueIndex % 2 + 1}`);
    dialogueElement.textContent = ''; // Limpa o conteúdo do elemento

    // console.log(dialogueElement);

    let currentIndex = 0; // Variável para acompanhar o índice da letra atual

    typingSound.play();

    dialogueElement.parentElement.style.display = 'block';

    //botaoDialogo.disabled = true;



    // Função para adicionar letras uma por uma
    function addLetter() {
        if (currentIndex < currentDialogue.text.length) {

            dialogueElement.textContent += currentDialogue.text.charAt(currentIndex); // Adiciona a próxima letra
            currentIndex++; // Incrementa o índice da letra
            setTimeout(addLetter, 30); // Chama recursivamente após um pequeno intervalo




        }
        else {
            // Todas as letras foram adicionadas, reativar o botão

            // botaoDialogo.disabled = false;
            typingSound.pause(); // Pausa a reprodução do som
        }
    }

    addLetter(); // Inicia a adição de letras


}

// Função para avançar para o próximo diálogo
function nextDialogue(idPrefix, nomeDialogo, event) {
    event.preventDefault(); // Evita o comportamento padrão do navegador

    document.getElementById(idPrefix + (currentDialogueIndex % 2 + 1)).disabled = true;


    currentDialogueIndex++;


    // Verifica se ainda há diálogos para exibir
    if (currentDialogueIndex < nomeDialogo.length) {
        // Desativa o botão enquanto o texto está sendo digitado

        //botaoDialogo.disabled = true;

        // Exibe o próximo diálogo letra por letra
        showCurrentDialogue(idPrefix, nomeDialogo);



    } else {
        // Caso contrário, todos os diálogos foram exibidos
        // Desativa o botão de diálogo

        DesativarBalao();

        // Encerra o som
        typingSound.pause();

        DesativarBtnIniciar(false);


        // botaoDialogo.innerHTML = "Fim do diálogo";
        // botaoDialogo.disabled = true;

        //botaoReiniciar.disabled = false;



    }
}



function DesativarBalao() {

    // Alternar a exibição dos balões
    const balloons = document.querySelectorAll('.balloon');
    balloons.forEach(balloon => {
        balloon.style.display = 'none';


    });


}

function DesativarBtnIniciar(ativar) {

    // Alternar a exibição dos balões

    // Alternar a exibição dos balões
    const btnIniciar = document.querySelectorAll('.btnIniciar');
    btnIniciar.forEach(btnIniciar => {
        btnIniciar.disabled = ativar;


    });


}





// Inicializa exibindo o primeiro diálogo
// showCurrentDialogue();



// Função para aplicar a transição de balão
function TransicaoBalao() {
    const balao = document.querySelectorAll('balao1');
    balao.classList.add('fadeBaloon');


}



// Função para reiniciar o diálogo
function reiniciarDialogo(idPrefix, nomeDialogo) {
    // Reinicia o índice do diálogo para o primeiro diálogo
    currentDialogueIndex = 0;

    // Reativa o botão de diálogo

    //botaoDialogo.disabled = false;
    //botaoDialogo.innerHTML = "Próximo";

    // Limpa o conteúdo dos elementos de diálogo
    for (let i = 0; i < nomeDialogo.length; i++) {
        const dialogueElement = document.getElementById(`${idPrefix}${i % 2 + 1}`);
        dialogueElement.textContent = '';
    }

    // Inicia o diálogo novamente
    showCurrentDialogue(idPrefix, nomeDialogo);
}

