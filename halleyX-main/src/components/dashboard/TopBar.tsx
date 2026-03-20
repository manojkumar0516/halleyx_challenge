import React from 'react';
import { useStore, DateFilter } from '../../store';
import { Button, Select } from '../ui';
import { Settings, LayoutDashboard } from 'lucide-react';

const DATE_FILTERS: DateFilter[] = ['All time', 'Today', 'Last 7 Days', 'Last 30 Days', 'Last 90 Days'];

export function TopBar() {
  const { dateFilter, setDateFilter, isConfiguring, setIsConfiguring } = useStore();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 md:px-6 py-4 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center">
        <div className="md:col-span-7">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-indigo-600" />
            Data Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">Dynamic insights with charts, tables, and KPIs.</p>
        </div>

        <div className="md:col-span-3 flex items-center gap-2">
          <label htmlFor="dateFilter" className="text-sm text-slate-500 whitespace-nowrap">Show data for</label>
          <Select
            id="dateFilter"
            className="w-full md:w-40"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilter)}
            aria-label="Date filter"
          >
            {DATE_FILTERS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </Select>
        </div>

        <div className="md:col-span-2 flex justify-end">
          <Button
            variant={isConfiguring ? 'secondary' : 'primary'}
            onClick={() => setIsConfiguring(!isConfiguring)}
            aria-pressed={isConfiguring}
          >
            <Settings className="w-4 h-4 mr-2" />
            {isConfiguring ? 'Done' : 'Configure'}
          </Button>
        </div>
      </div>
    </header>
  );
}
