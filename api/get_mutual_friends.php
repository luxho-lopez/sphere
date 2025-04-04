<?php
// /main/api/get_mutual_friends.php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$userId = $_SESSION['user_id'];

try {
    $pdo = getDBConnection();
    $stmt = $pdo->prepare("
        SELECT u.id, u.username, u.first_name, u.last_name, u.profile_picture
        FROM users u
        INNER JOIN followers f1 ON u.id = f1.following_id AND f1.follower_id = ?
        INNER JOIN followers f2 ON u.id = f2.follower_id AND f2.following_id = ?
    ");
    $stmt->execute([$userId, $userId]);
    $friends = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'friends' => $friends]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>