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

if (!$post_id) {
    echo json_encode(['success' => false, 'message' => 'Missing post_id']);
    exit;
}

$pdo = getDBConnection();

// Verificar que el post pertenece al usuario actual
$stmt = $pdo->prepare("SELECT usuario_id FROM posts WHERE id = ?");
$stmt->execute([$post_id]);
$post = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$post || $post['usuario_id'] != $_SESSION['user_id']) {
    echo json_encode(['success' => false, 'message' => 'You do not have permission to delete this post']);
    exit;
}

// Eliminar el post (las imágenes y comentarios se eliminarán por CASCADE en la BD)
$stmt = $pdo->prepare("DELETE FROM posts WHERE id = ?");
$success = $stmt->execute([$post_id]);

echo json_encode(['success' => $success]);
?>