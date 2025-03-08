<?php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$comment_id = $data['comment_id'] ?? null;
$content = $data['content'] ?? null;

if (!$comment_id || !$content) {
    echo json_encode(['success' => false, 'message' => 'Missing fields']);
    exit;
}

$pdo = getDBConnection();
$stmt = $pdo->prepare("UPDATE comments SET content = ? WHERE id = ? AND user_id = ?");
$success = $stmt->execute([$content, $comment_id, $_SESSION['user_id']]);

echo json_encode(['success' => $success]);
?>