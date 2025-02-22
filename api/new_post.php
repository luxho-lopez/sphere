<?php
// /sphere/api/new_post.php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$titulo = $_POST['titulo'] ?? '';
$contenido = $_POST['contenido'] ?? '';
$categoria_id = $_POST['categoria_id'] ?? null;

if (!$titulo || !$contenido || !$categoria_id) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$pdo = getDBConnection();
$stmt = $pdo->prepare("INSERT INTO posts (titulo, contenido, usuario_id, categoria_id) VALUES (?, ?, ?, ?)");
$success = $stmt->execute([$titulo, $contenido, $_SESSION['user_id'], $categoria_id]);
$post_id = $pdo->lastInsertId();

// Subir imágenes
if (isset($_FILES['images']) && $success) {
    // Ruta absoluta en el sistema de archivos desde la raíz del proyecto
    $upload_dir = $_SERVER['DOCUMENT_ROOT'] . '/sphere/images/uploads/';
    // Ruta absoluta para el frontend (URL que se guardará en la base de datos)
    $url_base = '/sphere/images/uploads/';

    // Asegúrate de que el directorio exista y tenga permisos de escritura
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    foreach ($_FILES['images']['tmp_name'] as $key => $tmp_name) {
        if ($_FILES['images']['error'][$key] === UPLOAD_ERR_OK) {
            $file_name = basename($_FILES['images']['name'][$key]);
            $unique_name = time() . '-' . $file_name;
            $file_path = $upload_dir . $unique_name; // Ruta completa en el sistema de archivos
            $url = $url_base . $unique_name; // URL para el frontend

            if (move_uploaded_file($tmp_name, $file_path)) {
                $stmt = $pdo->prepare("INSERT INTO imagenes (post_id, url) VALUES (?, ?)");
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