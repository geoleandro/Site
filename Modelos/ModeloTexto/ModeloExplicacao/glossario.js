document.querySelectorAll(".termo").forEach(termo => {
  const palavra = termo.dataset.palavra;
  const definicao = termo.dataset.definicao;

  // Cria tooltip balão
  const tooltip = document.createElement("span");
  tooltip.classList.add("tooltip");
  tooltip.innerHTML = `<b>${palavra}</b>: ${definicao}`;
  termo.appendChild(tooltip);

  // Evento click: mostra/oculta tooltip e adiciona ao glossário
  termo.addEventListener("click", (e) => {
    e.stopPropagation(); // evita fechar imediatamente
    // Se já está aberto, fecha
    if (tooltip.classList.contains("show")) {
      tooltip.classList.remove("show");
      return;
    }
    // Fecha todos os outros tooltips
    document.querySelectorAll(".tooltip").forEach(t => t.classList.remove("show"));
    tooltip.classList.add("show");

    // Adiciona ao glossário se ainda não existe
    const lista = document.getElementById("lista-glossario");
    const jaExiste = [...lista.querySelectorAll("li")].some(li => li.dataset.palavra === palavra);
    if (!jaExiste) {
      const item = document.createElement("li");
      item.dataset.palavra = palavra;
      item.innerHTML = `<b>${palavra}</b>: ${definicao}`;
      lista.appendChild(item);
    }
  });
});

// Fecha tooltip ao clicar fora
document.addEventListener("click", () => {
  document.querySelectorAll(".tooltip").forEach(t => t.classList.remove("show"));
});

