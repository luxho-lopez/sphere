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
    $field = $_POST['field'] ?? '';
    $current_password = $_POST['current_password'] ?? null;

    $sensitive_fields = ['email', 'phone', 'password', 'username'];
    $allowed_fields = array_merge($sensitive_fields, ['first_name', 'last_name', 'profile_picture']);

    if (!in_array($field, $allowed_fields)) {
        echo json_encode(['success' => false, 'message' => 'Invalid field']);
        exit;
    }

    $pdo = getDBConnection();
    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Require password confirmation for sensitive fields
    if (in_array($field, $sensitive_fields)) {
        if (empty($current_password) || !password_verify($current_password, $user['password'])) {
            echo json_encode(['success' => false, 'message' => 'Current password incorrect or missing']);
            exit;
        }
    }

    // Handle different field types
    if ($field === 'profile_picture') {
        if (!isset($_FILES['value']) || $_FILES['value']['error'] === UPLOAD_ERR_NO_FILE) {
            echo json_encode(['success' => false, 'message' => 'No file uploaded']);
            exit;
        }

        $file = $_FILES['value'];
        $allowed_types = ['image/jpeg', 'image/png', 'image/gif'];
        if (!in_array($file['type'], $allowed_types)) {
            echo json_encode(['success' => false, 'message' => 'Invalid file type']);
            exit;
        }

        $upload_dir = '/sphere/images/profile/';
        $file_name = $_SESSION['user_id'] . '_' . time() . '.' . pathinfo($file['name'], PATHINFO_EXTENSION);
        $upload_path = $upload_dir . $file_name;

        if (move_uploaded_file($file['tmp_name'], $_SERVER['DOCUMENT_ROOT'] . $upload_path)) {
            $value = $upload_path;
        } else {
            throw new Exception('Failed to upload file');
        }
    } else {
        $value = $_POST['value'] ?? '';
        if (empty($value)) {
            echo json_encode(['success' => false, 'message' => 'Value cannot be empty']);
            exit;
        }
        if ($field === 'password') {
            $value = password_hash($value, PASSWORD_BCRYPT);
        }
    }

    $stmt = $pdo->prepare("UPDATE users SET $field = ? WHERE id = ?");
    $success = $stmt->execute([$value, $_SESSION['user_id']]);

    echo json_encode(['success' => $success]);
} catch (Exception $e) {
    error_log("Update setting error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>