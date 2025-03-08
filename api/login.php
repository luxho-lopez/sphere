<?php
// /sphere/api/login.php
session_start();
header('Content-Type: application/json');

// Disable error display to prevent HTML output
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

require_once 'config.php';

try {
    $contact = $_POST['contact'] ?? '';
    $password = $_POST['password'] ?? '';

    // Check for missing fields
    if (empty($contact) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Missing fields']);
        exit;
    }

    $pdo = getDBConnection();
    if (!$pdo) {
        throw new Exception('Database connection failed');
    }

    // Check if contact matches email or phone
    $stmt = $pdo->prepare("
        SELECT id, password 
        FROM users 
        WHERE (email = ? OR phone = ?) AND status = 'active'
    ");
    $stmt->execute([$contact, $contact]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
    }
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>