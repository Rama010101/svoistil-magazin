// === Массив товаров ===
const products = [
  {
    id: 1,
    name: 'Ламинат Alpine Floor Дуб Натуральный',
    category: 'laminate',
    price: 1890,
    image: 'images/laminate-1.jpg',
    description: '33 класс, влагостойкий, толщина 8 мм. Идеален для кухни и прихожей.',
    inStock: true
  },
  {
    id: 2,
    name: 'Ламинат Tarkett Woodstock',
    category: 'laminate',
    price: 2150,
    image: 'images/laminate-2.jpg',
    description: '32 класс, 4V-фаска, текстура дерева. Тёплый и уютный вид.',
    inStock: true
  },
  {
    id: 3,
    name: 'Кварцвинил Aquafloor Дуб Бренди',
    category: 'vinyl',
    price: 2450,
    image: 'images/vinyl-1.jpg',
    description: '100% водостойкий, подходит для ванной. Толщина 5 мм.',
    inStock: true
  },
  {
    id: 4,
    name: 'Кварцвинил Alpine Floor Cottage',
    category: 'vinyl',
    price: 1990,
    image: 'images/vinyl-2.jpg',
    description: 'Уютный дизайн под дерево, не боится влаги и царапин.',
    inStock: false
  },
  {
    id: 5,
    name: 'Пробка Wicanders Hydrocork',
    category: 'cork',
    price: 3200,
    image: 'images/cork-1.jpg',
    description: 'Натуральная пробка, тёплая и бесшумная. Экологичный материал.',
    inStock: true
  },
  {
    id: 6,
    name: 'Паркетная доска Karelia Дуб',
    category: 'parquet',
    price: 4500,
    image: 'images/parquet-1.jpg',
    description: 'Натуральный дуб, 3-полосная доска. Премиум-класс для гостиной.',
    inStock: true
  }
];

// === Переменные для DOM ===
const grid = document.getElementById('products-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotalPrice = document.getElementById('cart-total-price');

let currentCategory = 'all';

// === Корзина (инициализация) ===
let cart = JSON.parse(localStorage.getItem('myCart')) || [];

// ==========================================
// ЛОГИКА КОРЗИНЫ
// ==========================================

function saveCart() {
  localStorage.setItem('myCart', JSON.stringify(cart));
}

function updateCartCounter() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCount) cartCount.textContent = totalItems;
}

// Функция добавления в корзину (вызывается из карточек)
function addToCart(product) {
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }
  
  saveCart();
  updateCartCounter();
  
  // Небольшая анимация или уведомление
  cartBtn.style.transform = 'scale(1.1)';
  setTimeout(() => cartBtn.style.transform = 'scale(1)', 200);
}

// Рендер корзины внутри модального окна
function renderCart() {
  if (!cartItemsContainer) return;
  cartItemsContainer.innerHTML = '';
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p style="text-align:center; color:#777; padding: 20px 0;">Ваша корзина пуста</p>';
    if (cartTotalPrice) cartTotalPrice.textContent = '0';
    return;
  }

  let total = 0;

  cart.forEach(item => {
    total += item.price * item.quantity;
    
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <div class="cart-item-price">${item.price.toLocaleString('ru-RU')} ₽</div>
      </div>
      <div class="cart-item-actions">
        <button class="cart-qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
        <span class="cart-item-qty">${item.quantity}</span>
        <button class="cart-qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        <button class="cart-remove-btn" onclick="removeFromCart(${item.id})">×</button>
      </div>
    `;
    cartItemsContainer.appendChild(itemEl);
  });

  if (cartTotalPrice) cartTotalPrice.textContent = total.toLocaleString('ru-RU');
}

// Глобальные функции для onclick в HTML (корзина)
window.changeQty = function(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  
  item.quantity += delta;
  
  if (item.quantity <= 0) {
    removeFromCart(id);
    return;
  }
  
  saveCart();
  renderCart();
  updateCartCounter();
};

window.removeFromCart = function(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
  updateCartCounter();
};

// Обработчики событий корзины
if (cartBtn) {
  cartBtn.addEventListener('click', () => {
    renderCart();
    cartModal.classList.add('open');
  });
}

if (closeCartBtn) {
  closeCartBtn.addEventListener('click', () => {
    cartModal.classList.remove('open');
  });
}

if (cartModal) {
  cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) {
      cartModal.classList.remove('open');
    }
  });
}

// ==========================================
// РЕНДЕР КАТАЛОГА
// ==========================================

function renderProducts() {
  if (!grid) return;
  grid.innerHTML = '';

  const filtered = products.filter(product => {
    return currentCategory === 'all' || product.category === currentCategory;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #777;">В этой категории товаров пока нет.</p>';
    return;
  }

  filtered.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';

    const formattedPrice = product.price.toLocaleString('ru-RU');

    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/400x300/e8dccb/8B5A2B?text=Фото'">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-price">${formattedPrice} ₽ <span>/ м²</span></div>
        <button class="product-btn" ${product.inStock ? '' : 'disabled'}>
          ${product.inStock ? 'В корзину' : 'Нет в наличии'}
        </button>
      </div>
    `;

    // Вешаем обработчик на кнопку "В корзину"
    const btn = card.querySelector('.product-btn');
    if (btn && product.inStock) {
      btn.addEventListener('click', () => {
        addToCart(product);
      });
    }
  // Делаем карточку кликабельной (переход на страницу товара)
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      // Если кликнули по кнопке "В корзину" — не переходим
      if (e.target.classList.contains('product-btn')) return;
      window.location.href = `product.html?id=${product.id}`;
    });

    grid.appendChild(card);
  });
}

