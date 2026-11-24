// ==========================================
// 1. ПОДКЛЮЧЕНИЕ ТОВАРОВ
// ==========================================
// Массив products загружается из файла products.js (он подключен в HTML перед этим скриптом)
// Если по какой-то причине его нет, создаем пустой массив, чтобы код не упал
const baseProducts = typeof products !== 'undefined' ? products : [];

// Загружаем товары, добавленные через админку (из памяти браузера)
const customProducts = JSON.parse(localStorage.getItem('myCustomProducts')) || [];

// Объединяем базовые товары с добавленными
const allProducts = [...baseProducts, ...customProducts];

// ==========================================
// 2. ПЕРЕМЕННЫЕ
// ==========================================
const grid = document.getElementById('products-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('search-input');
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotalPrice = document.getElementById('cart-total-price');
const productDetailsContainer = document.getElementById('product-details');

// Переменные избранного
const favBtn = document.getElementById('fav-btn');
const favCount = document.getElementById('fav-count');
const closeFavBtn = document.getElementById('close-fav');
const favItemsContainer = document.getElementById('fav-items');
const favModal = document.getElementById('fav-modal');

let currentCategory = 'all';
let searchQuery = '';
let cart = JSON.parse(localStorage.getItem('myCart')) || [];
let favorites = JSON.parse(localStorage.getItem('myFavorites')) || [];

// Читаем категорию из адресной строки (например, ?cat=doors)
const urlParams = new URLSearchParams(window.location.search);
const urlCategory = urlParams.get('cat');
if (urlCategory) currentCategory = urlCategory;

// ==========================================
// 3. КОРЗИНА
// ==========================================
function saveCart() { localStorage.setItem('myCart', JSON.stringify(cart)); }

function updateCartCounter() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCount) cartCount.textContent = totalItems;
}

