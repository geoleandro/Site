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
        renderizarLayoutComum();           // Injeta Menu e Rodapé
        preencherDadosAutomaticos(artigos); // Injeta Título, Data e Imagem do post
        renderizarPostsRecentes();         // Monta a barra lateral
        renderizarNuvemDeTags();           // Monta as tags
        renderizarLeiaTambem();            // Monta as sugestões
        carregarComentariosFacebook();     // Injeta o plugin do FB
        renderizarArquivoBlog();
        renderizarArtigos(paginaAtual);

        // --- INICIALIZAÇÃO DE INTERAÇÕES ---
        inicializarControleFonte();       // CORREÇÃO: Chamada aqui após o layout
        inicializarLogicaDarkMode();      // Inicia o Dark Mode


    } catch (erro) {
        // Tentativa de emergência se o caminho absoluto falhar no seu servidor específico
        console.warn("Tentando caminho alternativo...");
        try {
            const backupPath = window.location.pathname.includes('/artigos/') ? '../../artigos.json' : 'artigos.json';
            const resp = await fetch(backupPath);
            artigos = await resp.json();
            renderizarLayoutComum();           // Injeta Menu e Rodapé
            preencherDadosAutomaticos(artigos); // Injeta Título, Data e Imagem do post
            renderizarPostsRecentes();         // Monta a barra lateral
            renderizarNuvemDeTags();           // Monta as tags
            renderizarLeiaTambem();            // Monta as sugestões
            carregarComentariosFacebook();     // Injeta o plugin do FB
            renderizarArquivoBlog();
            renderizarArtigos(paginaAtual);

            // --- INICIALIZAÇÃO DE INTERAÇÕES ---
            inicializarControleFonte();       // CORREÇÃO: Chamada aqui após o layout
            inicializarLogicaDarkMode();      // Inicia o Dark Mode

        } catch (e) {
            console.error("Falha total ao carregar o JSON:", e);
        }
    }
}

