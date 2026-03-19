function extrairDuvidJSON() {
    const questoes = [];
    // Seleciona todos os cards de questões
    const cards = document.querySelectorAll('.w3-card-4');

    cards.forEach((card, index) => {
        // Ignora cards que não sejam de questões (se houver)
        if (!card.querySelector('.p2')) return;

        const obj = {};
        obj.id = index + 1;

        // 1. Extrair Ano/Origem (Ex: UEL 2019)
        const pAno = card.querySelector('p:nth-of-type(2)');
        obj.ano = pAno ? pAno.innerText.replace(/[\(\)]/g, '').trim() : "";

        // 2. Extrair Texto de Apoio e Fonte
        const panel = card.querySelector('.w3-panel.w3-sand');
        if (panel) {
            obj.texto_apoio = panel.querySelector('p:not(.w3-small)')?.innerText.trim();
            obj.fonte_apoio = panel.querySelector('.w3-small')?.innerText.trim();
        }

        // 3. Extrair Imagem
        const img = card.querySelector('img');
        if (img) {
            const src = img.getAttribute('src');
            obj.imagem_apoio = `3ano/img/${src}`;
        }

        // 4. Extrair Pergunta (Enunciado)
        // Pegamos o texto que sobra entre o painel/imagem e as alternativas
        const todosPs = Array.from(card.querySelectorAll('p'));
        const pPergunta = todosPs.find(p => 
            !p.classList.contains('p2') && 
            !p.classList.contains('w3-small') && 
            !p.classList.contains('bordaQuestoes') &&
            p.innerText.length > 20
        );
        obj.pergunta = pPergunta ? pPergunta.innerText.trim() : "";

        // 5. Extrair Alternativas (Limpando o "a) ", "b) ")
        const alts = card.querySelectorAll('.bordaQuestoes');
        obj.alternativas = Array.from(alts).map(a => {
            return a.innerText.replace(/^[a-e]\)\s*/i, '').trim();
        });

        // 6. Resposta Correta (Padrão 0 para você revisar)
        obj.correta = 0;

        // 7. Comentário (Pega o bloco seguinte ao card)
        let proximo = card.nextElementSibling;
        while (proximo && !proximo.classList.contains('comentarios')) {
            proximo = proximo.nextElementSibling;
        }
        if (proximo) {
            obj.comentario = proximo.innerHTML.replace('<strong>Comentário:</strong>', '').trim();
        }

        questoes.push(obj);
    });

    // Mostra o JSON formatado no console
    console.log(JSON.stringify(questoes, null, 2));
    return "Copiado para o console! Role para cima para ver o array completo.";
}

extrairDuvidJSON();