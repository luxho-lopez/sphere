<?php
header('Content-Type: application/json');
require_once 'config.php';

$username = $_GET['username'] ?? null;

if (!$username) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing username parameter']);
    exit;
}

try {
    $pdo = getDBConnection();
    
    $stmt = $pdo->prepare("
        SELECT id, username, first_name, last_name, email, profile_picture, cover_photo, description
        FROM users 
        WHERE username = ? AND status = 'active'
    ");
    
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>