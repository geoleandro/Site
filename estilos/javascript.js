

var fontes = ["Courier New", "Arial", "Times New Roman", "Verdana",  "pixel"];



var aleatorio = Math.round(Math.random() * 5);



function mudaQuest() {

    var t = document.querySelectorAll(".h1, .p2");


    for (var i = 0; i < t.length; i++) {

        t[i].style.fontFamily = fontes[aleatorio];

    }

}


function verificar() {

    var radiosInput = document.getElementsByTagName('input');
    var radios = document.querySelectorAll('input[type="radio"]:checked');
    var button1 = document.getElementById("button1");

   
     if (radios.length < 10)
    {
        document.getElementById("aviso").style.display = "block";
        document.getElementById("aviso").innerHTML = "É necessário selecionar todas as questões. Você escolheu " + radios.length + " até agora."
       
    }

    else
    {
        document.getElementById("aviso").style.display = "none";
        document.getElementById("aviso").innerHTML = "";

        button1.disabled = true;
        button1.value = "Corrigido";
        button1.style.backgroundColor = "lightgray";

        for (var i = 0; i < radiosInput.length; i++) {
            radiosInput[i].disabled = true;
        }
        checar();

    }

}


function classEscurecer() {
    var x = document.getElementsByClassName("w3-card-4");
    for (var i = 0; i < x.length; i++) {
        x[i].style.color = "#424242";
        x[i].style.transition = "6s";
    }
}



function corLenta() {
    var t = document.getElementsByClassName("bordaQuestoes");
    for (var i = 0; i < t.length; i++) {
        t[i].style.transition = "4s";

    }
}



function comentarios() {
    var c = document.getElementsByClassName("comentarios");
    for (var i = 0; i < c.length; i++) {
        c[i].style.display = "block";

    }
}

