async function carregarFrase() {
    const f = document.getElementById('frase');
    const a = document.getElementById('autor');
    const imgAutor = document.getElementById('autor-img');
    
    if (!f) return;

    try {
        // Efeito visual de saída
        f.style.opacity = 0;
        if (imgAutor) imgAutor.style.opacity = 0;

        // Busca o JSON (o "/" inicial evita erro no blog)
        const resposta = await fetch('/estilos/frases.json');
        const frases = await resposta.json();

        // Sorteio
        const aleatoria = frases[Math.floor(Math.random() * frases.length)];

        // Pequena pausa para a transição do CSS
        setTimeout(() => {
            f.innerText = `"${aleatoria.frase}"`;
            if (a) a.innerText = `— ${aleatoria.autor}`;

            if (imgAutor && aleatoria.imagem) {
                // Monta o caminho: /imgFrases/milton.jpg
                imgAutor.src = "/" + aleatoria.imagem;
                
                // Só exibe quando a imagem terminar de carregar
                imgAutor.onload = () => {
                    imgAutor.style.display = 'block';
                    imgAutor.style.opacity = 1;
                };
            } else if (imgAutor) {
                imgAutor.style.display = 'none';
            }
            
            f.style.opacity = 1;
        }, 500);

    } catch (erro) {
        console.error("Erro ao carregar JSON:", erro);
        f.innerText = "A geografia é a arte de ler o mundo.";
        f.style.opacity = 1;
    }
}

// Inicialização
window.addEventListener('load', carregarFrase);

// Troca automática a cada 10 segundos
setInterval(carregarFrase, 10000);