
var nomeEstudante = "";

var nota = 0;

var fontes = ["Tahoma", "pixel", "Arial"];



// var cor = ["#000000", "#191970", "#20B2AA", "#6B8E23", "#4B0082", "#A020F0", "#FF1493", "#FA8072", "#FF8C00", "#DC143C"];

var aleatorio = Math.round(Math.random() * fontes.length);

//console.log(fontes[aleatorio]);

var imagemGlobinhoFinal = document.getElementById("globinhoFinal");

var numB = 0;


var notaDesafio = 0;

var button1 = document.getElementById("button50");
var button52 = document.getElementById("button52");

var corretas = 0;

// Inserido geralmente no final das questões abertas para chamar o botão Próximo 
function MostraButton(btn) {
    buttonQ1 = document.getElementById(btn).style.display = "block";

}

function EscondeButton(btn) {
    buttonQ2 = document.getElementById(btn).style.display = "none";

}

// Função inicial para inserir nome do aluno
function NomeAlunos(idResp, pqx) {
    nomeEstudante = document.getElementById(pqx).value;
    button = document.getElementById("buttonA");
    buttonConfira = document.getElementById("buttonConfira");


    if (nomeEstudante == "" || nomeEstudante.match(/^(\s)+$/)) {// se não digitar no textarea não faz nada
        document.getElementById(pqx).style.backgroundColor = "#EF5959";
        Play("../audio2.mp3");
        return;
    }

    else {
        document.getElementById(idResp).innerHTML = "Bem-vindo(a) " + nomeEstudante + ".";
        document.getElementById(pqx).style.display = "none";
        document.getElementById("caixaNomeAluno").style.display = "none";
        button.style.display = "block";
        buttonConfira.style.display = "none";
    }

}



// Modifica as fontes do texto aleatoriamente. É chamada no body onload
function paragrafotexto() {
    var p = document.querySelectorAll("h1");
    for (var i = 0; i < p.length; i++) {
        p[i].style.fontFamily = fontes[aleatorio];

    }


}



// Apaga os botões próximo	
function ApagaButton() {
    var t = document.getElementsByClassName("button");
    for (var i = 0; i < t.length; i++) {
        t[i].style.display = "none";
    }
}






// É chamada nas questões abertas decimais para ver se completou um inteiro.
function VerificaInteiro(idResp) {

    var inteiro = Number.isInteger(nota);
    var int = Math.trunc(nota)


    if (inteiro == false) {
        nota = int;
        document.getElementById(idResp).innerHTML = " Quase lá " + nomeEstudante + "." + " Acerte todas as questões para ganhar o globinho. Você permanece com " + nota + ".";
        document.getElementById("notaFixa").innerHTML = nota.toFixed(1);
    }

    else {
        document.getElementById(idResp).innerHTML = "Por ter acertado todas as questões " + nomeEstudante + ", ganhou mais um globinho, agora já possui " + nota + ".";
        document.getElementById("notaFixa").innerHTML = nota.toFixed(1);
    }

    // document.getElementById(idResp).innerHTML = "Não atingiu o máximo para ganhar o globinho. Está com "  + nota;
}



//audio acerto
function Play(nomeAudio) {
    var audio1 = new Audio();
    audio1.src = nomeAudio;
    audio1.play();
    //document.getElementById(obj).hidden = true;
}
//audio erro
function Play2(nomeAudio2) {
    var audio1 = new Audio();
    audio1.src = nomeAudio2;
    audio1.play();

    //document.getElementById(obj).hidden = true;
}




function Aparecer(imagem, paragrafo) {

    document.getElementById(imagem).style.display = "block";
    document.getElementById(paragrafo).style.display = "block";


}

// Retira os pontos de acordo com o parametro e desativa a classe botões para não serem apertados mais
function RetirarPontos(idFrase2, idGlobinho2, desativar2, perdeNota) {

    nota -= perdeNota;

    q2 = document.getElementsByClassName(desativar2);
    frase2 = document.getElementById(idFrase2);
    globo2 = document.getElementById(idGlobinho2);


    for (var i = 0; i < q2.length; i++) {
        q2[i].disabled = true;
        q2[i].style.transition = "4s";

    }

    if (nota <= 0) {
        nota = 0;
        frase2.innerHTML = nomeEstudante + ", você deixou de ganhar os globinhos e agora está com " + nota + "." + " Mantenha o foco.";
        globo2.style.display = "block";
        Play2("../audio2.mp3");
    }
    else {
        frase2.innerHTML = nomeEstudante + ", você deixou de ganhar um ou parte de um globinho. " + " Mantenha o foco.";
        globo2.style.display = "block";
        Play2("../audio2.mp3");

    }
    document.getElementById("notaFixa").innerHTML = nota.toFixed(1);

}

