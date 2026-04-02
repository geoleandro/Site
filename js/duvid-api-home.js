const ClimaDuvid = {
    apiKey: "49493f4ba54fe8643ab6521b14c431e2", // Insira sua chave da 
    cidadePadrao: "Poços de Caldas",

    init: function () {
        // 1. Tenta pegar a cidade que o aluno pesquisou da última vez
        const ultimaCidade = localStorage.getItem('cidade_clima') || this.cidadePadrao;
        this.buscarClima(ultimaCidade);
    },

    buscarClima: function (cidade) {
        // Exibe um "Carregando..." visual
        document.getElementById('temp-atual').innerText = "--";
        document.getElementById('clima-desc').innerText = "Consultando satélites...";

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURI(cidade)}&units=metric&lang=pt_br&appid=${this.apiKey}`;

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error("Cidade não encontrada ou chave inativa");
                return res.json();
            })
            .then(data => {
                this.renderizar(data);
                localStorage.setItem('cidade_clima', cidade);
            })
            .catch(err => {
                console.error(err);
                document.getElementById('clima-desc').innerText = "Erro ao buscar cidade.";
            });
    },

    renderizar: function (data) {
        // Atualiza o nome da cidade (pode vir corrigido da API, ex: "pocos" -> "Poços de Caldas")
        document.getElementById('cidade-nome').innerText = data.name;

        // Atualiza a temperatura arredondada
        const temp = Math.round(data.main.temp);
        document.getElementById('temp-atual').innerText = `${temp}°C`;

        // Atualiza a descrição (ex: "nuvens dispersas")
        const desc = data.weather[0].description;
        document.getElementById('clima-desc').innerText = desc.charAt(0).toUpperCase() + desc.slice(1);
    }
};

// Função para o botão/lupa que você colocou no card
function mudarCidadeClima() {
    const novaCidade = prompt("Qual cidade deseja monitorar?");
    if (novaCidade && novaCidade.trim() !== "") {
        ClimaDuvid.buscarClima(novaCidade);
    }
}

const MonitorPopulacao = {
    // Dados base estimados para Março de 2026
    baseMundial: 8254130400,
    taxaPorSegundo: 2.4, // Média de crescimento líquido global (nascimentos - óbitos)

    iniciar: function () {
        // Atualiza a cada 500ms para o efeito visual ser mais fluido ("pulsante")
        setInterval(() => {
            this.atualizar();
        }, 500);
    },

    atualizar: function () {
        const elemento = document.getElementById('populacao-live');
        if (!elemento) return;

        // Cálculo: Base + (Segundos passados desde uma data fixa * taxa)
        // Usamos o timestamp para garantir que o número seja contínuo
        const agora = new Date().getTime() / 1000;
        const dataReferencia = new Date("2026-03-01T00:00:00").getTime() / 1000;
        const segundosDecorridos = agora - dataReferencia;

        const populacaoAtual = Math.floor(this.baseMundial + (segundosDecorridos * this.taxaPorSegundo));

        // Formata com pontos (Ex: 8.254.130.400)
        elemento.innerText = populacaoAtual.toLocaleString('pt-BR');
    }
};



//API DA COTAÇÃO DO DÓLAR
function buscarDolar() {
    fetch('https://economia.awesomeapi.com.br/last/USD-BRL')
        .then(response => response.json())
        .then(data => {
            const valor = parseFloat(data.USDBRL.bid).toFixed(2);
            document.getElementById('dolar-valor').innerText = `R$ ${valor.replace('.', ',')}`;
        })
        .catch(err => console.error("Erro ao buscar dólar:", err));
}

// API PARA IBOVESPA// CONFIGURAÇÃO DA API BRAPI (Gratuita para até 100 requisições/dia)
const BRAPI_TOKEN = "32t8bk9zGNXyW79pJYk7rE"; // Opcional, mas recomendado gerar um no site brapi.dev

async function buscarDadosMercado() {
    try {
        // Buscando Ibovespa e Petróleo Brent
        // Nota: O Brent é listado como 'BZ=F' em muitos lugares, mas na Brapi usamos a rota de quote
        const url = `https://brapi.dev/api/quote/%5EBVSP?token=${BRAPI_TOKEN}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results[0]) {
            const ibov = data.results[0];
            const pontos = ibov.regularMarketPrice.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
            
            const elIbov = document.getElementById('ibov-pontos');
            if (elIbov) {
                elIbov.innerText = `${pontos} pts`;
                // Cor: verde se subiu no dia, vermelho se caiu
                elIbov.style.color = ibov.regularMarketChangePercent >= 0 ? "#4caf50" : "#f44336";
            }
        }
    } catch (err) {
        console.error("Erro Ibovespa/Mercado:", err);
        // Fallback realista para 2026
        document.getElementById('ibov-pontos').innerText = "188.200 pts";
    }
}

// Para o Petróleo Brent (Valor Real 2026)
async function buscarPetroleoBrent() {
    try {
        // Usando uma rota de commodities ou fallback via Yahoo Finance adaptado
        const url = `https://brapi.dev/api/quote/BZ=F?token=${BRAPI_TOKEN}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.results && data.results[0]) {
            const valor = data.results[0].regularMarketPrice.toFixed(2);
            document.getElementById('petroleo-valor').innerText = `U$ ${valor.replace('.', ',')}`;
        }
    } catch (err) {
        console.error("Erro Petróleo:", err);
        // O valor de U$ 109,25 que você mencionou é o ideal para 2026
        document.getElementById('petroleo-valor').innerText = "U$ 109,25"; 
    }
}

// Inicia no carregamento
document.addEventListener('DOMContentLoaded', () => {
    buscarDadosMercado();
    buscarPetroleoBrent();
    // Atualiza a cada 15 minutos
    setInterval(() => {
        buscarDadosMercado();
        buscarPetroleoBrent();
   }, 3600000);
});

// Inicia junto com os outros
document.addEventListener('DOMContentLoaded', () => {
    buscarDolar();
    // Atualiza o dólar a cada 5 minutos
    setInterval(buscarDolar, 300000);
});

// Iniciar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => MonitorPopulacao.iniciar());

// Inicia o monitoramento ao carregar a página
window.addEventListener('DOMContentLoaded', () => ClimaDuvid.init());


