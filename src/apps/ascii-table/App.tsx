import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Table, Plus, Trash2 } from 'lucide-react';

type BorderStyle = 'ascii' | 'unicode' | 'markdown' | 'rst' | 'none';

export default function AsciiTable() {
  const [headers, setHeaders] = useState(['Name', 'Age', 'City']);
  const [rows, setRows] = useState([
    ['John Doe', '28', 'New York'],
    ['Jane Smith', '34', 'Los Angeles'],
    ['Bob Johnson', '45', 'Chicago'],
  ]);
  const [borderStyle, setBorderStyle] = useState<BorderStyle>('ascii');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('left');
  const [copied, setCopied] = useState(false);

  const borders = {
    ascii: { tl: '+', tr: '+', bl: '+', br: '+', h: '-', v: '|', c: '+' },
    unicode: { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│', c: '┼' },
    markdown: { tl: '|', tr: '|', bl: '|', br: '|', h: '-', v: '|', c: '|' },
    rst: { tl: '+', tr: '+', bl: '+', br: '+', h: '=', v: '|', c: '+' },
    none: { tl: ' ', tr: ' ', bl: ' ', br: ' ', h: ' ', v: ' ', c: ' ' },
  };

  const generateTable = (): string => {
    const b = borders[borderStyle];
    const allRows = [headers, ...rows];

    // Calculate column widths
    const colWidths = headers.map((_, colIndex) => {
      return Math.max(...allRows.map((row) => (row[colIndex] || '').length));
    });

    const padCell = (text: string, width: number): string => {
      const padding = width - text.length;
      if (alignment === 'center') {
        const left = Math.floor(padding / 2);
        const right = padding - left;
        return ' '.repeat(left) + text + ' '.repeat(right);
      } else if (alignment === 'right') {
        return ' '.repeat(padding) + text;
      }
      return text + ' '.repeat(padding);
    };

    const createLine = (left: string, mid: string, right: string, fill: string): string => {
      return left + colWidths.map((w) => fill.repeat(w + 2)).join(mid) + right;
    };

    const createRow = (row: string[]): string => {
      return (
        b.v +
        row.map((cell, i) => ' ' + padCell(cell || '', colWidths[i]) + ' ').join(b.v) +
        b.v
      );
    };

    const lines: string[] = [];

    if (borderStyle === 'markdown') {
      // Markdown format
      lines.push(createRow(headers));
      lines.push(
        '|' +
          colWidths
            .map((w) => {
              const dashes = '-'.repeat(w);
              if (alignment === 'center') return `:${dashes}:`;
              if (alignment === 'right') return `${dashes}:`;
              return dashes;
            })
            .join('|') +
          '|'
      );
      rows.forEach((row) => lines.push(createRow(row)));
    } else {
      // Other formats
      lines.push(createLine(b.tl, b.c, b.tr, b.h));
      lines.push(createRow(headers));
      lines.push(createLine(b.c, b.c, b.c, borderStyle === 'rst' ? '=' : b.h));
      rows.forEach((row) => lines.push(createRow(row)));
      lines.push(createLine(b.bl, b.c, b.br, b.h));
    }

    return lines.join('\n');
  };

  const addColumn = () => {
    setHeaders([...headers, `Column ${headers.length + 1}`]);
    setRows(rows.map((row) => [...row, '']));
  };

  const removeColumn = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
    setRows(rows.map((row) => row.filter((_, i) => i !== index)));
  };

  const addRow = () => {
    setRows([...rows, headers.map(() => '')]);
  };

  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    setHeaders(newHeaders);
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex] = [...newRows[rowIndex]];
    newRows[rowIndex][colIndex] = value;
    setRows(newRows);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generateTable());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSample = () => {
    setHeaders(['Product', 'Price', 'Quantity', 'Total']);
    setRows([
      ['Widget A', '$10.00', '5', '$50.00'],
      ['Widget B', '$15.00', '3', '$45.00'],
      ['Widget C', '$8.00', '10', '$80.00'],
      ['', '', 'Subtotal', '$175.00'],
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Table className="w-6 h-6 text-blue-400" />
              ASCII Table Generator
            </h1>
            <p className="text-gray-400 text-sm">Create ASCII art tables</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="space-y-4">
            {/* Options */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Border Style</label>
                  <select
                    value={borderStyle}
                    onChange={(e) => setBorderStyle(e.target.value as BorderStyle)}
                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                  >
                    <option value="ascii">ASCII (+, -, |)</option>
                    <option value="unicode">Unicode (┌, ─, │)</option>
                    <option value="markdown">Markdown</option>
                    <option value="rst">reStructuredText</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Alignment</label>
                  <select
                    value={alignment}
                    onChange={(e) => setAlignment(e.target.value as 'left' | 'center' | 'right')}
                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <button
                  onClick={loadSample}
                  className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm mt-4"
                >
                  Load Sample
                </button>
              </div>
            </div>

            {/* Table Editor */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800 overflow-x-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">Table Data</h3>
                <div className="flex gap-2">
                  <button
                    onClick={addColumn}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs"
                  >
                    <Plus className="w-3 h-3" /> Column
                  </button>
                  <button
                    onClick={addRow}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs"
                  >
                    <Plus className="w-3 h-3" /> Row
                  </button>
                </div>
              </div>

              <table className="w-full">
                <thead>
                  <tr>
                    {headers.map((header, i) => (
                      <th key={i} className="p-1">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={header}
                            onChange={(e) => updateHeader(i, e.target.value)}
                            className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm font-medium"
                          />
                          {headers.length > 1 && (
                            <button
                              onClick={() => removeColumn(i)}
                              className="p-1 hover:bg-gray-700 rounded text-red-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {headers.map((_, colIndex) => (
                        <td key={colIndex} className="p-1">
                          <input
                            type="text"
                            value={row[colIndex] || ''}
                            onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                            className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm"
                          />
                        </td>
                      ))}
                      <td className="p-1">
                        {rows.length > 1 && (
                          <button
                            onClick={() => removeRow(rowIndex)}
                            className="p-1 hover:bg-gray-700 rounded text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Output */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">Generated Table</h3>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 bg-gray-950 rounded-lg text-sm font-mono text-blue-400 overflow-x-auto whitespace-pre">
                {generateTable()}
              </pre>
            </div>

            {/* Tips */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Usage Tips</h3>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>• <span className="text-blue-400">ASCII</span> — Works everywhere, email-safe</li>
                <li>• <span className="text-blue-400">Unicode</span> — Better looking, needs UTF-8</li>
                <li>• <span className="text-blue-400">Markdown</span> — For GitHub, docs</li>
                <li>• <span className="text-blue-400">RST</span> — For Sphinx documentation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
