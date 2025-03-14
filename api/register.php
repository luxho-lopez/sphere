<?php
// /main/api/register.php
header('Content-Type: application/json');

// Disable error display to prevent HTML output
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

require_once 'config.php';

try {
    $contact = $_POST['contact'] ?? '';
    $first_name = $_POST['first_name'] ?? '';
    $last_name = $_POST['last_name'] ?? '';
    $password = $_POST['password'] ?? '';
    $password_confirm = $_POST['password_confirm'] ?? '';

    // Check for missing fields
    if (empty($contact) || empty($first_name) || empty($last_name) || empty($password) || empty($password_confirm)) {
        echo json_encode(['success' => false, 'message' => 'Missing fields']);
        exit;
    }

    // Validate password match
    if ($password !== $password_confirm) {
        echo json_encode(['success' => false, 'message' => 'Passwords do not match']);
        exit;
    }

    $pdo = getDBConnection();
    if (!$pdo) {
        throw new Exception('Database connection failed');
    }

    // Determine if contact is email or phone
    $isEmail = filter_var($contact, FILTER_VALIDATE_EMAIL);
    $isPhone = preg_match('/^\+?[1-9]\d{1,14}$/', $contact);

    if (!$isEmail && !$isPhone) {
        echo json_encode(['success' => false, 'message' => 'Invalid email or phone number format']);
        exit;
    }

    $email = $isEmail ? $contact : null;
    $phone = $isPhone ? $contact : null;

    // Check for existing email or phone
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? OR phone = ?");
    $stmt->execute([$email, $phone]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Email or phone number already registered']);
        exit;
    }

    // Insert user
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("
        INSERT INTO users (email, phone, first_name, last_name, password, profile_picture) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $success = $stmt->execute([
        $email,
        $phone,
        $first_name,
        $last_name,
        $hashed_password,
        '/main/images/profile/default-avatar.png'
    ]);

    if (!$success) {
        throw new Exception('Failed to insert user into database');
    }

    // Get the newly created user's ID
    $userId = $pdo->lastInsertId();

    // Generate username
    $firstNamePart = strtok($first_name, ' ');
    $lastNamePart = strtok($last_name, ' ');
    $username = strtolower($firstNamePart . $lastNamePart . $userId);

    // Update user with username
    $stmt = $pdo->prepare("UPDATE users SET username = ? WHERE id = ?");
    $success = $stmt->execute([$username, $userId]);

    if (!$success) {
        throw new Exception('Failed to update username');
    }

    echo json_encode(['success' => true, 'username' => $username]);
} catch (Exception $e) {
    error_log("Registration error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>