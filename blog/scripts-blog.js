let artigos = [];
const postsPorPagina = 9;
let paginaAtual = 1;
const corTemaLateral = "w3-green"; // Altere aqui para mudar a cor de toda a barra lateral



async function carregarDadosDoArquivo() {
    try {
        // Se o seu blog está na pasta 'blog', use /blog/artigos.json
        // Se o seu blog está na raiz, use apenas /artigos.json
        let caminho = '/blog/artigos.json';

        // Se você estiver testando localmente (Live Server), ele ajusta o caminho
        if (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost") {
            caminho = window.location.pathname.includes('/artigos/') ? '../../artigos.json' : 'artigos.json';
        }

        const resposta = await fetch(caminho);

        if (!resposta.ok) {
            // Se falhar, tentamos o caminho relativo como última tentativa
            throw new Error("Erro no fetch principal");
        }

        artigos = await resposta.json();

        // --- EXECUÇÃO DAS AUTOMAÇÕES ---

        preencherDadosAutomaticos(artigos); // Injeta Título, Data e Imagem do post

        renderizarPostsRecentes();         // Monta a barra lateral
        renderizarNuvemDeTags();           // Monta as tags
        renderizarLeiaTambem();            // Monta as sugestões
        carregarComentariosFacebook();     // Injeta o plugin do FB
        renderizarArquivoBlog();
        renderizarDestaque();
        renderizarArtigos(paginaAtual);
        renderizarSecaoViagens();

        // --- INICIALIZAÇÃO DE INTERAÇÕES ---




    } catch (erro) {
        // Tentativa de emergência se o caminho absoluto falhar no seu servidor específico
        console.warn("Tentando caminho alternativo...");
        try {
            const backupPath = window.location.pathname.includes('/artigos/') ? '../../artigos.json' : 'artigos.json';
            const resp = await fetch(backupPath);
            artigos = await resp.json();

            preencherDadosAutomaticos(artigos); // Injeta Título, Data e Imagem do post

            renderizarPostsRecentes();         // Monta a barra lateral
            renderizarNuvemDeTags();           // Monta as tags
            renderizarLeiaTambem();            // Monta as sugestões
            carregarComentariosFacebook();     // Injeta o plugin do FB
            renderizarArquivoBlog();
            renderizarArtigos(paginaAtual);
            renderizarSecaoViagens();
            renderizarDestaque();

            // --- INICIALIZAÇÃO DE INTERAÇÕES ---



        } catch (e) {
            console.error("Falha total ao carregar o JSON:", e);
        }
    }
}




function preencherDadosAutomaticos(artigos) {
    const urlAtual = window.location.pathname;
    const artigoDados = artigos.find(a => urlAtual.includes(a.link.replace('/blog/', '')));

    if (artigoDados) {
        // Preenche os dados (Título, Imagem, Data)
        document.title = `${artigoDados.titulo} - Duvid Blog`;
        document.getElementById('artigo-titulo-principal').innerText = artigoDados.titulo;
        document.getElementById('artigo-data').innerText = artigoDados.data;

        const img = document.getElementById('imagem-principal');
        img.src = artigoDados.imagem;
        img.alt = artigoDados.titulo;

        // --- NOVA LÓGICA: REMOVER SKELETON ---
        // Quando a imagem terminar de carregar, mostramos tudo
        img.onload = function () {
            document.getElementById('skeleton-title').style.display = 'none';
            document.getElementById('skeleton-img').style.display = 'none';
            document.getElementById('skeleton-data').style.display = 'none';

            document.getElementById('artigo-titulo-principal').classList.remove('hidden-loading');
            document.getElementById('imagem-principal').classList.remove('hidden-loading');
            document.getElementById('artigo-data').classList.remove('hidden-loading');
        };

        renderizarCitacaoDoArtigo(artigoDados);

        atualizarMetaTags(artigoDados);
        renderizarBotoesCompartilhamento(artigoDados);
    }
}

// Nova função auxiliar para SEO
function atualizarMetaTags(artigo) {
    // Descrição (Meta tag normal)
    const metaDesc = document.getElementById('meta-description');
    if (metaDesc) metaDesc.setAttribute('content', artigo.resumo || "Leia este artigo completo no Duvid Blog.");

    // Facebook / WhatsApp / LinkedIn (Open Graph)
    const ogTitle = document.getElementById('og-title');
    if (ogTitle) ogTitle.setAttribute('content', artigo.titulo);

    const ogDesc = document.getElementById('og-description');
    if (ogDesc) ogDesc.setAttribute('content', artigo.resumo || "Confira este conteúdo incrível no nosso blog.");

    const ogImg = document.getElementById('og-image');
    if (ogImg) {
        // Se a imagem for caminho relativo, o ideal é que seja absoluto para redes sociais
        // Ex: https://seusite.com/blog/imagem.jpg
        ogImg.setAttribute('content', window.location.origin + artigo.imagem);
    }
}



