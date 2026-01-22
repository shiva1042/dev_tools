import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, FolderPlus, Trash2 } from 'lucide-react';
import { Button } from '../Common';
import { FilterRow } from './FilterRow';
import { FilterGroupRow } from './FilterGroupRow';
import { useQueryStore } from '../../store/queryStore';
import type { Filter, FilterGroup, FieldMapping } from '../../types';

interface QueryBuilderPanelProps {
  fields: FieldMapping[];
  fieldSource?: string;
}

export const QueryBuilderPanel = ({ fields, fieldSource }: QueryBuilderPanelProps) => {
  const { filters, addFilter, addFilterGroup, moveFilter, resetFilters } = useQueryStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      moveFilter(String(active.id), String(over.id));
    }
  };

  const filterIds = filters.map((f) => f.id);

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Panel header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <h2 className="font-semibold text-gray-700">Query Builder</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addFilter()}
            title="Add filter"
          >
            <Plus size={16} className="mr-1" /> Filter
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addFilterGroup()}
            title="Add filter group"
          >
            <FolderPlus size={16} className="mr-1" /> Group
          </Button>
          {filters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-red-500 hover:text-red-700"
              title="Clear all filters"
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Filters list */}
      <div className="flex-1 overflow-y-auto p-3">
        {filters.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p className="text-sm mb-2">No filters added yet</p>
            <p className="text-xs">
              Click "Filter" or "Group" to start building your query
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filterIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {filters.map((item) =>
                  'children' in item && item.type === 'group' ? (
                    <FilterGroupRow
                      key={item.id}
                      group={item as FilterGroup}
                      fields={fields}
                    />
                  ) : (
                    <FilterRow
                      key={item.id}
                      filter={item as Filter}
                      fields={fields}
                    />
                  )
                )}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Panel footer with query info */}
      <div className="p-2 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span>{filters.length} filter(s)</span>
            <span className="text-gray-400">
              Drag to reorder | Toggle to enable/disable
            </span>
          </div>
          {fieldSource && (
            <div className={`text-xs ${fieldSource.includes('Demo') ? 'text-amber-600' : 'text-green-600'}`}>
              {fieldSource}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};