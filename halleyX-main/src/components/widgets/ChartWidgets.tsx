import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Order, ChartWidget } from '../../types';
import { aggregateOrdersBy } from '../../utils/dataTransform';
import { useTheme } from '../../context/ThemeContext';
import { ChartFrame } from './ChartFrame';

interface BarChartProps {
  widget: ChartWidget;
  orders: Order[];
  isLoading?: boolean;
}

export function BarChart({ widget, orders, isLoading = false }: BarChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (isLoading) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg`}>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`h-12 w-48 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'} animate-pulse`} />
          ))}
        </div>
      </div>
    );
  }

  const data = aggregateOrdersBy(orders, widget.config.xAxis as keyof Order, 'Count');

  return (
    <ChartFrame>
      {({ width, height }) => (
        <RechartsBarChart
          width={width}
          height={height}
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? '#475569' : '#e2e8f0'}
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              borderRadius: '8px',
              color: isDark ? '#e2e8f0' : '#1e293b',
            }}
            cursor={{ fill: isDark ? 'rgba(71, 85, 105, 0.1)' : 'rgba(226, 232, 240, 0.5)' }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="square"
          />
          <Bar
            dataKey="value"
            fill={widget.config.color}
            radius={[8, 8, 0, 0]}
            label={widget.config.showDataLabel ? { fill: isDark ? '#e2e8f0' : '#1e293b', position: 'top' } : false}
          />
        </RechartsBarChart>
      )}
    </ChartFrame>
  );
}
