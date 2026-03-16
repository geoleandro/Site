let timerNav;
let timerDrop;

function AbrirNavBar() {
    var x = document.getElementById("navDemo");
    if (x.className.indexOf("w3-show") == -1) {
        x.className += " w3-show";
        
        // FECHAR AUTOMATICAMENTE após 5 segundos (5000ms)
        clearTimeout(timerNav); // Limpa timer anterior se houver
        timerNav = setTimeout(() => {
            x.className = x.className.replace(" w3-show", "");
        }, 5000); 

    } else {
        x.className = x.className.replace(" w3-show", "");
    }
}

function AbrirDropDown(id) {
    var x = document.getElementById(id);
    if (x.className.indexOf("w3-show") == -1) {
        x.className += " w3-show";

        // FECHAR AUTOMATICAMENTE após 4 segundos (4000ms)
        clearTimeout(timerDrop);
        timerDrop = setTimeout(() => {
            x.className = x.className.replace(" w3-show", "");
        }, 4000);

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


    // Adicione esta função ao seu arquivo de menus
function fecharModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
    }
}

