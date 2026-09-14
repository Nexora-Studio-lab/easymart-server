import fs from 'fs'
import path from 'path'
import { TABLES, TableDefinition } from './schema.js'
import pg from 'pg'
import initSqlJs, { Database as SqlJsDatabase } from 'sql.js'

export interface DbAdapter {
  isPostgres: boolean
  all(sql: string, params?: any[]): Promise<any[]>
  get(sql: string, params?: any[]): Promise<any>
  run(sql: string, params?: any[]): Promise<{ lastInsertRowid: number | null; changes: number }>
  transaction<T>(fn: (tx: DbAdapter) => Promise<T>): Promise<T>
  init(): Promise<void>
}

let dbInstance: DbAdapter | null = null

class SqlJsAdapter implements DbAdapter {
  public isPostgres = false
  private db: SqlJsDatabase | null = null
  private filePath: string
  private saveDebounceTimer: NodeJS.Timeout | null = null

  constructor(filePath: string) {
    this.filePath = filePath
  }

  private persist() {
    if (!this.db) return
    try {
      const data = this.db.export()
      const buffer = Buffer.from(data)
      const dir = path.dirname(this.filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(this.filePath, buffer)
    } catch (err) {
      console.error('[Database] Failed to persist SQLite data:', err)
    }
  }

  private scheduleSave() {
    if (this.saveDebounceTimer) clearTimeout(this.saveDebounceTimer)
    this.saveDebounceTimer = setTimeout(() => {
      this.persist()
    }, 50)
  }

  async init(): Promise<void> {
    const SQL = await initSqlJs()
    if (fs.existsSync(this.filePath)) {
      try {
        const fileBuffer = fs.readFileSync(this.filePath)
        this.db = new SQL.Database(fileBuffer)
      } catch {
        this.db = new SQL.Database()
      }
    } else {
      this.db = new SQL.Database()
    }

    this.db.run('PRAGMA foreign_keys = ON;')

    for (const table of TABLES) {
      this.db.run(table.sqliteSchema)
      for (const idx of table.indices) {
        try {
          this.db.run(idx)
        } catch {}
      }
    }

    // Dynamic Column Migration
    for (const table of TABLES) {
      try {
        const pragma = this.db.exec(`PRAGMA table_info(${table.name})`)
        const existingCols = new Set<string>()
        if (pragma.length > 0 && pragma[0].values) {
          for (const row of pragma[0].values) {
            existingCols.add(String(row[1])) // column name is index 1
          }
        }
        for (const col of table.columns) {
          if (!existingCols.has(col)) {
            try {
              this.db.run(`ALTER TABLE ${table.name} ADD COLUMN ${col} TEXT;`)
            } catch {}
          }
        }
      } catch {}
    }

    this.persist()
    console.log('[Database] SQLite (WASM) initialized & schemas verified.')
  }

  async all(sql: string, params: any[] = []): Promise<any[]> {
    if (!this.db) throw new Error('DB not initialized')
    const stmt = this.db.prepare(sql)
    if (params.length > 0) stmt.bind(params)
    const rows: any[] = []
    while (stmt.step()) {
      rows.push(stmt.getAsObject())
    }
    stmt.free()
    return rows
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    if (!this.db) throw new Error('DB not initialized')
    const stmt = this.db.prepare(sql)
    if (params.length > 0) stmt.bind(params)
    let row: any = null
    if (stmt.step()) {
      row = stmt.getAsObject()
    }
    stmt.free()
    return row
  }

  async run(sql: string, params: any[] = []): Promise<{ lastInsertRowid: number | null; changes: number }> {
    if (!this.db) throw new Error('DB not initialized')
    this.db.run(sql, params)
    const lastResult = this.db.exec('SELECT last_insert_rowid() as id, changes() as changes')
    this.scheduleSave()
    const id = lastResult[0]?.values[0]?.[0]
    const affected = lastResult[0]?.values[0]?.[1]
    return {
      lastInsertRowid: typeof id === 'number' ? id : null,
      changes: typeof affected === 'number' ? affected : 0
    }
  }

  async transaction<T>(fn: (tx: DbAdapter) => Promise<T>): Promise<T> {
    if (!this.db) throw new Error('DB not initialized')
    this.db.run('BEGIN TRANSACTION')
    try {
      const res = await fn(this)
      this.db.run('COMMIT')
      this.persist()
      return res
    } catch (err) {
      this.db.run('ROLLBACK')
      throw err
    }
  }
}

class PostgresAdapter implements DbAdapter {
  public isPostgres = true
  private pool: pg.Pool

