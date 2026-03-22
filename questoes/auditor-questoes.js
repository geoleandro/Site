function revelarGabaritoJSON() {
    const container = document.getElementById('container-questoes') || document.body;
    
    // Limpa a tela para a revisão
    container.innerHTML = '<h1 class="w3-center w3-text-green">Revisão Completa do JSON</h1>';

    if (typeof questoes === 'undefined' || questoes.length === 0) {
        console.error("Erro: O array 'questoes' não foi encontrado.");
        return;
    }

    questoes.forEach((q) => {
        let alternativasHTML = "";

        q.alternativas.forEach((alt, i) => {
            const estiloCorreta = (i === q.correta) ? 'w3-green w3-padding w3-round' : '';
            const icone = (i === q.correta) ? ' <i class="fa fa-check-circle"></i>' : '';
            
            alternativasHTML += `
                <p class="${estiloCorreta}" style="margin: 5px 0; padding: 8px;">
                    <b>${String.fromCharCode(97 + i)})</b> ${alt} ${icone}
                </p>`;
        });

        container.innerHTML += `
            <div class="w3-card-4 w3-white w3-margin w3-padding w3-round-large">
                <span class="w3-tag w3-green w3-round">ID: ${q.id}</span>
                <span class="w3-text-grey w3-small w3-margin-left">Ano: ${q.ano || '---'}</span>
                
                ${q.texto_apoio ? `
                    <div class="w3-panel w3-leftbar w3-sand w3-margin-top w3-padding-small w3-small">
                        ${q.texto_apoio}
                    </div>
                ` : ''}

                <h4 style="margin-top:10px"><b>${q.pergunta}</b></h4>
                
                ${q.imagem_apoio ? `<img src="${q.imagem_apoio}" class="w3-image w3-margin-bottom" style="max-height:250px; display:block; margin:auto;">` : ''}
                
                <div class="w3-light-grey w3-padding-small w3-round">
                    ${alternativasHTML}
                </div>

                <div class="w3-panel w3-leftbar w3-border-green w3-pale-green w3-small">
                    <b>Comentário:</b> ${q.comentario}
                </div>
            </div>
        `;
    });

    window.scrollTo(0, 0);
    console.log("✅ Gabarito revelado com textos de apoio!");
}

revelarGabaritoJSON();