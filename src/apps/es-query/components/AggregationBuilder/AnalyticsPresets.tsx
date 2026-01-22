import { X, ToggleLeft, ToggleRight } from 'lucide-react';
import { Input, Select } from '../Common';
import { useQueryStore } from '../../store/queryStore';
import type { FieldMapping, AnalyticsPreset } from '../../types';

interface AnalyticsPresetsProps {
  fields: FieldMapping[];
  onClose: () => void;
}

const presets: Array<{
  key: AnalyticsPreset;
  name: string;
  description: string;
  requiresField?: boolean;
  requiresSize?: boolean;
  requiresInterval?: boolean;
}> = [
  {
    key: 'unique_mmsi',
    name: 'Unique MMSI Count',
    description: 'Count unique values using cardinality aggregation',
    requiresField: true,
  },
  {
    key: 'first_record_per_mmsi',
    name: 'First Record per MMSI',
    description: 'Get the earliest record for each unique value using composite + top_hits',
    requiresField: true,
    requiresSize: true,
  },
  {
    key: 'latest_record_per_mmsi',
    name: 'Latest Record per MMSI',
    description: 'Get the most recent record for each unique value using composite + top_hits',
    requiresField: true,
    requiresSize: true,
  },
  {
    key: 'deduplicate_by_field',
    name: 'Deduplicate by Field',
    description: 'Remove duplicate results using field collapsing',
    requiresField: true,
  },
  {
    key: 'time_sampling',
    name: 'Time-based Sampling',
    description: 'Sample data using date_histogram aggregation',
    requiresInterval: true,
  },
  {
    key: 'limit_buckets',
    name: 'Limit Bucket Count',
    description: 'Set track_total_hits to limit bucket counting',
    requiresSize: true,
  },
  {
    key: 'skip_duplicates',
    name: 'Skip Duplicate Keys',
    description: 'Use field collapsing with inner_hits to skip duplicates',
    requiresField: true,
  },
];

export const AnalyticsPresets = ({ fields, onClose }: AnalyticsPresetsProps) => {
  const { analytics, toggleAnalytics, updateAnalyticsConfig } = useQueryStore();

  const fieldOptions = fields.map((f) => ({
    value: f.path || f.name,
    label: `${f.name} (${f.type})`,
  }));

  const getPresetConfig = (key: AnalyticsPreset) => {
    return analytics.find((a) => a.preset === key);
  };

  return (
    <div className="border-b border-gray-200 bg-amber-50/50">
      <div className="flex items-center justify-between p-3 border-b border-amber-200">
        <span className="font-medium text-gray-700">Analytics Presets</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>
      <div className="p-3 space-y-3 max-h-64 overflow-y-auto">
        {presets.map((preset) => {
          const config = getPresetConfig(preset.key);
          const isEnabled = config?.enabled ?? false;

          return (
            <div
              key={preset.key}
              className={`p-2 rounded border ${
                isEnabled ? 'bg-white border-amber-300' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700">{preset.name}</div>
                  <div className="text-xs text-gray-500">{preset.description}</div>
                </div>
                <button
                  onClick={() => toggleAnalytics(preset.key)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {isEnabled ? (
                    <ToggleRight size={24} className="text-amber-500" />
                  ) : (
                    <ToggleLeft size={24} />
                  )}
                </button>
              </div>

              {isEnabled && (
                <div className="mt-2 pt-2 border-t border-gray-200 flex flex-wrap gap-2">
                  {preset.requiresField && (
                    <Select
                      options={fieldOptions}
                      value={config?.field || ''}
                      onChange={(e) =>
                        updateAnalyticsConfig(preset.key, { field: e.target.value })
                      }
                      placeholder="Select field..."
                      className="w-40"
                    />
                  )}
                  {preset.requiresSize && (
                    <Input
                      type="number"
                      placeholder="Size"
                      value={config?.size || ''}
                      onChange={(e) =>
                        updateAnalyticsConfig(preset.key, {
                          size: parseInt(e.target.value) || undefined,
                        })
                      }
                      className="w-24"
                    />
                  )}
                  {preset.requiresInterval && (
                    <Select
                      options={[
                        { value: '1m', label: '1 minute' },
                        { value: '5m', label: '5 minutes' },
                        { value: '15m', label: '15 minutes' },
                        { value: '1h', label: '1 hour' },
                        { value: '6h', label: '6 hours' },
                        { value: '1d', label: '1 day' },
                      ]}
                      value={config?.interval || '1h'}
                      onChange={(e) =>
                        updateAnalyticsConfig(preset.key, { interval: e.target.value })
                      }
                      className="w-32"
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};