<?php
// /sphere/api/register.php
header('Content-Type: application/json');
require_once 'config.php';

$correo = $_POST['correo'] ?? '';
$nombre = $_POST['nombre'] ?? '';
$apellido = $_POST['apellido'] ?? '';
$password = $_POST['password'] ?? '';

if (!$correo || !$nombre || !$apellido || !$password) {
    echo json_encode(['success' => false, 'message' => 'Missing fields']);
    exit;
}

$pdo = getDBConnection();
$stmt = $pdo->prepare("SELECT id FROM usuarios WHERE correo = ?");
$stmt->execute([$correo]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'Email already registered']);
    exit;
}

$hashed_password = password_hash($password, PASSWORD_BCRYPT);
$stmt = $pdo->prepare("INSERT INTO usuarios (correo, nombre, apellido, password, foto_perfil) VALUES (?, ?, ?, ?, ?)");
$success = $stmt->execute([$correo, $nombre, $apellido, $hashed_password, '/images/profile/default-avatar.png']);

echo json_encode(['success' => $success]);
?>