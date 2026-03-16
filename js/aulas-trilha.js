async function carregarAulas(ano) {
    const grid = document.getElementById('grid-aulas');
    if (!grid) return;

    try {
        // Adicionei a / antes de js para evitar erro de pastas
        const res = await fetch(`/js/aulas-${ano}ano.json`);
        const aulas = await res.json();

        grid.innerHTML = aulas.map(aula => `
    <div class="column">
        <div class="wrapper" onclick="ExpandeDiv('menu${aula.id}')">
            <img src="${aula.imagem}" alt="${aula.titulo}">
        </div>
        <p>Aula ${aula.id}: ${aula.titulo}</p>

        <div id="menu${aula.id}" class="menu-escolha w3-card-4 w3-animate-zoom" style="display:none">
            <div class="w3-container w3-padding">
                <span onclick="document.getElementById('menu${aula.id}').style.display='none'" 
                      class="w3-button w3-display-topright">&times;</span>
                <h6>O que deseja fazer?</h6>
                <div class="w3-bar">
                    ${aula.linkTexto ? `<a href="${aula.linkTexto}" class="w3-button w3-teal w3-round w3-margin-right">Texto</a>` : ''}
                    <a href="${aula.linkQuestoes}" class="w3-button w3-orange w3-text-white w3-round">Questões</a>
                </div>
            </div>
        </div>
    </div>
`).join('');


    } catch (e) {
        console.error("Erro ao carregar as aulas:", e);
        grid.innerHTML = "<p class='w3-center'>Erro ao carregar as aulas. Verifique a conexão.</p>";
    }
}

// Suas outras funções (ExpandeDiv, onClick, window.onclick) continuam iguais abaixo...

// Função para abrir o balão e fechar os outros que estiverem abertos
function ExpandeDiv(id_menu) {
    const menuAlvo = document.getElementById(id_menu);

    // 1. Fecha todos os outros menus antes de abrir o novo
    const todosMenus = document.getElementsByClassName('menu-escolha');
    for (let m of todosMenus) {
        if (m.id !== id_menu) {
            m.style.display = 'none';
        }
    }

    // 2. Abre ou fecha o menu clicado (Toggle)
    if (menuAlvo.style.display === 'block') {
        menuAlvo.style.display = 'none';
    } else {
        menuAlvo.style.display = 'block';
    }
}

// Função Global: Fecha o balão se clicar fora dele ou da bolinha
window.onclick = function (event) {
    // Se o clique não foi na imagem (wrapper) e nem dentro de um menu-escolha
    if (!event.target.closest('.wrapper') && !event.target.closest('.menu-escolha')) {
        const menus = document.getElementsByClassName('menu-escolha');
        for (let m of menus) {
            m.style.display = 'none';
        }
    }
}