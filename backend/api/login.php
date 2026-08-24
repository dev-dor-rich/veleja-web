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

header('Access-Control-Allow-Methods: POST, OPTIONS, GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=UTF-8');

// Responder a preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require dirname(__DIR__) . '/config/database.php';

// ===== RATE LIMITING =====
function obterIPCliente() {
    if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
        return $_SERVER['HTTP_CF_CONNECTING_IP'];
    }
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        return explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

function verificarRateLimit($conexao, $ip, $email) {
    $agora = time();
    $limite_janela = 900; // 15 minutos
    $max_tentativas = 5;  // máximo 5 tentativas por janela
    
    $timestamp_limite = $agora - $limite_janela;
    
    $query = "SELECT COUNT(*) as tentativas FROM login_attempts 
              WHERE (ip = ? OR email = ?) AND timestamp > ?";
    $stmt = $conexao->prepare($query);
    
    if (!$stmt) {
        return ['bloqueado' => false, 'erro' => true];
    }
    
    $stmt->bind_param('ssi', $ip, $email, $timestamp_limite);
    $stmt->execute();
    $resultado = $stmt->get_result();
    $linha = $resultado->fetch_assoc();
    $tentativas = $linha['tentativas'] ?? 0;
    $stmt->close();
    
    return [
        'bloqueado' => $tentativas >= $max_tentativas,
        'erro' => false,
        'tentativas' => $tentativas
    ];
}

function registrarTentativaLogin($conexao, $ip, $email, $sucesso) {
    $agora = time();
    $query = "INSERT INTO login_attempts (ip, email, timestamp, sucesso) VALUES (?, ?, ?, ?)";
    $stmt = $conexao->prepare($query);
    
    if ($stmt) {
        $sucesso_int = $sucesso ? 1 : 0;
        $stmt->bind_param('ssii', $ip, $email, $agora, $sucesso_int);
        $stmt->execute();
        $stmt->close();
    }
}

// ===== LÓGICA DE LOGIN =====

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $ip = obterIPCliente();
    $dados = json_decode(file_get_contents('php://input'), true);
    
    $email = trim($dados['email'] ?? '');
    $senha = $dados['senha'] ?? '';

    // Validações básicas
    if (empty($email) || empty($senha)) {
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Email e senha são obrigatórios'
        ]);
        exit();
    }

    // Validar formato email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Email inválido'
        ]);
        exit();
    }

    // Verificar rate limiting
    $rate_check = verificarRateLimit($conexao, $ip, $email);
    if ($rate_check['bloqueado']) {
        http_response_code(429);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Muitas tentativas de login. Tente novamente em 15 minutos.'
        ]);
        registrarTentativaLogin($conexao, $ip, $email, false);
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
            // Login bem-sucedido
            registrarTentativaLogin($conexao, $ip, $email, true);
            
            session_set_cookie_params([
                'lifetime' => 0,
                'path' => '/',
                'domain' => '',
                'secure' => true,
                'httponly' => true,
                'samesite' => 'None',
            ]);

            session_start();
            $_SESSION['admin_id'] = $admin['id'];
            $_SESSION['admin_email'] = $admin['email'];

            echo json_encode([
                'sucesso' => true,
                'mensagem' => 'Login realizado com sucesso'
            ]);
        } else {
            // Senha incorreta
            registrarTentativaLogin($conexao, $ip, $email, false);
            
            echo json_encode([
                'sucesso' => false,
                'mensagem' => 'Email ou senha inválidos'
            ]);
        }
    } else {
        // Email não existe
        registrarTentativaLogin($conexao, $ip, $email, false);
        
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Email ou senha inválidos'
        ]);
    }

    $stmt->close();
    $conexao->close();
}
?>