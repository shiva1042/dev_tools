import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, FileSpreadsheet, Copy, Check } from 'lucide-react';

interface Formula { name: string; syntax: string; description: string; example: string; category: string; }

const formulas: Formula[] = [
  { name: 'SUM', syntax: 'SUM(number1, [number2], ...)', description: 'Adds all numbers in a range', example: '=SUM(A1:A10)', category: 'Math' },
  { name: 'AVERAGE', syntax: 'AVERAGE(number1, [number2], ...)', description: 'Returns the average of numbers', example: '=AVERAGE(B1:B20)', category: 'Math' },
  { name: 'COUNT', syntax: 'COUNT(value1, [value2], ...)', description: 'Counts cells with numbers', example: '=COUNT(A1:A100)', category: 'Math' },
  { name: 'MAX', syntax: 'MAX(number1, [number2], ...)', description: 'Returns the largest value', example: '=MAX(C1:C50)', category: 'Math' },
  { name: 'MIN', syntax: 'MIN(number1, [number2], ...)', description: 'Returns the smallest value', example: '=MIN(C1:C50)', category: 'Math' },
  { name: 'ROUND', syntax: 'ROUND(number, num_digits)', description: 'Rounds a number to specified digits', example: '=ROUND(3.14159, 2)', category: 'Math' },
  { name: 'ABS', syntax: 'ABS(number)', description: 'Returns the absolute value', example: '=ABS(-5)', category: 'Math' },
  { name: 'SUMIF', syntax: 'SUMIF(range, criteria, [sum_range])', description: 'Sums cells that meet a condition', example: '=SUMIF(A1:A10,">5",B1:B10)', category: 'Math' },
  { name: 'COUNTIF', syntax: 'COUNTIF(range, criteria)', description: 'Counts cells meeting a condition', example: '=COUNTIF(A1:A10,"Yes")', category: 'Math' },
  { name: 'IF', syntax: 'IF(condition, value_if_true, value_if_false)', description: 'Returns value based on condition', example: '=IF(A1>10,"High","Low")', category: 'Logic' },
  { name: 'AND', syntax: 'AND(logical1, [logical2], ...)', description: 'Returns TRUE if all conditions are true', example: '=AND(A1>0, B1<10)', category: 'Logic' },
  { name: 'OR', syntax: 'OR(logical1, [logical2], ...)', description: 'Returns TRUE if any condition is true', example: '=OR(A1="Yes", A1="Y")', category: 'Logic' },
  { name: 'NOT', syntax: 'NOT(logical)', description: 'Reverses a logical value', example: '=NOT(A1>10)', category: 'Logic' },
  { name: 'IFS', syntax: 'IFS(condition1, value1, ...)', description: 'Checks multiple conditions', example: '=IFS(A1>90,"A",A1>80,"B")', category: 'Logic' },
  { name: 'IFERROR', syntax: 'IFERROR(value, value_if_error)', description: 'Returns value if no error, else alternate', example: '=IFERROR(A1/B1, 0)', category: 'Logic' },
  { name: 'VLOOKUP', syntax: 'VLOOKUP(value, table, col_index, [match])', description: 'Vertical lookup in a table', example: '=VLOOKUP(A1,D:E,2,FALSE)', category: 'Lookup' },
  { name: 'HLOOKUP', syntax: 'HLOOKUP(value, table, row_index, [match])', description: 'Horizontal lookup in a table', example: '=HLOOKUP("Q1",A1:D2,2,FALSE)', category: 'Lookup' },
  { name: 'INDEX', syntax: 'INDEX(array, row_num, [col_num])', description: 'Returns value at row/col intersection', example: '=INDEX(A1:C10,5,2)', category: 'Lookup' },
  { name: 'MATCH', syntax: 'MATCH(value, lookup_array, [match_type])', description: 'Returns position of a value', example: '=MATCH("Bob",A1:A10,0)', category: 'Lookup' },
  { name: 'XLOOKUP', syntax: 'XLOOKUP(value, lookup, return, [not_found])', description: 'Modern lookup replacement for VLOOKUP', example: '=XLOOKUP(A1,B:B,C:C)', category: 'Lookup' },
  { name: 'CONCATENATE', syntax: 'CONCATENATE(text1, [text2], ...)', description: 'Joins text strings together', example: '=CONCATENATE(A1," ",B1)', category: 'Text' },
  { name: 'LEFT', syntax: 'LEFT(text, [num_chars])', description: 'Returns leftmost characters', example: '=LEFT(A1, 3)', category: 'Text' },
  { name: 'RIGHT', syntax: 'RIGHT(text, [num_chars])', description: 'Returns rightmost characters', example: '=RIGHT(A1, 4)', category: 'Text' },
  { name: 'MID', syntax: 'MID(text, start_num, num_chars)', description: 'Extracts characters from middle', example: '=MID(A1, 2, 3)', category: 'Text' },
  { name: 'LEN', syntax: 'LEN(text)', description: 'Returns length of a string', example: '=LEN(A1)', category: 'Text' },
  { name: 'TRIM', syntax: 'TRIM(text)', description: 'Removes extra spaces', example: '=TRIM(A1)', category: 'Text' },
  { name: 'UPPER', syntax: 'UPPER(text)', description: 'Converts text to uppercase', example: '=UPPER(A1)', category: 'Text' },
  { name: 'LOWER', syntax: 'LOWER(text)', description: 'Converts text to lowercase', example: '=LOWER(A1)', category: 'Text' },
  { name: 'TEXT', syntax: 'TEXT(value, format_text)', description: 'Formats number as text', example: '=TEXT(0.75, "0%")', category: 'Text' },
  { name: 'TODAY', syntax: 'TODAY()', description: 'Returns current date', example: '=TODAY()', category: 'Date' },
  { name: 'NOW', syntax: 'NOW()', description: 'Returns current date and time', example: '=NOW()', category: 'Date' },
  { name: 'DATE', syntax: 'DATE(year, month, day)', description: 'Creates a date value', example: '=DATE(2024, 1, 15)', category: 'Date' },
  { name: 'DATEDIF', syntax: 'DATEDIF(start, end, unit)', description: 'Calculates date difference', example: '=DATEDIF(A1,B1,"D")', category: 'Date' },
  { name: 'YEAR', syntax: 'YEAR(date)', description: 'Extracts year from date', example: '=YEAR(A1)', category: 'Date' },
  { name: 'MONTH', syntax: 'MONTH(date)', description: 'Extracts month from date', example: '=MONTH(A1)', category: 'Date' },
  { name: 'DAY', syntax: 'DAY(date)', description: 'Extracts day from date', example: '=DAY(A1)', category: 'Date' },
];

