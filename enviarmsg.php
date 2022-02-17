
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>enviarEmail</title>
</head>
<body>

<?php
        use PHPMailer\PHPMailer\PHPMailer;
        use PHPMailer\PHPMailer\SMTP;
        use PHPMailer\PHPMailer\Exception;

        require 'lib/vendor/autoload.php';

      
        $mail = new PHPMailer(true);

        $nome = filter_input(INPUT_POST,"nome",FILTER_SANITIZE_FULL_SPECIAL_CHARS);
        $email = filter_input(INPUT_POST,"email",FILTER_SANITIZE_FULL_SPECIAL_CHARS);
        $msg = filter_input(INPUT_POST,"mensagem",FILTER_SANITIZE_FULL_SPECIAL_CHARS);


//$dados = filter_input_array(INPUT_POST, FILTER_DEFAULT);

        try 
        {
             //Server settings
            $mail->SMTPDebug = SMTP::DEBUG_SERVER;                      //Enable verbose debug output
            $mail->Charset = 'UTF-8';
            $mail->isSMTP();                                            //Send using SMTP
            $mail->Host       = 'smtp.umbler.com';                     //Set the SMTP server to send through
            $mail->SMTPAuth   = true;                                   //Enable SMTP authentication
            $mail->Username   = 'contato@duvid.com.br';                     //SMTP username
            $mail->Password   = '';                               //SMTP password
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;         //Enable TLS encryption; `PHPMailer::ENCRYPTION_SMTPS` encouraged
            $mail->Port       = 587;                                    //TCP port to connect to, use 465 for `PHPMailer::ENCRYPTION_SMTPS` above

                    //Recipients
            $mail->setFrom($email);
            $mail->addAddress('contato@duvid.com.br');     //Add a recipient
                    
            //Attachments
           //$mail->addAttachment('/var/tmp/file.tar.gz');         //Add attachments
            //$mail->addAttachment('/tmp/image.jpg', 'new.jpg');    //Optional name

            //Content
            $mail->isHTML(true);                                  //Set email format to HTML
            //$mail->Subject = 'Assunto do email';
            $mail->Body    = $msg ;
            $mail->AltBody = 'This is the body in plain text for non-HTML mail clients';

            $mail->send();


            echo 'Mensagem enviada com sucesso';

        } 
        
        catch (Exception $e) 
        {
            echo "Mensagem não enviada. Mail Error: {$mail->ErrorInfo}";
        }
?>
    
</body>
</html>