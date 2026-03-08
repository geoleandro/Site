document.addEventListener("DOMContentLoaded", function () {
    injetarComponentesGlobais();
    aplicarTemaSalvo();
    inicializarControleFonte();

});

async function injetarComponentesGlobais() {
    const carregarRecurso = async (id, path) => {
        const container = document.getElementById(id);
        if (container && container.innerHTML.trim() === "") {
            try {
                const res = await fetch(path);
                if (res.ok) {
                    container.innerHTML = await res.text();
                    return true;
                }
            } catch (erro) {
                console.error("Erro ao carregar:", id, erro);
            }
        }
        return false;
    };

    await carregarRecurso('header-placeholder', '/includes/header.html');
    const fOk = await carregarRecurso('footer-placeholder', '/includes/footer.html');

    if (fOk) {
        const spanAno = document.getElementById('ano-atual');
        if (spanAno) spanAno.textContent = new Date().getFullYear();
    }

    if (typeof inicializarLogicaDarkMode === "function") inicializarLogicaDarkMode();
    if (typeof inicializarControleFonte === "function") inicializarControleFonte();
}

function inicializarControleFonte() {
    // Seleciona os botões (ajuste os IDs para baterem com o seu header.html)
    const btnA = document.getElementById('increase-font') || document.querySelector('[onclick="aumentarFonte()"]');
    const btnD = document.getElementById('decrease-font') || document.querySelector('[onclick="diminuirFonte()"]');
    
    // Alvo: O container principal que usamos em todas as páginas novas
    const corpo = document.querySelector('.w3-content') || document.querySelector('main') || document.body;

    if (!corpo) return;

    // Recupera o tamanho salvo ou define o padrão
    let size = parseFloat(localStorage.getItem('userFontSize')) || 1.05;

    const update = () => {
        corpo.style.fontSize = size.toFixed(2) + "rem";
        localStorage.setItem('userFontSize', size);
        
    };

    // Se os botões existirem na página, atribui as funções
    if (btnA) btnA.onclick = (e) => { 
        e.preventDefault(); 
        if (size < 1.5) { size += 0.05; update(); } 
    };
    
    if (btnD) btnD.onclick = (e) => { 
        e.preventDefault(); 
        if (size > 0.8) { size -= 0.05; update(); } 
    };

    // Aplica o tamanho salvo ao carregar
    update();
}

function inicializarLogicaDarkMode() {
    const upIcon = () => {
        const btn = document.getElementById('toggle-dark-mode');
        if (btn) {
            btn.innerHTML = document.body.classList.contains('dark-mode') ? '<i class="fa fa-sun"></i>' : '<i class="fa fa-moon"></i>';
        }
    };
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('#toggle-dark-mode');
        if (btn) {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
            upIcon();
        }
    });
    upIcon();
}

function aplicarTemaSalvo() {
    if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
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


// Monitora a rolagem da página
window.onscroll = function () {
    mostrarBotaoTopo();
};
