<?php
// /main/api/check_mutual_follow.php
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
    $stmt1 = $pdo->prepare("SELECT COUNT(*) FROM followers WHERE follower_id = ? AND following_id = ?");
    $stmt1->execute([$followerId, $followingId]);
    $followsOther = $stmt1->fetchColumn() > 0;

    $stmt2 = $pdo->prepare("SELECT COUNT(*) FROM followers WHERE follower_id = ? AND following_id = ?");
    $stmt2->execute([$followingId, $followerId]);
    $isFollowedBack = $stmt2->fetchColumn() > 0;

    $isMutual = $followsOther && $isFollowedBack;

    echo json_encode(['success' => true, 'is_mutual' => $isMutual]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>