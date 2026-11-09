import Image from 'next/image';
import Search from '@/app/ui/search';
import { fetchFilteredCustomers } from '@/app/lib/data';
import { Suspense } from 'react';

// Ô tìm kiếm là client component dùng useSearchParams nên bọc trong Suspense
export default async function CustomersTable({ query }: { query: string }) {
  const customers = await fetchFilteredCustomers(query);

  return (
    <div className="w-full">
      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
              <table className="hidden min-w-full rounded-md text-gray-900 md:table">
                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Total Invoices
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Total Pending
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium">
                      Total Paid
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="group">
                      <td className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center gap-3">
                          <Image
                            src={customer.image_url}
                            className="rounded-full"
                            alt={`${customer.name}'s profile picture`}
                            width={28}
                            height={28}
                          />
                          <p>{customer.name}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {customer.email}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {customer.total_invoices}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {customer.total_pending}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {customer.total_paid}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="md:hidden">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="mb-2 w-full rounded-md bg-white p-4"
                  >
                    <div className="flex items-center gap-3 border-b pb-4">
                      <Image
                        src={customer.image_url}
                        className="rounded-full"
                        alt={`${customer.name}'s profile picture`}
                        width={28}
                        height={28}
                      />
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-gray-500">
                          {customer.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between pt-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Pending</p>
                        <p className="font-medium">{customer.total_pending}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Paid</p>
                        <p className="font-medium">{customer.total_paid}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Invoices</p>
                        <p className="font-medium">{customer.total_invoices}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {customers.length === 0 && (
                <p className="p-6 text-center text-sm text-gray-500">
                  No customers found.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CustomersSearch() {
  return (
    <Suspense>
      <Search placeholder="Search customers..." />
    </Suspense>
  );
}
