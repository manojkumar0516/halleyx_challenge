import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart as RechartsAreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  ScatterChart as RechartsScatterChart,
  Scatter,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Order } from '../../types';
import { aggregateOrdersBy, getStatusColor } from '../../utils/dataTransform';
import { useTheme } from '../../context/ThemeContext';
import { ChartFrame } from './ChartFrame';

interface LineChartProps {
  orders: Order[];
  dataField: keyof Order;
  isLoading?: boolean;
}

export function LineChart({ orders, dataField, isLoading = false }: LineChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (isLoading) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg`}>
        <div className={`h-24 w-48 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'} animate-pulse`} />
      </div>
    );
  }

  const data = aggregateOrdersBy(orders, dataField, 'Count');

  return (
    <ChartFrame>
      {({ width, height }) => (
        <RechartsLineChart width={width} height={height} data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#475569' : '#e2e8f0'} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} />
          <YAxis tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6' }}
            activeDot={{ r: 6 }}
          />
        </RechartsLineChart>
      )}
    </ChartFrame>
  );
}

interface AreaChartProps {
  orders: Order[];
  dataField: keyof Order;
  isLoading?: boolean;
}

export function AreaChart({ orders, dataField, isLoading = false }: AreaChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (isLoading) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg`}>
        <div className={`h-24 w-48 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'} animate-pulse`} />
      </div>
    );
  }

  const data = aggregateOrdersBy(orders, dataField, 'Sum');

  return (
    <ChartFrame>
      {({ width, height }) => (
        <RechartsAreaChart width={width} height={height} data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#475569' : '#e2e8f0'} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} />
          <YAxis tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              borderRadius: '8px',
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </RechartsAreaChart>
      )}
    </ChartFrame>
  );
}

interface ScatterPlotProps {
  orders: Order[];
  xField: keyof Order;
  yField: keyof Order;
  color?: string;
  isLoading?: boolean;
}

export function ScatterPlot({
  orders,
  xField,
  yField,
  color = '#8b5cf6',
  isLoading = false,
}: ScatterPlotProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (isLoading) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg`}>
        <div className={`h-24 w-48 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'} animate-pulse`} />
      </div>
    );
  }

  const data = orders
    .map((order, index) => ({
      id: order.id,
      label: order.customerName || `Order ${index + 1}`,
      x: Number(order[xField] ?? index + 1),
      y: Number(order[yField] ?? 0),
    }))
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));

  if (data.length === 0) {
    return (
      <div className={`py-12 text-center ${isDark ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg`}>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No numeric data available</p>
      </div>
    );
  }

  return (
    <ChartFrame>
      {({ width, height }) => (
        <RechartsScatterChart width={width} height={height} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#475569' : '#e2e8f0'} />
          <XAxis
            type="number"
            dataKey="x"
            name={formatFieldLabel(xField)}
            tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={formatFieldLabel(yField)}
            tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              borderRadius: '8px',
            }}
            labelFormatter={(_value, payload) => payload?.[0]?.payload?.label || 'Order'}
            formatter={(value, name) => [value, name === 'x' ? formatFieldLabel(xField) : formatFieldLabel(yField)]}
          />
          <Scatter data={data} fill={color} />
        </RechartsScatterChart>
      )}
    </ChartFrame>
  );
}

interface PieChartProps {
  orders: Order[];
  dataField: keyof Order;
  showLegend?: boolean;
  isLoading?: boolean;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function PieChart({ orders, dataField, showLegend = true, isLoading = false }: PieChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (isLoading) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg`}>
        <div className={`h-24 w-24 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'} animate-pulse`} />
      </div>
    );
  }

  const data = aggregateOrdersBy(orders, dataField, 'Count');

  return (
    <ChartFrame>
      {({ width, height }) => (
        <RechartsPieChart width={width} height={height}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => String(value)}
            />
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            borderRadius: '8px',
          }}
        />
        </RechartsPieChart>
      )}
    </ChartFrame>
  );
}

function formatFieldLabel(field: keyof Order): string {
  const label = String(field).replace(/([A-Z])/g, ' $1');
  return label.charAt(0).toUpperCase() + label.slice(1);
}
