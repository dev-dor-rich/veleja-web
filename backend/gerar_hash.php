<?php
// Gere um hash seguro para cada senha
$senha = '8484Richard#'; // Mude isso!
$hash = password_hash($senha, PASSWORD_BCRYPT);
echo "Hash gerado: " . $hash;
?>http://localhost:8000/gerar_hash.php