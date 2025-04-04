<?php
// /main/api/get_friends.php
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
    $stmt = $pdo->prepare(
        "SELECT u.id, u.username, u.first_name, u.last_name, u.profile_picture 
         FROM users u
         INNER JOIN followers f ON (u.id = f.following_id AND f.follower_id = ?) 
         OR (u.id = f.follower_id AND f.following_id = ?)
         WHERE u.id != ?"
    );
    $stmt->execute([$userId, $userId, $userId]);
    $friends = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'friends' => $friends]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>