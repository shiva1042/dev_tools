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

interface Parameter {
  id: string;
  name: string;
  type: string;
  mode: 'IN' | 'OUT' | 'INOUT';
  defaultValue?: string;
}

interface FunctionConfig {
  name: string;
  schema: string;
  parameters: Parameter[];
  returnType: string;
  language: 'plpgsql' | 'sql';
  volatility: 'VOLATILE' | 'STABLE' | 'IMMUTABLE';
  parallel: 'UNSAFE' | 'RESTRICTED' | 'SAFE';
  security: 'INVOKER' | 'DEFINER';
  body: string;
}

const PG_TYPES = [
  'INTEGER', 'BIGINT', 'SMALLINT', 'SERIAL', 'BIGSERIAL',
  'NUMERIC', 'DECIMAL', 'REAL', 'DOUBLE PRECISION',
  'VARCHAR', 'TEXT', 'CHAR', 'CHARACTER VARYING',
  'BOOLEAN', 'DATE', 'TIME', 'TIMESTAMP', 'TIMESTAMPTZ', 'INTERVAL',
  'UUID', 'JSON', 'JSONB', 'BYTEA', 'ARRAY',
  'VOID', 'TRIGGER', 'RECORD', 'SETOF RECORD', 'TABLE',
];

const FUNCTION_TEMPLATES = {
  basic: {
    name: 'get_user_by_id',
    returnType: 'TABLE(id INTEGER, username VARCHAR, email VARCHAR)',
    language: 'plpgsql' as const,
    body: `DECLARE
    -- Variable declarations here
BEGIN
    RETURN QUERY
    SELECT u.id, u.username, u.email
    FROM users u
    WHERE u.id = p_user_id;
END;`,
    parameters: [
      { id: '1', name: 'p_user_id', type: 'INTEGER', mode: 'IN' as const },
    ],
  },
  audit: {
    name: 'audit_trigger_func',
    returnType: 'TRIGGER',
    language: 'plpgsql' as const,
    body: `BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log(table_name, operation, new_data, created_at)
        VALUES(TG_TABLE_NAME, 'INSERT', row_to_json(NEW), NOW());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log(table_name, operation, old_data, new_data, created_at)
        VALUES(TG_TABLE_NAME, 'UPDATE', row_to_json(OLD), row_to_json(NEW), NOW());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log(table_name, operation, old_data, created_at)
        VALUES(TG_TABLE_NAME, 'DELETE', row_to_json(OLD), NOW());
        RETURN OLD;
    END IF;
END;`,
    parameters: [],
  },
  pagination: {
    name: 'get_paginated_results',
    returnType: 'TABLE(id INTEGER, name VARCHAR, total_count BIGINT)',
    language: 'plpgsql' as const,
    body: `DECLARE
    v_offset INTEGER := (p_page - 1) * p_page_size;
BEGIN
    RETURN QUERY
    WITH counted AS (
        SELECT id, name, COUNT(*) OVER() as total
        FROM items
        WHERE (p_search IS NULL OR name ILIKE '%' || p_search || '%')
        ORDER BY id
        OFFSET v_offset
        LIMIT p_page_size
    )
    SELECT id, name, total FROM counted;
END;`,
    parameters: [
      { id: '1', name: 'p_page', type: 'INTEGER', mode: 'IN' as const, defaultValue: '1' },
      { id: '2', name: 'p_page_size', type: 'INTEGER', mode: 'IN' as const, defaultValue: '10' },
      { id: '3', name: 'p_search', type: 'VARCHAR', mode: 'IN' as const, defaultValue: 'NULL' },
    ],
  },
  upsert: {
    name: 'upsert_user',
    returnType: 'INTEGER',
    language: 'plpgsql' as const,
    body: `DECLARE
    v_id INTEGER;
BEGIN
    INSERT INTO users (username, email, updated_at)
    VALUES (p_username, p_email, NOW())
    ON CONFLICT (username)
    DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW()
    RETURNING id INTO v_id;

    RETURN v_id;
END;`,
    parameters: [
      { id: '1', name: 'p_username', type: 'VARCHAR', mode: 'IN' as const },
      { id: '2', name: 'p_email', type: 'VARCHAR', mode: 'IN' as const },
    ],
  },
  json: {
    name: 'process_json_data',
    returnType: 'JSONB',
    language: 'plpgsql' as const,
    body: `DECLARE
    v_result JSONB;
BEGIN
    -- Extract and transform JSON data
    SELECT jsonb_build_object(
        'processed', true,
        'timestamp', NOW(),
        'data', jsonb_agg(
            jsonb_build_object(
                'key', key,
                'value', value
            )
        )
    )
    INTO v_result
    FROM jsonb_each_text(p_input);

    RETURN v_result;
END;`,
    parameters: [
      { id: '1', name: 'p_input', type: 'JSONB', mode: 'IN' as const },
    ],
  },
};

