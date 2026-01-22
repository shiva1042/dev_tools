import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Plus,
  FolderPlus,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { Select } from '../Common';
import type { FilterGroup, BoolClauseType, FieldMapping, Filter } from '../../types';
import { useQueryStore } from '../../store/queryStore';
import { FilterRow } from './FilterRow';
import { v4 as uuidv4 } from 'uuid';

interface FilterGroupRowProps {
  group: FilterGroup;
  fields: FieldMapping[];
  depth?: number;
}

const boolClauseOptions = [
  { value: 'must', label: 'Must (AND)' },
  { value: 'should', label: 'Should (OR)' },
  { value: 'must_not', label: 'Must Not' },
  { value: 'filter', label: 'Filter' },
];

export const FilterGroupRow = ({ group, fields, depth = 0 }: FilterGroupRowProps) => {
  const { updateFilter, removeFilter, toggleFilter } = useQueryStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleBoolClauseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilter(group.id, { boolClause: e.target.value as BoolClauseType });
  };

  const addFilterToGroup = () => {
    const newFilter: Filter = {
      id: uuidv4(),
      field: '',
      operator: 'equals',
      value: '',
      boolClause: 'must',
      enabled: true,
    };
    updateFilter(group.id, {
      children: [...group.children, newFilter],
    } as Partial<FilterGroup>);
  };

  const addNestedGroup = () => {
    const newGroup: FilterGroup = {
      id: uuidv4(),
      type: 'group',
      boolClause: 'must',
      children: [],
      enabled: true,
    };
    updateFilter(group.id, {
      children: [...group.children, newGroup],
    } as Partial<FilterGroup>);
  };

  const borderColors = [
    'border-l-blue-500',
    'border-l-green-500',
    'border-l-purple-500',
    'border-l-orange-500',
  ];
  const borderColor = borderColors[depth % borderColors.length];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border-l-4 ${borderColor} bg-gray-50 rounded-lg shadow-sm ${
        !group.enabled ? 'opacity-50' : ''
      }`}
    >
      {/* Group header */}
      <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-t-lg border-b">
        <button
          className="cursor-grab text-gray-400 hover:text-gray-600"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        <span className="text-xs font-semibold text-gray-600 uppercase">Group</span>

        <Select
          options={boolClauseOptions}
          value={group.boolClause}
          onChange={handleBoolClauseChange}
          className="w-32"
        />

        <span className="text-xs text-gray-400">
          ({group.children.length} item{group.children.length !== 1 ? 's' : ''})
        </span>

        <div className="flex-1" />

        <button
          onClick={addFilterToGroup}
          className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-xs"
          title="Add filter to group"
        >
          <Plus size={14} /> Filter
        </button>

        <button
          onClick={addNestedGroup}
          className="text-green-500 hover:text-green-700 flex items-center gap-1 text-xs"
          title="Add nested group"
        >
          <FolderPlus size={14} /> Group
        </button>

        <button
          onClick={() => toggleFilter(group.id)}
          className="text-gray-500 hover:text-gray-700"
          title={group.enabled ? 'Disable group' : 'Enable group'}
        >
          {group.enabled ? (
            <ToggleRight size={20} className="text-blue-500" />
          ) : (
            <ToggleLeft size={20} />
          )}
        </button>

        <button
          onClick={() => removeFilter(group.id)}
          className="text-gray-400 hover:text-red-500"
          title="Remove group"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Group children */}
      {isExpanded && (
        <div className="p-2 space-y-2">
          {group.children.length === 0 ? (
            <div className="text-xs text-gray-400 italic text-center py-2">
              No filters in this group. Add a filter or nested group.
            </div>
          ) : (
            group.children.map((child) =>
              'children' in child && child.type === 'group' ? (
                <FilterGroupRow
                  key={child.id}
                  group={child}
                  fields={fields}
                  depth={depth + 1}
                />
              ) : (
                <FilterRow
                  key={child.id}
                  filter={child as Filter}
                  fields={fields}
                />
              )
            )
          )}
        </div>
      )}
    </div>
  );
};