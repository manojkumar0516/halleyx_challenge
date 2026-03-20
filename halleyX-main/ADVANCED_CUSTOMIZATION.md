## Advanced Dashboard Customization Guide 🔧

For developers who want to extend and customize the dashboard builder.

### Extending the Store (Zustand)

Add custom state to `src/store.ts`:

```typescript
export interface AppState {
  // ... existing fields
  
  // Add custom state
  userPreferences: {
    fontSize: 'small' | 'medium' | 'large';
    chartAnimations: boolean;
    autoRefreshInterval: number; // in seconds
  };
  
  // Add custom actions
  setUserPreferences: (prefs: Partial<AppState['userPreferences']>) => void;
}

// In the store creation:
export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ... existing
      
      userPreferences: {
        fontSize: 'medium',
        chartAnimations: true,
        autoRefreshInterval: 300,
      },
      
      setUserPreferences: (prefs) => {
        set(state => ({
          userPreferences: { ...state.userPreferences, ...prefs }
        }));
      },
    }),
    // ... rest of config
  )
);
```

### Creating Custom Widgets

**Step 1: Define Widget Type**

In `src/types.ts`:

```typescript
export interface CustomWidget extends BaseWidget {
  type: 'Custom';
  config: {
    title: string;
    dataSource: 'orders' | 'analytics';
    refreshInterval: number;
    customOption: string;
  };
}

// Add to union type
export type AnyWidget = KPIWidget | ... | CustomWidget;
```

**Step 2: Create Widget Component**

File: `src/components/widgets/CustomWidget.tsx`

