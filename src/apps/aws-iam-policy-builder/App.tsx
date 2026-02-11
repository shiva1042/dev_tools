import { useState, useCallback } from 'react';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Tooltip, Select,
  MenuItem, FormControl, InputLabel, Snackbar, Chip, Switch, FormControlLabel,
  Divider, Alert, Autocomplete,
} from '@mui/material';
import { ContentCopy, Home, Add, Delete, ExpandMore, ExpandLess } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const serviceActions: Record<string, string[]> = {
  's3': ['GetObject', 'PutObject', 'DeleteObject', 'ListBucket', 'ListAllMyBuckets', 'GetBucketLocation', 'CreateBucket', 'DeleteBucket', 'GetBucketPolicy', 'PutBucketPolicy'],
  'ec2': ['DescribeInstances', 'RunInstances', 'StopInstances', 'TerminateInstances', 'StartInstances', 'CreateSecurityGroup', 'AuthorizeSecurityGroupIngress', 'DescribeSecurityGroups', 'CreateKeyPair'],
  'lambda': ['InvokeFunction', 'CreateFunction', 'DeleteFunction', 'UpdateFunctionCode', 'GetFunction', 'ListFunctions', 'UpdateFunctionConfiguration', 'AddPermission'],
  'iam': ['CreateUser', 'DeleteUser', 'CreateRole', 'DeleteRole', 'AttachRolePolicy', 'DetachRolePolicy', 'CreatePolicy', 'ListUsers', 'GetUser', 'PassRole'],
  'dynamodb': ['GetItem', 'PutItem', 'DeleteItem', 'UpdateItem', 'Query', 'Scan', 'CreateTable', 'DeleteTable', 'DescribeTable', 'BatchWriteItem'],
  'sqs': ['SendMessage', 'ReceiveMessage', 'DeleteMessage', 'CreateQueue', 'DeleteQueue', 'GetQueueAttributes', 'SetQueueAttributes', 'PurgeQueue'],
  'sns': ['Publish', 'Subscribe', 'CreateTopic', 'DeleteTopic', 'ListTopics', 'ListSubscriptions', 'Unsubscribe', 'SetTopicAttributes'],
  'cloudwatch': ['PutMetricData', 'GetMetricData', 'DescribeAlarms', 'PutMetricAlarm', 'DeleteAlarms', 'GetMetricStatistics', 'ListMetrics', 'PutDashboard'],
  'logs': ['CreateLogGroup', 'CreateLogStream', 'PutLogEvents', 'DescribeLogGroups', 'DescribeLogStreams', 'GetLogEvents', 'FilterLogEvents', 'DeleteLogGroup'],
  'sts': ['AssumeRole', 'GetCallerIdentity', 'AssumeRoleWithWebIdentity', 'AssumeRoleWithSAML', 'GetSessionToken'],
  'kms': ['Encrypt', 'Decrypt', 'GenerateDataKey', 'CreateKey', 'DescribeKey', 'ListKeys', 'EnableKey', 'DisableKey'],
};

const conditionOperators = ['StringEquals', 'StringNotEquals', 'StringLike', 'StringNotLike', 'IpAddress', 'NotIpAddress', 'DateGreaterThan', 'DateLessThan', 'NumericEquals', 'NumericGreaterThan', 'NumericLessThan', 'Bool', 'ArnEquals', 'ArnLike'];
const arnTemplates = ['arn:aws:s3:::bucket-name/*', 'arn:aws:lambda:us-east-1:123456789012:function:my-function', 'arn:aws:dynamodb:us-east-1:123456789012:table/my-table', 'arn:aws:sqs:us-east-1:123456789012:my-queue', 'arn:aws:sns:us-east-1:123456789012:my-topic', 'arn:aws:iam::123456789012:role/my-role', 'arn:aws:ec2:us-east-1:123456789012:instance/*', 'arn:aws:kms:us-east-1:123456789012:key/*', '*'];

interface Condition { operator: string; key: string; value: string; }
interface Statement { sid: string; effect: 'Allow' | 'Deny'; actions: string[]; resources: string[]; conditions: Condition[]; expanded: boolean; }

const uid = () => Math.random().toString(36).slice(2, 9);

