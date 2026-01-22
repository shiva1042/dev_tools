import { useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import '@/utils/monacoConfig'; // Enable offline Monaco support
import { Copy, Check, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '../Common';
import { useQueryStore } from '../../store/queryStore';
import {
  buildElasticsearchQuery,
  validateQuery,
  prettifyQuery,
} from '../../engine/QueryBuilderEngine';

export const JsonPreviewPanel = () => {
  const { filters, aggregations, analytics, querySize, from, trackTotalHits } = useQueryStore();
  const [copied, setCopied] = useState(false);

  // Build the ES query from current state
  const { query, validation } = useMemo(() => {
    const input = {
      filters,
      aggregations,
      analytics,
      size: querySize,
      from,
      trackTotalHits,
    };

    const validation = validateQuery(input);
    const query = buildElasticsearchQuery(input);

    return { query, validation };
  }, [filters, aggregations, analytics, querySize, from, trackTotalHits]);

  const jsonString = useMemo(() => prettifyQuery(query), [query]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Panel header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-gray-700">Query Preview</h2>
          {validation.valid ? (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle size={14} /> Valid
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-red-600">
              <AlertTriangle size={14} /> {validation.errors.length} error(s)
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          {copied ? (
            <>
              <Check size={16} className="mr-1 text-green-500" /> Copied
            </>
          ) : (
            <>
              <Copy size={16} className="mr-1" /> Copy
            </>
          )}
        </Button>
      </div>

      {/* Validation messages */}
      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="p-2 border-b border-gray-200 bg-gray-50 space-y-1 max-h-32 overflow-y-auto">
          {validation.errors.map((error, i) => (
            <div key={`error-${i}`} className="text-xs text-red-600 flex items-start gap-1">
              <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
              {error}
            </div>
          ))}
          {validation.warnings.map((warning, i) => (
            <div key={`warning-${i}`} className="text-xs text-amber-600 flex items-start gap-1">
              <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
              {warning}
            </div>
          ))}
        </div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language="json"
          value={jsonString}
          theme="vs-light"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            folding: true,
            renderLineHighlight: 'none',
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
            },
          }}
        />
      </div>

      {/* Panel footer */}
      <div className="p-2 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 flex items-center justify-between">
          <span>
            {jsonString.split('\n').length} lines | {jsonString.length} chars
          </span>
          <span className="text-gray-400">Read-only preview</span>
        </div>
      </div>
    </div>
  );
};