```typescript
import React from 'react';
import { Order } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface CustomWidgetProps {
  config: {
    title: string;
    dataSource: 'orders' | 'analytics';
    refreshInterval: number;
    customOption: string;
  };
  orders: Order[];
  isLoading?: boolean;
}

export function CustomWidget({
  config,
  orders,
  isLoading = false,
}: CustomWidgetProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`p-6 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
      {isLoading ? (
        <div className={`h-24 w-full rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'} animate-pulse`} />
      ) : (
        <div>
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {config.title}
          </h3>
          {/* Your custom visualization here */}
          <p className={`mt-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {orders.length} orders · {config.customOption}
          </p>
        </div>
      )}
    </div>
  );
}
```

**Step 3: Add to ModernDashboard.tsx**

In the renderWidgetContent function:

```typescript
case 'Custom': {
  const config = (widget as any).config;
  return (
    <CustomWidget
      config={config}
      orders={orders}
      isLoading={isLoading}
    />
  );
}
```

**Step 4: Add to WidgetSelector.tsx**

```typescript
const WIDGET_OPTIONS: WidgetOption[] = [
  // ... existing options
  {
    type: 'Custom',
    label: 'Custom Widget',
    description: 'Your custom visualization',
    icon: <Zap className="w-6 h-6" />,
    color: 'from-indigo-500 to-indigo-600',
  },
];
```

### Auto-Refresh Configuration

Add auto-refresh to ModernDashboard.tsx:

```typescript
export function ModernDashboard({ isEditMode = false }: ModernDashboardProps) {
  // ... existing code
  
  const { userPreferences, loadOrders } = useStore();
  
  // Add auto-refresh effect
  useEffect(() => {
    if (!userPreferences.chartAnimations) return;
    
    const interval = setInterval(() => {
      loadOrders();
    }, userPreferences.autoRefreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [userPreferences.autoRefreshInterval, loadOrders]);
  
  // ... rest of component
}
```

### Multiple Dashboard Layouts

Store different layouts:

```typescript
interface LayoutConfig {
  name: string;
  layout: DashboardLayout[];
  widgets: AnyWidget[];
  createdAt: number;
}

// In store
export interface AppState {
  layouts: LayoutConfig[];
  currentLayoutId: string;
  
  saveLayout: (name: string) => void;
  loadLayout: (id: string) => void;
  deleteLayout: (id: string) => void;
}
```

### API Caching Strategy

Extend dataTransform.ts:

```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // time to live in ms
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttl: number = 5000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear() {
    this.cache.clear();
  }
}

export const dataCache = new DataCache();
```

Usage in widgets:

```typescript
export function KPICard({ orders, ...props }: KPICardProps) {
  const cachedValue = dataCache.get(`kpi-${props.title}`);
  
  if (cachedValue) {
    return cachedValue;
  }
  
  const value = calculateKPI(orders, props.metric, props.aggregation);
  // Cache for 1 minute
  dataCache.set(`kpi-${props.title}`, value, 60000);
  
  // ... render
}
```

### Real-time Updates with WebSocket

Create `src/hooks/useRealtimeOrders.ts`:

```typescript
import { useEffect, useCallback } from 'react';
import { useStore } from '../store';

export function useRealtimeOrders(serverUrl: string = 'ws://localhost:4001') {
  const { loadOrders } = useStore();

  useEffect(() => {
    const ws = new WebSocket(serverUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const { type } = JSON.parse(event.data);
      
      if (type === 'order-updated' || type === 'order-created') {
        // Reload orders when changes detected
        loadOrders();
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => ws.close();
  }, [loadOrders, serverUrl]);
}
```

Use in ModernDashboard:

```typescript
export function ModernDashboard() {
  // Enable real-time updates
  useRealtimeOrders('ws://localhost:4001');
  
  // ... rest of component
}
```

### Custom Color Schemes

Create `src/theme/colorSchemes.ts`:

```typescript
export const colorSchemes = {
  default: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  coral: {
    primary: '#ff6b6b',
    secondary: '#ff8787',
    success: '#51cf66',
    warning: '#ffd43b',
    error: '#ff6b6b',
  },
  ocean: {
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    success: '#14b8a6',
    warning: '#0369a1',
    error: '#0c4a6e',
  },
};

export type ColorScheme = keyof typeof colorSchemes;
```

Store color scheme:

```typescript
export interface AppState {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
}
```

### Role-Based Widget Access

```typescript
type UserRole = 'admin' | 'manager' | 'user';

const widgetAccess: Record<UserRole, WidgetType[]> = {
  admin: ['KPI', 'Bar', 'Line', 'Area', 'Pie', 'Table'],
  manager: ['KPI', 'Bar', 'Pie', 'Table'],
  user: ['KPI', 'Table'],
};

export function ModernDashboard({ userRole = 'user' }: { userRole: UserRole }) {
  const availableWidgets = WIDGET_OPTIONS.filter(opt => 
    widgetAccess[userRole].includes(opt.type)
  );
  
  // ... use availableWidgets instead of WIDGET_OPTIONS
}
```

### Export/Import Dashboard Config

```typescript
export function exportDashboard() {
  const state = useStore.getState();
  const config = {
    widgets: state.widgets,
    layouts: state.layouts,
    dateFilter: state.dateFilter,
    timestamp: new Date().toISOString(),
  };
  
  const json = JSON.stringify(config, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `dashboard-${Date.now()}.json`;
  a.click();
}

export function importDashboard(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        useStore.setState({
          widgets: config.widgets,
          layouts: config.layouts,
          dateFilter: config.dateFilter,
        });
        resolve(config);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
```

### Performance Monitoring

Create `src/utils/performance.ts`:

```typescript
export class PerformanceMonitor {
  private metrics: Record<string, number[]> = {};

  measure(label: string, fn: () => void) {
    const start = performance.now();
    fn();
    const end = performance.now();
    
    if (!this.metrics[label]) this.metrics[label] = [];
    this.metrics[label].push(end - start);
  }

  getStats(label: string) {
    const times = this.metrics[label] || [];
    return {
      count: times.length,
      avg: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
    };
  }

  report() {
    console.table(
      Object.entries(this.metrics).map(([label, times]) => ({
        label,
        ...this.getStats(label),
      }))
    );
  }
}

export const perfMonitor = new PerformanceMonitor();
```

### Advanced Filtering

```typescript
export interface FilterConfig {
  status?: OrderStatus[];
  product?: Product[];
  dateRange?: { start: Date; end: Date };
  minAmount?: number;
  maxAmount?: number;
}

export function useAdvancedFilter(orders: Order[], filters: FilterConfig) {
  return orders.filter((order) => {
    if (filters.status && !filters.status.includes(order.status)) return false;
    if (filters.product && !filters.product.includes(order.product)) return false;
    
    if (filters.dateRange) {
      const orderDate = new Date(order.orderDate);
      if (orderDate < filters.dateRange.start || orderDate > filters.dateRange.end) {
        return false;
      }
    }
    
    if (filters.minAmount && order.totalAmount < filters.minAmount) return false;
    if (filters.maxAmount && order.totalAmount > filters.maxAmount) return false;
    
    return true;
  });
}
```

### Testing Widgets

Example test using Vitest:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KPICard } from './KPICard';
import { ThemeProvider } from '../../context/ThemeContext';

describe('KPICard', () => {
  const mockOrders = [
    { totalAmount: 100, ... },
    { totalAmount: 200, ... },
  ];

  it('renders KPI card with correct value', () => {
    render(
      <ThemeProvider>
        <KPICard
          title="Test KPI"
          metric="totalAmount"
          aggregation="Sum"
          format="Currency"
          precision={2}
          orders={mockOrders}
        />
      </ThemeProvider>
    );
    
    expect(screen.getByText('Test KPI')).toBeInTheDocument();
    expect(screen.getByText('$300.00')).toBeInTheDocument();
  });
});
```

---

## Where to Go From Here

1. **Add more visualization types** - Heatmaps, Gantt charts, Network diagrams
2. **Implement real-time updates** - WebSocket integration with backend
3. **Build mobile app** - React Native version
4. **Add collaboration** - Real-time collaborative editing
5. **Create templates** - Pre-built dashboard templates
6. **Extend API** - More endpoints for filtered data

Happy customizing! 🚀
