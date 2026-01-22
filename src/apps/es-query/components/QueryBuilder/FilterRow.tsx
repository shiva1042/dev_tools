import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Select, Input } from '../Common';
import type { Filter, FilterOperator, BoolClauseType, FieldMapping, GeoBoundingBox, GeoDistance, GeoPolygon } from '../../types';
import { useQueryStore } from '../../store/queryStore';
import { RangeInput } from './RangeInput';
import { GeoInput } from './GeoInput';
import { ScriptInput } from './ScriptInput';

interface FilterRowProps {
  filter: Filter;
  fields: FieldMapping[];
}

const operatorOptions = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'in', label: 'In (Array)' },
  { value: 'exists', label: 'Exists' },
  { value: 'range', label: 'Range' },
  { value: 'match', label: 'Match (Full Text)' },
  { value: 'wildcard', label: 'Wildcard' },
  { value: 'regex', label: 'Regex' },
  { value: 'geo_bounding_box', label: 'Geo Bounding Box' },
  { value: 'geo_distance', label: 'Geo Distance' },
  { value: 'geo_polygon', label: 'Geo Polygon' },
  { value: 'script', label: 'Script Query' },
];

const boolClauseOptions = [
  { value: 'must', label: 'Must' },
  { value: 'should', label: 'Should' },
  { value: 'must_not', label: 'Must Not' },
  { value: 'filter', label: 'Filter' },
];

export const FilterRow = ({ filter, fields }: FilterRowProps) => {
  const { updateFilter, removeFilter, toggleFilter } = useQueryStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: filter.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const fieldOptions = fields.map((f) => ({
    value: f.path || f.name,
    label: `${f.name} (${f.type})`,
  }));

  const handleFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilter(filter.id, { field: e.target.value });
  };

  const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newOperator = e.target.value as FilterOperator;
    let newValue: Filter['value'] = '';

    // Reset value based on operator type
    switch (newOperator) {
      case 'range':
        newValue = { gte: '', lte: '' };
        break;
      case 'in':
        newValue = [];
        break;
      case 'geo_bounding_box':
        newValue = {
          top_left: { lat: 0, lon: 0 },
          bottom_right: { lat: 0, lon: 0 },
        };
        break;
      case 'geo_distance':
        newValue = { distance: '10km', location: { lat: 0, lon: 0 } };
        break;
      case 'geo_polygon':
        newValue = { points: [] };
        break;
      case 'script':
        newValue = { source: '', params: {} };
        break;
      default:
        newValue = '';
    }

    updateFilter(filter.id, { operator: newOperator, value: newValue });
  };

  const handleBoolClauseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilter(filter.id, { boolClause: e.target.value as BoolClauseType });
  };

  const handleValueChange = (value: Filter['value']) => {
    updateFilter(filter.id, { value });
  };

  const renderValueInput = () => {
    switch (filter.operator) {
      case 'exists':
        return null;

      case 'range':
        return (
          <RangeInput
            value={filter.value as { gte?: string | number; lte?: string | number }}
            onChange={handleValueChange}
          />
        );

      case 'in':
        return (
          <Input
            placeholder="value1, value2, value3"
            value={Array.isArray(filter.value) ? filter.value.join(', ') : ''}
            onChange={(e) =>
              handleValueChange(
                e.target.value.split(',').map((v) => v.trim()).filter(Boolean)
              )
            }
            className="flex-1"
          />
        );

      case 'geo_bounding_box':
      case 'geo_distance':
      case 'geo_polygon':
        return (
          <GeoInput
            type={filter.operator}
            value={filter.value as GeoBoundingBox | GeoDistance | GeoPolygon}
            onChange={handleValueChange}
          />
        );

      case 'script':
        return (
          <ScriptInput
            value={filter.value as { source: string; params?: Record<string, unknown> }}
            onChange={handleValueChange}
          />
        );

      default:
        return (
          <Input
            placeholder="Enter value..."
            value={String(filter.value || '')}
            onChange={(e) => handleValueChange(e.target.value)}
            className="flex-1"
          />
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 bg-white border rounded-lg shadow-sm ${
        !filter.enabled ? 'opacity-50' : ''
      }`}
    >
      {/* Drag handle */}
      <button
        className="cursor-grab text-gray-400 hover:text-gray-600"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>

      {/* Bool clause selector */}
      <Select
        options={boolClauseOptions}
        value={filter.boolClause}
        onChange={handleBoolClauseChange}
        className="w-24"
      />

      {/* Field selector */}
      <Select
        options={fieldOptions}
        value={filter.field}
        onChange={handleFieldChange}
        placeholder="Select field..."
        className="w-40"
      />

      {/* Operator selector */}
      <Select
        options={operatorOptions}
        value={filter.operator}
        onChange={handleOperatorChange}
        className="w-36"
      />

      {/* Value input - varies based on operator */}
      <div className="flex-1">{renderValueInput()}</div>

      {/* Toggle enabled/disabled */}
      <button
        onClick={() => toggleFilter(filter.id)}
        className="text-gray-500 hover:text-gray-700"
        title={filter.enabled ? 'Disable filter' : 'Enable filter'}
      >
        {filter.enabled ? (
          <ToggleRight size={20} className="text-blue-500" />
        ) : (
          <ToggleLeft size={20} />
        )}
      </button>

      {/* Remove filter */}
      <button
        onClick={() => removeFilter(filter.id)}
        className="text-gray-400 hover:text-red-500"
        title="Remove filter"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};