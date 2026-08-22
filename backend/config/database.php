<?php
// Se existirem variáveis na nuvem (Vercel), ele usa. Se não, usa as do seu Ubuntu local.
$host = getenv('MYSQLHOST') ?: '127.0.0.1';
$usuario = getenv('MYSQLUSER') ?: 'veleja_user';
$senha = getenv('MYSQLPASSWORD') ?: 'SenhaSegura123';
$banco = getenv('MYSQLDATABASE') ?: 'veleja_admin';
$port = getenv('MYSQLPORT') ?: '3306';

// Conexão incluindo o parâmetro da porta obrigatório para nuvem
$conexao = new mysqli($host, $usuario, $senha, $banco, $port);

if ($conexao->connect_error) {
    die(json_encode(['erro' => 'Erro na conexão com banco de dados']));
}

mysqli_set_charset($conexao, "utf8");
?>
