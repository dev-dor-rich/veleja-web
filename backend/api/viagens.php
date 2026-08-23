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
    $stmt = $conexao->prepare("SELECT id, porto_id as portoId FROM viagem_paradas WHERE viagem_id = ? ORDER BY ordem ASC");
    $stmt->bind_param('i', $viagemId);
    $stmt->execute();
    $res = $stmt->get_result();
    $paradas = [];
    while ($p = $res->fetch_assoc()) {
        $paradas[] = $p;
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

    $stmt = $conexao->prepare("INSERT INTO viagem_paradas (viagem_id, porto_id, ordem) VALUES (?, ?, ?)");
    foreach ($paradas as $ordem => $parada) {
        $portoId = (int)($parada['portoId'] ?? 0);
        if ($portoId > 0) {
            $stmt->bind_param('iii', $viagemId, $portoId, $ordem);
            $stmt->execute();
        }
    }
    $stmt->close();
}

// LISTAR VIAGENS
if ($metodo === 'GET') {
    $sql = "SELECT id, barco_id as barcoId, porto_saida_id as portoSaidaId, horario_partida as horarioPartida,
                   porto_chegada_id as portoChegadaId, horario_chegada as horarioChegada,
                   data_viagem as dataViagem, status FROM viagens ORDER BY data_viagem DESC";
    
    $resultado = $conexao->query($sql);
    $viagens = [];
    while ($v = $resultado->fetch_assoc()) {
        $v['paradas'] = buscarParadas($conexao, $v['id']);
        $viagens[] = $v;
    }
    echo json_encode(['sucesso' => true, 'dados' => $viagens]);
    exit();
}

// CRIAR VIAGEM
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

    if (!$barcoId || !$portoSaidaId || !$portoChegadaId || empty($dataViagem)) {
        http_response_code(400);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Dados obrigatórios faltando']);
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
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao salvar viagem no banco']);
    }
    $stmt->close();
    exit();
}

// EDITAR VIAGEM / ALTERAR STATUS
if ($metodo === 'PUT') {
    $d = json_decode(file_get_contents('php://input'), true);
    $id = (int)($d['id'] ?? 0);

    if (!$id) {
        http_response_code(400);
        echo json_encode(['sucesso' => false, 'mensagem' => 'ID da viagem é obrigatório']);
        exit();
    }

    if (!empty($d['somenteStatus'])) {
        $status = trim($d['status'] ?? 'a-confirmar');
        $stmt = $conexao->prepare("UPDATE viagens SET status = ? WHERE id = ?");
        $stmt->bind_param('si', $status, $id);
        if ($stmt->execute()) {
            echo json_encode(['sucesso' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao alterar status']);
        }
        $stmt->close();
        exit();
    }

    $barcoId = (int)($d['barcoId'] ?? 0);
    $portoSaidaId = (int)($d['portoSaidaId'] ?? 0);
    $horarioPartida = trim($d['horarioPartida'] ?? '') ?: null;
    $portoChegadaId = (int)($d['portoChegadaId'] ?? 0);
    $horarioChegada = trim($d['horarioChegada'] ?? '') ?: null;
    $dataViagem = trim($d['dataViagem'] ?? '');
    $status = trim($d['status'] ?? 'a-confirmar');
    $paradas = $d['paradas'] ?? [];

    $stmt = $conexao->prepare(
        "UPDATE viagens SET barco_id = ?, porto_saida_id = ?, horario_partida = ?, porto_chegada_id = ?, horario_chegada = ?, data_viagem = ?, status = ? WHERE id = ?"
    );
    $stmt->bind_param('iisisssi', $barcoId, $portoSaidaId, $horarioPartida, $portoChegadaId, $horarioChegada, $dataViagem, $status, $id);

    if ($stmt->execute()) {
        salvarParadas($conexao, $id, $paradas);
        echo json_encode(['sucesso' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao atualizar viagem']);
    }
    $stmt->close();
    exit();
}

// EXCLUIR VIAGEM
if ($metodo === 'DELETE') {
    $d = json_decode(file_get_contents('php://input'), true);
    $id = (int)($d['id'] ?? 0);

    if (!$id) {
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