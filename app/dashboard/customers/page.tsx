import { Suspense } from 'react';
import type { Metadata } from 'next';
import CustomersTable, { CustomersSearch } from '@/app/ui/customers/table';
import { lusitana } from '@/app/ui/fonts';
import { CustomersTableSkeleton } from '@/app/ui/skeletons';

export const metadata: Metadata = {
  title: 'Customers',
};

type SearchParams = Promise<{ query?: string }>;

async function CustomersContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  return <CustomersTable query={params?.query || ''} />;
}

export default function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <div className="w-full">
      <h1 className={`${lusitana.className} mb-8 text-xl md:text-2xl`}>
        Customers
      </h1>
      <CustomersSearch />
      <Suspense fallback={<CustomersTableSkeleton />}>
        <CustomersContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
