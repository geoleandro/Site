<?php
// Inicializa a variável de erro
$error_message = "";

// Verifica se a requisição é POST e se o campo de senha está presente
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["password"])) {
    $senhaCorreta = "Chopin"; // Substitua pela sua senha
    
    // Obtém a senha fornecida pelo usuário
    $senhaUsuario = $_POST["password"];

    // Verifica se a senha fornecida está correta
    if ($senhaUsuario === $senhaCorreta) {
        // Senha correta, redireciona para o link
        header("Location: https://docs.google.com/spreadsheets/d/1QkOHFsXcyNu-qeCofxuarHj0NquQ1Arh2yXfi1nRD6M/edit?usp=sharing");
        exit();
    } else {
        // Senha incorreta, define a mensagem de erro
        $error_message = "Senha incorreta. Tente novamente.";
    }
} else {
    // Requisição inválida, define a mensagem de erro
    $error_message = "Erro ao processar a requisição.";
}

// Agora você pode usar $error_message na parte HTML para exibir a mensagem de erro
?>
