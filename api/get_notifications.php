<?php
// /sphere/api/get_notifications.php
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
    $stmt = $pdo->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$userId]);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Agregar el campo "type" a cada notificación
    $notifications = array_map(function($notif) {
        if (strpos($notif['message'], 'te está siguiendo') !== false) {
            $notif['type'] = 'follow';
        } else {
            $notif['type'] = 'post';
        }
        return $notif;
    }, $notifications);

    echo json_encode(['success' => true, 'notifications' => $notifications]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>