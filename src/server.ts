import http from 'http'
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { getDb } from './db/index.js'
import { initRealtime } from './realtime/socket.js'
import { crudRouter } from './routes/crud.js'
import { dashboardRouter } from './routes/dashboard.js'

dotenv.config()

const app = express()
const server = http.createServer(app)

// ─── Middleware ────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-hwid', 'x-api-key', 'Cache-Control', 'Pragma']
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Optional API Key Security Middleware
const API_SECRET_KEY = process.env.API_SECRET_KEY?.trim()
if (API_SECRET_KEY) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Skip health check
    if (req.path === '/health' || req.path === '/') {
      return next()
    }
    const authHeader = req.headers['authorization']
    const apiKeyHeader = req.headers['x-api-key']
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : apiKeyHeader

    if (token !== API_SECRET_KEY) {
      return res.status(401).json({ error: 'Unauthorized: Invalid API key' })
    }
    next()
  })
}

// ─── Health Checks ─────────────────────────────────────────────────
app.get(['/', '/health'], async (_req: Request, res: Response) => {
  try {
    const db = await getDb()
    res.json({
      status: 'ok',
      service: 'EasyMart Realtime Database Server',
      version: '2.0.0',
      databaseEngine: db.isPostgres ? 'PostgreSQL' : 'SQLite WAL Mode',
      timestamp: new Date().toISOString()
    })
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      message: err.message || 'Database initialization error'
    })
  }
})

// ─── Mount Routes ──────────────────────────────────────────────────
app.use('/api/dashboard', dashboardRouter)
app.use('/api', crudRouter)

// ─── 404 Handler ───────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' })
})

// ─── Error Handler ─────────────────────────────────────────────────
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Unhandled Error]', err)
  res.status(500).json({ error: err.message || 'Internal Server Error' })
})

// ─── Initialize Realtime & Start Server ────────────────────────────
const PORT = process.env.PORT || 3000

async function start() {
  try {
    // Warm up database connection & tables
    await getDb()

    // Initialize Socket.IO
    initRealtime(server)

    server.listen(PORT, () => {
      console.log(`=======================================================`)
      console.log(` EasyMart Realtime Database Server running on port ${PORT}`)
      console.log(` Ready for EasyMart-Pro desktop & EasyMart Mobile sync`)
      console.log(` Render deployment URL ready`)
      console.log(`=======================================================`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

start()
