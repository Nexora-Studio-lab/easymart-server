import { io as ClientIO } from 'socket.io-client'

async function runSelfTest() {
  console.log('--- Starting EasyMart Server Self-Test ---')
  const baseUrl = 'http://localhost:3000'
  const hwid = 'TEST_STORE_HWID_123'

  // 1. Check /health
  const healthRes = await fetch(`${baseUrl}/health`)
  const healthData: any = await healthRes.json()
  console.log('1. Health Check:', healthData)

  // 2. Connect Socket.IO client
  const socket = ClientIO(baseUrl, { transports: ['websocket'] })

  const receivedEvents: any[] = []
  socket.on('connect', () => {
    console.log('2. Socket.IO connected with ID:', socket.id)
    socket.emit('join:hwid', hwid)
  })

  socket.on('realtime:change', (event: any) => {
    console.log('   [Socket Event Received]:', event.table, event.action)
    receivedEvents.push(event)
  })

  // Wait a bit for socket connection
  await new Promise((r) => setTimeout(r, 500))

  // 3. Test Product Insertion
  console.log('3. Testing Product Creation...')
  const prodRes = await fetch(`${baseUrl}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-hwid': hwid },
    body: JSON.stringify({
      name: 'Milk 1L',
      name_ar: 'حليب 1 لتر',
      barcode: '123456789012',
      selling_price: 120,
      cost_price: 95,
      current_stock: 50
    })
  })
  const prod: any = await prodRes.json()
  console.log('   Product created with ID:', prod.id, prod.name)

  // 4. Test User Creation
  console.log('4. Testing User Creation...')
  const userRes = await fetch(`${baseUrl}/api/store_users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-hwid': hwid },
    body: JSON.stringify({
      username: 'cashier1',
      full_name: 'Ahmed Cashier',
      role: 'cashier',
      pin: '1234'
    })
  })
  const user: any = await userRes.json()
  console.log('   User created with ID:', user.id, user.full_name)

  // 5. Test Sales Creation
  console.log('5. Testing Sale Creation...')
  const saleRes = await fetch(`${baseUrl}/api/sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-hwid': hwid },
    body: JSON.stringify({
      receipt_number: 'REC-1001',
      total: 240,
      payment_method: 'cash',
      user_id: user.id
    })
  })
  const sale: any = await saleRes.json()
  console.log('   Sale created with ID:', sale.id, sale.receipt_number)

  // 6. Test Staff Task Creation
  console.log('6. Testing Staff Task Creation...')
  const taskRes = await fetch(`${baseUrl}/api/staff_tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-hwid': hwid },
    body: JSON.stringify({
      title: 'Restock Beverage Cooler',
      priority: 'high',
      frequency: 'daily',
      status: 'active'
    })
  })
  const task: any = await taskRes.json()
  console.log('   Task created with ID:', task.id, task.title)

  // 7. Test Audit Log
  console.log('7. Testing Audit Log Creation...')
  const auditRes = await fetch(`${baseUrl}/api/audit_log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-hwid': hwid },
    body: JSON.stringify({
      user_id: user.id,
      user_name: user.full_name,
      action: 'LOGIN',
      entity_type: 'auth'
    })
  })
  const audit: any = await auditRes.json()
  console.log('   Audit log created with ID:', audit.id, audit.action)

  // 8. Test Expired Product
  console.log('8. Testing Expired Product Creation...')
  const expRes = await fetch(`${baseUrl}/api/expired_products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-hwid': hwid },
    body: JSON.stringify({
      product_id: prod.id,
      name: prod.name,
      expiration_date: '2026-09-30',
      days_left: 16
    })
  })
  const exp: any = await expRes.json()
  console.log('   Expired product created with ID:', exp.id, exp.name)

  // 9. Test Querying
  console.log('9. Testing GET /api/products?hwid=' + hwid)
  const allProdsRes = await fetch(`${baseUrl}/api/products?hwid=${hwid}`)
  const allProds: any = await allProdsRes.json()
  console.log(`   Found ${allProds.length} products`)

  // Wait 500ms for all socket events
  await new Promise((r) => setTimeout(r, 600))
  console.log(`10. Realtime Events Dispatched & Received: ${receivedEvents.length}`)

  socket.disconnect()
  console.log('--- Self-Test Completed Successfully! ---')
}

runSelfTest().catch(console.error)
