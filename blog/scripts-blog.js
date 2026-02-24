// Este arquivo carrega os dados do JSON e constrói o blog automaticamente
let artigos = []; 
const postsPorPagina = 9;
let paginaAtual = 1;

async function carregarDadosDoArquivo() {
    try {
        const resposta = await fetch('artigos.json'); 
        artigos = await resposta.json();
        renderizarArtigos(paginaAtual);
    } catch (erro) {
        console.error("Erro ao carregar o arquivo JSON:", erro);
        const grid = document.getElementById('posts-grid');
        if(grid) grid.innerHTML = "<p class='w3-center'>Erro ao carregar os artigos.</p>";
    }
}

function renderizarArtigos(pagina) {
    const grid = document.getElementById('posts-grid');
    if (!grid) return;
    grid.innerHTML = "";
    
    const inicio = (pagina - 1) * postsPorPagina;
    const fim = inicio + postsPorPagina;
    const artigosPaginados = artigos.slice(inicio, fim);

    artigosPaginados.forEach(artigo => {
        grid.innerHTML += `
            <div class="w3-col l4 s12 w3-container w3-margin-bottom w3-padding-top-24">
                <div class="card-container w3-white w3-hover-opacity">
                    <img src="${artigo.imagem}" style="width:100%" class="card-image" alt="${artigo.titulo}">
                    <div class="w3-container w3-white card-content">
                        <h2 class="w3-center">
                            <a href="${artigo.link}" class="link-artigo"><strong>${artigo.titulo}</strong></a>
                        </h2>
                        <p>${artigo.resumo} <span class="w3-small w3-opacity" style="display: block;">${artigo.data}</span></p>
                        <p><a href="${artigo.link}" class="link-artigo">
                            <span class="w3-button w3-padding-large w3-white w3-border"><b>LER MAIS »</b></span>
                        </a></p>
                    </div>
                </div>
            </div>`;
    });
    renderizarPaginacao();
}

function renderizarPaginacao() {
    const totalPaginas = Math.ceil(artigos.length / postsPorPagina);
    const paginacaoContainer = document.getElementById('blog-pagination');
    if (!paginacaoContainer) return;
    paginacaoContainer.innerHTML = "";

    for (let i = 1; i <= totalPaginas; i++) {
        const classeAtiva = (i === paginaAtual) ? 'w3-black' : 'w3-white';
        paginacaoContainer.innerHTML += `<button class="w3-button ${classeAtiva} w3-border w3-margin-right" onclick="irParaPagina(${i})">${i}</button>`;
    }
}

function irParaPagina(p) {
    paginaAtual = p;
    renderizarArtigos(p);
    window.scrollTo(0, 0); 
}

// Inicia o carregamento
carregarDadosDoArquivo();