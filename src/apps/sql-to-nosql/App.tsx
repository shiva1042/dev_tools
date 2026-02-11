import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Snackbar,
  Chip,
} from '@mui/material';
import {
  Home,
  ContentCopy,
  Clear,
  Storage,
} from '@mui/icons-material';

interface ParsedSQL {
  select: string[];
  from: string;
  where: WhereClause | null;
  orderBy: { field: string; dir: string }[];
  limit: number | null;
  groupBy: string[];
  having: WhereClause | null;
  aggregates: { fn: string; field: string; alias: string }[];
  joins: { table: string; on: string }[];
}

interface WhereClause {
  type: 'condition' | 'and' | 'or' | 'not';
  field?: string;
  op?: string;
  value?: string;
  children?: WhereClause[];
}

function tokenize(sql: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inStr = '';
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (!inStr && (ch === "'" || ch === '"')) { inStr = ch; current += ch; continue; }
    if (ch === inStr) { inStr = ''; current += ch; continue; }
    if (!inStr && /[\s,()]/.test(ch)) {
      if (current) tokens.push(current);
      if (ch === '(' || ch === ')') tokens.push(ch);
      current = '';
      continue;
    }
    current += ch;
  }
  if (current) tokens.push(current);
  return tokens;
}

function parseWhere(tokens: string[], start: number): { clause: WhereClause | null; end: number } {
  const conditions: WhereClause[] = [];
  const operators: string[] = [];
  let i = start;

  while (i < tokens.length) {
    const t = tokens[i];
    const upper = t.toUpperCase();
    if (['ORDER', 'GROUP', 'LIMIT', 'HAVING', ';'].includes(upper)) break;

    if (upper === 'AND') { operators.push('and'); i++; continue; }
    if (upper === 'OR') { operators.push('or'); i++; continue; }
    if (upper === 'NOT') {
      const { clause, end } = parseWhere(tokens, i + 1);
      if (clause) conditions.push({ type: 'not', children: [clause] });
      i = end;
      continue;
    }

    const field = t;
    const opToken = tokens[i + 1]?.toUpperCase() || '';

    if (opToken === 'IS') {
      const nullish = tokens[i + 2]?.toUpperCase() === 'NOT' ? 'IS NOT NULL' : 'IS NULL';
      conditions.push({ type: 'condition', field, op: nullish, value: 'null' });
      i += nullish === 'IS NOT NULL' ? 4 : 3;
      continue;
    }
    if (opToken === 'IN') {
      const vals: string[] = [];
      let j = i + 2;
      if (tokens[j] === '(') j++;
      while (j < tokens.length && tokens[j] !== ')') { vals.push(tokens[j].replace(/^'|'$/g, '')); j++; }
      conditions.push({ type: 'condition', field, op: 'IN', value: vals.join(',') });
      i = j + 1;
      continue;
    }
    if (opToken === 'BETWEEN') {
      const low = tokens[i + 2]?.replace(/^'|'$/g, '') || '';
      // skip AND
      const high = tokens[i + 4]?.replace(/^'|'$/g, '') || '';
      conditions.push({ type: 'condition', field, op: 'BETWEEN', value: `${low},${high}` });
      i += 5;
      continue;
    }
    if (opToken === 'LIKE') {
      conditions.push({ type: 'condition', field, op: 'LIKE', value: tokens[i + 2]?.replace(/^'|'$/g, '') || '' });
      i += 3;
      continue;
    }
    if (['=', '!=', '<>', '>', '<', '>=', '<='].includes(opToken)) {
      conditions.push({ type: 'condition', field, op: opToken === '<>' ? '!=' : opToken, value: tokens[i + 2]?.replace(/^'|'$/g, '') || '' });
      i += 3;
      continue;
    }
    i++;
  }

  if (conditions.length === 0) return { clause: null, end: i };
  if (conditions.length === 1 && operators.length === 0) return { clause: conditions[0], end: i };

  const mainOp = operators.includes('or') ? 'or' : 'and';
  return { clause: { type: mainOp, children: conditions }, end: i };
}

