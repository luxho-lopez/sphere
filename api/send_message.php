<?php
// /main/api/send_message.php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$senderId = $_SESSION['user_id'];
$receiverId = $_POST['receiver_id'] ?? null;
$content = trim($_POST['content'] ?? '');

if (!$receiverId || !$content) {
    echo json_encode(['success' => false, 'message' => 'Receiver ID and content are required']);
    exit;
}

try {
    $pdo = getDBConnection();
    $stmt = $pdo->prepare(
        "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)"
    );
    $stmt->execute([$senderId, $receiverId, $content]);

    // Obtener el mensaje recién insertado
    $messageId = $pdo->lastInsertId();
    $stmt = $pdo->prepare(
        "SELECT m.*, u1.username AS sender_username, u2.username AS receiver_username 
         FROM messages m
         LEFT JOIN users u1 ON m.sender_id = u1.id
         LEFT JOIN users u2 ON m.receiver_id = u2.id
         WHERE m.id = ?"
    );
    $stmt->execute([$messageId]);
    $message = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'message' => $message]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>