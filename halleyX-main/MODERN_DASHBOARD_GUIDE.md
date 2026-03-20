# Modern Custom Dashboard Builder 🎨📊

This is a complete redesign of the React frontend into a professional, modern Custom Dashboard Builder with drag-and-drop functionality, resizable widgets, and dark/light mode support.

## ✨ Features Implemented

### 🎯 Core Features
- ✅ **Drag & Drop Widgets** - Move widgets around freely with smooth animations
- ✅ **Resizable Widgets** - Adjust widget dimensions to fit your needs
- ✅ **Dark/Light Mode** - Toggle between themes with persistent storage
- ✅ **Responsive Design** - Works seamlessly on mobile, tablet, and desktop
- ✅ **Widget Library** - Pre-built widgets for common use cases

### 🧩 Available Widgets

1. **KPI Card**
   - Display key metrics (Total Orders, Revenue, Averages)
   - Support for Sum, Average, and Count aggregations
   - Currency, Number, or Percentage formatting
   - Trend indicators (up/down/flat)

2. **Bar Chart**
   - Compare data across categories
   - Customizable colors and data labels
   - Dynamic data from API

3. **Line Chart**
   - Visualize trends and patterns
   - Smooth animations
   - Interactive tooltips

4. **Area Chart**
   - Show cumulative trends
   - Gradient fills for visual appeal
   - Perfect for revenue/sales data

5. **Pie Chart**
   - Proportional data visualization
   - Legend support
   - Color-coded segments

6. **Data Table**
   - Display detailed order information
   - Sortable columns
   - Responsive layout
   - Status badges

### 🎨 UI/UX Enhancements

- **Modern Layout** - Clean sidebar + top navbar design
- **Smooth Animations** - Framer-motion powered transitions
- **Loading States** - Skeleton loaders for better UX
- **Empty States** - Helpful guidance when dashboard is empty
- **Error Handling** - Graceful error recovery
- **Icons** - Lucide React for consistent branding

### 🔧 Technical Stack

- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **React Grid Layout** for drag-and-drop + resizing
- **Recharts** for data visualization
- **Zustand** for state management
- **Framer Motion** for animations
- **Lucide React** for icons

## 📁 Project Structure

```
src/
├── components/
│   ├── dashboard/
│   │   ├── ModernDashboard.tsx      # Main dashboard component
│   │   ├── WidgetSelector.tsx       # Widget selection modal
│   │   ├── TopBar.tsx              # Navigation bar (optional)
│   │   └── index.ts                # Exports
│   ├── widgets/
│   │   ├── KPICard.tsx             # KPI metric card
│   │   ├── ChartWidgets.tsx        # BarChart component
│   │   ├── AdvancedCharts.tsx      # Line, Area, Pie charts
│   │   ├── DataTable.tsx           # Data table widget
│   │   ├── WidgetWrapper.tsx       # Widget container with controls
│   │   └── index.ts                # Widget exports
│   ├── ErrorBoundary.tsx           # Error handling
│   └── ui/                         # Reusable UI components
├── context/
│   └── ThemeContext.tsx            # Dark/light mode provider
├── utils/
│   └── dataTransform.ts            # Data aggregation & formatting
├── store.ts                        # Zustand store
├── types.ts                        # Type definitions
├── App.tsx                         # Main app component
└── main.tsx                        # Entry point
```

## 🚀 Getting Started

### 1. Install Dependencies

All required dependencies are already in `package.json`. Just install:

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`

### 3. Start Backend (if not running)

```bash
cd backend
npm start
```

Backend should run on `http://localhost:4000`

## 📊 Using the Dashboard

### Adding Widgets

1. Click the **"+ Add Widget"** button in the top-right
2. Select a widget type from the modal
3. Widget appears on dashboard with default settings
4. Data automatically loads from your API

### Customizing Widgets

Each widget type has different configuration options:

```typescript
// KPI Card
{
  type: 'KPI',
  config: {
    metric: 'totalAmount',        // Which field to calculate
    aggregation: 'Sum',           // Sum, Average, or Count
    format: 'Currency',           // Number, Currency, Percentage
    precision: 2                  // Decimal places
  }
}

// Bar/Line/Area Chart
{
  type: 'Bar',
  config: {
    xAxis: 'product',             // Field for X-axis
    yAxis: 'totalAmount',         // Field for Y-axis
    color: '#3b82f6',             // Hex color code
    showDataLabel: true           // Show values on bars
  }
}

// Pie Chart
{
  type: 'Pie',
  config: {
    dataField: 'status',          // Field to group by
    showLegend: true              // Show legend
  }
}

// Table
{
  type: 'Table',
  config: {
    columns: ['id', 'product', 'totalAmount', 'status'],
    sorting: true,
    pagination: 10,
    filtering: true,
    fontSize: 12,
    headerBgColor: '#4f46e5'
  }
}
```

### Reordering Widgets

Click and drag the **grip handle** (≡) in the widget header to reorder. The layout auto-saves to localStorage.

### Removing Widgets

Click the **trash icon** in the widget header to delete it from the dashboard.

## 🎨 Dark Mode

- **Toggle** using the sun/moon icon in the top-right
- **Persistent** - Your theme preference is saved
- **System Preference** - Automatically detects OS theme on first load
- **All Components** - Fully styled for both light and dark modes

## 📱 Responsive Behavior

The dashboard adapts to different screen sizes:

- **Desktop (1200px+)** - 12 column grid
- **Tablet (768px-1199px)** - 10 column grid
- **Mobile (480px-767px)** - 6 column grid
- **Small Mobile (<480px)** - 4 column grid

Widgets reflow and stack automatically as needed.

## 🔄 Data Integration

All widgets pull data from the same API source:

