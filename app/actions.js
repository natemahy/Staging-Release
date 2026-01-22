'use server'

import { put } from '@vercel/blob';
import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode('my-super-secret-key-change-this-later');

// --- HELPER: Connect lazily ---
function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("CRITICAL: DATABASE_URL is missing from Vercel Environment Variables.");
  }
  return neon(process.env.DATABASE_URL);
}

// --- HELPER: Get Current User ID & Company from Cookie ---
async function getCurrentAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload; // Returns { id, role, company_id }
  } catch (err) {
    return null;
  }
}

// ==========================================
// 1. SHIPMENT LOGIC
// ==========================================

export async function submitShipment(formData) {
  const sql = getSql();
  
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

  const pdfFile = formData.get('pdf_submission');
  let pdfUrl = null;
  if (pdfFile && pdfFile.size > 0) {
    const blob = await put(pdfFile.name, pdfFile, { access: 'public' });
    pdfUrl = blob.url;
  }

  try {
    await sql`
      INSERT INTO shipments (
        delivery_date, company_id, po_number, part_number,
        supplier_name, supplier_location, package_type,
        qty_received, warehouse_placement, quality_check,
        damaged_photos, packing_slip_photos,
        dimensional_report_photos, shipment_photos,
        status, submitted_by_user_id,
        warehouse_column_cell, original_id_number,
        pdf_submission, created_at
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
        ${formData.get('original_id_number')},
        ${pdfUrl},
        NOW()
      )
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to save shipment');
  }

  revalidatePath('/vendor/check-in');
}

// ==========================================
// 2. DATA RETRIEVAL (AUTO-FILTERED)
// ==========================================

export async function getDashboardStats(role) {
  const sql = getSql();
  const auth = await getCurrentAuth();
  
  // AUTO-FILTER: If customer, force their ID. If Vendor/Admin, allow all.
  const companyId = (role === 'customer') ? auth?.company_id : null;

  const companyFilter = companyId 
    ? sql`AND shipments.company_id = ${companyId}` 
    : sql``;

  const activeCount = await sql`SELECT COUNT(*) FROM shipments WHERE status != 'Invoiced' ${companyFilter}`;
  const needDeliveredCount = await sql`SELECT COUNT(*) FROM shipments WHERE company_status = 'Need Delivered' ${companyFilter}`;
  const completeCount = await sql`SELECT COUNT(*) FROM shipments WHERE status = 'Complete' ${companyFilter}`;
  const invoiced6MonthsCount = await sql`SELECT COUNT(*) FROM shipments WHERE status = 'Invoiced' AND created_at > NOW() - INTERVAL '6 months' ${companyFilter}`;
  const damagedCount = await sql`SELECT COUNT(*) FROM shipments WHERE quality_check = 'Damaged' ${companyFilter}`;

  const graphData = await sql`
    SELECT TO_CHAR(created_at, 'Mon') as name, COUNT(*)::int as total
    FROM shipments
    WHERE created_at > NOW() - INTERVAL '6 months'
    ${companyFilter}
    GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
    ORDER BY DATE_TRUNC('month', created_at) ASC
  `;

  const recentComments = await sql`
    SELECT 
      comments.message, 
      comments.created_at, 
      users.email, 
      shipments.id as shipment_id, 
      shipments.po_number, 
      companies.name as company_name
    FROM comments 
    JOIN users ON comments.user_id = users.id
    LEFT JOIN shipments ON comments.shipment_id = shipments.id
    LEFT JOIN companies ON shipments.company_id = companies.id
    WHERE 1=1 ${companyFilter} 
    AND shipments.id IS NOT NULL
    ORDER BY comments.created_at DESC 
    LIMIT 6
  `;

  return {
    active: activeCount[0]?.count || 0,
    needDelivered: needDeliveredCount[0]?.count || 0,
    readyToInvoice: completeCount[0]?.count || 0,
    invoiced: invoiced6MonthsCount[0]?.count || 0,
    damaged: damagedCount[0]?.count || 0,
    graph: graphData || [],
    comments: recentComments || []
  };
}

export async function getShipments(role) {
  const sql = getSql();
  const auth = await getCurrentAuth();

  // AUTO-FILTER: If customer, force their ID
  const companyId = (role === 'customer') ? auth?.company_id : null;

  const companyFilter = companyId 
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
// 3. ADMIN / USER MANAGEMENT LOGIC
// ==========================================

export async function getCompanies() {
  const sql = getSql();
  return await sql`SELECT * FROM companies ORDER BY name ASC`;
}

export async function createCompany(formData) {
  const sql = getSql();
  try {
    await sql`INSERT INTO companies (name, code_prefix) VALUES (${formData.get('name')}, ${formData.get('code_prefix').toUpperCase()})`;
    revalidatePath('/admin/users');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Failed to create company.' };
  }
}

export async function createUser(formData) {
  const sql = getSql();
  try {
    await sql`INSERT INTO users (email, role, company_id) VALUES (${formData.get('email')}, ${formData.get('role')}, ${formData.get('company_id') || null})`;
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Failed to create user.' };
  }
}

export async function getUsers() {
  const sql = getSql();
  return await sql`
    SELECT users.*, companies.name as company_name 
    FROM users 
    LEFT JOIN companies ON users.company_id = companies.id
    ORDER BY users.id DESC
  `;
}

// ==========================================
// 4. AUTH & DETAILS (UNCHANGED)
// ==========================================

export async function loginUser(formData) {
  try {
    const sql = getSql();
    const email = formData.get('email');
    const password = formData.get('password');

    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    const user = users[0];

    if (!user || !user.password_hash) return { success: false, message: 'User not found.' };

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

    (await cookies()).set('session', token, { httpOnly: true, secure: true, maxAge: 86400 });

    return { success: true, role: user.role };
  } catch (error) {
    return { success: false, message: `System Error: ${error.message}` };
  }
}

export async function getShipmentById(id) {
  const sql = getSql();
  const result = await sql`
    SELECT shipments.*, companies.name as company_name 
    FROM shipments 
    LEFT JOIN companies ON shipments.company_id = companies.id
    WHERE shipments.id = ${id}
  `;
  const comments = await sql`
    SELECT comments.*, users.email FROM comments 
    LEFT JOIN users ON comments.user_id = users.id
    WHERE shipment_id = ${id} ORDER BY created_at DESC
  `;
  return { shipment: result[0], comments: comments };
}

export async function saveShipmentChanges(formData) {
  const sql = getSql();
  const id = formData.get('id');
  const role = formData.get('role');

  if (role === 'customer') {
    await sql`UPDATE shipments SET company_status = ${formData.get('company_status')}, company_inspection = ${formData.get('company_inspection')} WHERE id = ${id}`;
  } else {
    // Admin/Vendor Update Logic
     await sql`
      UPDATE shipments SET 
        po_number = ${formData.get('po_number')},
        part_number = ${formData.get('part_number')},
        supplier_name = ${formData.get('supplier_name')},
        supplier_location = ${formData.get('supplier_location')},
        package_type = ${formData.get('package_type')},
        qty_received = ${formData.get('qty_received')},
        warehouse_placement = ${formData.get('warehouse_placement')},
        warehouse_column_cell = ${formData.get('warehouse_column_cell')},
        original_id_number = ${formData.get('original_id_number')},
        status = ${formData.get('status') || 'Received'},
        company_status = ${formData.get('company_status')},
        company_inspection = ${formData.get('company_inspection')}
      WHERE id = ${id}
    `;
  }
  revalidatePath('/vendor/shipments');
  revalidatePath('/admin/shipments');
  revalidatePath('/customer/shipments');
}

export async function addComment(formData) {
  const sql = getSql();
  await sql`INSERT INTO comments (shipment_id, user_id, message) VALUES (${formData.get('shipment_id')}, 1, ${formData.get('message')})`;
  revalidatePath(`/admin/shipments/${formData.get('shipment_id')}`);
}

export async function activateAccount(formData) {
  // same as before...
  const sql = getSql();
  const email = formData.get('email');
  const password = formData.get('password');
  const hashedPassword = await bcrypt.hash(password, 10);
  await sql`UPDATE users SET password_hash = ${hashedPassword} WHERE email = ${email}`;
  return await loginUser(formData);
}