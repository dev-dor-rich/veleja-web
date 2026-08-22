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
    'https://veleja-site-git-main-veleja.vercel.app',
];

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}

header('Access-Control-Allow-Methods: POST, OPTIONS, GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=UTF-8');



// Responder a preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ... resto do código

require __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dados = json_decode(file_get_contents('php://input'), true);
    
    $email = $dados['email'] ?? '';
    $senha = $dados['senha'] ?? '';

    if (empty($email) || empty($senha)) {
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Email e senha são obrigatórios'
        ]);
        exit();
    }

    // Buscar admin no banco
    $query = "SELECT id, email, senha_hash FROM admins WHERE email = ?";
    $stmt = $conexao->prepare($query);
    
    if (!$stmt) {
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Erro no servidor'
        ]);
        exit();
    }

    $stmt->bind_param('s', $email);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows === 1) {
        $admin = $resultado->fetch_assoc();

        // Validar senha com hash
        if (password_verify($senha, $admin['senha_hash'])) {
            // Iniciar sessão segura
            session_start();
            $_SESSION['admin_id'] = $admin['id'];
            $_SESSION['admin_email'] = $admin['email'];

            echo json_encode([
                'sucesso' => true,
                'mensagem' => 'Login realizado com sucesso'
            ]);
        } else {
            echo json_encode([
                'sucesso' => false,
                'mensagem' => 'Email ou senha inválidos'
            ]);
        }
    } else {
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Email ou senha inválidos'
        ]);
    }

    $stmt->close();
    $conexao->close();
}
?>