import React, { useState } from 'react';
import { useStore } from '../store';
import { ChevronDown, ChevronUp, RotateCw } from 'lucide-react';

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { orders, widgets, loadOrders } = useStore();

  const handleReloadData = async () => {
    console.log('[DebugPanel] Reloading data...');
    await loadOrders();
  };

  const handleClearCache = () => {
    if (confirm('This will clear the dashboard cache and reset to defaults. Continue?')) {
      localStorage.removeItem('dashboard-storage');
      window.location.reload();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-mono hover:bg-slate-700 transition z-50 shadow-lg"
        title="Click to open debug panel"
      >
        🐛 Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 text-slate-50 rounded-lg shadow-2xl z-50 max-w-sm border border-slate-700">
      <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-900">
        <span className="text-xs font-mono font-bold">🐛 Debug Panel</span>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-slate-700 rounded transition"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 space-y-3 max-h-96 overflow-y-auto text-xs font-mono">
        {/* Data Summary */}
        <div className="bg-slate-700 p-2 rounded border border-slate-600">
          <div className="font-bold text-blue-300 mb-1">📊 Data Summary</div>
          <div className="space-y-1 text-slate-300">
            <div>• Orders in DB: <span className="text-green-300">{orders.length}</span></div>
            <div>• Widgets: <span className="text-green-300">{widgets.length}</span></div>
            <div>• Total Revenue: <span className="text-green-300">${orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0).toFixed(2)}</span></div>
          </div>
        </div>

        {/* Orders Preview */}
        <div className="bg-slate-700 p-2 rounded border border-slate-600">
          <div className="font-bold text-blue-300 mb-1">📋 Orders</div>
          <div className="space-y-1 text-slate-300">
            {orders.length === 0 ? (
              <div className="text-red-300">⚠️ No orders found!</div>
            ) : (
              orders.slice(0, 3).map((o, i) => (
                <div key={i} className="text-xs truncate">
                  • {o.customerName} - {o.product} (${o.totalAmount})
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widgets Preview */}
        <div className="bg-slate-700 p-2 rounded border border-slate-600">
          <div className="font-bold text-blue-300 mb-1">🎨 Widgets</div>
          <div className="space-y-1 text-slate-300">
            {widgets.length === 0 ? (
              <div className="text-red-300">⚠️ No widgets configured!</div>
            ) : (
              widgets.slice(0, 5).map((w, i) => (
                <div key={i} className="text-xs truncate">
                  • {w.type}: {w.title}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleReloadData}
            className="w-full bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded text-xs font-bold transition flex items-center justify-center gap-1"
          >
            <RotateCw className="w-3 h-3" />
            Reload Data
          </button>
          <button
            onClick={handleClearCache}
            className="w-full bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-xs font-bold transition"
          >
            Clear Cache
          </button>
        </div>

        {/* Console Hint */}
        <div className="bg-slate-700 p-2 rounded border border-amber-600 text-amber-300 text-xs">
          💡 Open browser console (F12) to see detailed logs with [App], [Store], [Chart], [KPI] tags
        </div>
      </div>
    </div>
  );
}