function parseSQL(sql: string): ParsedSQL {
  const result: ParsedSQL = { select: [], from: '', where: null, orderBy: [], limit: null, groupBy: [], having: null, aggregates: [], joins: [] };
  const tokens = tokenize(sql.trim().replace(/;$/, ''));
  let i = 0;

  // SELECT
  if (tokens[i]?.toUpperCase() === 'SELECT') {
    i++;
    while (i < tokens.length && tokens[i]?.toUpperCase() !== 'FROM') {
      const t = tokens[i];
      const upper = t.toUpperCase();
      if (['COUNT', 'SUM', 'AVG', 'MAX', 'MIN'].includes(upper)) {
        const fn = upper;
        if (tokens[i + 1] === '(') {
          const field = tokens[i + 2] || '*';
          let alias = field;
          let j = i + 3;
          if (tokens[j] === ')') j++;
          if (tokens[j]?.toUpperCase() === 'AS') { alias = tokens[j + 1] || alias; j += 2; }
          result.aggregates.push({ fn, field, alias });
          i = j;
          continue;
        }
      }
      if (t !== ',' && t !== '(' && t !== ')') result.select.push(t);
      i++;
    }
  }

  // FROM
  if (tokens[i]?.toUpperCase() === 'FROM') { i++; result.from = tokens[i] || ''; i++; }

  // JOIN
  while (i < tokens.length && ['JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER'].includes(tokens[i]?.toUpperCase())) {
    if (tokens[i]?.toUpperCase() !== 'JOIN') i++; // skip LEFT/RIGHT/INNER
    if (tokens[i]?.toUpperCase() === 'JOIN') i++;
    const table = tokens[i] || ''; i++;
    if (tokens[i]?.toUpperCase() === 'ON') { i++; const onParts: string[] = []; while (i < tokens.length && !['WHERE', 'ORDER', 'GROUP', 'LIMIT', 'JOIN', 'LEFT', 'RIGHT', 'INNER'].includes(tokens[i]?.toUpperCase())) { onParts.push(tokens[i]); i++; } result.joins.push({ table, on: onParts.join(' ') }); }
  }

  // WHERE
  if (tokens[i]?.toUpperCase() === 'WHERE') { i++; const { clause, end } = parseWhere(tokens, i); result.where = clause; i = end; }

  // GROUP BY
  if (tokens[i]?.toUpperCase() === 'GROUP' && tokens[i + 1]?.toUpperCase() === 'BY') {
    i += 2;
    while (i < tokens.length && !['HAVING', 'ORDER', 'LIMIT'].includes(tokens[i]?.toUpperCase())) {
      if (tokens[i] !== ',') result.groupBy.push(tokens[i]);
      i++;
    }
  }

  // HAVING
  if (tokens[i]?.toUpperCase() === 'HAVING') { i++; const { clause, end } = parseWhere(tokens, i); result.having = clause; i = end; }

  // ORDER BY
  if (tokens[i]?.toUpperCase() === 'ORDER' && tokens[i + 1]?.toUpperCase() === 'BY') {
    i += 2;
    while (i < tokens.length && tokens[i]?.toUpperCase() !== 'LIMIT') {
      if (tokens[i] !== ',') {
        const dir = tokens[i + 1]?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        result.orderBy.push({ field: tokens[i], dir });
        if (['ASC', 'DESC'].includes(tokens[i + 1]?.toUpperCase())) i++;
      }
      i++;
    }
  }

  // LIMIT
  if (tokens[i]?.toUpperCase() === 'LIMIT') { i++; result.limit = parseInt(tokens[i]) || null; }

  if (result.select.length === 0 && result.aggregates.length === 0) result.select = ['*'];

  return result;
}

