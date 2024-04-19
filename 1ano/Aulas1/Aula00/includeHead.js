// Função para carregar o conteúdo do head.html dentro do div com ID "dynamic-head"
function includeHead() {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementById("dynamic-head").innerHTML = this.responseText;
        }
    };
    xhr.open("GET", "head.html", true);
    xhr.send();
}

// Chama a função para carregar o head quando a página carregar
window.onload = includeHead;
