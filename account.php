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
                    <a href="index.html#catalog" class="acc-action-btn acc-action-cart">
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

        </div>
    </main>

    <!-- FOOTER -->
    <footer class="acc-footer">
        <p>© RetroTech Hub 2026</p>
    </footer>

    <script src="account.js"></script>
</body>
</html>
