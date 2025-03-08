<?php
// /sphere/api/save_comment.php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$post_id = $data['post_id'] ?? null;
$content = $data['content'] ?? null;

if (!$post_id || !$content) {
    echo json_encode(['success' => false, 'message' => 'Invalid data']);
    exit;
}

$pdo = getDBConnection();
$stmt = $pdo->prepare("INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)");
$success = $stmt->execute([$post_id, $_SESSION['user_id'], $content]);

echo json_encode(['success' => $success]);
?>