function renderizarBotoesCompartilhamento(artigo) {
    const container = document.getElementById('icones-compartilhamento');
    if (!container) return;

    const urlFull = encodeURIComponent(window.location.href);
    const texto = encodeURIComponent(artigo.titulo);

    container.innerHTML = `
    <div class="w3-padding-16">
        <span class="w3-opacity w3-small"><b>Compartilhe:</b></span>
        <div class="share-container">
            <a href="https://api.whatsapp.com/send?text=${texto}%20${urlFull}" 
               target="_blank" 
               class="w3-button w3-green w3-round-large" 
               style="text-decoration:none">
                <i class="fab fa-whatsapp w3-margin-right"></i> WhatsApp
            </a>

            <a href="https://www.facebook.com/sharer/sharer.php?u=${urlFull}" 
               target="_blank" 
               class="w3-button w3-blue w3-round-large" 
               style="text-decoration:none">
                <i class="fab fa-facebook w3-margin-right"></i> Facebook
            </a>
        </div>
    </div>
`;
}

// FUNÇÃO PARA OS POSTS RECENTES NA BARRA LATERAL
// 1. ATUALIZAÇÃO: Posts Recentes
function renderizarPostsRecentes() {
    const containerDinamico = document.getElementById('posts-recentes-container');
    if (!containerDinamico || artigos.length === 0) return;

    const recentes = artigos.slice(0, 4);
    let html = `
        <div class="w3-white w3-margin">
            <div class="w3-container w3-padding ${corTemaLateral}">
                <h4>Posts Recentes</h4>
            </div>
            <ul class="w3-ul w3-hoverable w3-white">`;

    recentes.forEach(artigo => {
        html += `
            <li class="w3-padding-16" style="cursor:pointer" onclick="window.location.href='${artigo.link}'">
                <img src="${artigo.imagem}" class="w3-left w3-margin-right" style="width:50px; height:50px; object-fit: cover;">
                <p>${artigo.titulo}</p>
                <span class="w3-small w3-opacity">${artigo.data}</span>
            </li>`;
    });

    html += `</ul></div>`;
    containerDinamico.innerHTML = html;
}


function renderizarCitacaoDoArtigo(artigo) {
    const container = document.getElementById('citacao-dinamica');

    if (container && artigo.citacao_texto) {
        // Usamos apenas as classes de cor/borda do W3.CSS 
        // A classe 'citacao-container' e 'corpo-artigo' cuidam do resto pelo seu CSS
        container.innerHTML = `
            <div class="citacao-container w3-light-grey w3-leftbar w3-border-green w3-padding-64 w3-margin-top w3-margin-bottom">
                <div class="w3-container"> 
                    <h4 class="w3-large w3-center" style="margin-top:0;">
                        "${artigo.citacao_texto}"
                    </h4>
                    <p class="w3-small w3-right-align">
                        <strong>— ${artigo.citacao_autor || 'Autor desconhecido'}</strong>
                    </p>
                </div>
            </div>
        `;
    } else if (container) {
        container.innerHTML = '';
    }
}

// 2. ATUALIZAÇÃO: Nuvem de Tags

function renderizarNuvemDeTags() {
    const container = document.getElementById('tags-container');
    if (!container) return;

    const urlAtual = window.location.pathname;
    const artigoAtual = artigos.find(a => urlAtual.includes(a.link.replace('/blog/', '').replace('..', '')));
    const tagsUnicas = new Set();
    artigos.forEach(a => a.tags && a.tags.forEach(t => tagsUnicas.add(t)));

    let html = `
        <div class="w3-white w3-margin">
            <div class="w3-container w3-padding ${corTemaLateral}">
                <h4>Tags</h4>
            </div>
            <div class="w3-container w3-white w3-padding-16"><p>`;

    tagsUnicas.forEach(tag => {
        const eTagDoArtigoAtual = artigoAtual && artigoAtual.tags && artigoAtual.tags.includes(tag);
        const classeDestaque = eTagDoArtigoAtual ? 'tag-ativa w3-black' : 'w3-light-grey';
        html += `<span class="w3-tag ${classeDestaque} w3-small w3-margin-bottom tag-clicavel" 
                       style="cursor:pointer; margin-right:4px" onclick="filtrarPorTag('${tag}')">${tag}</span> `;
    });

    html += `</p>
            <button id="btn-limpar-filtro" class="w3-button w3-tiny w3-red w3-round" 
                    style="display:none; margin-top:10px" onclick="limparFiltro()">× Limpar Filtro</button>
            </div></div>`;
    container.innerHTML = html;
}

