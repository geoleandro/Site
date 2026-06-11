/* =====================================================================
   jssimulado-padrao.js  —  Módulo de SIMULADOS (Duvid Geografia)
   ---------------------------------------------------------------------
   Reaproveita TODO o motor de js/jsquestoes-padrao.js (renderizarQuestao,
   embaralharArray, verificar, feedbacks, sistema de vidas/combo, etc.).
   A única diferença é a ORIGEM das questões: em vez da pasta de ano
   (/questoes/1ano/...), carrega um banco de simulado a partir de
   /simulados/bancos/<prova>.json, lido pelo parâmetro ?prova= da URL.

   IMPORTANTE: este script deve ser incluído DEPOIS de jsquestoes-padrao.js,
   pois usa as variáveis e funções globais declaradas lá.
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const prova = params.get('prova');

    // Sem ?prova= a página não faz nada (deixa o motor das aulas em paz).
    if (!prova) return;

    carregarSimulado(prova);
});

async function carregarSimulado(prova) {
    const container = document.getElementById('container-questao');

    try {
        // Sanitiza o nome do arquivo (evita ../ e barras) e monta a URL.
        const nomeArquivo = prova.replace(/[^a-zA-Z0-9_-]/g, '');
        const url = `/simulados/bancos/${nomeArquivo}.json`;

        // Usa o cache do site quando disponível; senão, fetch direto.
        let dadosBrutos;
        if (typeof DuvidCache !== "undefined" && typeof DuvidCache.get === "function") {
            dadosBrutos = await DuvidCache.get(url);
        } else {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status} ao buscar ${url}`);
            dadosBrutos = await res.json();
        }

        if (!Array.isArray(dadosBrutos) || dadosBrutos.length === 0) {
            throw new Error("Banco de questões vazio ou inválido.");
        }

        // --- Reset do estado global do motor (declarado em jsquestoes-padrao.js) ---
        aulaID = "";                 // vazio => finalizar() NÃO grava progresso de aula
        indiceAtual = 0;
        nota = 0;
        if (typeof TOTAL_VIDAS !== "undefined") vidas = TOTAL_VIDAS;
        combo = 0;
        questoesErradas = [];
        window.ganhosAtuais = 0;

        // Embaralha uma CÓPIA (não muta o cache) — mesmo padrão das aulas.
        questoes = embaralharArray([...dadosBrutos]);

        renderizarQuestao();

        if (typeof DuvidUI !== "undefined" && typeof DuvidUI.atualizarInterface === "function") {
            DuvidUI.atualizarInterface();
        }
        if (typeof configurarSEOAutomatico === "function") {
            configurarSEOAutomatico(nomeArquivo, 'questao');
        }

    } catch (error) {
        console.error("Erro ao carregar simulado:", error);
        if (container) {
            container.innerHTML = `
                <div class="w3-panel w3-pale-red w3-leftbar w3-border-red w3-padding">
                    <p><b>Não foi possível carregar este simulado.</b></p>
                    <p class="w3-small">Verifique se o arquivo do banco existe em
                    <code>/simulados/bancos/</code> e tente novamente.</p>
                </div>`;
        }
    }
}
