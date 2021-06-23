


<?php
$name = filter_input(INPUT_POST,"nome",FILTER_SANITIZE_STRING);
//pega os dados que foi digitado no ID name.

$email = filter_input(INPUT_POST,"email",FILTER_SANITIZE_STRING);
//pega os dados que foi digitado no ID email.

//$subject = $_POST['subject'];
//pega os dados que foi digitado no ID sebject.

$message = filter_input(INPUT_POST,"mensagem",FILTER_SANITIZE_STRING);
//pega os dados que foi digitado no ID message.
$myEmail = "contato@duvid.com.br";//é necessário informar um e-mail do próprio domínio
$headers = "From: $myEmail\r\n";
$headers .= "Reply-To: $email\r\n";

/*abaixo contém os dados que serão enviados para o email
cadastrado para receber o formulário*/

$corpo = "Formulário enviado\n\n\n";
$corpo .= "Nome: " . $name . "\n\n\n";
$corpo .= "Email: " . $email . "\n\n\n";
$corpo .= "Comentários: " . $message . "\n\n\n";

$email_to = 'contato@duvid.com.br';
//não esqueça de substituir este email pelo seu.

$status = mail($email_to,  $corpo, $headers);
//enviando o email.

if ($status) {
  echo "Mensagem enviada com sucesso!";
  
  
//mensagem de form enviado com sucesso.

} else {
  echo "Falha ao enviar o Formulário.";
  
//mensagem de erro no envio. 

}
?>