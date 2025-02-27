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
$title = $data['title'] ?? null;
$content = $data['content'] ?? null;
$category_id = $data['category_id'] ?? null;

if (!$post_id || !$title || !$content || !$category_id) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$pdo = getDBConnection();

// Verify that the post belongs to the current user
$stmt = $pdo->prepare("SELECT user_id FROM posts WHERE id = ?");
$stmt->execute([$post_id]);
$post = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$post || $post['user_id'] != $_SESSION['user_id']) {
    echo json_encode(['success' => false, 'message' => 'You do not have permission to edit this post']);
    exit;
}

// Update the post
$stmt = $pdo->prepare("UPDATE posts SET title = ?, content = ?, category_id = ? WHERE id = ?");
$success = $stmt->execute([$title, $content, $category_id, $post_id]);

echo json_encode(['success' => $success]);
?>