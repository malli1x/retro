<?php
session_start(); // Підключаємо сесію
header('Content-Type: application/json; charset=utf-8');

// Перевіряємо, чи є активна сесія з user_id
if (isset($_SESSION['user_id']) && isset($_SESSION['user_email'])) {
    echo json_encode([
        'loggedIn' => true,
        'user' => [
            'id'    => $_SESSION['user_id'],
            'email' => $_SESSION['user_email']
        ]
    ]);
} else {
    echo json_encode([
        'loggedIn' => false,
        'user'     => null
    ]);
}
?>
