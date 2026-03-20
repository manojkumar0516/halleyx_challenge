# HalleyX Dashboard - Complete Implementation Guide

## 🎯 Overview

This guide explains the complete drag-and-drop widget dashboard system including how widgets work, how to add new ones, and how to customize them.

---

## 📐 System Architecture

### Components Hierarchy

```
App.tsx
└── ModernDashboard
    ├── ReactGridLayout (ResponsiveGridLayout)
    │   └── WidgetWrapper (for each widget)
    │       └── Rendered Widget Content
    │           ├── KPICard
    │           ├── BarChart
    │           ├── LineChart
    │           ├── AreaChart
    │           ├── PieChart
    │           ├── DataTable
    │           └── OrderTable
    ├── WidgetSelector (add new widgets)
    ├── WidgetConfigModal (edit widgets)
    └── OrderTablePanel (view all orders)
```

### Data Flow

```
Store (Zustand)
├── widgets: AnyWidget[]
├── layouts: { lg: [], md: [], sm: [] }
├── orders: Order[]
└── dateFilter: DateFilter

ModernDashboard
├── Reads: widgets, layouts, orders, dateFilter
├── Modifies: addWidget, updateWidget, deleteWidget, updateLayouts
└── Passes to:
    ├── ResponsiveGridLayout (layout positions/sizes)
    └── Widget Components (order data for rendering)
```

---

## 🎮 Drag & Drop System

### How It Works

1. **ResponsiveGridLayout** from `react-grid-layout` manages widget positions
2. **Drag Handle**: Header div with class `react-grid-draghandle` enables dragging
3. **Resize Handles**: Automatic corner handles for resizing
4. **Layout Persistence**: Saved to store and localStorage

### Key CSS Classes

```css
.react-grid-draghandle {
  /* Makes element draggable - add to widget header */
  cursor: grab;
}

.react-grid-item {
  /* Applied to each widget automatically */
  position: absolute;
  transition: all 200ms ease;
}

.react-grid-item > .resizing {
  /* Active resize state */
  opacity: 0.9;
  z-index: 3;
}
```

### Enabling/Disabling Drag Mode

```typescript
const [isDragEnabled, setIsDragEnabled] = useState(true);

<ResponsiveGridLayout
  isDraggable={isDragEnabled}
  isResizable={isDragEnabled}
  // ...
/>
```

User toggles with the **🎯 Drag** button in the top-right.

---

## 📦 Widget System

### Widget Types

#### 1. KPI Widget
```typescript
{
  type: 'KPI',
  config: {
    metric: 'totalAmount' | 'quantity' | 'id',
    aggregation: 'Sum' | 'Average' | 'Count',
    format: 'Number' | 'Currency',
    precision: number
  }
}
```

#### 2. Chart Widgets (Bar, Line, Area, Scatter)
```typescript
{
  type: 'Bar' | 'Line' | 'Area' | 'Scatter',
  config: {
    xAxis: keyof Order,
    yAxis: keyof Order,
    color: string,        // e.g., '#4f46e5'
    showDataLabel: boolean
  }
}
```

#### 3. Pie Widget
```typescript
{
  type: 'Pie',
  config: {
    dataField: keyof Order,  // Field to aggregate by
    showLegend: boolean
  }
}
```

#### 4. Table Widget
```typescript
{
  type: 'Table',
  config: {
    columns: (keyof Order)[],
    sorting: boolean,
    pagination: 5 | 10 | 15,
    filtering: boolean,
    fontSize: number,
    headerBgColor: string
  }
}
```

### Default Layout Configuration

```typescript
// Each widget has default position and size
{
  i: 'widget-id',      // Unique ID
  x: 0,                // Column position (0-12)
  y: 0,                // Row position
  w: 6,                // Width (1-12)
  h: 4                 // Height (in row units of 100px)
}
```

---

## 🔄 Multi-Breakpoint Responsive Design

### Breakpoint Configuration

```typescript
const ResponsiveGridLayout = (
  <ResponsiveGridLayout
    layouts={{
      lg: [...],      // Desktop: 12 columns, 1200px+
      md: [...],      // Tablet: 10 columns, 996px+
      sm: [...],      // Small: 6 columns, 768px+
      xs: [...],      // Mobile: 4 columns, 480px+
      xxs: [...]      // Extra small: 2 columns, <480px
    }}
    breakpoints={{
      lg: 1200,
      md: 996,
      sm: 768,
      xs: 480,
      xxs: 0
    }}
    cols={{
      lg: 12,
      md: 10,
      sm: 6,
      xs: 4,
      xxs: 2
    }}
  />
)
```

### How ResponsiveGridLayout Works

1. **On mount**: Detects window width
2. **Triggers change**: Selects appropriate layout for breakpoint
3. **On resize**: Updates layout when window crosses breakpoint threshold
4. **Returns**: `onLayoutChange(currentLayout, allLayouts)`
   - `currentLayout`: Current breakpoint layout
   - `allLayouts`: All breakpoint layouts

---

## 🛠️ Adding a New Widget

### Step 1: Create Widget Component
```typescript
// src/components/widgets/MyWidget.tsx
import React from 'react';

interface MyWidgetProps {
  data: any;
  isLoading?: boolean;
}

export function MyWidget({ data, isLoading }: MyWidgetProps) {
  if (isLoading) return <LoadingSpinner />;
  
  return <div>{/* Your widget content */}</div>;
}
```

### Step 2: Add to WidgetType Union
```typescript
// src/types.ts
export type WidgetType = 
  | 'KPI' 
  | 'Bar' 
  | 'Line' 
  | 'MyWidget'  // Add here
  | ...;
```

