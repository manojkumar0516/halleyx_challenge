import { AnyWidget, DashboardLayout, WidgetType } from '../../types';

export interface WidgetLibraryItem {
  type: WidgetType;
  label: string;
  description: string;
  dataHint: string;
}

export const WIDGET_LIBRARY: WidgetLibraryItem[] = [
  {
    type: 'KPI',
    label: 'KPI Card',
    description: 'Highlight revenue, counts, or average values.',
    dataHint: 'Reads totals directly from your orders data.',
  },
  {
    type: 'Bar',
    label: 'Bar Chart',
    description: 'Compare grouped order counts side by side.',
    dataHint: 'Great for products, states, and assignees.',
  },
  {
    type: 'Line',
    label: 'Line Chart',
    description: 'Track how order volume changes across groups.',
    dataHint: 'Uses synced order data from the backend.',
  },
  {
    type: 'Area',
    label: 'Area Chart',
    description: 'Show revenue concentration across categories.',
    dataHint: 'Sums total order value from the database.',
  },
  {
    type: 'Pie',
    label: 'Pie Chart',
    description: 'Break down order distribution by a field.',
    dataHint: 'Perfect for status and product mix.',
  },
  {
    type: 'Scatter',
    label: 'Scatter Plot',
    description: 'Compare two numeric order dimensions.',
    dataHint: 'Plots quantity against total revenue.',
  },
  {
    type: 'Table',
    label: 'Data Table',
    description: 'Browse raw orders with the latest rows.',
    dataHint: 'Shows live order records from the backend.',
  },
];

export function getWidgetDropSize(type: WidgetType): Pick<DashboardLayout, 'w' | 'h'> {
  switch (type) {
    case 'KPI':
      return { w: 3, h: 2 };
    case 'Table':
      return { w: 12, h: 5 };
    default:
      return { w: 6, h: 4 };
  }
}

export function createDefaultWidget(type: WidgetType, id: string): AnyWidget {
  switch (type) {
    case 'KPI':
      return {
        id,
        title: 'Total Revenue',
        type: 'KPI',
        description: 'Sum of all order values from the database',
        config: {
          metric: 'totalAmount',
          aggregation: 'Sum',
          format: 'Currency',
          precision: 2,
        },
      } as AnyWidget;

    case 'Table':
      return {
        id,
        title: 'Recent Orders',
        type: 'Table',
        description: 'Latest records loaded from your orders table',
        config: {
          columns: ['customerName', 'product', 'status', 'totalAmount', 'orderDate'],
          sorting: true,
          pagination: 10,
          filtering: true,
          fontSize: 12,
          headerBgColor: '#e2e8f0',
        },
      } as AnyWidget;

    case 'Pie':
      return {
        id,
        title: 'Orders by Status',
        type: 'Pie',
        description: 'Distribution of order statuses',
        config: {
          dataField: 'status',
          showLegend: true,
        },
      } as AnyWidget;

    case 'Line':
      return {
        id,
        title: 'Orders by Owner',
        type: 'Line',
        description: 'Order volume grouped by creator',
        config: {
          xAxis: 'createdBy',
          yAxis: 'id',
          color: '#10b981',
          showDataLabel: false,
        },
      } as AnyWidget;

    case 'Area':
      return {
        id,
        title: 'Revenue by Status',
        type: 'Area',
        description: 'Revenue contribution for each order status',
        config: {
          xAxis: 'status',
          yAxis: 'totalAmount',
          color: '#06b6d4',
          showDataLabel: false,
        },
      } as AnyWidget;

    case 'Scatter':
      return {
        id,
        title: 'Quantity vs Revenue',
        type: 'Scatter',
        description: 'Compare order quantity with total amount',
        config: {
          xAxis: 'quantity',
          yAxis: 'totalAmount',
          color: '#8b5cf6',
          showDataLabel: false,
        },
      } as AnyWidget;

    case 'Bar':
    default:
      return {
        id,
        title: 'Orders by Product',
        type: 'Bar',
        description: 'Count of orders for each product',
        config: {
          xAxis: 'product',
          yAxis: 'id',
          color: '#3b82f6',
          showDataLabel: false,
        },
      } as AnyWidget;
  }
}
