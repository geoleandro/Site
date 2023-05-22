
        const typingSpeedSlider = document.getElementById("typingSpeed");

        var currentTypingSpeed = typingSpeedSlider.value;


        typingSpeedSlider.addEventListener("input", function () {
            currentTypingSpeed = typingSpeedSlider.value;
        });



        var currentLine = 0;
        var dialogLines;
        const typingSpeed = 50;
        var isFirstDialogDone = false;
        var isSecondDialogDone = true;
        var apertouDialogo = true;
        var isSecondDialogActivated = false;
        var balao1 = document.querySelector('.balao1');
        var balao2 = document.querySelector('.balao2');
        var imagem = document.getElementById('demo1-img');

        var indiceFraseAtual = 0;


        var liberaFrases = false;


        function ShowDialog(newLines, targetID) {

            if (isSecondDialogDone && apertouDialogo) {
                dialogLines = newLines;
                currentLine = 0;
                document.getElementById(targetID).innerHTML = '';
                AtivaDialogo(targetID, currentTypingSpeed);


                // imagem.addEventListener("click", function () {
                //     adicionarEventoDeCliqueAoPersonagem(targetID);

                // });

                isFirstDialogDone = false;

                balao1.style.display = "block";
                TransicaoBalao('baloon1');


            }

        }


        function TransicaoBalao(el) {
            document.getElementById(el).classList.add('fadeBaloon');
        }


        function adicionarEventoDeCliqueAoPersonagem(targetID) {


            AvancaDialogo(targetID);

            apertouDialogo = true;



            console.log("cliquei na imagem");


        }


        function ShowSecondDialog(newLines, targetID) {
            if (isFirstDialogDone && apertouDialogo && !isSecondDialogActivated) {
                dialogLines = newLines;
                currentLine = 0;
                document.getElementById(targetID).innerHTML = '';
                AtivaDialogo(targetID, currentTypingSpeed);
                isSecondDialogActivated = true;

                // let imagem = document.getElementById('demo2-img');

                // imagem.addEventListener("click", function () {
                //     adicionarEventoDeCliqueAoPersonagem(targetID);
                // });

                balao2.style.display = "block";
                TransicaoBalao('baloon2');

            }



        }

        function AtivaDialogo(targetID, currentTypingSpeed) {

            typeWriter(dialogLines[currentLine], targetID, 0, currentTypingSpeed);
            console.log(currentTypingSpeed);

        }



        function typeWriter(txt, targetID, contadorLetras, speed) {

            // let balloonWidth = document.querySelector('.balloon').offsetWidth;


            let waitTime = dialogLines[currentLine].length;




            if (contadorLetras < txt.length) {
                document.getElementById(targetID).innerHTML += txt.charAt(contadorLetras);
                contadorLetras++;


                setTimeout(function () {
                    apertouDialogo = false;
                    console.log("andando o diálogo");

                    typeWriter(txt, targetID, contadorLetras, speed);


                }, speed);
            }

            else {

                setTimeout(function () {

                    AvancaDialogo(targetID);


                    console.log("acabou o diálogo");


                }, speed * waitTime);




                // AvancaDialogo(targetID);
                // apertouDialogo = true;



            }
        }






        function AvancaDialogo(targetID) {

            currentLine++;
            console.log(currentLine);
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
