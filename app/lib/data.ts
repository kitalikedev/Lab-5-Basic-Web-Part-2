import sql from '@/app/lib/db';
import { notFound } from 'next/navigation';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoice,
  Revenue,
} from '@/app/lib/definitions';
import { formatCurrency } from '@/app/lib/utils';

export const ITEMS_PER_PAGE = 6;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function fetchRevenue() {
  try {
    const data = await sql<Revenue[]>`SELECT * FROM revenue`;
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await sql<
      { id: string; name: string; image_url: string; email: string; amount: number }[]
    >`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices: LatestInvoice[] = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    // Các truy vấn độc lập nên chạy song song để không bị "waterfall"
    const invoiceCountPromise = sql<{ count: number }[]>`
      SELECT COUNT(*)::int AS count FROM invoices`;
    const customerCountPromise = sql<{ count: number }[]>`
      SELECT COUNT(*)::int AS count FROM customers`;
    const invoiceStatusPromise = sql<{ paid: number; pending: number }[]>`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0)::int AS paid,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0)::int AS pending
      FROM invoices`;

    const [invoiceCount, customerCount, invoiceStatus] = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    return {
      numberOfCustomers: customerCount[0].count,
      numberOfInvoices: invoiceCount[0].count,
      totalPaidInvoices: formatCurrency(invoiceStatus[0].paid),
      totalPendingInvoices: formatCurrency(invoiceStatus[0].pending),
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const pattern = `%${query}%`;

  try {
    const invoices = await sql<InvoicesTable[]>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.date::text AS date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${pattern} OR
        customers.email ILIKE ${pattern} OR
        invoices.amount::text ILIKE ${pattern} OR
        invoices.date::text ILIKE ${pattern} OR
        invoices.status ILIKE ${pattern}
      ORDER BY invoices.date DESC, invoices.id
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}`;

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  const pattern = `%${query}%`;

  try {
    const data = await sql<{ count: number }[]>`
      SELECT COUNT(*)::int AS count
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${pattern} OR
        customers.email ILIKE ${pattern} OR
        invoices.amount::text ILIKE ${pattern} OR
        invoices.date::text ILIKE ${pattern} OR
        invoices.status ILIKE ${pattern}`;

    return Math.ceil(data[0].count / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  // id không phải UUID (ví dụ /edit/abc) thì coi như không tồn tại
  if (!UUID_REGEX.test(id)) {
    notFound();
  }

  let invoice: InvoiceForm | undefined;
  try {
    const data = await sql<InvoiceForm[]>`
      SELECT id, customer_id, amount, status
      FROM invoices
      WHERE id = ${id}`;
    invoice = data[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }

  if (!invoice) {
    notFound(); // hiển thị not-found.tsx
  }

  return {
    ...invoice,
    amount: invoice.amount / 100, // cent -> đô la cho form
  };
}

export async function fetchCustomers() {
  try {
    const customers = await sql<CustomerField[]>`
      SELECT id, name FROM customers ORDER BY name ASC`;
    return customers;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  const pattern = `%${query}%`;

  try {
    const data = await sql<
      {
        id: string;
        name: string;
        email: string;
        image_url: string;
        total_invoices: number;
        total_pending: number;
        total_paid: number;
      }[]
    >`
      SELECT
        customers.id,
        customers.name,
        customers.email,
        customers.image_url,
        COUNT(invoices.id)::int AS total_invoices,
        COALESCE(SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END), 0)::int AS total_pending,
        COALESCE(SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END), 0)::int AS total_paid
      FROM customers
      LEFT JOIN invoices ON customers.id = invoices.customer_id
      WHERE
        customers.name ILIKE ${pattern} OR
        customers.email ILIKE ${pattern}
      GROUP BY customers.id, customers.name, customers.email, customers.image_url
      ORDER BY customers.name ASC`;

    const customers: CustomersTableType[] = data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch customer table.');
  }
}
