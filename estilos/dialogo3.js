const typingSpeedSlider = document.getElementById("typingSpeed");
const typingSound = new Audio('../audios/dialogsound.mp3');

let currentTypingSpeed = typingSpeedSlider.value;
let currentLine = 0;
let dialogLines;
const typingSpeed = 30;
let isFirstDialogDone = false;
let isSecondDialogDone = true;
let apertouDialogo = true;
let isSecondDialogActivated = false;
const balao1 = document.querySelector('.balao1');
const balao2 = document.querySelector('.balao2');

const imagensDialogo = [
    document.getElementById('demo1-img'),
    document.getElementById('demo2-img'),
    document.getElementById('demo3-img'),
    document.getElementById('demo4-img')
];

function ShowDialog(newLines, targetID, idBalao) {
    if (isSecondDialogDone && apertouDialogo) {
        dialogLines = newLines;
        currentLine = 0;
        document.getElementById(targetID).innerHTML = '';
        AtivaDialogo(targetID, currentTypingSpeed);
        isFirstDialogDone = false;
        balao1.style.display = "block";
        TransicaoBalao(idBalao);
    }
    resetDialogVariables();
}

function TransicaoBalao(el) {
    document.getElementById(el).classList.add('fadeBaloon');
}

function adicionarEventoDeCliqueAoPersonagem(targetID) {
    AvancaDialogo(targetID);
    apertouDialogo = true;
}

function ShowSecondDialog(newLines, targetID, idBaloon) {
    if (isFirstDialogDone && apertouDialogo && !isSecondDialogActivated) {
        dialogLines = newLines;
        currentLine = 0;
        document.getElementById(targetID).innerHTML = '';
        AtivaDialogo(targetID, currentTypingSpeed);
        isSecondDialogActivated = true;
        balao2.style.display = "block";
        TransicaoBalao(idBaloon);
    }
    resetDialogVariables();
}

function AtivaDialogo(targetID, currentTypingSpeed) {
    typeWriter(dialogLines[currentLine], targetID, 0, currentTypingSpeed);
}

function typeWriter(txt, targetID, contadorLetras, speed) {
    let waitTime = dialogLines[currentLine].length;
    if (contadorLetras < txt.length) {
        document.getElementById(targetID).innerHTML += txt.charAt(contadorLetras);
        contadorLetras++;
        typingSound.play();
        setTimeout(function () {
            apertouDialogo = false;
            typeWriter(txt, targetID, contadorLetras, speed);
        }, speed);
    } else {
        setTimeout(function () {
            AvancaDialogo(targetID);
            typingSound.pause();
            typingSound.currentTime = 0;
        }, speed * waitTime);
    }
}

function AvancaDialogo(targetID) {
    currentLine++;
    apertouDialogo = true;
    if (currentLine < dialogLines.length) {
        document.getElementById(targetID).innerHTML = '';
        AtivaDialogo(targetID, currentTypingSpeed);
    } else {
        document.getElementById(targetID).innerHTML = '';
        isFirstDialogDone = true;
        isSecondDialogDone = false;
        balao1.style.display = "none";
        balao2.style.display = "none";
    }
}

function resetDialogVariables() {
    isFirstDialogDone = false;
    isSecondDialogDone = true;
    apertouDialogo = true;
    contadorDialogo = 0;
    isSecondDialogActivated = false;
}

function ActiveDialogVariables() {
    isFirstDialogDone = true;
    isSecondDialogDone = false;
    apertouDialogo = false;
    contadorDialogo = 0;
    isSecondDialogActivated = true;
}

// function DesativarCliqueImagens() {
//     for (let i = 0; i < imagensDialogo.length; i++) {
//         imagensDialogo[i].onclick = function() {
//             apertouDialogo = false;
//         };
//     }
// }

// function ReativarCliqueImagens() {
//     for (let i = 0; i < imagensDialogo.length; i++) {
//         imagensDialogo[i].onclick = function() {
//             // Reativar o clique nas imagens
//         };
//     }
// }