function whereToMongo(clause: WhereClause): Record<string, unknown> {
  if (clause.type === 'and') return { $and: clause.children!.map(whereToMongo) };
  if (clause.type === 'or') return { $or: clause.children!.map(whereToMongo) };
  if (clause.type === 'not') return { $not: whereToMongo(clause.children![0]) };

  const field = clause.field || '';
  const val = clause.value || '';
  const numVal = isNaN(Number(val)) ? val : Number(val);

  switch (clause.op) {
    case '=': return { [field]: numVal };
    case '!=': return { [field]: { $ne: numVal } };
    case '>': return { [field]: { $gt: numVal } };
    case '<': return { [field]: { $lt: numVal } };
    case '>=': return { [field]: { $gte: numVal } };
    case '<=': return { [field]: { $lte: numVal } };
    case 'LIKE': return { [field]: { $regex: val.replace(/%/g, '.*').replace(/_/g, '.'), $options: 'i' } };
    case 'IN': return { [field]: { $in: val.split(',').map(v => isNaN(Number(v.trim())) ? v.trim() : Number(v.trim())) } };
    case 'BETWEEN': { const [lo, hi] = val.split(','); return { [field]: { $gte: isNaN(Number(lo)) ? lo : Number(lo), $lte: isNaN(Number(hi)) ? hi : Number(hi) } }; }
    case 'IS NULL': return { [field]: null };
    case 'IS NOT NULL': return { [field]: { $ne: null } };
    default: return {};
  }
}

function toMongoDB(p: ParsedSQL): string {
  if (p.aggregates.length > 0 || p.groupBy.length > 0) {
    const pipeline: Record<string, unknown>[] = [];
    if (p.where) pipeline.push({ $match: whereToMongo(p.where) });
    if (p.groupBy.length > 0) {
      const groupId: Record<string, string> = {};
      p.groupBy.forEach(f => { groupId[f] = `$${f}`; });
      const group: Record<string, unknown> = { _id: Object.keys(groupId).length === 1 ? Object.values(groupId)[0] : groupId };
      p.aggregates.forEach(a => {
        const mongoOp = { COUNT: '$sum', SUM: '$sum', AVG: '$avg', MAX: '$max', MIN: '$min' }[a.fn] || '$sum';
        group[a.alias] = a.fn === 'COUNT' ? { [mongoOp]: 1 } : { [mongoOp]: `$${a.field}` };
      });
      pipeline.push({ $group: group });
    }
    if (p.orderBy.length > 0) {
      const sort: Record<string, number> = {};
      p.orderBy.forEach(o => { sort[o.field] = o.dir === 'DESC' ? -1 : 1; });
      pipeline.push({ $sort: sort });
    }
    if (p.limit) pipeline.push({ $limit: p.limit });
    return `db.${p.from}.aggregate(${JSON.stringify(pipeline, null, 2)})`;
  }

  const filter = p.where ? whereToMongo(p.where) : {};
  const projection: Record<string, number> = {};
  if (!p.select.includes('*')) p.select.forEach(f => { projection[f] = 1; });

  let query = `db.${p.from}.find(\n  ${JSON.stringify(filter, null, 2)}`;
  if (Object.keys(projection).length) query += `,\n  ${JSON.stringify(projection, null, 2)}`;
  query += '\n)';
  if (p.orderBy.length) {
    const sort: Record<string, number> = {};
    p.orderBy.forEach(o => { sort[o.field] = o.dir === 'DESC' ? -1 : 1; });
    query += `.sort(${JSON.stringify(sort)})`;
  }
  if (p.limit) query += `.limit(${p.limit})`;
  return query;
}

