<?php
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

function buscarServicosDoBarco($conexao, $barcoId) {
    $stmt = $conexao->prepare(
        "SELECT s.nome FROM servicos s
         JOIN barco_servicos bs ON bs.servico_id = s.id
         WHERE bs.barco_id = ?"
    );
    $stmt->bind_param('i', $barcoId);
    $stmt->execute();
    $resultado = $stmt->get_result();
    $servicos = [];
    while ($linha = $resultado->fetch_assoc()) {
        $servicos[] = $linha['nome'];
    }
    $stmt->close();
    return $servicos;
}

function salvarServicosDoBarco($conexao, $barcoId, $nomesServicos) {
    $stmt = $conexao->prepare("DELETE FROM barco_servicos WHERE barco_id = ?");
    $stmt->bind_param('i', $barcoId);
    $stmt->execute();
    $stmt->close();

    if (empty($nomesServicos)) return;

    $stmt = $conexao->prepare(
        "INSERT INTO barco_servicos (barco_id, servico_id)
         SELECT ?, id FROM servicos WHERE nome = ?"
    );
    foreach ($nomesServicos as $nomeServico) {
        $stmt->bind_param('is', $barcoId, $nomeServico);
        $stmt->execute();
    }
    $stmt->close();
}

// LISTAR
if ($metodo === 'GET') {
    $resultado = $conexao->query("SELECT id, nome, capacidade_maxima, horario_partida, foto_url FROM barcos ORDER BY nome ASC");
    $barcos = [];
    while ($linha = $resultado->fetch_assoc()) {
        $linha['servicos'] = buscarServicosDoBarco($conexao, $linha['id']);
        $barcos[] = $linha;
    }
    echo json_encode(['sucesso' => true, 'dados' => $barcos]);
    exit();
}

// CRIAR
if ($metodo === 'POST') {
    $d = json_decode(file_get_contents('php://input'), true);
    $nome = trim($d['nome'] ?? '');
    $capacidade = (int)($d['capacidadeMaxima'] ?? 0);
    $horarioPartida = trim($d['horarioPartida'] ?? '') ?: null;
    $fotoUrl = $d['fotoUrl'] ?? null;
    $servicos = $d['servicos'] ?? [];

    if (empty($nome) || empty($capacidade)) {
        http_response_code(400);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Nome e capacidade são obrigatórios']);
        exit();
    }

    $stmt = $conexao->prepare(
        "INSERT INTO barcos (nome, capacidade_maxima, horario_partida, foto_url) VALUES (?, ?, ?, ?)"
    );
    $stmt->bind_param('siss', $nome, $capacidade, $horarioPartida, $fotoUrl);

    if ($stmt->execute()) {
        $barcoId = $conexao->insert_id;
        salvarServicosDoBarco($conexao, $barcoId, $servicos);
        echo json_encode(['sucesso' => true, 'dados' => ['id' => $barcoId]]);
    } else {
        http_response_code(500);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao cadastrar barco']);
    }
    $stmt->close();
    exit();
}

// EDITAR
if ($metodo === 'PUT') {
    $d = json_decode(file_get_contents('php://input'), true);
    $id = (int)($d['id'] ?? 0);
    $nome = trim($d['nome'] ?? '');
    $capacidade = (int)($d['capacidadeMaxima'] ?? 0);
    $horarioPartida = trim($d['horarioPartida'] ?? '') ?: null;
    $fotoUrl = $d['fotoUrl'] ?? null;
    $servicos = $d['servicos'] ?? [];

    if (empty($id) || empty($nome) || empty($capacidade)) {
        http_response_code(400);
        echo json_encode(['sucesso' => false, 'mensagem' => 'ID, nome e capacidade são obrigatórios']);
        exit();
    }

    $stmt = $conexao->prepare(
        "UPDATE barcos SET nome = ?, capacidade_maxima = ?, horario_partida = ?, foto_url = ? WHERE id = ?"
    );
    $stmt->bind_param('sissi', $nome, $capacidade, $horarioPartida, $fotoUrl, $id);

    if ($stmt->execute()) {
        salvarServicosDoBarco($conexao, $id, $servicos);
        echo json_encode(['sucesso' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao editar barco']);
    }
    $stmt->close();
    exit();
}

// EXCLUIR
if ($metodo === 'DELETE') {
    $d = json_decode(file_get_contents('php://input'), true);
    $id = (int)($d['id'] ?? 0);

    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['sucesso' => false, 'mensagem' => 'ID é obrigatório']);
        exit();
    }

    $stmt = $conexao->prepare("DELETE FROM barcos WHERE id = ?");
    $stmt->bind_param('i', $id);

    if ($stmt->execute()) {
        echo json_encode(['sucesso' => true]);
    } else {
        http_response_code(409);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Não é possível excluir: barco em uso por alguma viagem']);
    }
    $stmt->close();
    exit();
}

$conexao->close();
?>