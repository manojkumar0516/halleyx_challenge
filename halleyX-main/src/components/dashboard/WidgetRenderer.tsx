import React, { useMemo, useState, useEffect } from 'react';
import { AnyWidget, Order } from '../../types';
import { useStore } from '../../store';
import { isAfter, subDays, startOfDay } from 'date-fns';
import { fetchChartAnalytics, fetchStatusAnalytics } from '../../api/orderApi';
import { LoadingSpinner, EmptyState, ErrorState } from '../ui/LoadingStates';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, ScatterChart, Scatter, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';

interface WidgetRendererProps {
  widget: AnyWidget;
}

export function WidgetRenderer({ widget }: WidgetRendererProps) {
  const { orders, dateFilter } = useStore();
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Log widget and orders on mount/change
  useEffect(() => {
    console.log('[WidgetRenderer] 🎨 Widget rendering:', {
      widgetId: widget.id,
      widgetType: widget.type,
      title: widget.title,
      ordersCount: orders.length,
      dateFilter,
    });
  }, [widget, orders.length, dateFilter]);

  const filteredOrders = useMemo(() => {
    if (dateFilter === 'All time') return orders;
    
    const today = startOfDay(new Date());
    let cutoffDate = today;
    
    if (dateFilter === 'Today') cutoffDate = today;
    else if (dateFilter === 'Last 7 Days') cutoffDate = subDays(today, 7);
    else if (dateFilter === 'Last 30 Days') cutoffDate = subDays(today, 30);
    else if (dateFilter === 'Last 90 Days') cutoffDate = subDays(today, 90);

    const filtered = orders.filter(o => isAfter(new Date(o.orderDate), cutoffDate));
    console.log('[WidgetRenderer] 🔍 Filtered orders:', {
      total: orders.length,
      filtered: filtered.length,
      filter: dateFilter,
    });
    return filtered;
  }, [orders, dateFilter]);

  // Fetch analytics data when widget config changes
  useEffect(() => {
    if (widget.type === 'Pie' || (widget.type !== 'KPI' && widget.type !== 'Table')) {
      setIsLoading(true);
      setError(null);
      
      const loadChartData = async () => {
        try {
          let data: any[] = [];
          
          if (widget.type === 'Pie') {
            const config = widget.config as any;
            const field = config.dataField;
            
            console.log(`[WidgetRenderer] Fetching Pie chart data for field: ${field}`);
            
            if (field === 'status') {
              data = await fetchStatusAnalytics();
            } else {
              data = await fetchChartAnalytics(field);
            }
          } else if (widget.type === 'Bar' || widget.type === 'Line' || widget.type === 'Area') {
            const config = widget.config as any;
            const xAxis = config.xAxis;
            
            console.log(`[WidgetRenderer] Fetching ${widget.type} chart data for axis: ${xAxis}`);
            
            if (xAxis === 'status') {
              data = await fetchStatusAnalytics();
            } else {
              data = await fetchChartAnalytics(xAxis);
            }
          }
          
          console.log(`[WidgetRenderer] Chart data fetched:`, data);
          setChartData(data);
          setError(null);
        } catch (err) {
          console.warn('[WidgetRenderer] Failed to load chart analytics, using local data:', err);
          console.warn('[WidgetRenderer] Will aggregate data from orders locally');
          // Don't set error, let chart use local data fallback
          setError(null);
          setChartData([]);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadChartData();
    }
  }, [widget]);

  if (widget.type === 'KPI') {
    const { metric, aggregation, format, precision } = widget.config;
    let value = 0;
    
    console.log('[WidgetRenderer:KPI] 📊 Calculating KPI:', {
      widget: widget.title,
      metric,
      aggregation,
      filteredOrdersCount: filteredOrders.length,
    });
    
    if (aggregation === 'Count') {
      value = filteredOrders.length;
      console.log('[WidgetRenderer:KPI] ✅ Count result:', value);
    } else {
      const numericValues = filteredOrders.map(o => {
        const val = Number(o[metric as keyof Order] || 0);
        console.log(`[WidgetRenderer:KPI] 🔢 Converting ${metric}:`, {
          raw: o[metric as keyof Order],
          converted: val,
        });
        return val;
      });
      const sum = numericValues.reduce((a, b) => a + b, 0);
      value = aggregation === 'Average' ? (numericValues.length ? sum / numericValues.length : 0) : sum;
      console.log('[WidgetRenderer:KPI] ✅ Aggregation result:', {
        aggregation,
        sum,
        average: numericValues.length ? sum / numericValues.length : 0,
        final: value,
      });
    }

    const formattedValue = format === 'Currency' 
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: precision, minimumFractionDigits: precision }).format(value)
      : new Intl.NumberFormat('en-US', { maximumFractionDigits: precision, minimumFractionDigits: precision }).format(value);

    console.log('[WidgetRenderer:KPI] 🎨 Formatted value:', formattedValue);

    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4">
        <div className="text-5xl font-bold text-slate-900">{formattedValue}</div>
        <div className="text-sm text-slate-600 mt-3 text-center font-medium">{widget.description || `${aggregation} of ${metric}`}</div>
      </div>
    );
  }

  if (widget.type === 'Table') {
    const { columns, sorting, pagination, filtering, fontSize, headerBgColor } = widget.config;
    const [currentPage, setCurrentPage] = useState(1);
    const [sortCol, setSortCol] = useState<string | null>(null);
    const [sortAsc, setSortAsc] = useState(true);
    const [filterText, setFilterText] = useState('');

    let processedData = [...filteredOrders];

    if (filtering && filterText) {
      processedData = processedData.filter(row => 
        columns.some(col => String(row[col]).toLowerCase().includes(filterText.toLowerCase()))
      );
    }

    if (sorting && sortCol) {
      processedData.sort((a, b) => {
        const valA = a[sortCol as keyof Order];
        const valB = b[sortCol as keyof Order];
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
    }

    const totalPages = Math.ceil(processedData.length / pagination);
    const paginatedData = processedData.slice((currentPage - 1) * pagination, currentPage * pagination);

    return (
      <div className="flex flex-col h-full overflow-hidden" style={{ fontSize: `${fontSize}px` }}>
        {filtering && (
          <div className="mb-3 px-2">
            <input 
              type="text" 
              placeholder="Search..." 
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
            />
          </div>
        )}
        <div className="flex-1 overflow-auto rounded-lg border border-slate-200">
          {paginatedData.length === 0 ? (
            <EmptyState message="No data to display" />
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10" style={{ backgroundColor: headerBgColor || '#f8fafc' }}>
                <tr>
                  {columns.map(col => (
                    <th 
                      key={col} 
                      className={`px-4 py-3 border-b border-slate-200 font-semibold text-slate-700 ${sorting ? 'cursor-pointer select-none hover:bg-slate-100' : ''}`}
                      onClick={() => {
                        if (sorting) {
                          if (sortCol === col) setSortAsc(!sortAsc);
                          else { setSortCol(col); setSortAsc(true); }
                        }
                      }}
                    >
                      {col} {sortCol === col ? (sortAsc ? '↑' : '↓') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map(row => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    {columns.map(col => (
                      <td key={col} className="px-4 py-3 text-slate-600">
                        {String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t border-slate-200 bg-slate-50 mt-2 rounded-b-lg">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 border border-slate-300 rounded disabled:opacity-50 text-sm hover:bg-slate-100 transition">Prev</button>
            <span className="text-sm text-slate-600">Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 border border-slate-300 rounded disabled:opacity-50 text-sm hover:bg-slate-100 transition">Next</button>
          </div>
        )}
      </div>
    );
  }

  // Chart Rendering Logic
  const renderChart = () => {
    let dataToRender = chartData.length > 0 ? chartData : null;
    
    console.log(`[WidgetRenderer:Chart] 📈 ${widget.type} rendering`, {
      widget: widget.title,
      fetchedDataCount: dataToRender?.length || 0,
      filteredOrdersCount: filteredOrders.length,
    });
    
    if (widget.type === 'Pie') {
      const { dataField, showLegend } = widget.config;
      
      let data = dataToRender;
      if (!data || data.length === 0) {
        console.log(`[Chart] ${widget.title}: No API data, generating from local orders (${filteredOrders.length} orders)`);
        const dataMap = new Map<string, number>();
        filteredOrders.forEach(o => {
          const key = String(o[dataField as keyof Order]);
          dataMap.set(key, (dataMap.get(key) || 0) + 1);
        });
        data = Array.from(dataMap.entries()).map(([name, value]) => ({ name, value }));
        console.log(`[Chart] Generated local data:`, data);
      }

      const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];

      if (!data || data.length === 0) {
        console.warn(`[Chart] No data available for Pie chart ${widget.title}`);
        return <EmptyState message="No data available for this chart" />;
      }

      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={data} 
              cx="50%" 
              cy="50%" 
              outerRadius={80} 
              fill="#8884d8" 
              dataKey="value" 
              label={({ name, value }) => `${name}: ${value}`}
            >
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
              formatter={(value) => [value, 'Count']}
            />
            {showLegend && <Legend />}
          </PieChart>
        </ResponsiveContainer>
      );
    }

    const { xAxis, yAxis, color, showDataLabel } = widget.config as any;
    
    let data = dataToRender;
    if (!data || data.length === 0) {
      console.log(`[Chart] ${widget.title}: No API data, generating from local orders (${filteredOrders.length} orders)`);
      const dataMap = new Map<string, number>();
      filteredOrders.forEach(o => {
        let xVal = 'Unknown';
        if (xAxis === 'Duration') {
          xVal = new Date(o.orderDate).toLocaleDateString();
        } else {
          xVal = String(o[xAxis as keyof Order] || 'Unknown');
        }
        
        let yVal = 0;
        if (yAxis === 'Duration') {
          yVal = 1;
        } else {
          yVal = Number(o[yAxis as keyof Order] || 0);
        }
        
        dataMap.set(xVal, (dataMap.get(xVal) || 0) + yVal);
      });
      data = Array.from(dataMap.entries()).map(([name, value]) => ({ name, value }));
      console.log(`[Chart] Generated local data:`, data);
    }

    if (!data || data.length === 0) {
      console.warn(`[Chart] No data available for ${widget.type} chart ${widget.title}`);
      return <EmptyState message="No data available for this chart" />;
    }

    const ChartComponent = widget.type === 'Bar' ? BarChart 
                       : widget.type === 'Line' ? LineChart 
                       : widget.type === 'Area' ? AreaChart 
                       : ScatterChart;

    const DataComponent = (widget.type === 'Bar' ? Bar 
                      : widget.type === 'Line' ? Line 
                      : widget.type === 'Area' ? Area 
                      : Scatter) as any;

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            type="category" 
            tick={{ fontSize: 12 }} 
            tickLine={false} 
            axisLine={false} 
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            type="number" 
            tick={{ fontSize: 12 }} 
            tickLine={false} 
            axisLine={false} 
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            formatter={(value) => [value, capFirstLetter(yAxis)]}
          />
          <DataComponent 
            type="monotone" 
            dataKey="value" 
            data={data}
            fill={color || '#4f46e5'} 
            stroke={color || '#4f46e5'} 
            label={showDataLabel ? { position: 'top', fill: '#64748b', fontSize: 12 } : false}
            isAnimationActive={true}
          />
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-slate-800">
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <div className="w-full h-full min-h-[200px] flex flex-col">
          {renderChart()}
        </div>
      )}
    </div>
  );
}

function capFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
