import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order, AnyWidget, DashboardLayout } from './types';
import { v4 as uuidv4 } from 'uuid';
import { fetchOrders, createOrder as apiCreateOrder, updateOrder as apiUpdateOrder, deleteOrderApi } from './api/orderApi';

export type DateFilter = 'All time' | 'Today' | 'Last 7 Days' | 'Last 30 Days' | 'Last 90 Days';

interface AppState {
  orders: Order[];
  widgets: AnyWidget[];
  layouts: {
    lg: DashboardLayout[];
    md: DashboardLayout[];
    sm: DashboardLayout[];
  };
  dateFilter: DateFilter;
  isConfiguring: boolean;
  
  // Actions
  loadOrders: () => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'orderDate' | 'totalAmount' | 'customerId' | 'customerName'>) => Promise<void>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  
  addWidget: (widget: AnyWidget, layout: DashboardLayout) => void;
  updateWidget: (id: string, widget: Partial<AnyWidget>) => void;
  deleteWidget: (id: string) => void;
  
  updateLayouts: (
    currentLayout: readonly DashboardLayout[],
    allLayouts: {
      lg?: readonly DashboardLayout[];
      md?: readonly DashboardLayout[];
      sm?: readonly DashboardLayout[];
    }
  ) => void;
  
  setDateFilter: (filter: DateFilter) => void;
  setIsConfiguring: (isConfiguring: boolean) => void;
}

// Default widgets for initial dashboard setup
const DEFAULT_WIDGETS: AnyWidget[] = [
  {
    id: 'kpi-total-orders',
    type: 'KPI',
    title: 'Total Orders',
    description: 'Total number of orders',
    config: { metric: 'id', aggregation: 'Count', format: 'Number', precision: 0 },
  },
  {
    id: 'kpi-total-revenue',
    type: 'KPI',
    title: 'Total Revenue',
    description: 'Sum of all order values',
    config: { metric: 'totalAmount', aggregation: 'Sum', format: 'Currency', precision: 2 },
  },
  {
    id: 'kpi-avg-order',
    type: 'KPI',
    title: 'Average Order Value',
    description: 'Average order amount',
    config: { metric: 'totalAmount', aggregation: 'Average', format: 'Currency', precision: 2 },
  },
  {
    id: 'chart-by-product',
    type: 'Bar',
    title: 'Orders by Product',
    description: 'Number of orders per product',
    config: { xAxis: 'product', yAxis: 'id', color: '#4f46e5', showDataLabel: false },
  },
  {
    id: 'chart-by-status',
    type: 'Pie',
    title: 'Orders by Status',
    description: 'Distribution of order statuses',
    config: { dataField: 'status', showLegend: true },
  },
];

const DEFAULT_LAYOUTS = {
  lg: [
    { i: 'kpi-total-orders', x: 0, y: 0, w: 2, h: 2 },
    { i: 'kpi-total-revenue', x: 2, y: 0, w: 2, h: 2 },
    { i: 'kpi-avg-order', x: 4, y: 0, w: 2, h: 2 },
    { i: 'chart-by-product', x: 0, y: 2, w: 6, h: 4 },
    { i: 'chart-by-status', x: 6, y: 2, w: 6, h: 4 },
  ],
  md: [
    { i: 'kpi-total-orders', x: 0, y: 0, w: 2, h: 2 },
    { i: 'kpi-total-revenue', x: 2, y: 0, w: 2, h: 2 },
    { i: 'kpi-avg-order', x: 4, y: 0, w: 2, h: 2 },
    { i: 'chart-by-product', x: 0, y: 2, w: 4, h: 4 },
    { i: 'chart-by-status', x: 4, y: 2, w: 4, h: 4 },
  ],
  sm: [
    { i: 'kpi-total-orders', x: 0, y: 0, w: 2, h: 2 },
    { i: 'kpi-total-revenue', x: 2, y: 0, w: 2, h: 2 },
    { i: 'kpi-avg-order', x: 0, y: 2, w: 2, h: 2 },
    { i: 'chart-by-product', x: 0, y: 4, w: 4, h: 4 },
    { i: 'chart-by-status', x: 0, y: 8, w: 4, h: 4 },
  ],
};


