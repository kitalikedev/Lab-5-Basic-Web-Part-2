import { Suspense } from 'react';
import type { Metadata } from 'next';
import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';
import { FormSkeleton } from '@/app/ui/skeletons';

export const metadata: Metadata = {
  title: 'Edit Invoice',
};

// params là Promise trong Next.js 16, await bên trong Suspense
async function EditInvoiceForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id), // gọi notFound() nếu không có -> hiện not-found.tsx
    fetchCustomers(),
  ]);

  return <Form invoice={invoice} customers={customers} />;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: '/dashboard/invoices',
            active: true,
          },
        ]}
      />
      <Suspense fallback={<FormSkeleton />}>
        <EditInvoiceForm params={params} />
      </Suspense>
    </main>
  );
}
