import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Database, Plus, Trash2 } from 'lucide-react';

type QueryType = 'find' | 'aggregate' | 'insert' | 'update' | 'delete';
type Operator = '$eq' | '$ne' | '$gt' | '$gte' | '$lt' | '$lte' | '$in' | '$nin' | '$regex' | '$exists';

interface Filter {
  id: string;
  field: string;
  operator: Operator;
  value: string;
  valueType: 'string' | 'number' | 'boolean' | 'array' | 'objectId' | 'date';
}

interface Projection {
  field: string;
  include: boolean;
}

interface Sort {
  field: string;
  order: 1 | -1;
}

interface AggregationStage {
  id: string;
  type: '$match' | '$project' | '$group' | '$sort' | '$limit' | '$skip' | '$lookup' | '$unwind';
  config: string;
}

export default function MongoDBBuilder() {
  const [collection, setCollection] = useState('users');
  const [queryType, setQueryType] = useState<QueryType>('find');
  const [filters, setFilters] = useState<Filter[]>([
    { id: '1', field: 'status', operator: '$eq', value: 'active', valueType: 'string' },
  ]);
  const [projections, setProjections] = useState<Projection[]>([]);
  const [sorts, setSorts] = useState<Sort[]>([]);
  const [limit, setLimit] = useState<number>(10);
  const [skip, setSkip] = useState<number>(0);
  const [aggregationStages, setAggregationStages] = useState<AggregationStage[]>([]);
  const [copied, setCopied] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const formatValue = (value: string, valueType: string): string => {
    switch (valueType) {
      case 'number':
        return value;
      case 'boolean':
        return value;
      case 'array':
        return value.startsWith('[') ? value : `[${value}]`;
      case 'objectId':
        return `ObjectId("${value}")`;
      case 'date':
        return `ISODate("${value}")`;
      default:
        return `"${value}"`;
    }
  };

  const generateQuery = (): string => {
    let query = `db.${collection}`;

    if (queryType === 'find') {
      // Build filter object
      const filterObj: Record<string, any> = {};
      filters.forEach((f) => {
        if (f.operator === '$eq') {
          filterObj[f.field] = formatValue(f.value, f.valueType);
        } else {
          filterObj[f.field] = `{ ${f.operator}: ${formatValue(f.value, f.valueType)} }`;
        }
      });

      // Build projection object
      const projObj: Record<string, number> = {};
      projections.forEach((p) => {
        projObj[p.field] = p.include ? 1 : 0;
      });

      query += `.find(`;
      query += filters.length > 0 ? `{\n  ${Object.entries(filterObj).map(([k, v]) => `${k}: ${v}`).join(',\n  ')}\n}` : '{}';

      if (projections.length > 0) {
        query += `, {\n  ${Object.entries(projObj).map(([k, v]) => `${k}: ${v}`).join(',\n  ')}\n}`;
      }
      query += ')';

      if (sorts.length > 0) {
        const sortObj = sorts.map((s) => `${s.field}: ${s.order}`).join(', ');
        query += `.sort({ ${sortObj} })`;
      }

      if (skip > 0) {
        query += `.skip(${skip})`;
      }

      if (limit > 0) {
        query += `.limit(${limit})`;
      }
    } else if (queryType === 'aggregate') {
      const stages = aggregationStages.map((stage) => {
        return `  { ${stage.type}: ${stage.config || '{}'} }`;
      });
      query += `.aggregate([\n${stages.join(',\n')}\n])`;
    } else if (queryType === 'insert') {
      query += `.insertOne({\n  // document fields\n})`;
    } else if (queryType === 'update') {
      const filterObj = filters.map((f) => {
        if (f.operator === '$eq') {
          return `${f.field}: ${formatValue(f.value, f.valueType)}`;
        }
        return `${f.field}: { ${f.operator}: ${formatValue(f.value, f.valueType)} }`;
      }).join(',\n  ');

      query += `.updateMany(\n  { ${filterObj} },\n  {\n    $set: {\n      // fields to update\n    }\n  }\n)`;
    } else if (queryType === 'delete') {
      const filterObj = filters.map((f) => {
        if (f.operator === '$eq') {
          return `${f.field}: ${formatValue(f.value, f.valueType)}`;
        }
        return `${f.field}: { ${f.operator}: ${formatValue(f.value, f.valueType)} }`;
      }).join(',\n  ');

      query += `.deleteMany({ ${filterObj} })`;
    }

    return query;
  };

  const addFilter = () => {
    setFilters([
      ...filters,
      { id: generateId(), field: '', operator: '$eq', value: '', valueType: 'string' },
    ]);
  };

  const updateFilter = (id: string, updates: Partial<Filter>) => {
    setFilters(filters.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
  };

  const addAggregationStage = (type: AggregationStage['type']) => {
    const defaultConfigs: Record<string, string> = {
      '$match': '{ status: "active" }',
      '$project': '{ name: 1, email: 1 }',
      '$group': '{ _id: "$category", count: { $sum: 1 } }',
      '$sort': '{ createdAt: -1 }',
      '$limit': '10',
      '$skip': '0',
      '$lookup': '{\n    from: "orders",\n    localField: "_id",\n    foreignField: "userId",\n    as: "orders"\n  }',
      '$unwind': '"$tags"',
    };
    setAggregationStages([
      ...aggregationStages,
      { id: generateId(), type, config: defaultConfigs[type] || '{}' },
    ]);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generateQuery());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const operators: { value: Operator; label: string }[] = [
    { value: '$eq', label: '= (equals)' },
    { value: '$ne', label: '!= (not equals)' },
    { value: '$gt', label: '> (greater than)' },
    { value: '$gte', label: '>= (greater or equal)' },
    { value: '$lt', label: '< (less than)' },
    { value: '$lte', label: '<= (less or equal)' },
    { value: '$in', label: 'in (array)' },
    { value: '$nin', label: 'not in (array)' },
    { value: '$regex', label: 'regex' },
    { value: '$exists', label: 'exists' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Database className="w-6 h-6 text-green-400" />
              MongoDB Query Builder
            </h1>
            <p className="text-gray-400 text-sm">Build MongoDB queries and aggregations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Builder */}
          <div className="space-y-4">
            {/* Collection & Type */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Collection</label>
                  <input
                    type="text"
                    value={collection}
                    onChange={(e) => setCollection(e.target.value)}
                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Operation</label>
                  <select
                    value={queryType}
                    onChange={(e) => setQueryType(e.target.value as QueryType)}
                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                  >
                    <option value="find">find()</option>
                    <option value="aggregate">aggregate()</option>
                    <option value="insert">insertOne()</option>
                    <option value="update">updateMany()</option>
                    <option value="delete">deleteMany()</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Filters (for find, update, delete) */}
            {['find', 'update', 'delete'].includes(queryType) && (
              <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-300">Filters</h3>
                  <button
                    onClick={addFilter}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs"
                  >
                    <Plus className="w-3 h-3" /> Add Filter
                  </button>
                </div>
                <div className="space-y-2">
                  {filters.map((filter) => (
                    <div key={filter.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={filter.field}
                        onChange={(e) => updateFilter(filter.id, { field: e.target.value })}
                        placeholder="Field"
                        className="w-24 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm"
                      />
                      <select
                        value={filter.operator}
                        onChange={(e) => updateFilter(filter.id, { operator: e.target.value as Operator })}
                        className="px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm"
                      >
                        {operators.map((op) => (
                          <option key={op.value} value={op.value}>{op.label}</option>
                        ))}
                      </select>
                      <select
                        value={filter.valueType}
                        onChange={(e) => updateFilter(filter.id, { valueType: e.target.value as Filter['valueType'] })}
                        className="px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm"
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="array">Array</option>
                        <option value="objectId">ObjectId</option>
                        <option value="date">Date</option>
                      </select>
                      <input
                        type="text"
                        value={filter.value}
                        onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                        placeholder="Value"
                        className="flex-1 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm"
                      />
                      <button
                        onClick={() => removeFilter(filter.id)}
                        className="p-1.5 hover:bg-gray-800 rounded text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Find Options */}
            {queryType === 'find' && (
              <>
                {/* Sort */}
                <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-300">Sort</h3>
                    <button
                      onClick={() => setSorts([...sorts, { field: '', order: -1 }])}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {sorts.map((sort, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={sort.field}
                          onChange={(e) => {
                            const newSorts = [...sorts];
                            newSorts[i] = { ...newSorts[i], field: e.target.value };
                            setSorts(newSorts);
                          }}
                          placeholder="Field"
                          className="flex-1 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm"
                        />
                        <select
                          value={sort.order}
                          onChange={(e) => {
                            const newSorts = [...sorts];
                            newSorts[i] = { ...newSorts[i], order: parseInt(e.target.value) as 1 | -1 };
                            setSorts(newSorts);
                          }}
                          className="px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm"
                        >
                          <option value={-1}>Descending (-1)</option>
                          <option value={1}>Ascending (1)</option>
                        </select>
                        <button
                          onClick={() => setSorts(sorts.filter((_, idx) => idx !== i))}
                          className="p-1.5 hover:bg-gray-800 rounded text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Limit & Skip */}
                <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Limit</label>
                      <input
                        type="number"
                        value={limit}
                        onChange={(e) => setLimit(parseInt(e.target.value) || 0)}
                        className="w-24 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Skip</label>
                      <input
                        type="number"
                        value={skip}
                        onChange={(e) => setSkip(parseInt(e.target.value) || 0)}
                        className="w-24 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Aggregation Stages */}
            {queryType === 'aggregate' && (
              <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-300">Pipeline Stages</h3>
                  <div className="flex gap-1">
                    {(['$match', '$project', '$group', '$sort', '$lookup'] as const).map((stage) => (
                      <button
                        key={stage}
                        onClick={() => addAggregationStage(stage)}
                        className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs"
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  {aggregationStages.map((stage, i) => (
                    <div key={stage.id} className="p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-green-400">{stage.type}</span>
                        <button
                          onClick={() => setAggregationStages(aggregationStages.filter((_, idx) => idx !== i))}
                          className="p-1 hover:bg-gray-700 rounded text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        value={stage.config}
                        onChange={(e) => {
                          const newStages = [...aggregationStages];
                          newStages[i] = { ...newStages[i], config: e.target.value };
                          setAggregationStages(newStages);
                        }}
                        className="w-full h-20 p-2 bg-gray-900 border border-gray-700 rounded text-sm font-mono resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Output */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">Generated Query</h3>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 bg-gray-950 rounded-lg text-sm font-mono text-green-400 overflow-x-auto whitespace-pre-wrap">
                {generateQuery()}
              </pre>
            </div>

            {/* Quick Reference */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Quick Reference</h3>
              <div className="space-y-2 text-xs text-gray-400">
                <p><span className="text-green-400">$eq</span> — Matches values equal to a value</p>
                <p><span className="text-green-400">$gt/$gte</span> — Greater than / or equal</p>
                <p><span className="text-green-400">$lt/$lte</span> — Less than / or equal</p>
                <p><span className="text-green-400">$in</span> — Matches any value in array</p>
                <p><span className="text-green-400">$regex</span> — Pattern matching</p>
                <p><span className="text-green-400">$exists</span> — Field exists check</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
