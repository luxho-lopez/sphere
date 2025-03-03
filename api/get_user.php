<?php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$pdo = getDBConnection();
$stmt = $pdo->prepare("SELECT id, username, first_name, last_name, email, profile_picture, cover_photo, description 
                    FROM users 
                    WHERE id = ?");
                    
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode(['success' => true, 'user' => [$user]]);
?>