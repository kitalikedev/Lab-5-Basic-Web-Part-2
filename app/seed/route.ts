import bcrypt from 'bcryptjs';
import sql from '@/app/lib/db';
import { users, customers, invoices, revenue } from '@/app/lib/placeholder-data';

async function seedUsers() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  for (const user of users) {
    // Băm mật khẩu trước khi lưu
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await sql`
      INSERT INTO users (id, name, email, password)
      VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
      ON CONFLICT (id) DO NOTHING;
    `;
  }
}

async function seedCustomers() {
  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  for (const customer of customers) {
    await sql`
      INSERT INTO customers (id, name, email, image_url)
      VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
      ON CONFLICT (id) DO NOTHING;
    `;
  }
}

async function seedInvoices() {
  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      customer_id UUID NOT NULL REFERENCES customers(id),
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;

  // Hóa đơn không có id cố định, nên chỉ chèn khi bảng còn trống (chạy lại không bị nhân đôi)
  const [{ count }] = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int AS count FROM invoices
  `;
  if (count === 0) {
    for (const invoice of invoices) {
      await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date});
      `;
    }
  }
}

async function seedRevenue() {
  await sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  for (const rev of revenue) {
    await sql`
      INSERT INTO revenue (month, revenue)
      VALUES (${rev.month}, ${rev.revenue})
      ON CONFLICT (month) DO NOTHING;
    `;
  }
}

// Bật RLS để Data API công khai của Supabase không đọc được các bảng này.
// Kết nối của app (role postgres) vẫn đọc/ghi bình thường.
async function lockDataApi() {
  await sql`ALTER TABLE users ENABLE ROW LEVEL SECURITY`;
  await sql`ALTER TABLE customers ENABLE ROW LEVEL SECURITY`;
  await sql`ALTER TABLE invoices ENABLE ROW LEVEL SECURITY`;
  await sql`ALTER TABLE revenue ENABLE ROW LEVEL SECURITY`;
}

export async function GET() {
  try {
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();
    await lockDataApi();

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Seed failed' }, { status: 500 });
  }
}
