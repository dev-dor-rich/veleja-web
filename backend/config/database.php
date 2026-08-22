<?php
// Tenta ler de $_ENV, depois de $_SERVER, depois fallback
$host    = $_ENV['MYSQLHOST']     ?? $_SERVER['MYSQLHOST']     ?? 'mysql.railway.internal';
$usuario = $_ENV['MYSQLUSER']     ?? $_SERVER['MYSQLUSER']     ?? 'root';
$senha   = $_ENV['MYSQLPASSWORD'] ?? $_SERVER['MYSQLPASSWORD'] ?? '';
$banco   = $_ENV['MYSQLDATABASE'] ?? $_SERVER['MYSQLDATABASE'] ?? 'railway';
$port    = (int)($_ENV['MYSQLPORT'] ?? $_SERVER['MYSQLPORT'] ?? 3306);

// Debug (remove depois)
error_log("Host: $host, User: $usuario, Port: $port, DB: $banco");

$conexao = new mysqli($host, $usuario, $senha, $banco, $port);

if ($conexao->connect_error) {
    header('Content-Type: application/json');
    http_response_code(500);
    die(json_encode([
        'sucesso' => false,
        'erro' => 'Erro na conexão: ' . $conexao->connect_error
    ]));
}

mysqli_set_charset($conexao, "utf8");
?>