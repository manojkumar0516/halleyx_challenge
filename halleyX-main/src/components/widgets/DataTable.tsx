import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Order } from '../../types';
import { formatDate, getStatusBgColor } from '../../utils/dataTransform';
import { useTheme } from '../../context/ThemeContext';

interface DataTableProps {
  columns: (keyof Order)[];
  orders: Order[];
  sortableColumns?: (keyof Order)[];
  isLoading?: boolean;
}

export function DataTable({
  columns,
  orders,
  sortableColumns = [],
  isLoading = false,
}: DataTableProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [sortKey, setSortKey] = useState<keyof Order | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: keyof Order) => {
    if (!sortableColumns.includes(column)) return;

    if (sortKey === column) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(column);
      setSortDir('asc');
    }
  };

  let sortedOrders = [...orders];
  if (sortKey) {
    sortedOrders.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal ?? '');
      const bStr = String(bVal ?? '');
      return sortDir === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }

  const COLUMN_LABELS: Record<keyof Order, string> = {
    id: 'Order ID',
    customerId: 'Customer ID',
    customerName: 'Customer',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    streetAddress: 'Address',
    city: 'City',
    state: 'State',
    postalCode: 'Zip',
    country: 'Country',
    product: 'Product',
    quantity: 'Qty',
    unitPrice: 'Unit Price',
    totalAmount: 'Total',
    status: 'Status',
    createdBy: 'Created By',
    orderDate: 'Date',
  };

  const formatValue = (value: any, column: keyof Order) => {
    if (column === 'orderDate') return formatDate(value);
    if (column === 'totalAmount' || column === 'unitPrice')
      return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    return String(value ?? '-');
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`h-10 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'} animate-pulse`} />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={`py-12 text-center ${isDark ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg`}>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className={`border-b ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
            {columns.map((column) => (
              <th
                key={String(column)}
                className={`px-4 py-3 text-left font-semibold ${
                  isDark ? 'text-slate-200' : 'text-slate-900'
                } ${sortableColumns.includes(column) ? 'cursor-pointer hover:bg-slate-700' : ''}`}
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center gap-2">
                  {COLUMN_LABELS[column]}
                  {sortableColumns.includes(column) &&
                    (sortKey === column ? (
                      sortDir === 'asc' ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    ) : (
                      <ChevronsUpDown className="w-4 h-4 opacity-50" />
                    ))}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedOrders.map((order, idx) => (
            <tr
              key={order.id}
              className={`border-b transition-colors ${
                isDark
                  ? 'border-slate-700 hover:bg-slate-800'
                  : 'border-slate-200 hover:bg-slate-50'
              } ${idx % 2 === 0 ? (isDark ? 'bg-slate-900' : 'bg-white') : isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}
            >
              {columns.map((column) => (
                <td
                  key={String(column)}
                  className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}
                >
                  {column === 'status' ? (
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBgColor(
                        String(order[column])
                      )}`}
                    >
                      {formatValue(order[column], column)}
                    </span>
                  ) : (
                    formatValue(order[column], column)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
