<?php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$post_id = $data['post_id'] ?? null;
$titulo = $data['titulo'] ?? null;
$contenido = $data['contenido'] ?? null;
$categoria_id = $data['categoria_id'] ?? null;

if (!$post_id || !$titulo || !$contenido || !$categoria_id) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$pdo = getDBConnection();

// Verificar que el post pertenece al usuario actual
$stmt = $pdo->prepare("SELECT usuario_id FROM posts WHERE id = ?");
$stmt->execute([$post_id]);
$post = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$post || $post['usuario_id'] != $_SESSION['user_id']) {
    echo json_encode(['success' => false, 'message' => 'You do not have permission to edit this post']);
    exit;
}

// Actualizar el post
$stmt = $pdo->prepare("UPDATE posts SET titulo = ?, contenido = ?, categoria_id = ? WHERE id = ?");
$success = $stmt->execute([$titulo, $contenido, $categoria_id, $post_id]);

echo json_encode(['success' => $success]);
?>