export interface TableDefinition {
  name: string
  columns: string[]
  sqliteSchema: string
  pgSchema: string
  indices: string[]
}

export const TABLES: TableDefinition[] = [
  {
    name: 'dashboard',
    columns: ['id', 'hwid', 'today_sales', 'today_orders', 'total_products', 'total_customers', 'low_stock_items', 'today_profit', 'store_name', 'updated_at'],
    sqliteSchema: `
      CREATE TABLE IF NOT EXISTS dashboard (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hwid TEXT NOT NULL UNIQUE,
        today_sales REAL DEFAULT 0,
        today_orders INTEGER DEFAULT 0,
        total_products INTEGER DEFAULT 0,
        total_customers INTEGER DEFAULT 0,
        low_stock_items INTEGER DEFAULT 0,
        today_profit REAL DEFAULT 0,
        store_name TEXT DEFAULT 'EasyMart',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    pgSchema: `
      CREATE TABLE IF NOT EXISTS dashboard (
        id SERIAL PRIMARY KEY,
        hwid VARCHAR(255) NOT NULL UNIQUE,
        today_sales DOUBLE PRECISION DEFAULT 0,
        today_orders INTEGER DEFAULT 0,
        total_products INTEGER DEFAULT 0,
        total_customers INTEGER DEFAULT 0,
        low_stock_items INTEGER DEFAULT 0,
        today_profit DOUBLE PRECISION DEFAULT 0,
        store_name VARCHAR(255) DEFAULT 'EasyMart',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    indices: [
      `CREATE INDEX IF NOT EXISTS idx_dashboard_hwid ON dashboard(hwid)`
    ]
  },
  {
    name: 'products',
    columns: ['id', 'hwid', 'local_id', 'barcode', 'sku', 'plu_code', 'name', 'name_ar', 'name_fr', 'name_en', 'description', 'category_id', 'supplier_id', 'cost_price', 'selling_price', 'tax_rate', 'unit', 'min_stock', 'max_stock', 'current_stock', 'is_weighted', 'has_variants', 'image_path', 'shelf_location', 'is_active', 'expiration_date', 'batch_number', 'created_at', 'updated_at'],
    sqliteSchema: `
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hwid TEXT NOT NULL,
        local_id INTEGER,
        barcode TEXT,
        sku TEXT,
        plu_code TEXT,
        name TEXT NOT NULL,
        name_ar TEXT,
        name_fr TEXT,
        name_en TEXT,
        description TEXT,
        category_id INTEGER,
        supplier_id INTEGER,
        cost_price REAL NOT NULL DEFAULT 0,
        selling_price REAL NOT NULL DEFAULT 0,
        tax_rate REAL DEFAULT 0,
        unit TEXT DEFAULT 'pcs',
        min_stock REAL DEFAULT 0,
        max_stock REAL DEFAULT 0,
        current_stock REAL DEFAULT 0,
        is_weighted INTEGER DEFAULT 0,
        has_variants INTEGER DEFAULT 0,
        image_path TEXT,
        shelf_location TEXT,
        is_active INTEGER DEFAULT 1,
        expiration_date TEXT,
        batch_number TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    pgSchema: `
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        hwid VARCHAR(255) NOT NULL,
        local_id INTEGER,
        barcode VARCHAR(255),
        sku VARCHAR(255),
        plu_code VARCHAR(255),
        name TEXT NOT NULL,
        name_ar TEXT,
        name_fr TEXT,
        name_en TEXT,
        description TEXT,
        category_id INTEGER,
        supplier_id INTEGER,
        cost_price DOUBLE PRECISION NOT NULL DEFAULT 0,
        selling_price DOUBLE PRECISION NOT NULL DEFAULT 0,
        tax_rate DOUBLE PRECISION DEFAULT 0,
        unit VARCHAR(50) DEFAULT 'pcs',
        min_stock DOUBLE PRECISION DEFAULT 0,
        max_stock DOUBLE PRECISION DEFAULT 0,
        current_stock DOUBLE PRECISION DEFAULT 0,
        is_weighted INTEGER DEFAULT 0,
        has_variants INTEGER DEFAULT 0,
        image_path TEXT,
        shelf_location VARCHAR(255),
        is_active INTEGER DEFAULT 1,
        expiration_date VARCHAR(100),
        batch_number VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    indices: [
      `CREATE INDEX IF NOT EXISTS idx_products_hwid ON products(hwid)`,
      `CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(hwid, barcode)`,
      `CREATE INDEX IF NOT EXISTS idx_products_local_id ON products(hwid, local_id)`
    ]
  },
  {
    name: 'categories',
    columns: ['id', 'hwid', 'local_id', 'name', 'name_ar', 'name_fr', 'description', 'color', 'created_at'],
    sqliteSchema: `
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hwid TEXT NOT NULL,
        local_id INTEGER,
        name TEXT NOT NULL,
        name_ar TEXT,
        name_fr TEXT,
        description TEXT,
        color TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    pgSchema: `
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        hwid VARCHAR(255) NOT NULL,
        local_id INTEGER,
        name VARCHAR(255) NOT NULL,
        name_ar VARCHAR(255),
        name_fr VARCHAR(255),
        description TEXT,
        color VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    indices: [
      `CREATE INDEX IF NOT EXISTS idx_categories_hwid ON categories(hwid)`
    ]
  },
  {
    name: 'sales',
    columns: ['id', 'hwid', 'local_id', 'receipt_number', 'user_id', 'customer_id', 'cashier_name', 'staff_id', 'staff_name', 'subtotal', 'tax_total', 'discount_total', 'total', 'payment_method', 'payment_status', 'change_amount', 'is_held', 'is_returned', 'notes', 'item_count', 'created_at'],
    sqliteSchema: `
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hwid TEXT NOT NULL,
        local_id INTEGER,
        receipt_number TEXT NOT NULL,
        user_id INTEGER,
        customer_id INTEGER,
        cashier_name TEXT,
        staff_id INTEGER,
        staff_name TEXT,
        subtotal REAL NOT NULL DEFAULT 0,
        tax_total REAL NOT NULL DEFAULT 0,
        discount_total REAL NOT NULL DEFAULT 0,
        total REAL NOT NULL DEFAULT 0,
        payment_method TEXT NOT NULL DEFAULT 'cash',
        payment_status TEXT DEFAULT 'paid',
        change_amount REAL DEFAULT 0,
        is_held INTEGER DEFAULT 0,
        is_returned INTEGER DEFAULT 0,
        notes TEXT,
        item_count INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    pgSchema: `
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        hwid VARCHAR(255) NOT NULL,
        local_id INTEGER,
        receipt_number VARCHAR(255) NOT NULL,
        user_id INTEGER,
        customer_id INTEGER,
        cashier_name VARCHAR(255),
        staff_id INTEGER,
        staff_name VARCHAR(255),
        subtotal DOUBLE PRECISION NOT NULL DEFAULT 0,
        tax_total DOUBLE PRECISION NOT NULL DEFAULT 0,
        discount_total DOUBLE PRECISION NOT NULL DEFAULT 0,
        total DOUBLE PRECISION NOT NULL DEFAULT 0,
        payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
        payment_status VARCHAR(50) DEFAULT 'paid',
        change_amount DOUBLE PRECISION DEFAULT 0,
        is_held INTEGER DEFAULT 0,
        is_returned INTEGER DEFAULT 0,
        notes TEXT,
        item_count INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    indices: [
      `CREATE INDEX IF NOT EXISTS idx_sales_hwid ON sales(hwid)`,
      `CREATE INDEX IF NOT EXISTS idx_sales_receipt ON sales(hwid, receipt_number)`,
      `CREATE INDEX IF NOT EXISTS idx_sales_created ON sales(hwid, created_at)`
    ]
  },
  {
    name: 'sale_items',
    columns: ['id', 'hwid', 'local_id', 'sale_id', 'product_id', 'variant_id', 'product_name', 'barcode', 'quantity', 'unit_price', 'cost_price', 'discount', 'tax', 'total', 'created_at'],
    sqliteSchema: `
      CREATE TABLE IF NOT EXISTS sale_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hwid TEXT NOT NULL,
        local_id INTEGER,
        sale_id INTEGER NOT NULL,
        product_id INTEGER,
        variant_id INTEGER,
        product_name TEXT NOT NULL,
        barcode TEXT,
        quantity REAL NOT NULL DEFAULT 1,
        unit_price REAL NOT NULL DEFAULT 0,
        cost_price REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        tax REAL DEFAULT 0,
        total REAL NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    pgSchema: `
      CREATE TABLE IF NOT EXISTS sale_items (
        id SERIAL PRIMARY KEY,
        hwid VARCHAR(255) NOT NULL,
        local_id INTEGER,
        sale_id INTEGER NOT NULL,
        product_id INTEGER,
        variant_id INTEGER,
        product_name TEXT NOT NULL,
        barcode VARCHAR(255),
        quantity DOUBLE PRECISION NOT NULL DEFAULT 1,
        unit_price DOUBLE PRECISION NOT NULL DEFAULT 0,
        cost_price DOUBLE PRECISION DEFAULT 0,
        discount DOUBLE PRECISION DEFAULT 0,
        tax DOUBLE PRECISION DEFAULT 0,
        total DOUBLE PRECISION NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    indices: [
      `CREATE INDEX IF NOT EXISTS idx_sale_items_hwid ON sale_items(hwid)`,
      `CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(hwid, sale_id)`
    ]
  },
  {
    name: 'daily_sales',
    columns: ['id', 'hwid', 'local_id', 'sale_id', 'product_id', 'product_name', 'barcode', 'category_name', 'quantity', 'unit_price', 'cost_price', 'total', 'profit', 'payment_method', 'cashier_id', 'cashier_name', 'staff_id', 'staff_name', 'sale_date', 'created_at'],
    sqliteSchema: `
      CREATE TABLE IF NOT EXISTS daily_sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hwid TEXT NOT NULL,
        local_id INTEGER,
        sale_id INTEGER,
        product_id INTEGER,
        product_name TEXT NOT NULL,
        barcode TEXT,
        category_name TEXT,
        quantity REAL NOT NULL DEFAULT 1,
        unit_price REAL NOT NULL DEFAULT 0,
        cost_price REAL NOT NULL DEFAULT 0,
        total REAL NOT NULL DEFAULT 0,
        profit REAL NOT NULL DEFAULT 0,
        payment_method TEXT DEFAULT 'cash',
        cashier_id INTEGER,
        cashier_name TEXT,
        staff_id INTEGER,
        staff_name TEXT,
        sale_date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    pgSchema: `
      CREATE TABLE IF NOT EXISTS daily_sales (
        id SERIAL PRIMARY KEY,
        hwid VARCHAR(255) NOT NULL,
        local_id INTEGER,
        sale_id INTEGER,
        product_id INTEGER,
        product_name TEXT NOT NULL,
        barcode VARCHAR(255),
        category_name VARCHAR(255),
        quantity DOUBLE PRECISION NOT NULL DEFAULT 1,
        unit_price DOUBLE PRECISION NOT NULL DEFAULT 0,
        cost_price DOUBLE PRECISION NOT NULL DEFAULT 0,
        total DOUBLE PRECISION NOT NULL DEFAULT 0,
        profit DOUBLE PRECISION NOT NULL DEFAULT 0,
        payment_method VARCHAR(50) DEFAULT 'cash',
        cashier_id INTEGER,
        cashier_name VARCHAR(255),
        staff_id INTEGER,
        staff_name VARCHAR(255),
        sale_date VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    indices: [
      `CREATE INDEX IF NOT EXISTS idx_daily_sales_hwid ON daily_sales(hwid)`,
      `CREATE INDEX IF NOT EXISTS idx_daily_sales_date ON daily_sales(hwid, sale_date)`
    ]
  },
  {
    name: 'store_users',
    columns: ['id', 'hwid', 'local_id', 'username', 'password', 'pin', 'staff_code', 'full_name', 'full_name_ar', 'full_name_fr', 'full_name_en', 'role', 'phone', 'email', 'is_active', 'created_at', 'updated_at'],
    sqliteSchema: `
      CREATE TABLE IF NOT EXISTS store_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hwid TEXT NOT NULL,
        local_id INTEGER,
        username TEXT NOT NULL,
        password TEXT DEFAULT '',
        pin TEXT DEFAULT '0000',
        staff_code TEXT,
        full_name TEXT NOT NULL,
        full_name_ar TEXT,
        full_name_fr TEXT,
        full_name_en TEXT,
        role TEXT NOT NULL DEFAULT 'cashier',
        phone TEXT,
        email TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    pgSchema: `
      CREATE TABLE IF NOT EXISTS store_users (
        id SERIAL PRIMARY KEY,
        hwid VARCHAR(255) NOT NULL,
        local_id INTEGER,
        username VARCHAR(255) NOT NULL,
        password TEXT DEFAULT '',
        pin VARCHAR(50) DEFAULT '0000',
        staff_code VARCHAR(100),
        full_name VARCHAR(255) NOT NULL,
        full_name_ar VARCHAR(255),
        full_name_fr VARCHAR(255),
        full_name_en VARCHAR(255),
        role VARCHAR(50) NOT NULL DEFAULT 'cashier',
        phone VARCHAR(100),
        email VARCHAR(255),
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    indices: [
      `CREATE INDEX IF NOT EXISTS idx_store_users_hwid ON store_users(hwid)`,
      `CREATE INDEX IF NOT EXISTS idx_store_users_pin ON store_users(hwid, pin)`
    ]
  },
  {
    name: 'permissions',
    columns: ['id', 'hwid', 'local_id', 'role', 'can_edit_products', 'can_delete_products', 'can_refund', 'can_view_reports', 'can_backup', 'can_manage_users', 'can_change_prices', 'can_void_sales', 'can_view_profit', 'can_export_data', 'can_manage_schedules', 'can_manage_payroll', 'page_pos', 'page_products', 'page_inventory', 'page_dashboard', 'page_customers', 'page_suppliers', 'page_purchase_orders', 'page_promotions', 'page_gift_cards', 'page_customer_credit', 'page_loyalty', 'page_cash_drawer', 'page_expenses', 'page_expired', 'page_users', 'page_schedules', 'page_payroll', 'page_reports', 'page_transactions', 'page_audit_log', 'page_server_settings', 'page_hardware', 'page_zakah', 'page_store_settings', 'page_database', 'page_analytics', 'page_factures', 'page_tasks', 'page_scale_station'],
    sqliteSchema: `
      CREATE TABLE IF NOT EXISTS permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hwid TEXT NOT NULL,
        local_id INTEGER,
        role TEXT NOT NULL,
        can_edit_products INTEGER DEFAULT 0,
        can_delete_products INTEGER DEFAULT 0,
        can_refund INTEGER DEFAULT 0,
        can_view_reports INTEGER DEFAULT 0,
        can_backup INTEGER DEFAULT 0,
        can_manage_users INTEGER DEFAULT 0,
        can_change_prices INTEGER DEFAULT 0,
        can_void_sales INTEGER DEFAULT 0,
        can_view_profit INTEGER DEFAULT 0,
        can_export_data INTEGER DEFAULT 0,
        can_manage_schedules INTEGER DEFAULT 0,
        can_manage_payroll INTEGER DEFAULT 0,
        page_pos INTEGER DEFAULT 1,
        page_products INTEGER DEFAULT 1,
        page_inventory INTEGER DEFAULT 1,
        page_dashboard INTEGER DEFAULT 1,
        page_customers INTEGER DEFAULT 1,
        page_suppliers INTEGER DEFAULT 1,
        page_purchase_orders INTEGER DEFAULT 1,
        page_promotions INTEGER DEFAULT 1,
        page_gift_cards INTEGER DEFAULT 1,
        page_customer_credit INTEGER DEFAULT 1,
        page_loyalty INTEGER DEFAULT 1,
        page_cash_drawer INTEGER DEFAULT 1,
        page_expenses INTEGER DEFAULT 1,
        page_expired INTEGER DEFAULT 1,
        page_users INTEGER DEFAULT 1,
        page_schedules INTEGER DEFAULT 1,
        page_payroll INTEGER DEFAULT 1,
        page_reports INTEGER DEFAULT 1,
        page_transactions INTEGER DEFAULT 1,
        page_audit_log INTEGER DEFAULT 1,
        page_server_settings INTEGER DEFAULT 1,
        page_hardware INTEGER DEFAULT 1,
        page_zakah INTEGER DEFAULT 1,
        page_store_settings INTEGER DEFAULT 1,
        page_database INTEGER DEFAULT 1,
        page_analytics INTEGER DEFAULT 1,
        page_factures INTEGER DEFAULT 1,
        page_tasks INTEGER DEFAULT 0,
        page_scale_station INTEGER DEFAULT 0
      )
    `,
    pgSchema: `
      CREATE TABLE IF NOT EXISTS permissions (
        id SERIAL PRIMARY KEY,
        hwid VARCHAR(255) NOT NULL,
        local_id INTEGER,
        role VARCHAR(50) NOT NULL,
        can_edit_products INTEGER DEFAULT 0,
        can_delete_products INTEGER DEFAULT 0,
        can_refund INTEGER DEFAULT 0,
        can_view_reports INTEGER DEFAULT 0,
        can_backup INTEGER DEFAULT 0,
        can_manage_users INTEGER DEFAULT 0,
        can_change_prices INTEGER DEFAULT 0,
        can_void_sales INTEGER DEFAULT 0,
        can_view_profit INTEGER DEFAULT 0,
        can_export_data INTEGER DEFAULT 0,
        can_manage_schedules INTEGER DEFAULT 0,
        can_manage_payroll INTEGER DEFAULT 0,
        page_pos INTEGER DEFAULT 1,
        page_products INTEGER DEFAULT 1,
        page_inventory INTEGER DEFAULT 1,
        page_dashboard INTEGER DEFAULT 1,
        page_customers INTEGER DEFAULT 1,
        page_suppliers INTEGER DEFAULT 1,
        page_purchase_orders INTEGER DEFAULT 1,
        page_promotions INTEGER DEFAULT 1,
        page_gift_cards INTEGER DEFAULT 1,
        page_customer_credit INTEGER DEFAULT 1,
        page_loyalty INTEGER DEFAULT 1,
        page_cash_drawer INTEGER DEFAULT 1,
        page_expenses INTEGER DEFAULT 1,
        page_expired INTEGER DEFAULT 1,
        page_users INTEGER DEFAULT 1,
        page_schedules INTEGER DEFAULT 1,
        page_payroll INTEGER DEFAULT 1,
        page_reports INTEGER DEFAULT 1,
        page_transactions INTEGER DEFAULT 1,
        page_audit_log INTEGER DEFAULT 1,
        page_server_settings INTEGER DEFAULT 1,
        page_hardware INTEGER DEFAULT 1,
        page_zakah INTEGER DEFAULT 1,
        page_store_settings INTEGER DEFAULT 1,
        page_database INTEGER DEFAULT 1,
        page_analytics INTEGER DEFAULT 1,
        page_factures INTEGER DEFAULT 1,
        page_tasks INTEGER DEFAULT 0,
        page_scale_station INTEGER DEFAULT 0
      )
    `,
    indices: [
      `CREATE INDEX IF NOT EXISTS idx_permissions_hwid ON permissions(hwid, role)`
    ]
  },
  {
    name: 'audit_log',
    columns: ['id', 'hwid', 'local_id', 'user_id', 'user_name', 'action', 'entity_type', 'entity_id', 'entity_name', 'old_value', 'new_value', 'ip_address', 'created_at'],
    sqliteSchema: `
      CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hwid TEXT NOT NULL,
        local_id INTEGER,
        user_id INTEGER,
        user_name TEXT,
        action TEXT NOT NULL,
        entity_type TEXT,
        entity_id INTEGER,
        entity_name TEXT,
        old_value TEXT,
        new_value TEXT,
        ip_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    pgSchema: `
      CREATE TABLE IF NOT EXISTS audit_log (
        id SERIAL PRIMARY KEY,
        hwid VARCHAR(255) NOT NULL,
        local_id INTEGER,
        user_id INTEGER,
        user_name VARCHAR(255),
        action VARCHAR(255) NOT NULL,
        entity_type VARCHAR(255),
        entity_id INTEGER,
        entity_name VARCHAR(255),
        old_value TEXT,
        new_value TEXT,
        ip_address VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    indices: [
      `CREATE INDEX IF NOT EXISTS idx_audit_log_hwid ON audit_log(hwid)`,
      `CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(hwid, created_at)`
    ]
  },
  {
    name: 'staff_tasks',
    columns: ['id', 'hwid', 'local_id', 'title', 'description', 'frequency', 'priority', 'assigned_to', 'assigned_to_name', 'assigned_by', 'assigned_by_name', 'due_date', 'status', 'in_progress_by', 'started_at', 'created_at', 'updated_at'],
    sqliteSchema: `
      CREATE TABLE IF NOT EXISTS staff_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hwid TEXT NOT NULL,
        local_id INTEGER,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        frequency TEXT DEFAULT 'daily',
        priority TEXT DEFAULT 'medium',
        assigned_to INTEGER DEFAULT NULL,
        assigned_to_name TEXT,
        assigned_by INTEGER NOT NULL DEFAULT 1,
        assigned_by_name TEXT,
        due_date TEXT,
        status TEXT DEFAULT 'active',
        in_progress_by INTEGER DEFAULT NULL,
        started_at TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    pgSchema: `
      CREATE TABLE IF NOT EXISTS staff_tasks (
        id SERIAL PRIMARY KEY,
        hwid VARCHAR(255) NOT NULL,
        local_id INTEGER,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        frequency VARCHAR(50) DEFAULT 'daily',
        priority VARCHAR(50) DEFAULT 'medium',
        assigned_to INTEGER,
        assigned_to_name VARCHAR(255),
        assigned_by INTEGER NOT NULL DEFAULT 1,
        assigned_by_name VARCHAR(255),
        due_date VARCHAR(100),
        status VARCHAR(50) DEFAULT 'active',
        in_progress_by INTEGER,
        started_at VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    indices: [
      `CREATE INDEX IF NOT EXISTS idx_staff_tasks_hwid ON staff_tasks(hwid)`,
      `CREATE INDEX IF NOT EXISTS idx_staff_tasks_status ON staff_tasks(hwid, status)`
    ]
  },
  {
    name: 'staff_task_completions',
    columns: ['id', 'hwid', 'local_id', 'task_id', 'user_id', 'user_name', 'role', 'notes', 'completed_at', 'created_at'],
    sqliteSchema: `
      CREATE TABLE IF NOT EXISTS staff_task_completions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hwid TEXT NOT NULL,
        local_id INTEGER,
        task_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        user_name TEXT,
        role TEXT,
        notes TEXT DEFAULT '',
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    pgSchema: `
      CREATE TABLE IF NOT EXISTS staff_task_completions (
        id SERIAL PRIMARY KEY,
        hwid VARCHAR(255) NOT NULL,
        local_id INTEGER,
        task_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        user_name VARCHAR(255),
        role VARCHAR(50),
        notes TEXT DEFAULT '',
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    indices: [
      `CREATE INDEX IF NOT EXISTS idx_task_comp_hwid ON staff_task_completions(hwid)`,
      `CREATE INDEX IF NOT EXISTS idx_task_comp_task ON staff_task_completions(hwid, task_id)`
    ]
  },
  {
    name: 'expired_products',
    columns: ['id', 'hwid', 'local_id', 'product_id', 'barcode', 'sku', 'name', 'name_ar', 'name_fr', 'category_name', 'category_id', 'cost_price', 'selling_price', 'current_stock', 'min_stock', 'max_stock', 'expiration_date', 'batch_number', 'unit', 'days_left', 'is_active', 'created_at', 'updated_at'],
    sqliteSchema: `
      CREATE TABLE IF NOT EXISTS expired_products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hwid TEXT NOT NULL,
        local_id INTEGER,
        product_id INTEGER,
        barcode TEXT,
        sku TEXT,
        name TEXT NOT NULL,
        name_ar TEXT,
        name_fr TEXT,
        category_name TEXT,
        category_id INTEGER,
        cost_price REAL DEFAULT 0,
        selling_price REAL DEFAULT 0,
        current_stock REAL DEFAULT 0,
        min_stock REAL DEFAULT 0,
        max_stock REAL DEFAULT 0,
        expiration_date TEXT,
        batch_number TEXT,
        unit TEXT DEFAULT 'pcs',
        days_left INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    pgSchema: `
      CREATE TABLE IF NOT EXISTS expired_products (
        id SERIAL PRIMARY KEY,
        hwid VARCHAR(255) NOT NULL,
        local_id INTEGER,
        product_id INTEGER,
        barcode VARCHAR(255),
        sku VARCHAR(255),
        name TEXT NOT NULL,
        name_ar TEXT,
        name_fr TEXT,
        category_name VARCHAR(255),
        category_id INTEGER,
        cost_price DOUBLE PRECISION DEFAULT 0,
        selling_price DOUBLE PRECISION DEFAULT 0,
        current_stock DOUBLE PRECISION DEFAULT 0,
        min_stock DOUBLE PRECISION DEFAULT 0,
        max_stock DOUBLE PRECISION DEFAULT 0,
        expiration_date VARCHAR(100),
        batch_number VARCHAR(255),
        unit VARCHAR(50) DEFAULT 'pcs',
        days_left INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    indices: [
      `CREATE INDEX IF NOT EXISTS idx_expired_prod_hwid ON expired_products(hwid)`,
      `CREATE INDEX IF NOT EXISTS idx_expired_prod_exp ON expired_products(hwid, expiration_date)`
    ]
  },
  {
    name: 'attendance',
    columns: ['id', 'hwid', 'local_id', 'user_id', 'date', 'check_in', 'check_out', 'status', 'notes', 'created_at', 'updated_at'],
    sqliteSchema: `
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hwid TEXT NOT NULL,
        local_id INTEGER,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        check_in TEXT,
        check_out TEXT,
        status TEXT DEFAULT 'present',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    pgSchema: `
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        hwid VARCHAR(255) NOT NULL,
        local_id INTEGER,
        user_id INTEGER NOT NULL,
        date VARCHAR(50) NOT NULL,
        check_in VARCHAR(50),
        check_out VARCHAR(50),
        status VARCHAR(50) DEFAULT 'present',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    indices: [
      `CREATE INDEX IF NOT EXISTS idx_attendance_hwid ON attendance(hwid, date)`
    ]
  },
  {
    name: 'customers',
    columns: ['id', 'hwid', 'local_id', 'name', 'name_ar', 'name_fr', 'name_en', 'phone', 'email', 'address', 'address_ar', 'address_fr', 'address_en', 'card_number', 'loyalty_points', 'credit_balance', 'total_spent', 'notes', 'rc', 'nis', 'ai', 'tax_id', 'ice', 'customer_type', 'image_url', 'card_theme', 'created_at'],
    sqliteSchema: `
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hwid TEXT NOT NULL,
        local_id INTEGER,
        name TEXT NOT NULL,
        name_ar TEXT,
        name_fr TEXT,
        name_en TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        address_ar TEXT,
        address_fr TEXT,
        address_en TEXT,
        card_number TEXT,
        loyalty_points INTEGER DEFAULT 0,
        credit_balance REAL DEFAULT 0,
        total_spent REAL DEFAULT 0,
        notes TEXT,
        rc TEXT,
        nis TEXT,
        ai TEXT,
        tax_id TEXT,
        ice TEXT,
        customer_type TEXT DEFAULT 'individual',
        image_url TEXT,
        card_theme TEXT DEFAULT 'default',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    pgSchema: `
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        hwid VARCHAR(255) NOT NULL,
        local_id INTEGER,
        name VARCHAR(255) NOT NULL,
        name_ar VARCHAR(255),
        name_fr VARCHAR(255),
        name_en VARCHAR(255),
        phone VARCHAR(100),
        email VARCHAR(255),
        address TEXT,
        address_ar TEXT,
        address_fr TEXT,
        address_en TEXT,
        card_number VARCHAR(100),
        loyalty_points INTEGER DEFAULT 0,
        credit_balance DOUBLE PRECISION DEFAULT 0,
        total_spent DOUBLE PRECISION DEFAULT 0,
        notes TEXT,
        rc VARCHAR(100),
        nis VARCHAR(100),
        ai VARCHAR(100),
        tax_id VARCHAR(100),
        ice VARCHAR(100),
        customer_type VARCHAR(50) DEFAULT 'individual',
        image_url TEXT,
        card_theme VARCHAR(50) DEFAULT 'default',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    indices: [
      `CREATE INDEX IF NOT EXISTS idx_customers_hwid ON customers(hwid)`
    ]
  },
  {
    name: 'suppliers',
    columns: ['id', 'hwid', 'local_id', 'name', 'name_ar', 'name_fr', 'name_en', 'contact_person', 'phone', 'email', 'address', 'address_ar', 'address_fr', 'address_en', 'payment_terms', 'rc', 'nif', 'nis', 'ai', 'ice', 'capital', 'bank_account', 'created_at'],
    sqliteSchema: `
      CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hwid TEXT NOT NULL,
        local_id INTEGER,
        name TEXT NOT NULL,
        name_ar TEXT,
        name_fr TEXT,
        name_en TEXT,
        contact_person TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        address_ar TEXT,
        address_fr TEXT,
        address_en TEXT,
        payment_terms TEXT,
        rc TEXT,
        nif TEXT,
        nis TEXT,
        ai TEXT,
        ice TEXT,
        capital TEXT,
        bank_account TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    pgSchema: `
      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY,
        hwid VARCHAR(255) NOT NULL,
        local_id INTEGER,
        name VARCHAR(255) NOT NULL,
        name_ar VARCHAR(255),
        name_fr VARCHAR(255),
        name_en VARCHAR(255),
        contact_person VARCHAR(255),
        phone VARCHAR(100),
        email VARCHAR(255),
        address TEXT,
        address_ar TEXT,
        address_fr TEXT,
        address_en TEXT,
        payment_terms TEXT,
        rc VARCHAR(100),
        nif VARCHAR(100),
        nis VARCHAR(100),
        ai VARCHAR(100),
        ice VARCHAR(100),
        capital VARCHAR(100),
        bank_account VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    indices: [
      `CREATE INDEX IF NOT EXISTS idx_suppliers_hwid ON suppliers(hwid)`
    ]
  },
  {
    name: 'expenses',
    columns: ['id', 'hwid', 'local_id', 'category', 'description', 'amount', 'paid_by', 'receipt_path', 'created_at'],
    sqliteSchema: `
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hwid TEXT NOT NULL,
        local_id INTEGER,
        category TEXT NOT NULL,
        description TEXT,
        amount REAL NOT NULL,
        paid_by TEXT,
        receipt_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    pgSchema: `
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        hwid VARCHAR(255) NOT NULL,
        local_id INTEGER,
        category VARCHAR(255) NOT NULL,
        description TEXT,
        amount DOUBLE PRECISION NOT NULL,
        paid_by VARCHAR(255),
        receipt_path TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    indices: [
      `CREATE INDEX IF NOT EXISTS idx_expenses_hwid ON expenses(hwid)`
    ]
  },
  {
    name: 'invoices',
    columns: ['id', 'hwid', 'local_id', 'invoice_number', 'sale_id', 'customer_id', 'subtotal', 'tax_total', 'discount_total', 'total', 'status', 'due_date', 'notes', 'customer_nif', 'customer_rc', 'customer_nis', 'customer_ai', 'customer_address', 'timbre_fiscal', 'payment_method', 'invoice_type', 'created_at'],
    sqliteSchema: `
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hwid TEXT NOT NULL,
        local_id INTEGER,
        invoice_number TEXT NOT NULL,
        sale_id INTEGER,
        customer_id INTEGER,
        subtotal REAL NOT NULL DEFAULT 0,
        tax_total REAL NOT NULL DEFAULT 0,
        discount_total REAL NOT NULL DEFAULT 0,
        total REAL NOT NULL DEFAULT 0,
        status TEXT DEFAULT 'pending',
        due_date TEXT,
        notes TEXT,
        customer_nif TEXT,
        customer_rc TEXT,
        customer_nis TEXT,
        customer_ai TEXT,
        customer_address TEXT,
        timbre_fiscal REAL DEFAULT 0,
        payment_method TEXT,
        invoice_type TEXT DEFAULT 'B2B',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    pgSchema: `
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        hwid VARCHAR(255) NOT NULL,
        local_id INTEGER,
        invoice_number VARCHAR(255) NOT NULL,
        sale_id INTEGER,
        customer_id INTEGER,
        subtotal DOUBLE PRECISION NOT NULL DEFAULT 0,
        tax_total DOUBLE PRECISION NOT NULL DEFAULT 0,
        discount_total DOUBLE PRECISION NOT NULL DEFAULT 0,
        total DOUBLE PRECISION NOT NULL DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        due_date VARCHAR(100),
        notes TEXT,
        customer_nif VARCHAR(100),
        customer_rc VARCHAR(100),
        customer_nis VARCHAR(100),
        customer_ai VARCHAR(100),
        customer_address TEXT,
        timbre_fiscal DOUBLE PRECISION DEFAULT 0,
        payment_method VARCHAR(100),
        invoice_type VARCHAR(50) DEFAULT 'B2B',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    indices: [
      `CREATE INDEX IF NOT EXISTS idx_invoices_hwid ON invoices(hwid)`
    ]
  },
  {
    name: 'analytics_settings',
    columns: ['id', 'hwid', 'supplier_lead_time_days', 'safety_stock_units', 'weight_sales', 'weight_profit', 'weight_transactions', 'weight_avg_basket', 'weight_target_achievement', 'weight_returns', 'enable_sales_weight', 'enable_profit_weight', 'enable_transactions_weight', 'enable_avg_basket_weight', 'enable_target_achievement_weight', 'enable_returns_weight', 'updated_at'],
    sqliteSchema: `
      CREATE TABLE IF NOT EXISTS analytics_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hwid TEXT NOT NULL UNIQUE,
        supplier_lead_time_days INTEGER DEFAULT 7,
        safety_stock_units REAL DEFAULT 10,
        weight_sales REAL DEFAULT 40,
        weight_profit REAL DEFAULT 20,
        weight_transactions REAL DEFAULT 15,
        weight_avg_basket REAL DEFAULT 10,
        weight_target_achievement REAL DEFAULT 10,
        weight_returns REAL DEFAULT 5,
        enable_sales_weight INTEGER DEFAULT 1,
        enable_profit_weight INTEGER DEFAULT 1,
        enable_transactions_weight INTEGER DEFAULT 1,
        enable_avg_basket_weight INTEGER DEFAULT 1,
        enable_target_achievement_weight INTEGER DEFAULT 1,
        enable_returns_weight INTEGER DEFAULT 1,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    pgSchema: `
      CREATE TABLE IF NOT EXISTS analytics_settings (
        id SERIAL PRIMARY KEY,
        hwid VARCHAR(255) NOT NULL UNIQUE,
        supplier_lead_time_days INTEGER DEFAULT 7,
        safety_stock_units DOUBLE PRECISION DEFAULT 10,
        weight_sales DOUBLE PRECISION DEFAULT 40,
        weight_profit DOUBLE PRECISION DEFAULT 20,
        weight_transactions DOUBLE PRECISION DEFAULT 15,
        weight_avg_basket DOUBLE PRECISION DEFAULT 10,
        weight_target_achievement DOUBLE PRECISION DEFAULT 10,
        weight_returns DOUBLE PRECISION DEFAULT 5,
        enable_sales_weight INTEGER DEFAULT 1,
        enable_profit_weight INTEGER DEFAULT 1,
        enable_transactions_weight INTEGER DEFAULT 1,
        enable_avg_basket_weight INTEGER DEFAULT 1,
        enable_target_achievement_weight INTEGER DEFAULT 1,
        enable_returns_weight INTEGER DEFAULT 1,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    indices: [
      `CREATE INDEX IF NOT EXISTS idx_analytics_settings_hwid ON analytics_settings(hwid)`
    ]
  },
  {
    name: 'goals',
    columns: ['id', 'hwid', 'local_id', 'name', 'description', 'type', 'target_value', 'start_date', 'end_date', 'scope', 'user_id', 'status', 'created_at'],
    sqliteSchema: `
      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hwid TEXT NOT NULL,
        local_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL DEFAULT 'sales',
        target_value REAL NOT NULL DEFAULT 0,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        scope TEXT NOT NULL DEFAULT 'store',
        user_id INTEGER,
        status TEXT NOT NULL DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    pgSchema: `
      CREATE TABLE IF NOT EXISTS goals (
        id SERIAL PRIMARY KEY,
        hwid VARCHAR(255) NOT NULL,
        local_id INTEGER,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) NOT NULL DEFAULT 'sales',
        target_value DOUBLE PRECISION NOT NULL DEFAULT 0,
        start_date VARCHAR(100) NOT NULL,
        end_date VARCHAR(100) NOT NULL,
        scope VARCHAR(50) NOT NULL DEFAULT 'store',
        user_id INTEGER,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    indices: [
      `CREATE INDEX IF NOT EXISTS idx_goals_hwid ON goals(hwid)`
    ]
  },
  {
    name: 'challenges',
    columns: ['id', 'hwid', 'local_id', 'name', 'description', 'type', 'start_date', 'end_date', 'target_value', 'target_role', 'reward_description', 'status', 'created_at'],
    sqliteSchema: `
      CREATE TABLE IF NOT EXISTS challenges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hwid TEXT NOT NULL,
        local_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL DEFAULT 'sales',
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        target_value REAL DEFAULT 0,
        target_role TEXT DEFAULT 'all',
        reward_description TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    pgSchema: `
      CREATE TABLE IF NOT EXISTS challenges (
        id SERIAL PRIMARY KEY,
        hwid VARCHAR(255) NOT NULL,
        local_id INTEGER,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) NOT NULL DEFAULT 'sales',
        start_date VARCHAR(100) NOT NULL,
        end_date VARCHAR(100) NOT NULL,
        target_value DOUBLE PRECISION DEFAULT 0,
        target_role VARCHAR(50) DEFAULT 'all',
        reward_description TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    indices: [
      `CREATE INDEX IF NOT EXISTS idx_challenges_hwid ON challenges(hwid)`
    ]
  },
  {
    name: 'employee_badges',
    columns: ['id', 'hwid', 'local_id', 'user_id', 'badge_key', 'badge_name', 'badge_description', 'badge_icon', 'awarded_at'],
    sqliteSchema: `
      CREATE TABLE IF NOT EXISTS employee_badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hwid TEXT NOT NULL,
        local_id INTEGER,
        user_id INTEGER NOT NULL,
        badge_key TEXT NOT NULL,
        badge_name TEXT NOT NULL,
        badge_description TEXT,
        badge_icon TEXT,
        awarded_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    pgSchema: `
      CREATE TABLE IF NOT EXISTS employee_badges (
        id SERIAL PRIMARY KEY,
        hwid VARCHAR(255) NOT NULL,
        local_id INTEGER,
        user_id INTEGER NOT NULL,
        badge_key VARCHAR(100) NOT NULL,
        badge_name VARCHAR(255) NOT NULL,
        badge_description TEXT,
        badge_icon TEXT,
        awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    indices: [
      `CREATE INDEX IF NOT EXISTS idx_employee_badges_hwid ON employee_badges(hwid)`
    ]
  },
  {
    name: 'commission_rules',
    columns: ['id', 'hwid', 'local_id', 'name', 'type', 'rate', 'tiers_json', 'user_id', 'is_active', 'created_at'],
    sqliteSchema: `
      CREATE TABLE IF NOT EXISTS commission_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hwid TEXT NOT NULL,
        local_id INTEGER,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'percentage',
        rate REAL DEFAULT 0,
        tiers_json TEXT DEFAULT '[]',
        user_id INTEGER,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    pgSchema: `
      CREATE TABLE IF NOT EXISTS commission_rules (
        id SERIAL PRIMARY KEY,
        hwid VARCHAR(255) NOT NULL,
        local_id INTEGER,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'percentage',
        rate DOUBLE PRECISION DEFAULT 0,
        tiers_json TEXT DEFAULT '[]',
        user_id INTEGER,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    indices: [
      `CREATE INDEX IF NOT EXISTS idx_commission_rules_hwid ON commission_rules(hwid)`
    ]
  },
  {
    name: 'employee_schedules',
    columns: ['id', 'hwid', 'local_id', 'user_id', 'date', 'shift', 'notes', 'created_at'],
    sqliteSchema: `
      CREATE TABLE IF NOT EXISTS employee_schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hwid TEXT NOT NULL,
        local_id INTEGER,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        shift TEXT NOT NULL DEFAULT 'morning',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    pgSchema: `
      CREATE TABLE IF NOT EXISTS employee_schedules (
        id SERIAL PRIMARY KEY,
        hwid VARCHAR(255) NOT NULL,
        local_id INTEGER,
        user_id INTEGER NOT NULL,
        date VARCHAR(100) NOT NULL,
        shift VARCHAR(50) NOT NULL DEFAULT 'morning',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    indices: [
      `CREATE INDEX IF NOT EXISTS idx_schedules_hwid ON employee_schedules(hwid)`
    ]
  }
]