  constructor(connectionString: string) {
    this.pool = new pg.Pool({
      connectionString,
      ssl: connectionString.includes('sslmode=disable')
        ? false
        : { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    })
  }

  private convertPlaceholders(sql: string): string {
    let index = 1
    return sql.replace(/\?/g, () => `$${index++}`)
  }

  async init(): Promise<void> {
    const client = await this.pool.connect()
    try {
      for (const table of TABLES) {
        await client.query(table.pgSchema)
        for (const idx of table.indices) {
          try {
            await client.query(idx)
          } catch {}
        }
      }
      // Migration: verify columns exist
      for (const table of TABLES) {
        const res = await client.query(
          `SELECT column_name FROM information_schema.columns WHERE table_name = $1`,
          [table.name]
        )
        const existing = new Set(res.rows.map((r: any) => r.column_name))
        for (const col of table.columns) {
          if (!existing.has(col)) {
            try {
              await client.query(`ALTER TABLE ${table.name} ADD COLUMN IF NOT EXISTS ${col} TEXT`)
            } catch {}
          }
        }
      }
      console.log('[Database] PostgreSQL initialized with connection pool & schemas verified.')
    } finally {
      client.release()
    }
  }

  async all(sql: string, params: any[] = []): Promise<any[]> {
    const pgSql = this.convertPlaceholders(sql)
    const res = await this.pool.query(pgSql, params)
    return res.rows
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    const pgSql = this.convertPlaceholders(sql)
    const res = await this.pool.query(pgSql, params)
    return res.rows[0] || null
  }

  async run(sql: string, params: any[] = []): Promise<{ lastInsertRowid: number | null; changes: number }> {
    let pgSql = this.convertPlaceholders(sql)
    if (/^\s*INSERT\s+INTO/i.test(pgSql) && !/RETURNING/i.test(pgSql)) {
      pgSql += ' RETURNING id'
    }
    const res = await this.pool.query(pgSql, params)
    const lastId = res.rows && res.rows[0]?.id ? Number(res.rows[0].id) : null
    return {
      lastInsertRowid: lastId,
      changes: res.rowCount ?? 0
    }
  }

  async transaction<T>(fn: (tx: DbAdapter) => Promise<T>): Promise<T> {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')
      const txAdapter: DbAdapter = {
        isPostgres: true,
        all: async (sql, params = []) => (await client.query(this.convertPlaceholders(sql), params)).rows,
        get: async (sql, params = []) => (await client.query(this.convertPlaceholders(sql), params)).rows[0] || null,
        run: async (sql, params = []) => {
          let s = this.convertPlaceholders(sql)
          if (/^\s*INSERT\s+INTO/i.test(s) && !/RETURNING/i.test(s)) s += ' RETURNING id'
          const r = await client.query(s, params)
          return { lastInsertRowid: r.rows?.[0]?.id ?? null, changes: r.rowCount ?? 0 }
        },
        transaction: async () => { throw new Error('Nested transaction not supported') },
        init: async () => {}
      }
      const result = await fn(txAdapter)
      await client.query('COMMIT')
      return result
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  }
}

export async function getDb(): Promise<DbAdapter> {
  if (dbInstance) return dbInstance

  const databaseUrl = process.env.DATABASE_URL?.trim()
  if (databaseUrl && (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://'))) {
    console.log('[Database] Connecting to PostgreSQL database...')
    dbInstance = new PostgresAdapter(databaseUrl)
  } else {
    const dbPath = process.env.SQLITE_PATH || path.join(process.cwd(), 'data', 'easymart_server.db')
    console.log(`[Database] Using SQLite (WASM) at: ${dbPath}`)
    dbInstance = new SqlJsAdapter(dbPath)
  }

  await dbInstance.init()
  return dbInstance
}