//Mostra a resposta correta. Deve ser colocado o nome para ser exibido na tela (resp), o id do globo, a desativação da questão e a mensagem

function MostrarFrase(idFrase, idGlobinho, desativar, mensagem, qtdNota) {

    notaInt = parseFloat(qtdNota);
    nota += notaInt;
    q = document.getElementsByClassName(desativar);
    frase = document.getElementById(idFrase);
    globo = document.getElementById(idGlobinho);

    for (var i = 0; i < q.length; i++) {
        q[i].disabled = true;
        q[i].style.transition = "4s";

    }


    frase.innerHTML = nomeEstudante + ", " + mensagem + ".";
    globo.style.display = "block";
    Play("../audio1.mp3");


    document.getElementById("notaFixa").innerHTML = nota.toFixed(1);
    document.getElementById("imagem50").classList.add("balancar");
    document.getElementById("notaFixa").classList.add("w3-animate-zoom");


}




function mostraCinza() {

    desativarBotoes();
    desativarTextos();
    mostrarNota();
    mostraBiblio();
    desativarImagens();
    document.getElementById("notaFixa").innerHTML = nota.toFixed(1);

}

function desativarBotoes() {
    var botoes = document.getElementsByTagName('button');
    for (var i = 0; i < botoes.length; i++) {
        if (!botoes[i].classList.contains("bibliografias")) {
            botoes[i].disabled = true;

        }
    }

    var inputs = document.getElementsByTagName('input');
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].disabled = true;
    }
}

function desativarTextos() {
    var todosElementos = document.querySelectorAll('*');
    for (var i = 0; i < todosElementos.length; i++) {
        if (!todosElementos[i].classList.contains("bibliografias")) {
            todosElementos[i].style.color = "gray";
            todosElementos[i].style.transition = "3s";
        }
        else {
            todosElementos[i].style.color = "black";
        }

    }
}


//Mostra a nota no final da aula
function mostrarNota() {
    const notaThreshold = 6;
    const notaElements = document.getElementsByClassName("nota");
    const message = nota >= notaThreshold
        ? `Parabéns ${nomeEstudante}, você ganhou ${nota} globinhos e completou sua lição!`
        : `${nomeEstudante}, você não completou sua lição, pois conseguiu apenas ${nota} globinho(s). Tente novamente.`;
    const audio = nota >= notaThreshold ? "../notaFinal.mp3" : "../notaFinal2.mp3";

    for (let i = 0; i < notaElements.length; i++) {
        document.getElementById('id01').style.display = "block";
        notaElements[i].style.display = "block";
        notaElements[i].innerHTML = message;
        Play(audio);
    }
}



// Mostra a bibliografia no final
function mostraBiblio() {

    var b = document.getElementsByClassName("bibliografias");
    for (var i = 0; i < b.length; i++) {
        b[i].style.display = "block";


    }
}

// Função para aplicar o efeito de escala de cinza em todas as imagens
function desativarImagens() {
    var divsImagens = document.querySelectorAll('.w3-margin img.w3-mobile');
    for (var i = 0; i < divsImagens.length; i++) {
        divsImagens[i].style.filter = "grayscale(100%)"; // Aplica escala de cinza
        divsImagens[i].style.transition = "3s"; // Adiciona transição para suavizar
    }
}











function BalancarGlobo() {

    document.getElementById("imagem50").classList.add("balancar");
    document.getElementById("notaFixa").classList.add("w3-animate-zoom");
}

function RemoveBalancarGlobo() {
    document.getElementById("imagem50").classList.remove("balancar");
    document.getElementById("notaFixa").classList.remove("w3-animate-zoom");
}


// window.onload = function () {

//     var elementBody = document.querySelector('body');
//     var elementBtnIncreaseFont = document.getElementById('increase-font');
//     var elementBtnDecreaseFont = document.getElementById('decrease-font');
//     // Padrão de tamanho, equivale a 100% do valor definido no Body
//     var fontSize = 100;
//     // Valor de incremento ou decremento, equivale a 10% do valor do Body
//     var increaseDecrease = 10;

//     // Evento de click para aumentar a fonte
//     elementBtnIncreaseFont.addEventListener('click', function (event) {
//         fontSize = fontSize + increaseDecrease;
//         elementBody.style.fontSize = fontSize + '%';
//     });

//     // Evento de click para diminuir a fonte
//     elementBtnDecreaseFont.addEventListener('click', function (event) {
//         fontSize = fontSize - increaseDecrease;
//         elementBody.style.fontSize = fontSize + '%';
//     });
// }