const categories = ['All', 'Math', 'Logic', 'Lookup', 'Text', 'Date'];

export default function App() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [copiedId, setCopiedId] = useState('');

  const filtered = formulas.filter(f => (category === 'All' || f.category === category) && (f.name.toLowerCase().includes(search.toLowerCase()) || f.description.toLowerCase().includes(search.toLowerCase())));

  const copy = async (text: string, id: string) => { await navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(''), 2000); };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><FileSpreadsheet className="w-6 h-6 text-green-400" /> Spreadsheet Formula Reference</h1>
          <p className="text-gray-400 text-sm">{filtered.length} formulas</p></div>
        </div>
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search formulas..." className="w-full pl-10 p-2 bg-gray-900 border border-gray-800 rounded-lg text-sm focus:outline-none" /></div>
        </div>
        <div className="flex gap-2 mb-6">{categories.map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-lg text-sm ${category === c ? 'bg-green-600' : 'bg-gray-800 hover:bg-gray-700'}`}>{c}</button>
        ))}</div>
        <div className="space-y-2">
          {filtered.map(f => (
            <div key={f.name} className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-green-400">{f.name}</span>
                    <span className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400">{f.category}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{f.description}</p>
                  <div className="text-xs font-mono text-gray-500 mb-1">Syntax: <span className="text-gray-300">{f.syntax}</span></div>
                  <div className="text-xs font-mono text-gray-500">Example: <span className="text-blue-400">{f.example}</span></div>
                </div>
                <button onClick={() => copy(f.example, f.name)} className="p-1.5 hover:bg-gray-800 rounded text-gray-400">
                  {copiedId === f.name ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
