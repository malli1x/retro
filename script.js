// Масив товарів — завантажується з API
let products = [];

// --- Завантажити товари з серверного API ---
async function loadProducts() {
  try {
    const response = await fetch('api.php');
    if (!response.ok) throw new Error('Помилка завантаження товарів');
    const data = await response.json();

    // Перевіряємо чи API не повернув помилку
    if (data.error) {
      console.error('API помилка:', data.error);
      return;
    }

    products = data;
    renderProducts(currentFilter);
  } catch (err) {
    console.error('Не вдалося завантажити товари:', err);
    const grid = document.getElementById('products-grid');
    if (grid) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#7A7265;font-size:1.1rem;">Не вдалося завантажити товари. Спробуйте пізніше.</div>';
    }
  }
}
// ======== КОШИК (змінні та функції) ========

// Завантажуємо кошик з localStorage (або порожній масив)
let cart = [];
try {
  cart = JSON.parse(localStorage.getItem('retrotech_cart')) || [];
} catch (e) {
  cart = [];
}

// --- Зберегти кошик у localStorage ---
function saveCart() {
  try {
    localStorage.setItem('retrotech_cart', JSON.stringify(cart));
  } catch (e) {
    console.error('Помилка збереження кошика:', e);
  }
}

// --- Оновити бейдж кількості товарів ---
function updateBadge() {
  const badge = document.getElementById('cart-badge');
  // Рахуємо загальну кількість одиниць товарів
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  if (badge) {
    badge.textContent = totalItems;
    // Ховаємо бейдж якщо кошик порожній
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

// --- Додати товар до кошика ---
function addToCart(event, name) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  // Шукаємо чи вже є такий товар у кошику
  const existing = cart.find(item => item.name === name);
  if (existing) {
    // Якщо є — збільшуємо кількість
    existing.qty++;
  } else {
    // Якщо немає — додаємо новий елемент з кількістю 1
    cart.push({ name: name, qty: 1 });
  }

  saveCart();       // Зберігаємо у localStorage
  updateBadge();    // Оновлюємо бейдж
  renderCartItems(); // Перемальовуємо вміст кошика
}

// --- Видалити товар з кошика ---
function removeFromCart(name) {
  // Фільтруємо — залишаємо всі крім видаленого
  cart = cart.filter(item => item.name !== name);
  saveCart();
  updateBadge();
  renderCartItems();
}

// --- Змінити кількість товару ---
function changeQty(name, delta) {
  const item = cart.find(i => i.name === name);
  if (!item) return;

  item.qty += delta;

  // Якщо кількість стала 0 або менше — видаляємо товар
  if (item.qty <= 0) {
    removeFromCart(name);
    return;
  }

  saveCart();
  updateBadge();
  renderCartItems();
}

// --- Відобразити товари у бічній панелі кошика ---
function renderCartItems() {
  const container = document.getElementById('cart-items');
  const emptyMsg = document.getElementById('cart-empty');
  const footer = document.getElementById('cart-footer');
  if (!container) return;

  if (cart.length === 0) {
    // Кошик порожній — показуємо повідомлення, ховаємо футер
    if (emptyMsg) emptyMsg.style.display = 'block';
    if (footer) footer.style.display = 'none';
    // Очищаємо попередні картки товарів
    container.querySelectorAll('.cart-item').forEach(el => el.remove());
    return;
  }

  // Ховаємо повідомлення "Кошик порожній", показуємо футер
  if (emptyMsg) emptyMsg.style.display = 'none';
  if (footer) footer.style.display = 'block';

  // Генеруємо HTML для кожного товару в кошику
  let html = '';
  let totalPrice = 0;

  cart.forEach(item => {
    // Знаходимо дані товару з масиву products
    const product = products.find(p => p.name === item.name);
    if (!product) return;

    const price = parsePrice(product.price);
    const itemTotal = price * item.qty;
    totalPrice += itemTotal;

    html += `
      <!-- Картка одного товару в кошику -->
      <div class="cart-item">
        <!-- Зображення товару -->
        <div class="cart-item-img">
          ${product.image ? `<img src="${product.image}" alt="${product.name}">` : `<span>${product.emoji}</span>`}
        </div>
        <!-- Інформація про товар -->
        <div class="cart-item-info">
          <!-- Назва товару -->
          <div class="cart-item-name">${product.name}</div>
          <!-- Ціна за одиницю -->
          <div class="cart-item-price">${product.price} грн</div>
          <!-- Керування кількістю -->
          <div class="cart-item-qty">
            <!-- Кнопка зменшення кількості -->
            <button class="qty-btn" onclick="changeQty('${product.name}', -1)">−</button>
            <!-- Поточна кількість -->
            <span>${item.qty}</span>
            <!-- Кнопка збільшення кількості -->
            <button class="qty-btn" onclick="changeQty('${product.name}', +1)">+</button>
          </div>
        </div>
        <!-- Кнопка видалення товару -->
        <button class="cart-item-remove" onclick="removeFromCart('${product.name}')" title="Видалити">✕</button>
      </div>
    `;
  });

  // Вставляємо HTML + порожнє повідомлення (приховане)
  container.innerHTML = '<div class="cart-empty" id="cart-empty" style="display:none;">Кошик порожній</div>' + html;

  // Оновлюємо загальну суму
  const totalEl = document.getElementById('cart-total-price');
  if (totalEl) {
    totalEl.textContent = totalPrice.toLocaleString('uk-UA') + ' грн';
  }
}

// --- Відкрити/закрити бічну панель кошика ---
function toggleCart(event) {
  if (event) event.preventDefault();
  const sidebar = document.getElementById('cart-sidebar');
  const overlay = document.getElementById('cart-overlay');
  if (!sidebar || !overlay) return;

  const isOpen = sidebar.classList.contains('open');
  if (isOpen) {
    // Закриваємо кошик
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  } else {
    // Відкриваємо кошик та перемальовуємо вміст
    renderCartItems();
    sidebar.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

// --- Очистити кошик ---
function clearCart() {
  cart = [];
  saveCart();
  updateBadge();
  renderCartItems();
}

// --- Відкрити модальне вікно оформлення замовлення ---
function checkout() {
  const overlay = document.getElementById('checkout-overlay');
  if (!overlay) { console.error('checkout-overlay не знайдено'); return; }

  // Закриваємо кошик перед відкриттям модалки
  const sidebar = document.getElementById('cart-sidebar');
  const cartOverlay = document.getElementById('cart-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (cartOverlay) cartOverlay.classList.remove('active');

  // Передаємо поточну суму у модалку
  const totalEl = document.getElementById('cart-total-price');
  const checkoutTotal = document.getElementById('checkout-total');
  if (totalEl && checkoutTotal) {
    checkoutTotal.textContent = totalEl.textContent;
  }

  // Показуємо модалку
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Скидаємо форму
  const form = document.getElementById('checkout-form');
  if (form) form.reset();
}

// --- Закрити модальне вікно оформлення (кнопкою або Escape) ---
function closeCheckoutModal() {
  const overlay = document.getElementById('checkout-overlay');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// --- Закрити при кліку на затемнений фон (поза модалкою) ---
function checkoutOverlayClick(event) {
  if (event.target === document.getElementById('checkout-overlay')) {
    closeCheckoutModal();
  }
}

// --- Закрити модалку успіху ---
function closeSuccessModal() {
  const overlay = document.getElementById('success-overlay');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// --- Відправити замовлення ---
function submitOrder(event) {
  event.preventDefault();

  const name    = document.getElementById('order-name')?.value.trim();
  const phone   = document.getElementById('order-phone')?.value.trim();
  const email   = document.getElementById('order-email')?.value.trim();
  const address = document.getElementById('order-address')?.value.trim();
  const delivery = document.querySelector('input[name="delivery"]:checked')?.value || 'nova';
  const comment = document.getElementById('order-comment')?.value.trim();

  // Валідація
  if (!name || !phone || !address) return;

  // Збираємо список товарів
  const items = cart.map(item => {
    const product = products.find(p => p.name === item.name);
    return product ? `${item.name} x${item.qty} — ${product.price} грн` : null;
  }).filter(Boolean).join('\n');

  // Логуємо замовлення (у реальному проекті тут — fetch до API)
  console.log('=== НОВЕ ЗАМОВЛЕННЯ ===');
  console.log('Ім\'я:', name);
  console.log('Телефон:', phone);
  console.log('Email:', email || '—');
  console.log('Адреса:', address);
  console.log('Доставка:', delivery);
  console.log('Коментар:', comment || '—');
  console.log('Товари:\n', items);

  // Закриваємо форму
  const checkoutOverlay = document.getElementById('checkout-overlay');
  if (checkoutOverlay) checkoutOverlay.classList.remove('active');

  // Показуємо модалку успіху
  const successOverlay = document.getElementById('success-overlay');
  if (successOverlay) successOverlay.classList.add('active');

  // Очищаємо кошик і закриваємо його
  clearCart();
  const sidebar = document.getElementById('cart-sidebar');
  const cartOverlay = document.getElementById('cart-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (cartOverlay) cartOverlay.classList.remove('active');
}

// Ініціалізація бейджа при завантаженні сторінки
updateBadge();

// Закриття модалки по клавіші Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCheckoutModal();
    closeSuccessModal();
  }
});


// ======== ФІЛЬТРИ КАТАЛОГУ ========

let currentFilter = null;
let searchQuery = '';

// Додаємо обробник для поля пошуку, якщо воно існує
const searchInput = document.querySelector('.search-bar input');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    applyFilters();
  });
}

// --- Отримати обрані значення чекбоксів певної групи ---
function getSelectedValues(filterName) {
  const checkboxes = document.querySelectorAll(`input[data-filter="${filterName}"]:checked`);
  return Array.from(checkboxes).map(cb => cb.dataset.value);
}

// --- Перетворити рядок ціни в число ---
function parsePrice(priceStr) {
  return parseInt(priceStr.replace(/\s/g, ''), 10);
}

// --- Застосувати всі фільтри та перемалювати каталог ---
function applyFilters() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  // Збираємо обрані значення з кожної групи фільтрів
  const selectedBrands = getSelectedValues('brand');
  const selectedConditions = getSelectedValues('condition');
  const selectedTypes = getSelectedValues('type');
  const slider = document.getElementById('price-slider');
  const maxPrice = slider ? parseInt(slider.value) : 15000;

  let list = products;

  // Фільтр за категорією (з кнопок категорій)
  if (currentFilter) {
    list = list.filter(p => p.type === currentFilter);
  }

  // Фільтр за пошуковим запитом
  if (searchQuery) {
    list = list.filter(p =>
      p.name.toLowerCase().includes(searchQuery) ||
      p.brand.toLowerCase().includes(searchQuery)
    );
  }

  // Фільтр за брендом
  if (selectedBrands.length > 0) {
    list = list.filter(p => selectedBrands.includes(p.brand));
  }

  // Фільтр за станом
  if (selectedConditions.length > 0) {
    list = list.filter(p => selectedConditions.includes(p.condition));
  }

  // Фільтр за типом техніки
  if (selectedTypes.length > 0) {
    list = list.filter(p => selectedTypes.includes(p.type));
  }

  // Фільтр за ціною
  list = list.filter(p => parsePrice(p.price) <= maxPrice);

  // Якщо нічого не знайдено — показуємо повідомлення
  if (list.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#7A7265;font-size:1.1rem;">Товарів за обраними фільтрами не знайдено</div>';
    return;
  }

  // Рендеримо картки товарів
  grid.innerHTML = list.map((p, i) => `
    <div class="product-card" onclick="window.location.href='product.html?name=${encodeURIComponent(p.name)}'">
      <div class="product-img">
        ${p.image ? `<img src="${p.image}" alt="${p.name}">` : p.emoji}
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-condition">${p.condition}</div>
        <div class="product-bottom">
          <span class="product-price">${p.price} грн</span>
          <button class="btn-cart" onclick="addToCart(event, '${p.name}')">У кошик</button>
        </div>
      </div>
    </div>
  `).join('');
}

