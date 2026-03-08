let progresso = {};
const typingSound = new Audio('../../../audios/dialogsound.mp3');

function avancar(idDialogo) {
    if (progresso[idDialogo] === undefined) progresso[idDialogo] = 0;

    const lista = bancoDeDados[idDialogo];
    const index = progresso[idDialogo];

    // SE AINDA HÁ FALAS
    if (index < lista.length) {
        exibirFala(idDialogo, lista[index]);
        progresso[idDialogo]++;
    }

    // SE CHEGOU AO FIM (O usuário clicou no botão "Fim do diálogo")
    else {
        finalizarEFechar(idDialogo);
    }
}

function finalizarEFechar(idDialogo) {
    const container = document.getElementById(`secao-${idDialogo}`);

    // Esconde todos os balões desta seção
    container.querySelectorAll('.balloon').forEach(b => {
        b.style.display = 'none';
    });

    // Opcional: Mudar o texto do botão para indicar que pode reiniciar
    const btnProx = container.querySelector('.btnProximo');
    btnProx.innerHTML = "Diálogo Concluído";
    btnProx.disabled = true;

    // Ativa o botão de reiniciar
    container.querySelector('.btnReiniciar').disabled = false;
}

function exibirFala(idDialogo, fala) {
    // Busca os elementos dentro do container específico (ex: #secao-carro)
    const container = document.getElementById(`secao-${idDialogo}`);
    const btnProx = container.querySelector('.btnProximo');
    const btnReiniciar = container.querySelector('.btnReiniciar');

    // Limpa todos os balões daquela seção
    container.querySelectorAll('.balloon').forEach(b => {
        b.style.display = 'none';
        b.querySelector('.npc-texto').textContent = '';
    });

    // Seleciona o balão correto baseado no speaker
    const numNpc = fala.speaker === "NPC1" ? "1" : "2";
    const balaoAtivo = container.querySelector(`.balao${numNpc}`);
    const textoAtivo = balaoAtivo.querySelector('.npc-texto');

    balaoAtivo.style.display = 'flex'; // Mantém seu display: flex do CSS
    btnProx.disabled = true;
    btnReiniciar.disabled = true;

    // Lógica do Som (Loop para não parar)
    typingSound.loop = true;
    typingSound.currentTime = 0;
    typingSound.pause();
    typingSound.currentTime = 0;
    typingSound.play();

    let i = 0;
    function escrever() {
        if (i < fala.text.length) {
            textoAtivo.textContent += fala.text.charAt(i);
            i++;

            setTimeout(escrever, 35);
        } else {
            typingSound.pause();
            typingSound.loop = false;
            btnProx.disabled = false;
            btnProx.innerHTML = "Próximo";

            // Se for a ÚLTIMA frase da lista
            if (progresso[idDialogo] === bancoDeDados[idDialogo].length) {
                btnProx.innerHTML = "Fechar Diálogo"; // O botão agora avisa que vai fechar
                // Note que o progresso já foi incrementado, então o próximo clique cairá no 'else' da função avancar()
            } else {
                btnProx.innerHTML = "Próximo";
            }
        }
    }
    escrever();
}

function reiniciar(idDialogo) {
    progresso[idDialogo] = 0;
    const container = document.getElementById(`secao-${idDialogo}`);
    container.querySelector('.btnProximo').disabled = false;
    container.querySelector('.btnProximo').innerHTML = "Iniciar Diálogo";
    container.querySelectorAll('.balloon').forEach(b => b.style.display = 'none');
    avancar(idDialogo);
}