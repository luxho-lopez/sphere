<?php
// /sphere/api/delete_like.php
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
    echo json_encode(['success' => false, 'message' => 'Invalid post ID']);
    exit;
}

$pdo = getDBConnection();
$stmt = $pdo->prepare("DELETE FROM likes WHERE post_id = ? AND usuario_id = ?");
$success = $stmt->execute([$post_id, $_SESSION['user_id']]);

echo json_encode(['success' => $success]);
?>