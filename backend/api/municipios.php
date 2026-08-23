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

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require dirname(__DIR__) . '/config/database.php';

$metodo = $_SERVER['REQUEST_METHOD'];

// LISTAR
if ($metodo === 'GET') {
    $resultado = $conexao->query("SELECT id, nome FROM municipios ORDER BY nome ASC");
    $municipios = [];
    while ($linha = $resultado->fetch_assoc()) {
        $municipios[] = $linha;
    }
    echo json_encode(['sucesso' => true, 'dados' => $municipios]);
    exit();
}

// CRIAR
if ($metodo === 'POST') {
    $dados = json_decode(file_get_contents('php://input'), true);
    $nome = trim($dados['nome'] ?? '');

    if (empty($nome)) {
        http_response_code(400);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Nome é obrigatório']);
        exit();
    }

    $stmt = $conexao->prepare("INSERT INTO municipios (nome) VALUES (?)");
    $stmt->bind_param('s', $nome);

    if ($stmt->execute()) {
        echo json_encode([
            'sucesso' => true,
            'dados' => ['id' => $conexao->insert_id, 'nome' => $nome]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao cadastrar']);
    }
    $stmt->close();
    exit();
}

// EDITAR
if ($metodo === 'PUT') {
    $dados = json_decode(file_get_contents('php://input'), true);
    $id = (int)($dados['id'] ?? 0);
    $nome = trim($dados['nome'] ?? '');

    if (empty($id) || empty($nome)) {
        http_response_code(400);
        echo json_encode(['sucesso' => false, 'mensagem' => 'ID e nome são obrigatórios']);
        exit();
    }

    $stmt = $conexao->prepare("UPDATE municipios SET nome = ? WHERE id = ?");
    $stmt->bind_param('si', $nome, $id);

    if ($stmt->execute()) {
        echo json_encode(['sucesso' => true, 'dados' => ['id' => $id, 'nome' => $nome]]);
    } else {
        http_response_code(500);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao editar']);
    }
    $stmt->close();
    exit();
}

// EXCLUIR
if ($metodo === 'DELETE') {
    $dados = json_decode(file_get_contents('php://input'), true);
    $id = (int)($dados['id'] ?? 0);

    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['sucesso' => false, 'mensagem' => 'ID é obrigatório']);
        exit();
    }

    $stmt = $conexao->prepare("DELETE FROM municipios WHERE id = ?");
    $stmt->bind_param('i', $id);

    if ($stmt->execute()) {
        echo json_encode(['sucesso' => true]);
    } else {
        // Erro comum aqui: FOREIGN KEY constraint (município usado em algum porto)
        http_response_code(409);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Não é possível excluir: município em uso por algum porto']);
    }
    $stmt->close();
    exit();
}

$conexao->close();
?>