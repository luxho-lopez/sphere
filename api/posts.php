<?php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

$pdo = getDBConnection();

$query = "
    SELECT p.*, u.first_name, u.last_name, u.profile_picture, 
           (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count,
           EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) AS user_liked
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    WHERE p.status = 'Active'
    ORDER BY p.posted_at DESC
";
$stmt = $pdo->prepare($query);
$stmt->execute([isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 0]);
$posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($posts as &$post) {
    
    $stmt = $pdo->prepare("SELECT url FROM images WHERE post_id = ?");
    $stmt->execute([$post['id']]);
    $post['images'] = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $stmt = $pdo->prepare("
        SELECT c.id, c.content, c.created_at, u.first_name AS user_name, u.id AS user_id
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ?
        ORDER BY c.created_at DESC
    ");
    $stmt->execute([$post['id']]);
    $post['comments'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $post['author'] = [
        'first_name' => $post['first_name'],
        'last_name' => $post['last_name'],
        'profile_picture' => $post['profile_picture'] ?? '/images/profile/default-avatar.png'
    ];
    // Keep user_id at the root level of the post
    unset($post['first_name'], $post['last_name'], $post['profile_picture']);
}

echo json_encode($posts);
?>