export default function PostgreSQLBuilder() {
  const [outputTab, setOutputTab] = useState(0);
  const [config, setConfig] = useState<FunctionConfig>({
    name: 'get_user_by_id',
    schema: 'public',
    parameters: [
      { id: '1', name: 'p_user_id', type: 'INTEGER', mode: 'IN' },
    ],
    returnType: 'TABLE(id INTEGER, username VARCHAR, email VARCHAR)',
    language: 'plpgsql',
    volatility: 'STABLE',
    parallel: 'SAFE',
    security: 'INVOKER',
    body: `DECLARE
    -- Variable declarations
BEGIN
    RETURN QUERY
    SELECT u.id, u.username, u.email
    FROM users u
    WHERE u.id = p_user_id;
END;`,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const generatedFunction = useMemo(() => {
    const { name, schema, parameters, returnType, language, volatility, parallel, security, body } = config;

    let sql = `-- Function: ${schema}.${name}\n`;
    sql += `-- Generated by PostgreSQL Function Builder\n\n`;

    // Drop existing function
    const paramTypes = parameters.filter(p => p.mode !== 'OUT').map(p => p.type).join(', ');
    sql += `DROP FUNCTION IF EXISTS ${schema}.${name}(${paramTypes});\n\n`;

    // Create function
    sql += `CREATE OR REPLACE FUNCTION ${schema}.${name}(\n`;

    // Parameters
    if (parameters.length > 0) {
      const paramStrings = parameters.map(p => {
        let param = `    ${p.mode} ${p.name} ${p.type}`;
        if (p.defaultValue) param += ` DEFAULT ${p.defaultValue}`;
        return param;
      });
      sql += paramStrings.join(',\n');
      sql += '\n';
    }

    sql += `)\n`;
    sql += `RETURNS ${returnType}\n`;
    sql += `LANGUAGE ${language}\n`;
    sql += `${volatility}\n`;
    sql += `PARALLEL ${parallel}\n`;
    sql += `SECURITY ${security}\n`;
    sql += `AS $$\n`;
    sql += body;
    sql += '\n$$;\n\n';

    // Grant permissions (example)
    sql += `-- Grant execute permission\n`;
    sql += `-- GRANT EXECUTE ON FUNCTION ${schema}.${name}(${paramTypes}) TO app_user;\n`;

    // Comment
    sql += `\n-- Add function description\n`;
    sql += `COMMENT ON FUNCTION ${schema}.${name}(${paramTypes}) IS 'Description of ${name}';\n`;

    return sql;
  }, [config]);

  const generatedTrigger = useMemo(() => {
    if (config.returnType !== 'TRIGGER') return '';

    return `-- Create trigger using the function
CREATE TRIGGER audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON your_table
    FOR EACH ROW
    EXECUTE FUNCTION ${config.schema}.${config.name}();

-- To disable trigger:
-- ALTER TABLE your_table DISABLE TRIGGER audit_trigger;

-- To enable trigger:
-- ALTER TABLE your_table ENABLE TRIGGER audit_trigger;

-- To drop trigger:
-- DROP TRIGGER IF EXISTS audit_trigger ON your_table;
`;
  }, [config]);

  const javaCode = useMemo(() => {
    const { name, parameters, returnType } = config;
    const methodName = name.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

    const isTableReturn = returnType.startsWith('TABLE') || returnType.startsWith('SETOF');
    const isSingleReturn = !isTableReturn && returnType !== 'VOID';

    let code = `// Spring Data JPA Repository method\n`;
    code += `public interface YourRepository extends JpaRepository<YourEntity, Long> {\n\n`;

    // Native query method
    const paramList = parameters
      .filter(p => p.mode !== 'OUT')
      .map(p => {
        const javaType = pgTypeToJava(p.type);
        return `@Param("${p.name}") ${javaType} ${toCamelCase(p.name)}`;
      })
      .join(', ');

    const queryParams = parameters
      .filter(p => p.mode !== 'OUT')
      .map(p => `:${p.name}`)
      .join(', ');

    if (isTableReturn) {
      code += `    @Query(value = "SELECT * FROM ${config.schema}.${name}(${queryParams})", nativeQuery = true)\n`;
      code += `    List<Object[]> ${methodName}(${paramList});\n`;
    } else if (isSingleReturn) {
      code += `    @Query(value = "SELECT ${config.schema}.${name}(${queryParams})", nativeQuery = true)\n`;
      code += `    ${pgTypeToJava(returnType)} ${methodName}(${paramList});\n`;
    } else {
      code += `    @Modifying\n`;
      code += `    @Query(value = "SELECT ${config.schema}.${name}(${queryParams})", nativeQuery = true)\n`;
      code += `    void ${methodName}(${paramList});\n`;
    }

    code += `}\n`;

    return code;
  }, [config]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copied to clipboard' });
  };

  const handleDownload = () => {
    const blob = new Blob([generatedFunction], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const applyTemplate = (templateKey: keyof typeof FUNCTION_TEMPLATES) => {
    const template = FUNCTION_TEMPLATES[templateKey];
    setConfig({
      ...config,
      name: template.name,
      returnType: template.returnType,
      language: template.language,
      body: template.body,
      parameters: template.parameters.map(p => ({ ...p, id: String(Date.now() + Math.random()) })),
    });
  };

  const addParameter = () => {
    setConfig({
      ...config,
      parameters: [...config.parameters, {
        id: String(Date.now()),
        name: 'p_param',
        type: 'VARCHAR',
        mode: 'IN',
      }],
    });
  };

  const removeParameter = (id: string) => {
    setConfig({ ...config, parameters: config.parameters.filter(p => p.id !== id) });
  };

  const updateParameter = (id: string, updates: Partial<Parameter>) => {
    setConfig({
      ...config,
      parameters: config.parameters.map(p => p.id === id ? { ...p, ...updates } : p),
    });
  };

  const outputs = [
    { label: 'Function', content: generatedFunction },
    { label: 'Java/Spring', content: javaCode },
    ...(config.returnType === 'TRIGGER' ? [{ label: 'Trigger', content: generatedTrigger }] : []),
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>PostgreSQL Function Builder</Typography>
            <Chip label="PostgreSQL" size="small" color="primary" />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Download"><IconButton onClick={handleDownload} sx={{ color: 'grey.500' }}><Download /></IconButton></Tooltip>
            <Tooltip title="Copy"><IconButton onClick={() => handleCopy(outputs[outputTab].content)} sx={{ color: 'grey.500' }}><ContentCopy /></IconButton></Tooltip>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
        {/* Builder Panel */}
        <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
          {/* Templates */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'grey.300', mb: 1 }}>Templates</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {Object.keys(FUNCTION_TEMPLATES).map(key => (
                <Chip
                  key={key}
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  onClick={() => applyTemplate(key as keyof typeof FUNCTION_TEMPLATES)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Paper>

          {/* Function Settings */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'grey.300', mb: 2 }}>Function Settings</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField size="small" label="Function Name" value={config.name} onChange={(e) => setConfig({ ...config, name: e.target.value })} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
              <TextField size="small" label="Schema" value={config.schema} onChange={(e) => setConfig({ ...config, schema: e.target.value })} sx={{ width: 120, '& .MuiInputBase-root': { color: 'grey.300' } }} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField size="small" label="Return Type" value={config.returnType} onChange={(e) => setConfig({ ...config, returnType: e.target.value })} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ color: 'grey.500' }}>Language</InputLabel>
                <Select value={config.language} label="Language" onChange={(e) => setConfig({ ...config, language: e.target.value as FunctionConfig['language'] })} sx={{ color: 'grey.300' }}>
                  <MenuItem value="plpgsql">PL/pgSQL</MenuItem>
                  <MenuItem value="sql">SQL</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel sx={{ color: 'grey.500' }}>Volatility</InputLabel>
                <Select value={config.volatility} label="Volatility" onChange={(e) => setConfig({ ...config, volatility: e.target.value as FunctionConfig['volatility'] })} sx={{ color: 'grey.300' }}>
                  <MenuItem value="VOLATILE">VOLATILE (default)</MenuItem>
                  <MenuItem value="STABLE">STABLE (same results in transaction)</MenuItem>
                  <MenuItem value="IMMUTABLE">IMMUTABLE (deterministic)</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel sx={{ color: 'grey.500' }}>Parallel</InputLabel>
                <Select value={config.parallel} label="Parallel" onChange={(e) => setConfig({ ...config, parallel: e.target.value as FunctionConfig['parallel'] })} sx={{ color: 'grey.300' }}>
                  <MenuItem value="UNSAFE">UNSAFE</MenuItem>
                  <MenuItem value="RESTRICTED">RESTRICTED</MenuItem>
                  <MenuItem value="SAFE">SAFE</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel sx={{ color: 'grey.500' }}>Security</InputLabel>
                <Select value={config.security} label="Security" onChange={(e) => setConfig({ ...config, security: e.target.value as FunctionConfig['security'] })} sx={{ color: 'grey.300' }}>
                  <MenuItem value="INVOKER">INVOKER (caller's privileges)</MenuItem>
                  <MenuItem value="DEFINER">DEFINER (owner's privileges)</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Paper>

          {/* Parameters */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ color: 'grey.300' }}>Parameters</Typography>
              <Button startIcon={<Add />} onClick={addParameter} size="small" sx={{ color: 'grey.400' }}>Add Parameter</Button>
            </Box>

            {config.parameters.map(param => (
              <Box key={param.id} sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'center' }}>
                <FormControl size="small" sx={{ width: 80 }}>
                  <InputLabel sx={{ color: 'grey.500' }}>Mode</InputLabel>
                  <Select value={param.mode} label="Mode" onChange={(e) => updateParameter(param.id, { mode: e.target.value as Parameter['mode'] })} sx={{ color: 'grey.300' }}>
                    <MenuItem value="IN">IN</MenuItem>
                    <MenuItem value="OUT">OUT</MenuItem>
                    <MenuItem value="INOUT">INOUT</MenuItem>
                  </Select>
                </FormControl>
                <TextField size="small" label="Name" value={param.name} onChange={(e) => updateParameter(param.id, { name: e.target.value })} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel sx={{ color: 'grey.500' }}>Type</InputLabel>
                  <Select value={param.type} label="Type" onChange={(e) => updateParameter(param.id, { type: e.target.value })} sx={{ color: 'grey.300' }}>
                    {PG_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField size="small" label="Default" value={param.defaultValue || ''} onChange={(e) => updateParameter(param.id, { defaultValue: e.target.value || undefined })} placeholder="optional" sx={{ width: 120, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                <IconButton size="small" onClick={() => removeParameter(param.id)} sx={{ color: 'grey.500' }}><Delete /></IconButton>
              </Box>
            ))}
          </Paper>

          {/* Function Body */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'grey.300', mb: 2 }}>Function Body</Typography>
            <TextField
              multiline
              fullWidth
              rows={15}
              value={config.body}
              onChange={(e) => setConfig({ ...config, body: e.target.value })}
              sx={{
                '& .MuiInputBase-root': {
                  fontFamily: 'monospace',
                  fontSize: 12,
                  color: 'grey.300',
                  bgcolor: '#0a0a0a',
                },
              }}
            />
          </Paper>
        </Box>

        {/* Output Panel */}
        <Box sx={{ width: 550, borderLeft: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ borderBottom: '1px solid #222' }}>
            <Tabs value={outputTab} onChange={(_, v) => setOutputTab(v)}>
              {outputs.map((out, i) => (
                <Tab key={i} label={out.label} sx={{ color: 'grey.400', fontSize: 12 }} />
              ))}
            </Tabs>
          </Box>
          <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
            <Paper sx={{ bgcolor: '#0a0a0a', p: 2, border: '1px solid #333', height: '100%' }}>
              <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 11, color: '#d4d4d4', m: 0, whiteSpace: 'pre-wrap' }}>
                {outputs[outputTab].content}
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}

function pgTypeToJava(pgType: string): string {
  const typeMap: Record<string, string> = {
    'INTEGER': 'Integer',
    'BIGINT': 'Long',
    'SMALLINT': 'Short',
    'NUMERIC': 'BigDecimal',
    'DECIMAL': 'BigDecimal',
    'REAL': 'Float',
    'DOUBLE PRECISION': 'Double',
    'VARCHAR': 'String',
    'TEXT': 'String',
    'CHAR': 'String',
    'BOOLEAN': 'Boolean',
    'DATE': 'LocalDate',
    'TIME': 'LocalTime',
    'TIMESTAMP': 'LocalDateTime',
    'TIMESTAMPTZ': 'OffsetDateTime',
    'UUID': 'UUID',
    'JSON': 'String',
    'JSONB': 'String',
    'BYTEA': 'byte[]',
    'VOID': 'void',
  };
  return typeMap[pgType.toUpperCase()] || 'Object';
}

function toCamelCase(str: string): string {
  return str.replace(/^p_/, '').replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}
