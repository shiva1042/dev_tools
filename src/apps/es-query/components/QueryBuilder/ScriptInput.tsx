import type { ScriptQuery } from '../../types';

interface ScriptInputProps {
  value: ScriptQuery;
  onChange: (value: ScriptQuery) => void;
}

export const ScriptInput = ({ value, onChange }: ScriptInputProps) => {
  return (
    <div className="flex flex-col gap-2 p-2 bg-gray-50 rounded border">
      <div className="text-xs font-medium text-gray-500">Script Query</div>
      <textarea
        placeholder="Enter Painless script... e.g., doc['field'].value > 10"
        value={value.source || ''}
        onChange={(e) => onChange({ ...value, source: e.target.value })}
        className="w-full h-20 px-2 py-1.5 text-sm font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
      />
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Params (JSON):</span>
        <input
          placeholder='{"key": "value"}'
          value={value.params ? JSON.stringify(value.params) : ''}
          onChange={(e) => {
            try {
              const params = e.target.value ? JSON.parse(e.target.value) : {};
              onChange({ ...value, params });
            } catch {
              // Invalid JSON, keep current value
            }
          }}
          className="flex-1 px-2 py-1 text-xs font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};