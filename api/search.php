<?php
// /main/api/search.php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

$query = $_GET['query'] ?? '';
if (strlen($query) < 2) {
    echo json_encode(['success' => false, 'message' => 'Query too short']);
    exit;
}

try {
    $pdo = getDBConnection();

    // Search users
    $userStmt = $pdo->prepare("
        SELECT username, first_name, last_name, profile_picture 
        FROM users 
        WHERE username LIKE ? OR first_name LIKE ? OR last_name LIKE ? 
        LIMIT 5
    ");
    $userStmt->execute(["%$query%", "%$query%", "%$query%"]);
    $users = $userStmt->fetchAll(PDO::FETCH_ASSOC);

    // Search posts
    $postStmt = $pdo->prepare("
        SELECT id, title, content 
        FROM posts 
        WHERE title LIKE ? OR content LIKE ? 
        LIMIT 5
    ");
    $postStmt->execute(["%$query%", "%$query%"]);
    $posts = $postStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'users' => $users,
        'posts' => $posts
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>