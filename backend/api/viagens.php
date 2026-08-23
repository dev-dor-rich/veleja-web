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

function buscarParadas($conexao, $viagemId) {
    $stmt = $conexao->prepare(
        "SELECT porto_id FROM viagem_paradas WHERE viagem_id = ? ORDER BY ordem ASC"
    );
    $stmt->bind_param('i', $viagemId);
    $stmt->execute();
    $resultado = $stmt->get_result();
    $paradas = [];
    while ($linha = $resultado->fetch_assoc()) {
        $paradas[] = ['portoId' => (int)$linha['porto_id']];
    }
    $stmt->close();
    return $paradas;
}

function salvarParadas($conexao, $viagemId, $paradas) {
    $stmt = $conexao->prepare("DELETE FROM viagem_paradas WHERE viagem_id = ?");
    $stmt->bind_param('i', $viagemId);
    $stmt->execute();
    $stmt->close();

    if (empty($paradas)) return;

    $stmt = $conexao->prepare(
        "INSERT INTO viagem_paradas (viagem_id, porto_id, ordem) VALUES (?, ?, ?)"
    );
    $ordem = 0;
    foreach ($paradas as $parada) {
        $portoId = (int)($parada['portoId'] ?? 0);
        if (empty($portoId)) continue;
        $stmt->bind_param('iii', $viagemId, $portoId, $ordem);
        $stmt->execute();
        $ordem++;
    }
    $stmt->close();
}

// LISTAR
if ($metodo === 'GET') {
    $resultado = $conexao->query(
        "SELECT id, barco_id, porto_saida_id, horario_partida, porto_chegada_id,
                horario_chegada, data_viagem, status
         FROM viagens ORDER BY data_viagem DESC, id DESC"
    );
    $viagens = [];
    while ($linha = $resultado->fetch_assoc()) {
        $viagens[] = [
            'id' => (int)$linha['id'],
            'barcoId' => (int)$linha['barco_id'],
            'portoSaidaId' => (int)$linha['porto_saida_id'],
            'horarioPartida' => $linha['horario_partida'],
            'portoChegadaId' => (int)$linha['porto_chegada_id'],
            'horarioChegada' => $linha['horario_chegada'],
            'dataViagem' => $linha['data_viagem'],
            'status' => $linha['status'],
            'paradas' => buscarParadas($conexao, $linha['id']),
        ];
    }
    echo json_encode(['sucesso' => true, 'dados' => $viagens]);
    exit();
}

// CRIAR
if ($metodo === 'POST') {
    $d = json_decode(file_get_contents('php://input'), true);

    $barcoId = (int)($d['barcoId'] ?? 0);
    $portoSaidaId = (int)($d['portoSaidaId'] ?? 0);
    $horarioPartida = trim($d['horarioPartida'] ?? '') ?: null;
    $portoChegadaId = (int)($d['portoChegadaId'] ?? 0);
    $horarioChegada = trim($d['horarioChegada'] ?? '') ?: null;
    $dataViagem = trim($d['dataViagem'] ?? '');
    $status = trim($d['status'] ?? 'a-confirmar');
    $paradas = $d['paradas'] ?? [];

    if (empty($barcoId) || empty($portoSaidaId) || empty($portoChegadaId) || empty($dataViagem)) {
        http_response_code(400);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Barco, portos e data são obrigatórios']);
        exit();
    }

    $stmt = $conexao->prepare(
        "INSERT INTO viagens (barco_id, porto_saida_id, horario_partida, porto_chegada_id, horario_chegada, data_viagem, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->bind_param('iisisss', $barcoId, $portoSaidaId, $horarioPartida, $portoChegadaId, $horarioChegada, $dataViagem, $status);

    if ($stmt->execute()) {
        $viagemId = $conexao->insert_id;
        salvarParadas($conexao, $viagemId, $paradas);
        echo json_encode(['sucesso' => true, 'dados' => ['id' => $viagemId]]);
    } else {
        http_response_code(500);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao cadastrar viagem']);
    }
    $stmt->close();
    exit();
}

// EDITAR (edição completa OU alteração rápida de status)
if ($metodo === 'PUT') {
    $d = json_decode(file_get_contents('php://input'), true);
    $id = (int)($d['id'] ?? 0);

    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['sucesso' => false, 'mensagem' => 'ID é obrigatório']);
        exit();
    }

    // Alteração rápida: só status, sem os outros campos
    if (isset($d['somenteStatus']) && $d['somenteStatus'] === true) {
        $status = trim($d['status'] ?? '');
        if (empty($status)) {
            http_response_code(400);
            echo json_encode(['sucesso' => false, 'mensagem' => 'Status é obrigatório']);
            exit();
        }
        $stmt = $conexao->prepare("UPDATE viagens SET status = ? WHERE id = ?");
        $stmt->bind_param('si', $status, $id);
        $stmt->execute();
        $stmt->close();
        echo json_encode(['sucesso' => true]);
        exit();
    }

    // Edição completa
    $barcoId = (int)($d['barcoId'] ?? 0);
    $portoSaidaId = (int)($d['portoSaidaId'] ?? 0);
    $horarioPartida = trim($d['horarioPartida'] ?? '') ?: null;
    $portoChegadaId = (int)($d['portoChegadaId'] ?? 0);
    $horarioChegada = trim($d['horarioChegada'] ?? '') ?: null;
    $dataViagem = trim($d['dataViagem'] ?? '');
    $status = trim($d['status'] ?? 'a-confirmar');
    $paradas = $d['paradas'] ?? [];

    if (empty($barcoId) || empty($portoSaidaId) || empty($portoChegadaId) || empty($dataViagem)) {
        http_response_code(400);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Barco, portos e data são obrigatórios']);
        exit();
    }

    $stmt = $conexao->prepare(
        "UPDATE viagens SET barco_id = ?, porto_saida_id = ?, horario_partida = ?,
         porto_chegada_id = ?, horario_chegada = ?, data_viagem = ?, status = ? WHERE id = ?"
    );
    $stmt->bind_param('iisissi', $barcoId, $portoSaidaId, $horarioPartida, $portoChegadaId, $horarioChegada, $dataViagem, $status);
    // nota: 'i' 'i' 's' 'i' 's' 's' 's' 'i' -> ajustar tipos abaixo

    if ($stmt->execute()) {
        salvarParadas($conexao, $id, $paradas);
        echo json_encode(['sucesso' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao editar viagem']);
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

    $stmt = $conexao->prepare("DELETE FROM viagens WHERE id = ?");
    $stmt->bind_param('i', $id);

    if ($stmt->execute()) {
        echo json_encode(['sucesso' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao excluir viagem']);
    }
    $stmt->close();
    exit();
}

$conexao->close();
?>