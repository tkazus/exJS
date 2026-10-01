// Массив объектов — здесь хранятся все заказы
const orders = [
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
        // Считаем итоговую стоимость: цена × количество
        const total = order.price * order.quantity;

        // Определяем дополнительный класс по статусу
        const extraClass = getStatusClass(order.status);

        // Формируем HTML карточки
        const cardHtml = `
            <div class="order ${extraClass}" data-id="${order.id}">
                <div class="order-info">
                    <h3>№ ${order.number} — ${order.product}</h3>
                    <p>👤 Клиент: <strong>${order.client}</strong></p>
                    <p>📦 ${order.quantity} × ${order.price} ₽ = <strong>${total} ₽</strong></p>
                    <span class="status">${order.status}</span>
                </div>
            </div>
        `;

        // Создаём jQuery-элемент
        const $card = $(cardHtml);

        // Скрываем и добавляем в контейнер
        $card.hide();
        $container.append($card);

        // Плавно показываем (jQuery-эффект fadeIn)
        $card.fadeIn(400);
    });
}

/* ---------- 5. ЗАПУСК ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ---------- */

$(document).ready(function () {
    // Плавное появление заголовка
    $("#mainTitle").hide().fadeIn(600);
    $(".subtitle").hide().fadeIn(900);

    // Первичный вывод заказов
    renderOrders(orders);
});