import React, { useCallback, useMemo, useState } from 'react';
import { Responsive, WidthProvider, LayoutItem, ResponsiveLayouts } from 'react-grid-layout/legacy';
import { ClipboardList, Menu, Moon, Plus, Sun, X } from 'lucide-react';
import { useStore } from '../../store';
import { AnyWidget, DashboardLayout, Order, WidgetType } from '../../types';
import { WidgetWrapper } from '../widgets/WidgetWrapper';
import { WidgetPalette } from './WidgetPalette';
import { KPICard } from '../widgets/KPICard';
import { BarChart } from '../widgets/ChartWidgets';
import { AreaChart, LineChart, PieChart, ScatterPlot } from '../widgets/AdvancedCharts';
import { DataTable } from '../widgets/DataTable';
import { OrderTable } from '../orders/OrderTable';
import { useTheme } from '../../context/ThemeContext';
import { v4 as uuidv4 } from 'uuid';
import { AnimatePresence, motion } from 'motion/react';
import { createDefaultWidget, getWidgetDropSize } from './widgetLibrary';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface ModernDashboardProps {
  isDragEnabled?: boolean;
  onDragModeChange?: (enabled: boolean) => void;
}

export function ModernDashboard({ isDragEnabled = true, onDragModeChange }: ModernDashboardProps) {
  const { widgets, layouts, updateLayouts, addWidget, deleteWidget, orders, loadOrders } = useStore();
  const { theme, toggleTheme } = useTheme();
  const [showOrders, setShowOrders] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isPaletteDragging, setIsPaletteDragging] = useState(false);
  const [showDragHint, setShowDragHint] = useState(true);
  const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');
  const [loadingWidgetIds, setLoadingWidgetIds] = useState<string[]>([]);

  const isDark = theme === 'dark';

  const orderStats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

    return {
      totalOrders: orders.length,
      totalRevenue,
    };
  }, [orders]);

  const normalizedLayouts = useMemo(() => normalizeResponsiveLayouts(layouts, widgets), [layouts, widgets]);

  const getLayoutForBreakpoint = useCallback(
    (breakpoint: string) => {
      if (breakpoint === 'lg') return normalizedLayouts.lg || [];
      if (breakpoint === 'md') return normalizedLayouts.md || [];
      return normalizedLayouts.sm || [];
    },
    [normalizedLayouts]
  );

  const getColumnsForBreakpoint = useCallback((breakpoint: string) => {
    if (breakpoint === 'lg') return 12;
    if (breakpoint === 'md') return 10;
    return 6;
  }, []);

  const gridLayoutById = useMemo(() => {
    const layoutMap = new Map<string, DashboardLayout>();
    const activeLayout = getLayoutForBreakpoint(currentBreakpoint);

    activeLayout.forEach((item) => {
      layoutMap.set(item.i, item);
    });

    (normalizedLayouts.lg || []).forEach((item) => {
      if (!layoutMap.has(item.i)) {
        layoutMap.set(item.i, item);
      }
    });

    return layoutMap;
  }, [currentBreakpoint, getLayoutForBreakpoint, normalizedLayouts.lg]);

  const getNextY = useCallback(
    (breakpoint: string = currentBreakpoint) => {
      return getLayoutForBreakpoint(breakpoint).reduce((max, item) => Math.max(max, item.y + item.h), 0);
    },
    [currentBreakpoint, getLayoutForBreakpoint]
  );

  const setWidgetLoading = useCallback((widgetId: string, isLoading: boolean) => {
    setLoadingWidgetIds((currentIds) => {
      if (isLoading) {
        return currentIds.includes(widgetId) ? currentIds : [...currentIds, widgetId];
      }

      return currentIds.filter((id) => id !== widgetId);
    });
  }, []);

  const closeSidebarOnSmallScreen = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  const handleDragModeToggle = () => {
    const newMode = !isDragEnabled;
    onDragModeChange?.(newMode);
    setShowDragHint(true);
  };

  const handleAddWidget = useCallback(
    (type: WidgetType, placement?: Partial<DashboardLayout>) => {
      const id = `widget-${uuidv4()}`;
      const widget = createDefaultWidget(type, id);
      const defaultSize = getWidgetDropSize(type);
      const placementBreakpoint = currentBreakpoint;
      const columns = getColumnsForBreakpoint(placementBreakpoint);
      const nextPlacement = {
        x: Math.max(placement?.x ?? 0, 0),
        y: placement?.y ?? getNextY(placementBreakpoint),
        w: Math.min(placement?.w ?? defaultSize.w, columns),
        h: placement?.h ?? defaultSize.h,
      };
      const resolvedPlacement = placement
        ? {
            x: Math.min(nextPlacement.x, Math.max(columns - nextPlacement.w, 0)),
            y: nextPlacement.y,
            w: nextPlacement.w,
            h: nextPlacement.h,
          }
        : resolvePlacement(getLayoutForBreakpoint(placementBreakpoint), nextPlacement);

      addWidget(widget, {
        i: id,
        x: resolvedPlacement.x,
        y: resolvedPlacement.y,
        w: resolvedPlacement.w,
        h: resolvedPlacement.h,
      });

      setWidgetLoading(id, true);
      setShowDragHint(true);
      setIsPaletteDragging(false);

      void Promise.all([loadOrders(), delay(550)]).finally(() => {
        setWidgetLoading(id, false);
      });

      if (!placement) {
        closeSidebarOnSmallScreen();
      }
    },
    [addWidget, closeSidebarOnSmallScreen, currentBreakpoint, getColumnsForBreakpoint, getLayoutForBreakpoint, getNextY, loadOrders, setWidgetLoading]
  );

  const handleLayoutChange = useCallback(
    (layout: LayoutItem[], allLayouts: Partial<ResponsiveLayouts>) => {
      const nextLgLayout = toDashboardLayouts(allLayouts.lg ?? layout);

      updateLayouts(nextLgLayout, {
        lg: nextLgLayout,
        md: allLayouts.md ? toDashboardLayouts(allLayouts.md) : undefined,
        sm: allLayouts.sm ? toDashboardLayouts(allLayouts.sm) : undefined,
      });
    },
    [updateLayouts]
  );

  const handleDrop = useCallback(
    (layout: LayoutItem[], layoutItem: LayoutItem | undefined, event: Event) => {
      const dragEvent = event as DragEvent;
      const type = dragEvent.dataTransfer?.getData('widgetType') as WidgetType;

      if (!type) {
        setIsPaletteDragging(false);
        return;
      }

      const size = getWidgetDropSize(type);
      const droppedLayout =
        layoutItem ||
        layout.find((item) => item.i === '__dropping__') ||
        layout[layout.length - 1];

      handleAddWidget(type, {
        x: droppedLayout?.x ?? 0,
        y: droppedLayout?.y ?? getNextY(currentBreakpoint),
        w: size.w,
        h: size.h,
      });
    },
    [currentBreakpoint, getNextY, handleAddWidget]
  );

  const handleDropDragOver = useCallback((event: React.DragEvent) => {
    const type = event.dataTransfer.getData('widgetType') as WidgetType;

    if (!type) {
      return false;
    }

    setIsPaletteDragging(true);
    return getWidgetDropSize(type);
  }, []);

  const handleDeleteWidget = (id: string) => {
    deleteWidget(id);
  };

  const renderWidgetContent = (widget: ReturnType<typeof createDefaultWidget>) => {
    const isWidgetLoading = loadingWidgetIds.includes(widget.id);

    switch (widget.type) {
      case 'KPI': {
        const config = widget.config;
        return (
          <KPICard
            title={widget.title}
            metric={config.metric}
            aggregation={config.aggregation}
            format={config.format}
            precision={config.precision}
            orders={orders}
            isLoading={isWidgetLoading}
          />
        );
      }

      case 'Bar':
        return <BarChart widget={widget} orders={orders} isLoading={isWidgetLoading} />;

      case 'Line':
        return <LineChart orders={orders} dataField={widget.config.xAxis as keyof Order} isLoading={isWidgetLoading} />;

      case 'Area':
        return <AreaChart orders={orders} dataField={widget.config.xAxis as keyof Order} isLoading={isWidgetLoading} />;

      case 'Pie':
        return (
          <PieChart
            orders={orders}
            dataField={widget.config.dataField}
            showLegend={widget.config.showLegend}
            isLoading={isWidgetLoading}
          />
        );

      case 'Scatter': {
        const xField = widget.config.xAxis === 'Duration' ? 'quantity' : widget.config.xAxis;
        const yField = widget.config.yAxis === 'Duration' ? 'totalAmount' : widget.config.yAxis;

        return (
          <ScatterPlot
            orders={orders}
            xField={xField as keyof Order}
            yField={yField as keyof Order}
            color={widget.config.color}
            isLoading={isWidgetLoading}
          />
        );
      }

      case 'Table':
        return (
          <DataTable
            columns={widget.config.columns}
            orders={orders}
            sortableColumns={['totalAmount', 'orderDate']}
            isLoading={isWidgetLoading}
          />
        );

      default:
        return <div>Unknown widget type</div>;
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
          : 'bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50'
      }`}
    >
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-sm ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'
        }`}
      >
        <div className="px-4 py-4 md:px-6">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen((current) => !current)}
                className={`rounded-xl p-2 transition-colors ${
                  isDark
                    ? 'hover:bg-slate-800 text-slate-400'
                    : 'hover:bg-slate-200 text-slate-600'
                }`}
                title={isSidebarOpen ? 'Hide widget library' : 'Show widget library'}
              >
                {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <div className="min-w-0">
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                 HalleyX Dashboard
                </h1>
                <p className={`truncate text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {orderStats.totalOrders} orders synced from the database
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className={`rounded-xl p-2 transition-colors ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-600'
                }`}
                title="Toggle theme"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <button
                onClick={handleDragModeToggle}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 font-medium transition-all duration-200 ${
                  isDragEnabled
                    ? isDark
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-green-100 text-green-700 border-green-300'
                    : isDark
                      ? 'bg-slate-700 text-slate-300 border-slate-600'
                      : 'bg-slate-200 text-slate-600 border-slate-300'
                }`}
                title={isDragEnabled ? 'Widget movement is enabled' : 'Widget movement is locked'}
              >
                {isDragEnabled ? 'Rearrange' : 'Locked'}
              </button>

              <button
                onClick={() => setShowOrders(!showOrders)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-all duration-200 ${
                  showOrders
                    ? isDark
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-orange-100 text-orange-700 border border-orange-300'
                    : isDark
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-600'
                }`}
                title="View all orders"
              >
                <ClipboardList className="h-4 w-4" />
                Orders
              </button>

              <button
                onClick={() => {
                  setIsSidebarOpen(true);
                  setShowDragHint(true);
                }}
                className="hidden items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-cyan-700 md:flex"
              >
                <Plus className="h-4 w-4" />
                Widget Library
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-5 md:px-6 md:py-6">
        <div className="mx-auto flex max-w-[1600px] gap-4 lg:gap-6">
          <AnimatePresence initial={false}>
            {isSidebarOpen && (
              <>
                <motion.button
                  type="button"
                  aria-label="Close widget library"
                  className="fixed inset-0 z-30 bg-black/40 md:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSidebarOpen(false)}
                />

                <motion.aside
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-y-0 left-0 z-40 w-[340px] p-4 pt-24 md:static md:z-0 md:w-[340px] md:flex-shrink-0 md:p-0"
                >
                  <div className="h-full md:sticky md:top-24 md:h-[calc(100vh-7.5rem)]">
                    <WidgetPalette
                      orders={orders}
                      onSelect={handleAddWidget}
                      onDragStateChange={setIsPaletteDragging}
                    />
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          <div className="min-w-0 flex-1">
            <div
              className={`relative overflow-hidden rounded-3xl border p-3 transition-all duration-200 md:p-4 ${
                isDark ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-white/70'
              } ${isPaletteDragging ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-transparent' : ''}`}
            >
              {isPaletteDragging && (
                <div
                  className={`pointer-events-none absolute inset-3 rounded-[1.25rem] border-2 border-dashed ${
                    isDark ? 'border-cyan-400/70 bg-cyan-500/5' : 'border-cyan-500/60 bg-cyan-50/70'
                  }`}
                />
              )}

              <ResponsiveGridLayout
                className="layout min-h-[720px]"
                layouts={normalizedLayouts}
                breakpoints={{ lg: 1400, md: 1100, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={100}
                isDraggable={isDragEnabled}
                isResizable={isDragEnabled}
                isDroppable={true}
                onDrop={handleDrop as any}
                onDropDragOver={handleDropDragOver}
                droppingItem={{ i: '__dropping__', x: 0, y: 0, w: 4, h: 4 }}
                compactType="vertical"
                preventCollision={false}
                useCSSTransforms={true}
                onBreakpointChange={(breakpoint) => setCurrentBreakpoint(String(breakpoint))}
                onLayoutChange={handleLayoutChange as any}
                onDragStart={(_layout, item) => setDraggingId(item.i)}
                onDragStop={() => setDraggingId(null)}
                onResizeStart={(_layout, item) => setDraggingId(item.i)}
                onResizeStop={() => setDraggingId(null)}
                margin={[16, 16]}
                containerPadding={[8, 8]}
                draggableHandle=".react-grid-draghandle"
              >
                {widgets.map((widget) => {
                  const widgetLayout = gridLayoutById.get(widget.id);

                  return (
                    <div key={widget.id} data-grid={widgetLayout} className="overflow-hidden">
                      <WidgetWrapper
                        id={widget.id}
                        title={widget.title}
                        isDragging={draggingId === widget.id}
                        onDelete={() => handleDeleteWidget(widget.id)}
                        dragHandle={isDragEnabled}
                      >
                        {renderWidgetContent(widget as ReturnType<typeof createDefaultWidget>)}
                      </WidgetWrapper>
                    </div>
                  );
                })}
              </ResponsiveGridLayout>

              {widgets.length === 0 && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
                  <div
                    className={`max-w-xl rounded-3xl border border-dashed px-8 py-12 text-center ${
                      isDark
                        ? 'border-slate-700 bg-slate-950/70 text-slate-200'
                        : 'border-slate-300 bg-slate-50/90 text-slate-700'
                    }`}
                  >
                    <p className={`text-xs font-semibold uppercase tracking-[0.28em] ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                      Empty Dashboard
                    </p>
                    <h2 className="mt-3 text-3xl font-bold">Drop widgets here</h2>
                    <p className={`mt-3 text-sm leading-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Use the widget library on the left to drag in charts and tables, or click Add on any tile for instant placement.
                    </p>
                    <p className={`mt-4 text-sm ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                      Live data ready: {orderStats.totalOrders} orders and {formatCurrency(orderStats.totalRevenue)} in revenue
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showDragHint && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div
            className={`max-w-xs rounded-2xl border px-4 py-3 shadow-lg ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-200'
                : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-xl">+</span>
              <div className="flex-1">
                <p className="font-medium">Widget library is ready</p>
                <p className="mt-1 text-sm opacity-75">
                  {isSidebarOpen
                    ? 'Drag a tile into the canvas or click Add on a widget card.'
                    : 'Open the widget library from the top bar to add new widgets.'}
                </p>
              </div>
              <button
                onClick={() => setShowDragHint(false)}
                className="opacity-50 transition-opacity hover:opacity-100"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {showOrders && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-0 z-40 flex items-end bg-black/50"
          onClick={() => setShowOrders(false)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`max-h-[90vh] w-full overflow-hidden rounded-t-2xl shadow-2xl ${
              isDark ? 'bg-slate-900' : 'bg-white'
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className={`sticky top-0 z-10 flex items-center justify-between border-b p-4 ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <h2
                className={`flex items-center gap-2 text-xl font-bold ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                <ClipboardList className="h-6 w-6" />
                All Orders
              </h2>
              <button
                onClick={() => setShowOrders(false)}
                className={`rounded-lg p-2 transition-colors ${
                  isDark
                    ? 'hover:bg-slate-700 text-slate-400'
                    : 'hover:bg-slate-200 text-slate-600'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              <OrderTable />
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function normalizeResponsiveLayouts(
  layouts: { lg: DashboardLayout[]; md: DashboardLayout[]; sm: DashboardLayout[] },
  widgets: AnyWidget[]
): { lg: DashboardLayout[]; md: DashboardLayout[]; sm: DashboardLayout[] } {
  return {
    lg: ensureLayoutsForWidgets(layouts.lg || [], widgets, 12),
    md: ensureLayoutsForWidgets(layouts.md || [], widgets, 10),
    sm: ensureLayoutsForWidgets(layouts.sm || [], widgets, 6),
  };
}

function ensureLayoutsForWidgets(
  layout: DashboardLayout[],
  widgets: AnyWidget[],
  columns: number
): DashboardLayout[] {
  const widgetIds = new Set(widgets.map((widget) => widget.id));
  const nextLayout = layout
    .filter((item) => item.i !== '__dropping__' && widgetIds.has(item.i))
    .map((item) => ({ ...item }));

  widgets.forEach((widget) => {
    const alreadyPlaced = nextLayout.some((item) => item.i === widget.id);

    if (alreadyPlaced) {
      return;
    }

    const defaultSize = getWidgetDropSize(widget.type);
    const nextY = nextLayout.reduce((max, item) => Math.max(max, item.y + item.h), 0);
    const placement = resolvePlacement(nextLayout, {
      x: 0,
      y: nextY,
      w: Math.min(defaultSize.w, columns),
      h: defaultSize.h,
    });

    nextLayout.push({
      i: widget.id,
      x: placement.x,
      y: placement.y,
      w: placement.w,
      h: placement.h,
    });
  });

  return nextLayout;
}

function resolvePlacement(
  layout: DashboardLayout[],
  candidate: Pick<DashboardLayout, 'x' | 'y' | 'w' | 'h'>
): Pick<DashboardLayout, 'x' | 'y' | 'w' | 'h'> {
  const nextPlacement = { ...candidate };

  while (layout.some((item) => layoutsOverlap(item, nextPlacement))) {
    nextPlacement.y += 1;
  }

  return nextPlacement;
}

function layoutsOverlap(
  existing: Pick<DashboardLayout, 'x' | 'y' | 'w' | 'h'>,
  incoming: Pick<DashboardLayout, 'x' | 'y' | 'w' | 'h'>
): boolean {
  if (existing.x + existing.w <= incoming.x) return false;
  if (incoming.x + incoming.w <= existing.x) return false;
  if (existing.y + existing.h <= incoming.y) return false;
  if (incoming.y + incoming.h <= existing.y) return false;
  return true;
}

function toDashboardLayouts(layout: readonly LayoutItem[]): DashboardLayout[] {
  return layout.map((item) => ({
    i: item.i,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
  }));
}
