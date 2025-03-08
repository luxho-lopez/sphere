<?php
// /sphere/api/get_post.php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

$postId = $_GET['post_id'] ?? '';
if (!$postId) {
    echo json_encode(['success' => false, 'message' => 'No post_id provided']);
    exit;
}

try {
    $pdo = getDBConnection();

    // Fetch post details
    $stmt = $pdo->prepare("
        SELECT p.*, 
               u.username, u.first_name, u.last_name, u.profile_picture,
               (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
               EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) as user_liked
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
    ");
    $stmt->execute([$_SESSION['user_id'] ?? 0, $postId]);
    $post = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$post) {
        echo json_encode(['success' => false, 'message' => 'Post not found']);
        exit;
    }

    // Structure author data
    $author = [
        'username' => $post['username'],
        'first_name' => $post['first_name'],
        'last_name' => $post['last_name'],
        'profile_picture' => $post['profile_picture']
    ];

    // Remove flat author fields from post
    unset($post['username'], $post['first_name'], $post['last_name'], $post['profile_picture']);

    // Fetch images manually
    $imageStmt = $pdo->prepare("SELECT url FROM images WHERE post_id = ?");
    $imageStmt->execute([$postId]);
    $images = $imageStmt->fetchAll(PDO::FETCH_COLUMN, 0);

    // Fetch comments
    $commentStmt = $pdo->prepare("
        SELECT c.id, c.content, c.created_at, u.username, u.id as user_id
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
    ");
    $commentStmt->execute([$postId]);
    $comments = $commentStmt->fetchAll(PDO::FETCH_ASSOC);

    // Add structured data to post
    $post['author'] = $author;
    $post['images'] = $images;
    $post['comments'] = $comments;

    echo json_encode(['success' => true, 'post' => $post]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>