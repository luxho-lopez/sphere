<?php
// /sphere/api/check_follow.php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$followerId = $_SESSION['user_id'];
$followingId = $_GET['following_id'] ?? '';

if (!$followingId) {
    echo json_encode(['success' => false, 'message' => 'No following_id provided']);
    exit;
}

try {
    $pdo = getDBConnection();
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM followers WHERE follower_id = ? AND following_id = ?");
    $stmt->execute([$followerId, $followingId]);
    $count = $stmt->fetchColumn();

    echo json_encode(['success' => true, 'is_following' => $count > 0]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>