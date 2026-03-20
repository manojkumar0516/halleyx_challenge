import React, { useEffect } from 'react';
import { useStore } from './store';
import { ModernDashboard } from './components/dashboard/ModernDashboard';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';

let hasInitializedAppData = false;

export default function App() {
  const { loadOrders } = useStore();
  const [dragMode, setDragMode] = React.useState(true);

  useEffect(() => {
    if (hasInitializedAppData) {
      return;
    }

    hasInitializedAppData = true;
    console.log('[App:useEffect] 🚀 Component mounted - Starting data load');
    const loadData = async () => {
      await loadOrders();
      const state = useStore.getState();
      console.log('[App:useEffect] ✅ Data loaded:', {
        ordersCount: state.orders.length,
        widgetsCount: state.widgets.length,
      });
    };
    void loadData();
  }, [loadOrders]);

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <ModernDashboard isDragEnabled={dragMode} onDragModeChange={setDragMode} />
      </ErrorBoundary>
    </ThemeProvider>
  );
}