function renderizarLayoutComum() {
    // 1. Injeta o Menu (centerBar)
    const containerMenu = document.querySelector('.centerBar');
    if (containerMenu) {
        containerMenu.innerHTML = `
            <div class="w3-top">
                <div class="w3-bar w3-green w3-card">
                    <a href="/index.html" class="w3-bar-item w3-button">Home</a>
                    <a href="/blog/blog.html" class="w3-bar-item w3-button">Blog</a>
                    <a href="/paginas/sobre.html" class="w3-bar-item w3-button">Sobre</a>
                    
                    <div class="w3-right">
                        <button class="w3-button" id="toggle-dark-mode" title="Mudar Tema">
                            <i class="fa fa-moon"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // 2. Injeta o Header
    const containerHeader = document.getElementById('header-dinamico');
    if (containerHeader) {
        containerHeader.innerHTML = `
            <div class="w3-content" style="max-width:1600px">
                <header class="w3-container w3-center w3-padding-64">
                    <h1 class="extrafonte"><b>Duvid Blog</b></h1>
                    <h3>Bem-vindo ao blog do <span class="w3-tag">Duvid Geografia</span></h3>
                </header>
            </div>
        `;
    }


    // 3. Injeta o Rodapé (Footer) igual ao da Index
    const footer = document.querySelector('footer');
    if (footer) {
        const anoAtual = new Date().getFullYear();

        // Aplicando as classes exatas do seu HTML original
        footer.className = "w3-container w3-padding-24 w3-center w3-green w3-xlarge";

        footer.innerHTML = `
        <a class="fa-brands fa-instagram w3-margin-right" href="https://www.instagram.com/leandrohenriquedasilva/" target="_blank" style="text-decoration:none; color: white;"></a>
        <a class="fa-brands fa-youtube w3-margin-right" href="https://www.youtube.com/@duvidgeografia/" target="_blank" style="text-decoration:none; color: white;"></a>
        <a class="fa-brands fa-tiktok w3-margin-right" href="https://www.tiktok.com/@duvidgeografia/" target="_blank" style="text-decoration:none; color: white;"></a>

        <p style="font-size: 1rem; margin-top: 15px;"> 
            <a href="/paginas/politicaprivacidade.html" target="_blank" style="color: white; text-decoration: none;">Política de Privacidade</a>
        </p>

        <div class="w3-medium" style="margin-top: 10px;">
            <img id="iconeFooter" src="/fotoIndex/marcaDuvid.png" alt="Marca" 
                 class="w3-margin-right" style="width:40px; vertical-align: middle;">
            <span style="color: white;">&copy; Duvid - Geografia 2022 - ${anoAtual}</span>
        </div>
    `;
    }


}

// --- FUNÇÃO DE ACESSIBILIDADE CORRIGIDA ---
function inicializarControleFonte() {
    const btnAumentar = document.getElementById('increase-font');
    const btnDiminuir = document.getElementById('decrease-font');
    const corpoTexto = document.querySelector('.corpo-artigo');

    if (!corpoTexto || !btnAumentar || !btnDiminuir) return;

    // Começamos em 1.25rem (Tamanho normal/confortável)
    let fontSizeAtual = 1.25;

    function atualizarBotoes() {
        // Limite máximo: 1.8rem (Texto bem grande para idosos ou cansaço visual)
        if (fontSizeAtual >= 1.8) {
            btnAumentar.classList.add('btn-font-disabled');
        } else {
            btnAumentar.classList.remove('btn-font-disabled');
        }

        // Limite mínimo: 1.1rem (Abaixo disso fica pequeno demais)
        if (fontSizeAtual <= 1.1) {
            btnDiminuir.classList.add('btn-font-disabled');
        } else {
            btnDiminuir.classList.remove('btn-font-disabled');
        }
    }

    btnAumentar.onclick = function () {
        if (fontSizeAtual < 1.8) {
            fontSizeAtual += 0.1;
            corpoTexto.style.fontSize = fontSizeAtual.toFixed(2) + "rem";
            atualizarBotoes();
        }
        this.blur();
    };

    btnDiminuir.onclick = function () {
        if (fontSizeAtual > 1.1) {
            fontSizeAtual -= 0.1;
            corpoTexto.style.fontSize = fontSizeAtual.toFixed(2) + "rem";
            atualizarBotoes();
        }
        this.blur();
    };

    // Aplica o tamanho inicial ao carregar
    corpoTexto.style.fontSize = fontSizeAtual + "rem";
    atualizarBotoes();
}

// --- LOGICA DARK MODE ---
function inicializarLogicaDarkMode() {
    const btn = document.getElementById('toggle-dark-mode');
    const body = document.body;

    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        if (btn) btn.innerHTML = '<i class="fa fa-sun"></i>';
    }

    if (btn) {
        btn.onclick = function () {
            body.classList.toggle('dark-mode');
            if (body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                this.innerHTML = '<i class="fa fa-sun"></i>';
            } else {
                localStorage.setItem('theme', 'light');
                this.innerHTML = '<i class="fa fa-moon"></i>';
            }
        };
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
            document.getElementById('lista-dados-autor').classList.remove('hidden-loading');
        };

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
        const classeAtiva = (i === paginaAtual) ? 'w3-green' : 'w3-white';
        paginacaoContainer.innerHTML += `<button class="w3-button ${classeAtiva} w3-border w3-margin-right" onclick="irParaPagina(${i})">${i}</button>`;
    }
}

function irParaPagina(p) {
    paginaAtual = p;
    renderizarArtigos(p);
    window.scrollTo(0, 0);
}


function filtrarPorTag(tagSelecionada) {
    const grid = document.getElementById('posts-grid');
    if (!grid) return;

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
        <div class="w3-white w3-margin">
            <div class="w3-container w3-padding ${corTemaLateral}">
                <h4>Arquivo Blog</h4>
            </div>
            <div class="dropdown-container w3-padding">
                <button class="w3-button w3-block w3-left-align" onclick="document.getElementById('drop-arquivo').classList.toggle('w3-show')">
                    <strong>Anos e Meses</strong> <i class="fa fa-caret-down"></i>
                </button>
                <div id="drop-arquivo" class="w3-hide w3-container w3-white">`;

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
                    <span style="cursor:pointer; color: #555;" onclick="document.getElementById('${idMes}').classList.toggle('w3-show')">
                        <i class="fa fa-calendar-alt w3-tiny"></i> ${mes} (${postsNoMes.length})
                    </span>
                    <div id="${idMes}" class="w3-hide w3-margin-left">`;

            postsNoMes.forEach(post => {
                html += `<a href="${post.link}" class="w3-bar-item w3-button w3-small w3-text-grey" style="display:block; white-space: normal; border-left: 1px solid #ddd;">• ${post.titulo}</a>`;
            });

            html += `</div></div>`;
        });

        html += `</div></div>`;
    });

    html += `</div></div></div>`;
    container.innerHTML = html;
}


function configurarAcessibilidadeFonte() {
    const btnAumentar = document.getElementById('increase-font');
    const btnDiminuir = document.getElementById('decrease-font');
    const corpoTexto = document.querySelector('.corpo-artigo');

    if (!corpoTexto || !btnAumentar || !btnDiminuir) return;

    let fontSizeAtual = 1.15; // Valor inicial em 'rem' (conforme o CSS)

    btnAumentar.onclick = function () {
        if (fontSizeAtual < 1.6) { // Limite máximo
            fontSizeAtual += 0.1;
            corpoTexto.style.fontSize = fontSizeAtual + "rem";
        }
    };

    btnDiminuir.onclick = function () {
        if (fontSizeAtual > 0.9) { // Limite mínimo
            fontSizeAtual -= 0.1;
            corpoTexto.style.fontSize = fontSizeAtual + "rem";
        }
    };

    console.log("Configurações de acessibilidade de fonte ativadas.");
}



function mostrarBotaoTopo() {
    const btn = document.getElementById("btn-topo");
    if (!btn) return;

    // Se rolar mais de 400px para baixo, o botão aparece
    if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
        btn.style.display = "block";
    } else {
        btn.style.display = "none";
    }
}

// Função para subir suavemente
function voltarAoTopo() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Subida suave (animação)
    });
}

async function carregarGaleria() {
    const container = document.getElementById('grid-galeria');
    if (!container) return;

    try {
        const response = await fetch('galeria.json'); // Certifique-se que o caminho está correto
        const fotos = await response.json();

        let htmlGrid = '<div class="w3-col s6" id="col-galeria-1"></div><div class="w3-col s6" id="col-galeria-2"></div>';
        container.innerHTML = htmlGrid;

        const col1 = document.getElementById('col-galeria-1');
        const col2 = document.getElementById('col-galeria-2');

        fotos.forEach((foto, index) => {
            const imgHtml = `
                <p>
                    <img src="${foto.url}" 
                         style="width:100%;cursor:zoom-in" 
                         alt="${foto.legenda}" 
                         onclick="abrirModalGaleria('${foto.url}', '${foto.legenda}')"
                         class="w3-hover-opacity">
                </p>`;

            // Distribui entre as duas colunas
            if (index % 2 === 0) col1.innerHTML += imgHtml;
            else col2.innerHTML += imgHtml;
        });
    } catch (error) {
        console.error("Erro ao carregar a galeria:", error);
    }
}

function abrirModalGaleria(url, legenda) {
    const modal = document.getElementById('modal-galeria');
    const imgModal = document.getElementById('img-modal-expandida');
    const legendaModal = document.getElementById('legenda-modal');

    imgModal.src = url;
    legendaModal.innerHTML = `<strong>${legenda}</strong>`;
    modal.style.display = 'block';
}

// Chame a função no carregamento
document.addEventListener('DOMContentLoaded', carregarGaleria);

// Monitora a rolagem da página
window.onscroll = function () {
    mostrarBotaoTopo();
};
// Inicia tudo
carregarDadosDoArquivo();


