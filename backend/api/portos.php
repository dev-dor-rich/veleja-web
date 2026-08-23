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

// LISTAR (já traz o nome do município junto, pra facilitar o frontend)
if ($metodo === 'GET') {
    $sql = "SELECT p.id, p.nome, p.municipio_id, p.endereco, p.latitude, p.longitude,
                   p.tipo_estacionamento, p.possui_praca_alimentacao,
                   p.horario_abertura, p.horario_fechamento, m.nome AS municipio_nome
            FROM portos p
            JOIN municipios m ON m.id = p.municipio_id
            ORDER BY p.nome ASC";
    $resultado = $conexao->query($sql);
    $portos = [];
    while ($linha = $resultado->fetch_assoc()) {
        $linha['possui_praca_alimentacao'] = (bool)$linha['possui_praca_alimentacao'];
        $portos[] = $linha;
    }
    echo json_encode(['sucesso' => true, 'dados' => $portos]);
    exit();
}

// CRIAR
if ($metodo === 'POST') {
    $d = json_decode(file_get_contents('php://input'), true);
    $nome = trim($d['nome'] ?? '');
    $municipioId = (int)($d['municipioId'] ?? 0);
    $endereco = trim($d['endereco'] ?? '') ?: null;
    $latitude = isset($d['latitude']) && $d['latitude'] !== '' ? (float)$d['latitude'] : null;
    $longitude = isset($d['longitude']) && $d['longitude'] !== '' ? (float)$d['longitude'] : null;
    $tipoEstacionamento = trim($d['tipoEstacionamento'] ?? '') ?: null;
    $possuiPraca = !empty($d['possuiPracaAlimentacao']) ? 1 : 0;
    $horarioAbertura = trim($d['horarioAbertura'] ?? '') ?: null;
    $horarioFechamento = trim($d['horarioFechamento'] ?? '') ?: null;

    if (empty($nome) || empty($municipioId)) {
        http_response_code(400);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Nome e município são obrigatórios']);
        exit();
    }

    $stmt = $conexao->prepare(
        "INSERT INTO portos (nome, municipio_id, endereco, latitude, longitude, tipo_estacionamento, possui_praca_alimentacao, horario_abertura, horario_fechamento)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->bind_param(
        'sisddsiss',
        $nome, $municipioId, $endereco, $latitude, $longitude, $tipoEstacionamento, $possuiPraca, $horarioAbertura, $horarioFechamento
    );

    if ($stmt->execute()) {
        echo json_encode(['sucesso' => true, 'dados' => ['id' => $conexao->insert_id]]);
    } else {
        http_response_code(500);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao cadastrar porto']);
    }
    $stmt->close();
    exit();
}

// EDITAR
if ($metodo === 'PUT') {
    $d = json_decode(file_get_contents('php://input'), true);
    $id = (int)($d['id'] ?? 0);
    $nome = trim($d['nome'] ?? '');
    $municipioId = (int)($d['municipioId'] ?? 0);
    $endereco = trim($d['endereco'] ?? '') ?: null;
    $latitude = isset($d['latitude']) && $d['latitude'] !== '' ? (float)$d['latitude'] : null;
    $longitude = isset($d['longitude']) && $d['longitude'] !== '' ? (float)$d['longitude'] : null;
    $tipoEstacionamento = trim($d['tipoEstacionamento'] ?? '') ?: null;
    $possuiPraca = !empty($d['possuiPracaAlimentacao']) ? 1 : 0;
    $horarioAbertura = trim($d['horarioAbertura'] ?? '') ?: null;
    $horarioFechamento = trim($d['horarioFechamento'] ?? '') ?: null;

    if (empty($id) || empty($nome) || empty($municipioId)) {
        http_response_code(400);
        echo json_encode(['sucesso' => false, 'mensagem' => 'ID, nome e município são obrigatórios']);
        exit();
    }

    $stmt = $conexao->prepare(
        "UPDATE portos SET nome = ?, municipio_id = ?, endereco = ?, latitude = ?, longitude = ?,
         tipo_estacionamento = ?, possui_praca_alimentacao = ?, horario_abertura = ?, horario_fechamento = ?
         WHERE id = ?"
    );
    $stmt->bind_param(
        'sisddsissi',
        $nome, $municipioId, $endereco, $latitude, $longitude, $tipoEstacionamento, $possuiPraca, $horarioAbertura, $horarioFechamento, $id
    );

    if ($stmt->execute()) {
        echo json_encode(['sucesso' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao editar porto']);
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

    $stmt = $conexao->prepare("DELETE FROM portos WHERE id = ?");
    $stmt->bind_param('i', $id);

    if ($stmt->execute()) {
        echo json_encode(['sucesso' => true]);
    } else {
        http_response_code(409);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Não é possível excluir: porto em uso por alguma viagem']);
    }
    $stmt->close();
    exit();
}

$conexao->close();
?>