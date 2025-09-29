document.querySelectorAll(".termo").forEach(termo => {
  termo.addEventListener("click", () => {
    const explicacao = termo.querySelector(".explicacao");
    const aberto = explicacao.style.display === "block";
    
    // Fecha todos antes de abrir outro
    document.querySelectorAll(".explicacao").forEach(e => e.style.display = "none");
    
    // Abre só o atual
    explicacao.style.display = aberto ? "none" : "block";
  });
});

// Fecha se clicar fora
document.addEventListener("click", (e) => {
  if (!e.target.closest(".termo")) {
    document.querySelectorAll(".explicacao").forEach(e => e.style.display = "none");
  }
});
