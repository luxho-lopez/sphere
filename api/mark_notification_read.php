<?php
header('Content-Type: application/json');
require_once 'config.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$notificationId = $data['notification_id'] ?? null;
$isRead = isset($data['is_read']) ? (int)$data['is_read'] : null;

if (!$notificationId || !isset($isRead) || !in_array($isRead, [0, 1])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing or invalid notification_id or is_read']);
    exit;
}

try {
    $pdo = getDBConnection();
    $userId = $_SESSION['user_id'];

    $stmt = $pdo->prepare("
        UPDATE notifications 
        SET is_read = ? 
        WHERE id = ? AND user_id = ?
    ");
    $stmt->execute([$isRead, $notificationId, $userId]);
    
    $affectedRows = $stmt->rowCount();
    
    if ($affectedRows > 0) {
        echo json_encode([
            'success' => true,
            'message' => $isRead ? 'Notification marked as read' : 'Notification marked as unread'
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Notification not found or not authorized']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>