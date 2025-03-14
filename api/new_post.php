<?php
// /main/api/new_post.php
session_start();

// Prevent any output before JSON
ob_start();
header('Content-Type: application/json');

require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    ob_end_flush();
    exit;
}

$title = $_POST['title'] ?? '';
$content = $_POST['content'] ?? '';

if (!$title || !$content) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    ob_end_flush();
    exit;
}

try {
    $pdo = getDBConnection();
    $stmt = $pdo->prepare("INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)");
    $success = $stmt->execute([$title, $content, $_SESSION['user_id']]);
    $post_id = $pdo->lastInsertId();

    // Upload images
    if (isset($_FILES['images']) && $success) {
        $upload_dir = $_SERVER['DOCUMENT_ROOT'] . '/main/images/uploads/';
        $url_base = '/main/images/uploads/';

        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }

        foreach ($_FILES['images']['tmp_name'] as $key => $tmp_name) {
            if ($_FILES['images']['error'][$key] === UPLOAD_ERR_OK) {
                $file_name = basename($_FILES['images']['name'][$key]);
                $unique_name = time() . '-' . $file_name;
                $file_path = $upload_dir . $unique_name;
                $url = $url_base . $unique_name;

                if (!move_uploaded_file($tmp_name, $file_path)) {
                    throw new Exception('Failed to move uploaded file');
                }

                $stmt = $pdo->prepare("INSERT INTO images (post_id, url) VALUES (?, ?)");
                $stmt->execute([$post_id, $url]);
            } elseif ($_FILES['images']['error'][$key] !== UPLOAD_ERR_NO_FILE) {
                throw new Exception('File upload error: ' . $_FILES['images']['error'][$key]);
            }
        }
    }

    echo json_encode(['success' => $success, 'post_id' => $post_id]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

ob_end_flush();
?>