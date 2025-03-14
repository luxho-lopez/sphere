<?php
// /main/api/get_followers.php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

$userId = $_GET['user_id'] ?? '';

if (!$userId) {
    echo json_encode(['success' => false, 'message' => 'No user_id provided']);
    exit;
}

try {
    $pdo = getDBConnection();
    $stmt = $pdo->prepare("SELECT COUNT(*) as follower_count FROM followers WHERE following_id = ?");
    $stmt->execute([$userId]);
    $followerCount = $stmt->fetchColumn();

    echo json_encode(['success' => true, 'follower_count' => $followerCount]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>