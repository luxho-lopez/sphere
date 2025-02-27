<?php
// /sphere/api/register.php
header('Content-Type: application/json');
require_once 'config.php';

$email = $_POST['email'] ?? '';
$first_name = $_POST['first_name'] ?? '';
$last_name = $_POST['last_name'] ?? '';
$password = $_POST['password'] ?? '';

if (!$email || !$first_name || !$last_name || !$password) {
    echo json_encode(['success' => false, 'message' => 'Missing fields']);
    exit;
}

$pdo = getDBConnection();
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'Email already registered']);
    exit;
}

$hashed_password = password_hash($password, PASSWORD_BCRYPT);
$stmt = $pdo->prepare("INSERT INTO users (email, first_name, last_name, password, profile_picture) VALUES (?, ?, ?, ?, ?)");
$success = $stmt->execute([$email, $first_name, $last_name, $hashed_password, '/images/profile/default-avatar.png']);

echo json_encode(['success' => $success]);
?>