export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      orders: [],
      widgets: DEFAULT_WIDGETS,
      layouts: DEFAULT_LAYOUTS,
      dateFilter: 'All time',
      isConfiguring: false,

      loadOrders: async () => {
        try {
          console.log('[Store:loadOrders] 🔄 Fetching orders from API...');
          const orderList = await fetchOrders();
          console.log('[Store:loadOrders] ✅ Successfully loaded', orderList.length, 'orders');
          if (orderList.length > 0) {
            console.log('[Store:loadOrders] 📦 Sample order:', {
              id: orderList[0].id,
              product: orderList[0].product,
              quantity: orderList[0].quantity,
              unitPrice: orderList[0].unitPrice,
              totalAmount: orderList[0].totalAmount,
              status: orderList[0].status,
            });
          }
          set({ orders: orderList });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          console.error('[Store:loadOrders] ❌ Failed to load orders:', errorMessage);
          console.warn('[Store:loadOrders] 💾 Using local cache or empty state (fallback mode)');
        }
      },

      addOrder: async (orderData) => {
        const newOrder: Order = {
          ...orderData,
          id: uuidv4(),
          customerId: `CUST-${Math.floor(Math.random() * 100000)}`,
          customerName: `${orderData.firstName} ${orderData.lastName}`,
          orderDate: new Date().toISOString(),
          totalAmount: orderData.quantity * orderData.unitPrice,
        };

        try {
          console.log('[Store:addOrder] 📝 Creating order via API...');
          const created = await apiCreateOrder(newOrder);
          console.log('[Store:addOrder] ✅ Order created:', created.id);
          set((state) => ({ orders: [...state.orders, created] }));
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          console.error('[Store:addOrder] ❌ Backend failed:', errorMessage);
          console.warn('[Store:addOrder] 💾 Using local-only fallback mode');
          set((state) => ({ orders: [...state.orders, newOrder] }));
        }
      },

      updateOrder: async (id, orderData) => {
        const state = get();
        const existing = state.orders.find((o) => o.id === id);
        if (!existing) return;

        const merged: Order = {
          ...existing,
          ...orderData,
          customerName: `${orderData.firstName ?? existing.firstName} ${orderData.lastName ?? existing.lastName}`,
          totalAmount:
            (orderData.quantity ?? existing.quantity) *
            (orderData.unitPrice ?? existing.unitPrice),
        };

        try {
          console.log('[Store:updateOrder] ✏️  Updating order via API...', id);
          const updated = await apiUpdateOrder(id, merged);
          console.log('[Store:updateOrder] ✅ Order updated:', id);
          set((s) => ({ orders: s.orders.map((o) => (o.id === id ? updated : o)) }));
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          console.error('[Store:updateOrder] ❌ Backend failed:', errorMessage);
          console.warn('[Store:updateOrder] 💾 Applying changes locally only');
          set((s) => ({ orders: s.orders.map((o) => (o.id === id ? merged : o)) }));
        }
      },

      deleteOrder: async (id) => {
        try {
          await deleteOrderApi(id);
          set((state) => ({ orders: state.orders.filter((o) => o.id !== id) }));
        } catch (err) {
          console.error('Failed delete order backend, removing locally', err);
          set((state) => ({ orders: state.orders.filter((o) => o.id !== id) }));
        }
      },

      addWidget: (widget, layout) =>
        set((state) => ({
          widgets: [...state.widgets, widget],
          layouts: {
            lg: [...state.layouts.lg, layout],
            md: [...state.layouts.md, { ...layout, w: Math.min(layout.w, 8) }],
            sm: [...state.layouts.sm, { ...layout, w: Math.min(layout.w, 4) }],
          },
        })),

      updateWidget: (id, widgetData) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, ...widgetData } as AnyWidget : w
          ),
        })),

      deleteWidget: (id) =>
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== id),
          layouts: {
            lg: state.layouts.lg.filter((l) => l.i !== id),
            md: state.layouts.md.filter((l) => l.i !== id),
            sm: state.layouts.sm.filter((l) => l.i !== id),
          },
        })),

      updateLayouts: (currentLayout, allLayouts) =>
        set((state) => ({
          layouts: {
            lg: mergeLayouts(state.layouts.lg, allLayouts.lg),
            md: mergeLayouts(state.layouts.md, allLayouts.md),
            sm: mergeLayouts(state.layouts.sm, allLayouts.sm),
          },
        })),

      setDateFilter: (filter) => set({ dateFilter: filter }),
      setIsConfiguring: (isConfiguring) => set({ isConfiguring }),
    }),
    {
      name: 'dashboard-storage',
    }
  )
);

function mergeLayouts(
  existingLayouts: readonly DashboardLayout[],
  incomingLayouts?: readonly DashboardLayout[]
): DashboardLayout[] {
  if (!incomingLayouts) {
    return [...existingLayouts];
  }

  const sanitizedIncoming = incomingLayouts.filter((layout) => layout.i !== '__dropping__');
  const incomingIds = new Set(sanitizedIncoming.map((layout) => layout.i));
  const preservedLayouts = existingLayouts.filter((layout) => !incomingIds.has(layout.i));

  return [...sanitizedIncoming, ...preservedLayouts];
}
