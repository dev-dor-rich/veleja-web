<?php
$host = '127.0.0.1';
$usuario = 'root';
$senha = ''; // Se não tem senha, deixe vazio
$banco = 'veleja_admin';

$conexao = new mysqli($host, $usuario, $senha, $banco);

if ($conexao->connect_error) {
    die(json_encode(['erro' => 'Erro na conexão com banco de dados']));
}

mysqli_set_charset($conexao, "utf8");
?>