<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

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

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require dirname(__DIR__) . '/config/database.php';

const MAX_TENTATIVAS = 5;
const BLOQUEIO_MINUTOS = 15;

function verificarBloqueio($conexao, $identificador) {
    $stmt = $conexao->prepare(
        "SELECT tentativas, bloqueado_ate FROM tentativas_login WHERE identificador = ?"
    );
    $stmt->bind_param('s', $identificador);
    $stmt->execute();
    $resultado = $stmt->get_result();
    $linha = $resultado->fetch_assoc();
    $stmt->close();

    if (!$linha) return null;

    if ($linha['bloqueado_ate'] && strtotime($linha['bloqueado_ate']) > time()) {
        $segundosRestantes = strtotime($linha['bloqueado_ate']) - time();
        return ceil($segundosRestantes / 60);
    }

    return null;
}

function registrarTentativaFalha($conexao, $identificador) {
    $stmt = $conexao->prepare(
        "INSERT INTO tentativas_login (identificador, tentativas, bloqueado_ate)
         VALUES (?, 1, NULL)
         ON DUPLICATE KEY UPDATE
            tentativas = tentativas + 1,
            bloqueado_ate = CASE
                WHEN tentativas + 1 >= ? THEN DATE_ADD(NOW(), INTERVAL ? MINUTE)
                ELSE NULL
            END"
    );
    $maxTentativas = MAX_TENTATIVAS;
    $minutosBloqueio = BLOQUEIO_MINUTOS;
    $stmt->bind_param('sii', $identificador, $maxTentativas, $minutosBloqueio);
    $stmt->execute();
    $stmt->close();
}

function limparTentativas($conexao, $identificador) {
    $stmt = $conexao->prepare("DELETE FROM tentativas_login WHERE identificador = ?");
    $stmt->bind_param('s', $identificador);
    $stmt->execute();
    $stmt->close();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dados = json_decode(file_get_contents('php://input'), true);

    $email = trim($dados['email'] ?? '');
    $senha = $dados['senha'] ?? '';

    if (empty($email) || empty($senha)) {
        http_response_code(400);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Email e senha são obrigatórios'
        ]);
        exit();
    }

    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'desconhecido';
    $identificadorEmail = 'email:' . strtolower($email);
    $identificadorIp = 'ip:' . $ip;

    // Verifica bloqueio por email OU por IP (o que estiver mais restritivo)
    $minutosEmail = verificarBloqueio($conexao, $identificadorEmail);
    $minutosIp = verificarBloqueio($conexao, $identificadorIp);
    $minutosRestantes = max($minutosEmail ?? 0, $minutosIp ?? 0);

    if ($minutosRestantes > 0) {
        http_response_code(429);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => "Muitas tentativas. Tente novamente em {$minutosRestantes} minuto(s)."
        ]);
        exit();
    }

    $query = "SELECT id, email, senha_hash FROM admins WHERE email = ?";
    $stmt = $conexao->prepare($query);

    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro no servidor']);
        exit();
    }

    $stmt->bind_param('s', $email);
    $stmt->execute();
    $resultado = $stmt->get_result();

    $loginValido = false;

    if ($resultado->num_rows === 1) {
        $admin = $resultado->fetch_assoc();

        if (password_verify($senha, $admin['senha_hash'])) {
            $loginValido = true;

            limparTentativas($conexao, $identificadorEmail);
            limparTentativas($conexao, $identificadorIp);

            session_start();
            $_SESSION['admin_id'] = $admin['id'];
            $_SESSION['admin_email'] = $admin['email'];

            echo json_encode([
                'sucesso' => true,
                'mensagem' => 'Login realizado com sucesso'
            ]);
        }
    }

    if (!$loginValido) {
        registrarTentativaFalha($conexao, $identificadorEmail);
        registrarTentativaFalha($conexao, $identificadorIp);

        http_response_code(401);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Email ou senha inválidos'
        ]);
    }

    $stmt->close();
    $conexao->close();
}
?>