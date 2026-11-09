import { Suspense } from 'react';
import type { Metadata } from 'next';
import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/invoices/table';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { fetchInvoicesPages } from '@/app/lib/data';

export const metadata: Metadata = {
  title: 'Invoices',
};

type SearchParams = Promise<{ query?: string; page?: string }>;

// Đọc searchParams (dữ liệu runtime) nên phải nằm trong Suspense
async function InvoicesContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const query = params?.query || '';
  // Ép về số nguyên >= 1 để ?page=-1 hay ?page=abc không làm database báo lỗi
  const currentPage = Math.max(1, Math.floor(Number(params?.page)) || 1);
  const totalPages = await fetchInvoicesPages(query);

  return (
    <>
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Suspense>
          <Pagination totalPages={totalPages} />
        </Suspense>
      </div>
    </>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Suspense>
          <Search placeholder="Search invoices..." />
        </Suspense>
        <CreateInvoice />
      </div>
      <Suspense fallback={<InvoicesTableSkeleton />}>
        <InvoicesContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
