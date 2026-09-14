import { Router, Request, Response } from 'express'
import { getDb } from '../db/index.js'
import { TABLES, TableDefinition } from '../db/schema.js'
import { broadcastChange } from '../realtime/socket.js'

export const crudRouter = Router()

const tableMap = new Map<string, TableDefinition>()
for (const t of TABLES) {
  tableMap.set(t.name, t)
}

function getTableDef(tableName: string): TableDefinition | undefined {
  return tableMap.get(tableName.toLowerCase())
}

function extractHwid(req: Request): string {
  const qHwid = req.query.hwid as string
  const hHwid = req.headers['x-hwid'] as string
  const bHwid = req.body?.hwid as string
  return (qHwid || hHwid || bHwid || '').trim()
}

// ─── GET /api/:table ───────────────────────────────────────────────
crudRouter.get('/:table', async (req: Request, res: Response) => {
  const { table } = req.params
  const tableDef = getTableDef(table)
  if (!tableDef) {
    return res.status(404).json({ error: `Table "${table}" not found` })
  }

  const hwid = extractHwid(req)
  const db = await getDb()

  try {
    let sql: string
    let params: any[] = []

    if (hwid) {
      sql = `SELECT * FROM ${tableDef.name} WHERE hwid = ?`
      params = [hwid]
    } else {
      sql = `SELECT * FROM ${tableDef.name}`
    }

    if (tableDef.columns.includes('created_at')) {
      sql += ' ORDER BY created_at DESC'
    } else {
      sql += ' ORDER BY id DESC'
    }

    const rows = await db.all(sql, params)
    res.json(rows)
  } catch (err: any) {
    console.error(`[CRUD GET] Error reading ${table}:`, err)
    res.status(500).json({ error: err.message || 'Database query failed' })
  }
})

// ─── GET /api/:table/:id ───────────────────────────────────────────
crudRouter.get('/:table/:id', async (req: Request, res: Response) => {
  const { table, id } = req.params
  const tableDef = getTableDef(table)
  if (!tableDef) {
    return res.status(404).json({ error: `Table "${table}" not found` })
  }

  const hwid = extractHwid(req)
  const db = await getDb()

  try {
    let sql: string
    let params: any[]

    if (hwid) {
      sql = `SELECT * FROM ${tableDef.name} WHERE (id = ? OR local_id = ?) AND hwid = ? LIMIT 1`
      params = [id, id, hwid]
    } else {
      sql = `SELECT * FROM ${tableDef.name} WHERE id = ? OR local_id = ? LIMIT 1`
      params = [id, id]
    }

    const row = await db.get(sql, params)
    if (!row) {
      return res.status(404).json({ error: 'Record not found' })
    }

    res.json(row)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Database query failed' })
  }
})

// ─── POST /api/:table ──────────────────────────────────────────────
crudRouter.post('/:table', async (req: Request, res: Response) => {
  const { table } = req.params
  const tableDef = getTableDef(table)
  if (!tableDef) {
    return res.status(404).json({ error: `Table "${table}" not found` })
  }

  const hwid = extractHwid(req) || req.body?.hwid || 'default'
  const body = req.body || {}
  const db = await getDb()

  try {
    const validCols = tableDef.columns.filter((col) => col !== 'id')
    const insertCols: string[] = []
    const values: any[] = []

    for (const col of validCols) {
      if (col === 'hwid') {
        insertCols.push('hwid')
        values.push(hwid)
      } else if (body[col] !== undefined) {
        insertCols.push(col)
        values.push(body[col])
      }
    }

    if (!insertCols.includes('hwid')) {
      insertCols.push('hwid')
      values.push(hwid)
    }

    const placeholders = insertCols.map(() => '?').join(', ')
    const sql = `INSERT INTO ${tableDef.name} (${insertCols.join(', ')}) VALUES (${placeholders})`

    const result = await db.run(sql, values)
    const newId = result.lastInsertRowid

    // Fetch the newly inserted record
    let createdRecord: any = null
    if (newId) {
      createdRecord = await db.get(`SELECT * FROM ${tableDef.name} WHERE id = ?`, [newId])
    }
    if (!createdRecord) {
      createdRecord = { id: newId, hwid, ...body }
    }

    // Zero-lag realtime broadcast
    broadcastChange(hwid, tableDef.name, 'INSERT', createdRecord)

    res.status(201).json(createdRecord)
  } catch (err: any) {
    console.error(`[CRUD POST] Error inserting into ${table}:`, err)
    res.status(500).json({ error: err.message || 'Failed to create record' })
  }
})

// ─── PATCH /api/:table/:id ─────────────────────────────────────────
crudRouter.patch('/:table/:id', async (req: Request, res: Response) => {
  const { table, id } = req.params
  const tableDef = getTableDef(table)
  if (!tableDef) {
    return res.status(404).json({ error: `Table "${table}" not found` })
  }

  const hwid = extractHwid(req)
  const body = req.body || {}
  const db = await getDb()

  try {
    const validCols = tableDef.columns.filter((col) => col !== 'id')
    const updateCols: string[] = []
    const values: any[] = []

    for (const col of validCols) {
      if (body[col] !== undefined) {
        updateCols.push(`${col} = ?`)
        values.push(body[col])
      }
    }

    if (updateCols.length === 0) {
      return res.json({ message: 'No fields to update' })
    }

    let sql: string
    if (hwid) {
      sql = `UPDATE ${tableDef.name} SET ${updateCols.join(', ')} WHERE (id = ? OR local_id = ?) AND hwid = ?`
      values.push(id, id, hwid)
    } else {
      sql = `UPDATE ${tableDef.name} SET ${updateCols.join(', ')} WHERE id = ? OR local_id = ?`
      values.push(id, id)
    }

    await db.run(sql, values)

    // Retrieve updated record
    let updatedRecord = await db.get(
      `SELECT * FROM ${tableDef.name} WHERE (id = ? OR local_id = ?) ${hwid ? 'AND hwid = ?' : ''} LIMIT 1`,
      hwid ? [id, id, hwid] : [id, id]
    )

    if (!updatedRecord) {
      updatedRecord = { id, ...body }
    }

    const effectiveHwid = updatedRecord.hwid || hwid || 'default'
    broadcastChange(effectiveHwid, tableDef.name, 'UPDATE', updatedRecord)

    res.json(updatedRecord)
  } catch (err: any) {
    console.error(`[CRUD PATCH] Error updating ${table}:`, err)
    res.status(500).json({ error: err.message || 'Failed to update record' })
  }
})

