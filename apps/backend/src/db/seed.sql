INSERT INTO products (name, price, description, category, stock, image_url)
SELECT v.name, v.price, v.description, v.category, v.stock, v.image_url
FROM (
    VALUES
        ('Signature Blend Coffee', 140, 'Balanced house blend with caramel and cacao notes.', 'coffee', 50, NULL),
        ('Classic Latte Blend', 160, 'Smooth espresso blend made for milk drinks.', 'coffee', 40, NULL),
        ('Jasmine Green Tea', 150, 'Light floral tea with a clean finish.', 'tea', 30, NULL),
        ('Dark Roast Coffee', 170, 'Bold roast with a deep bittersweet profile.', 'coffee', 20, NULL)
) AS v(name, price, description, category, stock, image_url)
WHERE NOT EXISTS (
    SELECT 1 FROM products p WHERE p.name = v.name
);

-- Demo user (password: demo123)
INSERT INTO users (email, password_hash, name)
VALUES (
    'demo@example.com',
    '$2b$10$JxS406dtDOdK/jp5nlRb7OpTMf3jozTkdP/IUX1tv1lhyKtOHb67a',
    'Demo User'
)
ON CONFLICT (email) DO NOTHING;

-- Demo admin (password: heureux-admin)
INSERT INTO admin_users (email, password_hash, name)
VALUES (
    'admin@heureux.local',
    '$2b$10$1l0ho4zMUxd581Y8o457e.UmFAlIMQUeTARfG1k6JaTxnmEW.ADOi',
    'CMS Admin'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO orders (user_id, total, status)
SELECT u.id, 450, 'completed'
FROM users u
WHERE u.email = 'demo@example.com'
  AND NOT EXISTS (
      SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.total = 450 AND o.status = 'completed'
  );

INSERT INTO orders (user_id, total, status)
SELECT u.id, 320, 'paid'
FROM users u
WHERE u.email = 'demo@example.com'
  AND NOT EXISTS (
      SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.total = 320 AND o.status = 'paid'
  );

INSERT INTO order_items (order_id, product_id, name, price, quantity)
SELECT o.id, p.id, p.name, 140, 2
FROM orders o
JOIN users u ON u.id = o.user_id
JOIN products p ON p.name = 'Signature Blend Coffee'
WHERE u.email = 'demo@example.com' AND o.total = 450
  AND NOT EXISTS (
      SELECT 1 FROM order_items oi WHERE oi.order_id = o.id AND oi.product_id = p.id
  );

INSERT INTO order_items (order_id, product_id, name, price, quantity)
SELECT o.id, p.id, p.name, 160, 1
FROM orders o
JOIN users u ON u.id = o.user_id
JOIN products p ON p.name = 'Classic Latte Blend'
WHERE u.email = 'demo@example.com' AND o.total = 450
  AND NOT EXISTS (
      SELECT 1 FROM order_items oi WHERE oi.order_id = o.id AND oi.product_id = p.id
  );

INSERT INTO order_items (order_id, product_id, name, price, quantity)
SELECT o.id, p.id, p.name, 150, 1
FROM orders o
JOIN users u ON u.id = o.user_id
JOIN products p ON p.name = 'Jasmine Green Tea'
WHERE u.email = 'demo@example.com' AND o.total = 320
  AND NOT EXISTS (
      SELECT 1 FROM order_items oi WHERE oi.order_id = o.id AND oi.product_id = p.id
  );

INSERT INTO order_items (order_id, product_id, name, price, quantity)
SELECT o.id, p.id, p.name, 170, 1
FROM orders o
JOIN users u ON u.id = o.user_id
JOIN products p ON p.name = 'Dark Roast Coffee'
WHERE u.email = 'demo@example.com' AND o.total = 320
  AND NOT EXISTS (
      SELECT 1 FROM order_items oi WHERE oi.order_id = o.id AND oi.product_id = p.id
  );

INSERT INTO cart_items (user_id, product_id, quantity)
SELECT u.id, p.id, 2
FROM users u
JOIN products p ON p.name = 'Signature Blend Coffee'
WHERE u.email = 'demo@example.com'
ON CONFLICT (user_id, product_id) DO NOTHING;

INSERT INTO cart_items (user_id, product_id, quantity)
SELECT u.id, p.id, 1
FROM users u
JOIN products p ON p.name = 'Classic Latte Blend'
WHERE u.email = 'demo@example.com'
ON CONFLICT (user_id, product_id) DO NOTHING;
