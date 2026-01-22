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
  arrayMove,
} from '@dnd-kit/sortable';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { Button, Select } from '../Common';
import { AggregationRow } from './AggregationRow';
import { AnalyticsPresets } from './AnalyticsPresets';
import { useQueryStore } from '../../store/queryStore';
import type { FieldMapping, AggregationType } from '../../types';
import { useState } from 'react';

interface AggregationBuilderPanelProps {
  fields: FieldMapping[];
  fieldSource?: string;
}

const quickAddOptions = [
  { value: '', label: '-- Quick Add --' },
  { value: 'terms', label: 'Terms (Bucket)' },
  { value: 'date_histogram', label: 'Date Histogram' },
  { value: 'cardinality', label: 'Cardinality' },
  { value: 'avg', label: 'Average' },
  { value: 'sum', label: 'Sum' },
  { value: 'top_hits', label: 'Top Hits' },
  { value: 'composite', label: 'Composite' },
];

export const AggregationBuilderPanel = ({ fields, fieldSource }: AggregationBuilderPanelProps) => {
  const { aggregations, addAggregation, reorderAggregations, resetAggregations } = useQueryStore();
  const [showAnalytics, setShowAnalytics] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = aggregations.findIndex((a) => a.id === active.id);
      const newIndex = aggregations.findIndex((a) => a.id === over.id);
      reorderAggregations(arrayMove(aggregations, oldIndex, newIndex));
    }
  };

  const handleQuickAdd = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as AggregationType;
    if (type) {
      addAggregation(undefined, { type });
      e.target.value = '';
    }
  };

  const aggIds = aggregations.map((a) => a.id);

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Panel header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <h2 className="font-semibold text-gray-700">Aggregations</h2>
        <div className="flex items-center gap-2">
          <Select
            options={quickAddOptions}
            value=""
            onChange={handleQuickAdd}
            className="w-40"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addAggregation()}
            title="Add aggregation"
          >
            <Plus size={16} />
          </Button>
          <Button
            variant={showAnalytics ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setShowAnalytics(!showAnalytics)}
            title="Analytics Presets"
          >
            <Sparkles size={16} />
          </Button>
          {aggregations.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAggregations}
              className="text-red-500 hover:text-red-700"
              title="Clear all aggregations"
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Analytics presets panel */}
      {showAnalytics && (
        <AnalyticsPresets fields={fields} onClose={() => setShowAnalytics(false)} />
      )}

      {/* Aggregations list */}
      <div className="flex-1 overflow-y-auto p-3">
        {aggregations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p className="text-sm mb-2">No aggregations added yet</p>
            <p className="text-xs text-center">
              Use Quick Add dropdown or click + to add aggregations.
              <br />
              Click the sparkle icon for analytics presets.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={aggIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {aggregations.map((agg) => (
                  <AggregationRow key={agg.id} aggregation={agg} fields={fields} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Panel footer */}
      <div className="p-2 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span>{aggregations.length} aggregation(s)</span>
            <span className="text-gray-400">Click + on bucket aggs for sub-aggs</span>
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