import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Play, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

interface Field {
  id: string;
  name: string;
  alias?: string;
  args: { name: string; value: string; type: string }[];
  fields: Field[];
  expanded: boolean;
}

type OperationType = 'query' | 'mutation' | 'subscription';

export default function GraphQLBuilder() {
  const [operationType, setOperationType] = useState<OperationType>('query');
  const [operationName, setOperationName] = useState('GetData');
  const [variables, setVariables] = useState<{ name: string; type: string; defaultValue: string }[]>([]);
  const [fields, setFields] = useState<Field[]>([
    {
      id: '1',
      name: 'users',
      args: [{ name: 'limit', value: '10', type: 'Int' }],
      fields: [
        { id: '1-1', name: 'id', args: [], fields: [], expanded: true },
        { id: '1-2', name: 'name', args: [], fields: [], expanded: true },
        { id: '1-3', name: 'email', args: [], fields: [], expanded: true },
      ],
      expanded: true,
    },
  ]);
  const [copied, setCopied] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const generateQuery = (): string => {
    const generateFieldsStr = (fields: Field[], indent: number): string => {
      return fields
        .map((field) => {
          const spaces = '  '.repeat(indent);
          let line = spaces;

          if (field.alias) {
            line += `${field.alias}: `;
          }
          line += field.name;

          if (field.args.length > 0) {
            const argsStr = field.args
              .map((arg) => {
                if (arg.type === 'String') return `${arg.name}: "${arg.value}"`;
                if (arg.type === 'Variable') return `${arg.name}: $${arg.value}`;
                return `${arg.name}: ${arg.value}`;
              })
              .join(', ');
            line += `(${argsStr})`;
          }

          if (field.fields.length > 0) {
            line += ` {\n${generateFieldsStr(field.fields, indent + 1)}\n${spaces}}`;
          }

          return line;
        })
        .join('\n');
    };

    let query = operationType;

    if (operationName) {
      query += ` ${operationName}`;
    }

    if (variables.length > 0) {
      const varsStr = variables
        .map((v) => {
          let varDef = `$${v.name}: ${v.type}`;
          if (v.defaultValue) {
            varDef += ` = ${v.type === 'String' ? `"${v.defaultValue}"` : v.defaultValue}`;
          }
          return varDef;
        })
        .join(', ');
      query += `(${varsStr})`;
    }

    query += ` {\n${generateFieldsStr(fields, 1)}\n}`;

    return query;
  };

  const addField = (parentId?: string) => {
    const newField: Field = {
      id: generateId(),
      name: 'newField',
      args: [],
      fields: [],
      expanded: true,
    };

    if (!parentId) {
      setFields([...fields, newField]);
    } else {
      const addToParent = (fields: Field[]): Field[] => {
        return fields.map((f) => {
          if (f.id === parentId) {
            return { ...f, fields: [...f.fields, newField] };
          }
          return { ...f, fields: addToParent(f.fields) };
        });
      };
      setFields(addToParent(fields));
    }
  };

  const updateField = (id: string, updates: Partial<Field>) => {
    const updateInFields = (fields: Field[]): Field[] => {
      return fields.map((f) => {
        if (f.id === id) {
          return { ...f, ...updates };
        }
        return { ...f, fields: updateInFields(f.fields) };
      });
    };
    setFields(updateInFields(fields));
  };

  const removeField = (id: string) => {
    const removeFromFields = (fields: Field[]): Field[] => {
      return fields
        .filter((f) => f.id !== id)
        .map((f) => ({ ...f, fields: removeFromFields(f.fields) }));
    };
    setFields(removeFromFields(fields));
  };

  const addArgToField = (fieldId: string) => {
    const addArg = (fields: Field[]): Field[] => {
      return fields.map((f) => {
        if (f.id === fieldId) {
          return {
            ...f,
            args: [...f.args, { name: 'arg', value: '', type: 'String' }],
          };
        }
        return { ...f, fields: addArg(f.fields) };
      });
    };
    setFields(addArg(fields));
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generateQuery());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderField = (field: Field, depth: number = 0) => (
    <div key={field.id} className="border-l-2 border-gray-700 ml-4 pl-3">
      <div className="flex items-center gap-2 py-1">
        {field.fields.length > 0 && (
          <button
            onClick={() => updateField(field.id, { expanded: !field.expanded })}
            className="p-0.5 hover:bg-gray-800 rounded"
          >
            {field.expanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>
        )}
        <input
          type="text"
          value={field.name}
          onChange={(e) => updateField(field.id, { name: e.target.value })}
          className="w-32 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm"
          placeholder="Field name"
        />
        <input
          type="text"
          value={field.alias || ''}
          onChange={(e) => updateField(field.id, { alias: e.target.value || undefined })}
          className="w-24 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm"
          placeholder="Alias"
        />
        <button
          onClick={() => addArgToField(field.id)}
          className="p-1 hover:bg-gray-800 rounded text-blue-400"
          title="Add argument"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => addField(field.id)}
          className="p-1 hover:bg-gray-800 rounded text-green-400"
          title="Add subfield"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => removeField(field.id)}
          className="p-1 hover:bg-gray-800 rounded text-red-400"
          title="Remove field"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Arguments */}
      {field.args.length > 0 && (
        <div className="ml-6 space-y-1 mb-2">
          {field.args.map((arg, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={arg.name}
                onChange={(e) => {
                  const newArgs = [...field.args];
                  newArgs[i] = { ...newArgs[i], name: e.target.value };
                  updateField(field.id, { args: newArgs });
                }}
                className="w-24 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs"
                placeholder="Name"
              />
              <select
                value={arg.type}
                onChange={(e) => {
                  const newArgs = [...field.args];
                  newArgs[i] = { ...newArgs[i], type: e.target.value };
                  updateField(field.id, { args: newArgs });
                }}
                className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs"
              >
                <option value="String">String</option>
                <option value="Int">Int</option>
                <option value="Float">Float</option>
                <option value="Boolean">Boolean</option>
                <option value="ID">ID</option>
                <option value="Variable">Variable</option>
              </select>
              <input
                type="text"
                value={arg.value}
                onChange={(e) => {
                  const newArgs = [...field.args];
                  newArgs[i] = { ...newArgs[i], value: e.target.value };
                  updateField(field.id, { args: newArgs });
                }}
                className="w-24 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs"
                placeholder="Value"
              />
              <button
                onClick={() => {
                  const newArgs = field.args.filter((_, idx) => idx !== i);
                  updateField(field.id, { args: newArgs });
                }}
                className="p-1 hover:bg-gray-800 rounded text-red-400"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Subfields */}
      {field.expanded && field.fields.length > 0 && (
        <div>{field.fields.map((f) => renderField(f, depth + 1))}</div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Play className="w-6 h-6 text-pink-400" />
              GraphQL Query Builder
            </h1>
            <p className="text-gray-400 text-sm">Build GraphQL queries visually</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Builder */}
          <div className="space-y-4">
            {/* Operation Settings */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex rounded-lg overflow-hidden border border-gray-700">
                  {(['query', 'mutation', 'subscription'] as const).map((op) => (
                    <button
                      key={op}
                      onClick={() => setOperationType(op)}
                      className={`px-3 py-1.5 text-sm capitalize ${
                        operationType === op
                          ? 'bg-pink-500/20 text-pink-400'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {op}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={operationName}
                  onChange={(e) => setOperationName(e.target.value)}
                  className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                  placeholder="Operation name"
                />
              </div>
            </div>

            {/* Variables */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">Variables</h3>
                <button
                  onClick={() =>
                    setVariables([...variables, { name: 'var', type: 'String', defaultValue: '' }])
                  }
                  className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              <div className="space-y-2">
                {variables.map((v, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-pink-400">$</span>
                    <input
                      type="text"
                      value={v.name}
                      onChange={(e) => {
                        const newVars = [...variables];
                        newVars[i] = { ...newVars[i], name: e.target.value };
                        setVariables(newVars);
                      }}
                      className="w-24 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm"
                    />
                    <select
                      value={v.type}
                      onChange={(e) => {
                        const newVars = [...variables];
                        newVars[i] = { ...newVars[i], type: e.target.value };
                        setVariables(newVars);
                      }}
                      className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm"
                    >
                      <option>String</option>
                      <option>String!</option>
                      <option>Int</option>
                      <option>Int!</option>
                      <option>Float</option>
                      <option>Boolean</option>
                      <option>ID</option>
                      <option>ID!</option>
                      <option>[String]</option>
                      <option>[Int]</option>
                    </select>
                    <input
                      type="text"
                      value={v.defaultValue}
                      onChange={(e) => {
                        const newVars = [...variables];
                        newVars[i] = { ...newVars[i], defaultValue: e.target.value };
                        setVariables(newVars);
                      }}
                      className="w-24 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm"
                      placeholder="Default"
                    />
                    <button
                      onClick={() => setVariables(variables.filter((_, idx) => idx !== i))}
                      className="p-1 hover:bg-gray-800 rounded text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Fields */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">Fields</h3>
                <button
                  onClick={() => addField()}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs"
                >
                  <Plus className="w-3 h-3" /> Add Root Field
                </button>
              </div>
              <div className="space-y-1">{fields.map((f) => renderField(f))}</div>
            </div>
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
              <pre className="p-4 bg-gray-950 rounded-lg text-sm font-mono text-pink-400 overflow-x-auto">
                {generateQuery()}
              </pre>
            </div>

            {/* Templates */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Templates</h3>
              <div className="space-y-2">
                {[
                  { label: 'User Query', type: 'query' as const, name: 'GetUser' },
                  { label: 'Create Mutation', type: 'mutation' as const, name: 'CreateItem' },
                  { label: 'Subscription', type: 'subscription' as const, name: 'OnUpdate' },
                ].map((template) => (
                  <button
                    key={template.label}
                    onClick={() => {
                      setOperationType(template.type);
                      setOperationName(template.name);
                    }}
                    className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                  >
                    {template.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
