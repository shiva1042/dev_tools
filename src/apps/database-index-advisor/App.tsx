import { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Chip,
  LinearProgress,
} from '@mui/material';
import { ContentCopy, Home, PlayArrow, Warning, CheckCircle, Info } from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface ParsedQuery {
  original: string;
  tables: string[];
  whereCols: { table: string; col: string }[];
  joinCols: { table: string; col: string }[];
  orderByCols: { table: string; col: string }[];
  groupByCols: { table: string; col: string }[];
  selectCols: { table: string; col: string }[];
}

interface IndexSuggestion {
  table: string;
  columns: string[];
  type: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface QueryAnalysis {
  query: ParsedQuery;
  suggestions: IndexSuggestion[];
  score: number;
  warnings: string[];
}

const SAMPLE_QUERIES = `SELECT u.name, u.email FROM users u WHERE u.status = 'active' AND u.created_at > '2024-01-01' ORDER BY u.created_at DESC;
SELECT o.id, o.total, u.name FROM orders o JOIN users u ON o.user_id = u.id WHERE o.status = 'pending' AND o.created_at > '2024-06-01';
SELECT p.name, COUNT(*) as cnt FROM products p JOIN order_items oi ON oi.product_id = p.id GROUP BY p.name ORDER BY cnt DESC;
SELECT * FROM logs WHERE timestamp > now() - interval '7 days' AND level = 'ERROR';
SELECT u.id, u.name FROM users u WHERE u.email = 'test@example.com';
SELECT t.title, t.body FROM posts t WHERE t.tags @> ARRAY['postgres'] AND t.published = true;
SELECT e.name, d.name FROM employees e JOIN departments d ON e.dept_id = d.id WHERE e.salary > 50000 AND d.location = 'NYC';`;

export default function DatabaseIndexAdvisor() {
  const [sqlInput, setSqlInput] = useState(SAMPLE_QUERIES);
  const [analyses, setAnalyses] = useState<QueryAnalysis[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const extractTableAlias = (from: string): Record<string, string> => {
    const aliases: Record<string, string> = {};
    const parts = from.split(/\s+(?:JOIN|INNER\s+JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|CROSS\s+JOIN|FULL\s+JOIN)\s+/i);
    parts.forEach((part) => {
      const match = part.trim().match(/^(\w+)(?:\s+(?:AS\s+)?(\w+))?/i);
      if (match) {
        const table = match[1].toLowerCase();
        const alias = (match[2] || match[1]).toLowerCase();
        aliases[alias] = table;
      }
    });
    return aliases;
  };

  const resolveCol = (col: string, aliases: Record<string, string>, defaultTable: string): { table: string; col: string } => {
    const cleaned = col.trim().replace(/['"]/g, '');
    const dotParts = cleaned.split('.');
    if (dotParts.length === 2) {
      const alias = dotParts[0].toLowerCase();
      return { table: aliases[alias] || alias, col: dotParts[1].toLowerCase() };
    }
    return { table: defaultTable, col: cleaned.toLowerCase() };
  };

  const parseQuery = useCallback((sql: string): ParsedQuery => {
    const original = sql.trim();
    const normalized = original.replace(/\s+/g, ' ');

    const tables: string[] = [];
    const whereCols: { table: string; col: string }[] = [];
    const joinCols: { table: string; col: string }[] = [];
    const orderByCols: { table: string; col: string }[] = [];
    const groupByCols: { table: string; col: string }[] = [];
    const selectCols: { table: string; col: string }[] = [];

    // Extract FROM clause to get tables and aliases
    const fromMatch = normalized.match(/FROM\s+(.+?)(?:\s+WHERE\s+|\s+GROUP\s+BY\s+|\s+ORDER\s+BY\s+|\s+LIMIT\s+|;|$)/i);
    const aliases: Record<string, string> = {};
    let defaultTable = '';

    if (fromMatch) {
      const fromClause = fromMatch[1];
      // Extract tables from FROM and JOIN
      const tableMatches = fromClause.match(/(\w+)(?:\s+(?:AS\s+)?(\w+))?/gi);
      const joinKeywords = new Set(['join', 'inner', 'left', 'right', 'cross', 'full', 'on', 'and', 'or', 'as']);
      if (tableMatches) {
        let i = 0;
        while (i < tableMatches.length) {
          const word = tableMatches[i].toLowerCase();
          if (joinKeywords.has(word)) { i++; continue; }
          // Check if it's a condition (contains = or .)
          if (word.includes('=') || word.includes('>') || word.includes('<')) { i++; continue; }
          const table = word;
          let alias = table;
          if (i + 1 < tableMatches.length) {
            const next = tableMatches[i + 1].toLowerCase();
            if (!joinKeywords.has(next) && !next.includes('=') && !next.includes('.')) {
              alias = next;
              i++;
            }
          }
          if (!tables.includes(table)) tables.push(table);
          aliases[alias] = table;
          i++;
        }
      }
      if (tables.length > 0) defaultTable = tables[0];

      // Extract JOIN conditions
      const joinConditions = fromClause.match(/ON\s+(\w+(?:\.\w+)?)\s*=\s*(\w+(?:\.\w+)?)/gi);
      if (joinConditions) {
        joinConditions.forEach((jc) => {
          const parts = jc.replace(/^ON\s+/i, '').split(/\s*=\s*/);
          parts.forEach((p) => {
            const resolved = resolveCol(p, aliases, defaultTable);
            if (!joinCols.find((c) => c.table === resolved.table && c.col === resolved.col)) {
              joinCols.push(resolved);
            }
          });
        });
      }
    }

    // Extract WHERE clause columns
    const whereMatch = normalized.match(/WHERE\s+(.+?)(?:\s+GROUP\s+BY\s+|\s+ORDER\s+BY\s+|\s+LIMIT\s+|;|$)/i);
    if (whereMatch) {
      const whereClause = whereMatch[1];
      const colPattern = /(\w+(?:\.\w+)?)\s*(?:=|!=|<>|>|<|>=|<=|LIKE|IN|IS|BETWEEN|@>)/gi;
      let m;
      while ((m = colPattern.exec(whereClause)) !== null) {
        const resolved = resolveCol(m[1], aliases, defaultTable);
        if (!['and', 'or', 'not', 'true', 'false', 'null'].includes(resolved.col)) {
          if (!whereCols.find((c) => c.table === resolved.table && c.col === resolved.col)) {
            whereCols.push(resolved);
          }
        }
      }
    }

    // Extract ORDER BY columns
    const orderMatch = normalized.match(/ORDER\s+BY\s+(.+?)(?:\s+LIMIT\s+|;|$)/i);
    if (orderMatch) {
      const parts = orderMatch[1].split(',');
      parts.forEach((p) => {
        const col = p.trim().replace(/\s+(ASC|DESC)$/i, '').trim();
        if (col && !col.match(/^\d+$/)) {
          const resolved = resolveCol(col, aliases, defaultTable);
          orderByCols.push(resolved);
        }
      });
    }

    // Extract GROUP BY columns
    const groupMatch = normalized.match(/GROUP\s+BY\s+(.+?)(?:\s+HAVING\s+|\s+ORDER\s+BY\s+|\s+LIMIT\s+|;|$)/i);
    if (groupMatch) {
      const parts = groupMatch[1].split(',');
      parts.forEach((p) => {
        const col = p.trim();
        if (col && !col.match(/^\d+$/)) {
          const resolved = resolveCol(col, aliases, defaultTable);
          groupByCols.push(resolved);
        }
      });
    }

    return { original, tables, whereCols, joinCols, orderByCols, groupByCols, selectCols };
  }, []);

  const analyzeQuery = useCallback((query: ParsedQuery): QueryAnalysis => {
    const suggestions: IndexSuggestion[] = [];
    const warnings: string[] = [];
    let score = 0;

    // Group columns by table
    const tableColMap = new Map<string, { where: string[]; join: string[]; orderBy: string[]; groupBy: string[] }>();
    const addToMap = (table: string, col: string, type: 'where' | 'join' | 'orderBy' | 'groupBy') => {
      if (!tableColMap.has(table)) tableColMap.set(table, { where: [], join: [], orderBy: [], groupBy: [] });
      const entry = tableColMap.get(table)!;
      if (!entry[type].includes(col)) entry[type].push(col);
    };

    query.whereCols.forEach((c) => addToMap(c.table, c.col, 'where'));
    query.joinCols.forEach((c) => addToMap(c.table, c.col, 'join'));
    query.orderByCols.forEach((c) => addToMap(c.table, c.col, 'orderBy'));
    query.groupByCols.forEach((c) => addToMap(c.table, c.col, 'groupBy'));

    tableColMap.forEach((cols, table) => {
      // Suggest composite index for WHERE + ORDER BY
      if (cols.where.length > 0 && cols.orderBy.length > 0) {
        const combinedCols = [...new Set([...cols.where, ...cols.orderBy])];
        suggestions.push({
          table, columns: combinedCols, type: 'B-tree',
          reason: `Composite index covering WHERE (${cols.where.join(', ')}) and ORDER BY (${cols.orderBy.join(', ')}) for efficient filtering and sorting.`,
          priority: 'high',
        });
        score += 30;
      } else if (cols.where.length > 1) {
        suggestions.push({
          table, columns: cols.where, type: 'B-tree',
          reason: `Composite index on frequently filtered columns: ${cols.where.join(', ')}. Place highest-selectivity column first.`,
          priority: 'high',
        });
        score += 25;
      } else if (cols.where.length === 1) {
        suggestions.push({
          table, columns: cols.where, type: 'B-tree',
          reason: `Single-column index for WHERE clause filter on ${cols.where[0]}.`,
          priority: 'medium',
        });
        score += 15;
      }

      // JOIN indexes
      cols.join.forEach((col) => {
        if (!cols.where.includes(col)) {
          suggestions.push({
            table, columns: [col], type: 'B-tree',
            reason: `Index on JOIN column ${col} for efficient join lookups.`,
            priority: 'high',
          });
          score += 20;
        }
      });

      // GROUP BY
      if (cols.groupBy.length > 0 && !cols.where.some((w) => cols.groupBy.includes(w))) {
        suggestions.push({
          table, columns: cols.groupBy, type: 'B-tree',
          reason: `Index on GROUP BY columns (${cols.groupBy.join(', ')}) to avoid sorting for aggregation.`,
          priority: 'medium',
        });
        score += 15;
      }

      // Detect special types
      const arrayOp = query.original.match(/@>/);
      if (arrayOp && cols.where.length > 0) {
        suggestions.push({
          table, columns: cols.where.filter((c) => query.original.includes(c)), type: 'GIN',
          reason: `GIN index recommended for array/JSONB containment operator (@>) on these columns.`,
          priority: 'high',
        });
      }

      const timeCol = cols.where.find((c) => /timestamp|created_at|updated_at|date/i.test(c));
      if (timeCol) {
        suggestions.push({
          table, columns: [timeCol], type: 'BRIN',
          reason: `BRIN index suggested for time-series column ${timeCol}. Much smaller than B-tree for naturally ordered data.`,
          priority: 'low',
        });
      }
    });

    // Warnings
    if (query.original.match(/SELECT\s+\*/i)) {
      warnings.push('SELECT * prevents covering index optimization. Specify only needed columns.');
    }
    if (query.whereCols.length === 0 && query.joinCols.length === 0) {
      warnings.push('No WHERE or JOIN clause detected. This query will perform a full table scan.');
      score = Math.max(score - 20, 0);
    }
    if (query.original.match(/LIKE\s+'%/i)) {
      warnings.push('Leading wildcard in LIKE pattern prevents index usage. Consider full-text search (GIN with pg_trgm).');
    }

    // Deduplicate suggestions
    const seen = new Set<string>();
    const uniqueSuggestions = suggestions.filter((s) => {
      const key = `${s.table}:${s.columns.join(',')}:${s.type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    score = Math.min(score, 100);

    return { query, suggestions: uniqueSuggestions, score, warnings };
  }, []);

  const handleAnalyze = () => {
    const queries = sqlInput
      .split(/;/)
      .map((q) => q.trim())
      .filter((q) => q.length > 0 && /SELECT|INSERT|UPDATE|DELETE/i.test(q));

    if (queries.length === 0) {
      setSnackbar({ open: true, message: 'No valid SQL queries found.' });
      return;
    }

    const results = queries.map((q) => {
      const parsed = parseQuery(q + ';');
      return analyzeQuery(parsed);
    });

    setAnalyses(results);

    // Check for redundant indexes across queries
    const allSuggestions: IndexSuggestion[] = results.flatMap((r) => r.suggestions);
    const tableIndexCount = new Map<string, number>();
    allSuggestions.forEach((s) => {
      tableIndexCount.set(s.table, (tableIndexCount.get(s.table) || 0) + 1);
    });
    tableIndexCount.forEach((count, table) => {
      if (count > 4) {
        results.forEach((r) => {
          if (r.query.tables.includes(table)) {
            r.warnings.push(`Table "${table}" has ${count} suggested indexes. Too many indexes slow down writes. Consider consolidating.`);
          }
        });
      }
    });

    setAnalyses([...results]);
  };

  const generateCreateIndexes = (): string => {
    const seen = new Set<string>();
    const statements: string[] = [];
    analyses.forEach((a) => {
      a.suggestions.forEach((s) => {
        const key = `${s.table}:${s.columns.join(',')}:${s.type}`;
        if (seen.has(key)) return;
        seen.add(key);
        const idxName = `idx_${s.table}_${s.columns.join('_')}`;
        const using = s.type !== 'B-tree' ? ` USING ${s.type.toLowerCase()}` : '';
        statements.push(`CREATE INDEX${s.type === 'BRIN' ? '' : ' CONCURRENTLY'} IF NOT EXISTS ${idxName}\n  ON ${s.table}${using} (${s.columns.join(', ')});`);
      });
    });
    return statements.join('\n\n');
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copied to clipboard' });
  };

  const priorityColor = (p: string) => p === 'high' ? '#e06c75' : p === 'medium' ? '#e5c07b' : '#98c379';
  const scoreColor = (s: number) => s >= 60 ? '#98c379' : s >= 30 ? '#e5c07b' : '#e06c75';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>Database Index Advisor</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button startIcon={<PlayArrow />} onClick={handleAnalyze} variant="contained" sx={{ bgcolor: '#1a3a5c', '&:hover': { bgcolor: '#254a70' } }}>
              Analyze Queries
            </Button>
            {analyses.length > 0 && (
              <Button startIcon={<ContentCopy />} onClick={() => handleCopy(generateCreateIndexes())} sx={{ color: 'grey.400' }}>
                Copy CREATE INDEX
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, p: 2, height: 'calc(100vh - 80px)' }}>
        {/* Input */}
        <Paper sx={{ width: 450, bgcolor: '#111', border: '1px solid #222', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #222' }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>SQL Queries (one per line or semicolon-separated)</Typography>
          </Box>
          <TextField
            multiline fullWidth value={sqlInput} onChange={(e) => setSqlInput(e.target.value)}
            placeholder="SELECT * FROM users WHERE email = 'test@test.com';"
            sx={{
              flex: 1,
              '& .MuiInputBase-root': { height: '100%', alignItems: 'flex-start', fontFamily: 'monospace', fontSize: 12, bgcolor: '#0a0a0a', color: '#d4d4d4', borderRadius: 0 },
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            }} />
        </Paper>

        {/* Results */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto', minWidth: 0 }}>
          {analyses.length === 0 ? (
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 4, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Info sx={{ fontSize: 48, color: 'grey.700', mb: 1 }} />
                <Typography sx={{ color: 'grey.500' }}>Paste your SQL queries and click "Analyze Queries" to get index suggestions.</Typography>
                <Typography variant="caption" sx={{ color: 'grey.600', display: 'block', mt: 1 }}>
                  Supports SELECT, INSERT, UPDATE, DELETE with WHERE, JOIN, ORDER BY, GROUP BY clauses.
                </Typography>
              </Box>
            </Paper>
          ) : (
            <>
              {/* Summary */}
              <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>
                  Analysis Summary - {analyses.length} queries analyzed
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip label={`${analyses.reduce((sum, a) => sum + a.suggestions.length, 0)} index suggestions`} size="small" sx={{ bgcolor: '#1a3a5c', color: '#61afef' }} />
                  <Chip label={`${analyses.reduce((sum, a) => sum + a.warnings.length, 0)} warnings`} size="small" sx={{ bgcolor: '#2e2a1a', color: '#e5c07b' }} />
                  <Chip label={`Avg score: ${Math.round(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length)}/100`} size="small"
                    sx={{ bgcolor: '#1a2e1a', color: '#98c379' }} />
                </Box>
              </Paper>

              {/* Per-query analysis */}
              {analyses.map((analysis, qi) => (
                <Paper key={qi} sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="caption" sx={{ color: 'grey.500' }}>Query {qi + 1}</Typography>
                      <Typography sx={{ fontFamily: 'monospace', fontSize: 11, color: '#d4d4d4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {analysis.query.original}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2, flexShrink: 0 }}>
                      <Typography variant="caption" sx={{ color: scoreColor(analysis.score) }}>Score</Typography>
                      <Box sx={{ width: 60 }}>
                        <LinearProgress variant="determinate" value={analysis.score}
                          sx={{ height: 6, borderRadius: 3, bgcolor: '#222', '& .MuiLinearProgress-bar': { bgcolor: scoreColor(analysis.score) } }} />
                      </Box>
                      <Typography variant="caption" sx={{ color: scoreColor(analysis.score), fontFamily: 'monospace', fontWeight: 700 }}>{analysis.score}</Typography>
                    </Box>
                  </Box>

                  {/* Detected patterns */}
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                    {analysis.query.tables.map((t) => <Chip key={t} label={`TABLE: ${t}`} size="small" sx={{ bgcolor: '#1a2e1a', color: '#98c379', fontSize: 10, height: 20 }} />)}
                    {analysis.query.whereCols.map((c, i) => <Chip key={`w-${i}`} label={`WHERE: ${c.table}.${c.col}`} size="small" sx={{ bgcolor: '#2e1a1a', color: '#e06c75', fontSize: 10, height: 20 }} />)}
                    {analysis.query.joinCols.map((c, i) => <Chip key={`j-${i}`} label={`JOIN: ${c.table}.${c.col}`} size="small" sx={{ bgcolor: '#1a1a2e', color: '#61afef', fontSize: 10, height: 20 }} />)}
                    {analysis.query.orderByCols.map((c, i) => <Chip key={`o-${i}`} label={`ORDER: ${c.table}.${c.col}`} size="small" sx={{ bgcolor: '#2e2a1a', color: '#e5c07b', fontSize: 10, height: 20 }} />)}
                    {analysis.query.groupByCols.map((c, i) => <Chip key={`g-${i}`} label={`GROUP: ${c.table}.${c.col}`} size="small" sx={{ bgcolor: '#2e1a2e', color: '#c678dd', fontSize: 10, height: 20 }} />)}
                  </Box>

                  {/* Warnings */}
                  {analysis.warnings.map((w, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 0.5 }}>
                      <Warning sx={{ fontSize: 14, color: '#e5c07b', mt: 0.3 }} />
                      <Typography variant="caption" sx={{ color: '#e5c07b' }}>{w}</Typography>
                    </Box>
                  ))}

                  {/* Index suggestions */}
                  {analysis.suggestions.map((s, i) => (
                    <Paper key={i} sx={{ bgcolor: '#0a0a0a', border: '1px solid #222', p: 1.5, mb: 0.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle sx={{ fontSize: 14, color: priorityColor(s.priority) }} />
                          <Typography variant="caption" sx={{ color: 'grey.300', fontWeight: 600 }}>
                            {s.table}.({s.columns.join(', ')})
                          </Typography>
                          <Chip label={s.type} size="small" sx={{ bgcolor: '#222', color: '#61afef', fontSize: 10, height: 18 }} />
                          <Chip label={s.priority} size="small" sx={{ bgcolor: '#222', color: priorityColor(s.priority), fontSize: 10, height: 18 }} />
                        </Box>
                      </Box>
                      <Typography variant="caption" sx={{ color: 'grey.500' }}>{s.reason}</Typography>
                    </Paper>
                  ))}
                </Paper>
              ))}

              {/* Generated CREATE INDEX statements */}
              <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Generated CREATE INDEX Statements (PostgreSQL)</Typography>
                  <Tooltip title="Copy all">
                    <IconButton size="small" onClick={() => handleCopy(generateCreateIndexes())} sx={{ color: 'grey.500' }}>
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 12, color: '#98c379', whiteSpace: 'pre-wrap', m: 0 }}>
                  {generateCreateIndexes()}
                </Typography>
              </Paper>
            </>
          )}
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
