  // Função para abrir/fechar o menu mobile
    function AbrirNavBar() {
      var x = document.getElementById("navDemo");
      if (x.className.indexOf("w3-show") == -1) {
        x.className += " w3-show";
      } else {
        x.className = x.className.replace(" w3-show", "");
      }
    }

    // Função para abrir os Dropdowns (Aulas e Simulados)
    function AbrirDropDown(id) {
      var x = document.getElementById(id);
      if (x.className.indexOf("w3-show") == -1) {
        x.className += " w3-show";
      } else {
        x.className = x.className.replace(" w3-show", "");
      }
    }

    // Fecha o dropdown se o usuário clicar fora dele
    window.onclick = function (event) {
      if (!event.target.matches('.w3-button')) {
        var dropdowns = document.getElementsByClassName("w3-dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
          var openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('w3-show')) {
            openDropdown.classList.remove('w3-show');
          }
        }
      }
    }

    