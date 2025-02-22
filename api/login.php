<?php
// /sphere/api/login.php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

$correo = $_POST['correo'] ?? '';
$password = $_POST['password'] ?? '';

if (!$correo || !$password) {
    echo json_encode(['success' => false, 'message' => 'Missing fields']);
    exit;
}

$pdo = getDBConnection();
$stmt = $pdo->prepare("SELECT id, password FROM usuarios WHERE correo = ? AND estado = 'activo'");
$stmt->execute([$correo]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($password, $user['password'])) {
    $_SESSION['user_id'] = $user['id'];
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
}
?>