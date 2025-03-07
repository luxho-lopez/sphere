<?php
// /sphere/api/config.php
define('DB_HOST', 'localhost'); // Cambia según tu host de MySQL
define('DB_USER', 'root'); // Cambia según tu usuario de MySQL
define('DB_PASS', '');      // Cambia según tu contraseña de MySQL
define('DB_NAME', 'sphere');

function getDBConnection() {
    try {
        $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        die(json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]));
    }
}
?>