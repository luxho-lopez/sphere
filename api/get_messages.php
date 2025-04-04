<?php
// /main/api/get_messages.php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$userId = $_SESSION['user_id'];
$friendId = $_GET['friend_id'] ?? null;

if (!$friendId) {
    echo json_encode(['success' => false, 'message' => 'Friend ID is required']);
    exit;
}

try {
    $pdo = getDBConnection();
    $stmt = $pdo->prepare(
        "SELECT id, sender_id, receiver_id, content, created_at 
         FROM messages 
         WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) 
         ORDER BY created_at ASC"
    );
    $stmt->execute([$userId, $friendId, $friendId, $userId]);
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'messages' => $messages,
        'total' => count($messages)
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>