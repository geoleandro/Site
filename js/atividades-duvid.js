let todasAtividades = []; // Cache local

async function carregarAtividades() {
    try {
        const response = await fetch('atividades.json');
        todasAtividades = await response.json();
        renderizarCards(todasAtividades);
    } catch (error) {
        console.error("Erro:", error);
    }
}

function renderizarCards(lista) {
    const container = document.getElementById('container-atividades');
    container.innerHTML = "";

    if(lista.length === 0) {
        container.innerHTML = `<div class="w3-center w3-padding-64"><p class="w3-large w3-opacity">Nenhuma atividade encontrada.</p></div>`;
        return;
    }

    lista.forEach(atv => {
        container.innerHTML += `
            <div class="w3-col l4 m6 s12 w3-margin-bottom animate-top">
                <div class="w3-card w3-white w3-round-large w3-padding-16 card-rpg">
                    <div class="w3-row">
                        <div class="w3-col s8">
                            <span class="w3-tag w3-amber w3-round w3-tiny"><b>${atv.tag.toUpperCase()}</b></span>
                        </div>
                        <div class="w3-col s4 w3-right-align">
                            <span class="badge-nivel">${atv.nivel}</span>
                        </div>
                    </div>
                    <h4 class="w3-text-dark-grey"><b>${atv.titulo}</b></h4>
                    <p class="w3-small w3-opacity">${atv.descricao}</p>
                   
                     <p class="w3-small w3-opacity">Tag: ${atv.tema}</p>
                 
                    <p class="w3-tiny w3-text-grey"><b>BNCC:</b> ${atv.bncc}</p>
                    <div class="w3-row w3-center">
                        <div class="w3-col s6">
                             <a href="${atv.link}" target="_blank" class="w3-button w3-light-grey w3-block w3-round-medium w3-small">Visualizar</a>
                        </div>
                        <div class="w3-col s6">
                            <a href="${atv.link}" download class="w3-button w3-blue w3-block w3-round-medium w3-small w3-margin-left" style="width: 90%">
                                <i class="fa fa-download"></i> Baixar
                            </a>
                        </div>
                    </div>
                </div>
            </div>`;
    });
}

// Lógica de Filtro
function filtrar(categoria) {
    // Atualiza botões
    const botoes = document.querySelectorAll('.btn-filtro');
    botoes.forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    if(categoria === 'Todos') {
        renderizarCards(todasAtividades);
    } else {
        const filtrados = todasAtividades.filter(atv => atv.tema === categoria);
        renderizarCards(filtrados);
    }
}

// Lógica de Busca em tempo real
document.getElementById('inputBusca')?.addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase();
    const filtrados = todasAtividades.filter(atv => 
        atv.titulo.toLowerCase().includes(termo) || 
        atv.tema.toLowerCase().includes(termo) ||
        atv.descricao.toLowerCase().includes(termo)
    );
    renderizarCards(filtrados);
});

document.addEventListener('DOMContentLoaded', carregarAtividades);