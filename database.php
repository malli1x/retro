<?php
// Читаємо налаштування БД з environment variables (Render)
// або використовуємо локальні значення за замовчуванням
$host    = getenv('DB_HOST')     ?: 'localhost';
$db      = getenv('DB_NAME')     ?: 'retrotech_hub';
$user    = getenv('DB_USER')     ?: 'root';
$pass    = getenv('DB_PASSWORD') ?: '';
$port    = getenv('DB_PORT')     ?: '3306';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    die(json_encode(['error' => 'Помилка підключення до БД']));
}
?>