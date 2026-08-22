<?php
// Carregar variáveis do .env
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}

// Tenta ler de $_ENV, depois de $_SERVER, depois fallback
$host    = $_ENV['MYSQLHOST']     ?? $_SERVER['MYSQLHOST']     ?? 'mysql.railway.internal';
$usuario = $_ENV['MYSQLUSER']     ?? $_SERVER['MYSQLUSER']     ?? 'root';
$senha   = $_ENV['MYSQLPASSWORD'] ?? $_SERVER['MYSQLPASSWORD'] ?? '';
$banco   = $_ENV['MYSQLDATABASE'] ?? $_SERVER['MYSQLDATABASE'] ?? 'railway';
$port    = (int)($_ENV['MYSQLPORT'] ?? $_SERVER['MYSQLPORT'] ?? 3306);


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