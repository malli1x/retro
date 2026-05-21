<?php
header('Content-Type: application/json; charset=utf-8');
require 'database.php';

// Отримуємо дані з JS (fetch)
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || !isset($data->password)) {
    echo json_encode(['success' => false, 'message' => 'Введіть email та пароль']);
    exit;
}

$email = trim($data->email);
$password = $data->password;

// Перевіряємо, чи немає вже такого юзера
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'Користувач з таким email вже існує']);
    exit;
}

// Хешуємо пароль (це стандарт безпеки)
$hash = password_hash($password, PASSWORD_DEFAULT);

// Записуємо в БД
$insertStmt = $pdo->prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)");
if ($insertStmt->execute([$email, $hash])) {
    echo json_encode(['success' => true, 'message' => 'Реєстрація успішна']);
} else {
    echo json_encode(['success' => false, 'message' => 'Помилка при реєстрації']);
}
?>