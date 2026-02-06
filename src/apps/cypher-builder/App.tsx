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
  Snackbar,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ContentCopy,
  Home,
  Add,
  Delete,
  Download,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface Node {
  id: string;
  variable: string;
  label: string;
  properties: { key: string; value: string; parameterized: boolean }[];
}

interface Relationship {
  id: string;
  variable: string;
  type: string;
  direction: 'outgoing' | 'incoming' | 'undirected';
  fromNode: string;
  toNode: string;
  properties: { key: string; value: string; parameterized: boolean }[];
}

interface ReturnField {
  expression: string;
  alias: string;
}

type QueryType = 'match' | 'create' | 'merge' | 'delete';

export default function CypherBuilder() {
  const [queryType, setQueryType] = useState<QueryType>('match');
  const [nodes, setNodes] = useState<Node[]>([
    { id: '1', variable: 'n', label: 'Person', properties: [{ key: 'name', value: '$name', parameterized: true }] },
  ]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [returnFields, setReturnFields] = useState<ReturnField[]>([{ expression: 'n', alias: '' }]);
  const [whereClause, setWhereClause] = useState('');
  const [orderBy, setOrderBy] = useState('');
  const [limit, setLimit] = useState<number | ''>('');
  const [skip, setSkip] = useState<number | ''>('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const cypherQuery = useMemo(() => {
    let query = '';

    // Build node patterns
    const nodePatterns = nodes.map(node => {
      let pattern = `(${node.variable}`;
      if (node.label) pattern += `:${node.label}`;
      if (node.properties.length > 0) {
        const props = node.properties
          .map(p => `${p.key}: ${p.parameterized ? p.value : `'${p.value}'`}`)
          .join(', ');
        pattern += ` {${props}}`;
      }
      pattern += ')';
      return pattern;
    });

    // Build relationship patterns
    const relPatterns = relationships.map(rel => {
      const fromNode = nodes.find(n => n.id === rel.fromNode);
      const toNode = nodes.find(n => n.id === rel.toNode);
      if (!fromNode || !toNode) return '';

      let relPattern = `[${rel.variable}`;
      if (rel.type) relPattern += `:${rel.type}`;
      if (rel.properties.length > 0) {
        const props = rel.properties
          .map(p => `${p.key}: ${p.parameterized ? p.value : `'${p.value}'`}`)
          .join(', ');
        relPattern += ` {${props}}`;
      }
      relPattern += ']';

      const fromPattern = `(${fromNode.variable})`;
      const toPattern = `(${toNode.variable})`;

      switch (rel.direction) {
        case 'outgoing':
          return `${fromPattern}-${relPattern}->${toPattern}`;
        case 'incoming':
          return `${fromPattern}<-${relPattern}-${toPattern}`;
        default:
          return `${fromPattern}-${relPattern}-${toPattern}`;
      }
    });

    // Build query based on type
    switch (queryType) {
      case 'match':
        query = 'MATCH ';
        if (relPatterns.length > 0) {
          query += relPatterns.join(', ');
        } else {
          query += nodePatterns.join(', ');
        }
        break;
      case 'create':
        query = 'CREATE ';
        if (relPatterns.length > 0) {
          query += relPatterns.join(', ');
        } else {
          query += nodePatterns.join(', ');
        }
        break;
      case 'merge':
        query = 'MERGE ';
        if (relPatterns.length > 0) {
          query += relPatterns.join('\nMERGE ');
        } else {
          query += nodePatterns.join('\nMERGE ');
        }
        break;
      case 'delete':
        query = 'MATCH ';
        if (relPatterns.length > 0) {
          query += relPatterns.join(', ');
        } else {
          query += nodePatterns.join(', ');
        }
        break;
    }

    // Add WHERE clause
    if (whereClause) {
      query += `\nWHERE ${whereClause}`;
    }

    // Add DELETE for delete queries
    if (queryType === 'delete') {
      const varsToDelete = [...nodes.map(n => n.variable), ...relationships.map(r => r.variable)].filter(Boolean);
      query += `\nDETACH DELETE ${varsToDelete.join(', ')}`;
    }

    // Add RETURN clause for match queries
    if (queryType === 'match' && returnFields.length > 0) {
      const returns = returnFields
        .filter(f => f.expression)
        .map(f => f.alias ? `${f.expression} AS ${f.alias}` : f.expression)
        .join(', ');
      if (returns) query += `\nRETURN ${returns}`;
    }

    // Add ORDER BY
    if (orderBy && queryType === 'match') {
      query += `\nORDER BY ${orderBy}`;
    }

    // Add SKIP and LIMIT
    if (skip && queryType === 'match') {
      query += `\nSKIP ${skip}`;
    }
    if (limit && queryType === 'match') {
      query += `\nLIMIT ${limit}`;
    }

    return query;
  }, [nodes, relationships, queryType, whereClause, returnFields, orderBy, limit, skip]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cypherQuery);
    setSnackbar({ open: true, message: 'Copied to clipboard' });
  };

  const handleDownload = () => {
    const blob = new Blob([cypherQuery], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query.cypher';
    a.click();
    URL.revokeObjectURL(url);
  };

  const addNode = () => {
    setNodes([...nodes, {
      id: String(Date.now()),
      variable: `n${nodes.length + 1}`,
      label: '',
      properties: [],
    }]);
  };

  const removeNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
    setRelationships(relationships.filter(r => r.fromNode !== id && r.toNode !== id));
  };

  const updateNode = (id: string, field: keyof Node, value: unknown) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, [field]: value } : n));
  };

  const addNodeProperty = (nodeId: string) => {
    setNodes(nodes.map(n => n.id === nodeId ? {
      ...n,
      properties: [...n.properties, { key: '', value: '', parameterized: false }],
    } : n));
  };

  const removeNodeProperty = (nodeId: string, index: number) => {
    setNodes(nodes.map(n => n.id === nodeId ? {
      ...n,
      properties: n.properties.filter((_, i) => i !== index),
    } : n));
  };

  const updateNodeProperty = (nodeId: string, index: number, field: string, value: unknown) => {
    setNodes(nodes.map(n => n.id === nodeId ? {
      ...n,
      properties: n.properties.map((p, i) => i === index ? { ...p, [field]: value } : p),
    } : n));
  };

  const addRelationship = () => {
    if (nodes.length < 2) return;
    setRelationships([...relationships, {
      id: String(Date.now()),
      variable: `r${relationships.length + 1}`,
      type: 'KNOWS',
      direction: 'outgoing',
      fromNode: nodes[0].id,
      toNode: nodes[1]?.id || nodes[0].id,
      properties: [],
    }]);
  };

  const removeRelationship = (id: string) => {
    setRelationships(relationships.filter(r => r.id !== id));
  };

  const updateRelationship = (id: string, field: keyof Relationship, value: unknown) => {
    setRelationships(relationships.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const addReturnField = () => {
    setReturnFields([...returnFields, { expression: '', alias: '' }]);
  };

  const removeReturnField = (index: number) => {
    setReturnFields(returnFields.filter((_, i) => i !== index));
  };

  const updateReturnField = (index: number, field: keyof ReturnField, value: string) => {
    setReturnFields(returnFields.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  const COMMON_LABELS = ['Person', 'User', 'Movie', 'Product', 'Order', 'Company', 'Location', 'Event'];
  const COMMON_REL_TYPES = ['KNOWS', 'FOLLOWS', 'LIKES', 'PURCHASED', 'WORKS_AT', 'LOCATED_IN', 'CREATED', 'BELONGS_TO'];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>Cypher Query Builder</Typography>
            <Chip label="Neo4j" size="small" color="success" />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Download"><IconButton onClick={handleDownload} sx={{ color: 'grey.500' }}><Download /></IconButton></Tooltip>
            <Tooltip title="Copy"><IconButton onClick={handleCopy} sx={{ color: 'grey.500' }}><ContentCopy /></IconButton></Tooltip>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
        {/* Builder Panel */}
        <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
          <Tabs value={queryType} onChange={(_, v) => setQueryType(v)} sx={{ mb: 2 }}>
            <Tab value="match" label="MATCH" sx={{ color: 'grey.400' }} />
            <Tab value="create" label="CREATE" sx={{ color: 'grey.400' }} />
            <Tab value="merge" label="MERGE" sx={{ color: 'grey.400' }} />
            <Tab value="delete" label="DELETE" sx={{ color: 'grey.400' }} />
          </Tabs>

          {/* Nodes Section */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ color: 'grey.300' }}>Nodes</Typography>
              <Button startIcon={<Add />} onClick={addNode} size="small" sx={{ color: 'grey.400' }}>Add Node</Button>
            </Box>

            {nodes.map(node => (
              <Paper key={node.id} sx={{ bgcolor: '#0a0a0a', border: '1px solid #333', p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField size="small" label="Variable" value={node.variable} onChange={(e) => updateNode(node.id, 'variable', e.target.value)} sx={{ width: 120, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                  <TextField size="small" label="Label" value={node.label} onChange={(e) => updateNode(node.id, 'label', e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                  <IconButton size="small" onClick={() => removeNode(node.id)} sx={{ color: 'grey.500' }}><Delete /></IconButton>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                  {COMMON_LABELS.map(label => (
                    <Chip key={label} label={label} size="small" onClick={() => updateNode(node.id, 'label', label)} sx={{ cursor: 'pointer', fontSize: 10 }} />
                  ))}
                </Box>

                <Typography variant="caption" sx={{ color: 'grey.500', display: 'block', mb: 1 }}>Properties</Typography>
                {node.properties.map((prop, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField size="small" label="Key" value={prop.key} onChange={(e) => updateNodeProperty(node.id, index, 'key', e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300', fontSize: 12 } }} />
                    <TextField size="small" label="Value" value={prop.value} onChange={(e) => updateNodeProperty(node.id, index, 'value', e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300', fontSize: 12 } }} />
                    <Tooltip title="Use as parameter ($param)">
                      <Chip label="$" size="small" color={prop.parameterized ? 'primary' : 'default'} onClick={() => updateNodeProperty(node.id, index, 'parameterized', !prop.parameterized)} sx={{ cursor: 'pointer' }} />
                    </Tooltip>
                    <IconButton size="small" onClick={() => removeNodeProperty(node.id, index)} sx={{ color: 'grey.500' }}><Delete fontSize="small" /></IconButton>
                  </Box>
                ))}
                <Button size="small" onClick={() => addNodeProperty(node.id)} sx={{ color: 'grey.500', fontSize: 11 }}>+ Add Property</Button>
              </Paper>
            ))}
          </Paper>

          {/* Relationships Section */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ color: 'grey.300' }}>Relationships</Typography>
              <Button startIcon={<Add />} onClick={addRelationship} size="small" sx={{ color: 'grey.400' }} disabled={nodes.length < 2}>Add Relationship</Button>
            </Box>

            {relationships.map(rel => (
              <Paper key={rel.id} sx={{ bgcolor: '#0a0a0a', border: '1px solid #333', p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField size="small" label="Variable" value={rel.variable} onChange={(e) => updateRelationship(rel.id, 'variable', e.target.value)} sx={{ width: 100, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                  <TextField size="small" label="Type" value={rel.type} onChange={(e) => updateRelationship(rel.id, 'type', e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                  <FormControl size="small" sx={{ width: 120 }}>
                    <InputLabel sx={{ color: 'grey.500' }}>Direction</InputLabel>
                    <Select value={rel.direction} label="Direction" onChange={(e) => updateRelationship(rel.id, 'direction', e.target.value)} sx={{ color: 'grey.300' }}>
                      <MenuItem value="outgoing">→ Outgoing</MenuItem>
                      <MenuItem value="incoming">← Incoming</MenuItem>
                      <MenuItem value="undirected">— Undirected</MenuItem>
                    </Select>
                  </FormControl>
                  <IconButton size="small" onClick={() => removeRelationship(rel.id)} sx={{ color: 'grey.500' }}><Delete /></IconButton>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                  {COMMON_REL_TYPES.map(type => (
                    <Chip key={type} label={type} size="small" onClick={() => updateRelationship(rel.id, 'type', type)} sx={{ cursor: 'pointer', fontSize: 10 }} />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl size="small" sx={{ flex: 1 }}>
                    <InputLabel sx={{ color: 'grey.500' }}>From Node</InputLabel>
                    <Select value={rel.fromNode} label="From Node" onChange={(e) => updateRelationship(rel.id, 'fromNode', e.target.value)} sx={{ color: 'grey.300' }}>
                      {nodes.map(n => <MenuItem key={n.id} value={n.id}>{n.variable} ({n.label || 'no label'})</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ flex: 1 }}>
                    <InputLabel sx={{ color: 'grey.500' }}>To Node</InputLabel>
                    <Select value={rel.toNode} label="To Node" onChange={(e) => updateRelationship(rel.id, 'toNode', e.target.value)} sx={{ color: 'grey.300' }}>
                      {nodes.map(n => <MenuItem key={n.id} value={n.id}>{n.variable} ({n.label || 'no label'})</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>
              </Paper>
            ))}
          </Paper>

          {/* WHERE Clause */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'grey.300', mb: 1 }}>WHERE Clause</Typography>
            <TextField
              size="small"
              fullWidth
              placeholder="n.age > 25 AND n.name STARTS WITH 'A'"
              value={whereClause}
              onChange={(e) => setWhereClause(e.target.value)}
              sx={{ '& .MuiInputBase-root': { color: 'grey.300', fontFamily: 'monospace' } }}
            />
          </Paper>

          {/* RETURN Fields (for MATCH) */}
          {queryType === 'match' && (
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ color: 'grey.300' }}>RETURN</Typography>
                <Button startIcon={<Add />} onClick={addReturnField} size="small" sx={{ color: 'grey.400' }}>Add Field</Button>
              </Box>
              {returnFields.map((field, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 1 }}>
                  <TextField size="small" label="Expression" value={field.expression} onChange={(e) => updateReturnField(index, 'expression', e.target.value)} placeholder="n.name, count(*)" sx={{ flex: 2, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                  <TextField size="small" label="Alias" value={field.alias} onChange={(e) => updateReturnField(index, 'alias', e.target.value)} placeholder="optional" sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                  <IconButton size="small" onClick={() => removeReturnField(index)} sx={{ color: 'grey.500' }}><Delete /></IconButton>
                </Box>
              ))}

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField size="small" label="ORDER BY" value={orderBy} onChange={(e) => setOrderBy(e.target.value)} placeholder="n.name DESC" sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                <TextField size="small" label="SKIP" type="number" value={skip} onChange={(e) => setSkip(e.target.value ? parseInt(e.target.value) : '')} sx={{ width: 100, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                <TextField size="small" label="LIMIT" type="number" value={limit} onChange={(e) => setLimit(e.target.value ? parseInt(e.target.value) : '')} sx={{ width: 100, '& .MuiInputBase-root': { color: 'grey.300' } }} />
              </Box>
            </Paper>
          )}
        </Box>

        {/* Output Panel */}
        <Box sx={{ width: 450, borderLeft: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #222' }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Generated Cypher Query</Typography>
          </Box>
          <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
            <Paper sx={{ bgcolor: '#0a0a0a', p: 2, border: '1px solid #333', height: '100%' }}>
              <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 13, color: '#4fc3f7', m: 0, whiteSpace: 'pre-wrap' }}>
                {cypherQuery}
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
