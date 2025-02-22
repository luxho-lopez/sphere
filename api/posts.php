<?php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

$pdo = getDBConnection();

$query = "
    SELECT p.*, u.nombre, u.apellido, 
           (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count,
           EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND usuario_id = ?) AS user_liked
    FROM posts p
    LEFT JOIN usuarios u ON p.usuario_id = u.id
    WHERE p.estado = 'Activo'
";
$stmt = $pdo->prepare($query);
$stmt->execute([isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 0]);
$posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($posts as &$post) {
    // Obtener imágenes
    $stmt = $pdo->prepare("SELECT url FROM imagenes WHERE post_id = ?");
    $stmt->execute([$post['id']]);
    $post['images'] = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Obtener comentarios
    $stmt = $pdo->prepare("
        SELECT c.id, c.contenido, c.fecha_creacion, u.nombre AS user_name, u.id AS user_id
        FROM comentarios c
        LEFT JOIN usuarios u ON c.usuario_id = u.id
        WHERE c.post_id = ?
        ORDER BY c.fecha_creacion DESC
    ");
    $stmt->execute([$post['id']]);
    $post['comments'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $post['author'] = ['name' => $post['nombre'], 'lastname' => $post['apellido']];
    unset($post['nombre'], $post['apellido']);
}

echo json_encode($posts);
?>