// --- Рендер товарів з фільтром категорії ---
function renderProducts(filter) {
  currentFilter = filter;
  if (filter) {
    document.querySelectorAll('input[data-filter="type"]').forEach(cb => {
      cb.checked = cb.dataset.value === filter;
    });
  }
  applyFilters();
}

// --- Фільтрація при кліку на категорію ---
function filterBy(type) {
  currentFilter = type;
  renderProducts(type);
  document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
}


document.querySelectorAll('input[data-filter]').forEach(cb => {
  cb.addEventListener('change', () => {
    if (cb.dataset.filter === 'type') {
      currentFilter = null;
    }
    applyFilters();
  });
});

const slider = document.getElementById('price-slider');
const priceInput = document.getElementById('price-input');

if (slider && priceInput) {
  // Повзунок → поле вводу
  slider.addEventListener('input', () => {
    const val = parseInt(slider.value);
    priceInput.value = val;
    applyFilters();
  });

  // Поле вводу → повзунок
  priceInput.addEventListener('input', () => {
    let val = parseInt(priceInput.value);
    if (isNaN(val)) return;
    // Обмежуємо значення в допустимих межах
    val = Math.max(0, Math.min(15000, val));
    slider.value = val;
    applyFilters();
  });

  // При втраті фокусу — коригуємо значення
  priceInput.addEventListener('blur', () => {
    let val = parseInt(priceInput.value);
    if (isNaN(val) || val < 0) val = 0;
    if (val > 15000) val = 15000;
    priceInput.value = val;
    slider.value = val;
    applyFilters();
  });
}

