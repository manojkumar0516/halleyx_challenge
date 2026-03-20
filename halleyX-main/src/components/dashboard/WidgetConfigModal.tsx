import React, { useState } from 'react';
import { AnyWidget, Order } from '../../types';
import { useStore } from '../../store';
import { Modal, Button, Input, Select, Label, cn } from '../ui';

interface WidgetConfigModalProps {
  widget: AnyWidget;
  onClose: () => void;
}

const METRICS: (keyof Order)[] = ['customerId', 'customerName', 'email', 'phone', 'streetAddress', 'city', 'state', 'postalCode', 'country', 'product', 'quantity', 'unitPrice', 'totalAmount', 'status', 'createdBy', 'orderDate'];
const NUMERIC_METRICS: (keyof Order)[] = ['quantity', 'unitPrice', 'totalAmount'];

export function WidgetConfigModal({ widget, onClose }: WidgetConfigModalProps) {
  const { updateWidget } = useStore();
  const [config, setConfig] = useState<AnyWidget>(JSON.parse(JSON.stringify(widget)));

  const handleSave = () => {
    updateWidget(widget.id, config);
    onClose();
  };

  const renderKPIConfig = () => {
    if (config.type !== 'KPI') return null;
    const isNumericAggregation = config.config.aggregation === 'Sum' || config.config.aggregation === 'Average';
    const availableMetrics = isNumericAggregation ? NUMERIC_METRICS : METRICS;

    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Aggregation</Label>
          <Select value={config.config.aggregation} onChange={(e) => {
            const newAgg = e.target.value as any;
            const newMetric = (newAgg === 'Sum' || newAgg === 'Average') && !NUMERIC_METRICS.includes(config.config.metric) 
              ? NUMERIC_METRICS[0] 
              : config.config.metric;
            setConfig({ ...config, config: { ...config.config, aggregation: newAgg, metric: newMetric } });
          }}>
            <option value="Sum">Sum</option>
            <option value="Average">Average</option>
            <option value="Count">Count</option>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Metric</Label>
          <Select value={config.config.metric} onChange={(e) => setConfig({ ...config, config: { ...config.config, metric: e.target.value as any } })}>
            {availableMetrics.map(m => <option key={m} value={m}>{m}</option>)}
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Format</Label>
          <Select value={config.config.format} onChange={(e) => setConfig({ ...config, config: { ...config.config, format: e.target.value as any } })}>
            <option value="Number">Number</option>
            <option value="Currency">Currency</option>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Decimal Precision</Label>
          <Input type="number" min="0" value={config.config.precision} onChange={(e) => setConfig({ ...config, config: { ...config.config, precision: Number(e.target.value) } })} />
        </div>
      </div>
    );
  };

  const renderChartConfig = () => {
    if (config.type !== 'Bar' && config.type !== 'Line' && config.type !== 'Area' && config.type !== 'Scatter') return null;
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <Label>X Axis</Label>
          <Select value={config.config.xAxis} onChange={(e) => setConfig({ ...config, config: { ...config.config, xAxis: e.target.value as any } })}>
            {['product', 'quantity', 'unitPrice', 'totalAmount', 'status', 'createdBy', 'Duration'].map(m => <option key={m} value={m}>{m}</option>)}
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Y Axis</Label>
          <Select value={config.config.yAxis} onChange={(e) => setConfig({ ...config, config: { ...config.config, yAxis: e.target.value as any } })}>
            {['product', 'quantity', 'unitPrice', 'totalAmount', 'status', 'createdBy', 'Duration'].map(m => <option key={m} value={m}>{m}</option>)}
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Chart Color (HEX)</Label>
          <Input type="color" value={config.config.color || '#4f46e5'} onChange={(e) => setConfig({ ...config, config: { ...config.config, color: e.target.value } })} className="h-10 p-1" />
        </div>
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="showDataLabel" checked={config.config.showDataLabel} onChange={(e) => setConfig({ ...config, config: { ...config.config, showDataLabel: e.target.checked } })} />
          <Label htmlFor="showDataLabel">Show Data Label</Label>
        </div>
      </div>
    );
  };

  const renderPieConfig = () => {
    if (config.type !== 'Pie') return null;
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Data Field</Label>
          <Select value={config.config.dataField} onChange={(e) => setConfig({ ...config, config: { ...config.config, dataField: e.target.value as any } })}>
            {['product', 'quantity', 'unitPrice', 'totalAmount', 'status', 'createdBy'].map(m => <option key={m} value={m}>{m}</option>)}
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="showLegend" checked={config.config.showLegend} onChange={(e) => setConfig({ ...config, config: { ...config.config, showLegend: e.target.checked } })} />
          <Label htmlFor="showLegend">Show Legend</Label>
        </div>
      </div>
    );
  };

  const renderTableConfig = () => {
    if (config.type !== 'Table') return null;
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Columns (Hold Ctrl/Cmd to select multiple)</Label>
          <Select multiple className="h-32" value={config.config.columns} onChange={(e) => {
            const options = Array.from(e.target.selectedOptions, option => option.value);
            setConfig({ ...config, config: { ...config.config, columns: options as any } });
          }}>
            {METRICS.map(m => <option key={m} value={m}>{m}</option>)}
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Pagination</Label>
          <Select value={config.config.pagination} onChange={(e) => setConfig({ ...config, config: { ...config.config, pagination: Number(e.target.value) as any } })}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="sorting" checked={config.config.sorting} onChange={(e) => setConfig({ ...config, config: { ...config.config, sorting: e.target.checked } })} />
          <Label htmlFor="sorting">Enable Sorting</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="filtering" checked={config.config.filtering} onChange={(e) => setConfig({ ...config, config: { ...config.config, filtering: e.target.checked } })} />
          <Label htmlFor="filtering">Enable Filtering</Label>
        </div>
        <div className="space-y-1">
          <Label>Font Size (12-18)</Label>
          <Input type="number" min="12" max="18" value={config.config.fontSize} onChange={(e) => setConfig({ ...config, config: { ...config.config, fontSize: Number(e.target.value) } })} />
        </div>
        <div className="space-y-1">
          <Label>Header Background Color (HEX)</Label>
          <Input type="color" value={config.config.headerBgColor || '#f8fafc'} onChange={(e) => setConfig({ ...config, config: { ...config.config, headerBgColor: e.target.value } })} className="h-10 p-1" />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">General Settings</h3>
        <div className="space-y-1">
          <Label>Widget Title</Label>
          <Input value={config.title} onChange={(e) => setConfig({ ...config, title: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label>Description</Label>
          <Input value={config.description} onChange={(e) => setConfig({ ...config, description: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label>Widget Type</Label>
          <Input value={config.type} disabled className="bg-slate-50" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Data Settings</h3>
        {renderKPIConfig()}
        {renderChartConfig()}
        {renderPieConfig()}
        {renderTableConfig()}
      </div>

      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t">
        <Button className="w-full sm:w-auto" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button className="w-full sm:w-auto" onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}
