-- SELECT: all available menu items by ascending price
SELECT
  name,
  description,
  price
FROM MenuItem
WHERE is_available = TRUE
ORDER BY price ASC;

-- SELECT: order history with customer info
SELECT
  o.order_id,
  o.order_time,
  o.order_type,
  o.order_complete,
  c.first_name,
  c.last_name,
  c.email
FROM Orders o
JOIN Customer c ON o.customer_id = c.customer_id
ORDER BY o.order_time DESC;

-- UPDATE: customer contact
UPDATE Customer
SET phone_number = '520-456-2234',
    email = 'marialovessushi@gmail.com'
WHERE customer_id = 1;

-- UPDATE: menu availability
UPDATE MenuItem
SET is_available = FALSE
WHERE menu_item_id = 5;

-- UPDATE: reservation status
UPDATE Reservation
SET status = 'cancelled'
WHERE reservation_id = 1;

-- DELETE: cancelled reservation only
DELETE FROM Reservation
WHERE reservation_id = 1
  AND status = 'cancelled';
