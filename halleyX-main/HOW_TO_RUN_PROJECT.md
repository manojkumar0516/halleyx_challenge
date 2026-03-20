# How to run this project (HalleyX)

## Prerequisites
- Node.js 18+ installed
- npm installed
- MySQL installed and running

## 1) Database setup
1. Open terminal in project root:
   `cd c:\Users\manoj\Downloads\halleyX-main\halleyX-main`
2. Run schema file:
   `mysql -u root -p < schema.sql`
3. Validate:
   `mysql -u root -p -e "SHOW DATABASES; USE halleyx; SHOW TABLES;"`

## 2) Backend setup
1. `cd c:\Users\manoj\Downloads\halleyX-main\halleyX-main\backend`
2. `npm install`
3. Copy `.env` values:
   - `DB_HOST=localhost`
   - `DB_PORT=3306`
   - `DB_USER=root`
   - `DB_PASSWORD=<yourpass>`
   - `DB_NAME=halleyx`
   - `PORT=4000`
4. Start backend:
   `npm run dev` 
5. Confirm endpoint:
   `curl http://localhost:4000/api/orders`

## 3) Frontend setup
1. `cd c:\Users\manoj\Downloads\halleyX-main\halleyX-main`
2. `npm install`
3. Ensure `.env` has:
   `VITE_API_URL=http://localhost:4000`
4. `npm run dev`
5. Open displayed URL (likely `http://localhost:5173`)

## 4) Project behavior
- Frontend loads orders via `/api/orders`
- CRUD operations mapped to:
  - `POST /api/orders`
  - `PUT /api/orders/:id`
  - `DELETE /api/orders/:id`
- Backend uses MySQL `halleyx.orders` table matching project `src/types.ts`

## 5) Notes
- If running from root you may need: `cd halleyX-main` (nested folder path)
- For hot reload, verify `vite.config.ts` proxy is present for `/api` to `http://localhost:4000`
