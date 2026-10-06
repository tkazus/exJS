/* =========================================================
   МЕНЕДЖЕР ЗАКАЗОВ — ЗАНЯТИЕ 4
   Смена статуса и сохранение в localStorage
   ========================================================= */

/* ---------- 1. КОНСТАНТЫ И СТАРТОВЫЕ ДАННЫЕ ---------- */

const STORAGE_KEY = "orders_data";

// Возможные статусы заказа
const STATUSES = ["Новый", "В обработке", "Отправлен", "Доставлен", "Отменён"];

// Стартовые данные (если в localStorage пусто)
const defaultOrders = [
    {
        id: 1,
        number: "A-101",
        client: "Иван Петров",
        product: "Ноутбук",
        quantity: 1,
        price: 55000,
        status: "Новый"
    },
    {
        id: 2,
        number: "A-102",
        client: "Анна Сидорова",
        product: "Мышь",
        quantity: 3,
        price: 1500,
        status: "Отправлен"
    },
    {
        id: 3,
        number: "A-103",
        client: "Олег Кузнецов",
        product: "Клавиатура",
        quantity: 2,
        price: 3200,
        status: "В обработке"
    },
    {
        id: 4,
        number: "A-104",
        client: "Мария Иванова",
        product: "Монитор",
        quantity: 1,
        price: 18000,
        status: "Доставлен"
    }
];

/* ---------- 2. РАБОТА С localStorage ---------- */

// Загрузка заказов из localStorage
function loadOrders() {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
        return defaultOrders.slice();
    }

    try {
        return JSON.parse(data);
    } catch (e) {
        console.error("Ошибка чтения localStorage:", e);
        return defaultOrders.slice();
    }
}

// Сохранение заказов в localStorage
function saveOrders() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

// Основной массив заказов — загружаем из localStorage
let orders = loadOrders();
saveOrders(); // сразу сохраняем, если хранилище было пустое

/* ---------- 3. ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ---------- */

function getStatusClass(status) {
    if (status === "Доставлен") {
        return "done";
    } else if (status === "Отменён") {
        return "cancelled";
    } else {
        return "";
    }
}

/* ---------- 4. СЧЁТЧИК ---------- */

function updateCounter(count) {
    $("#counter").text(count);
}

/* ---------- 5. СООБЩЕНИЯ ПОЛЬЗОВАТЕЛЮ ---------- */

function showMessage(text, isError) {
    const $msg = $("#formMessage");

    $msg.text(text)
        .removeClass("error success")
        .addClass(isError ? "error" : "success")
        .hide()
        .fadeIn(300);

    setTimeout(function () {
        $msg.fadeOut(400);
    }, 3000);
}

/* ---------- 6. ВАЛИДАЦИЯ ФОРМЫ ---------- */

function validateOrder(data) {
    if (!data.number || data.number.trim().length < 2) {
        return { ok: false, message: "Введите номер заказа (минимум 2 символа)" };
    }
    if (!data.client || data.client.trim().length < 2) {
        return { ok: false, message: "Введите имя клиента" };
    }
    if (!data.product || data.product.trim().length < 2) {
        return { ok: false, message: "Введите название товара" };
    }
    if (!data.quantity || Number(data.quantity) <= 0) {
        return { ok: false, message: "Количество должно быть больше 0" };
    }
    if (!data.price || Number(data.price) <= 0) {
        return { ok: false, message: "Стоимость должна быть больше 0" };
    }

    const duplicate = orders.find(function (o) {
        return o.number.toLowerCase() === data.number.trim().toLowerCase();
    });
    if (duplicate) {
        return { ok: false, message: "Заказ с таким номером уже существует" };
    }

    return { ok: true, message: "Заказ успешно добавлен!" };
}

/* ---------- 7. ДОБАВЛЕНИЕ ЗАКАЗА ---------- */

function addOrder(data) {
    let newId = 1;
    if (orders.length > 0) {
        newId = Math.max.apply(null, orders.map(function (o) { return o.id; })) + 1;
    }

    const newOrder = {
        id: newId,
        number: data.number.trim(),
        client: data.client.trim(),
        product: data.product.trim(),
        quantity: Number(data.quantity),
        price: Number(data.price),
        status: data.status
    };

    orders.push(newOrder);
    saveOrders();  // сохраняем после добавления
    return newOrder;
}

/* ---------- 8. УДАЛЕНИЕ ЗАКАЗА ---------- */

function deleteOrder(id) {
    const index = orders.findIndex(function (o) { return o.id === id; });

    if (index !== -1) {
        orders.splice(index, 1);
        saveOrders();  // сохраняем после удаления
        return true;
    }
    return false;
}

/* ---------- 9. СМЕНА СТАТУСА ЗАКАЗА ---------- */

// Переводит статус заказа на следующий по кругу
function changeStatus(id) {
    const order = orders.find(function (o) { return o.id === id; });

    if (!order) {
        return null;
    }

    // Находим текущий статус и берём следующий по кругу
    const currentIndex = STATUSES.indexOf(order.status);
    const nextIndex = (currentIndex + 1) % STATUSES.length;

    order.status = STATUSES[nextIndex];
    saveOrders();  // сохраняем после смены статуса

    return order.status;
}

/* ---------- 10. ВЫВОД ЗАКАЗОВ НА СТРАНИЦУ ---------- */