function addToCart(product) {
  const existingItem = cart.find(item => item.id === product.id);
  if (existingItem) { 
    existingItem.quantity += 1; 
  } else { 
    cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 }); 
  }
  saveCart(); 
  updateCartCounter();
  if (cartBtn) { 
    cartBtn.style.transform = 'scale(1.1)'; 
    setTimeout(() => cartBtn.style.transform = 'scale(1)', 200); 
  }
}

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
      <div class="cart-item-info"><h4>${item.name}</h4><div class="cart-item-price">${item.price.toLocaleString('ru-RU')} ₽</div></div>
      <div class="cart-item-actions">
        <button class="cart-qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
        <span class="cart-item-qty">${item.quantity}</span>
        <button class="cart-qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        <button class="cart-remove-btn" onclick="removeFromCart(${item.id})">×</button>
      </div>`;
    cartItemsContainer.appendChild(itemEl);
  });
  if (cartTotalPrice) cartTotalPrice.textContent = total.toLocaleString('ru-RU');
}

window.changeQty = function(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) { removeFromCart(id); return; }
  saveCart(); renderCart(); updateCartCounter();
};

window.removeFromCart = function(id) { 
  cart = cart.filter(i => i.id !== id); 
  saveCart(); renderCart(); updateCartCounter(); 
};

if (cartBtn) cartBtn.addEventListener('click', () => { renderCart(); cartModal.classList.add('open'); });
if (closeCartBtn) closeCartBtn.addEventListener('click', () => cartModal.classList.remove('open'));

// ==========================================
// 4. ИЗБРАННОЕ
// ==========================================
function saveFavorites() { localStorage.setItem('myFavorites', JSON.stringify(favorites)); }

function updateFavCounter() { 
  if (favCount) favCount.textContent = favorites.length; 
}

function toggleFavorite(product) {
  const index = favorites.findIndex(item => item.id === product.id);
  if (index > -1) { 
    favorites.splice(index, 1); 
  } else { 
    favorites.push({ id: product.id, name: product.name, price: product.price, image: product.image }); 
  }
  saveFavorites(); updateFavCounter(); renderProducts();
}

function renderFavorites() {
  if (!favItemsContainer) return;
  favItemsContainer.innerHTML = '';
  
  if (favorites.length === 0) { 
    favItemsContainer.innerHTML = '<p style="text-align:center; color:#777; padding: 20px 0;">В избранном пока пусто</p>'; 
    return; 
  }
  
  favorites.forEach(item => {
    const el = document.createElement('div');
    el.className = 'fav-item';
    el.innerHTML = `
      <div class="fav-item-info"><h4>${item.name}</h4><div class="fav-item-price">${item.price.toLocaleString('ru-RU')} ₽</div></div>
      <div class="fav-item-actions"><button onclick="removeFavorite(${item.id})">×</button></div>`;
    favItemsContainer.appendChild(el);
  });
}

window.removeFavorite = function(id) { 
  favorites = favorites.filter(item => item.id !== id); 
  saveFavorites(); updateFavCounter(); renderFavorites(); renderProducts(); 
};

if (favBtn) favBtn.addEventListener('click', () => { renderFavorites(); favModal.classList.add('open'); });
if (closeFavBtn) closeFavBtn.addEventListener('click', () => favModal.classList.remove('open'));

// ==========================================
// 5. РЕНДЕР КАТАЛОГА
// ==========================================
function renderProducts() {
  if (!grid) return;
  grid.innerHTML = '';
  
  const filtered = allProducts.filter(product => {
    let matchesCategory = false;
    if (currentCategory === 'floor' || currentCategory === 'all') {
       matchesCategory = ['laminate', 'vinyl', 'cork', 'parquet'].includes(product.category);
       if (currentCategory === 'all' && !urlCategory) matchesCategory = true;
    } else { 
       matchesCategory = product.category === currentCategory; 
    }
    const matchesSearch = searchQuery === '' || product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  if (filtered.length === 0) { 
    grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #777;">Ничего не найдено.</p>'; 
    return; 
  }
  
  filtered.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    const formattedPrice = product.price.toLocaleString('ru-RU');
    const isFav = favorites.some(item => item.id === product.id);
    
    card.innerHTML = `
      <button class="fav-icon ${isFav ? 'active' : ''}" data-id="${product.id}">${isFav ? '❤️' : '🤍'}</button>
      <img src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/400x300/e8dccb/8B5A2B?text=Фото'">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-price">${formattedPrice} ₽ <span>/ м²</span></div>
        <button class="product-btn" ${product.inStock ? '' : 'disabled'}>${product.inStock ? 'В корзину' : 'Нет в наличии'}</button>
      </div>`;
      
    card.querySelector('.fav-icon').addEventListener('click', (e) => { e.stopPropagation(); toggleFavorite(product); });
    const btn = card.querySelector('.product-btn');
    if (btn && product.inStock) btn.addEventListener('click', () => addToCart(product));
    
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => { 
      if (e.target.classList.contains('product-btn') || e.target.classList.contains('fav-icon')) return; 
      window.location.href = `product.html?id=${product.id}`; 
    });
    
    grid.appendChild(card);
  });
}

// ==========================================
// 6. ФИЛЬТРЫ И ПОИСК
// ==========================================
function renderFilters() {
  const container = document.getElementById('filters-container');
  if (!container) return;
  container.innerHTML = '';
  
  let buttons = [];
  if (urlCategory === 'doors') buttons = [{ label: 'Все двери', cat: 'doors' }];
  else if (urlCategory === 'plumbing') buttons = [{ label: 'Вся сантехника', cat: 'plumbing' }];
  else if (urlCategory === 'ceramics') buttons = [{ label: 'Весь керамогранит', cat: 'ceramics' }];
  else if (urlCategory === 'wallpaper') buttons = [{ label: 'Все обои', cat: 'wallpaper' }];
  else if (urlCategory === 'lighting') buttons = [{ label: 'Всё освещение', cat: 'lighting' }];
  else buttons = [
    { label: 'Все', cat: 'all' }, 
    { label: 'Ламинат', cat: 'laminate' }, 
    { label: 'Кварцвинил', cat: 'vinyl' }, 
    { label: 'Пробка', cat: 'cork' }, 
    { label: 'Паркет', cat: 'parquet' }
  ];
  
  buttons.forEach((b, index) => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn'; 
    if (index === 0) btn.classList.add('active'); 
    btn.textContent = b.label;
    btn.addEventListener('click', () => { 
      container.querySelectorAll('.filter-btn').forEach(el => el.classList.remove('active')); 
      btn.classList.add('active'); 
      currentCategory = b.cat; 
      renderProducts(); 
    });
    container.appendChild(btn);
  });
}

if (searchInput) searchInput.addEventListener('input', (e) => { searchQuery = e.target.value.trim(); renderProducts(); });

// ==========================================
// 7. ОФОРМЛЕНИЕ ЗАКАЗА
// ==========================================
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutFormContainer = document.getElementById('checkout-form-container');
const closeFormBtn = document.getElementById('close-form');
const checkoutForm = document.getElementById('checkout-form');

if (checkoutBtn) checkoutBtn.addEventListener('click', () => { 
  if (cart.length === 0) return alert('Корзина пуста!'); 
  document.querySelector('.cart-content').style.display = 'none'; 
  checkoutFormContainer.style.display = 'block'; 
});

if (closeFormBtn) closeFormBtn.addEventListener('click', () => { 
  checkoutFormContainer.style.display = 'none'; 
  document.querySelector('.cart-content').style.display = 'block'; 
  checkoutForm.reset(); 
});

if (checkoutForm) {
  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    let total = 0; 
    cart.forEach(item => total += item.price * item.quantity);
    cart = []; saveCart(); updateCartCounter(); renderCart();
    checkoutFormContainer.innerHTML = `
      <div class="cart-header"><h2>Заказ оформлен!</h2><button class="close-btn" onclick="document.getElementById('cart-modal').classList.remove('open')">&times;</button></div>
      <div class="success-message" style="display: block;"><h3>Спасибо, ${name}!</h3><p>Сумма: <b>${total.toLocaleString('ru-RU')} ₽</b>.</p><p>Мы позвоним на <b>${phone}</b>.</p><button onclick="document.getElementById('cart-modal').classList.remove('open')" class="submit-btn" style="margin-top: 15px;">Вернуться</button></div>`;
  });
}

// ==========================================
// 8. СТРАНИЦА ТОВАРА
// ==========================================
if (productDetailsContainer) {
  const productId = parseInt(urlParams.get('id'));
  const product = allProducts.find(p => p.id === productId);
  
  if (product) {
    document.title = `${product.name} — СВОЙ СТИЛЬ`;
    const isFav = favorites.some(item => item.id === product.id);
    productDetailsContainer.innerHTML = `
      <div class="product-page-image"><img src="${product.image}" onerror="this.src='https://placehold.co/400x300/e8dccb/8B5A2B?text=Фото'"></div>
      <div class="product-page-info">
        <div class="category-label">${getCategoryName(product.category)}</div>
        <h1>${product.name}</h1>
        <div class="price">${product.price.toLocaleString('ru-RU')} ₽ / м²</div>
        <p class="description">${product.description}</p>
        <button class="product-btn" id="add-to-cart-detail" ${product.inStock ? '' : 'disabled'}>${product.inStock ? 'Добавить в корзину' : 'Нет в наличии'}</button>
        <button class="product-btn" id="toggle-fav-detail" style="margin-top: 10px; background: #eee; color: #333;">${isFav ? '❤️ В избранном' : '🤍 В избранное'}</button>
      </div>`;
      
    document.getElementById('add-to-cart-detail')?.addEventListener('click', (e) => { 
      addToCart(product); 
      e.target.textContent = 'Добавлено! ✓'; 
      setTimeout(() => e.target.textContent = 'Добавить в корзину', 1500); 
    });
    document.getElementById('toggle-fav-detail')?.addEventListener('click', (e) => { 
      toggleFavorite(product); 
      e.target.textContent = favorites.some(i => i.id === product.id) ? '❤️ В избранном' : '🤍 В избранное'; 
    });
  } else { 
    productDetailsContainer.innerHTML = '<p>Товар не найден.</p>'; 
  }
}

function getCategoryName(category) { 
  const names = { 
    'laminate': 'Ламинат', 
    'vinyl': 'Кварцвинил', 
    'cork': 'Пробка', 
    'parquet': 'Паркет', 
    'doors': 'Двери', 
    'plumbing': 'Сантехника', 
    'ceramics': 'Керамогранит', 
    'wallpaper': 'Обои', 
    'lighting': 'Освещение' 
  }; 
  return names[category] || 'Товар'; 
}

// ==========================================
// 9. ЗАПУСК
// ==========================================
renderFilters();
renderProducts();
updateCartCounter();
updateFavCounter();