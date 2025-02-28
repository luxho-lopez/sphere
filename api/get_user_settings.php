<?php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    $pdo = getDBConnection();
    $stmt = $pdo->prepare("
        SELECT email, phone, username, first_name, last_name, profile_picture 
        FROM users 
        WHERE id = ? AND status = 'active'
    ");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo json_encode(['success' => true, 'data' => $user]);
    } else {
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
} catch (Exception $e) {
    error_log("Get settings error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
?>