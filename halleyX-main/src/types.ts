export type OrderStatus = 'Pending' | 'In progress' | 'Completed';
export type CreatedBy = 'Mr. Michael Harris' | 'Mr. Ryan Cooper' | 'Ms. Olivia Carter' | 'Mr. Lucas Martin';
export type Product = 'Fiber Internet 300 Mbps' | '5GUnlimited Mobile Plan' | 'Fiber Internet 1 Gbps' | 'Business Internet 500 Mbps' | 'VoIP Corporate Package';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: OrderStatus;
  createdBy: CreatedBy;
  orderDate: string; // ISO string
}

export type WidgetType = 'KPI' | 'Bar' | 'Line' | 'Pie' | 'Area' | 'Scatter' | 'Table';

export interface BaseWidget {
  id: string;
  title: string;
  type: WidgetType;
  description: string;
}

export interface KPIWidget extends BaseWidget {
  type: 'KPI';
  config: {
    metric: keyof Order;
    aggregation: 'Sum' | 'Average' | 'Count';
    format: 'Number' | 'Currency';
    precision: number;
  };
}

export interface ChartWidget extends BaseWidget {
  type: 'Bar' | 'Line' | 'Area' | 'Scatter';
  config: {
    xAxis: keyof Order | 'Duration';
    yAxis: keyof Order | 'Duration';
    color: string;
    showDataLabel: boolean;
  };
}

export interface PieWidget extends BaseWidget {
  type: 'Pie';
  config: {
    dataField: keyof Order;
    showLegend: boolean;
  };
}

export interface TableWidget extends BaseWidget {
  type: 'Table';
  config: {
    columns: (keyof Order)[];
    sorting: boolean;
    pagination: 5 | 10 | 15;
    filtering: boolean;
    fontSize: number;
    headerBgColor: string;
  };
}

export type AnyWidget = KPIWidget | ChartWidget | PieWidget | TableWidget;

export interface DashboardLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}
