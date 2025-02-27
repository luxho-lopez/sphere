<?php
// /sphere/api/change_password.php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$current_password = $_POST['current_password'] ?? '';
$new_password = $_POST['new_password'] ?? '';

if (!$current_password || !$new_password) {
    echo json_encode(['success' => false, 'message' => 'Missing fields']);
    exit;
}

$pdo = getDBConnection();
$stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!password_verify($current_password, $user['password'])) {
    echo json_encode(['success' => false, 'message' => 'Current password incorrect']);
    exit;
}

$hashed_password = password_hash($new_password, PASSWORD_BCRYPT);
$stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
$success = $stmt->execute([$hashed_password, $_SESSION['user_id']]);

echo json_encode(['success' => $success]);
?>