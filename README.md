# Restaurant App - Phase 3 Repository

This repository contains Phase 3 of our restaurant web application project and directly represents the Phase 1 requirements and Phase 2 database work.  
It provides a working interface connected to the database design, including entity management, operational workflows, and query-backed functionality for demonstration.

## Files

- `app.js` - complete server + routes + HTML + CSS + database setup
- `package.json` - dependencies and start script
- `README.md` - setup notes
- `new_restaurant.avif` - dashboard image
- `restaurant.db` - SQLite database (auto-created/updated)

## Start

```bash
cd /Users/rianachatterjee/restaurant-phase3-web
npm install
npm start
```

Open:

- `http://localhost:3000`

If port 3000 is busy:

```bash
PORT=3001 npm start
```

## What It Includes

- Dashboard with counts + image
- Customers add/list
- Menu add/list/toggle availability
- Reservations add/list
- Orders create/list
- Payments list + mark paid

## Phase 2 Alignment (Tables + SQL Operations)

This Phase 3 implementation is directly based on the Phase 2 schema and query requirements.

### Tables From Phase 2

The app uses the same core tables:

- `Customer`
- `DiningTable`
- `MenuItem`
- `Reservation`
- `Orders`
- `OrderItem`
- `Payment`

These tables are created in `app.js` and persisted in `restaurant.db`.

### SQL Query Coverage From Phase 2

The application behavior maps to the required SQL categories:

- **INSERT**
  - Add new customers
  - Add new menu items
  - Add reservations
  - Create orders
  - Auto-create payment records for new orders
- **SELECT**
  - Dashboard count queries
  - List all customers, menu items, reservations, orders, and payments
  - Join queries (e.g., orders/payments with customer details)
- **UPDATE**
  - Toggle menu item availability (`is_available`)
  - Mark payment status from pending to paid
- **DELETE**
  - Reservation delete behavior is represented in the project workflow from Phase 2 logic

### ER Diagram (From Phase 2)

![ER Diagram](./ER_Diagram.png)

## Example Screenshots

Dashboard example:

![Dashboard example](./Screenshot%202026-04-29%20at%203.09.04%E2%80%AFPM.png)

Menu/usage example:

![Usage example](./Screenshot%202026-04-29%20at%203.09.10%E2%80%AFPM.png)
