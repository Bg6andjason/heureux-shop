INSERT INTO
    products (
        name,
        price,
        description,
        category,
        stock,
        image_url
    )
VALUES (
        '經典拿鐵',
        140,
        '順口滑順的經典拿鐵',
        'coffee',
        50,
        NULL
    ),
    (
        '海鹽焦糖拿鐵',
        160,
        '帶有微鹹風味的焦糖拿鐵',
        'coffee',
        40,
        NULL
    ),
    (
        '抹茶拿鐵',
        150,
        '濃郁抹茶搭配鮮奶',
        'tea',
        30,
        NULL
    ),
    (
        '香草冷萃咖啡',
        170,
        '香草風味冷萃咖啡',
        'coffee',
        20,
        NULL
    );

-- Demo user (password: demo123)
INSERT INTO
    users (email, password_hash, name)
VALUES (
        'demo@example.com',
        '$2b$10$JxS406dtDOdK/jp5nlRb7OpTMf3jozTkdP/IUX1tv1lhyKtOHb67a',
        'Demo User'
    );

-- Demo admin (password: heureux-admin)
INSERT INTO
    admin_users (email, password_hash, name)
VALUES (
        'admin@heureux.local',
        '$2b$10$1l0ho4zMUxd581Y8o457e.UmFAlIMQUeTARfG1k6JaTxnmEW.ADOi',
        'CMS Admin'
    );

-- Demo orders (user_id = 1)
INSERT INTO
    orders (user_id, total, status)
VALUES (1, 450, 'completed'),
    (1, 320, 'paid');

INSERT INTO
    order_items (
        order_id,
        product_id,
        name,
        price,
        quantity
    )
VALUES (1, 1, '經典拿鐵', 140, 2),
    (1, 2, '海鹽焦糖拿鐵', 160, 1),
    (2, 3, '抹茶拿鐵', 150, 1),
    (2, 4, '香草冷萃咖啡', 170, 1);

-- Demo cart (user_id = 1)
INSERT INTO
    cart_items (user_id, product_id, quantity)
VALUES (1, 1, 2),
    (1, 2, 1);