export default function App() {
  const [policyName, setPolicyName] = useState('MyPolicy');
  const [version] = useState('2012-10-17');
  const [statements, setStatements] = useState<Statement[]>([
    { sid: 'Stmt1', effect: 'Allow', actions: ['s3:GetObject'], resources: ['arn:aws:s3:::bucket-name/*'], conditions: [], expanded: true },
  ]);
  const [snack, setSnack] = useState('');
  const [actionInput, setActionInput] = useState<Record<number, string>>({});
  const [errors, setErrors] = useState<string[]>([]);

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text); setSnack('Copied to clipboard');
  }, []);

  const updateStmt = (idx: number, patch: Partial<Statement>) => {
    setStatements(prev => prev.map((s, i) => i === idx ? { ...s, ...patch } : s));
  };

  const addStatement = () => {
    setStatements(prev => [...prev, { sid: `Stmt${prev.length + 1}`, effect: 'Allow', actions: [], resources: ['*'], conditions: [], expanded: true }]);
  };

  const removeStatement = (idx: number) => setStatements(prev => prev.filter((_, i) => i !== idx));

  const addAction = (idx: number) => {
    const val = actionInput[idx]?.trim();
    if (!val) return;
    updateStmt(idx, { actions: [...statements[idx].actions, val] });
    setActionInput(prev => ({ ...prev, [idx]: '' }));
  };

  const removeAction = (si: number, ai: number) => {
    updateStmt(si, { actions: statements[si].actions.filter((_, i) => i !== ai) });
  };

  const addResource = (si: number) => {
    updateStmt(si, { resources: [...statements[si].resources, ''] });
  };

  const updateResource = (si: number, ri: number, val: string) => {
    const r = [...statements[si].resources]; r[ri] = val;
    updateStmt(si, { resources: r });
  };

  const removeResource = (si: number, ri: number) => {
    updateStmt(si, { resources: statements[si].resources.filter((_, i) => i !== ri) });
  };

  const addCondition = (si: number) => {
    updateStmt(si, { conditions: [...statements[si].conditions, { operator: 'StringEquals', key: '', value: '' }] });
  };

  const updateCondition = (si: number, ci: number, patch: Partial<Condition>) => {
    const c = statements[si].conditions.map((cond, i) => i === ci ? { ...cond, ...patch } : cond);
    updateStmt(si, { conditions: c });
  };

  const removeCondition = (si: number, ci: number) => {
    updateStmt(si, { conditions: statements[si].conditions.filter((_, i) => i !== ci) });
  };

  const allActions = Object.entries(serviceActions).flatMap(([svc, acts]) => [`${svc}:*`, ...acts.map(a => `${svc}:${a}`)]);

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!policyName.trim()) errs.push('Policy name is required');
    if (statements.length === 0) errs.push('At least one statement is required');
    statements.forEach((s, i) => {
      if (s.actions.length === 0) errs.push(`Statement ${i + 1}: At least one action required`);
      if (s.resources.length === 0) errs.push(`Statement ${i + 1}: At least one resource required`);
      s.resources.forEach((r, ri) => { if (!r.trim()) errs.push(`Statement ${i + 1}, Resource ${ri + 1}: Resource ARN cannot be empty`); });
      s.conditions.forEach((c, ci) => {
        if (!c.key.trim()) errs.push(`Statement ${i + 1}, Condition ${ci + 1}: Condition key required`);
        if (!c.value.trim()) errs.push(`Statement ${i + 1}, Condition ${ci + 1}: Condition value required`);
      });
    });
    return errs;
  };

  const generatePolicy = () => {
    const policy: Record<string, unknown> = { Version: version, Statement: statements.map(s => {
      const stmt: Record<string, unknown> = { Sid: s.sid, Effect: s.effect, Action: s.actions.length === 1 ? s.actions[0] : s.actions, Resource: s.resources.length === 1 ? s.resources[0] : s.resources };
      if (s.conditions.length > 0) {
        const cond: Record<string, Record<string, string>> = {};
        s.conditions.forEach(c => {
          if (!cond[c.operator]) cond[c.operator] = {};
          cond[c.operator][c.key] = c.value;
        });
        stmt.Condition = cond;
      }
      return stmt;
    })};
    return JSON.stringify(policy, null, 2);
  };

  const handleGenerate = () => {
    const errs = validate();
    setErrors(errs);
    if (errs.length === 0) setSnack('Policy JSON generated successfully');
  };

  const policyJson = generatePolicy();
  const sxField = { '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#333' }, '&:hover fieldset': { borderColor: '#555' }, '&.Mui-focused fieldset': { borderColor: '#1976d2' } }, '& .MuiInputLabel-root': { color: 'grey.500' }, '& .MuiInputBase-input': { color: 'grey.300' }, '& .MuiSelect-icon': { color: 'grey.500' } };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'grey.300', p: 3 }}>
      <Box sx={{ maxWidth: 960, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>AWS IAM Policy Builder</Typography>
        </Box>

        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <TextField label="Policy Name" value={policyName} onChange={e => setPolicyName(e.target.value)} size="small" sx={{ flex: 1, minWidth: 200, ...sxField }} />
            <TextField label="Version" value={version} size="small" disabled sx={{ width: 150, ...sxField }} />
          </Box>

          {statements.map((stmt, si) => (
            <Paper key={si} sx={{ bgcolor: '#0d0d0d', border: '1px solid #1a1a1a', p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton size="small" onClick={() => updateStmt(si, { expanded: !stmt.expanded })} sx={{ color: 'grey.500' }}>
                    {stmt.expanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                  <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Statement {si + 1}</Typography>
                  <Chip label={stmt.effect} size="small" color={stmt.effect === 'Allow' ? 'success' : 'error'} />
                </Box>
                <IconButton size="small" onClick={() => removeStatement(si)} sx={{ color: 'grey.600' }}><Delete /></IconButton>
              </Box>

              {stmt.expanded && (
                <Box sx={{ pl: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <TextField label="Sid" value={stmt.sid} onChange={e => updateStmt(si, { sid: e.target.value })} size="small" sx={{ width: 200, ...sxField }} />
                    <FormControl size="small" sx={{ width: 150, ...sxField }}>
                      <InputLabel sx={{ color: 'grey.500' }}>Effect</InputLabel>
                      <Select value={stmt.effect} label="Effect" onChange={e => updateStmt(si, { effect: e.target.value as 'Allow' | 'Deny' })} sx={{ color: 'grey.300' }}>
                        <MenuItem value="Allow">Allow</MenuItem>
                        <MenuItem value="Deny">Deny</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Typography variant="caption" sx={{ color: 'grey.500', mb: 1, display: 'block' }}>Actions</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    {stmt.actions.map((a, ai) => (
                      <Chip key={ai} label={a} size="small" onDelete={() => removeAction(si, ai)} sx={{ bgcolor: '#1a2332', color: '#90caf9', '& .MuiChip-deleteIcon': { color: '#5a8ab5' } }} />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Autocomplete size="small" freeSolo options={allActions} inputValue={actionInput[si] || ''} onInputChange={(_, v) => setActionInput(prev => ({ ...prev, [si]: v }))}
                      onChange={(_, v) => { if (v) { updateStmt(si, { actions: [...stmt.actions, v as string] }); setActionInput(prev => ({ ...prev, [si]: '' })); } }}
                      renderInput={params => <TextField {...params} label="Add Action (e.g. s3:GetObject)" sx={sxField} />} sx={{ flex: 1, ...sxField }} />
                    <Button variant="outlined" size="small" onClick={() => addAction(si)} sx={{ borderColor: '#333' }}>Add</Button>
                  </Box>

                  <Typography variant="caption" sx={{ color: 'grey.500', mb: 1, display: 'block' }}>Resources</Typography>
                  {stmt.resources.map((r, ri) => (
                    <Box key={ri} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Autocomplete size="small" freeSolo options={arnTemplates} value={r}
                        onInputChange={(_, v) => updateResource(si, ri, v)}
                        onChange={(_, v) => updateResource(si, ri, (v as string) || '')}
                        renderInput={params => <TextField {...params} label="Resource ARN" sx={sxField} />} sx={{ flex: 1, ...sxField }} />
                      <IconButton size="small" onClick={() => removeResource(si, ri)} sx={{ color: 'grey.600' }}><Delete /></IconButton>
                    </Box>
                  ))}
                  <Button size="small" startIcon={<Add />} onClick={() => addResource(si)} sx={{ color: 'grey.500', mb: 2 }}>Add Resource</Button>

                  <Divider sx={{ borderColor: '#222', my: 1 }} />
                  <Typography variant="caption" sx={{ color: 'grey.500', mb: 1, display: 'block' }}>Conditions</Typography>
                  {stmt.conditions.map((c, ci) => (
                    <Box key={ci} sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      <FormControl size="small" sx={{ width: 180, ...sxField }}>
                        <InputLabel sx={{ color: 'grey.500' }}>Operator</InputLabel>
                        <Select value={c.operator} label="Operator" onChange={e => updateCondition(si, ci, { operator: e.target.value })} sx={{ color: 'grey.300' }}>
                          {conditionOperators.map(op => <MenuItem key={op} value={op}>{op}</MenuItem>)}
                        </Select>
                      </FormControl>
                      <TextField label="Condition Key" value={c.key} onChange={e => updateCondition(si, ci, { key: e.target.value })} size="small" sx={{ flex: 1, minWidth: 150, ...sxField }} />
                      <TextField label="Value" value={c.value} onChange={e => updateCondition(si, ci, { value: e.target.value })} size="small" sx={{ flex: 1, minWidth: 150, ...sxField }} />
                      <IconButton size="small" onClick={() => removeCondition(si, ci)} sx={{ color: 'grey.600' }}><Delete /></IconButton>
                    </Box>
                  ))}
                  <Button size="small" startIcon={<Add />} onClick={() => addCondition(si)} sx={{ color: 'grey.500' }}>Add Condition</Button>
                </Box>
              )}
            </Paper>
          ))}

          <Button variant="outlined" startIcon={<Add />} onClick={addStatement} sx={{ borderColor: '#333', color: 'grey.400' }}>Add Statement</Button>
        </Paper>

        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2, bgcolor: '#1a0a0a', color: '#f88' }}>
            {errors.map((e, i) => <div key={i}>{e}</div>)}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button variant="contained" onClick={handleGenerate}>Validate &amp; Generate</Button>
          <Tooltip title="Copy JSON"><IconButton onClick={() => copy(policyJson)} sx={{ color: 'grey.400' }}><ContentCopy /></IconButton></Tooltip>
        </Box>

        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
          <Typography variant="caption" sx={{ color: 'grey.500', mb: 1, display: 'block' }}>Generated IAM Policy JSON</Typography>
          <Box component="pre" sx={{ color: '#81c784', fontFamily: 'monospace', fontSize: 13, overflow: 'auto', maxHeight: 500, whiteSpace: 'pre-wrap', m: 0 }}>
            {policyJson}
          </Box>
        </Paper>
      </Box>
      <Snackbar open={!!snack} autoHideDuration={2000} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
}