```typescript
// API Endpoint
GET /api/orders

// Returns array of Order objects
[
  {
    id: "123",
    customerName: "John Doe",
    product: "Fiber Internet 300 Mbps",
    quantity: 1,
    unitPrice: 99.99,
    totalAmount: 99.99,
    status: "Completed",
    orderDate: "2024-03-19T10:30:00Z",
    // ... more fields
  },
  // ... more orders
]
```

Widgets automatically aggregate and visualize this data.

## 🛠️ Customization

### Adding a New Widget Type

1. Create a new component in `src/components/widgets/`
2. Export it from `src/components/widgets/index.ts`
3. Add the widget type to `WidgetType` in `src/types.ts`
4. Add a case in `ModernDashboard.tsx` to render it
5. Add an option to `WIDGET_OPTIONS` in `WidgetSelector.tsx`

### Styling

All components use Tailwind CSS. To customize:

1. **Colors** - Modify `tailwind.config.ts`
2. **Spacing** - Adjust padding/margin classes
3. **Animations** - Edit duration/easing in components
4. **Fonts** - Change in `tailwind.config.ts` theme

### Theme Colors

```css
/* Light Mode */
Background: #ffffff
Border: #e2e8f0 (slate-200)
Text: #1e293b (slate-900)
Accent: #3b82f6 (blue-500)

/* Dark Mode */
Background: #0f172a (slate-950)
Border: #334155 (slate-700)
Text: #f1f5f9 (slate-100)
Accent: #3b82f6 (blue-500)
```

## 📈 Data Transformation Functions

In `src/utils/dataTransform.ts`:

```typescript
// Aggregate orders by field
aggregateOrdersBy(orders, 'product', 'Count')
// Returns: [{ name: 'Fiber Internet 300 Mbps', value: 5 }, ...]

// Calculate single KPI
calculateKPI(orders, 'totalAmount', 'Sum')
// Returns: 49999.99

// Format numbers
formatNumber(1234.56, 'Currency', 2)
// Returns: "$1,234.56"

// Get status colors
getStatusColor('Completed')           // "#10b981"
getStatusBgColor('Pending')           // "bg-yellow-100 text-yellow-800"

// Time series data
getTimeSeriesData(orders)             // Daily order counts
getRevenueTimeSeriesData(orders)      // Daily revenue
```

## 🎯 Performance Tips

1. **Memoization** - Components use React.memo where appropriate
2. **Lazy Loading** - Widgets load data on mount
3. **Virtualization** - DataTable uses efficient rendering
4. **Caching** - Zustand persists state in localStorage
5. **Code Splitting** - Components are modular

## 🐛 Troubleshooting

### Widgets Not Showing Data

1. ✅ Check backend is running on port 4000
2. ✅ Verify `VITE_API_URL=http://localhost:4000` in `.env`
3. ✅ Check browser console for API errors
4. ✅ Verify database has order data

### Dark Mode Not Working

1. ✅ Ensure ThemeProvider wraps App component
2. ✅ Check localStorage for 'theme' key
3. ✅ Verify tailwind.config has `darkMode: 'class'`

### Layout Not Saving

1. ✅ Check browser localStorage is enabled
2. ✅ Verify Zustand persist middleware is active
3. ✅ Check browser console for errors

### Drag-Drop Not Working

1. ✅ Ensure React Grid Layout CSS is imported
2. ✅ Check `isEditMode` is true
3. ✅ Verify element has data-grid attribute

## 📚 API Reference

### Store (Zustand)

```typescript
const { 
  widgets,              // Array of widgets
  orders,              // Array of orders
  layouts,             // Layout configurations
  addWidget,           // Add new widget
  deleteWidget,        // Remove widget
  updateLayouts,       // Update grid layout
  loadOrders,          // Fetch orders from API
} = useStore();
```

### Theme Context

```typescript
const { theme, toggleTheme } = useTheme();
// theme: 'light' | 'dark'
```

## 🎬 Animation System

Powered by Framer Motion:

- **Widget Entrance** - Fade + Scale in
- **Widget Exit** - Fade + Scale out
- **Modal Animations** - Smooth pop-in/out
- **Theme Transition** - Smooth color transitions
- **Hover Effects** - Subtle lift effects

All animations are optimized for 60fps.

## 💾 Persistence

### Automatic Persistence

- ✅ Dashboard layout saved to localStorage
- ✅ Widget configurations persisted
- ✅ Theme preference stored
- ✅ Order data cached in Zustand

### Manual Export/Import

```typescript
// Export dashboard config
const config = useStore.getState();
localStorage.setItem('dashboard', JSON.stringify(config));

// Import dashboard config
const saved = JSON.parse(localStorage.getItem('dashboard'));
useStore.setState(saved);
```

## 🔐 Security Considerations

- ✅ No sensitive data in localStorage
- ✅ API calls use fetch (no exposed tokens here)
- ✅ All user inputs sanitized
- ✅ Error messages don't expose internals

## 📝 Future Enhancements

Potential improvements:

- [ ] Real-time data updates (WebSocket)
- [ ] Custom color schemes
- [ ] Export dashboard as PDF/Image
- [ ] Shareable dashboard links
- [ ] Time range filters
- [ ] Widget data caching
- [ ] More chart types (Heatmap, Sankey, etc.)
- [ ] Dashboard templates
- [ ] Collaborative editing
- [ ] Mobile app version

## 🤝 Contributing

To add features:

1. Create a branch for your feature
2. Add components in appropriate folders
3. Export from index files
4. Update types.ts if needed
5. Test with both themes
6. Verify responsive design

## 📞 Support

For issues or questions:

1. Check the troubleshooting section
2. Review browser console for errors
3. Check backend logs
4. Verify API connectivity

## 📄 License

This project is part of halleyX dashboard system.

---

**Happy Dashboard Building! 🚀**
