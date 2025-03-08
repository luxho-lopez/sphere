<?php
// /sphere/api/follow.php
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

if (!$followingId || $followerId == $followingId) {
    echo json_encode(['success' => false, 'message' => 'Invalid or same user ID']);
    ob_end_flush();
    exit;
}

try {
    $pdo = getDBConnection();

    // Insertar el seguimiento
    $stmt = $pdo->prepare("INSERT IGNORE INTO followers (follower_id, following_id) VALUES (?, ?)");
    $stmt->execute([$followerId, $followingId]);

    // Obtener el nombre de usuario del seguidor
    $stmt = $pdo->prepare("SELECT username FROM users WHERE id = ?");
    $stmt->execute([$followerId]);
    $followerUsername = $stmt->fetchColumn();

    // Crear el mensaje de la notificación
    $notificationMessage = "¡Nuevo seguidor! @{$followerUsername} te está siguiendo.";

    // Insertar la notificación en la base de datos
    $stmt = $pdo->prepare("INSERT INTO notifications (user_id, message, reference) VALUES (?, ?, ?)");
    $stmt->execute([$followingId, $notificationMessage, $followerUsername]);

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    error_log("Follow error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

ob_end_flush();
?>