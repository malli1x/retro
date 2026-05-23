<?php
header('Content-Type: application/json');

// ==========================================
// ВКАЖІТЬ ТУТ ВАШІ ДАНІ ВІД TELEGRAM БОТА
// ==========================================
$botToken = "7999361571:AAH7E_QVUzGCVcRjsPjaO7eDhZ9T3tLqy50";
$chatId = "738131599";
// ==========================================

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'error' => 'No data received']);
    exit;
}

$name = $data['name'] ?? 'Не вказано';
$phone = $data['phone'] ?? 'Не вказано';
$email = $data['email'] ?? '-';
$address = $data['address'] ?? 'Не вказано';
$delivery = $data['delivery'] ?? 'Не вказано';
$comment = $data['comment'] ?? '-';
$cart = $data['cart'] ?? [];
$totalPrice = $data['totalPrice'] ?? 0;

$deliveryMethods = [
    'nova' => 'Нова Пошта',
    'ukrposhta' => 'Укрпошта',
    'pickup' => 'Самовивіз'
];
$deliveryText = $deliveryMethods[$delivery] ?? $delivery;

// Формуємо текст повідомлення з використанням HTML форматування
$text = "🎉 <b>Нове замовлення!</b>\n\n";
$text .= "👤 <b>Клієнт:</b> $name\n";
$text .= "📞 <b>Телефон:</b> $phone\n";
if (!empty($email) && $email !== '-') {
    $text .= "📧 <b>Email:</b> $email\n";
}
$text .= "📍 <b>Доставка:</b> $deliveryText ($address)\n";
if (!empty($comment) && $comment !== '-') {
    $text .= "💬 <b>Коментар:</b> $comment\n";
}

$text .= "\n🛒 <b>Кошик:</b>\n";
foreach ($cart as $item) {
    $itemName = $item['name'] ?? 'Товар';
    $itemQty = $item['qty'] ?? 1;
    $itemPrice = $item['price'] ?? 0;
    $sum = $itemQty * $itemPrice;
    $text .= "— $itemName x$itemQty = $sum грн\n";
}

$text .= "\n💰 <b>Загальна сума:</b> $totalPrice грн";

// Відправляємо запит до Telegram API
$url = "https://api.telegram.org/bot" . $botToken . "/sendMessage";
// Створюємо кнопки (Inline Keyboard)
$keyboard = [
    'inline_keyboard' => [
        [
            // Кнопка для дзвінка клієнту (працює на смартфонах)
            [
                'text' => '📞 Зателефонувати', 
                'url' => 'tel:' . preg_replace('/[^0-9\+]/', '', $phone)
            ],
            // Кнопка для переходу на ваш сайт (як приклад)
            [
                'text' => '🌐 Відкрити сайт', 
                'url' => 'https://ваш-сайт.com'
            ]
        ]
    ]
];

$postData = [
    'chat_id' => $chatId,
    'text' => $text,
    'parse_mode' => 'HTML',
    'reply_markup' => json_encode($keyboard) // Додаємо кнопки до повідомлення
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode == 200) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => "Telegram API Error: " . $response]);
}
