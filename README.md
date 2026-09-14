# 🚀 EasyMart Realtime Database Server

High-Performance, Zero-Latency Realtime Database Server for **EasyMart-Pro** (Desktop) and **EasyMart Mobile** (Capacitor/APK).

---

## ⚡ Features

- **⚡ Zero-Lag Realtime Sync**: Built with Express 5 & Socket.IO 4.x with store room isolation (`join:hwid`).
- **🗄️ Universal Database Engine**:
  - Automatically connects to **PostgreSQL** if `DATABASE_URL` is set (Render Managed Postgres, Supabase, Neon, etc.).
  - Uses high-speed **SQLite with WAL mode** (`better-sqlite3`) if no database URL is specified.
- **📦 Pre-configured Tables**:
  1. `sales` (Transactions, receipts, payment status, customer credit)
  2. `sale_items` (Line items, quantity, unit price, discounts)
  3. `daily_sales` (Daily ledger, real-time profit tracking)
  4. `products` (Inventory, multi-language EN/AR/FR, stock levels, barcodes)
  5. `categories` (Hierarchy, colors, translations)
  6. `store_users` (Staff users, PIN authentication, roles)
  7. `permissions` (Role-based access matrix)
  8. `audit_log` (Real-time security and activity audit log)
  9. `staff_tasks` & `staff_task_completions` (Store operations and task tracking)
  10. `expired_products` (Perishable goods & shelf life tracking)
  11. `dashboard` (Real-time aggregated KPIs)
  12. `attendance` (Staff clock-in / clock-out records)
  13. `customers`, `suppliers`, `expenses`, `invoices`, `promotions`, `gift_cards`, `goals`, `challenges`, `analytics_settings`.

---

## 🛠️ Local Development & Testing

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
```bash
npm run dev
```

### 3. Build & Run in Production Mode
```bash
npm run build
npm start
```

### 4. Health Check
Open `http://localhost:3000/health` in your browser. You will see:
```json
{
  "status": "ok",
  "service": "EasyMart Realtime Database Server",
  "version": "2.0.0",
  "databaseEngine": "SQLite WAL Mode",
  "timestamp": "2026-09-14T15:00:00.000Z"
}
```

---

## 🌐 Deploying to Render (Step-by-Step)

### Option A: 1-Click Blueprint Deployment (Recommended)
1. Push this folder (`EasyMart-Server`) to a new GitHub repository (e.g. `easymart-server`).
2. Log into [Render.com](https://render.com).
3. Click **New +** -> **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically detect `render.yaml` and provision:
   - A Node.js Web Service
   - A free PostgreSQL database
   - Automatic environment variables

### Option B: Manual Web Service Deployment
1. Push to GitHub.
2. In Render dashboard, click **New +** -> **Web Service**.
3. Connect your repository.
4. Set the following settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. *(Optional)* Add a PostgreSQL database in Render and set `DATABASE_URL` in the Web Service environment variables.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health and engine status |
| `GET` | `/api/:table` | Get all records for a table (filter by `?hwid=...` or `x-hwid` header) |
| `GET` | `/api/:table/:id` | Get single record by ID or local_id |
| `POST` | `/api/:table` | Insert record + trigger instant Socket.IO broadcast |
| `PATCH` | `/api/:table/:id` | Update record + trigger instant Socket.IO broadcast |
| `DELETE` | `/api/:table/:id` | Delete record + trigger instant Socket.IO broadcast |
| `POST` | `/api/sync/batch` | Bulk insert/update in a single transaction |
| `GET/POST` | `/api/dashboard` | Dashboard KPI query and upsert |
| `POST` | `/api/attendance/upsert` | Staff clock-in / clock-out |

---

## 🔌 Socket.IO Real-time Events

- **Join Store Room**: `socket.emit('join:hwid', 'YOUR_STORE_HWID')`
- **Listen for Realtime Changes**:
```javascript
socket.on('realtime:change', (event) => {
  console.log('Realtime update:', event.table, event.action, event.record)
})
```