### Step 3: Create Widget Interface
```typescript
export interface MyWidgetConfig {
  //... your config properties
}

export interface MyWidgetType extends BaseWidget {
  type: 'MyWidget';
  config: MyWidgetConfig;
}
```

### Step 4: Add to Union Type
```typescript
export type AnyWidget = 
  | KPIWidget 
  | MyWidgetType
  | ...;
```

### Step 5: Add to Store Default Widgets
```typescript
// src/store.ts
const DEFAULT_WIDGETS: AnyWidget[] = [
  {
    id: 'my-widget-1',
    type: 'MyWidget',
    title: 'My Widget',
    description: 'My custom widget',
    config: { /* ... */ }
  },
  ...
];
```

### Step 6: Add to ModernDashboard Render
```typescript
// src/components/dashboard/ModernDashboard.tsx
const renderWidgetContent = (widget: AnyWidget) => {
  switch (widget.type) {
    case 'MyWidget':
      return <MyWidget data={widget.config} isLoading={isLoading} />;
    // ...
  }
};
```

### Step 7: Add to WidgetSelector
```typescript
// src/components/dashboard/WidgetSelector.tsx
const WIDGET_TYPES: WidgetOption[] = [
  {
    type: 'MyWidget',
    label: 'My Widget',
    icon: MyIcon,
    description: 'My custom widget'
  },
  ...
];
```

---

## 📊 Data Sources

### Backend Analytics APIs

All chart data comes from optimized backend aggregations:

```
GET /api/analytics/chart/:field
  // Returns: [{ name: 'value', value: count }, ...]
  // Example: /api/analytics/chart/product

GET /api/analytics/status
  // Returns status breakdown
  
GET /api/analytics/timeseries
  // Returns time-based data

GET /api/analytics/summary
  // Returns: { totalOrders, totalRevenue, avgOrderValue, ... }
```

### Fallback to Local Aggregation

If backend unavailable, WidgetRenderer uses local aggregation:

```typescript
// From store.orders (in memory)
const dataMap = new Map<string, number>();
filteredOrders.forEach(o => {
  const key = String(o[dataField]);
  dataMap.set(key, (dataMap.get(key) || 0) + 1);
});
const data = Array.from(dataMap.entries())
  .map(([name, value]) => ({ name, value }));
```

---

## 💾 State Management (Zustand)

### Store Structure
```typescript
interface AppState {
  // Data
  orders: Order[];
  widgets: AnyWidget[];
  layouts: { lg: [], md: [], sm: [] };
  dateFilter: DateFilter;
  
  // Actions
  loadOrders: () => Promise<void>;
  addWidget: (widget, layout) => void;
  updateWidget: (id, changes) => void;
  deleteWidget: (id) => void;
  updateLayouts: (current, all) => void;
  setDateFilter: (filter) => void;
}
```

### Persistence
- Stored in browser localStorage under key: `dashboard-storage`
- Survives page refresh
- Can be cleared: DevTools → Application → Clear Storage

---

## 🎨 Styling & Theming

### Dark Mode Support

```typescript
const { theme } = useTheme();  // 'light' | 'dark'
const isDark = theme === 'dark';

className={isDark ? 'dark-class' : 'light-class'}
```

All components use theme context and Tailwind dark mode.

### Grid Layout Styling

Grid layout CSS is imported automatically:
```typescript
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
```

Additional styles in `src/index.css`:
- Drag handle cursor effects
- Placeholder styling  
- Responsive adjustments

---

## 🐛 Debugging

### Enable Detailed Logging

All components have console.log statements. Open DevTools (F12) to see:

```
[WidgetRenderer] 🎨 Widget rendering
[WidgetRenderer] 📈 Chart rendering  
[Store:loadOrders] ✅ Successfully loaded
[Chart] Generated local data
```

### Check Layout State

```typescript
// In browser DevTools Console
zustand_state = useStore.getState()
zustand_state.widgets      // All widgets
zustand_state.layouts      // Current layouts
zustand_state.orders.length // How many orders loaded
```

### Verify API Connection

```
Open in browser:
http://localhost:4000/health
http://localhost:4000/api/health
http://localhost:4000/api/orders
http://localhost:4000/api/analytics/chart/product
```

---

## 📋 File Checklist

Key files involved in drag-and-drop system:

- ✅ `src/components/dashboard/ModernDashboard.tsx` - Main dashboard
- ✅ `src/components/widgets/WidgetWrapper.tsx` - Widget container with drag handle
- ✅ `src/components/dashboard/WidgetCard.tsx` - Widget header and controls
- ✅ `src/store.ts` - State management
- ✅ `src/types.ts` - TypeScript types
- ✅ `src/index.css` - Grid layout styles
- ✅ `tailwind.config.ts` - Tailwind configuration
- ✅ `backend/index.js` - API endpoints
- ✅ `.env` - API configuration

---

## 🚀 Performance Tips

1. **Memoization**: Widget content memoized to prevent unnecessary re-renders
2. **Lazy Loading**: Charts lazy-loaded with data fetching
3. **Local Aggregation**: Falls back when backend unavailable
4. **CSS Transform**: Uses GPU-accelerated transforms for dragging
5. **Virtual Scrolling**: Tables use pagination instead of virtual scroll

---

## 📚 Related Documentation

- `RUN_DASHBOARD.md` - Quick start guide
- `DRAG_DROP_IMPLEMENTATION.md` - Technical implementation
- `API_FIX_GUIDE.md` - Backend setup
- `DEBUGGING_GUIDE.md` - Troubleshooting tips

---

**Questions?** Check the inline code comments or grep for console.log statements to understand data flow.
