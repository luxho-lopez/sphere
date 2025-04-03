<?php
// /main/api/update_setting.php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$field = $_POST['field'] ?? '';
$value = $_FILES['value'] ?? $_POST['value'] ?? '';
$currentPassword = $_POST['current_password'] ?? '';

$allowedFields = ['email', 'phone', 'password', 'username', 'first_name', 'last_name', 'profile_picture', 'cover_photo', 'description'];
$sensitiveFields = ['email', 'phone', 'password', 'username'];

if (!in_array($field, $allowedFields)) {
    echo json_encode(['success' => false, 'message' => 'Invalid field']);
    exit;
}

if (in_array($field, $sensitiveFields) && !$currentPassword) {
    echo json_encode(['success' => false, 'message' => 'Current password required']);
    exit;
}

try {
    $pdo = getDBConnection();

    // Verify current password for sensitive fields
    if (in_array($field, $sensitiveFields)) {
        $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!password_verify($currentPassword, $user['password'])) {
            echo json_encode(['success' => false, 'message' => 'Incorrect password']);
            exit;
        }
    }

    // Check if email or phone is already registered by another user
    if ($field === 'email' || $field === 'phone' || $field === 'username') {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE $field = ? AND id != ?");
        $stmt->execute([$value, $_SESSION['user_id']]);
        if ($stmt->fetch(PDO::FETCH_ASSOC)) {
            echo json_encode(['success' => false, 'message' => 'This ' . $field . ' is already registered']);
            exit;
        }
    }

    // Handle file uploads for profile_picture and cover_photo
    if (($field === 'profile_picture' || $field === 'cover_photo') && isset($_FILES['value'])) {
        $uploadDir = $field === 'profile_picture' 
            ? $_SERVER['DOCUMENT_ROOT'] . '/main/images/profile/' 
            : $_SERVER['DOCUMENT_ROOT'] . '/main/images/covers/';
        $urlBase = $field === 'profile_picture' 
            ? '/main/images/profile/' 
            : '/main/images/covers/';

        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $fileName = basename($_FILES['value']['name']);
        $uniqueName = time() . '-' . $fileName;
        $filePath = $uploadDir . $uniqueName;
        $url = $urlBase . $uniqueName;

        if (move_uploaded_file($_FILES['value']['tmp_name'], $filePath)) {
            $value = $url;
        } else {
            throw new Exception("Failed to upload $field");
        }
    }

    // Update the field
    $stmt = $pdo->prepare("UPDATE users SET $field = ? WHERE id = ?");
    $stmt->execute([$value, $_SESSION['user_id']]);

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>