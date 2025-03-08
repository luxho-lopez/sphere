<?php
header('Content-Type: application/json');
require_once 'config.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    $pdo = getDBConnection();
    $userId = $_SESSION['user_id'];

    $stmt = $pdo->prepare("
        SELECT id, message, is_read, created_at 
        FROM notifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 50
    ");
    $stmt->execute([$userId]);
    $notifications = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'notifications' => array_map(function($notif) {
            return [
                'id' => $notif['id'],
                'message' => $notif['message'],
                'is_read' => (bool)$notif['is_read'],
                'timestamp' => $notif['created_at']
            ];
        }, $notifications)
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>