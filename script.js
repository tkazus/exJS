// Массив объектов — здесь хранятся все заказы
let orders = [
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

// Возвращает CSS-класс в зависимости от статуса заказа
function getStatusClass(status) {
    if (status === "Доставлен") {
        return "done";
    } else if (status === "Отменён") {
        return "cancelled";
    } else {
        return "";
    }
}

// Обновляет счётчик количества заказов
function updateCounter(count) {
    $("#counter").text(count);
}


// Показывает сообщение под формой: зелёное (успех) или красное (ошибка)
function showMessage(text, isError) {
    const $msg = $("#formMessage");

    $msg.text(text)
        .removeClass("error success")
        .addClass(isError ? "error" : "success")
        .hide()
        .fadeIn(300);

    // Автоскрытие через 3 секунды
    setTimeout(function () {
        $msg.fadeOut(400);
    }, 3000);
}

// Проверяет данные формы. Возвращает объект { ok, message }
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

    // Проверка дубликата номера заказа — метод find
    const duplicate = orders.find(function (o) {
        return o.number.toLowerCase() === data.number.trim().toLowerCase();
    });
    if (duplicate) {
        return { ok: false, message: "Заказ с таким номером уже существует" };
    }

    return { ok: true, message: "Заказ успешно добавлен!" };
}

// Добавляет заказ в массив и возвращает его
function addOrder(data) {
    // Новый id = максимальный существующий + 1
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
    return newOrder;
}

// Удаляет заказ по id через splice
function deleteOrder(id) {
    const index = orders.findIndex(function (o) { return o.id === id; });

    if (index !== -1) {
        orders.splice(index, 1);
        return true;
    }
    return false;
}

// Принимает массив заказов и рисует их в контейнере #ordersList
function renderOrders(list) {
    const $container = $("#ordersList");

    // Очищаем контейнер перед новым выводом
    $container.empty();

    // Обновляем счётчик
    updateCounter(list.length);

    // Если заказов нет — показываем сообщение
    if (list.length === 0) {
        $container.append('<p class="empty">Заказы не найдены</p>');
        return;
    }

    // Цикл forEach по массиву объектов
    list.forEach(function (order) {
        const total = order.price * order.quantity;
        const extraClass = getStatusClass(order.status);

        // Формируем HTML карточки вместе с кнопкой удаления
        const cardHtml = `
            <div class="order ${extraClass}" data-id="${order.id}">
                <div class="order-info">
                    <h3>№ ${order.number} — ${order.product}</h3>
                    <p>👤 Клиент: <strong>${order.client}</strong></p>
                    <p>📦 ${order.quantity} × ${order.price} ₽ = <strong>${total} ₽</strong></p>
                    <span class="status">${order.status}</span>
                </div>
                <div class="order-actions">
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

$(document).ready(function () {

    // Плавное появление заголовка
    $("#mainTitle").hide().fadeIn(600);
    $(".subtitle").hide().fadeIn(900);

    // Первичный вывод заказов
    renderOrders(orders);

    /* --- SUBMIT: добавление заказа --- */
    $("#orderForm").on("submit", function (event) {
        event.preventDefault();

        // Собираем данные из полей формы через .val()
        const data = {
            number:   $("#orderNumber").val(),
            client:   $("#client").val(),
            product:  $("#product").val(),
            quantity: $("#quantity").val(),
            price:    $("#price").val(),
            status:   $("#status").val()
        };

        // Валидация
        const check = validateOrder(data);
        if (!check.ok) {
            showMessage(check.message, true);
            return;
        }

        // Добавляем заказ
        addOrder(data);
        showMessage(check.message, false);

        // Очищаем форму и перерисовываем список
        this.reset();
        renderOrders(orders);
    });

    /* --- CLICK: удаление заказа (делегирование) --- */
    $("#ordersList").on("click", "button", function () {
        const $btn = $(this);
        const id = Number($btn.closest(".order").data("id"));
        const action = $btn.data("action");

        if (action === "delete") {
            // Плавно скрываем карточку, потом удаляем из массива и перерисовываем
            $btn.closest(".order").fadeOut(300, function () {
                deleteOrder(id);
                renderOrders(orders);
                showMessage("Заказ удалён", false);
            });
        }
    });
});
