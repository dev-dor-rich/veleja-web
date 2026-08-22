<?php
$host    = getenv('MYSQLHOST')     ?: '127.0.0.1';
$usuario = getenv('MYSQLUSER')     ?: 'root';
$senha   = getenv('MYSQLPASSWORD') ?: 'SenhaSegura123';
$banco   = getenv('MYSQLDATABASE') ?: 'railway';
$port    = (int)getenv('MYSQLPORT') ?: 3306;

$conexao = new mysqli($host, $usuario, $senha, $banco, $port);

if ($conexao->connect_error) {
    header('Content-Type: application/json');
    die(json_encode([
        'sucesso' => false,
        'erro' => 'Erro na conexão: ' . $conexao->connect_error
    ]));
}

mysqli_set_charset($conexao, "utf8");
?>