<?php
//Import the PHPMailer class into the global namespace
require("PHPMailer/PHPMailer.php");
require("PHPMailer/SMTP.php");
require("PHPMailer/Exception.php");
require 'lib/vendor/autoload.php';

$mail = new PHPMailer();

$nome = filter_input(INPUT_POST,"nome",FILTER_SANITIZE_STRING);
$email = filter_input(INPUT_POST,"email",FILTER_SANITIZE_STRING);
$msg = filter_input(INPUT_POST,"mensagem",FILTER_SANITIZE_STRING);

// Define que a mensagem será SMTP
$mail->IsSMTP();

// Host do servidor SMTP externo, como o SendGrid.
$mail->Host = "smtp.umbler.com";

// Autenticação | True
$mail->SMTPAuth = true;

// Usuário do servidor SMTP
$mail->Username = 'contato@duvid.com.br';

// Senha da caixa postal utilizada
$mail->Password = 'Vxdzba09@';

$mail->From = $email ;
$mail->FromName = $nome;
$mail->AddAddress('contato@duvid.com.br', $nome);

// Define que o e-mail será enviado como HTML | True
$mail->IsHTML(true);

// Charset da mensagem (opcional)
$mail->CharSet = 'iso-8859-1';

// Assunto da mensagem
//$mail->Subject = "Mensagem Teste";

// Conteúdo no corpo da mensagem
$mail->Body = $msg;

// Conteúdo no corpo da mensagem(texto plano)
$mail->AltBody = 'Conteudo da mensagem em texto plano';

//Envio da Mensagem
$enviado = $mail->Send();

$mail->ClearAllRecipients();

if ($enviado) {
  echo "E-mail enviado com sucesso!";
} else {
  echo "Não foi possível enviar o e-mail.";
  echo "Motivo do erro: " . $mail->ErrorInfo;
}
?>