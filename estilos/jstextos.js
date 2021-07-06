
var nomeEstudante = "";

var nota = 0;

var fontes = ["Courier New", "Arial", "Times New Roman", "Verdana",  "Tahoma"];

var cor = ["#000000", "#191970", "#20B2AA", "#6B8E23", "#4B0082", "#A020F0", "#FF1493", "#FA8072", "#FF8C00", "#DC143C"];

var aleatorio = Math.round(Math.random() * 5);

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
    var p = document.querySelectorAll(".topico");
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
        frase2.innerHTML = nomeEstudante + ", você perdeu todos os globinhos e agora está com " + nota + "." + " Mantenha o foco.";
        globo2.style.display = "block";
        Play2("../audio2.mp3");
    }
    else {
        frase2.innerHTML = nomeEstudante + ", você perdeu um ou parte de um globinho " + " Mantenha o foco.";
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


// Mostra a bibliografia no final
function mostraBiblio() {

    var b = document.getElementsByClassName("bibliografias");
    for (var i = 0; i < b.length; i++) {
        b[i].style.display = "block";

    }
}

//Mostra a nota no final da aula
function mostrarNota() {

    globoFinalNota = document.getElementsByClassName("nota");

    if (nota >= 6) {

        for (var i = 0; i < globoFinalNota.length; i++) {
            document.getElementById('id01').style.display = "block";
            globoFinalNota[i].style.display = "block";
            globoFinalNota[i].innerHTML = "Parabéns " + nomeEstudante + "," + " você ganhou: " + nota + " globinhos! e completou sua lição!";
            Play("../notaFinal.mp3");

        }

    }
    else {
        for (var i = 0; i < globoFinalNota.length; i++) {
            document.getElementById('id01').style.display = "block";
            globoFinalNota[i].style.display = "block";
            globoFinalNota[i].innerHTML = nomeEstudante + ", você não completou sua lição, pois conseguiu apenas " + nota + " globinho(s). Tente novamente.";
            Play("../notaFinal2.mp3");


        }
    }

}



// Deixa as divs cinzas quando completar a atividade
function mostraCinza() {


    var t = document.getElementsByClassName("topico");
    var radiosInput = document.getElementsByTagName('input');
    var todosBtn = document.getElementsByTagName('button');

    for (var i = 0; i < t.length; i++) {

        t[i].style.color = "gray";
        t[i].style.transition = "6s";

    }

    mostrarNota();
    mostraBiblio();
    document.getElementById("notaFixa").innerHTML = nota.toFixed(1);

    for (var i = 0; i < radiosInput.length; i++) {
        radiosInput[i].disabled = true;

    }


    for (var b = 0; b < todosBtn.length; b++) {
        todosBtn[b].disabled = true;
        todosBtn[b].style.backgroundColor = "gray";
    }


}
