<?php
session_start(); // Запускаємо сесію
header('Content-Type: application/json; charset=utf-8');
require 'database.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || !isset($data->password)) {
    echo json_encode(['success' => false, 'message' => 'Введіть email та пароль']);
    exit;
}

$email = trim($data->email);
$password = $data->password;

// Шукаємо юзера
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

// Перевіряємо, чи є юзер і чи підходить пароль до хешу
if ($user && password_verify($password, $user['password_hash'])) {
    // Зберігаємо ID користувача в сесії
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_email'] = $user['email'];
    
    echo json_encode(['success' => true, 'message' => 'Вхід виконано успішно']);
} else {
    echo json_encode(['success' => false, 'message' => 'Невірний email або пароль']);
}
?>