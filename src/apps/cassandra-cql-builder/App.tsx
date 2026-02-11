import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Chip,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { ContentCopy, Home, Add, Delete } from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface Column {
  id: number;
  name: string;
  type: string;
  collectionValueType: string;
}

interface ClusteringCol {
  name: string;
  order: 'ASC' | 'DESC';
}

const CQL_TYPES = ['text', 'int', 'bigint', 'float', 'double', 'boolean', 'timestamp', 'uuid', 'timeuuid', 'blob', 'counter', 'list', 'set', 'map', 'frozen'];
const REPLICATION_STRATEGIES = ['SimpleStrategy', 'NetworkTopologyStrategy'];
const COMPACTION_STRATEGIES = ['SizeTieredCompactionStrategy', 'LeveledCompactionStrategy', 'TimeWindowCompactionStrategy'];

export default function CassandraCQLBuilder() {
  const [tab, setTab] = useState(0);

  // Keyspace
  const [ksName, setKsName] = useState('my_keyspace');
  const [ksStrategy, setKsStrategy] = useState('SimpleStrategy');
  const [ksRF, setKsRF] = useState('3');
  const [ksDcRF, setKsDcRF] = useState<{ dc: string; rf: string }[]>([{ dc: 'dc1', rf: '3' }]);
  const [ksDurableWrites, setKsDurableWrites] = useState(true);

  // Table
  const [tableName, setTableName] = useState('my_table');
  const [columns, setColumns] = useState<Column[]>([
    { id: 1, name: 'id', type: 'uuid', collectionValueType: '' },
    { id: 2, name: 'name', type: 'text', collectionValueType: '' },
    { id: 3, name: 'created_at', type: 'timestamp', collectionValueType: '' },
  ]);
  const [partitionKeys, setPartitionKeys] = useState<string[]>(['id']);
  const [clusteringCols, setClusteringCols] = useState<ClusteringCol[]>([]);
  const [compaction, setCompaction] = useState('SizeTieredCompactionStrategy');
  const [compressionEnabled, setCompressionEnabled] = useState(true);
  const [ttl, setTtl] = useState('');

  // DML
  const [dmlTable, setDmlTable] = useState('my_table');
  const [dmlType, setDmlType] = useState<'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT'>('INSERT');
  const [dmlColumns, setDmlColumns] = useState('id, name, created_at');
  const [dmlValues, setDmlValues] = useState('uuid(), \'John\', toTimestamp(now())');
  const [dmlWhere, setDmlWhere] = useState('id = ?');
  const [dmlSet, setDmlSet] = useState('name = \'Jane\'');
  const [dmlTTL, setDmlTTL] = useState('');

  // MV
  const [mvName, setMvName] = useState('my_view');
  const [mvBaseTable, setMvBaseTable] = useState('my_table');
  const [mvSelect, setMvSelect] = useState('*');
  const [mvWhere, setMvWhere] = useState('name IS NOT NULL AND id IS NOT NULL');
  const [mvPK, setMvPK] = useState('name, id');

  // Index
  const [idxName, setIdxName] = useState('idx_name');
  const [idxTable, setIdxTable] = useState('my_table');
  const [idxColumn, setIdxColumn] = useState('name');

  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  let nextColId = columns.length > 0 ? Math.max(...columns.map((c) => c.id)) + 1 : 1;

  const addColumn = () => {
    setColumns([...columns, { id: nextColId, name: '', type: 'text', collectionValueType: '' }]);
  };

  const removeColumn = (id: number) => {
    setColumns(columns.filter((c) => c.id !== id));
    setPartitionKeys(partitionKeys.filter((pk) => pk !== columns.find((c) => c.id === id)?.name));
    setClusteringCols(clusteringCols.filter((cc) => cc.name !== columns.find((c) => c.id === id)?.name));
  };

  const updateColumn = (id: number, field: keyof Column, value: string) => {
    setColumns(columns.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const addDcRF = () => setKsDcRF([...ksDcRF, { dc: '', rf: '3' }]);
  const removeDcRF = (i: number) => setKsDcRF(ksDcRF.filter((_, idx) => idx !== i));

  const togglePartitionKey = (colName: string) => {
    if (partitionKeys.includes(colName)) {
      setPartitionKeys(partitionKeys.filter((pk) => pk !== colName));
    } else {
      setPartitionKeys([...partitionKeys, colName]);
      setClusteringCols(clusteringCols.filter((cc) => cc.name !== colName));
    }
  };

  const toggleClusteringCol = (colName: string) => {
    if (clusteringCols.find((cc) => cc.name === colName)) {
      setClusteringCols(clusteringCols.filter((cc) => cc.name !== colName));
    } else {
      setClusteringCols([...clusteringCols, { name: colName, order: 'ASC' }]);
      setPartitionKeys(partitionKeys.filter((pk) => pk !== colName));
    }
  };

  const getColumnTypeStr = (col: Column) => {
    if (['list', 'set'].includes(col.type)) return `${col.type}<${col.collectionValueType || 'text'}>`;
    if (col.type === 'map') return `map<${col.collectionValueType || 'text, text'}>`;
    if (col.type === 'frozen') return `frozen<${col.collectionValueType || 'list<text>'}>`;
    return col.type;
  };

  const keyspaceCQL = useMemo(() => {
    const replication = ksStrategy === 'SimpleStrategy'
      ? `{'class': 'SimpleStrategy', 'replication_factor': ${ksRF}}`
      : `{'class': 'NetworkTopologyStrategy', ${ksDcRF.map((d) => `'${d.dc}': ${d.rf}`).join(', ')}}`;
    return `CREATE KEYSPACE IF NOT EXISTS ${ksName}\n  WITH replication = ${replication}\n  AND durable_writes = ${ksDurableWrites};`;
  }, [ksName, ksStrategy, ksRF, ksDcRF, ksDurableWrites]);

  const tableCQL = useMemo(() => {
    if (columns.length === 0) return '-- Add columns to generate CQL';
    const colDefs = columns.map((c) => `  ${c.name} ${getColumnTypeStr(c)}`);
    const pk = partitionKeys.length > 1 ? `(${partitionKeys.join(', ')})` : partitionKeys[0] || 'id';
    const clustering = clusteringCols.map((cc) => cc.name);
    const primaryKey = clustering.length > 0 ? `(${pk}, ${clustering.join(', ')})` : `(${pk})`;
    let cql = `CREATE TABLE IF NOT EXISTS ${tableName} (\n${colDefs.join(',\n')},\n  PRIMARY KEY ${primaryKey}\n)`;
    const withClauses: string[] = [];
    if (clusteringCols.length > 0) {
      const orderStr = clusteringCols.map((cc) => `${cc.name} ${cc.order}`).join(', ');
      withClauses.push(`CLUSTERING ORDER BY (${orderStr})`);
    }
    withClauses.push(`compaction = {'class': '${compaction}'}`);
    if (compressionEnabled) withClauses.push(`compression = {'class': 'LZ4Compressor'}`);
    if (ttl) withClauses.push(`default_time_to_live = ${ttl}`);
    cql += `\n  WITH ${withClauses.join('\n  AND ')};`;
    return cql;
  }, [columns, tableName, partitionKeys, clusteringCols, compaction, compressionEnabled, ttl]);

  const dmlCQL = useMemo(() => {
    const ttlStr = dmlTTL ? ` USING TTL ${dmlTTL}` : '';
    switch (dmlType) {
      case 'INSERT': return `INSERT INTO ${dmlTable} (${dmlColumns})\n  VALUES (${dmlValues})${ttlStr};`;
      case 'UPDATE': return `UPDATE ${dmlTable}${ttlStr}\n  SET ${dmlSet}\n  WHERE ${dmlWhere};`;
      case 'DELETE': return `DELETE FROM ${dmlTable}\n  WHERE ${dmlWhere};`;
      case 'SELECT': return `SELECT ${dmlColumns}\n  FROM ${dmlTable}\n  WHERE ${dmlWhere};`;
    }
  }, [dmlType, dmlTable, dmlColumns, dmlValues, dmlWhere, dmlSet, dmlTTL]);

  const mvCQL = useMemo(() =>
    `CREATE MATERIALIZED VIEW IF NOT EXISTS ${mvName} AS\n  SELECT ${mvSelect}\n  FROM ${mvBaseTable}\n  WHERE ${mvWhere}\n  PRIMARY KEY (${mvPK});`,
    [mvName, mvBaseTable, mvSelect, mvWhere, mvPK]);

  const idxCQL = useMemo(() =>
    `CREATE INDEX IF NOT EXISTS ${idxName}\n  ON ${idxTable} (${idxColumn});`,
    [idxName, idxTable, idxColumn]);

  const allCQL = [keyspaceCQL, '', tableCQL, '', mvCQL, '', idxCQL].join('\n');

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copied to clipboard' });
  };

  const fieldSx = { mb: 1, '& .MuiInputBase-root': { color: 'grey.300', fontSize: 13 }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } };
  const selSx = { color: 'grey.300', '.MuiOutlinedInput-notchedOutline': { borderColor: '#333' } };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>Cassandra CQL Builder</Typography>
          </Box>
          <Button startIcon={<ContentCopy />} onClick={() => handleCopy(allCQL)} sx={{ color: 'grey.400' }}>Copy All</Button>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, p: 2, height: 'calc(100vh - 80px)' }}>
        {/* Left panel - controls */}
        <Paper sx={{ width: 420, bgcolor: '#111', border: '1px solid #222', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
            sx={{ borderBottom: '1px solid #222', '& .MuiTab-root': { color: 'grey.500', fontSize: 12, minHeight: 42 } }}>
            <Tab label="Keyspace" />
            <Tab label="Table" />
            <Tab label="DML" />
            <Tab label="MV" />
            <Tab label="Index" />
          </Tabs>

          <Box sx={{ p: 2, overflowY: 'auto', flex: 1 }}>
            {tab === 0 && (
              <>
                <TextField size="small" fullWidth label="Keyspace Name" value={ksName} onChange={(e) => setKsName(e.target.value)} sx={fieldSx} />
                <FormControl size="small" fullWidth sx={{ mb: 1 }}>
                  <InputLabel sx={{ color: 'grey.500' }}>Replication Strategy</InputLabel>
                  <Select value={ksStrategy} label="Replication Strategy" onChange={(e) => setKsStrategy(e.target.value)} sx={selSx}>
                    {REPLICATION_STRATEGIES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
                {ksStrategy === 'SimpleStrategy' ? (
                  <TextField size="small" fullWidth label="Replication Factor" value={ksRF} onChange={(e) => setKsRF(e.target.value)} sx={fieldSx} />
                ) : (
                  <>
                    {ksDcRF.map((d, i) => (
                      <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <TextField size="small" label="DC" value={d.dc} onChange={(e) => { const u = [...ksDcRF]; u[i].dc = e.target.value; setKsDcRF(u); }} sx={{ ...fieldSx, flex: 1 }} />
                        <TextField size="small" label="RF" value={d.rf} onChange={(e) => { const u = [...ksDcRF]; u[i].rf = e.target.value; setKsDcRF(u); }} sx={{ ...fieldSx, width: 60 }} />
                        <IconButton size="small" onClick={() => removeDcRF(i)} sx={{ color: 'grey.500' }}><Delete fontSize="small" /></IconButton>
                      </Box>
                    ))}
                    <Button size="small" startIcon={<Add />} onClick={addDcRF} sx={{ color: 'grey.400', mb: 1 }}>Add DC</Button>
                  </>
                )}
                <FormControlLabel control={<Switch checked={ksDurableWrites} onChange={(e) => setKsDurableWrites(e.target.checked)} size="small" />}
                  label="Durable Writes" sx={{ color: 'grey.400' }} />
              </>
            )}

            {tab === 1 && (
              <>
                <TextField size="small" fullWidth label="Table Name" value={tableName} onChange={(e) => setTableName(e.target.value)} sx={fieldSx} />
                <Typography variant="caption" sx={{ color: 'grey.500', display: 'block', mb: 1 }}>Columns</Typography>
                {columns.map((col) => (
                  <Box key={col.id} sx={{ display: 'flex', gap: 0.5, mb: 1, alignItems: 'center' }}>
                    <TextField size="small" value={col.name} onChange={(e) => updateColumn(col.id, 'name', e.target.value)} placeholder="name"
                      sx={{ ...fieldSx, flex: 1, mb: 0 }} />
                    <FormControl size="small" sx={{ width: 110 }}>
                      <Select value={col.type} onChange={(e) => updateColumn(col.id, 'type', e.target.value)} sx={{ ...selSx, fontSize: 12 }}>
                        {CQL_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                      </Select>
                    </FormControl>
                    {['list', 'set', 'map', 'frozen'].includes(col.type) && (
                      <TextField size="small" value={col.collectionValueType} onChange={(e) => updateColumn(col.id, 'collectionValueType', e.target.value)}
                        placeholder="inner type" sx={{ ...fieldSx, width: 80, mb: 0 }} />
                    )}
                    <Tooltip title="Partition Key">
                      <Chip label="PK" size="small" onClick={() => togglePartitionKey(col.name)}
                        sx={{ bgcolor: partitionKeys.includes(col.name) ? '#1a3a5c' : '#222', color: partitionKeys.includes(col.name) ? '#61afef' : 'grey.600', cursor: 'pointer', fontSize: 10, height: 24 }} />
                    </Tooltip>
                    <Tooltip title="Clustering Column">
                      <Chip label="CK" size="small" onClick={() => toggleClusteringCol(col.name)}
                        sx={{ bgcolor: clusteringCols.find((cc) => cc.name === col.name) ? '#2e1a1a' : '#222', color: clusteringCols.find((cc) => cc.name === col.name) ? '#e06c75' : 'grey.600', cursor: 'pointer', fontSize: 10, height: 24 }} />
                    </Tooltip>
                    <IconButton size="small" onClick={() => removeColumn(col.id)} sx={{ color: 'grey.600' }}><Delete sx={{ fontSize: 16 }} /></IconButton>
                  </Box>
                ))}
                <Button size="small" startIcon={<Add />} onClick={addColumn} sx={{ color: 'grey.400', mb: 2 }}>Add Column</Button>

                {clusteringCols.length > 0 && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ color: 'grey.500', display: 'block', mb: 0.5 }}>Clustering Order</Typography>
                    {clusteringCols.map((cc, i) => (
                      <Box key={cc.name} sx={{ display: 'flex', gap: 1, mb: 0.5, alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ color: 'grey.400', width: 80 }}>{cc.name}</Typography>
                        <FormControl size="small" sx={{ width: 80 }}>
                          <Select value={cc.order} onChange={(e) => { const u = [...clusteringCols]; u[i].order = e.target.value as 'ASC' | 'DESC'; setClusteringCols(u); }} sx={{ ...selSx, fontSize: 12 }}>
                            <MenuItem value="ASC">ASC</MenuItem>
                            <MenuItem value="DESC">DESC</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    ))}
                  </Box>
                )}
                <FormControl size="small" fullWidth sx={{ mb: 1 }}>
                  <InputLabel sx={{ color: 'grey.500' }}>Compaction</InputLabel>
                  <Select value={compaction} label="Compaction" onChange={(e) => setCompaction(e.target.value)} sx={selSx}>
                    {COMPACTION_STRATEGIES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControlLabel control={<Switch checked={compressionEnabled} onChange={(e) => setCompressionEnabled(e.target.checked)} size="small" />}
                  label="Compression (LZ4)" sx={{ color: 'grey.400', display: 'block', mb: 1 }} />
                <TextField size="small" fullWidth label="Default TTL (seconds)" value={ttl} onChange={(e) => setTtl(e.target.value)} sx={fieldSx} />
              </>
            )}

            {tab === 2 && (
              <>
                <FormControl size="small" fullWidth sx={{ mb: 1 }}>
                  <InputLabel sx={{ color: 'grey.500' }}>Statement Type</InputLabel>
                  <Select value={dmlType} label="Statement Type" onChange={(e) => setDmlType(e.target.value as typeof dmlType)} sx={selSx}>
                    <MenuItem value="INSERT">INSERT</MenuItem>
                    <MenuItem value="UPDATE">UPDATE</MenuItem>
                    <MenuItem value="DELETE">DELETE</MenuItem>
                    <MenuItem value="SELECT">SELECT</MenuItem>
                  </Select>
                </FormControl>
                <TextField size="small" fullWidth label="Table" value={dmlTable} onChange={(e) => setDmlTable(e.target.value)} sx={fieldSx} />
                {(dmlType === 'INSERT' || dmlType === 'SELECT') && (
                  <TextField size="small" fullWidth label="Columns" value={dmlColumns} onChange={(e) => setDmlColumns(e.target.value)} sx={fieldSx} />
                )}
                {dmlType === 'INSERT' && (
                  <TextField size="small" fullWidth label="Values" value={dmlValues} onChange={(e) => setDmlValues(e.target.value)} sx={fieldSx} />
                )}
                {dmlType === 'UPDATE' && (
                  <TextField size="small" fullWidth label="SET clause" value={dmlSet} onChange={(e) => setDmlSet(e.target.value)} sx={fieldSx} />
                )}
                {dmlType !== 'INSERT' && (
                  <TextField size="small" fullWidth label="WHERE clause" value={dmlWhere} onChange={(e) => setDmlWhere(e.target.value)} sx={fieldSx} />
                )}
                {(dmlType === 'INSERT' || dmlType === 'UPDATE') && (
                  <TextField size="small" fullWidth label="TTL (seconds)" value={dmlTTL} onChange={(e) => setDmlTTL(e.target.value)} sx={fieldSx} />
                )}
              </>
            )}

            {tab === 3 && (
              <>
                <TextField size="small" fullWidth label="View Name" value={mvName} onChange={(e) => setMvName(e.target.value)} sx={fieldSx} />
                <TextField size="small" fullWidth label="Base Table" value={mvBaseTable} onChange={(e) => setMvBaseTable(e.target.value)} sx={fieldSx} />
                <TextField size="small" fullWidth label="SELECT columns" value={mvSelect} onChange={(e) => setMvSelect(e.target.value)} sx={fieldSx} />
                <TextField size="small" fullWidth label="WHERE clause" value={mvWhere} onChange={(e) => setMvWhere(e.target.value)} sx={fieldSx} />
                <TextField size="small" fullWidth label="PRIMARY KEY" value={mvPK} onChange={(e) => setMvPK(e.target.value)} sx={fieldSx} />
              </>
            )}

            {tab === 4 && (
              <>
                <TextField size="small" fullWidth label="Index Name" value={idxName} onChange={(e) => setIdxName(e.target.value)} sx={fieldSx} />
                <TextField size="small" fullWidth label="Table" value={idxTable} onChange={(e) => setIdxTable(e.target.value)} sx={fieldSx} />
                <TextField size="small" fullWidth label="Column" value={idxColumn} onChange={(e) => setIdxColumn(e.target.value)} sx={fieldSx} />
              </>
            )}
          </Box>
        </Paper>

        {/* Right panel - output */}
        <Paper sx={{ flex: 1, bgcolor: '#111', border: '1px solid #222', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #222' }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Generated CQL</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[
                { label: 'Keyspace', cql: keyspaceCQL },
                { label: 'Table', cql: tableCQL },
                { label: 'DML', cql: dmlCQL },
                { label: 'MV', cql: mvCQL },
                { label: 'Index', cql: idxCQL },
              ].map((item) => (
                <Tooltip key={item.label} title={`Copy ${item.label}`}>
                  <Chip label={item.label} size="small" onClick={() => handleCopy(item.cql)}
                    sx={{ bgcolor: '#222', color: 'grey.400', cursor: 'pointer', '&:hover': { bgcolor: '#333' } }} />
                </Tooltip>
              ))}
            </Box>
          </Box>
          <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
            <Typography variant="caption" sx={{ color: '#61afef', fontWeight: 600 }}>-- Keyspace</Typography>
            <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 12, color: '#98c379', whiteSpace: 'pre-wrap', m: 0, mb: 2 }}>{keyspaceCQL}</Typography>
            <Typography variant="caption" sx={{ color: '#61afef', fontWeight: 600 }}>-- Table</Typography>
            <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 12, color: '#98c379', whiteSpace: 'pre-wrap', m: 0, mb: 2 }}>{tableCQL}</Typography>
            <Typography variant="caption" sx={{ color: '#61afef', fontWeight: 600 }}>-- DML Statement</Typography>
            <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 12, color: '#e5c07b', whiteSpace: 'pre-wrap', m: 0, mb: 2 }}>{dmlCQL}</Typography>
            <Typography variant="caption" sx={{ color: '#61afef', fontWeight: 600 }}>-- Materialized View</Typography>
            <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 12, color: '#c678dd', whiteSpace: 'pre-wrap', m: 0, mb: 2 }}>{mvCQL}</Typography>
            <Typography variant="caption" sx={{ color: '#61afef', fontWeight: 600 }}>-- Index</Typography>
            <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 12, color: '#56b6c2', whiteSpace: 'pre-wrap', m: 0 }}>{idxCQL}</Typography>
          </Box>
        </Paper>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
