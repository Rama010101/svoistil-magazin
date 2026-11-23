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