<?php
session_start();
session_destroy(); // Знищуємо сесію
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['success' => true, 'message' => 'Ви вийшли з акаунту']);
?>
