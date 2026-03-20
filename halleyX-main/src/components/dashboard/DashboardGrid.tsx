import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import { useStore } from '../../store';
import { WidgetRenderer } from './WidgetRenderer';
import { WidgetConfigModal } from './WidgetConfigModal';
import { Modal } from '../ui';
import { WidgetCard } from './WidgetCard';
import { v4 as uuidv4 } from 'uuid';
import { AnyWidget, WidgetType, DashboardLayout } from '../../types';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export function DashboardGrid() {
  const { widgets, layouts, updateLayouts, isConfiguring, addWidget, deleteWidget } = useStore();
  const [mounted, setMounted] = useState(false);
  const [configWidgetId, setConfigWidgetId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onDrop = (
    layout: readonly DashboardLayout[],
    layoutItem: DashboardLayout | undefined,
    event: Event
  ) => {
    const dragEvent = event as DragEvent;
    const dataTransfer = dragEvent?.dataTransfer as DataTransfer | null;
    if (!dataTransfer) return;
    const type = dataTransfer.getData('widgetType') as WidgetType;
    if (!type) return;

    const id = uuidv4();
    
    let defaultW = 5;
    let defaultH = 5;
    
    if (type === 'KPI') { defaultW = 2; defaultH = 2; }
    if (type === 'Pie' || type === 'Table') { defaultW = 4; defaultH = 4; }

    // Use layoutItem position if available, otherwise default to 0,0
    const x = layoutItem?.x ?? 0;
    const y = layoutItem?.y ?? 0;

    const newWidget: AnyWidget = {
      id,
      type,
      title: `New ${type} Widget`,
      description: '',
      config: type === 'KPI' ? { metric: 'totalAmount', aggregation: 'Sum', format: 'Currency', precision: 0 } :
              type === 'Table' ? { columns: ['customerName', 'product', 'totalAmount', 'status'], sorting: true, pagination: 5, filtering: true, fontSize: 14, headerBgColor: '#f8fafc' } :
              type === 'Pie' ? { dataField: 'product', showLegend: true } :
              { xAxis: 'product', yAxis: 'totalAmount', color: '#4f46e5', showDataLabel: false }
    } as AnyWidget;

    addWidget(newWidget, {
      i: id,
      x,
      y,
      w: defaultW,
      h: defaultH,
    });
  };

  const onDropDragOver = (dragEvent: React.DragEvent) => {
    const dataTransfer = dragEvent.dataTransfer;
    const type = dataTransfer.getData('widgetType') as WidgetType;
    
    if (!type) return false;

    // Return size based on widget type
    if (type === 'KPI') {
      return { w: 2, h: 2 };
    } else if (type === 'Pie' || type === 'Table') {
      return { w: 4, h: 4 };
    } else {
      return { w: 5, h: 5 };
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex-1 bg-slate-50 min-h-[500px] rounded-xl">
      {widgets.length === 0 && !isConfiguring ? (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-500 gap-4">
          <div className="text-6xl">📊</div>
          <p className="text-lg font-medium">Your dashboard is empty.</p>
          <p className="text-sm text-slate-400">Click "Configure Dashboard" to start adding widgets.</p>
        </div>
      ) : (
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 8, sm: 4, xs: 2, xxs: 1 }}
          rowHeight={60}
          onLayoutChange={(currentLayout, allLayouts) => updateLayouts(currentLayout, allLayouts)}
          isDraggable={isConfiguring}
          isResizable={isConfiguring}
          isDroppable={isConfiguring}
          onDrop={onDrop}
          onDropDragOver={onDropDragOver}
          droppingItem={{ i: 'drop', x: 0, y: 0, w: 2, h: 2 }}
          compactType="vertical"
          margin={[16, 16]}
          containerPadding={[16, 16]}
          preventCollision={false}
        >
          {widgets.map((widget) => (
            <WidgetCard
              key={widget.id}
              widget={widget}
              isConfiguring={isConfiguring}
              onConfigure={setConfigWidgetId}
              onDelete={deleteWidget}
            >
              <WidgetRenderer widget={widget} />
            </WidgetCard>
          ))}
        </ResponsiveGridLayout>
      )}

      {isConfiguring && widgets.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="border-2 border-dashed border-indigo-300 rounded-2xl p-12 text-center bg-indigo-50/30 backdrop-blur-sm">
            <p className="text-indigo-600 font-medium text-lg">✨ Drag widgets here to add them</p>
            <p className="text-indigo-500 text-sm mt-2">Resize and arrange widgets as you like</p>
          </div>
        </div>
      )}

      {configWidgetId && (
        <Modal
          isOpen={!!configWidgetId}
          onClose={() => setConfigWidgetId(null)}
          title="Configure Widget"
        >
          <WidgetConfigModal 
            widget={widgets.find(w => w.id === configWidgetId)!} 
            onClose={() => setConfigWidgetId(null)} 
          />
        </Modal>
      )}
    </div>
  );
}
