# Restaurant App (Minimal Version)

Super simplified structure with one main code file.

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
