// =========================================================================
// 1. ХРАНИЛИЩЕ И ИНИЦИАЛИЗАЦИЯ КОРЗИНЫ МАГАЗИНА AssumXOemoc
// =========================================================================

let cart = JSON.parse(localStorage.getItem('disk_cart')) || [];

const cartCountEl = document.getElementById('cartCount');
const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const closeModal = document.getElementById('closeModal');
const cartItemsList = document.getElementById('cartItemsList');
const cartTotalSum = document.getElementById('cartTotalSum');
const checkoutBtn = document.getElementById('checkoutBtn');

const orderFormModal = document.getElementById('orderFormModal');
const closeOrderModal = document.getElementById('closeOrderModal');
const formTotalSum = document.getElementById('formTotalSum');
const purchaseForm = document.getElementById('purchaseForm');

let currentTotalGlobal = 0;

// =========================================================================
// 2. ФУНКЦИИ ИНТЕРФЕЙСА И УПРАВЛЕНИЯ КОРЗИНОЙ
// =========================================================================

function updateCartUI() {
    if (cartCountEl) cartCountEl.textContent = cart.length;
    if (cartItemsList) cartItemsList.innerHTML = '';
    
    let total = 0;
    
    if (cart.length === 0) {
        if (cartItemsList) {
            cartItemsList.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px 0;">Корзина пуста</p>';
        }
    } else {
        cart.forEach((item, index) => {
            total += item.price;
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div class="cart-item-title">${item.name}</div>
                <div>
                    <span style="font-weight: 600; margin-right: 15px;">${item.price} ₽</span>
                    <button class="cart-item-remove" onclick="removeFromCart(${index})">Удалить</button>
                </div>
            `;
            if (cartItemsList) cartItemsList.appendChild(itemEl);
        });
    }
    
    currentTotalGlobal = total;
    
    if (cartTotalSum) cartTotalSum.textContent = total.toLocaleString('ru-RU');
    if (formTotalSum) formTotalSum.textContent = total.toLocaleString('ru-RU');
    
    localStorage.setItem('disk_cart', JSON.stringify(cart));
    syncBuyButtons();
}

function syncBuyButtons() {
    document.querySelectorAll('.btn-buy').forEach(button => {
        const name = button.getAttribute('data-name');
        const isAlreadyInCart = cart.some(item => item.name === name);
        
        if (isAlreadyInCart) {
            button.textContent = 'В корзине ✓';
            button.style.background = '#10b981';
            button.style.borderColor = '#10b981';
            button.style.color = '#fff';
        } else {
            button.textContent = 'В корзину';
            button.style.background = 'transparent';
            button.style.borderColor = 'var(--accent)';
            button.style.color = 'var(--accent)';
        }
    });
}

function addToCart(name, price) {
    const isAlreadyInCart = cart.some(item => item.name === name);
    if (!isAlreadyInCart) {
        cart.push({ name, price: parseInt(price) });
        updateCartUI();
        
        if (cartBtn) {
            cartBtn.style.transform = 'scale(1.1)';
            setTimeout(() => cartBtn.style.transform = 'scale(1)', 200);
        }
    } else {
        if (cartModal) cartModal.classList.add('open');
    }
}

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    updateCartUI();
}

document.querySelectorAll('.btn-buy').forEach(button => {
    button.addEventListener('click', () => {
        const name = button.getAttribute('data-name');
        const price = button.getAttribute('data-price');
        addToCart(name, price);
    });
});

if (cartBtn) cartBtn.addEventListener('click', () => cartModal.classList.add('open'));
if (closeModal) closeModal.addEventListener('click', () => cartModal.classList.remove('open'));

if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Добавьте хотя бы один жесткий диск в корзину!');
            return;
        }
        cartModal.classList.remove('open');
        orderFormModal.classList.add('open');
    });
}

if (closeOrderModal) {
    closeOrderModal.addEventListener('click', () => orderFormModal.classList.remove('open'));
}

window.addEventListener('click', (e) => {
    if (e.target === cartModal) cartModal.classList.remove('open');
    if (e.target === orderFormModal) orderFormModal.classList.remove('open');
});
// =========================================================================
// 3. ОБРАБОТКА ФОРМЫ И МГНОВЕННАЯ ОТПРАВКА ЗАКАЗА В TELEGRAM (ЧЕРЕЗ FETCH)
// =========================================================================
if (purchaseForm) {
    purchaseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const token = '9094415676:AAFk448_W9JTWFr6PuV2od8wTnJwEQMtNTU';
        const chat_id = '1275147591';

        const name = document.getElementById('clientName').value;
        const phone = document.getElementById('clientPhone').value;
        const deliverySelect = document.getElementById('deliveryType');
        const deliveryText = deliverySelect.options[deliverySelect.selectedIndex].text;
        const comment = document.getElementById('clientComment').value || 'Нет комментария';

        const selectedMethodEl = document.querySelector('input[name="contactMethod"]:checked');
        const contactMethod = selectedMethodEl ? selectedMethodEl.value : 'Не указан';

        let itemsText = '';
        cart.forEach((item, index) => {
            itemsText += `${index + 1}. ${item.name} — ${item.price} ₽\n`;
        });

        let message = `🔔 *Новый заказ в AssumXOemoc!*\n\n`;
        message += `👤 *Покупатель:* ${name}\n`;
        message += `📞 *Телефон:* ${phone}\n`;
        message += `💬 *Связь через:* ${contactMethod}\n`;
        message += `📦 *Доставка:* ${deliveryText}\n`;
        message += `💬 *Комментарий:* ${comment}\n\n`;
        message += `🛒 *Состав заказа:*\n${itemsText}\n`;
        message += `💰 *Итого к оплате:* *${currentTotalGlobal.toLocaleString('ru-RU')} ₽*`;

        const domain = 'api.tele';
        const path = 'gram.org';
        const full_url = 'https://' + domain + path + '/bot' + token + '/sendMessage';

        fetch(full_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chat_id,
                text: message,
                parse_mode: 'Markdown'
            })
        })
        .then(response => {
            if (response.ok) {
                alert(`Спасибо за заказ, ${name}!\nУведомление отправлено в AssumXOemoc. Мы свяжемся с вами в ${contactMethod} в ближайшее время.`);
                purchaseForm.reset();
                cart = [];
                updateCartUI();
                orderFormModal.classList.remove('open');
            } else {
                alert('Ошибка отправки. Убедитесь, что вы нажали СТАРТ в самом боте в Telegram.');
            }
        })
        .catch(error => {
            console.error('Ошибка сети Telegram API:', error);
            alert('Ошибка соединения. Браузер заблокировал локальный запрос (CORS). Пожалуйста, выложите сайт в интернет для полноценной работы бота.');
        });
    });
}

// =========================================================================
// 4. КОМБИНИРОВАННАЯ ФИЛЬТРАЦИЯ ДИСКОВ ПО ТРЕМ КРИТЕРИЯМ
// =========================================================================
const filterButtons = document.querySelectorAll('.filter-btn');
const filterSizeSelect = document.getElementById('filterSize');
const filterRpmSelect = document.getElementById('filterRpm');
const productCards = document.querySelectorAll('.product-card');

let activeStatusFilter = 'all';

if (productCards.length > 0) {
    function filterProducts() {
        const selectedSize = filterSizeSelect ? filterSizeSelect.value : 'all';
        const selectedRpm = filterRpmSelect ? filterRpmSelect.value : 'all';

        productCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            const cardSize = card.getAttribute('data-size');
            const cardRpm = card.getAttribute('data-rpm');

            const matchStatus = (activeStatusFilter === 'all' || cardCategory === activeStatusFilter);
            const matchSize = (selectedSize === 'all' || cardSize === selectedSize);
            const matchRpm = (selectedRpm === 'all' || cardRpm === selectedRpm);

            if (matchStatus && matchSize && matchRpm) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            activeStatusFilter = button.getAttribute('data-filter');
            filterProducts();
        });
    });

    if (filterSizeSelect) filterSizeSelect.addEventListener('change', filterProducts);
    if (filterRpmSelect) filterRpmSelect.addEventListener('change', filterProducts);
}

// =========================================================================
// 5. ПЕРВИЧНЫЙ ЗАПУСК
// =========================================================================
updateCartUI();
