const express = require("express");
const path = require("path");
const { db, initializeDatabase } = require("./db");

const app = express();
const port = process.env.PORT || 3000;

initializeDatabase();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  const stats = {
    customers: db.prepare("SELECT COUNT(*) AS count FROM Customer").get().count,
    tables: db.prepare("SELECT COUNT(*) AS count FROM DiningTable").get().count,
    menuItems: db.prepare("SELECT COUNT(*) AS count FROM MenuItem").get().count,
    reservations: db.prepare("SELECT COUNT(*) AS count FROM Reservation").get().count,
    orders: db.prepare("SELECT COUNT(*) AS count FROM Orders").get().count,
    payments: db.prepare("SELECT COUNT(*) AS count FROM Payment").get().count
  };

  res.render("index", { stats });
});

app.get("/customers", (req, res) => {
  const customers = db.prepare("SELECT * FROM Customer ORDER BY customer_id DESC").all();
  res.render("customers", { customers });
});

app.post("/customers", (req, res) => {
  const { first_name, last_name, phone_number, email } = req.body;
  db.prepare(`
    INSERT INTO Customer (first_name, last_name, phone_number, email)
    VALUES (?, ?, ?, ?)
  `).run(first_name, last_name, phone_number, email);
  res.redirect("/customers");
});

app.get("/tables", (req, res) => {
  const tables = db.prepare("SELECT * FROM DiningTable ORDER BY table_number ASC").all();
  res.render("tables", { tables });
});

app.post("/tables", (req, res) => {
  const { table_number, capacity } = req.body;
  db.prepare(`
    INSERT INTO DiningTable (table_number, capacity)
    VALUES (?, ?)
  `).run(table_number, capacity);
  res.redirect("/tables");
});

app.get("/menu", (req, res) => {
  const menuItems = db.prepare("SELECT * FROM MenuItem ORDER BY price ASC").all();
  res.render("menu", { menuItems });
});

app.post("/menu", (req, res) => {
  const { name, description, price } = req.body;
  db.prepare(`
    INSERT INTO MenuItem (name, description, price, is_available)
    VALUES (?, ?, ?, 1)
  `).run(name, description, price);
  res.redirect("/menu");
});

app.post("/menu/:id/toggle", (req, res) => {
  db.prepare(`
    UPDATE MenuItem
    SET is_available = CASE WHEN is_available = 1 THEN 0 ELSE 1 END
    WHERE menu_item_id = ?
  `).run(req.params.id);
  res.redirect("/menu");
});

app.get("/reservations", (req, res) => {
  const reservations = db.prepare(`
    SELECT r.*, c.first_name || ' ' || c.last_name AS customer_name, d.table_number
    FROM Reservation r
    JOIN Customer c ON r.customer_id = c.customer_id
    JOIN DiningTable d ON r.table_id = d.table_id
    ORDER BY r.reservation_time DESC
  `).all();
  const customers = db.prepare("SELECT * FROM Customer ORDER BY first_name ASC").all();
  const tables = db.prepare("SELECT * FROM DiningTable ORDER BY table_number ASC").all();
  res.render("reservations", { reservations, customers, tables });
});

app.post("/reservations", (req, res) => {
  const { reservation_time, party_size, special_request, status, customer_id, table_id } = req.body;
  db.prepare(`
    INSERT INTO Reservation (reservation_time, party_size, special_request, status, customer_id, table_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(reservation_time, party_size, special_request, status, customer_id, table_id);
  res.redirect("/reservations");
});

app.post("/reservations/:id/status", (req, res) => {
  db.prepare("UPDATE Reservation SET status = ? WHERE reservation_id = ?")
    .run(req.body.status, req.params.id);
  res.redirect("/reservations");
});

app.post("/reservations/:id/delete", (req, res) => {
  db.prepare("DELETE FROM Reservation WHERE reservation_id = ? AND status = 'cancelled'")
    .run(req.params.id);
  res.redirect("/reservations");
});

app.get("/orders", (req, res) => {
  const customers = db.prepare("SELECT * FROM Customer ORDER BY first_name ASC").all();
  const menuItems = db.prepare("SELECT * FROM MenuItem WHERE is_available = 1 ORDER BY name ASC").all();
  const orders = db.prepare(`
    SELECT o.*, c.first_name || ' ' || c.last_name AS customer_name
    FROM Orders o
    JOIN Customer c ON o.customer_id = c.customer_id
    ORDER BY o.order_time DESC
  `).all();

  res.render("orders", { customers, menuItems, orders });
});

app.post("/orders", (req, res) => {
  const { customer_id, order_type } = req.body;
  const menuIds = Array.isArray(req.body.menu_item_id) ? req.body.menu_item_id : [req.body.menu_item_id];
  const quantities = Array.isArray(req.body.quantity) ? req.body.quantity : [req.body.quantity];

  const now = new Date().toISOString();
  const orderInsert = db.prepare(`
    INSERT INTO Orders (order_time, order_type, order_complete, customer_id)
    VALUES (?, ?, 0, ?)
  `).run(now, order_type, customer_id);

  let totalAmount = 0;
  const itemStmt = db.prepare(`
    INSERT INTO OrderItem (quantity, item_price, order_id, menu_item_id)
    VALUES (?, ?, ?, ?)
  `);
  const menuPriceStmt = db.prepare("SELECT price FROM MenuItem WHERE menu_item_id = ?");

  for (let i = 0; i < menuIds.length; i += 1) {
    const menuId = Number(menuIds[i]);
    const qty = Number(quantities[i]);
    if (!menuId || !qty || qty <= 0) continue;

    const item = menuPriceStmt.get(menuId);
    if (!item) continue;

    itemStmt.run(qty, item.price, orderInsert.lastInsertRowid, menuId);
    totalAmount += Number(item.price) * qty;
  }

  db.prepare(`
    INSERT INTO Payment (amount, method, status, paid_time, order_id)
    VALUES (?, 'card', 'pending', NULL, ?)
  `).run(totalAmount.toFixed(2), orderInsert.lastInsertRowid);

  res.redirect("/orders");
});

app.get("/payments", (req, res) => {
  const payments = db.prepare(`
    SELECT p.*, o.order_type, c.first_name || ' ' || c.last_name AS customer_name
    FROM Payment p
    JOIN Orders o ON p.order_id = o.order_id
    JOIN Customer c ON o.customer_id = c.customer_id
    ORDER BY p.payment_id DESC
  `).all();
  res.render("payments", { payments });
});

app.post("/payments/:id/paid", (req, res) => {
  db.prepare(`
    UPDATE Payment
    SET status = 'paid', paid_time = CURRENT_TIMESTAMP, method = ?
    WHERE payment_id = ?
  `).run(req.body.method || "card", req.params.id);
  res.redirect("/payments");
});

app.listen(port, () => {
  console.log(`Restaurant app running at http://localhost:${port}`);
});
