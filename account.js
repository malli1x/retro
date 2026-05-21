document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('logout.php', { method: 'POST' });
                const data = await response.json();

                if (data.success) {
                    // Перенаправляємо на сторінку входу
                    window.location.href = 'modal.html';
                }
            } catch (error) {
                console.error('Помилка виходу:', error);
                // На випадок помилки все одно редиректимо
                window.location.href = 'modal.html';
            }
        });
    }
});