function renderOrders(list) {
    const $container = $("#ordersList");

    $container.empty();
    updateCounter(list.length);

    if (list.length === 0) {
        $container.append('<p class="empty">Заказы не найдены</p>');
        return;
    }

    list.forEach(function (order) {
        const total = order.price * order.quantity;
        const extraClass = getStatusClass(order.status);

        const cardHtml = `
            <div class="order ${extraClass}" data-id="${order.id}">
                <div class="order-info">
                    <h3>№ ${order.number} — ${order.product}</h3>
                    <p>👤 Клиент: <strong>${order.client}</strong></p>
                    <p>📦 ${order.quantity} × ${order.price} ₽ = <strong>${total} ₽</strong></p>
                    <span class="status">${order.status}</span>
                </div>
                <div class="order-actions">
                    <button class="btn-status" data-action="status">Сменить статус</button>
                    <button class="btn-delete" data-action="delete">Удалить</button>
                </div>
            </div>
        `;

        const $card = $(cardHtml);
        $card.hide();
        $container.append($card);
        $card.fadeIn(400);
    });
}

/* ---------- 11. ПОИСК, ФИЛЬТРЫ, СОРТИРОВКИ ---------- */

function searchOrders(query) {
    const q = query.trim().toLowerCase();

    if (!q) {
        return orders.slice();
    }

    return orders.filter(function (o) {
        return o.client.toLowerCase().includes(q) ||
               o.number.toLowerCase().includes(q);
    });
}

function filterByStatus(list, status) {
    if (!status) {
        return list;
    }
    return list.filter(function (o) {
        return o.status === status;
    });
}

function filterByPrice(list, maxPrice) {
    if (!maxPrice) {
        return list;
    }
    return list.filter(function (o) {
        return o.price <= Number(maxPrice);
    });
}

function sortByPrice(list, direction) {
    const sorted = list.slice();

    if (direction === "asc") {
        sorted.sort(function (a, b) { return a.price - b.price; });
    } else if (direction === "desc") {
        sorted.sort(function (a, b) { return b.price - a.price; });
    }

    return sorted;
}

function sortByNumber(list, direction) {
    const sorted = list.slice();

    if (direction === "asc") {
        sorted.sort(function (a, b) { return a.number.localeCompare(b.number); });
    } else if (direction === "desc") {
        sorted.sort(function (a, b) { return b.number.localeCompare(a.number); });
    }

    return sorted;
}

function applyFiltersAndRender() {
    const query     = $("#searchInput").val();
    const status    = $("#filterStatus").val();
    const maxPrice  = $("#filterPrice").val();
    const sortValue = $("#sortSelect").val();

    let result = searchOrders(query);
    result = filterByStatus(result, status);
    result = filterByPrice(result, maxPrice);

    if (sortValue === "priceAsc") {
        result = sortByPrice(result, "asc");
    } else if (sortValue === "priceDesc") {
        result = sortByPrice(result, "desc");
    } else if (sortValue === "numAsc") {
        result = sortByNumber(result, "asc");
    } else if (sortValue === "numDesc") {
        result = sortByNumber(result, "desc");
    }

    renderOrders(result);
}

/* ---------- 12. ЗАПУСК И СОБЫТИЯ ---------- */

$(document).ready(function () {

    $("#mainTitle").hide().fadeIn(600);
    $(".subtitle").hide().fadeIn(900);

    // Первичный вывод
    applyFiltersAndRender();

    /* --- SUBMIT: добавление заказа --- */
    $("#orderForm").on("submit", function (event) {
        event.preventDefault();

        const data = {
            number:   $("#orderNumber").val(),
            client:   $("#client").val(),
            product:  $("#product").val(),
            quantity: $("#quantity").val(),
            price:    $("#price").val(),
            status:   $("#status").val()
        };

        const check = validateOrder(data);
        if (!check.ok) {
            showMessage(check.message, true);
            return;
        }

        addOrder(data);
        showMessage(check.message, false);
        this.reset();
        applyFiltersAndRender();
    });

    /* --- CLICK: кнопки в карточках заказов --- */
    $("#ordersList").on("click", "button", function () {
        const $btn = $(this);
        const id = Number($btn.closest(".order").data("id"));
        const action = $btn.data("action");

        if (action === "delete") {
            $btn.closest(".order").fadeOut(300, function () {
                deleteOrder(id);
                applyFiltersAndRender();
                showMessage("Заказ удалён", false);
            });
        } else if (action === "status") {
            const newStatus = changeStatus(id);
            if (newStatus) {
                applyFiltersAndRender();
                showMessage("Статус изменён на «" + newStatus + "»", false);
            }
        }
    });

    /* --- INPUT: поиск в реальном времени --- */
    $("#searchInput").on("input", function () {
        applyFiltersAndRender();
    });

    /* --- CHANGE: фильтры и сортировки --- */
    $("#filterStatus, #filterPrice, #sortSelect").on("change", function () {
        applyFiltersAndRender();
    });

    /* --- CLICK: сброс фильтров --- */
    $("#resetBtn").on("click", function () {
        $("#searchInput").val("");
        $("#filterStatus").val("");
        $("#filterPrice").val("");
        $("#sortSelect").val("");
        applyFiltersAndRender();
        showMessage("Фильтры сброшены", false);
    });
});
