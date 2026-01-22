import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Plus,
  ChevronDown,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { Select, Input } from '../Common';
import type { Aggregation, AggregationType, FieldMapping, AggregationConfig } from '../../types';
import { useQueryStore } from '../../store/queryStore';
import { AggregationConfigPanel } from './AggregationConfigPanel';

interface AggregationRowProps {
  aggregation: Aggregation;
  fields: FieldMapping[];
  depth?: number;
}

const aggregationTypeOptions = [
  { value: 'terms', label: 'Terms' },
  { value: 'date_histogram', label: 'Date Histogram' },
  { value: 'geohash_grid', label: 'Geohash Grid' },
  { value: 'geotile_grid', label: 'Geotile Grid' },
  { value: 'cardinality', label: 'Cardinality (Unique)' },
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
  { value: 'min', label: 'Minimum' },
  { value: 'max', label: 'Maximum' },
  { value: 'top_hits', label: 'Top Hits' },
  { value: 'bucket_script', label: 'Bucket Script' },
  { value: 'bucket_selector', label: 'Bucket Selector' },
  { value: 'composite', label: 'Composite' },
];

const getDefaultConfig = (type: AggregationType): AggregationConfig => {
  switch (type) {
    case 'terms':
      return { field: '', size: 10 };
    case 'date_histogram':
      return { field: '', calendar_interval: 'day' };
    case 'geohash_grid':
      return { field: '', precision: 5 };
    case 'geotile_grid':
      return { field: '', precision: 7 };
    case 'cardinality':
      return { field: '' };
    case 'sum':
    case 'avg':
    case 'min':
    case 'max':
      return { field: '' };
    case 'top_hits':
      return { size: 1 };
    case 'bucket_script':
      return { buckets_path: {}, script: '' };
    case 'bucket_selector':
      return { buckets_path: {}, script: '' };
    case 'composite':
      return { size: 10, sources: [] };
    default:
      return { field: '' };
  }
};

export const AggregationRow = ({ aggregation, fields, depth = 0 }: AggregationRowProps) => {
  const { updateAggregation, updateAggregationConfig, removeAggregation, toggleAggregation, addAggregation } =
    useQueryStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showConfig, setShowConfig] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: aggregation.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as AggregationType;
    updateAggregation(aggregation.id, {
      type: newType,
      config: getDefaultConfig(newType),
    });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAggregation(aggregation.id, { name: e.target.value });
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateAggregationConfig(aggregation.id, { field: e.target.value });
  };

  const hasSubAggs = aggregation.subAggregations.length > 0;
  const config = aggregation.config as Record<string, unknown>;
  const needsField = 'field' in config;

  const fieldOptions = fields.map((f) => ({
    value: f.path || f.name,
    label: `${f.name} (${f.type})`,
  }));

  const borderColors = [
    'border-l-indigo-500',
    'border-l-teal-500',
    'border-l-amber-500',
    'border-l-rose-500',
  ];
  const borderColor = borderColors[depth % borderColors.length];

  // Check if this type can have sub-aggregations (bucket aggs can, metrics can't)
  const canHaveSubAggs = [
    'terms',
    'date_histogram',
    'geohash_grid',
    'geotile_grid',
    'composite',
  ].includes(aggregation.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border-l-4 ${borderColor} bg-white rounded-lg shadow-sm ${
        !aggregation.enabled ? 'opacity-50' : ''
      }`}
    >
      {/* Aggregation header */}
      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-t-lg border-b">
        <button
          className="cursor-grab text-gray-400 hover:text-gray-600"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>

        {(hasSubAggs || canHaveSubAggs) && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}

        {/* Aggregation name */}
        <Input
          value={aggregation.name}
          onChange={handleNameChange}
          className="w-32 text-sm font-mono"
          placeholder="agg_name"
        />

        {/* Type selector */}
        <Select
          options={aggregationTypeOptions}
          value={aggregation.type}
          onChange={handleTypeChange}
          className="w-36"
        />

        {/* Field selector (if needed) */}
        {needsField && (
          <Select
            options={fieldOptions}
            value={(config.field as string) || ''}
            onChange={handleFieldChange}
            placeholder="Select field..."
            className="w-40"
          />
        )}

        <div className="flex-1" />

        {/* Config button */}
        <button
          onClick={() => setShowConfig(!showConfig)}
          className={`text-gray-500 hover:text-gray-700 ${showConfig ? 'text-blue-500' : ''}`}
          title="Configure aggregation"
        >
          <Settings size={16} />
        </button>

        {/* Add sub-aggregation (only for bucket aggs) */}
        {canHaveSubAggs && (
          <button
            onClick={() => addAggregation(aggregation.id)}
            className="text-blue-500 hover:text-blue-700"
            title="Add sub-aggregation"
          >
            <Plus size={16} />
          </button>
        )}

        {/* Toggle */}
        <button
          onClick={() => toggleAggregation(aggregation.id)}
          className="text-gray-500 hover:text-gray-700"
          title={aggregation.enabled ? 'Disable' : 'Enable'}
        >
          {aggregation.enabled ? (
            <ToggleRight size={20} className="text-blue-500" />
          ) : (
            <ToggleLeft size={20} />
          )}
        </button>

        {/* Remove */}
        <button
          onClick={() => removeAggregation(aggregation.id)}
          className="text-gray-400 hover:text-red-500"
          title="Remove aggregation"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Configuration panel */}
      {showConfig && (
        <AggregationConfigPanel
          aggregation={aggregation}
          fields={fields}
          onClose={() => setShowConfig(false)}
        />
      )}

      {/* Sub-aggregations */}
      {isExpanded && hasSubAggs && (
        <div className="p-2 pl-4 space-y-2 bg-gray-50/50">
          {aggregation.subAggregations.map((subAgg) => (
            <AggregationRow
              key={subAgg.id}
              aggregation={subAgg}
              fields={fields}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};