# Restaurant Phase 3 Web Application

A full-stack restaurant management web app built for Phase 3, connected to the Phase 2 relational database design.

## Application Overview

This application provides a browser UI to manage:

- `Customer`
- `DiningTable`
- `MenuItem`
- `Reservation`
- `Orders`
- `OrderItem`
- `Payment`

It is implemented with:

- **Backend:** Node.js + Express
- **Database:** SQLite (`better-sqlite3`)
- **Frontend:** EJS templates + CSS

## Main Features

- Dashboard with live counts and quick navigation cards
- Customer create and list
- Dining table create and list
- Menu item create and availability toggle
- Reservation create, status update, and delete when cancelled
- Order creation with multiple menu items
- Automatic payment record creation for each order
- Payment status update to mark as paid

## Project Structure

- `server.js` - Express server and routes
- `db.js` - schema creation and seed data
- `views/` - EJS page templates
- `public/styles.css` - app styling
- `queries.sql` - sample SQL queries aligned with requirements
- `restaurant.db` - SQLite database file (generated/updated at runtime)

## How To Start The Application

1. Open terminal and move into the project folder:

```bash
cd /Users/rianachatterjee/restaurant-phase3-web
```

2. Install dependencies:

```bash
npm install
```

3. Start the app (default port `3000`):

```bash
npm start
```

4. Open in browser:

- `http://localhost:3000`

If port `3000` is in use, run on another port:

```bash
PORT=3001 npm start
```

Then open:

- `http://localhost:3001`

## Notes

- The database schema is created automatically on first run if missing.
- Seed data is inserted only when tables are empty.
- Uploaded dashboard images in the project root are served by the app.

## Suggested 5-Minute Demo Flow

1. Show dashboard and navigation.
2. Add a customer.
3. Add or toggle a menu item.
4. Create a reservation, update status, and demonstrate delete logic.
5. Create an order with multiple items.
6. Open payments and mark one payment as paid.
7. Return to dashboard and show updated counts.
