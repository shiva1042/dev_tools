import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Database, Plus, Trash2 } from 'lucide-react';

interface Column {
  id: string;
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  foreignKey?: string;
}

interface Table {
  id: string;
  name: string;
  columns: Column[];
}

interface Relationship {
  id: string;
  from: string;
  to: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

const dataTypes = [
  'BIGINT', 'INT', 'SMALLINT', 'TINYINT',
  'VARCHAR(255)', 'VARCHAR(50)', 'TEXT', 'CHAR(1)',
  'DECIMAL(10,2)', 'FLOAT', 'DOUBLE',
  'DATE', 'DATETIME', 'TIMESTAMP', 'TIME',
  'BOOLEAN', 'JSON', 'UUID', 'BLOB',
];

export default function ERDBuilder() {
  const [tables, setTables] = useState<Table[]>([
    {
      id: '1',
      name: 'users',
      columns: [
        { id: '1-1', name: 'id', type: 'BIGINT', nullable: false, primaryKey: true },
        { id: '1-2', name: 'username', type: 'VARCHAR(50)', nullable: false, primaryKey: false },
        { id: '1-3', name: 'email', type: 'VARCHAR(255)', nullable: false, primaryKey: false },
        { id: '1-4', name: 'created_at', type: 'TIMESTAMP', nullable: false, primaryKey: false },
      ],
    },
    {
      id: '2',
      name: 'orders',
      columns: [
        { id: '2-1', name: 'id', type: 'BIGINT', nullable: false, primaryKey: true },
        { id: '2-2', name: 'user_id', type: 'BIGINT', nullable: false, primaryKey: false, foreignKey: 'users.id' },
        { id: '2-3', name: 'total', type: 'DECIMAL(10,2)', nullable: false, primaryKey: false },
        { id: '2-4', name: 'status', type: 'VARCHAR(50)', nullable: false, primaryKey: false },
      ],
    },
  ]);
  const [relationships, setRelationships] = useState<Relationship[]>([
    { id: '1', from: 'users', to: 'orders', type: 'one-to-many' },
  ]);
  const [outputFormat, setOutputFormat] = useState<'sql' | 'mermaid' | 'dbml'>('sql');
  const [copied, setCopied] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const generateSQL = (): string => {
    const lines: string[] = [];

    tables.forEach((table) => {
      lines.push(`CREATE TABLE ${table.name} (`);

      const colDefs = table.columns.map((col) => {
        let def = `    ${col.name} ${col.type}`;
        if (!col.nullable) def += ' NOT NULL';
        if (col.primaryKey) def += ' PRIMARY KEY';
        return def;
      });

      // Add foreign keys
      table.columns
        .filter((col) => col.foreignKey)
        .forEach((col) => {
          const [refTable, refCol] = col.foreignKey!.split('.');
          colDefs.push(`    FOREIGN KEY (${col.name}) REFERENCES ${refTable}(${refCol})`);
        });

      lines.push(colDefs.join(',\n'));
      lines.push(');');
      lines.push('');
    });

    return lines.join('\n');
  };

  const generateMermaid = (): string => {
    const lines: string[] = ['erDiagram'];

    tables.forEach((table) => {
      lines.push(`    ${table.name.toUpperCase()} {`);
      table.columns.forEach((col) => {
        const pk = col.primaryKey ? 'PK' : '';
        const fk = col.foreignKey ? 'FK' : '';
        const marker = pk || fk ? ` "${pk}${fk}"` : '';
        lines.push(`        ${col.type.split('(')[0].toLowerCase()} ${col.name}${marker}`);
      });
      lines.push('    }');
    });

    relationships.forEach((rel) => {
      const symbol = rel.type === 'one-to-one' ? '||--||' : rel.type === 'one-to-many' ? '||--o{' : '}o--o{';
      lines.push(`    ${rel.from.toUpperCase()} ${symbol} ${rel.to.toUpperCase()} : ""`);
    });

    return lines.join('\n');
  };

  const generateDBML = (): string => {
    const lines: string[] = [];

    tables.forEach((table) => {
      lines.push(`Table ${table.name} {`);
      table.columns.forEach((col) => {
        let def = `  ${col.name} ${col.type.toLowerCase()}`;
        const attrs: string[] = [];
        if (col.primaryKey) attrs.push('pk');
        if (!col.nullable) attrs.push('not null');
        if (col.foreignKey) attrs.push(`ref: > ${col.foreignKey}`);
        if (attrs.length > 0) def += ` [${attrs.join(', ')}]`;
        lines.push(def);
      });
      lines.push('}');
      lines.push('');
    });

    return lines.join('\n');
  };

  const getOutput = (): string => {
    switch (outputFormat) {
      case 'sql':
        return generateSQL();
      case 'mermaid':
        return generateMermaid();
      case 'dbml':
        return generateDBML();
    }
  };

  const addTable = () => {
    setTables([
      ...tables,
      {
        id: generateId(),
        name: `table_${tables.length + 1}`,
        columns: [
          { id: generateId(), name: 'id', type: 'BIGINT', nullable: false, primaryKey: true },
        ],
      },
    ]);
  };

  const updateTable = (id: string, updates: Partial<Table>) => {
    setTables(tables.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const removeTable = (id: string) => {
    setTables(tables.filter((t) => t.id !== id));
    setRelationships(relationships.filter((r) => {
      const table = tables.find((t) => t.id === id);
      return table ? r.from !== table.name && r.to !== table.name : true;
    }));
  };

  const addColumn = (tableId: string) => {
    setTables(
      tables.map((t) =>
        t.id === tableId
          ? {
              ...t,
              columns: [
                ...t.columns,
                { id: generateId(), name: 'new_column', type: 'VARCHAR(255)', nullable: true, primaryKey: false },
              ],
            }
          : t
      )
    );
  };

  const updateColumn = (tableId: string, colId: string, updates: Partial<Column>) => {
    setTables(
      tables.map((t) =>
        t.id === tableId
          ? { ...t, columns: t.columns.map((c) => (c.id === colId ? { ...c, ...updates } : c)) }
          : t
      )
    );
  };

  const removeColumn = (tableId: string, colId: string) => {
    setTables(
      tables.map((t) =>
        t.id === tableId ? { ...t, columns: t.columns.filter((c) => c.id !== colId) } : t
      )
    );
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(getOutput());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Database className="w-6 h-6 text-indigo-400" />
              ERD Builder
            </h1>
            <p className="text-gray-400 text-sm">Design database schemas visually</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tables */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-300">Tables ({tables.length})</h3>
              <button
                onClick={addTable}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-sm hover:bg-indigo-500/30"
              >
                <Plus className="w-4 h-4" /> Add Table
              </button>
            </div>

            {tables.map((table) => (
              <div key={table.id} className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <input
                    type="text"
                    value={table.name}
                    onChange={(e) => updateTable(table.id, { name: e.target.value })}
                    className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm font-medium font-mono"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => addColumn(table.id)}
                      className="p-1.5 hover:bg-gray-800 rounded text-green-400"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    {tables.length > 1 && (
                      <button
                        onClick={() => removeTable(table.id)}
                        className="p-1.5 hover:bg-gray-800 rounded text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  {table.columns.map((col) => (
                    <div key={col.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="text"
                        value={col.name}
                        onChange={(e) => updateColumn(table.id, col.id, { name: e.target.value })}
                        className="w-28 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs font-mono"
                      />
                      <select
                        value={col.type}
                        onChange={(e) => updateColumn(table.id, col.id, { type: e.target.value })}
                        className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs"
                      >
                        {dataTypes.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <label className="flex items-center gap-1 text-xs text-gray-500">
                        <input
                          type="checkbox"
                          checked={col.primaryKey}
                          onChange={(e) => updateColumn(table.id, col.id, { primaryKey: e.target.checked })}
                          className="accent-indigo-500"
                        />
                        PK
                      </label>
                      <label className="flex items-center gap-1 text-xs text-gray-500">
                        <input
                          type="checkbox"
                          checked={col.nullable}
                          onChange={(e) => updateColumn(table.id, col.id, { nullable: e.target.checked })}
                          className="accent-indigo-500"
                        />
                        Null
                      </label>
                      {table.columns.length > 1 && (
                        <button
                          onClick={() => removeColumn(table.id, col.id)}
                          className="p-1 hover:bg-gray-700 rounded text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Output */}
          <div className="space-y-4">
            {/* Format Selection */}
            <div className="flex gap-2">
              {(['sql', 'mermaid', 'dbml'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setOutputFormat(fmt)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium uppercase ${
                    outputFormat === fmt
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            {/* Output */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">
                  {outputFormat === 'sql' ? 'SQL DDL' : outputFormat === 'mermaid' ? 'Mermaid ER Diagram' : 'DBML'}
                </h3>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="p-4 bg-gray-950 rounded-lg text-xs font-mono text-indigo-400 overflow-x-auto max-h-[500px] overflow-y-auto whitespace-pre">
                {getOutput()}
              </pre>
            </div>

            {/* Tips */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Output Formats</h3>
              <div className="space-y-2 text-xs text-gray-400">
                <p><span className="text-indigo-400">SQL</span> — CREATE TABLE statements</p>
                <p><span className="text-indigo-400">Mermaid</span> — For documentation diagrams</p>
                <p><span className="text-indigo-400">DBML</span> — Database markup for dbdiagram.io</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