function whereToES(clause: WhereClause): Record<string, unknown> {
  if (clause.type === 'and') return { bool: { must: clause.children!.map(whereToES) } };
  if (clause.type === 'or') return { bool: { should: clause.children!.map(whereToES), minimum_should_match: 1 } };
  if (clause.type === 'not') return { bool: { must_not: [whereToES(clause.children![0])] } };

  const field = clause.field || '';
  const val = clause.value || '';
  const numVal = isNaN(Number(val)) ? val : Number(val);

  switch (clause.op) {
    case '=': return { term: { [field]: numVal } };
    case '!=': return { bool: { must_not: [{ term: { [field]: numVal } }] } };
    case '>': return { range: { [field]: { gt: numVal } } };
    case '<': return { range: { [field]: { lt: numVal } } };
    case '>=': return { range: { [field]: { gte: numVal } } };
    case '<=': return { range: { [field]: { lte: numVal } } };
    case 'LIKE': return { wildcard: { [field]: val.replace(/%/g, '*').replace(/_/g, '?') } };
    case 'IN': return { terms: { [field]: val.split(',').map(v => isNaN(Number(v.trim())) ? v.trim() : Number(v.trim())) } };
    case 'BETWEEN': { const [lo, hi] = val.split(','); return { range: { [field]: { gte: isNaN(Number(lo)) ? lo : Number(lo), lte: isNaN(Number(hi)) ? hi : Number(hi) } } }; }
    case 'IS NULL': return { bool: { must_not: [{ exists: { field } }] } };
    case 'IS NOT NULL': return { exists: { field } };
    default: return {};
  }
}

function toElasticsearch(p: ParsedSQL): string {
  const body: Record<string, unknown> = {};

  if (p.where) body.query = whereToES(p.where);
  else body.query = { match_all: {} };

  if (!p.select.includes('*') && p.aggregates.length === 0) {
    body._source = p.select;
  }

  if (p.orderBy.length > 0) {
    body.sort = p.orderBy.map(o => ({ [o.field]: { order: o.dir.toLowerCase() } }));
  }

  if (p.limit) body.size = p.limit;

  if (p.aggregates.length > 0) {
    const aggs: Record<string, unknown> = {};
    if (p.groupBy.length > 0) {
      aggs.group_by = {
        terms: { field: p.groupBy[0], size: p.limit || 10 },
        aggs: Object.fromEntries(p.aggregates.map(a => {
          const esAgg = { COUNT: 'value_count', SUM: 'sum', AVG: 'avg', MAX: 'max', MIN: 'min' }[a.fn] || 'value_count';
          return [a.alias, { [esAgg]: { field: a.field === '*' ? '_id' : a.field } }];
        })),
      };
    } else {
      p.aggregates.forEach(a => {
        const esAgg = { COUNT: 'value_count', SUM: 'sum', AVG: 'avg', MAX: 'max', MIN: 'min' }[a.fn] || 'value_count';
        aggs[a.alias] = { [esAgg]: { field: a.field === '*' ? '_id' : a.field } };
      });
    }
    body.aggs = aggs;
    body.size = 0;
  }

  return `GET /${p.from}/_search\n${JSON.stringify(body, null, 2)}`;
}

const SAMPLE_SQL = `SELECT name, email, age
FROM users
WHERE age >= 21 AND status = 'active' AND country IN ('US', 'UK')
ORDER BY age DESC
LIMIT 10`;

