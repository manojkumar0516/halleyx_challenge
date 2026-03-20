import { Order } from '../types';

const rawApiBase = import.meta.env.VITE_API_URL?.trim();
const API_BASE = rawApiBase ? rawApiBase.replace(/\/$/, '') : '';

function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export async function fetchOrders(): Promise<Order[]> {
  try {
    const res = await fetch(apiUrl('/api/orders'));
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(
        `Failed to fetch orders (${res.status}): ${errorData?.message || res.statusText}`
      );
    }
    return res.json();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error or server unreachable';
    console.error('[orderApi:fetchOrders] Error details:', { message, apiUrl: API_BASE });
    throw new Error(`Unable to fetch orders: ${message}`);
  }
}

export async function createOrder(order: Order): Promise<Order> {
  try {
    const res = await fetch(apiUrl('/api/orders'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(
        `Failed to create order (${res.status}): ${errorData?.message || res.statusText}`
      );
    }
    return res.json();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error or server unreachable';
    console.error('[orderApi:createOrder] Error details:', { message, apiUrl: API_BASE, order });
    throw new Error(`Unable to create order: ${message}`);
  }
}

export async function updateOrder(id: string, order: Partial<Order>): Promise<Order> {
  try {
    const res = await fetch(apiUrl(`/api/orders/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(
        `Failed to update order (${res.status}): ${errorData?.message || res.statusText}`
      );
    }
    return res.json();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error or server unreachable';
    console.error('[orderApi:updateOrder] Error details:', { message, apiUrl: API_BASE, id });
    throw new Error(`Unable to update order: ${message}`);
  }
}

export async function deleteOrderApi(id: string): Promise<void> {
  try {
    const res = await fetch(apiUrl(`/api/orders/${id}`), { method: 'DELETE' });
    if (!res.ok && res.status !== 204) {
      const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(
        `Failed to delete order (${res.status}): ${errorData?.message || res.statusText}`
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error or server unreachable';
    console.error('[orderApi:deleteOrderApi] Error details:', { message, apiUrl: API_BASE, id });
    throw new Error(`Unable to delete order: ${message}`);
  }
}

// Analytics APIs

export interface ChartData {
  name: string;
  value: number;
  totalRevenue?: number;
}

export interface TimeSeriesData {
  date: string;
  count: number;
  revenue: number;
}

export interface SummaryStats {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  maxOrderValue: number;
  minOrderValue: number;
}

export async function fetchChartAnalytics(field: string): Promise<ChartData[]> {
  const res = await fetch(apiUrl(`/api/analytics/chart/${field}`));
  if (!res.ok) throw new Error(`Unable to fetch analytics for ${field}`);
  return res.json();
}

export async function fetchTimeSeriesData(): Promise<TimeSeriesData[]> {
  const res = await fetch(apiUrl('/api/analytics/timeseries'));
  if (!res.ok) throw new Error('Unable to fetch time series data');
  return res.json();
}

export async function fetchSummaryStats(): Promise<SummaryStats> {
  const res = await fetch(apiUrl('/api/analytics/summary'));
  if (!res.ok) throw new Error('Unable to fetch summary stats');
  return res.json();
}

export async function fetchStatusAnalytics(): Promise<ChartData[]> {
  const res = await fetch(apiUrl('/api/analytics/status'));
  if (!res.ok) throw new Error('Unable to fetch status analytics');
  return res.json();
}
