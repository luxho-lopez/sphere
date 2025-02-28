<?php
// /sphere/api/change_password.php
session_start();
header('Content-Type: application/json');

// Disable error display to prevent HTML output
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

require_once 'config.php';

try {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }

    $current_password = $_POST['current_password'] ?? '';
    $new_password = $_POST['new_password'] ?? '';
    $new_password_confirm = $_POST['new_password_confirm'] ?? '';

    // Check for missing fields
    if (empty($current_password) || empty($new_password) || empty($new_password_confirm)) {
        echo json_encode(['success' => false, 'message' => 'Missing fields']);
        exit;
    }

    // Validate new password match
    if ($new_password !== $new_password_confirm) {
        echo json_encode(['success' => false, 'message' => 'New passwords do not match']);
        exit;
    }

    $pdo = getDBConnection();
    if (!$pdo) {
        throw new Exception('Database connection failed');
    }

    // Verify current password
    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($current_password, $user['password'])) {
        echo json_encode(['success' => false, 'message' => 'Current password incorrect']);
        exit;
    }

    // Update password
    $hashed_password = password_hash($new_password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
    $success = $stmt->execute([$hashed_password, $_SESSION['user_id']]);

    if (!$success) {
        throw new Exception('Failed to update password');
    }

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    error_log("Change password error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>