document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Зупиняємо стандартне перезавантаження сторінки

            // Збираємо дані з полів
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                // Відправляємо запит на наш PHP файл
                const response = await fetch('login.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: email, password: password })
                });

                const data = await response.json();

                if (data.success) {
                    // Перенаправляємо на сторінку акаунту після успішного входу
                    window.location.href = 'account.php';
                } else {
                    alert('Помилка: ' + data.message);
                }
            } catch (error) {
                console.error('Помилка:', error);
                alert('Сталася помилка з\'єднання з сервером');
            }
        });
    }
});