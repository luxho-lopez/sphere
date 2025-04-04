<?php
// /main/api/mark_message_read.php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$message_id = $_POST['message_id'] ?? null;
$is_read = $_POST['is_read'] ?? null;

if (!$message_id || !isset($is_read)) {
    echo json_encode(['success' => false, 'message' => 'Missing parameters']);
    exit;
}

try {
    $pdo = getDBConnection();
    $stmt = $pdo->prepare("UPDATE messages SET is_read = ? WHERE id = ? AND receiver_id = ?");
    $stmt->execute([(int)$is_read, $message_id, $_SESSION['user_id']]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Message not found or not updated']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>