import { useMemo } from 'react';
import { TopBar } from './components/TopBar';
import { QueryBuilderPanel } from './components/QueryBuilder';
import { AggregationBuilderPanel } from './components/AggregationBuilder';
import { JsonPreviewPanel } from './components/JsonPreview';
import { ResultsPanel } from './components/Results';
import { useQueryStore } from './store/queryStore';
import type { FieldMapping } from './types';

// Demo fields shown when no index is selected
const DEMO_FIELDS: FieldMapping[] = [
  { name: 'mmsi', type: 'keyword', path: 'mmsi' },
  { name: 'timestamp', type: 'date', path: 'timestamp' },
  { name: 'latitude', type: 'float', path: 'latitude' },
  { name: 'longitude', type: 'float', path: 'longitude' },
  { name: 'speed', type: 'float', path: 'speed' },
  { name: 'heading', type: 'integer', path: 'heading' },
  { name: 'status', type: 'keyword', path: 'status' },
  { name: 'vessel_name', type: 'text', path: 'vessel_name' },
  { name: 'location', type: 'geo_point', path: 'location' },
];

function App() {
  const { selectedIndex, indexMappings } = useQueryStore();

  // Check if we have real fields from index
  const hasRealFields = selectedIndex && indexMappings[selectedIndex];

  // Get the fields for the selected index
  const fields: FieldMapping[] = useMemo(() => {
    if (!selectedIndex || !indexMappings[selectedIndex]) {
      return DEMO_FIELDS;
    }
    return indexMappings[selectedIndex].fields;
  }, [selectedIndex, indexMappings]);

  // Field source info for display
  const fieldSource = hasRealFields
    ? `Index: ${selectedIndex} (${fields.length} fields)`
    : 'Demo fields (connect to ES to load real fields)';

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Bar */}
      <TopBar />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Query Builder */}
        <div className="w-[400px] flex-shrink-0 overflow-hidden">
          <QueryBuilderPanel fields={fields} fieldSource={fieldSource} />
        </div>

        {/* Middle Panel: Aggregation Builder */}
        <div className="w-[400px] flex-shrink-0 overflow-hidden">
          <AggregationBuilderPanel fields={fields} fieldSource={fieldSource} />
        </div>

        {/* Right Panel: JSON Preview */}
        <div className="flex-1 min-w-[300px] overflow-hidden">
          <JsonPreviewPanel />
        </div>
      </div>

      {/* Bottom Panel: Query Results (optional) */}
      <div className="h-64 border-t border-gray-200 overflow-hidden">
        <ResultsPanel />
      </div>
    </div>
  );
}

export default App;