export default function SqlToNosql() {
  const [input, setInput] = useState('');
  const [tab, setTab] = useState(0);
  const [snackOpen, setSnackOpen] = useState(false);

  const parsed = useMemo(() => input.trim() ? parseSQL(input) : null, [input]);
  const mongoOutput = useMemo(() => parsed ? toMongoDB(parsed) : '', [parsed]);
  const esOutput = useMemo(() => parsed ? toElasticsearch(parsed) : '', [parsed]);
  const output = tab === 0 ? mongoOutput : esOutput;

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setSnackOpen(true);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'grey.300', p: 3 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Storage sx={{ color: '#8b5cf6' }} />
          <Typography variant="h5" fontWeight={700}>SQL to NoSQL Converter</Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Box>
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="grey.400">SQL Query</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" sx={{ borderColor: '#333', color: 'grey.400', textTransform: 'none' }} onClick={() => setInput(SAMPLE_SQL)}>Sample</Button>
                  <Button size="small" variant="outlined" sx={{ borderColor: '#333', color: 'grey.400', textTransform: 'none' }} onClick={() => setInput("SELECT department, COUNT(*) AS cnt, AVG(salary) AS avg_sal\nFROM employees\nWHERE status = 'active'\nGROUP BY department\nORDER BY cnt DESC\nLIMIT 5")}>Aggregate</Button>
                  <Tooltip title="Clear"><IconButton size="small" sx={{ color: 'grey.500' }} onClick={() => setInput('')}><Clear /></IconButton></Tooltip>
                </Box>
              </Box>
              <TextField
                multiline rows={8} fullWidth value={input} onChange={e => setInput(e.target.value)}
                placeholder="Enter SQL query here..."
                sx={{ '& .MuiInputBase-root': { bgcolor: '#0d0d0d', fontFamily: 'monospace', fontSize: 13, color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#222' } }}
              />
            </Paper>

            {parsed && (
              <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mt: 2 }}>
                <Typography variant="subtitle2" color="grey.400" mb={1}>Parsed Structure</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                  <Chip label={`FROM: ${parsed.from}`} size="small" sx={{ bgcolor: '#8b5cf620', color: '#8b5cf6' }} />
                  {parsed.select.length > 0 && <Chip label={`Fields: ${parsed.select.join(', ')}`} size="small" sx={{ bgcolor: '#3b82f620', color: '#3b82f6' }} />}
                  {parsed.where && <Chip label="WHERE" size="small" sx={{ bgcolor: '#f59e0b20', color: '#f59e0b' }} />}
                  {parsed.orderBy.length > 0 && <Chip label={`ORDER: ${parsed.orderBy.map(o => `${o.field} ${o.dir}`).join(', ')}`} size="small" sx={{ bgcolor: '#10b98120', color: '#10b981' }} />}
                  {parsed.limit && <Chip label={`LIMIT: ${parsed.limit}`} size="small" sx={{ bgcolor: '#ef444420', color: '#ef4444' }} />}
                  {parsed.groupBy.length > 0 && <Chip label={`GROUP BY: ${parsed.groupBy.join(', ')}`} size="small" sx={{ bgcolor: '#ec489920', color: '#ec4899' }} />}
                  {parsed.aggregates.map((a, i) => <Chip key={i} label={`${a.fn}(${a.field})`} size="small" sx={{ bgcolor: '#06b6d420', color: '#06b6d4' }} />)}
                </Box>
              </Paper>
            )}
          </Box>

          <Box>
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)}
                  sx={{ minHeight: 32, '& .MuiTab-root': { minHeight: 32, py: 0.5, textTransform: 'none', fontSize: 13, color: 'grey.500' }, '& .Mui-selected': { color: '#8b5cf6 !important' }, '& .MuiTabs-indicator': { bgcolor: '#8b5cf6' } }}>
                  <Tab label="MongoDB" />
                  <Tab label="Elasticsearch" />
                </Tabs>
                <Tooltip title="Copy"><IconButton size="small" sx={{ color: 'grey.500' }} onClick={copy}><ContentCopy /></IconButton></Tooltip>
              </Box>
              <Box sx={{ bgcolor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 1, p: 2, fontFamily: 'monospace', fontSize: 12, color: '#a5f3fc', whiteSpace: 'pre-wrap', minHeight: 400, maxHeight: 600, overflow: 'auto' }}>
                {output || <Typography color="grey.600" fontSize={13}>NoSQL query will appear here</Typography>}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
      <Snackbar open={snackOpen} autoHideDuration={2000} onClose={() => setSnackOpen(false)} message="Copied to clipboard" />
    </Box>
  );
}
