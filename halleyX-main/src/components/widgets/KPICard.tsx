import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Order } from '../../types';
import { calculateKPI, formatNumber } from '../../utils/dataTransform';
import { useTheme } from '../../context/ThemeContext';

interface KPICardProps {
  title: string;
  metric: keyof Order;
  aggregation: 'Sum' | 'Average' | 'Count';
  format: 'Currency' | 'Number' | 'Percentage';
  precision: number;
  orders: Order[];
  isLoading?: boolean;
}

export function KPICard({
  title,
  metric,
  aggregation,
  format,
  precision,
  orders,
  isLoading = false,
}: KPICardProps) {
  const { theme } = useTheme();
  
  const value = calculateKPI(orders, metric, aggregation);
  const formattedValue = formatNumber(value, format, precision);

  // Calculate trend (simplified - just comparing first vs last half)
  const mid = Math.floor(orders.length / 2);
  const firstHalf = calculateKPI(orders.slice(0, mid), metric, aggregation);
  const secondHalf = calculateKPI(orders.slice(mid), metric, aggregation);
  const trend = secondHalf > firstHalf ? 'up' : secondHalf < firstHalf ? 'down' : 'flat';

  const isDark = theme === 'dark';

  return (
    <div className={`p-6 rounded-lg border transition-all duration-200 ${
      isDark 
        ? 'bg-slate-900 border-slate-700 hover:border-slate-600' 
        : 'bg-white border-slate-200 hover:border-slate-300'
    } shadow-sm hover:shadow-md`}>
      {isLoading ? (
        <div className="space-y-3">
          <div className={`h-4 w-24 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'} animate-pulse`} />
          <div className={`h-8 w-32 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'} animate-pulse`} />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {title}
            </h3>
            <div className="flex items-center gap-1">
              {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
              {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
              {trend === 'flat' && <Minus className="w-4 h-4 text-slate-500" />}
            </div>
          </div>
          <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {formattedValue}
          </div>
          <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            {aggregation === 'Sum' && 'Total'}
            {aggregation === 'Average' && 'Average'}
            {aggregation === 'Count' && 'Count'}
            {' ·Calculated from ' + orders.length + ' orders'}
          </div>
        </>
      )}
    </div>
  );
}
