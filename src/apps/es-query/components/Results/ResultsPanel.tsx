import { useState } from 'react';
import { ChevronDown, ChevronRight, FileJson, Clock, Hash } from 'lucide-react';
import { useQueryStore } from '../../store/queryStore';

type ViewMode = 'hits' | 'aggregations' | 'raw';

export const ResultsPanel = () => {
  const { queryResult, isLoading } = useQueryStore();
  const [viewMode, setViewMode] = useState<ViewMode>('hits');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-gray-400">Running query...</div>
      </div>
    );
  }

  if (!queryResult) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center text-gray-400">
          <FileJson size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No query results yet</p>
          <p className="text-xs">Run a query to see results here</p>
        </div>
      </div>
    );
  }

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const tabs: Array<{ key: ViewMode; label: string; count?: number }> = [
    { key: 'hits', label: 'Hits', count: queryResult.hits?.hits?.length || 0 },
    {
      key: 'aggregations',
      label: 'Aggregations',
      count: queryResult.aggregations ? Object.keys(queryResult.aggregations).length : 0,
    },
    { key: 'raw', label: 'Raw JSON' },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Results header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-gray-700">Query Results</h3>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Hash size={12} />
              {queryResult.hits?.total?.value?.toLocaleString() || 0} total hits
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {queryResult.took}ms
            </span>
          </div>
        </div>

        {/* View mode tabs */}
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setViewMode(tab.key)}
              className={`px-3 py-1 text-xs rounded ${
                viewMode === tab.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && ` (${tab.count})`}
            </button>
          ))}
        </div>
      </div>

      {/* Results content */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'hits' && (
          <div className="divide-y divide-gray-100">
            {queryResult.hits?.hits?.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">No hits returned</div>
            ) : (
              queryResult.hits?.hits?.map((hit, index) => (
                <div key={hit._id || index} className="hover:bg-gray-50">
                  <div
                    className="flex items-center gap-2 px-4 py-2 cursor-pointer"
                    onClick={() => toggleRow(hit._id || String(index))}
                  >
                    {expandedRows.has(hit._id || String(index)) ? (
                      <ChevronDown size={14} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={14} className="text-gray-400" />
                    )}
                    <span className="text-xs text-gray-400 w-8">{index + 1}</span>
                    <span className="text-xs font-mono text-blue-600">{hit._id}</span>
                    <span className="text-xs text-gray-400">
                      score: {hit._score?.toFixed(2) || 'N/A'}
                    </span>
                    <span className="text-xs text-gray-500 truncate flex-1">
                      {JSON.stringify(hit._source).substring(0, 100)}...
                    </span>
                  </div>
                  {expandedRows.has(hit._id || String(index)) && (
                    <div className="px-8 pb-2">
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-48 font-mono">
                        {JSON.stringify(hit._source, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {viewMode === 'aggregations' && (
          <div className="p-4">
            {!queryResult.aggregations ? (
              <div className="text-center text-gray-400 text-sm">No aggregations in response</div>
            ) : (
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-full font-mono">
                {JSON.stringify(queryResult.aggregations, null, 2)}
              </pre>
            )}
          </div>
        )}

        {viewMode === 'raw' && (
          <div className="p-4">
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-full font-mono">
              {JSON.stringify(queryResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};