// 3. ATUALIZAÇÃO: Leia Também

function renderizarLeiaTambem() {
    const container = document.getElementById('leia-tambem-container');
    if (!container || artigos.length === 0) return;

    const linkAtual = window.location.pathname;
    const artigoAtual = artigos.find(a => linkAtual.includes(a.link.replace('..', '')));
    let relacionados = artigos.filter(a => a.id !== (artigoAtual ? artigoAtual.id : null));

    if (artigoAtual && artigoAtual.tags) {
        relacionados = relacionados.filter(a => a.tags.some(tag => artigoAtual.tags.includes(tag)));
    }

    const final = relacionados.slice(0, 4);
    let html = `
        <div class="w3-white w3-margin">
            <div class="w3-container w3-padding ${corTemaLateral}">
                <h4>Leia Também</h4>
            </div>
            <div class="w3-row-padding w3-white w3-padding-16">`;

    final.forEach(artigo => {
        html += `
            <div class="w3-margin-bottom" style="cursor:pointer" onclick="window.location.href='${artigo.link}'">
                <img src="${artigo.imagem}" alt="Image" style="width:100%" class="w3-hover-opacity">
                <p><strong>${artigo.titulo}</strong></p>
            </div>`;
    });

    html += `</div></div>`;
    container.innerHTML = html;
}




function renderizarArtigos(pagina) {
    const grid = document.getElementById('posts-grid');
    const destaqueContainer = document.getElementById('post-destaque');
    if (!grid) return;
    grid.innerHTML = "";

    // 1. LIDAR COM O DESTAQUE
    // Só mostra o destaque se for a página 1 e se NÃO houver filtro de tags ativo
    const filtroAtivo = document.getElementById('btn-limpar-filtro')?.style.display === 'block';

    if (pagina === 1 && !filtroAtivo) {
        if (destaqueContainer) {
            destaqueContainer.style.display = 'block';
            renderizarDestaque(); // Sua função que monta o post[0]
        }
    } else {
        if (destaqueContainer) destaqueContainer.style.display = 'none';
    }

    // 2. AJUSTAR O GRID PARA NÃO REPETIR
    // Criamos uma lista que ignora o primeiro artigo (que é o destaque)
    const artigosParaGrid = artigos.slice(1);

    const inicio = (pagina - 1) * postsPorPagina;
    const fim = inicio + postsPorPagina;
    const artigosPaginados = artigosParaGrid.slice(inicio, fim);

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
    renderizarPaginacao(artigosParaGrid.length); // Passamos o novo tamanho para a paginação
}


function renderizarPaginacao(totalArtigosGrid) {
    const totalPaginas = Math.ceil(totalArtigosGrid / postsPorPagina);
    const paginacaoContainer = document.getElementById('blog-pagination');
    if (!paginacaoContainer) return;
    paginacaoContainer.innerHTML = "";

    if (totalPaginas <= 1) return; // Não precisa de botões se só houver uma página

    for (let i = 1; i <= totalPaginas; i++) {
        const classeAtiva = (i === paginaAtual) ? 'w3-green' : 'w3-white';
        paginacaoContainer.innerHTML += `<button class="w3-button ${classeAtiva} w3-border w3-margin-right" onclick="irParaPagina(${i})">${i}</button>`;
    }
}

function irParaPagina(p) {
    paginaAtual = p;
    renderizarArtigos(p);
    window.scrollTo(0, 0);
}

// FUNÇÃO EXCLUSIVA PARA O DESTAQUE
function renderizarDestaque() {
    const destaqueContainer = document.getElementById('post-destaque');
    if (!destaqueContainer || artigos.length === 0) return;

    // O primeiro artigo do array é o mais recente
    const destaque = artigos[0];

    destaqueContainer.innerHTML = `
        <div class="w3-card-4 w3-margin-top w3-white">
            <div class="w3-display-container">
                <img src="${destaque.imagem}" style="width:100%; max-height:450px; object-fit:cover" alt="${destaque.titulo}">
               <div class="w3-display-topleft ${corTemaLateral} w3-padding">Novo Post</div>
            </div>
            <div class="w3-container">
                <h2 class="w3-xxxlarge"><b>${destaque.titulo}</b></h2>
                <p>${destaque.resumo}</p>
                <div class="w3-row">
                    <div class="w3-col m8 s12">
                        <p><a href="${destaque.link}" class="w3-button w3-padding-large w3-white w3-border"><b>LER MAIS »</b></a></p>
                    </div>
                    <div class="w3-col m4 s12 w3-hide-small">
                        <p class="w3-right"><span class="w3-padding w3-right w3-opacity"><b>Data: </b> ${destaque.data}</span></p>
                    </div>
                </div>
            </div>
        </div>
        <hr>
        
    `;
}


