import { X, Plus, Trash2 } from 'lucide-react';
import { Input, Select, Button } from '../Common';
import type {
  Aggregation,
  FieldMapping,
  TermsAggConfig,
  DateHistogramAggConfig,
  GeoHashGridAggConfig,
  GeoTileGridAggConfig,
  CardinalityAggConfig,
  TopHitsAggConfig,
  BucketScriptAggConfig,
  BucketSelectorAggConfig,
  CompositeAggConfig,
  CompositeSource,
} from '../../types';
import { useQueryStore } from '../../store/queryStore';

interface AggregationConfigPanelProps {
  aggregation: Aggregation;
  fields: FieldMapping[];
  onClose: () => void;
}

export const AggregationConfigPanel = ({
  aggregation,
  fields,
  onClose,
}: AggregationConfigPanelProps) => {
  const { updateAggregationConfig } = useQueryStore();

  const fieldOptions = fields.map((f) => ({
    value: f.path || f.name,
    label: `${f.name} (${f.type})`,
  }));

  const sortOrderOptions = [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' },
  ];

  const intervalOptions = [
    { value: 'minute', label: 'Minute' },
    { value: 'hour', label: 'Hour' },
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'quarter', label: 'Quarter' },
    { value: 'year', label: 'Year' },
  ];

  const renderConfig = () => {
    switch (aggregation.type) {
      case 'terms': {
        const config = aggregation.config as TermsAggConfig;
        return (
          <div className="space-y-3">
            <Input
              label="Size"
              type="number"
              value={config.size || 10}
              onChange={(e) =>
                updateAggregationConfig(aggregation.id, { size: parseInt(e.target.value) || 10 })
              }
            />
            <Select
              label="Order By"
              options={[
                { value: '_count', label: 'Count' },
                { value: '_key', label: 'Key' },
                ...fieldOptions,
              ]}
              value={config.order?.field || '_count'}
              onChange={(e) =>
                updateAggregationConfig(aggregation.id, {
                  order: { field: e.target.value, order: config.order?.order || 'desc' },
                })
              }
            />
            <Select
              label="Sort Order"
              options={sortOrderOptions}
              value={config.order?.order || 'desc'}
              onChange={(e) =>
                updateAggregationConfig(aggregation.id, {
                  order: {
                    field: config.order?.field || '_count',
                    order: e.target.value as 'asc' | 'desc',
                  },
                })
              }
            />
            <Input
              label="Missing Value"
              placeholder="Value for missing docs"
              value={config.missing?.toString() || ''}
              onChange={(e) =>
                updateAggregationConfig(aggregation.id, { missing: e.target.value || undefined })
              }
            />
          </div>
        );
      }

      case 'date_histogram': {
        const config = aggregation.config as DateHistogramAggConfig;
        return (
          <div className="space-y-3">
            <Select
              label="Calendar Interval"
              options={intervalOptions}
              value={config.calendar_interval || 'day'}
              onChange={(e) =>
                updateAggregationConfig(aggregation.id, { calendar_interval: e.target.value })
              }
            />
            <Input
              label="Fixed Interval (optional)"
              placeholder="e.g., 30m, 1h, 7d"
              value={config.fixed_interval || ''}
              onChange={(e) =>
                updateAggregationConfig(aggregation.id, {
                  fixed_interval: e.target.value || undefined,
                })
              }
            />
            <Input
              label="Format"
              placeholder="e.g., yyyy-MM-dd"
              value={config.format || ''}
              onChange={(e) =>
                updateAggregationConfig(aggregation.id, { format: e.target.value || undefined })
              }
            />
            <Input
              label="Time Zone"
              placeholder="e.g., UTC, America/New_York"
              value={config.time_zone || ''}
              onChange={(e) =>
                updateAggregationConfig(aggregation.id, { time_zone: e.target.value || undefined })
              }
            />
            <Input
              label="Min Doc Count"
              type="number"
              value={config.min_doc_count ?? ''}
              onChange={(e) =>
                updateAggregationConfig(aggregation.id, {
                  min_doc_count: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
            />
          </div>
        );
      }

      case 'geohash_grid': {
        const config = aggregation.config as GeoHashGridAggConfig;
        return (
          <div className="space-y-3">
            <Input
              label="Precision (1-12)"
              type="number"
              min={1}
              max={12}
              value={config.precision || 5}
              onChange={(e) =>
                updateAggregationConfig(aggregation.id, {
                  precision: Math.min(12, Math.max(1, parseInt(e.target.value) || 5)),
                })
              }
            />
          </div>
        );
      }

      case 'geotile_grid': {
        const config = aggregation.config as GeoTileGridAggConfig;
        return (
          <div className="space-y-3">
            <Input
              label="Precision (0-29)"
              type="number"
              min={0}
              max={29}
              value={config.precision || 7}
              onChange={(e) =>
                updateAggregationConfig(aggregation.id, {
                  precision: Math.min(29, Math.max(0, parseInt(e.target.value) || 7)),
                })
              }
            />
          </div>
        );
      }

      case 'cardinality': {
        const config = aggregation.config as CardinalityAggConfig;
        return (
          <div className="space-y-3">
            <Input
              label="Precision Threshold"
              type="number"
              placeholder="Default: 3000"
              value={config.precision_threshold || ''}
              onChange={(e) =>
                updateAggregationConfig(aggregation.id, {
                  precision_threshold: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
            />
          </div>
        );
      }

      case 'top_hits': {
        const config = aggregation.config as TopHitsAggConfig;
        return (
          <div className="space-y-3">
            <Input
              label="Size"
              type="number"
              value={config.size || 1}
              onChange={(e) =>
                updateAggregationConfig(aggregation.id, { size: parseInt(e.target.value) || 1 })
              }
            />
            <Select
              label="Sort Field"
              options={[{ value: '', label: '-- None --' }, ...fieldOptions]}
              value={config.sort?.[0]?.field || ''}
              onChange={(e) =>
                updateAggregationConfig(aggregation.id, {
                  sort: e.target.value
                    ? [{ field: e.target.value, order: config.sort?.[0]?.order || 'desc' }]
                    : undefined,
                })
              }
            />
            {config.sort?.[0]?.field && (
              <Select
                label="Sort Order"
                options={sortOrderOptions}
                value={config.sort?.[0]?.order || 'desc'}
                onChange={(e) =>
                  updateAggregationConfig(aggregation.id, {
                    sort: [
                      { field: config.sort![0].field, order: e.target.value as 'asc' | 'desc' },
                    ],
                  })
                }
              />
            )}
            <Input
              label="Source Fields (comma-separated)"
              placeholder="field1, field2 or leave empty for all"
              value={Array.isArray(config._source) ? config._source.join(', ') : ''}
              onChange={(e) =>
                updateAggregationConfig(aggregation.id, {
                  _source: e.target.value
                    ? e.target.value.split(',').map((s) => s.trim())
                    : undefined,
                })
              }
            />
          </div>
        );
      }

      case 'bucket_script':
      case 'bucket_selector': {
        const config = aggregation.config as BucketScriptAggConfig | BucketSelectorAggConfig;
        const paths = Object.entries(config.buckets_path || {});

        const addPath = () => {
          const newPaths = { ...config.buckets_path, [`var${paths.length + 1}`]: '' };
          updateAggregationConfig(aggregation.id, { buckets_path: newPaths });
        };

        const removePath = (key: string) => {
          const newPaths = { ...config.buckets_path };
          delete newPaths[key];
          updateAggregationConfig(aggregation.id, { buckets_path: newPaths });
        };

        const updatePath = (oldKey: string, newKey: string, value: string) => {
          const newPaths: Record<string, string> = {};
          for (const [k, v] of Object.entries(config.buckets_path)) {
            if (k === oldKey) {
              newPaths[newKey] = value;
            } else {
              newPaths[k] = v;
            }
          }
          updateAggregationConfig(aggregation.id, { buckets_path: newPaths });
        };

        return (
          <div className="space-y-3">
            <div className="text-xs font-medium text-gray-600">Buckets Path</div>
            {paths.map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <Input
                  placeholder="Variable name"
                  value={key}
                  onChange={(e) => updatePath(key, e.target.value, value)}
                  className="w-28"
                />
                <span className="text-gray-400">=</span>
                <Input
                  placeholder="Path (e.g., agg_name>metric)"
                  value={value}
                  onChange={(e) => updatePath(key, key, e.target.value)}
                  className="flex-1"
                />
                <button onClick={() => removePath(key)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={addPath}>
              <Plus size={14} className="mr-1" /> Add Path
            </Button>
            <div className="text-xs font-medium text-gray-600 mt-2">Script</div>
            <textarea
              placeholder="params.var1 / params.var2 * 100"
              value={config.script || ''}
              onChange={(e) => updateAggregationConfig(aggregation.id, { script: e.target.value })}
              className="w-full h-20 px-2 py-1.5 text-sm font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );
      }

      case 'composite': {
        const config = aggregation.config as CompositeAggConfig;
        const sources = config.sources || [];

        const addSource = () => {
          const newSource: CompositeSource = {
            name: `source_${sources.length + 1}`,
            type: 'terms',
            field: '',
          };
          updateAggregationConfig(aggregation.id, { sources: [...sources, newSource] });
        };

        const removeSource = (index: number) => {
          updateAggregationConfig(aggregation.id, {
            sources: sources.filter((_, i) => i !== index),
          });
        };

        const updateSource = (index: number, updates: Partial<CompositeSource>) => {
          const newSources = [...sources];
          newSources[index] = { ...newSources[index], ...updates };
          updateAggregationConfig(aggregation.id, { sources: newSources });
        };

        return (
          <div className="space-y-3">
            <Input
              label="Size"
              type="number"
              value={config.size || 10}
              onChange={(e) =>
                updateAggregationConfig(aggregation.id, { size: parseInt(e.target.value) || 10 })
              }
            />
            <div className="text-xs font-medium text-gray-600">Sources</div>
            {sources.map((source, index) => (
              <div key={index} className="p-2 bg-gray-100 rounded space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Source name"
                    value={source.name}
                    onChange={(e) => updateSource(index, { name: e.target.value })}
                    className="w-28"
                  />
                  <Select
                    options={[
                      { value: 'terms', label: 'Terms' },
                      { value: 'date_histogram', label: 'Date Histogram' },
                      { value: 'geotile_grid', label: 'Geotile Grid' },
                    ]}
                    value={source.type}
                    onChange={(e) =>
                      updateSource(index, { type: e.target.value as CompositeSource['type'] })
                    }
                    className="w-32"
                  />
                  <Select
                    options={fieldOptions}
                    value={source.field}
                    onChange={(e) => updateSource(index, { field: e.target.value })}
                    placeholder="Field..."
                    className="flex-1"
                  />
                  <button
                    onClick={() => removeSource(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {source.type === 'date_histogram' && (
                  <Select
                    label="Interval"
                    options={intervalOptions}
                    value={source.calendar_interval || 'day'}
                    onChange={(e) => updateSource(index, { calendar_interval: e.target.value })}
                    className="w-32"
                  />
                )}
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={addSource}>
              <Plus size={14} className="mr-1" /> Add Source
            </Button>
          </div>
        );
      }

      default:
        return (
          <div className="text-sm text-gray-500 italic">
            No additional configuration available for this aggregation type.
          </div>
        );
    }
  };

  return (
    <div className="p-3 border-b bg-blue-50/50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">Configuration</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>
      {renderConfig()}
    </div>
  );
};