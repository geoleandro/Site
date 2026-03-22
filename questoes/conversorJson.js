function extrairDuvidJSON() {
    const todosOsCards = Array.from(document.querySelectorAll('.w3-card-4'));
    const todosOsComentarios = Array.from(document.querySelectorAll('.comentarios'));
    const questoes = [];

    todosOsCards.forEach((card, index) => {
        const obj = {
            id: index + 1,
            ano: "",
            imagem_apoio: "",
            texto_apoio: "",
            pergunta: "",
            alternativas: [],
            correta: 0,
            comentario: ""
        };

        // 1. Texto de Apoio (Limpando quebras de linha do código)
        const panel = card.querySelector('.w3-panel');
        if (panel) {
            obj.texto_apoio = panel.innerHTML.replace(/\r?\n|\r/g, " ").replace(/\s\s+/g, ' ').trim();
        }

        // 2. Comentário e Gabarito
        if (todosOsComentarios[index]) {
            obj.comentario = todosOsComentarios[index].innerHTML.trim();
            const textoComent = todosOsComentarios[index].innerText.toLowerCase();
            if (textoComent.includes('a) correta')) obj.correta = 0;
            else if (textoComent.includes('b) correta')) obj.correta = 1;
            else if (textoComent.includes('c) correta')) obj.correta = 2;
            else if (textoComent.includes('d) correta')) obj.correta = 3;
            else if (textoComent.includes('e) correta')) obj.correta = 4;
        }

        // 3. Ano e Pergunta
        const ps = Array.from(card.querySelectorAll('p'));
        ps.forEach(p => {
            const txt = p.innerText.trim();
            if (txt.match(/^\(\d{4}\)$/)) {
                obj.ano = txt.replace(/[()]/g, '');
            } else if (!p.classList.contains('bordaQuestoes') && !p.closest('.w3-panel') && !p.classList.contains('p2') && txt.length > 5) {
                obj.pergunta = txt.replace(/\r?\n|\r/g, " ").replace(/\s\s+/g, ' ').trim();
            }
        });

        // 4. Alternativas (REMOVENDO AS LETRAS REPETIDAS)
        const alts = card.querySelectorAll('.bordaQuestoes');
        alts.forEach((alt) => {
            // Regex que remove "a) ", "a. ", "A) ", etc. no início da frase
            let textoLimpo = alt.innerText.replace(/^[a-e][\)\.\-\s]+/i, '').trim();
            if (textoLimpo) obj.alternativas.push(textoLimpo);
        });

        // 5. Imagem
        const img = card.querySelector('img');
        if (img) obj.imagem_apoio = img.getAttribute('src');

        questoes.push(obj);
    });

    const finalJSON = JSON.stringify(questoes, null, 2);
    console.log(finalJSON);
    copy(finalJSON);
    alert("JSON Limpo! Letras duplicadas removidas de " + questoes.length + " questões.");
}

extrairDuvidJSON();