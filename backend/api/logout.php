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
    'https://veleja-site.vercel.app',
    'https://veleja-site-git-main-veleja.vercel.app',
];

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => '', // deixe vazio, ou defina se usar subdomínio específico
    'secure' => true,      // obrigatório com SameSite=None
    'httponly' => true,
    'samesite' => 'None',  // permite cookie cross-site (Vercel -> Railway)
]);

session_start();

// Destrói todas as variáveis de sessão
$_SESSION = array();

// Se desejar destruir a sessão completamente, delete também o cookie de sessão.
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Destrói a sessão
session_destroy();

echo json_encode([
    'sucesso' => true,
    'mensagem' => 'Sessão encerrada com sucesso'
]);
?>