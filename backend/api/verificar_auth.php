<?php
header('Access-Control-Allow-Origin: https://veleja.com.br'); // Mude aqui
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ... resto do código

echo json_encode([
    'autenticado' => true,
    'admin_email' => $_SESSION['admin_email']
]);
?>