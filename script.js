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
  } finally {
    // Після завантаження (успішного чи ні) ініціалізуємо сторінку оформлення, якщо ми на ній
    if (typeof initCheckoutPage === 'function') {
      initCheckoutPage();
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

// --- Перехід на сторінку оформлення замовлення ---
function openCheckoutModal(event) {
  if (event) event.preventDefault();
  window.location.href = 'checkout.html';
}

// --- Ініціалізація сторінки оформлення замовлення ---
function initCheckoutPage() {
  const checkoutTotalEl = document.getElementById('page-checkout-total');
  if (!checkoutTotalEl) return; // Ми не на сторінці checkout.html

  let totalPrice = 0;
  cart.forEach(item => {
    const product = products.find(p => p.name === item.name);
    if (product) {
      const price = parsePrice(product.price);
      totalPrice += price * item.qty;
    }
  });
  checkoutTotalEl.textContent = totalPrice.toLocaleString('uk-UA') + ' грн';
}

// Ініціалізація викликається з loadProducts()

// --- Відправити замовлення зі сторінки checkout.html ---
async function submitCheckoutPage(event) {
  event.preventDefault();

  const name    = document.getElementById('order-name')?.value.trim();
  const phone   = document.getElementById('order-phone')?.value.trim();
  const address = document.getElementById('order-address')?.value.trim();
  const email   = document.getElementById('order-email')?.value.trim();
  const comment = document.getElementById('order-comment')?.value.trim();
  const delivery = document.querySelector('input[name="delivery"]:checked')?.value;
  
  if (!name || !phone || !address) return;

  const btn = event.target.querySelector('button[type="submit"]');
  const originalText = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Відправка...';
  }

  // Підготовка даних кошика та розрахунок загальної суми
  let cartData = [];
  let totalPrice = 0;
  cart.forEach(item => {
    const product = products.find(p => p.name === item.name);
    if (product) {
      const price = parsePrice(product.price);
      cartData.push({
        name: product.name,
        qty: item.qty,
        price: price
      });
      totalPrice += price * item.qty;
    }
  });

  const payload = {
    name, phone, address, email, comment, delivery,
    cart: cartData,
    totalPrice: totalPrice
  };

  try {
    const res = await fetch('telegram_order.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (!result.success) {
      console.error('Помилка відправки в Telegram:', result.error);
    }
  } catch (err) {
    console.error('Не вдалося відправити замовлення:', err);
  }

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }

  // Очищаємо кошик
  clearCart();

  // Показуємо модалку успіху
  const successOverlay = document.getElementById('page-success-overlay');
  if (successOverlay) {
    successOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}



// Ініціалізація бейджа при завантаженні сторінки
updateBadge();




// ======== ФІЛЬТРИ КАТАЛОГУ ========

let currentFilter = null;
let searchQuery = '';

// Додаємо обробник для поля пошуку, якщо воно існує
const searchInput = document.querySelector('.search-bar input');
const searchDropdown = document.getElementById('search-dropdown');

// --- Підсвітити збіг у рядку ---
function highlightMatch(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// --- Розрахувати позицію dropdown під полем пошуку ---
function positionDropdown() {
  if (!searchInput || !searchDropdown) return;
  const rect = searchInput.closest('.search-wrapper').getBoundingClientRect();
  searchDropdown.style.top    = (rect.bottom + 4) + 'px';
  searchDropdown.style.left   = rect.left + 'px';
  searchDropdown.style.width  = rect.width + 'px';
}

// --- Показати/сховати dropdown ---
function showSearchDropdown(query) {
  if (!searchDropdown) return;

  if (!query || query.length < 1) {
    searchDropdown.classList.remove('active');
    searchDropdown.innerHTML = '';
    return;
  }

  const q = query.toLowerCase().trim();
  const matches = products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.brand.toLowerCase().includes(q) ||
    (p.type && p.type.toLowerCase().includes(q))
  ).slice(0, 8); // максимум 8 підказок

  if (matches.length === 0) {
    searchDropdown.innerHTML = `<div class="search-dropdown-empty">🔍 Нічого не знайдено за «${query}»</div>`;
    positionDropdown();
    searchDropdown.classList.add('active');
    return;
  }

  const header = `<div class="search-dropdown-header">Знайдено ${matches.length} товар${matches.length === 1 ? '' : matches.length < 5 ? 'и' : 'ів'}</div>`;
  const items = matches.map(p => {
    const thumb = p.image
      ? `<div class="search-dropdown-thumb"><img src="${p.image}" alt="${p.name}"></div>`
      : `<div class="search-dropdown-thumb">${p.emoji || '📦'}</div>`;
    const name = highlightMatch(p.name, query);
    return `
      <div class="search-dropdown-item" onclick="selectSearchItem('${encodeURIComponent(p.name)}')">
        ${thumb}
        <div class="search-dropdown-info">
          <div class="search-dropdown-name">${name}</div>
          <div class="search-dropdown-meta">${p.brand || ''} · ${p.condition || ''}</div>
        </div>
        <div class="search-dropdown-price">${p.price} грн</div>
      </div>
    `;
  }).join('');

  searchDropdown.innerHTML = header + items;
  positionDropdown();
  searchDropdown.classList.add('active');
}

// --- Перейти до товару при виборі ---
function selectSearchItem(encodedName) {
  const name = decodeURIComponent(encodedName);
  if (searchInput) searchInput.value = name;
  if (searchDropdown) {
    searchDropdown.classList.remove('active');
    searchDropdown.innerHTML = '';
  }
  window.location.href = `product.html?name=${encodedName}`;
}

// --- Закрити dropdown при кліку поза ---
document.addEventListener('click', (e) => {
  const wrapper = document.querySelector('.search-wrapper');
  if (wrapper && !wrapper.contains(e.target)) {
    if (searchDropdown) {
      searchDropdown.classList.remove('active');
    }
  }
});

if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    applyFilters();
    showSearchDropdown(e.target.value.trim());
  });

  // Закрити при натисканні Escape
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (searchDropdown) {
        searchDropdown.classList.remove('active');
        searchDropdown.innerHTML = '';
      }
      searchInput.blur();
    }
    // Enter — застосовує пошук і закриває dropdown
    if (e.key === 'Enter') {
      if (searchDropdown) {
        searchDropdown.classList.remove('active');
      }
      // Прокрутка до каталогу
      const catalog = document.getElementById('catalog');
      if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // Відкрити dropdown при фокусі, якщо є текст
  searchInput.addEventListener('focus', (e) => {
    if (e.target.value.trim().length > 0) {
      showSearchDropdown(e.target.value.trim());
    }
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