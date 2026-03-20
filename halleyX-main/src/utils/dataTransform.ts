import { Order } from '../types';

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
  [key: string]: any;
}

/**
 * Transform orders by aggregating a field
 */
export function aggregateOrdersBy(
  orders: Order[],
  field: keyof Order,
  aggregation: 'Sum' | 'Average' | 'Count'
): ChartDataPoint[] {
  const grouped: Record<string, Order[]> = {};

  // Group by field value
  orders.forEach((order) => {
    const key = String(order[field] ?? 'Unknown');
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(order);
  });

  // Aggregate
  const result: ChartDataPoint[] = Object.entries(grouped).map(([name, items]) => {
    let value: number;

    if (aggregation === 'Count') {
      value = items.length;
    } else if (aggregation === 'Sum') {
      value = items.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    } else {
      // Average
      const sum = items.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
      value = sum / items.length;
    }

    return { name, value };
  });

  return result.sort((a, b) => b.value - a.value);
}

/**
 * Calculate single KPI metric from orders
 */
export function calculateKPI(
  orders: Order[],
  metric: keyof Order,
  aggregation: 'Sum' | 'Average' | 'Count'
): number {
  if (aggregation === 'Count') {
    return orders.length;
  }

  const values = orders
    .map((o) => {
      const val = o[metric];
      return typeof val === 'number' ? val : Number(val) || 0;
    })
    .filter((v) => !isNaN(v));

  if (values.length === 0) return 0;

  if (aggregation === 'Sum') {
    return values.reduce((a, b) => a + b, 0);
  } else {
    // Average
    return values.reduce((a, b) => a + b, 0) / values.length;
  }
}

/**
 * Format number as currency, percentage, or plain number
 */
export function formatNumber(value: number, format: 'Currency' | 'Number' | 'Percentage', precision: number = 2): string {
  if (format === 'Currency') {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: precision, maximumFractionDigits: precision })}`;
  } else if (format === 'Percentage') {
    return `${(value * 100).toFixed(precision)}%`;
  } else {
    return value.toLocaleString('en-US', { maximumFractionDigits: precision });
  }
}

/**
 * Get status color
 */
export function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    'Pending': '#f59e0b',
    'In progress': '#3b82f6',
    'Completed': '#10b981',
    'Cancelled': '#ef4444',
  };
  return statusMap[status] || '#6b7280';
}

/**
 * Get status bg color (tailwind)
 */
export function getStatusBgColor(status: string): string {
  const statusMap: Record<string, string> = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'In progress': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800',
  };
  return statusMap[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Format date to readable string
 */
export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Invalid date';
  }
}

/**
 * Get time series data from orders
 */
export function getTimeSeriesData(orders: Order[]): TimeSeriesPoint[] {
  const daily: Record<string, number> = {};

  orders.forEach((order) => {
    const date = new Date(order.orderDate);
    const key = date.toLocaleDateString('en-US');
    daily[key] = (daily[key] || 0) + 1;
  });

  const sorted = Object.entries(daily)
    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
    .map(([date, value]) => ({ date, value }));

  return sorted;
}

/**
 * Get revenue over time
 */
export function getRevenueTimeSeriesData(orders: Order[]): TimeSeriesPoint[] {
  const daily: Record<string, number> = {};

  orders.forEach((order) => {
    const date = new Date(order.orderDate);
    const key = date.toLocaleDateString('en-US');
    daily[key] = (daily[key] || 0) + Number(order.totalAmount);
  });

  const sorted = Object.entries(daily)
    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
    .map(([date, value]) => ({ date, value }));

  return sorted;
}
