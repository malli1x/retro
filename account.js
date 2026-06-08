document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    const tabs = document.querySelectorAll('.acc-tab[data-target]');
    const tabContents = document.querySelectorAll('.acc-tab-content');

    // Tab switching logic
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

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
