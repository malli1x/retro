<?php
session_start();

// Якщо не залогінений — редирект на сторінку входу
if (!isset($_SESSION['user_id'])) {
    header('Location: modal.html');
    exit;
}

// Отримуємо дані з сесії
$userEmail = htmlspecialchars($_SESSION['user_email']);
$userId    = (int) $_SESSION['user_id'];

// Отримуємо першу літеру email для аватара
$avatarLetter = strtoupper(substr($userEmail, 0, 1));

// Підключаємо БД і отримуємо історію замовлень
require_once 'database.php';

$stmt = $pdo->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC");
$stmt->execute([$userId]);
$orders = $stmt->fetchAll();

$orderHistory = [];
foreach ($orders as $order) {
    $stmtItems = $pdo->prepare("
        SELECT oi.quantity, oi.price_at_purchase, p.name, p.image_url, p.emoji 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?
    ");
    $stmtItems->execute([$order['id']]);
    $order['items'] = $stmtItems->fetchAll();
    $orderHistory[] = $order;
}
?>
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Мій акаунт — RetroTech Hub</title>
    <meta name="description" content="Особистий кабінет користувача RetroTech Hub">
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="account.css">
</head>
<body class="account-page">

    <!-- НАВІГАЦІЯ -->
    <nav class="acc-nav">
        <a href="index.html" class="acc-logo">
            <span class="acc-logo-icon">📻</span>
            <span class="acc-logo-text">RETROTECH<br>HUB</span>
        </a>
        <div class="acc-nav-links">
            <a href="index.html">Каталог</a>
            <a href="pronas.html">Про нас</a>
            <a href="contact.html">Контакти</a>
        </div>
    </nav>

    <!-- ОСНОВНИЙ ВМІСТ -->
    <main class="acc-main">

        <!-- ЗАГОЛОВОК ПРОФІЛЮ -->
        <div class="acc-hero">
            <div class="acc-hero-bg-text">PROFILE</div>
            <div class="acc-avatar-wrap">
                <div class="acc-avatar"><?= $avatarLetter ?></div>
                <div class="acc-avatar-badge">✓</div>
            </div>
            <h1 class="acc-greeting">Привіт, ретромане!</h1>
            <p class="acc-subtitle">Ласкаво просимо до вашого особистого кабінету</p>
        </div>

        <!-- КАРТКИ ІНФОРМАЦІЇ -->
        <div class="acc-cards">

            <!-- Картка: Дані акаунту -->
            <div class="acc-card">
                <div class="acc-card-header">
                    <span class="acc-card-icon">🪪</span>
                    <h2>Дані акаунту</h2>
                </div>
                <div class="acc-card-body">
                    <div class="acc-info-row">
                        <span class="acc-info-label">Email</span>
                        <span class="acc-info-value"><?= $userEmail ?></span>
                    </div>
                    <div class="acc-info-row">
                        <span class="acc-info-label">ID користувача</span>
                        <span class="acc-info-value acc-id">#<?= $userId ?></span>
                    </div>
                    <div class="acc-info-row">
                        <span class="acc-info-label">Статус</span>
                        <span class="acc-info-value acc-status-badge">✅ Активний</span>
                    </div>
                </div>
            </div>

            <!-- Картка: Швидкі дії -->
            <div class="acc-card">
                <div class="acc-card-header">
                    <span class="acc-card-icon">⚡</span>
                    <h2>Швидкі дії</h2>
                </div>
                <div class="acc-card-body acc-actions-list">
                    <a href="index.html" class="acc-action-btn acc-action-catalog">
                        <span>📦</span> Переглянути каталог
                    </a>
                    <a href="#orders" class="acc-action-btn acc-action-cart">
                        <span>🛒</span> Мої замовлення
                    </a>
                    <button id="logout-btn" class="acc-action-btn acc-action-logout">
                        <span>🚪</span> Вийти з акаунту
                    </button>
                </div>
            </div>

            <!-- Картка: Про платформу -->
            <div class="acc-card acc-card-wide">
                <div class="acc-card-header">
                    <span class="acc-card-icon">📻</span>
                    <h2>RetroTech Hub</h2>
                </div>
                <div class="acc-card-body">
                    <p class="acc-about-text">
                        Ти частина спільноти справжніх цінителів вінтажної техніки.
                        Досліджуй колекцію, знаходь раритети та насолоджуйся естетикою минулого.
                    </p>
                    <div class="acc-stats">
                        <div class="acc-stat">
                            <span class="acc-stat-num">500+</span>
                            <span class="acc-stat-label">Товарів</span>
                        </div>
                        <div class="acc-stat">
                            <span class="acc-stat-num">3</span>
                            <span class="acc-stat-label">Категорії</span>
                        </div>
                        <div class="acc-stat">
                            <span class="acc-stat-num">Y2K</span>
                            <span class="acc-stat-label">Стиль</span>
                        </div>
                    </div>
                </div>
            </div>

        <!-- ІСТОРІЯ ЗАМОВЛЕНЬ -->
        <div id="orders" class="acc-card acc-card-wide acc-orders-card">
            <div class="acc-card-header">
                <span class="acc-card-icon">📦</span>
                <h2>Історія замовлень</h2>
            </div>
            <div class="acc-card-body">
                <?php if (empty($orderHistory)): ?>
                    <p class="acc-about-text" style="text-align: center; color: #7A7265;">Ви ще не робили замовлень.</p>
                <?php else: ?>
                    <div class="acc-orders-list">
                        <?php foreach ($orderHistory as $order): ?>
                            <div class="acc-order-item">
                                <div class="acc-order-header">
                                    <span class="acc-order-id">Замовлення #<?= $order['id'] ?></span>
                                    <span class="acc-order-date"><?= date('d.m.Y H:i', strtotime($order['created_at'])) ?></span>
                                    <span class="acc-order-status status-<?= strtolower(str_replace(' ', '-', $order['status'])) ?>"><?= htmlspecialchars($order['status']) ?></span>
                                </div>
                                <div class="acc-order-products">
                                    <?php foreach ($order['items'] as $item): ?>
                                        <div class="acc-order-product">
                                            <div class="acc-product-img">
                                                <?php if (!empty($item['image_url'])): ?>
                                                    <img src="<?= htmlspecialchars($item['image_url']) ?>" alt="<?= htmlspecialchars($item['name']) ?>">
                                                <?php else: ?>
                                                    <span><?= htmlspecialchars($item['emoji']) ?></span>
                                                <?php endif; ?>
                                            </div>
                                            <div class="acc-product-details">
                                                <div class="acc-product-name"><?= htmlspecialchars($item['name']) ?></div>
                                                <div class="acc-product-meta"><?= $item['quantity'] ?> шт. × <?= number_format($item['price_at_purchase'], 0, '.', ' ') ?> грн</div>
                                            </div>
                                        </div>
                                    <?php endforeach; ?>
                                </div>
                                <div class="acc-order-footer">
                                    <span>Загальна сума:</span>
                                    <span class="acc-order-total"><?= number_format($order['total_amount'], 0, '.', ' ') ?> грн</span>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>

        </div><!-- /.acc-cards -->

    </main>


    <!-- FOOTER -->
    <footer class="acc-footer">
        <p>© RetroTech Hub 2026</p>
    </footer>

    <script src="account.js"></script>
</body>
</html>
