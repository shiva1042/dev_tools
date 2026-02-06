import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Snackbar,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ContentCopy,
  Home,
  Add,
  Delete,
  PlayArrow,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

type QueryType = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
type JoinType = 'INNER JOIN' | 'LEFT JOIN' | 'RIGHT JOIN' | 'FULL OUTER JOIN';
type OrderDirection = 'ASC' | 'DESC';
type Operator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN' | 'IS NULL' | 'IS NOT NULL' | 'BETWEEN';

interface Column {
  id: string;
  name: string;
  alias?: string;
  aggregate?: string;
}

interface WhereCondition {
  id: string;
  column: string;
  operator: Operator;
  value: string;
  conjunction: 'AND' | 'OR';
}

interface JoinClause {
  id: string;
  type: JoinType;
  table: string;
  alias?: string;
  on: string;
}

interface OrderByClause {
  id: string;
  column: string;
  direction: OrderDirection;
}

const aggregates = ['', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'DISTINCT'];
const operators: Operator[] = ['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'IN', 'IS NULL', 'IS NOT NULL', 'BETWEEN'];

export default function SqlBuilder() {
  const [queryType, setQueryType] = useState<QueryType>('SELECT');
  const [tableName, setTableName] = useState<string>('users');
  const [tableAlias, setTableAlias] = useState<string>('u');
  const [columns, setColumns] = useState<Column[]>([
    { id: '1', name: 'id', alias: '' },
    { id: '2', name: 'name', alias: '' },
    { id: '3', name: 'email', alias: '' },
  ]);
  const [conditions, setConditions] = useState<WhereCondition[]>([]);
  const [joins, setJoins] = useState<JoinClause[]>([]);
  const [orderBy, setOrderBy] = useState<OrderByClause[]>([]);
  const [groupBy, setGroupBy] = useState<string[]>([]);
  const [limit, setLimit] = useState<string>('');
  const [offset, setOffset] = useState<string>('');
  const [insertColumns, setInsertColumns] = useState<string>('name, email');
  const [insertValues, setInsertValues] = useState<string>("'John Doe', 'john@example.com'");
  const [updateSets, setUpdateSets] = useState<{ column: string; value: string }[]>([{ column: 'name', value: "'Updated Name'" }]);
  const [tab, setTab] = useState<'columns' | 'where' | 'joins' | 'order' | 'group'>('columns');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const generatedSQL = useMemo(() => {
    let sql = '';
    const alias = tableAlias ? ` ${tableAlias}` : '';
    const table = `${tableName}${alias}`;

    switch (queryType) {
      case 'SELECT': {
        // SELECT columns
        const colsStr = columns.length === 0 ? '*' : columns.map(c => {
          let col = c.name;
          if (c.aggregate) col = `${c.aggregate}(${col})`;
          if (c.alias) col = `${col} AS ${c.alias}`;
          return col;
        }).join(',\n       ');

        sql = `SELECT ${colsStr}\n  FROM ${table}`;

        // JOINs
        if (joins.length > 0) {
          joins.forEach(j => {
            const joinAlias = j.alias ? ` ${j.alias}` : '';
            sql += `\n  ${j.type} ${j.table}${joinAlias} ON ${j.on}`;
          });
        }

        // WHERE
        if (conditions.length > 0) {
          sql += '\n WHERE ';
          conditions.forEach((c, i) => {
            if (i > 0) sql += `\n   ${c.conjunction} `;
            let condition = `${c.column} ${c.operator}`;
            if (!['IS NULL', 'IS NOT NULL'].includes(c.operator)) {
              condition += ` ${c.value}`;
            }
            sql += condition;
          });
        }

        // GROUP BY
        if (groupBy.length > 0) {
          sql += `\n GROUP BY ${groupBy.join(', ')}`;
        }

        // ORDER BY
        if (orderBy.length > 0) {
          sql += '\n ORDER BY ' + orderBy.map(o => `${o.column} ${o.direction}`).join(', ');
        }

        // LIMIT & OFFSET
        if (limit) sql += `\n LIMIT ${limit}`;
        if (offset) sql += `\n OFFSET ${offset}`;

        break;
      }
      case 'INSERT': {
        sql = `INSERT INTO ${tableName} (${insertColumns})\nVALUES (${insertValues});`;
        break;
      }
      case 'UPDATE': {
        sql = `UPDATE ${tableName}\n   SET `;
        sql += updateSets.map(s => `${s.column} = ${s.value}`).join(',\n       ');
        if (conditions.length > 0) {
          sql += '\n WHERE ';
          conditions.forEach((c, i) => {
            if (i > 0) sql += `\n   ${c.conjunction} `;
            let condition = `${c.column} ${c.operator}`;
            if (!['IS NULL', 'IS NOT NULL'].includes(c.operator)) {
              condition += ` ${c.value}`;
            }
            sql += condition;
          });
        }
        sql += ';';
        break;
      }
      case 'DELETE': {
        sql = `DELETE FROM ${tableName}`;
        if (conditions.length > 0) {
          sql += '\n WHERE ';
          conditions.forEach((c, i) => {
            if (i > 0) sql += `\n   ${c.conjunction} `;
            let condition = `${c.column} ${c.operator}`;
            if (!['IS NULL', 'IS NOT NULL'].includes(c.operator)) {
              condition += ` ${c.value}`;
            }
            sql += condition;
          });
        }
        sql += ';';
        break;
      }
    }

    return sql + (queryType === 'SELECT' ? ';' : '');
  }, [queryType, tableName, tableAlias, columns, conditions, joins, orderBy, groupBy, limit, offset, insertColumns, insertValues, updateSets]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedSQL);
    setSnackbar({ open: true, message: 'Copied to clipboard' });
  };

  const addColumn = () => setColumns([...columns, { id: String(Date.now()), name: 'column_name', alias: '' }]);
  const removeColumn = (id: string) => setColumns(columns.filter(c => c.id !== id));
  const updateColumn = (id: string, field: keyof Column, value: string) => setColumns(columns.map(c => c.id === id ? { ...c, [field]: value } : c));

  const addCondition = () => setConditions([...conditions, { id: String(Date.now()), column: 'column', operator: '=', value: "'value'", conjunction: 'AND' }]);
  const removeCondition = (id: string) => setConditions(conditions.filter(c => c.id !== id));
  const updateCondition = (id: string, field: keyof WhereCondition, value: string) => setConditions(conditions.map(c => c.id === id ? { ...c, [field]: value } : c));

  const addJoin = () => setJoins([...joins, { id: String(Date.now()), type: 'INNER JOIN', table: 'table_name', alias: 't', on: `${tableAlias}.id = t.user_id` }]);
  const removeJoin = (id: string) => setJoins(joins.filter(j => j.id !== id));
  const updateJoin = (id: string, field: keyof JoinClause, value: string) => setJoins(joins.map(j => j.id === id ? { ...j, [field]: value } : j));

  const addOrderBy = () => setOrderBy([...orderBy, { id: String(Date.now()), column: 'column_name', direction: 'ASC' }]);
  const removeOrderBy = (id: string) => setOrderBy(orderBy.filter(o => o.id !== id));
  const updateOrderBy = (id: string, field: keyof OrderByClause, value: string) => setOrderBy(orderBy.map(o => o.id === id ? { ...o, [field]: value } : o));

  const addUpdateSet = () => setUpdateSets([...updateSets, { column: 'column', value: "'value'" }]);
  const removeUpdateSet = (idx: number) => setUpdateSets(updateSets.filter((_, i) => i !== idx));
  const updateUpdateSet = (idx: number, field: 'column' | 'value', value: string) => setUpdateSets(updateSets.map((s, i) => i === idx ? { ...s, [field]: value } : s));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>SQL Query Builder</Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
        {/* Builder Panel */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Query Type & Table */}
          <Paper sx={{ bgcolor: '#111', borderBottom: '1px solid #222', p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ width: 150 }}>
                <InputLabel sx={{ color: 'grey.500' }}>Query Type</InputLabel>
                <Select value={queryType} label="Query Type" onChange={(e) => setQueryType(e.target.value as QueryType)} sx={{ color: 'grey.300' }}>
                  {['SELECT', 'INSERT', 'UPDATE', 'DELETE'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField size="small" label="Table Name" value={tableName} onChange={(e) => setTableName(e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
              {queryType === 'SELECT' && (
                <TextField size="small" label="Alias" value={tableAlias} onChange={(e) => setTableAlias(e.target.value)} sx={{ width: 100, '& .MuiInputBase-root': { color: 'grey.300' } }} />
              )}
            </Box>
          </Paper>

          {/* Tabs */}
          {queryType === 'SELECT' && (
            <Paper sx={{ bgcolor: '#0d0d0d', borderBottom: '1px solid #222' }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ '& .MuiTab-root': { color: 'grey.500' } }}>
                <Tab label={`Columns (${columns.length})`} value="columns" />
                <Tab label={`Where (${conditions.length})`} value="where" />
                <Tab label={`Joins (${joins.length})`} value="joins" />
                <Tab label={`Order (${orderBy.length})`} value="order" />
                <Tab label="Options" value="group" />
              </Tabs>
            </Paper>
          )}

          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {queryType === 'SELECT' && tab === 'columns' && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                  <Button size="small" startIcon={<Add />} onClick={addColumn} sx={{ color: 'grey.400' }}>Add Column</Button>
                </Box>
                {columns.map(col => (
                  <Box key={col.id} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                    <FormControl size="small" sx={{ width: 120 }}>
                      <InputLabel sx={{ color: 'grey.500' }}>Aggregate</InputLabel>
                      <Select value={col.aggregate || ''} label="Aggregate" onChange={(e) => updateColumn(col.id, 'aggregate', e.target.value)} sx={{ color: 'grey.300' }}>
                        {aggregates.map(a => <MenuItem key={a} value={a}>{a || 'None'}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <TextField size="small" label="Column" value={col.name} onChange={(e) => updateColumn(col.id, 'name', e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                    <TextField size="small" label="Alias" value={col.alias || ''} onChange={(e) => updateColumn(col.id, 'alias', e.target.value)} sx={{ width: 120, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                    <IconButton size="small" onClick={() => removeColumn(col.id)} sx={{ color: 'grey.500' }}><Delete fontSize="small" /></IconButton>
                  </Box>
                ))}
              </Box>
            )}

            {(queryType === 'SELECT' && tab === 'where') || queryType === 'UPDATE' || queryType === 'DELETE' ? (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                  <Button size="small" startIcon={<Add />} onClick={addCondition} sx={{ color: 'grey.400' }}>Add Condition</Button>
                </Box>
                {conditions.map((cond, i) => (
                  <Box key={cond.id} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                    {i > 0 && (
                      <FormControl size="small" sx={{ width: 80 }}>
                        <Select value={cond.conjunction} onChange={(e) => updateCondition(cond.id, 'conjunction', e.target.value)} sx={{ color: 'grey.300' }}>
                          <MenuItem value="AND">AND</MenuItem>
                          <MenuItem value="OR">OR</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                    <TextField size="small" label="Column" value={cond.column} onChange={(e) => updateCondition(cond.id, 'column', e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                    <FormControl size="small" sx={{ width: 140 }}>
                      <Select value={cond.operator} onChange={(e) => updateCondition(cond.id, 'operator', e.target.value)} sx={{ color: 'grey.300' }}>
                        {operators.map(op => <MenuItem key={op} value={op}>{op}</MenuItem>)}
                      </Select>
                    </FormControl>
                    {!['IS NULL', 'IS NOT NULL'].includes(cond.operator) && (
                      <TextField size="small" label="Value" value={cond.value} onChange={(e) => updateCondition(cond.id, 'value', e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                    )}
                    <IconButton size="small" onClick={() => removeCondition(cond.id)} sx={{ color: 'grey.500' }}><Delete fontSize="small" /></IconButton>
                  </Box>
                ))}
              </Box>
            ) : null}

            {queryType === 'SELECT' && tab === 'joins' && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                  <Button size="small" startIcon={<Add />} onClick={addJoin} sx={{ color: 'grey.400' }}>Add Join</Button>
                </Box>
                {joins.map(join => (
                  <Paper key={join.id} sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <FormControl size="small" sx={{ width: 180 }}>
                        <InputLabel sx={{ color: 'grey.500' }}>Join Type</InputLabel>
                        <Select value={join.type} label="Join Type" onChange={(e) => updateJoin(join.id, 'type', e.target.value)} sx={{ color: 'grey.300' }}>
                          {(['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'] as JoinType[]).map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                        </Select>
                      </FormControl>
                      <TextField size="small" label="Table" value={join.table} onChange={(e) => updateJoin(join.id, 'table', e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                      <TextField size="small" label="Alias" value={join.alias || ''} onChange={(e) => updateJoin(join.id, 'alias', e.target.value)} sx={{ width: 80, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                      <IconButton size="small" onClick={() => removeJoin(join.id)} sx={{ color: 'grey.500' }}><Delete fontSize="small" /></IconButton>
                    </Box>
                    <TextField fullWidth size="small" label="ON Condition" value={join.on} onChange={(e) => updateJoin(join.id, 'on', e.target.value)} sx={{ '& .MuiInputBase-root': { color: 'grey.300', fontFamily: 'monospace' } }} />
                  </Paper>
                ))}
              </Box>
            )}

            {queryType === 'SELECT' && tab === 'order' && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                  <Button size="small" startIcon={<Add />} onClick={addOrderBy} sx={{ color: 'grey.400' }}>Add Order</Button>
                </Box>
                {orderBy.map(order => (
                  <Box key={order.id} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                    <TextField size="small" label="Column" value={order.column} onChange={(e) => updateOrderBy(order.id, 'column', e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                    <FormControl size="small" sx={{ width: 100 }}>
                      <Select value={order.direction} onChange={(e) => updateOrderBy(order.id, 'direction', e.target.value)} sx={{ color: 'grey.300' }}>
                        <MenuItem value="ASC">ASC</MenuItem>
                        <MenuItem value="DESC">DESC</MenuItem>
                      </Select>
                    </FormControl>
                    <IconButton size="small" onClick={() => removeOrderBy(order.id)} sx={{ color: 'grey.500' }}><Delete fontSize="small" /></IconButton>
                  </Box>
                ))}
              </Box>
            )}

            {queryType === 'SELECT' && tab === 'group' && (
              <Box>
                <TextField fullWidth size="small" label="GROUP BY (comma-separated)" value={groupBy.join(', ')} onChange={(e) => setGroupBy(e.target.value.split(',').map(s => s.trim()).filter(Boolean))} sx={{ mb: 2, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField size="small" label="LIMIT" value={limit} onChange={(e) => setLimit(e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                  <TextField size="small" label="OFFSET" value={offset} onChange={(e) => setOffset(e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                </Box>
              </Box>
            )}

            {queryType === 'INSERT' && (
              <Box>
                <TextField fullWidth size="small" label="Columns (comma-separated)" value={insertColumns} onChange={(e) => setInsertColumns(e.target.value)} sx={{ mb: 2, '& .MuiInputBase-root': { color: 'grey.300', fontFamily: 'monospace' } }} />
                <TextField fullWidth size="small" label="Values (comma-separated)" value={insertValues} onChange={(e) => setInsertValues(e.target.value)} sx={{ '& .MuiInputBase-root': { color: 'grey.300', fontFamily: 'monospace' } }} />
              </Box>
            )}

            {queryType === 'UPDATE' && (
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 2 }}>SET Clauses</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                  <Button size="small" startIcon={<Add />} onClick={addUpdateSet} sx={{ color: 'grey.400' }}>Add SET</Button>
                </Box>
                {updateSets.map((set, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                    <TextField size="small" label="Column" value={set.column} onChange={(e) => updateUpdateSet(idx, 'column', e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                    <Typography sx={{ color: 'grey.500' }}>=</Typography>
                    <TextField size="small" label="Value" value={set.value} onChange={(e) => updateUpdateSet(idx, 'value', e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                    <IconButton size="small" onClick={() => removeUpdateSet(idx)} sx={{ color: 'grey.500' }}><Delete fontSize="small" /></IconButton>
                  </Box>
                ))}
                <Typography variant="subtitle2" sx={{ color: 'grey.400', mt: 3, mb: 2 }}>WHERE Conditions</Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* SQL Output */}
        <Box sx={{ width: 450, borderLeft: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #222' }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Generated SQL</Typography>
            <Tooltip title="Copy">
              <IconButton size="small" onClick={handleCopy} sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
            <Paper sx={{ bgcolor: '#0a0a0a', p: 2, border: '1px solid #333', height: '100%' }}>
              <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 14, color: '#d4d4d4', m: 0, whiteSpace: 'pre-wrap' }}>
                {generatedSQL}
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
