const express = require("express");
const Database = require("better-sqlite3");

const app = express();
const port = process.env.PORT || 3000;
const db = new Database("restaurant.db");

db.pragma("foreign_keys = ON");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS Customer (
      customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT,
      last_name TEXT,
      phone_number TEXT,
      email TEXT
    );
    CREATE TABLE IF NOT EXISTS DiningTable (
      table_id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_number INTEGER,
      capacity INTEGER
    );
    CREATE TABLE IF NOT EXISTS MenuItem (
      menu_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT,
      price REAL,
      is_available INTEGER
    );
    CREATE TABLE IF NOT EXISTS Reservation (
      reservation_id INTEGER PRIMARY KEY AUTOINCREMENT,
      reservation_time TEXT,
      party_size INTEGER,
      special_request TEXT,
      status TEXT,
      customer_id INTEGER NOT NULL REFERENCES Customer(customer_id),
      table_id INTEGER NOT NULL REFERENCES DiningTable(table_id)
    );
    CREATE TABLE IF NOT EXISTS Orders (
      order_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_time TEXT,
      order_type TEXT,
      order_complete INTEGER,
      customer_id INTEGER NOT NULL REFERENCES Customer(customer_id)
    );
    CREATE TABLE IF NOT EXISTS OrderItem (
      order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      quantity INTEGER,
      item_price REAL,
      order_id INTEGER NOT NULL REFERENCES Orders(order_id),
      menu_item_id INTEGER NOT NULL REFERENCES MenuItem(menu_item_id)
    );
    CREATE TABLE IF NOT EXISTS Payment (
      payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL,
      method TEXT,
      status TEXT,
      paid_time TEXT,
      order_id INTEGER NOT NULL REFERENCES Orders(order_id)
    );
  `);

  if (db.prepare("SELECT COUNT(*) c FROM Customer").get().c === 0) {
    db.prepare("INSERT INTO Customer (first_name,last_name,phone_number,email) VALUES (?,?,?,?)")
      .run("Maria", "Lopez", "520-456-2234", "marialovessushi@gmail.com");
  }
  const customerSeed = [
    ["Maria", "Lopez", "520-456-2234", "marialovessushi@gmail.com"],
    ["Ava", "Johnson", "520-300-1101", "ava.johnson@example.com"],
    ["Noah", "Kim", "520-300-1102", "noah.kim@example.com"],
    ["Liam", "Patel", "520-300-1103", "liam.patel@example.com"],
    ["Emma", "Rivera", "520-300-1104", "emma.rivera@example.com"],
    ["Sophia", "Nguyen", "520-300-1105", "sophia.nguyen@example.com"]
  ];
  const customerExists = db.prepare("SELECT 1 FROM Customer WHERE email = ? LIMIT 1");
  const addCustomer = db.prepare("INSERT INTO Customer (first_name,last_name,phone_number,email) VALUES (?,?,?,?)");
  for (const customer of customerSeed) {
    if (!customerExists.get(customer[3])) addCustomer.run(...customer);
  }

  if (db.prepare("SELECT COUNT(*) c FROM DiningTable").get().c === 0) {
    db.prepare("INSERT INTO DiningTable (table_number,capacity) VALUES (1,2),(2,4),(3,6)").run();
  }
  if (db.prepare("SELECT COUNT(*) c FROM MenuItem").get().c === 0) {
    db.prepare(`
      INSERT INTO MenuItem (name,description,price,is_available)
      VALUES
      ('Grilled Sushi','Chef special grilled sushi rolls',14.99,1),
      ('Pizza with Vodka Sauce','Signature pizza',21.99,1),
      ('Miso Soup','Classic miso broth',5.99,1)
    `).run();
  }
  const menuSeed = [
    ["Grilled Sushi", "Chef special grilled sushi rolls", 14.99, 1],
    ["Pizza with Vodka Sauce", "Signature pizza", 21.99, 1],
    ["Miso Soup", "Classic miso broth", 5.99, 1],
    ["Spicy Tuna Roll", "Tuna, chili mayo, cucumber", 12.49, 1],
    ["Chicken Alfredo Pasta", "Creamy alfredo with grilled chicken", 16.99, 1],
    ["Margherita Pizza", "Fresh basil, mozzarella, tomato sauce", 15.5, 1],
    ["Beef Ramen", "Rich broth with slow-cooked beef", 13.75, 1],
    ["Caesar Salad", "Romaine, parmesan, croutons", 8.25, 1],
    ["Chocolate Lava Cake", "Warm cake with melted center", 7.5, 1]
  ];
  const menuExists = db.prepare("SELECT 1 FROM MenuItem WHERE name = ? LIMIT 1");
  const addMenuItem = db.prepare("INSERT INTO MenuItem (name,description,price,is_available) VALUES (?,?,?,?)");
  for (const item of menuSeed) {
    if (!menuExists.get(item[0])) addMenuItem.run(...item);
  }
}

function page(title, body) {
  return `
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${title}</title>
      <style>
        body{font-family:Arial,sans-serif;margin:0;background:#f3f4f6;color:#111827}
        nav{background:#111827;padding:12px;display:flex;gap:8px;flex-wrap:wrap}
        nav a{color:#fff;text-decoration:none;background:#374151;padding:8px 10px;border-radius:8px}
        main{max-width:1080px;margin:20px auto;padding:0 12px}
        .hero{background:linear-gradient(135deg,#1d4ed8,#4338ca);color:#fff;padding:20px;border-radius:14px}
        .img{margin-top:12px;border-radius:14px;overflow:hidden;background:#fff}
        .img img{width:100%;max-height:340px;object-fit:cover;display:block}
        .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-top:14px}
        .card{background:#fff;padding:14px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,.08)}
        table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;margin-top:12px}
        th,td{padding:10px;border-bottom:1px solid #e5e7eb;text-align:left}
        form{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
        input,select,button{padding:8px;border-radius:8px;border:1px solid #d1d5db}
        button{background:#2563eb;color:#fff;border:none;cursor:pointer}
      </style>
    </head>
    <body>
      <nav>
        <a href="/">Dashboard</a>
        <a href="/customers">Customers</a>
        <a href="/menu">Menu</a>
        <a href="/reservations">Reservations</a>
        <a href="/orders">Orders</a>
        <a href="/payments">Payments</a>
      </nav>
      <main>${body}</main>
    </body>
    </html>
  `;
}

app.get("/", (req, res) => {
  const s = {
    customers: db.prepare("SELECT COUNT(*) c FROM Customer").get().c,
    menu: db.prepare("SELECT COUNT(*) c FROM MenuItem").get().c,
    reservations: db.prepare("SELECT COUNT(*) c FROM Reservation").get().c,
    orders: db.prepare("SELECT COUNT(*) c FROM Orders").get().c,
    payments: db.prepare("SELECT COUNT(*) c FROM Payment").get().c
  };
  res.send(page("Dashboard", `
    <section class="hero"><h1>Phase 3 Demo Dashboard</h1></section>
    <section class="img"><img src="/new_restaurant.avif" alt="Restaurant image" /></section>
    <section class="grid">
      <a href="/customers" class="card" style="text-decoration:none;color:inherit"><h3>Customers</h3><h1>${s.customers}</h1></a>
      <a href="/menu" class="card" style="text-decoration:none;color:inherit"><h3>Menu Items</h3><h1>${s.menu}</h1></a>
      <a href="/reservations" class="card" style="text-decoration:none;color:inherit"><h3>Reservations</h3><h1>${s.reservations}</h1></a>
      <a href="/orders" class="card" style="text-decoration:none;color:inherit"><h3>Orders</h3><h1>${s.orders}</h1></a>
      <a href="/payments" class="card" style="text-decoration:none;color:inherit"><h3>Payments</h3><h1>${s.payments}</h1></a>
    </section>
  `));
});

app.get("/customers", (req, res) => {
  const rows = db.prepare("SELECT * FROM Customer ORDER BY customer_id DESC").all();
  const body = rows.map(r => `<tr><td>${r.customer_id}</td><td>${r.first_name} ${r.last_name}</td><td>${r.phone_number}</td><td>${r.email}</td></tr>`).join("");
  res.send(page("Customers", `
    <h1>Customers</h1>
    <form method="post" action="/customers">
      <input name="first_name" placeholder="First name" required />
      <input name="last_name" placeholder="Last name" required />
      <input name="phone_number" placeholder="Phone" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit">Add</button>
    </form>
    <table><tr><th>ID</th><th>Name</th><th>Phone</th><th>Email</th></tr>${body}</table>
  `));
});
app.post("/customers", (req, res) => {
  const { first_name, last_name, phone_number, email } = req.body;
  db.prepare("INSERT INTO Customer (first_name,last_name,phone_number,email) VALUES (?,?,?,?)")
    .run(first_name, last_name, phone_number, email);
  res.redirect("/customers");
});

app.get("/menu", (req, res) => {
  const rows = db.prepare("SELECT * FROM MenuItem ORDER BY price ASC").all();
  const body = rows.map(r => `
    <tr>
      <td>${r.menu_item_id}</td><td>${r.name}</td><td>${r.description}</td><td>$${Number(r.price).toFixed(2)}</td><td>${r.is_available ? "Yes" : "No"}</td>
      <td><form method="post" action="/menu/${r.menu_item_id}/toggle"><button type="submit">${r.is_available ? "Disable" : "Enable"}</button></form></td>
    </tr>`).join("");
  res.send(page("Menu", `
    <h1>Menu</h1>
    <form method="post" action="/menu">
      <input name="name" placeholder="Name" required />
      <input name="description" placeholder="Description" required />
      <input name="price" type="number" min="0" step="0.01" placeholder="Price" required />
      <button type="submit">Add</button>
    </form>
    <table><tr><th>ID</th><th>Name</th><th>Description</th><th>Price</th><th>Available</th><th>Action</th></tr>${body}</table>
  `));
});
app.post("/menu", (req, res) => {
  const { name, description, price } = req.body;
  db.prepare("INSERT INTO MenuItem (name,description,price,is_available) VALUES (?,?,?,1)").run(name, description, price);
  res.redirect("/menu");
});
app.post("/menu/:id/toggle", (req, res) => {
  db.prepare("UPDATE MenuItem SET is_available = CASE WHEN is_available=1 THEN 0 ELSE 1 END WHERE menu_item_id=?").run(req.params.id);
  res.redirect("/menu");
});

app.get("/reservations", (req, res) => {
  const customers = db.prepare("SELECT customer_id, first_name || ' ' || last_name n FROM Customer ORDER BY n").all();
  const tables = db.prepare("SELECT table_id, table_number FROM DiningTable ORDER BY table_number").all();
  const rows = db.prepare(`
    SELECT r.reservation_id, r.reservation_time, r.party_size, r.status,
           c.first_name || ' ' || c.last_name customer_name, d.table_number
    FROM Reservation r JOIN Customer c ON c.customer_id=r.customer_id
    JOIN DiningTable d ON d.table_id=r.table_id
    ORDER BY r.reservation_id DESC
  `).all();
  const cOptions = customers.map(c => `<option value="${c.customer_id}">${c.n}</option>`).join("");
  const tOptions = tables.map(t => `<option value="${t.table_id}">Table ${t.table_number}</option>`).join("");
  const body = rows.map(r => `<tr><td>${r.reservation_id}</td><td>${r.reservation_time}</td><td>${r.customer_name}</td><td>${r.table_number}</td><td>${r.party_size}</td><td>${r.status}</td></tr>`).join("");
  res.send(page("Reservations", `
    <h1>Reservations</h1>
    <form method="post" action="/reservations">
      <input type="datetime-local" name="reservation_time" required />
      <input type="number" min="1" name="party_size" placeholder="Party size" required />
      <input name="special_request" placeholder="Special request" />
      <select name="status"><option>confirmed</option><option>pending</option><option>cancelled</option></select>
      <select name="customer_id" required><option value="">Customer</option>${cOptions}</select>
      <select name="table_id" required><option value="">Table</option>${tOptions}</select>
      <button type="submit">Add</button>
    </form>
    <table><tr><th>ID</th><th>Time</th><th>Customer</th><th>Table</th><th>Party</th><th>Status</th></tr>${body}</table>
  `));
});
app.post("/reservations", (req, res) => {
  const { reservation_time, party_size, special_request, status, customer_id, table_id } = req.body;
  db.prepare("INSERT INTO Reservation (reservation_time,party_size,special_request,status,customer_id,table_id) VALUES (?,?,?,?,?,?)")
    .run(reservation_time, party_size, special_request || "", status, customer_id, table_id);
  res.redirect("/reservations");
});

app.get("/orders", (req, res) => {
  const customers = db.prepare("SELECT customer_id, first_name || ' ' || last_name n FROM Customer ORDER BY n").all();
  const menu = db.prepare("SELECT menu_item_id, name, price FROM MenuItem WHERE is_available=1 ORDER BY name").all();
  const rows = db.prepare(`
    SELECT o.order_id, o.order_time, o.order_type, c.first_name || ' ' || c.last_name customer_name
    FROM Orders o JOIN Customer c ON c.customer_id=o.customer_id
    ORDER BY o.order_id DESC
  `).all();
  const cOptions = customers.map(c => `<option value="${c.customer_id}">${c.n}</option>`).join("");
  const mOptions = menu.map(m => `<option value="${m.menu_item_id}">${m.name} ($${Number(m.price).toFixed(2)})</option>`).join("");
  const body = rows.map(r => `<tr><td>${r.order_id}</td><td>${r.order_time}</td><td>${r.order_type}</td><td>${r.customer_name}</td></tr>`).join("");
  res.send(page("Orders", `
    <h1>Orders</h1>
    <form method="post" action="/orders">
      <select name="customer_id" required><option value="">Customer</option>${cOptions}</select>
      <select name="order_type"><option>dine-in</option><option>takeout</option><option>delivery</option></select>
      <select name="menu_item_id" required><option value="">Menu item</option>${mOptions}</select>
      <input type="number" name="quantity" min="1" value="1" required />
      <button type="submit">Create Order</button>
    </form>
    <table><tr><th>ID</th><th>Time</th><th>Type</th><th>Customer</th></tr>${body}</table>
  `));
});
app.post("/orders", (req, res) => {
  const now = new Date().toISOString();
  const { customer_id, order_type, menu_item_id, quantity } = req.body;
  const q = Number(quantity);
  const menu = db.prepare("SELECT price FROM MenuItem WHERE menu_item_id=?").get(menu_item_id);
  if (!menu || !q || q <= 0) return res.redirect("/orders");

  const order = db.prepare("INSERT INTO Orders (order_time,order_type,order_complete,customer_id) VALUES (?,?,0,?)")
    .run(now, order_type, customer_id);
  db.prepare("INSERT INTO OrderItem (quantity,item_price,order_id,menu_item_id) VALUES (?,?,?,?)")
    .run(q, menu.price, order.lastInsertRowid, menu_item_id);
  db.prepare("INSERT INTO Payment (amount,method,status,paid_time,order_id) VALUES (?,?,?,NULL,?)")
    .run((Number(menu.price) * q).toFixed(2), "card", "pending", order.lastInsertRowid);
  res.redirect("/orders");
});

app.get("/payments", (req, res) => {
  const rows = db.prepare(`
    SELECT p.payment_id, p.amount, p.method, p.status, p.paid_time, p.order_id,
           c.first_name || ' ' || c.last_name customer_name
    FROM Payment p
    JOIN Orders o ON o.order_id = p.order_id
    JOIN Customer c ON c.customer_id = o.customer_id
    ORDER BY p.payment_id DESC
  `).all();
  const body = rows.map(r => `
    <tr>
      <td>${r.payment_id}</td><td>${r.order_id}</td><td>${r.customer_name}</td><td>$${Number(r.amount).toFixed(2)}</td><td>${r.status}</td><td>${r.method}</td><td>${r.paid_time || "-"}</td>
      <td>${r.status === "paid" ? "" : `<form method="post" action="/payments/${r.payment_id}/paid"><button type="submit">Mark Paid</button></form>`}</td>
    </tr>
  `).join("");
  res.send(page("Payments", `<h1>Payments</h1><table><tr><th>ID</th><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th>Method</th><th>Paid Time</th><th>Action</th></tr>${body}</table>`));
});
app.post("/payments/:id/paid", (req, res) => {
  db.prepare("UPDATE Payment SET status='paid', paid_time=CURRENT_TIMESTAMP WHERE payment_id=?").run(req.params.id);
  res.redirect("/payments");
});

initDb();
app.listen(port, () => {
  console.log(`Simple app running: http://localhost:${port}`);
});