document.querySelectorAll('.page-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

loadProducts();

// === CURSOR TRAIL EFFECT (PIXEL) ===
(function () {
  const PIXEL = 6;
  const canvas = document.createElement('canvas');
  canvas.id = 'cursor-trail';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-1;image-rendering:pixelated;';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  let pixels = [];
  const maxPixels = 220;
  let lastX = -1, lastY = -1;

  function resize() {
    canvas.width = Math.ceil(window.innerWidth / PIXEL);
    canvas.height = Math.ceil(window.innerHeight / PIXEL);
  }
  resize();
  window.addEventListener('resize', resize);

  // Малюємо пікселі між двома точками (алгоритм Брезенхема)
  function plotLine(x0, y0, x1, y1) {
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;

    while (true) {
      pixels.push({ x: x0, y: y0, age: 0 });
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
    if (pixels.length > maxPixels) pixels.splice(0, pixels.length - maxPixels);
  }

  document.addEventListener('mousemove', (e) => {
    const gx = Math.floor(e.clientX / PIXEL);
    const gy = Math.floor(e.clientY / PIXEL);
    if (gx !== lastX || gy !== lastY) {
      if (lastX >= 0) plotLine(lastX, lastY, gx, gy);
      else pixels.push({ x: gx, y: gy, age: 0 });
      lastX = gx;
      lastY = gy;
    }
  });

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < pixels.length; i++) {
      pixels[i].age++;
    }
    pixels = pixels.filter(p => p.age < 30);

    for (const p of pixels) {
      const alpha = Math.max(0, 1 - p.age / 50) * 0.5;
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.fillRect(p.x, p.y, 1, 1);
    }

    requestAnimationFrame(draw);
  }
  draw();
})();

// ======== КНОПКА АКАУНТУ (авторизація) ========

async function updateAccountButton() {
  const btn = document.getElementById('account-btn');
  if (!btn) return;

  try {
    const res = await fetch('check_auth.php');
    const data = await res.json();

    if (data.loggedIn) {
      // Отримуємо першу літеру email для аватара
      const initial = data.user.email.charAt(0).toUpperCase();
      const email = data.user.email;

      // Замінюємо вміст кнопки: аватар + підпис
      btn.innerHTML = `
        <span class="account-avatar">${initial}</span>
        <span class="account-email">Акаунт</span>
      `;
      // При кліку — переходимо на сторінку акаунту
      btn.href = 'account.php';
      btn.title = email;
      btn.classList.add('account-logged-in');
    }
    // Якщо не авторизований — кнопка залишається без змін (посилання на modal.html)
  } catch (err) {
    console.warn('Не вдалося перевірити авторизацію:', err);
  }
}

updateAccountButton();