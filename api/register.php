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

// Verificar si el email ya está registrado
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'Email already registered']);
    exit;
}

// Insertar el usuario sin el username inicialmente
$hashed_password = password_hash($password, PASSWORD_BCRYPT);
$stmt = $pdo->prepare("INSERT INTO users (email, first_name, last_name, password, profile_picture) VALUES (?, ?, ?, ?, ?)");
$success = $stmt->execute([$email, $first_name, $last_name, $hashed_password, '/sphere/images/profile/default-avatar.png']);

if ($success) {
    // Obtener el ID del usuario recién creado
    $userId = $pdo->lastInsertId();

    // Generar el username
    $firstNamePart = strtok($first_name, ' '); // Primera palabra de first_name
    $lastNamePart = strtok($last_name, ' ');   // Primera palabra de last_name
    $username = strtolower($firstNamePart . $lastNamePart . $userId);

    // Actualizar el usuario con el username
    $stmt = $pdo->prepare("UPDATE users SET username = ? WHERE id = ?");
    $stmt->execute([$username, $userId]);

    echo json_encode(['success' => true, 'username' => $username]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to register user']);
}

?>