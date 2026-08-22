<?php
// Gere um hash seguro para cada senha
$senha = '8484Richard#'; 
$hash = password_hash($senha, PASSWORD_BCRYPT);
echo "Hash gerado: " . $hash;

// O link abaixo agora é um comentário (o PHP vai ignorar ele)
// http://localhost:8000/gerar_hash.php
?>
