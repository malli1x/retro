document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('loginForm');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Зупиняємо стандартне перезавантаження сторінки

            // Збираємо дані з полів
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const password2 = document.getElementById('password2').value;

            // Перевіряємо збіг паролів
            if (password !== password2) {
                alert('Паролі не співпадають. Спробуйте ще раз.');
                return;
            }

            // Перевіряємо мінімальну довжину пароля
            if (password.length < 6) {
                alert('Пароль повинен містити щонайменше 6 символів.');
                return;
            }

            try {
                // Відправляємо запит на наш PHP файл
                const response = await fetch('register.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: email, password: password })
                });

                const data = await response.json();

                if (data.success) {
                    // Перенаправляємо на сторінку акаунту після реєстрації
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