function filtrarPorTag(tagSelecionada) {
    const grid = document.getElementById('posts-grid');
    if (!grid) return;
    document.getElementById('post-destaque').style.display = 'none';

    // Filtra os artigos que contém a tag selecionada
    const artigosFiltrados = artigos.filter(artigo =>
        artigo.tags && artigo.tags.includes(tagSelecionada)
    );

    grid.innerHTML = ""; // Limpa os posts atuais

    // Renderiza apenas os resultados do filtro
    artigosFiltrados.forEach(artigo => {
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

    // Ajustes de interface
    document.getElementById('btn-limpar-filtro').style.display = 'block';
    const paginacao = document.getElementById('blog-pagination');
    if (paginacao) paginacao.style.display = 'none'; // Esconde paginação no filtro

    window.scrollTo(0, 500); // Rola para ver os resultados
}

function limparFiltro() {
    document.getElementById('btn-limpar-filtro').style.display = 'none';
    const paginacao = document.getElementById('blog-pagination');
    if (paginacao) paginacao.style.display = 'block';
    document.getElementById('post-destaque').style.display = 'block';

    paginaAtual = 1;
    renderizarArtigos(paginaAtual); // Volta a mostrar todos os artigos

}




// Função para comentários do facebook
function carregarComentariosFacebook() {
    const container = document.getElementById('comentarios-fb');
    if (!container) return;

    const urlAtual = window.location.href;
    container.innerHTML = `<div class="fb-comments" data-href="${urlAtual}" data-width="100%" data-numposts="10"></div>`;

    if (typeof FB !== 'undefined') {
        FB.XFBML.parse();
    }
} // <--- AQUI VOCÊ FECHA OS COMENTÁRIOS

// Função para carregar titulo do artigo na aba do navegador
function renderizarTitulosAutomaticos(artigos) {
    // Pega o nome do arquivo atual (ex: razoes-estudantes-nao-gostam-escola.html)
    const nomeArquivoAtual = window.location.pathname.split('/').pop();

    // Procura no JSON qual artigo tem esse link
    const artigoEncontrado = artigos.find(a => a.link.includes(nomeArquivoAtual));

    if (artigoEncontrado) {
        // Atualiza o título da aba
        const abaTitulo = document.getElementById('aba-titulo');
        if (abaTitulo) abaTitulo.innerText = artigoEncontrado.titulo;

        // Atualiza o título visual na página
        const tituloPrincipal = document.getElementById('artigo-titulo-principal');
        if (tituloPrincipal) {
            tituloPrincipal.innerHTML = `<b>${artigoEncontrado.titulo}</b>`;
        }
    }
}



// funções para abrir e fechar dropdowns (como o de categorias) - 

function toggleDropdown(id) {
    var element = document.getElementById(id);
    if (element.style.display === "block") {
        element.style.display = "none";
        closeAllNestedDropdowns(); // Fecha todos os dropdowns de meses e posts
    } else {
        element.style.display = "block";
    }
}

function toggleYearDropdown(event, id) {
    event.stopPropagation();
    closeAllNestedDropdowns(); // Fecha todos os dropdowns de meses e posts
    toggleNestedDropdown(event, id);
}

function toggleNestedDropdown(event, id) {
    event.stopPropagation();
    var element = document.getElementById(id);
    if (element.style.display === "block") {
        element.style.display = "none";
    } else {
        element.style.display = "block";
    }
}

function closeAllNestedDropdowns() {
    var nestedDropdowns = document.querySelectorAll('.nested-dropdown-content');
    nestedDropdowns.forEach(function (dropdown) {
        dropdown.style.display = 'none';
    });
}


//Função para gerar o arquivo do blog dinamicamente, usando o JSON como base
function renderizarArquivoBlog() {
    const container = document.getElementById('arquivo-blog-container');
    if (!container || artigos.length === 0) return;

    const arquivo = {};

    // Lista para converter o nome do mês de volta para objeto
    const mesesNomes = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

    artigos.forEach(artigo => {
        if (artigo.data) {
            // Transforma "02 de setembro de 2024" em partes separadas
            // Resultado: ["02", "de", "setembro", "de", "2024"]
            const partes = artigo.data.toLowerCase().split(' ');

            // O mês é sempre a 3ª palavra (índice 2) e o ano a 5ª (índice 4)
            const mesNomeOriginal = partes[2];
            const ano = partes[4];

            // Capitaliza apenas a primeira letra do mês para o visual (ex: Setembro)
            const mesFormatado = mesNomeOriginal.charAt(0).toUpperCase() + mesNomeOriginal.slice(1);

            if (ano && mesFormatado) {
                if (!arquivo[ano]) arquivo[ano] = {};
                if (!arquivo[ano][mesFormatado]) arquivo[ano][mesFormatado] = [];
                arquivo[ano][mesFormatado].push(artigo);
            }
        }
    });

    let html = `
        <div class="w3-margin">
            <div class="w3-container w3-padding ${corTemaLateral}">
                <h4>Arquivo Blog</h4>
            </div>
            <div class="dropdown-container w3-padding arquivo-blog">
                <button class="w3-button w3-block w3-left-align" onclick="document.getElementById('drop-arquivo').classList.toggle('w3-show')">
                    <strong>Anos e Meses</strong> <i class="fa fa-caret-down"></i>
                </button>
                <div id="drop-arquivo" class="w3-hide w3-container">`;

    // Ordenar anos (do mais novo para o mais antigo)
    const anosOrdenados = Object.keys(arquivo).sort((a, b) => b - a);

    anosOrdenados.forEach(ano => {
        const totalNoAno = Object.values(arquivo[ano]).reduce((acc, curr) => acc + curr.length, 0);
        const idAno = `ano-${ano}`;

        html += `
            <div class="w3-padding-small">
                <span style="cursor:pointer" onclick="document.getElementById('${idAno}').classList.toggle('w3-show')">
                    <i class="fa fa-folder"></i> <strong>${ano}</strong> (${totalNoAno})
                </span>
                <div id="${idAno}" class="w3-hide w3-margin-left">`;

        // Meses do ano
        Object.keys(arquivo[ano]).forEach(mes => {
            const postsNoMes = arquivo[ano][mes];
            const idMes = `mes-${ano}-${mes}`;
            html += `
                <div class="w3-padding-small">
                    <span style="cursor:pointer; color: ##444;" onclick="document.getElementById('${idMes}').classList.toggle('w3-show')">
                        <i class="fa fa-calendar-alt w3-tiny"></i> ${mes} (${postsNoMes.length})
                    </span>
                    <div id="${idMes}" class="w3-hide w3-margin-left">`;

            postsNoMes.forEach(post => {
                html += `<a href="${post.link}" class="w3-bar-item w3-button w3-small" style="display:block; white-space: normal; border-left: 1px solid ##444;">• ${post.titulo}</a>`;
            });

            html += `</div></div>`;
        });

        html += `</div></div>`;
    });

    html += `</div></div></div>`;
    container.innerHTML = html;
}

// --- SEÇÃO "POR AÍ" (GALERIA DE VIAGENS) ---
// --- SEÇÃO "POR AÍ" COM CLIQUE PARA AMPLIAR ---
async function renderizarSecaoViagens() {
    const container = document.getElementById('viagens-container');
    if (!container) return;

    try {
        const resposta = await fetch('../blog/galeria.json');
        if (!resposta.ok) throw new Error("Erro ao carregar galeria");
        const fotos = await resposta.json();

        let html = `
            <div class="w3-white w3-margin">
                <div class="w3-container w3-padding ${corTemaLateral}">
                    <h4>Por aí...</h4>
                </div>
                <div class="w3-row-padding w3-white w3-padding-16">
        `;

        fotos.forEach(foto => {
            // Adicionamos o onclick="abrirModalGaleria(...)"
            html += `
                <div class="w3-col s6 w3-margin-bottom">
                    <div style="height: 100px; overflow: hidden; cursor: pointer;">
                        <img src="${foto.url}" alt="${foto.legenda}" 
                             style="width:100%; height:100%; object-fit: cover;" 
                             class="w3-hover-opacity" 
                             onclick="abrirModalGaleria('${foto.url}', '${foto.legenda}')">
                    </div>
                </div>
            `;
        });

        html += `</div></div>`;
        container.innerHTML = html;
    } catch (erro) {
        console.error("Erro na galeria:", erro);
    }
}

// Função que faz a foto "ficar maior"
function abrirModalGaleria(url, legenda) {
    document.getElementById('img-modal').src = url;
    document.getElementById('legenda-modal').innerText = legenda;
    document.getElementById('modal-galeria').style.display = 'block';
}


// Inicia tudo
carregarDadosDoArquivo();


