import React from 'react';
import { X, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, Grid3x3, Table as TableIcon } from 'lucide-react';
import { WidgetType } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

interface WidgetOption {
  type: WidgetType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const WIDGET_OPTIONS: WidgetOption[] = [
  {
    type: 'KPI',
    label: 'KPI Card',
    description: 'Display metrics like total orders or revenue',
    icon: <Grid3x3 className="w-6 h-6" />,
    color: 'from-blue-500 to-blue-600',
  },
  {
    type: 'Bar',
    label: 'Bar Chart',
    description: 'Compare data across categories',
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'from-purple-500 to-purple-600',
  },
  {
    type: 'Line',
    label: 'Line Chart',
    description: 'Visualize trends over time',
    icon: <LineChartIcon className="w-6 h-6" />,
    color: 'from-green-500 to-green-600',
  },
  {
    type: 'Area',
    label: 'Area Chart',
    description: 'Show cumulative trends',
    icon: <LineChartIcon className="w-6 h-6" />,
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    type: 'Pie',
    label: 'Pie Chart',
    description: 'Display proportional data',
    icon: <PieChartIcon className="w-6 h-6" />,
    color: 'from-orange-500 to-orange-600',
  },
  {
    type: 'Table',
    label: 'Data Table',
    description: 'Display detailed data in rows',
    icon: <TableIcon className="w-6 h-6" />,
    color: 'from-red-500 to-red-600',
  },
];

interface WidgetSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: WidgetType) => void;
}

export function WidgetSelector({ isOpen, onClose, onSelect }: WidgetSelectorProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`w-full max-w-2xl rounded-lg shadow-xl ${
              isDark ? 'bg-slate-900' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between px-6 py-4 border-b ${
                isDark ? 'border-slate-700' : 'border-slate-200'
              }`}
            >
              <div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Add Widget
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Choose a widget type to add to your dashboard
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                    : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {WIDGET_OPTIONS.map((option) => (
                  <motion.button
                    key={option.type}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    layout
                    onClick={() => {
                      onSelect(option.type);
                      onClose();
                    }}
                    className={`group p-4 rounded-lg border-2 transition-all duration-200 ${
                      isDark
                        ? 'border-slate-700 hover:border-slate-600 bg-slate-800 hover:bg-slate-750'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br ${option.color} text-white flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      {option.icon}
                    </div>
                    <h3
                      className={`font-semibold text-sm mb-1 ${
                        isDark ? 'text-slate-100' : 'text-slate-900'
                      }`}
                    >
                      {option.label}
                    </h3>
                    <p
                      className={`text-xs ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {option.description}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
