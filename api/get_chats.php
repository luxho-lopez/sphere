<?php
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
    $stmt = $pdo->prepare(
        "SELECT 
            u.id AS friend_id,
            u.username,
            u.profile_picture,
            m.id AS message_id,
            m.sender_id,
            m.content AS last_message,
            m.is_read,
            m.created_at
        FROM users u
        INNER JOIN (
            SELECT 
                CASE 
                    WHEN sender_id = ? THEN receiver_id 
                    ELSE sender_id 
                END AS friend_id,
                MAX(id) AS max_id
            FROM messages
            WHERE sender_id = ? OR receiver_id = ?
            GROUP BY friend_id
        ) latest ON u.id = latest.friend_id
        INNER JOIN messages m ON m.id = latest.max_id
        ORDER BY m.created_at DESC"
    );
    $stmt->execute([$userId, $userId, $userId]);
    $chats = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'chats' => $chats]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>