	
	var nomeEstudante = "";	

	var nota = 0;
	 
	var notaUmQuarto ="";

    var fontes =["Courier New", "Arial", "Cursive","Times New Roman", "Monotype Corsiva", "Times New Roman", "Verdana","Calisto MT", "Tempus Sans ITC", "Tahoma"];
	
	var cor = ["#000000", "#191970", "#20B2AA", "#6B8E23", "#4B0082","#A020F0","#FF1493","#FA8072","#FF8C00","#DC143C"];
	
	var aleatorio = Math.round(Math.random() * 10);
	
	var h1 = document.getElementById("h1").style.fontFamily = fontes[aleatorio];

	var imagemGlobinhoFinal = document.getElementById("globinhoFinal");
	
	var numB =0;

		
	var notaDesafio = 0;

	// Inserido geralmente no final das questões abertas para chamar o botão Próximo 
	function MostraButton(btn)
	{
		buttonQ1 = document.getElementById(btn).style.display = "block";

	}

	function EscondeButton(btn)
	{
		buttonQ2 = document.getElementById(btn).style.display = "none";

	}
			
		// Função inicial para inserir nome do aluno
		function NomeAlunos(idResp,pqx)
	{
		nomeEstudante = document.getElementById(pqx).value;
		button = document.getElementById("buttonA");
		buttonConfira = document.getElementById("buttonConfira");

		
		if(nomeEstudante == "") 
        {// se não digitar no textarea não faz nada
			document.getElementById(pqx).style.backgroundColor = "#EF5959";	  
            return;
		}
		
		else
		{
			document.getElementById(idResp).innerHTML ="Bem-vindo(a) " + nomeEstudante + ".";
			document.getElementById(pqx).style.display="none";
			document.getElementById("caixaNomeAluno").style.display="none";
			button.style.display="block";
			buttonConfira.style.display="none";
		}
	  
	}

	// É chamada nas questões abertas decimais para ver se completou um inteiro.
	function VerificaInteiro(idResp)
	{
		
		var inteiro = Number.isInteger(nota);
		var int = Math.trunc(nota)
		
		
		if (inteiro == false) 
		{	
			nota = int.toFixed(1);				
			document.getElementById(idResp).innerHTML = " Quase lá " + nomeEstudante + "."+ " Acerte todas as questões para finalizar a lição. Você permanece com "  + nota + ".";
			document.getElementById("notaFixa").innerHTML = nota;
			
			
		}

		else
		{
			document.getElementById(idResp).innerHTML = "Por ter acertado todas as questões " + nomeEstudante +", ganhou mais um globinho, agora já pode finalizar sua lição. ";
			document.getElementById("notaFixa").innerHTML = nota.toFixed(1);
			
        }
    }
		
	  
	// Modifica as fontes do texto aleatoriamente. É chamada no body onload
	 function paragrafotexto()
	{
		var p = document.getElementsByClassName("topico");
			for (var i = 0; i < p.length; i++)
			{
				p[i].style.fontFamily = fontes[aleatorio];
				
            } 
            document.getElementById("notaFixa").innerHTML = nota.toFixed(1);
			
	}
		


	 

  
    function MostrarProximo(parametro) 
	{
        
        var oculto = parametro.parentNode; // Obter qual é o elemento pai do botão
     	var proximo = oculto.nextElementSibling; // Obter qual é o elemento seguinte ao pai
			
		 if (!proximo.classList.contains('mostrar')) // Verificar se o seguinte já foi mostrado
			{ 
        		proximo.classList.add('mostrar'); // Mostrar o seguinte
				addProgressBar();
				//numButton();
				ApagaButton();
				document.getElementById("notaFixa").innerHTML = nota.toFixed(1);
				
			}
			
    }
	
	// Apaga os botões próximo	
	function ApagaButton()
	{
		var t = document.getElementsByClassName("button");
			for (var i = 0; i < t.length; i++) 
			{
				t[i].style.display = "none";				
			} 
	}
	

	//Função para medir o tamanho da barra de progresso
	// function numButton()
	// {
	// 	numB++;
	// 	document.getElementById("numero").innerHTML = numB;
	// }
 
	// Deixa as divs cinzas quando completar a atividade
	function mostraCinza()
	{
	
	var g = document.getElementsByClassName("mostrar");
	var radiosInput =  document.getElementsByTagName('input');
	var todosBtn =  document.getElementsByTagName('button');
	
			for (var i = 0; i < g.length; i++) 
			{
				g[i].style.color = "gray";
				g[i].style.transition = "6s";
				
			}
				
			mostrarNota();
			mostraBiblio();
			document.getElementById("notaFixa").innerHTML = nota.toFixed(1);

			for (var i = 0; i < radiosInput.length; i++)
						{
							radiosInput[i].disabled = true;
						}


			for (var b = 0; b < todosBtn.length; b++)
						{
							todosBtn[b].disabled = true;
							todosBtn[b].style.backgroundColor = "lightgray";
						}
			
		
	}


	// Mostra a bibliografia no final
	function mostraBiblio()
	{
	
	var b = document.getElementsByClassName("bibliografias");
		for (var i = 0; i < b.length; i++) 
			{
				b[i].style.display = "block";

			}
	}

	//Mostra a nota no final da aula
	function mostrarNota()
	{	
	
		globoFinalNota = document.getElementsByClassName("nota");
		painelCortica = document.getElementsByClassName("painelCortica");
	

		if (nota >= 0) 
		{
			for (var i = 0; i < globoFinalNota.length; i++)
			{
				
				painelCortica[i].style.display="block";
				globoFinalNota[i].style.display="block";
				globoFinalNota[i].innerHTML="Parabéns " + nomeEstudante + "," +  " você ganhou: "  + nota + " globinhos! e completou sua lição!";
				
				Play("notaFinal.mp3");
				
			}

			imagemGlobinhoFinal.style.display = "block";
			
		} 
		else
		{
			for (var i = 0; i < globoFinalNota.length; i++)
			{
				globoFinalNota[i].style.display="block";
				globoFinalNota[i].innerHTML= nomeEstudante + ", você não completou sua lição, pois conseguiu apenas "  + nota + " globinho(s). Tente novamente.";
				

				Play("notaFinal2.mp3");
				
				
			}
		}
		
		
	}

	
	// function addNota(pontos)
	// {
		
	// 	nota += pontos;
	// }
		
	//Mostra a resposta correta. Deve ser colocado o nome para ser exibido na tela (resp), o id do globo, a desativação da questão e a mensagem

	function MostrarFrase(idFrase, idGlobinho, desativar, mensagem, qtdNota)
	{
			
			notaInt = parseFloat(qtdNota);
			nota += notaInt;
			q = document.getElementsByClassName(desativar);
			frase = document.getElementById(idFrase);
			globo = document.getElementById(idGlobinho);

			for (var i = 0; i < q.length; i++) 
			{
				q[i].disabled = true;
				q[i].style.transition = "4s";
				
			}
				
				
				frase.innerHTML= mensagem +  ".";
				globo.style.display = "block";
				Play("audio1.mp3");
			
				
				document.getElementById("notaFixa").innerHTML = nota.toFixed(1);
				
	}

	
	// Retira os pontos de acordo com o parametro e desativa a classe botões para não serem apertados mais
	function RetirarPontos(idFrase2, idGlobinho2, desativar2, perdeNota)
	{	
			
			nota -= perdeNota;
			
			q2 = document.getElementsByClassName(desativar2);
			frase2 = document.getElementById(idFrase2);
			globo2 = document.getElementById(idGlobinho2);
			

			for (var i = 0; i < q2.length; i++) 
			{
				q2[i].disabled = true;
				q2[i].style.transition = "4s";
				
			}
			
			if (nota <= 0) {
				nota = 0;
				frase2.innerHTML= nomeEstudante + ", você perdeu todos os globinhos e agora está com "  + nota +"."  + " Mantenha o foco.";
				globo2.style.display = "block";
				Play2("audio2.mp3");
			}
			else
			{
				frase2.innerHTML= nomeEstudante + ", você perdeu um ou parte de um globinho " + " Mantenha o foco.";
				globo2.style.display = "block";
				Play2("audio2.mp3");
			
			}
			document.getElementById("notaFixa").innerHTML = nota.toFixed(1);
						
	}


		function MostrarRef()
		{
			var x = document.getElementById("divRef");
			
			
			if (x.style.display === "block")
			{
                x.style.display = "none";
			}
			else
			{
                x.style.display = "block";
            }
        }

	//audio acerto
	function Play(nomeAudio) 
	{
		var audio1 = new Audio();
		audio1.src = nomeAudio;
		audio1.play();
		//document.getElementById(obj).hidden = true;
	}
	//audio erro
	function Play2(nomeAudio2)
	 {
		var audio1 = new Audio();
		audio1.src = nomeAudio2;
		audio1.play();
		
		//document.getElementById(obj).hidden = true;
	}


	function addProgressBar() 
	{
		var barra = document.getElementById("progress");
		txtBarra = document.getElementById("txtBarra");   
	
		i = Math.round(100/15) ;
		barra.value += i;
		
			if (barra.value >= 100) 
			{
				barra.value = 100;
			}

		txtBarra.innerHTML = barra.value + "%";
	        
    }
     
	

	  
    function Aparecer(imagem, paragrafo) {
	
    document.getElementById(imagem).style.display = "block";
    document.getElementById(paragrafo).style.display = "block";
  

}

	// Função com apenas uma palavra

	

	// Função com perguntas abertas feita com formulário
	function PerguntasAbertas(qnum,idResp,buttonConferir,globinho)
	{

	var q10a = document.quiz.q10a.value.toLowerCase();
    var q10b = document.quiz.q10b.value.toLowerCase();
	var q10c = document.quiz.q10c.value.toLowerCase();
	// var q10d = document.quiz.q10d.value.toLowerCase();

	

	var imagem = ['globinhoPe.png'];

    var cor = ["#99ff99", " #ee4466"];
    

    

	if (q10a.match("450") && qnum==1) 
		{
	
			document.getElementById("q10a").style.borderColor  = cor[0];

			EscondeButton(buttonConferir);
			Play("audio1.mp3");	
			document.getElementById(idResp).innerHTML = "Sua resposta foi: " + q10a.valueOf();
			nota += 1;
			document.getElementById(globinho).style.display="block";

		}
	else if (qnum==1)
		{
			document.getElementById ("q10a").style.borderColor = cor[1];
			document.getElementById(idResp).innerHTML =  "Você deve responder para seguir.";
			Play2("audio2.mp3");
		}

	if (q10b.includes("15.000") || q10b.includes("15000") && qnum==2) 
		{
	
			document.getElementById("q10b").style.borderColor  = cor[0];

			EscondeButton(buttonConferir);
			Play("audio1.mp3");	
			
			document.getElementById(idResp).innerHTML ="Sua resposta foi: " + q10b.valueOf();
			nota += 1;
			document.getElementById (globinho).style.display="block";

		}
	else if (qnum==2)
		{
			document.getElementById ("q10b").style.borderColor = cor[1];
			document.getElementById(idResp).innerHTML = "Responda a pergunta.";
			Play2("audio2.mp3");
		}


	if (q10c.includes("4") && q10c.includes("3") && qnum==3) 
	{
        
       
            
			document.getElementById("q10c").style.borderColor  = cor[0];

            EscondeButton(buttonConferir);
            Play("audio1.mp3");	

            document.getElementById(idResp).innerHTML ="Sua resposta foi: " + q10c.valueOf();
            nota += 1;
            document.getElementById (globinho).style.display="block";
           
        
	
    }

                
         
	else if (qnum==3)
		{
			document.getElementById ("q10c").style.borderColor = cor[1];
			document.getElementById(idResp).innerHTML = "Responda a pergunta.";
			Play2("audio2.mp3");
        }

        document.getElementById("notaFixa").innerHTML = nota.toFixed(1);
    

        if(nota >= 4)
        {
            MostraButton("btn10c");
        }

        else
            {
                document.getElementById(idResp).innerHTML = "Acerte todas as perguntas para prosseguir.";
            }
    
       
      
    

	// if (q1d.match("nordeste") && qnum==4) 
	// 	{
	
	// 		if (q1a != "" && q1b != "" && q1c != "") 
	// 			{
	// 				document.getElementById("q1d").style.backgroundColor  = cor[0];

	// 				EscondeButton(buttonConferir);
	// 				Play("audio1.mp3");	
					
	// 				document.getElementById(idResp).innerHTML ="Sua resposta foi: " + q1d.valueOf();
	// 				nota += 0.25;
	// 				document.getElementById (globinho).style.display="block";
	// 				MostraButton("buttonq1d")
	// 			}
	// 		else
	// 			{
	// 				document.getElementById ("q1d").style.backgroundColor = cor[1];
	// 				document.getElementById(idResp).innerHTML = "Quer pular sem responder todas as questões? Volte e preencha as outras espertinho(a).";

	// 			}

	// 	}
	// else if (qnum==4)
	// 	{
	// 		document.getElementById ("q1d").style.backgroundColor = cor[1];
	// 		document.getElementById(idResp).innerHTML = "Responda a pergunta.";
			
	// 		// EscondeButton(buttonConferir);
	// 		// MostraButton("buttonq1d")
	// 		// Play2("audio2.mp3");
	// 	}

	// 	document.getElementById("notaFixa").innerHTML = nota.toFixed(1);

	}

		
	



