import React from 'react';
import { AnyWidget } from '../../types';
import { Settings, Trash2, GripHorizontal } from 'lucide-react';

interface WidgetCardProps {
  widget: AnyWidget;
  isConfiguring: boolean;
  onConfigure: (id: string) => void;
  onDelete: (id: string) => void;
  children: React.ReactNode;
}

export const WidgetCard = React.memo(function WidgetCard({ widget, isConfiguring, onConfigure, onDelete, children }: WidgetCardProps) {
  return (
    <article
      className="group bg-white rounded-2xl border border-slate-200 shadow-md transition-all duration-200 hover:shadow-xl hover:border-slate-300 overflow-hidden flex flex-col h-full"
      role="region"
      aria-label={`Widget ${widget.title}`}
      tabIndex={0}
    >
      <header className="px-4 py-3 border-b border-slate-100 flex justify-between items-start gap-2 bg-gradient-to-r from-slate-50 to-transparent">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-900">{widget.title}</h3>
          {widget.description ? <p className="text-xs text-slate-500 mt-1">{widget.description}</p> : null}
        </div>

        {isConfiguring ? (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              type="button"
              aria-label="Drag widget"
              className="p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-grab active:cursor-grabbing"
              title="Drag to move"
            >
              <GripHorizontal className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Configure widget"
              onClick={() => onConfigure(widget.id)}
              className="p-2 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="Configure"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Delete widget"
              onClick={() => {
                if (confirm('Are you sure you want to delete this widget?')) {
                  onDelete(widget.id);
                }
              }}
              className="p-2 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : null}
      </header>

      <div className="p-4 h-full min-h-[160px] flex flex-col overflow-hidden flex-1">{children}</div>
    </article>
  );
});

WidgetCard.displayName = 'WidgetCard';
