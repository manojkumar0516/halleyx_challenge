import React, { useMemo } from 'react';
import {
  AreaChart,
  BarChart3,
  Database,
  GripVertical,
  Hash,
  LineChart,
  PieChart,
  Plus,
  ScatterChart,
  Table,
} from 'lucide-react';
import { Order, WidgetType } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { WIDGET_LIBRARY } from './widgetLibrary';

interface WidgetPaletteProps {
  orders: Order[];
  onSelect: (type: WidgetType) => void;
  onDragStateChange?: (isDragging: boolean) => void;
}

const ICONS = {
  KPI: Hash,
  Bar: BarChart3,
  Line: LineChart,
  Pie: PieChart,
  Area: AreaChart,
  Scatter: ScatterChart,
  Table,
} as const;

export function WidgetPalette({ orders, onSelect, onDragStateChange }: WidgetPaletteProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

    return {
      totalOrders: orders.length,
      totalRevenue,
      productCount: new Set(orders.map((order) => order.product)).size,
      statusCount: new Set(orders.map((order) => order.status)).size,
      ownerCount: new Set(orders.map((order) => order.createdBy)).size,
    };
  }, [orders]);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, type: WidgetType) => {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('widgetType', type);
    event.dataTransfer.setData('text/plain', type);
    onDragStateChange?.(true);
  };

  const getPreview = (type: WidgetType): string => {
    switch (type) {
      case 'KPI':
        return `${formatCurrency(stats.totalRevenue)} from ${stats.totalOrders} orders`;
      case 'Bar':
        return `${stats.productCount || 0} product groups ready`;
      case 'Line':
        return `${stats.ownerCount || 0} owners available`;
      case 'Area':
        return `${stats.statusCount || 0} revenue segments ready`;
      case 'Pie':
        return `${stats.statusCount || 0} status slices ready`;
      case 'Scatter':
        return `${stats.totalOrders || 0} points available`;
      case 'Table':
      default:
        return `${stats.totalOrders || 0} database rows ready`;
    }
  };

  return (
    <div
      className={`flex h-full flex-col overflow-hidden rounded-3xl border shadow-xl ${
        isDark
          ? 'border-slate-700 bg-slate-900 text-slate-100'
          : 'border-slate-200 bg-white text-slate-900'
      }`}
    >
      <div
        className={`border-b p-5 ${
          isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50/90'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
              Widget Library
            </p>
            <h2 className="mt-2 text-2xl font-bold">Add Widgets Faster</h2>
            <p className={`mt-2 text-sm leading-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Drag a tile into the dashboard or use Add for one-click placement. Every widget reads from the loaded orders dataset.
            </p>
          </div>

          <div
            className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${
              isDark ? 'bg-cyan-500/10 text-cyan-200 ring-1 ring-cyan-500/30' : 'bg-cyan-50 text-cyan-800 ring-1 ring-cyan-200'
            }`}
          >
            <Database className="h-4 w-4" />
            DB synced
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <StatCard label="Orders" value={String(stats.totalOrders)} isDark={isDark} />
          <StatCard label="Revenue" value={formatCurrency(stats.totalRevenue)} isDark={isDark} />
          <StatCard label="Products" value={String(stats.productCount)} isDark={isDark} />
          <StatCard label="Statuses" value={String(stats.statusCount)} isDark={isDark} />
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {WIDGET_LIBRARY.map((item) => {
          const Icon = ICONS[item.type];

          return (
            <div
              key={item.type}
              draggable
              onDragStart={(event) => handleDragStart(event, item.type)}
              onDragEnd={() => onDragStateChange?.(false)}
              className={`group rounded-2xl border p-4 transition-all duration-200 ${
                isDark
                  ? 'border-slate-700 bg-slate-950/60 hover:border-slate-500 hover:bg-slate-950'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${
                    isDark ? 'bg-slate-800 text-cyan-300' : 'bg-cyan-50 text-cyan-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{item.label}</h3>
                    <GripVertical className={`h-4 w-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  </div>
                  <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {item.description}
                  </p>
                  <p className={`mt-2 text-xs font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                    {getPreview(item.type)}
                  </p>
                  <p className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    {item.dataHint}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                  Drag to place on the grid
                </span>

                <button
                  type="button"
                  onClick={() => {
                    onDragStateChange?.(false);
                    onSelect(item.type);
                  }}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
                    isDark
                      ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                      : 'bg-cyan-600 text-white hover:bg-cyan-700'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  isDark,
}: {
  label: string;
  value: string;
  isDark: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-3 ${
        isDark ? 'border-slate-700 bg-slate-950/70' : 'border-slate-200 bg-white'
      }`}
    >
      <p className={`text-xs uppercase tracking-[0.2em] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
        {label}
      </p>
      <p className="mt-2 text-lg font-bold">{value}</p>
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
