<?php
// /sphere/api/unfollow.php
session_start();
header('Content-Type: application/json');

ob_start();
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    ob_end_flush();
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$followerId = $_SESSION['user_id'];
$followingId = $input['following_id'] ?? '';

if (!$followingId) {
    echo json_encode(['success' => false, 'message' => 'Invalid user ID']);
    ob_end_flush();
    exit;
}

try {
    $pdo = getDBConnection();
    $stmt = $pdo->prepare("DELETE FROM followers WHERE follower_id = ? AND following_id = ?");
    $stmt->execute([$followerId, $followingId]);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    error_log("Unfollow error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

ob_end_flush();
?>