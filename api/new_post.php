<?php
// /sphere/api/new_post.php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$title = $_POST['title'] ?? '';
$content = $_POST['content'] ?? '';
$category_id = $_POST['category_id'] ?? null;

if (!$title || !$content || !$category_id) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$pdo = getDBConnection();
$stmt = $pdo->prepare("INSERT INTO posts (title, content, user_id, category_id) VALUES (?, ?, ?, ?)");
$success = $stmt->execute([$title, $content, $_SESSION['user_id'], $category_id]);
$post_id = $pdo->lastInsertId();

// Upload images
if (isset($_FILES['images']) && $success) {
    // Absolute path in the filesystem from the project root
    $upload_dir = $_SERVER['DOCUMENT_ROOT'] . '/sphere/images/uploads/';
    // Absolute URL base for the frontend (stored in the database)
    $url_base = '/sphere/images/uploads/';

    // Ensure the directory exists and has write permissions
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    foreach ($_FILES['images']['tmp_name'] as $key => $tmp_name) {
        if ($_FILES['images']['error'][$key] === UPLOAD_ERR_OK) {
            $file_name = basename($_FILES['images']['name'][$key]);
            $unique_name = time() . '-' . $file_name;
            $file_path = $upload_dir . $unique_name; // Full filesystem path
            $url = $url_base . $unique_name; // URL for the frontend

            if (move_uploaded_file($tmp_name, $file_path)) {
                $stmt = $pdo->prepare("INSERT INTO images (post_id, url) VALUES (?, ?)");
                $stmt->execute([$post_id, $url]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to move uploaded file']);
                exit;
            }
        }
    }
}

echo json_encode(['success' => $success]);
?>