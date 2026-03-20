import React from 'react';
import { GripVertical, Trash2, Edit2, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'motion/react';

interface WidgetWrapperProps {
  id: string;
  title: string;
  children: React.ReactNode;
  isDragging?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
  onClose?: () => void;
  dragHandle?: boolean;
}

export function WidgetWrapper({
  id,
  title,
  children,
  isDragging = false,
  onDelete,
  onEdit,
  onClose,
  dragHandle = false,
}: WidgetWrapperProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.div
      layoutId={id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`h-full min-h-0 min-w-0 flex flex-col rounded-lg border transition-all duration-200 ${
        isDragging
          ? isDark
            ? 'border-blue-500 bg-slate-900 shadow-lg shadow-blue-500/20'
            : 'border-blue-500 bg-white shadow-lg shadow-blue-500/20'
          : isDark
            ? 'border-slate-700 bg-slate-900 hover:border-slate-600'
            : 'border-slate-200 bg-white hover:border-slate-300'
      } shadow-sm hover:shadow-md overflow-hidden`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between gap-2 px-4 py-3 border-b ${
          isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'
        } ${dragHandle ? 'cursor-grab active:cursor-grabbing react-grid-draghandle' : ''}`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {dragHandle && (
            <GripVertical
              className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
            />
          )}
          <h3 className={`font-semibold truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            {title}
          </h3>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={onEdit}
              className={`p-1 rounded transition-colors ${
                isDark
                  ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                  : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title="Edit widget"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className={`p-1 rounded transition-colors ${
                isDark
                  ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300'
                  : 'hover:bg-red-100 text-red-600 hover:text-red-700'
              }`}
              title="Delete widget"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className={`p-1 rounded transition-colors ${
                isDark
                  ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                  : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title="Close widget"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 min-w-0 p-4 overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
}
