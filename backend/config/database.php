<?php
// Usa $_ENV que é obrigatório para ler variáveis de ambiente no Docker da Railway
$host    = $_ENV['MYSQLHOST']     ?? '127.0.0.1';
$usuario = $_ENV['MYSQLUSER']     ?? 'veleja_user';
$senha   = $_ENV['MYSQLPASSWORD'] ?? 'SenhaSegura123';
$banco   = $_ENV['MYSQLDATABASE'] ?? 'veleja_admin';
$port    = $_ENV['MYSQLPORT']     ?? '3306';

// Conexão incluindo o parâmetro da porta obrigatório para nuvem
$conexao = new mysqli($host, $usuario, $senha, $banco, $port);

if ($conexao->connect_error) {
    header('Content-Type: application/json');
    die(json_encode([
        'sucesso' => false,
        'erro' => 'Erro na conexão com banco de dados: ' . $conexao->connect_error
    ]));
}

mysqli_set_charset($conexao, "utf8");
?>
