import { Router, Request, Response } from 'express'
import { getDb } from '../db/index.js'
import { broadcastChange } from '../realtime/socket.js'

export const dashboardRouter = Router()

function extractHwid(req: Request): string {
  const qHwid = req.query.hwid as string
  const hHwid = req.headers['x-hwid'] as string
  const bHwid = req.body?.hwid as string
  return (qHwid || hHwid || bHwid || '').trim()
}

// ─── GET /api/dashboard ────────────────────────────────────────────
dashboardRouter.get('/', async (req: Request, res: Response) => {
  const hwid = extractHwid(req)
  const db = await getDb()

  try {
    if (hwid) {
      const row = await db.get(`SELECT * FROM dashboard WHERE hwid = ? LIMIT 1`, [hwid])
      if (row) {
        return res.json([row])
      }
      return res.json([])
    }

    const rows = await db.all(`SELECT * FROM dashboard ORDER BY updated_at DESC`)
    res.json(rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch dashboard data' })
  }
})

// ─── POST /api/dashboard (Upsert KPI state) ────────────────────────
dashboardRouter.post('/', async (req: Request, res: Response) => {
  const hwid = extractHwid(req) || req.body?.hwid || 'default'
  const body = req.body || {}
  const db = await getDb()

  try {
    const existing = await db.get(`SELECT id FROM dashboard WHERE hwid = ? LIMIT 1`, [hwid])

    if (existing) {
      await db.run(
        `UPDATE dashboard SET
          today_sales = ?,
          today_orders = ?,
          total_products = ?,
          total_customers = ?,
          low_stock_items = ?,
          today_profit = ?,
          store_name = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE hwid = ?`,
        [
          Number(body.today_sales || 0),
          Number(body.today_orders || 0),
          Number(body.total_products || 0),
          Number(body.total_customers || 0),
          Number(body.low_stock_items || 0),
          Number(body.today_profit || 0),
          body.store_name || 'EasyMart',
          hwid
        ]
      )
    } else {
      await db.run(
        `INSERT INTO dashboard (hwid, today_sales, today_orders, total_products, total_customers, low_stock_items, today_profit, store_name, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          hwid,
          Number(body.today_sales || 0),
          Number(body.today_orders || 0),
          Number(body.total_products || 0),
          Number(body.total_customers || 0),
          Number(body.low_stock_items || 0),
          Number(body.today_profit || 0),
          body.store_name || 'EasyMart'
        ]
      )
    }

    const updated = await db.get(`SELECT * FROM dashboard WHERE hwid = ? LIMIT 1`, [hwid])
    broadcastChange(hwid, 'dashboard', 'UPDATE', updated)

    res.json(updated)
  } catch (err: any) {
    console.error('[Dashboard POST] Error:', err)
    res.status(500).json({ error: err.message || 'Failed to save dashboard' })
  }
})

// ─── DELETE /api/dashboard/:hwid ───────────────────────────────────
dashboardRouter.delete('/:hwid', async (req: Request, res: Response) => {
  const { hwid } = req.params
  const db = await getDb()

  try {
    await db.run(`DELETE FROM dashboard WHERE hwid = ?`, [hwid])
    broadcastChange(hwid, 'dashboard', 'DELETE', { hwid })
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete dashboard' })
  }
})
