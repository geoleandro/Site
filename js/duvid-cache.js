// duvid-cache.js
// Cache central de JSONs — carrega cada arquivo só uma vez por sessão

const DuvidCache = {
    _store: {},

    // Busca do cache ou faz fetch se ainda não tem
    async get(url) {
        if (this._store[url]) return this._store[url];

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Falha ao carregar: ${url}`);

        const dados = await res.json();
        this._store[url] = dados; // guarda para próxima chamada
        return dados;
    },

    // Limpa uma entrada específica (útil se o conteúdo mudar)
    invalidar(url) {
        delete this._store[url];
    }
};