'use server'

import { put } from '@vercel/blob';
import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

// --- HELPER: Connect lazily to prevent top-level crashes ---
function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("CRITICAL: DATABASE_URL is missing from Vercel Environment Variables.");
  }
  return neon(process.env.DATABASE_URL);
}

// ==========================================
// 1. SHIPMENT LOGIC (Vendor Form)
// ==========================================

export async function submitShipment(formData) {
  const sql = getSql(); // Connect here instead of top-level
  
  async function uploadFiles(fieldName) {
    const files = formData.getAll(fieldName);
    const urls = [];
    for (const file of files) {
      if (file.size > 0) {
        const blob = await put(file.name, file, { access: 'public' });
        urls.push(blob.url);
      }
    }
    return urls;
  }

  const damagedUrls = await uploadFiles('damaged_photos');
  const packingSlipUrls = await uploadFiles('packing_slip_photos');
  const dimReportUrls = await uploadFiles('dimensional_report_photos');
  const shipmentUrls = await uploadFiles('shipment_photos');

  try {
    await sql`
      INSERT INTO shipments (
        delivery_date, company_id, po_number, part_number,
        supplier_name, supplier_location, package_type,
        qty_received, warehouse_placement, quality_check,
        damaged_photos, packing_slip_photos,
        dimensional_report_photos, shipment_photos,
        status, submitted_by_user_id,
        warehouse_column_cell, original_id_number
      ) VALUES (
        ${formData.get('delivery_date')},
        ${formData.get('company_id')}, 
        ${formData.get('po_number')},
        ${formData.get('part_number')},
        ${formData.get('supplier_name')},
        ${formData.get('supplier_location')},
        ${formData.get('package_type')},
        ${formData.get('qty_received')},
        ${formData.get('warehouse_placement')},
        ${formData.get('quality_check')},
        ${damagedUrls},       
        ${packingSlipUrls},   
        ${dimReportUrls},     
        ${shipmentUrls},      
        'Received',           
        1,
        ${formData.get('warehouse_column_cell')},
        ${formData.get('original_id_number')}
      )
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to save shipment');
  }

  revalidatePath('/vendor/check-in');
}

// ==========================================
// 2. ADMIN / USER MANAGEMENT LOGIC
// ==========================================

export async function getCompanies() {
  const sql = getSql();
  const companies = await sql`SELECT * FROM companies ORDER BY name ASC`;
  return companies;
}

export async function createCompany(formData) {
  const sql = getSql();
  try {
    const name = formData.get('name');
    const code = formData.get('code_prefix').toUpperCase();

    await sql`
      INSERT INTO companies (name, code_prefix)
      VALUES (${name}, ${code})
    `;
    
    revalidatePath('/admin/users');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Create Company Error:', error);
    if (error.code === '23505') {
       return { success: false, message: 'Company name or code already exists.' };
    }
    return { success: false, message: 'Failed to create company.' };
  }
}

export async function createUser(formData) {
  const sql = getSql();
  try {
    const email = formData.get('email');
    const role = formData.get('role');
    const companyId = formData.get('company_id');

    await sql`
      INSERT INTO users (email, role, company_id)
      VALUES (${email}, ${role}, ${companyId || null})
    `;
    
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Create User Error:', error);
    if (error.code === '23505') { 
      return { success: false, message: 'User with this email already exists.' };
    }
    return { success: false, message: 'Failed to create user.' };
  }
}

export async function getUsers() {
  const sql = getSql();
  const users = await sql`
    SELECT users.*, companies.name as company_name 
    FROM users 
    LEFT JOIN companies ON users.company_id = companies.id
    ORDER BY users.id DESC
  `;
  return users;
}

// ==========================================
// 3. AUTHENTICATION LOGIC (UPDATED)
// ==========================================

const JWT_SECRET = new TextEncoder().encode('my-super-secret-key-change-this-later');

export async function activateAccount(formData) {
  const sql = getSql();
  const email = formData.get('email');
  const password = formData.get('password');
  
  const users = await sql`SELECT * FROM users WHERE email = ${email}`;
  const user = users[0];

  if (!user) return { success: false, message: 'Email not found.' };
  if (user.password_hash) return { success: false, message: 'Account already activated.' };

  const hashedPassword = await bcrypt.hash(password, 10);
  await sql`UPDATE users SET password_hash = ${hashedPassword} WHERE email = ${email}`;

  return await loginUser(formData);
}

export async function loginUser(formData) {
  try {
    // 1. Initialize DB inside the function (Safe Mode)
    const sql = getSql();
    
    const email = formData.get('email');
    const password = formData.get('password');

    console.log("Attempting login for:", email);

    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    const user = users[0];

    if (!user || !user.password_hash) {
      return { success: false, message: 'User not found or no password set.' };
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return { success: false, message: 'Invalid password.' };

    const token = await new SignJWT({ 
        id: user.id, 
        role: user.role, 
        company_id: user.company_id 
      })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    (await cookies()).set('session', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 60 * 60 * 24 
    });

    return { success: true, role: user.role };

  } catch (error) {
    console.error("LOGIN CRASH DETAILS:", error);
    // This will now show the REAL reason on your screen
    return { success: false, message: `System Error: ${error.message}` };
  }
}

// ==========================================
// 4. DASHBOARD STATS LOGIC
// ==========================================

export async function getDashboardStats(role, companyId) {
  const sql = getSql();
  const companyFilter = (role === 'customer' && companyId) 
    ? sql`AND company_id = ${companyId}` 
    : sql``;

  const activeCount = await sql`SELECT COUNT(*) FROM shipments WHERE status != 'Invoiced' ${companyFilter}`;
  const needDeliveredCount = await sql`SELECT COUNT(*) FROM shipments WHERE company_status = 'Need Delivered' ${companyFilter}`;
  const completeCount = await sql`SELECT COUNT(*) FROM shipments WHERE status = 'Complete' ${companyFilter}`;
  const invoiced6MonthsCount = await sql`SELECT COUNT(*) FROM shipments WHERE status = 'Invoiced' AND created_at > NOW() - INTERVAL '6 months' ${companyFilter}`;
  const damagedCount = await sql`SELECT COUNT(*) FROM shipments WHERE quality_check = 'Damaged' ${companyFilter}`;

  const recentComments = await sql`
    SELECT comments.message, users.email, comments.created_at 
    FROM comments 
    JOIN users ON comments.user_id = users.id
    LEFT JOIN shipments ON comments.shipment_id = shipments.id
    WHERE 1=1 ${companyFilter}
    ORDER BY comments.created_at DESC 
    LIMIT 5
  `;

  return {
    active: activeCount[0]?.count || 0,
    needDelivered: needDeliveredCount[0]?.count || 0,
    readyToInvoice: completeCount[0]?.count || 0,
    invoiced: invoiced6MonthsCount[0]?.count || 0,
    damaged: damagedCount[0]?.count || 0,
    comments: recentComments || []
  };
}

// ==========================================
// 5. SHIPMENT LIST LOGIC
// ==========================================

export async function getShipments(role, companyId) {
  const sql = getSql();
  const companyFilter = (role === 'customer' && companyId) 
    ? sql`AND shipments.company_id = ${companyId}` 
    : sql``;

  const rows = await sql`
    SELECT 
      shipments.*, 
      companies.name as company_name, 
      users.email as submitted_by_email
    FROM shipments
    LEFT JOIN companies ON shipments.company_id = companies.id
    LEFT JOIN users ON shipments.submitted_by_user_id = users.id
    WHERE 1=1 ${companyFilter}
    ORDER BY shipments.created_at DESC
  `;
  
  return rows;
}

// ==========================================
// 6. DETAIL & EDIT LOGIC (MASTER SAVE)
// ==========================================

export async function getShipmentById(id) {
  const sql = getSql();
  const result = await sql`
    SELECT shipments.*, companies.name as company_name 
    FROM shipments 
    LEFT JOIN companies ON shipments.company_id = companies.id
    WHERE shipments.id = ${id}
  `;
  
  const comments = await sql`
    SELECT comments.*, users.email 
    FROM comments 
    LEFT JOIN users ON comments.user_id = users.id
    WHERE shipment_id = ${id}
    ORDER BY created_at DESC
  `;

  return { shipment: result[0], comments: comments };
}

export async function addComment(formData) {
  const sql = getSql();
  const shipmentId = formData.get('shipment_id');
  const message = formData.get('message');
  const userId = 1;

  await sql`
    INSERT INTO comments (shipment_id, user_id, message)
    VALUES (${shipmentId}, ${userId}, ${message})
  `;

  revalidatePath(`/vendor/shipments/${shipmentId}`);
}

export async function saveShipmentChanges(formData) {
  const sql = getSql();
  const id = formData.get('id');
  const role = formData.get('role');

  const commonUpdates = {
    po_number: formData.get('po_number'),
    part_number: formData.get('part_number'),
    supplier_name: formData.get('supplier_name'),
    supplier_location: formData.get('supplier_location'),
    package_type: formData.get('package_type'),
    qty_received: formData.get('qty_received'),
    warehouse_placement: formData.get('warehouse_placement'),
    warehouse_column_cell: formData.get('warehouse_column_cell'),
    original_id_number: formData.get('original_id_number'),
  };

  if (role === 'vendor') {
    const status = formData.get('status');
    await sql`
      UPDATE shipments SET 
        po_number = ${commonUpdates.po_number},
        part_number = ${commonUpdates.part_number},
        supplier_name = ${commonUpdates.supplier_name},
        supplier_location = ${commonUpdates.supplier_location},
        package_type = ${commonUpdates.package_type},
        qty_received = ${commonUpdates.qty_received},
        warehouse_placement = ${commonUpdates.warehouse_placement},
        warehouse_column_cell = ${commonUpdates.warehouse_column_cell},
        original_id_number = ${commonUpdates.original_id_number},
        status = ${status}
      WHERE id = ${id}
    `;
  } 
  else if (role === 'admin') {
    const status = formData.get('status');
    const companyStatus = formData.get('company_status');
    const inspection = formData.get('company_inspection');

    await sql`
      UPDATE shipments SET 
        po_number = ${commonUpdates.po_number},
        part_number = ${commonUpdates.part_number},
        supplier_name = ${commonUpdates.supplier_name},
        supplier_location = ${commonUpdates.supplier_location},
        package_type = ${commonUpdates.package_type},
        qty_received = ${commonUpdates.qty_received},
        warehouse_placement = ${commonUpdates.warehouse_placement},
        warehouse_column_cell = ${commonUpdates.warehouse_column_cell},
        original_id_number = ${commonUpdates.original_id_number},
        status = ${status},
        company_status = ${companyStatus},
        company_inspection = ${inspection}
      WHERE id = ${id}
    `;
  }

  revalidatePath(`/vendor/shipments/${id}`);
  revalidatePath(`/admin/shipments/${id}`);
  revalidatePath(`/admin/dashboard`);
}