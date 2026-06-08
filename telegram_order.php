<?php
session_start();
header('Content-Type: application/json');

// Підключаємо БД безпечно: якщо підключення провалиться — продовжуємо без збереження в БД
try {
    require_once 'database.php';
} catch (Exception $e) {
    $pdo = null;
}


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
            // Посилання на Telegram за номером телефону
            [
                'text' => '✈️ Написати у Telegram', 
                'url' => 'https://t.me/' . preg_replace('/[^0-9\+]/', '', $phone)
            ],
            // Кнопка для переходу на ваш сайт
            [
                'text' => '🌐 Відкрити сайт', 
                'url' => 'https://retroboberd.onrender.com/index.html'
            ]
        ]
    ]
];

$postData = [
    'chat_id' => $chatId,
    'text' => $text,
    'parse_mode' => 'HTML',
    'reply_markup' => json_encode($keyboard)
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
// BUG FIX: використовуємо json_encode замість http_build_query, 
// адже reply_markup — це JSON-рядок, який http_build_query екранує некоректно.
$postData['reply_markup'] = json_encode($keyboard);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode == 200) {
    // Зберігаємо замовлення в БД, якщо користувач авторизований і зв’язок з БД встановлений
    if (isset($_SESSION['user_id']) && $pdo !== null) {
        try {
            $userId = $_SESSION['user_id'];
            
            // 1. Створюємо запис у таблиці orders
            $stmt = $pdo->prepare("INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, 'Нове')");
            $stmt->execute([$userId, $totalPrice]);
            $orderId = $pdo->lastInsertId();

            // 2. Додаємо товари в order_items
            foreach ($cart as $item) {
                $itemName = $item['name'] ?? '';
                $itemQty = $item['qty'] ?? 1;
                $itemPrice = $item['price'] ?? 0;

                // Шукаємо product_id за назвою
                $stmtProd = $pdo->prepare("SELECT id FROM products WHERE name = ? LIMIT 1");
                $stmtProd->execute([$itemName]);
                $product = $stmtProd->fetch();

                if ($product) {
                    $productId = $product['id'];
                    $stmtItem = $pdo->prepare("INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)");
                    $stmtItem->execute([$orderId, $productId, $itemQty, $itemPrice]);
                }
            }
        } catch (PDOException $e) {
            // Логуємо помилку або ігноруємо, щоб не ламати відповідь клієнту
            // error_log("DB Error: " . $e->getMessage());
        }
    }

    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => "Telegram API Error: " . $response]);
}
