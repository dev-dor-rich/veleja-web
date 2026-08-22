<?php
// Permitir CORS dinamicamente para desenvolvimento local e produção
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'https://veleja.com.br',
    'https://www.veleja.com.br',
    'http://localhost:8000',
];

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}

header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

if (isset($_SESSION['admin_id'])) {
    echo json_encode([
        'autenticado' => true,
        'admin_email' => $_SESSION['admin_email']
    ]);
} else {
    echo json_encode([
        'autenticado' => false,
        'mensagem' => 'Não autenticado'
    ]);
}
?>