// === Фильтры ===
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.getAttribute('data-category');
    renderProducts();
  });
});

// === Запуск ===
renderProducts();
updateCartCounter();
// ==========================================
// ОФОРМЛЕНИЕ ЗАКАЗА (ФОРМА)
// ==========================================

const checkoutBtn = document.getElementById('checkout-btn');
const checkoutFormContainer = document.getElementById('checkout-form-container');
const closeFormBtn = document.getElementById('close-form');
const checkoutForm = document.getElementById('checkout-form');

// Показать форму при клике на "Оформить заказ"
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    // Проверяем, что корзина не пуста
    if (cart.length === 0) {
      alert('Корзина пуста! Добавьте товары перед оформлением.');
      return;
    }
    // Скрываем корзину, показываем форму
    document.querySelector('.cart-content').style.display = 'none';
    checkoutFormContainer.style.display = 'block';
  });
}

// Закрыть форму и вернуться в корзину
if (closeFormBtn) {
  closeFormBtn.addEventListener('click', () => {
    checkoutFormContainer.style.display = 'none';
    document.querySelector('.cart-content').style.display = 'block';
    // Очищаем поля формы
    checkoutForm.reset();
  });
}

// Отправка формы
if (checkoutForm) {
  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Останавливаем перезагрузку страницы

    // Собираем данные
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const comment = document.getElementById('comment').value;

    // Формируем текст заказа
    let orderText = `📦 НОВЫЙ ЗАКАЗ!\n\n`;
    orderText += `👤 Имя: ${name}\n`;
    orderText += `📞 Телефон: ${phone}\n`;
    orderText += `📍 Адрес: ${address}\n`;
    if (comment) orderText += `💬 Комментарий: ${comment}\n`;
    orderText += `\n🛒 Товары:\n`;

    let total = 0;
    cart.forEach(item => {
      orderText += `- ${item.name} (${item.quantity} шт.) — ${item.price * item.quantity} ₽\n`;
      total += item.price * item.quantity;
    });
    orderText += `\n💰 Итого: ${total.toLocaleString('ru-RU')} ₽`;

    // Пока что просто выводим в консоль и показываем пользователю
    console.log("=== НОВЫЙ ЗАКАЗ ===");
    console.log(orderText);

    // Очищаем корзину
    cart = [];
    saveCart();
    updateCartCounter();
    renderCart();

    // Показываем сообщение об успехе
    checkoutFormContainer.innerHTML = `
      <div class="cart-header">
        <h2>Заказ оформлен!</h2>
        <button class="close-btn" onclick="document.getElementById('cart-modal').classList.remove('open')">&times;</button>
      </div>
      <div class="success-message" style="display: block;">
        <h3>Спасибо, ${name}!</h3>
        <p>Ваш заказ на сумму <b>${total.toLocaleString('ru-RU')} ₽</b> принят.</p>
        <p>Мы свяжемся с вами по номеру <b>${phone}</b> для подтверждения.</p>
        <button onclick="document.getElementById('cart-modal').classList.remove('open')" class="submit-btn" style="margin-top: 15px;">Вернуться в магазин</button>
      </div>
    `;

    // Для реального магазина здесь нужно отправить orderText на сервер или в Telegram
    // alert("Заказ оформлен! (В реальности здесь будет отправка на сервер)");
  });
}
// ==========================================
// СТРАНИЦА ТОВАРА (product.html)
// ==========================================
const productDetailsContainer = document.getElementById('product-details');

if (productDetailsContainer) {
  // Получаем ID товара из адресной строки (например, product.html?id=2)
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get('id'));

  // Ищем товар в массиве products по ID
  const product = products.find(p => p.id === productId);

  if (product) {
    // Меняем заголовок страницы
    document.title = `${product.name} — СВОЙ СТИЛЬ`;

    // Формируем HTML
    productDetailsContainer.innerHTML = `
      <div class="product-page-image">
        <img src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/400x300/e8dccb/8B5A2B?text=Фото'">
      </div>
      <div class="product-page-info">
        <div class="category-label">${getCategoryName(product.category)}</div>
        <h1>${product.name}</h1>
        <div class="price">${product.price.toLocaleString('ru-RU')} ₽ / м²</div>
        <p class="description">${product.description}</p>
        <button class="product-btn" id="add-to-cart-detail" ${product.inStock ? '' : 'disabled'}>
          ${product.inStock ? 'Добавить в корзину' : 'Нет в наличии'}
        </button>
      </div>
    `;

    // Обработчик для кнопки "Добавить в корзину" на странице товара
    const addBtn = document.getElementById('add-to-cart-detail');
    if (addBtn && product.inStock) {
      addBtn.addEventListener('click', () => {
        addToCart(product);
        // Небольшое уведомление, что добавлено
        addBtn.textContent = 'Добавлено! ✓';
        setTimeout(() => addBtn.textContent = 'Добавить в корзину', 1500);
      });
    }
  } else {
    productDetailsContainer.innerHTML = '<p>Товар не найден. <a href="index.html">Вернуться в каталог</a></p>';
  }
}

// Вспомогательная функция для красивого названия категории
function getCategoryName(category) {
  const names = {
    'laminate': 'Ламинат',
    'vinyl': 'Кварцвинил',
    'cork': 'Пробка',
    'parquet': 'Паркет'
  };
  return names[category] || 'Напольное покрытие';
}