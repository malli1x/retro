<?php
// Дозволяємо браузеру читати JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// Налаштування підключення до бази даних
$host = 'localhost';
$db   = 'retrotech_hub';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

// Підключаємося до бази (через безпечний інтерфейс PDO)
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    
    // SQL-запит, який об'єднує таблиці, щоб дістати назви замість ID
    $sql = "
        SELECT 
            p.name, 
            p.condition_status AS `condition`, 
            p.price, 
            c.name AS `type`, 
            b.name AS `brand`, 
            p.emoji, 
            p.image_url AS `image`
        FROM products p
        JOIN categories c ON p.category_id = c.id
        JOIN brands b ON p.brand_id = b.id
    ";
    
    $stmt = $pdo->query($sql);
    $products = $stmt->fetchAll();
    
    // Оскільки ціна в БД має вигляд "3100.00", трохи відформатуємо її для JS
    foreach ($products as &$product) {
        // Відкидаємо копійки, щоб було "3100" замість "3100.00"
        $product['price'] = number_format((float)$product['price'], 0, '', ' ');
    }
    
    // Віддаємо дані у форматі JSON
    echo json_encode($products);

} catch (\PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>