// ─── DELETE /api/:table/:id ────────────────────────────────────────
crudRouter.delete('/:table/:id', async (req: Request, res: Response) => {
  const { table, id } = req.params
  const tableDef = getTableDef(table)
  if (!tableDef) {
    return res.status(404).json({ error: `Table "${table}" not found` })
  }

  const hwid = extractHwid(req)
  const db = await getDb()

  try {
    let sql: string
    let params: any[]

    if (hwid) {
      sql = `DELETE FROM ${tableDef.name} WHERE (id = ? OR local_id = ?) AND hwid = ?`
      params = [id, id, hwid]
    } else {
      sql = `DELETE FROM ${tableDef.name} WHERE id = ? OR local_id = ?`
      params = [id, id]
    }

    await db.run(sql, params)

    broadcastChange(hwid || 'default', tableDef.name, 'DELETE', { id, local_id: id, hwid })

    res.json({ success: true, deletedId: id })
  } catch (err: any) {
    console.error(`[CRUD DELETE] Error deleting from ${table}:`, err)
    res.status(500).json({ error: err.message || 'Failed to delete record' })
  }
})

// ─── POST /api/attendance/upsert ───────────────────────────────────
crudRouter.post('/attendance/upsert', async (req: Request, res: Response) => {
  const hwid = extractHwid(req) || 'default'
  const body = req.body || {}
  const db = await getDb()

  try {
    const existing = await db.get(
      `SELECT * FROM attendance WHERE hwid = ? AND (local_id = ? OR (user_id = ? AND date = ?)) LIMIT 1`,
      [hwid, body.local_id || -1, body.user_id || -1, body.date || '']
    )

    if (existing) {
      const updateCols: string[] = []
      const vals: any[] = []
      if (body.check_out !== undefined) { updateCols.push('check_out = ?'); vals.push(body.check_out) }
      if (body.status !== undefined) { updateCols.push('status = ?'); vals.push(body.status) }
      if (body.notes !== undefined) { updateCols.push('notes = ?'); vals.push(body.notes) }
      updateCols.push('updated_at = CURRENT_TIMESTAMP')

      if (updateCols.length > 0) {
        vals.push(existing.id)
        await db.run(`UPDATE attendance SET ${updateCols.join(', ')} WHERE id = ?`, vals)
      }
      const updated = await db.get(`SELECT * FROM attendance WHERE id = ?`, [existing.id])
      broadcastChange(hwid, 'attendance', 'UPDATE', updated)
      return res.json(updated)
    } else {
      const result = await db.run(
        `INSERT INTO attendance (hwid, local_id, user_id, date, check_in, check_out, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          hwid,
          body.local_id || null,
          body.user_id || 1,
          body.date || new Date().toISOString().split('T')[0],
          body.check_in || '08:00',
          body.check_out || null,
          body.status || 'present',
          body.notes || ''
        ]
      )
      const created = await db.get(`SELECT * FROM attendance WHERE id = ?`, [result.lastInsertRowid])
      broadcastChange(hwid, 'attendance', 'INSERT', created)
      return res.status(201).json(created)
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Attendance upsert failed' })
  }
})

// ─── POST /api/sync/batch (High Speed Batch Sync) ──────────────────
crudRouter.post('/sync/batch', async (req: Request, res: Response) => {
  const hwid = extractHwid(req)
  const { table, records, action } = req.body
  const tableDef = getTableDef(table)

  if (!tableDef) {
    return res.status(400).json({ error: `Invalid table "${table}"` })
  }
  if (!Array.isArray(records)) {
    return res.status(400).json({ error: 'Records must be an array' })
  }

  const db = await getDb()

  try {
    await db.transaction(async (tx) => {
      for (const rec of records) {
        const itemHwid = rec.hwid || hwid || 'default'
        const validCols = tableDef.columns.filter((c) => c !== 'id')
        const insertCols: string[] = []
        const values: any[] = []

        for (const col of validCols) {
          if (col === 'hwid') {
            insertCols.push('hwid')
            values.push(itemHwid)
          } else if (rec[col] !== undefined) {
            insertCols.push(col)
            values.push(rec[col])
          }
        }

        if (!insertCols.includes('hwid')) {
          insertCols.push('hwid')
          values.push(itemHwid)
        }

        const placeholders = insertCols.map(() => '?').join(', ')
        await tx.run(
          `INSERT INTO ${tableDef.name} (${insertCols.join(', ')}) VALUES (${placeholders})`,
          values
        )
      }
    })

    broadcastChange(hwid, tableDef.name, (action || 'SYNC').toUpperCase() as any, records)

    res.json({ success: true, count: records.length })
  } catch (err: any) {
    console.error(`[Batch Sync] Error on ${table}:`, err)
    res.status(500).json({ error: err.message || 'Batch sync failed' })
  }
})
