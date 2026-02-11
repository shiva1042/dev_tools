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

interface Attribute {
  name: string;
  type: 'S' | 'N' | 'B';
}

interface GSI {
  id: number;
  name: string;
  partitionKey: string;
  sortKey: string;
  projectionType: 'ALL' | 'KEYS_ONLY' | 'INCLUDE';
  includeAttrs: string;
  rcu: number;
  wcu: number;
}

interface LSI {
  id: number;
  name: string;
  sortKey: string;
  projectionType: 'ALL' | 'KEYS_ONLY' | 'INCLUDE';
  includeAttrs: string;
}

interface Tag {
  key: string;
  value: string;
}

const TYPE_NAMES: Record<string, string> = { S: 'String', N: 'Number', B: 'Binary' };

export default function DynamoDBTableDesigner() {
  const [tableName, setTableName] = useState('MyTable');
  const [billingMode, setBillingMode] = useState<'PROVISIONED' | 'PAY_PER_REQUEST'>('PAY_PER_REQUEST');
  const [rcu, setRcu] = useState(5);
  const [wcu, setWcu] = useState(5);
  const [pkName, setPkName] = useState('pk');
  const [pkType, setPkType] = useState<'S' | 'N' | 'B'>('S');
  const [hasSortKey, setHasSortKey] = useState(false);
  const [skName, setSkName] = useState('sk');
  const [skType, setSkType] = useState<'S' | 'N' | 'B'>('S');
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [gsis, setGsis] = useState<GSI[]>([]);
  const [lsis, setLsis] = useState<LSI[]>([]);
  const [ttlAttr, setTtlAttr] = useState('');
  const [streamEnabled, setStreamEnabled] = useState(false);
  const [streamViewType, setStreamViewType] = useState('NEW_AND_OLD_IMAGES');
  const [tags, setTags] = useState<Tag[]>([]);
  const [outputTab, setOutputTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const addGSI = () => setGsis([...gsis, { id: Date.now(), name: `gsi_${gsis.length + 1}`, partitionKey: '', sortKey: '', projectionType: 'ALL', includeAttrs: '', rcu: 5, wcu: 5 }]);
  const removeGSI = (id: number) => setGsis(gsis.filter((g) => g.id !== id));
  const updateGSI = (id: number, field: keyof GSI, value: string | number) => setGsis(gsis.map((g) => g.id === id ? { ...g, [field]: value } : g));

  const addLSI = () => setLsis([...lsis, { id: Date.now(), name: `lsi_${lsis.length + 1}`, sortKey: '', projectionType: 'ALL', includeAttrs: '' }]);
  const removeLSI = (id: number) => setLsis(lsis.filter((l) => l.id !== id));
  const updateLSI = (id: number, field: keyof LSI, value: string) => setLsis(lsis.map((l) => l.id === id ? { ...l, [field]: value } : l));

  const addAttribute = () => setAttributes([...attributes, { name: '', type: 'S' }]);
  const addTag = () => setTags([...tags, { key: '', value: '' }]);

  const allAttrDefs = useMemo(() => {
    const defs: Attribute[] = [{ name: pkName, type: pkType }];
    if (hasSortKey) defs.push({ name: skName, type: skType });
    const allKeyNames = new Set(defs.map((d) => d.name));
    gsis.forEach((g) => { if (g.partitionKey && !allKeyNames.has(g.partitionKey)) { allKeyNames.add(g.partitionKey); defs.push({ name: g.partitionKey, type: 'S' }); } if (g.sortKey && !allKeyNames.has(g.sortKey)) { allKeyNames.add(g.sortKey); defs.push({ name: g.sortKey, type: 'S' }); } });
    lsis.forEach((l) => { if (l.sortKey && !allKeyNames.has(l.sortKey)) { allKeyNames.add(l.sortKey); defs.push({ name: l.sortKey, type: 'S' }); } });
    attributes.forEach((a) => { if (a.name && !allKeyNames.has(a.name)) { allKeyNames.add(a.name); defs.push(a); } });
    return defs;
  }, [pkName, pkType, hasSortKey, skName, skType, gsis, lsis, attributes]);

  const awsCli = useMemo(() => {
    const attrDefs = allAttrDefs.map((a) => `AttributeName=${a.name},AttributeType=${a.type}`).join(' ');
    const keySchema = hasSortKey ? `AttributeName=${pkName},KeyType=HASH AttributeName=${skName},KeyType=RANGE` : `AttributeName=${pkName},KeyType=HASH`;
    let cmd = `aws dynamodb create-table \\\n  --table-name ${tableName} \\\n  --attribute-definitions ${attrDefs} \\\n  --key-schema ${keySchema} \\\n  --billing-mode ${billingMode}`;
    if (billingMode === 'PROVISIONED') cmd += ` \\\n  --provisioned-throughput ReadCapacityUnits=${rcu},WriteCapacityUnits=${wcu}`;
    if (gsis.length > 0) {
      const gsiStr = gsis.map((g) => {
        let s = `IndexName=${g.name},KeySchema=[{AttributeName=${g.partitionKey},KeyType=HASH}`;
        if (g.sortKey) s += `,{AttributeName=${g.sortKey},KeyType=RANGE}`;
        s += `],Projection={ProjectionType=${g.projectionType}`;
        if (g.projectionType === 'INCLUDE') s += `,NonKeyAttributes=[${g.includeAttrs}]`;
        s += '}';
        if (billingMode === 'PROVISIONED') s += `,ProvisionedThroughput={ReadCapacityUnits=${g.rcu},WriteCapacityUnits=${g.wcu}}`;
        return s;
      }).join(' ');
      cmd += ` \\\n  --global-secondary-indexes ${gsiStr}`;
    }
    if (lsis.length > 0) {
      const lsiStr = lsis.map((l) => {
        let s = `IndexName=${l.name},KeySchema=[{AttributeName=${pkName},KeyType=HASH},{AttributeName=${l.sortKey},KeyType=RANGE}],Projection={ProjectionType=${l.projectionType}`;
        if (l.projectionType === 'INCLUDE') s += `,NonKeyAttributes=[${l.includeAttrs}]`;
        s += '}';
        return s;
      }).join(' ');
      cmd += ` \\\n  --local-secondary-indexes ${lsiStr}`;
    }
    if (streamEnabled) cmd += ` \\\n  --stream-specification StreamEnabled=true,StreamViewType=${streamViewType}`;
    if (tags.length > 0) cmd += ` \\\n  --tags ${tags.filter((t) => t.key).map((t) => `Key=${t.key},Value=${t.value}`).join(' ')}`;
    return cmd;
  }, [tableName, allAttrDefs, pkName, skName, hasSortKey, billingMode, rcu, wcu, gsis, lsis, streamEnabled, streamViewType, tags]);

  const cfnJson = useMemo(() => {
    const resource: Record<string, unknown> = {
      Type: 'AWS::DynamoDB::Table',
      Properties: {
        TableName: tableName,
        BillingMode: billingMode,
        AttributeDefinitions: allAttrDefs.map((a) => ({ AttributeName: a.name, AttributeType: a.type })),
        KeySchema: hasSortKey
          ? [{ AttributeName: pkName, KeyType: 'HASH' }, { AttributeName: skName, KeyType: 'RANGE' }]
          : [{ AttributeName: pkName, KeyType: 'HASH' }],
      },
    };
    const props = resource.Properties as Record<string, unknown>;
    if (billingMode === 'PROVISIONED') props.ProvisionedThroughput = { ReadCapacityUnits: rcu, WriteCapacityUnits: wcu };
    if (gsis.length > 0) {
      props.GlobalSecondaryIndexes = gsis.map((g) => {
        const idx: Record<string, unknown> = {
          IndexName: g.name,
          KeySchema: g.sortKey ? [{ AttributeName: g.partitionKey, KeyType: 'HASH' }, { AttributeName: g.sortKey, KeyType: 'RANGE' }] : [{ AttributeName: g.partitionKey, KeyType: 'HASH' }],
          Projection: { ProjectionType: g.projectionType, ...(g.projectionType === 'INCLUDE' ? { NonKeyAttributes: g.includeAttrs.split(',').map((s) => s.trim()) } : {}) },
        };
        if (billingMode === 'PROVISIONED') idx.ProvisionedThroughput = { ReadCapacityUnits: g.rcu, WriteCapacityUnits: g.wcu };
        return idx;
      });
    }
    if (lsis.length > 0) {
      props.LocalSecondaryIndexes = lsis.map((l) => ({
        IndexName: l.name,
        KeySchema: [{ AttributeName: pkName, KeyType: 'HASH' }, { AttributeName: l.sortKey, KeyType: 'RANGE' }],
        Projection: { ProjectionType: l.projectionType, ...(l.projectionType === 'INCLUDE' ? { NonKeyAttributes: l.includeAttrs.split(',').map((s) => s.trim()) } : {}) },
      }));
    }
    if (ttlAttr) props.TimeToLiveSpecification = { AttributeName: ttlAttr, Enabled: true };
    if (streamEnabled) props.StreamSpecification = { StreamViewType: streamViewType };
    if (tags.length > 0) props.Tags = tags.filter((t) => t.key).map((t) => ({ Key: t.key, Value: t.value }));
    return JSON.stringify({ Resources: { [tableName.replace(/[^a-zA-Z0-9]/g, '')]: resource } }, null, 2);
  }, [tableName, allAttrDefs, pkName, skName, hasSortKey, billingMode, rcu, wcu, gsis, lsis, ttlAttr, streamEnabled, streamViewType, tags]);

  const terraformHCL = useMemo(() => {
    let hcl = `resource "aws_dynamodb_table" "${tableName.replace(/[^a-zA-Z0-9_]/g, '_')}" {\n  name         = "${tableName}"\n  billing_mode = "${billingMode}"\n  hash_key     = "${pkName}"\n`;
    if (hasSortKey) hcl += `  range_key    = "${skName}"\n`;
    if (billingMode === 'PROVISIONED') hcl += `  read_capacity  = ${rcu}\n  write_capacity = ${wcu}\n`;
    hcl += '\n';
    allAttrDefs.forEach((a) => { hcl += `  attribute {\n    name = "${a.name}"\n    type = "${a.type}"\n  }\n\n`; });
    gsis.forEach((g) => {
      hcl += `  global_secondary_index {\n    name            = "${g.name}"\n    hash_key        = "${g.partitionKey}"\n`;
      if (g.sortKey) hcl += `    range_key       = "${g.sortKey}"\n`;
      hcl += `    projection_type = "${g.projectionType}"\n`;
      if (g.projectionType === 'INCLUDE') hcl += `    non_key_attributes = [${g.includeAttrs.split(',').map((s) => `"${s.trim()}"`).join(', ')}]\n`;
      if (billingMode === 'PROVISIONED') hcl += `    read_capacity  = ${g.rcu}\n    write_capacity = ${g.wcu}\n`;
      hcl += '  }\n\n';
    });
    lsis.forEach((l) => {
      hcl += `  local_secondary_index {\n    name            = "${l.name}"\n    range_key       = "${l.sortKey}"\n    projection_type = "${l.projectionType}"\n`;
      if (l.projectionType === 'INCLUDE') hcl += `    non_key_attributes = [${l.includeAttrs.split(',').map((s) => `"${s.trim()}"`).join(', ')}]\n`;
      hcl += '  }\n\n';
    });
    if (ttlAttr) hcl += `  ttl {\n    attribute_name = "${ttlAttr}"\n    enabled        = true\n  }\n\n`;
    if (streamEnabled) hcl += `  stream_enabled   = true\n  stream_view_type = "${streamViewType}"\n\n`;
    tags.filter((t) => t.key).forEach((t) => { hcl += `  tags = {\n    ${t.key} = "${t.value}"\n  }\n`; });
    hcl += '}';
    return hcl;
  }, [tableName, allAttrDefs, pkName, skName, hasSortKey, billingMode, rcu, wcu, gsis, lsis, ttlAttr, streamEnabled, streamViewType, tags]);

  const cdkCode = useMemo(() => {
    let code = `import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';\nimport { RemovalPolicy } from 'aws-cdk-lib';\n\nconst table = new dynamodb.Table(this, '${tableName}', {\n  tableName: '${tableName}',\n  billingMode: dynamodb.BillingMode.${billingMode},\n  partitionKey: { name: '${pkName}', type: dynamodb.AttributeType.${pkType === 'S' ? 'STRING' : pkType === 'N' ? 'NUMBER' : 'BINARY'} },\n`;
    if (hasSortKey) code += `  sortKey: { name: '${skName}', type: dynamodb.AttributeType.${skType === 'S' ? 'STRING' : skType === 'N' ? 'NUMBER' : 'BINARY'} },\n`;
    if (billingMode === 'PROVISIONED') code += `  readCapacity: ${rcu},\n  writeCapacity: ${wcu},\n`;
    if (streamEnabled) code += `  stream: dynamodb.StreamViewType.${streamViewType},\n`;
    if (ttlAttr) code += `  timeToLiveAttribute: '${ttlAttr}',\n`;
    code += `  removalPolicy: RemovalPolicy.RETAIN,\n});\n`;
    gsis.forEach((g) => {
      code += `\ntable.addGlobalSecondaryIndex({\n  indexName: '${g.name}',\n  partitionKey: { name: '${g.partitionKey}', type: dynamodb.AttributeType.STRING },\n`;
      if (g.sortKey) code += `  sortKey: { name: '${g.sortKey}', type: dynamodb.AttributeType.STRING },\n`;
      code += `  projectionType: dynamodb.ProjectionType.${g.projectionType},\n`;
      if (g.projectionType === 'INCLUDE') code += `  nonKeyAttributes: [${g.includeAttrs.split(',').map((s) => `'${s.trim()}'`).join(', ')}],\n`;
      code += '});\n';
    });
    return code;
  }, [tableName, pkName, pkType, hasSortKey, skName, skType, billingMode, rcu, wcu, gsis, streamEnabled, streamViewType, ttlAttr]);

  const boto3Code = useMemo(() => {
    let code = `import boto3\n\ndynamodb = boto3.resource('dynamodb')\n\ntable = dynamodb.create_table(\n    TableName='${tableName}',\n    KeySchema=[\n        {'AttributeName': '${pkName}', 'KeyType': 'HASH'},\n`;
    if (hasSortKey) code += `        {'AttributeName': '${skName}', 'KeyType': 'RANGE'},\n`;
    code += `    ],\n    AttributeDefinitions=[\n`;
    allAttrDefs.forEach((a) => { code += `        {'AttributeName': '${a.name}', 'AttributeType': '${a.type}'},\n`; });
    code += `    ],\n    BillingMode='${billingMode}',\n`;
    if (billingMode === 'PROVISIONED') code += `    ProvisionedThroughput={'ReadCapacityUnits': ${rcu}, 'WriteCapacityUnits': ${wcu}},\n`;
    if (gsis.length > 0) {
      code += '    GlobalSecondaryIndexes=[\n';
      gsis.forEach((g) => {
        code += `        {\n            'IndexName': '${g.name}',\n            'KeySchema': [{'AttributeName': '${g.partitionKey}', 'KeyType': 'HASH'}`;
        if (g.sortKey) code += `, {'AttributeName': '${g.sortKey}', 'KeyType': 'RANGE'}`;
        code += `],\n            'Projection': {'ProjectionType': '${g.projectionType}'`;
        if (g.projectionType === 'INCLUDE') code += `, 'NonKeyAttributes': [${g.includeAttrs.split(',').map((s) => `'${s.trim()}'`).join(', ')}]`;
        code += '},\n';
        if (billingMode === 'PROVISIONED') code += `            'ProvisionedThroughput': {'ReadCapacityUnits': ${g.rcu}, 'WriteCapacityUnits': ${g.wcu}},\n`;
        code += '        },\n';
      });
      code += '    ],\n';
    }
    if (streamEnabled) code += `    StreamSpecification={'StreamEnabled': True, 'StreamViewType': '${streamViewType}'},\n`;
    if (tags.length > 0) code += `    Tags=[${tags.filter((t) => t.key).map((t) => `{'Key': '${t.key}', 'Value': '${t.value}'}`).join(', ')}],\n`;
    code += ')\n\ntable.wait_until_exists()\nprint(f"Table {table.table_name} created successfully.")';
    return code;
  }, [tableName, allAttrDefs, pkName, hasSortKey, skName, billingMode, rcu, wcu, gsis, streamEnabled, streamViewType, tags]);

  const outputs = [awsCli, cfnJson, terraformHCL, cdkCode, boto3Code];
  const outputLabels = ['AWS CLI', 'CloudFormation', 'Terraform', 'CDK (TS)', 'Boto3 (Python)'];

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copied to clipboard' });
  };

  const fieldSx = { mb: 1, '& .MuiInputBase-root': { color: 'grey.300', fontSize: 13 }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } };
  const selSx = { color: 'grey.300', '.MuiOutlinedInput-notchedOutline': { borderColor: '#333' } };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>DynamoDB Table Designer</Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, p: 2, height: 'calc(100vh - 80px)' }}>
        {/* Design panel */}
        <Paper sx={{ width: 400, bgcolor: '#111', border: '1px solid #222', p: 2, overflowY: 'auto', flexShrink: 0 }}>
          <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Table Settings</Typography>
          <TextField size="small" fullWidth label="Table Name" value={tableName} onChange={(e) => setTableName(e.target.value)} sx={fieldSx} />
          <FormControl size="small" fullWidth sx={{ mb: 1 }}>
            <InputLabel sx={{ color: 'grey.500' }}>Billing Mode</InputLabel>
            <Select value={billingMode} label="Billing Mode" onChange={(e) => setBillingMode(e.target.value as 'PROVISIONED' | 'PAY_PER_REQUEST')} sx={selSx}>
              <MenuItem value="PAY_PER_REQUEST">On-Demand</MenuItem>
              <MenuItem value="PROVISIONED">Provisioned</MenuItem>
            </Select>
          </FormControl>
          {billingMode === 'PROVISIONED' && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField size="small" fullWidth label="RCU" type="number" value={rcu} onChange={(e) => setRcu(Number(e.target.value))} sx={fieldSx} />
              <TextField size="small" fullWidth label="WCU" type="number" value={wcu} onChange={(e) => setWcu(Number(e.target.value))} sx={fieldSx} />
            </Box>
          )}

          <Typography variant="subtitle2" sx={{ color: 'grey.400', mt: 2, mb: 1 }}>Primary Key</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField size="small" label="Partition Key" value={pkName} onChange={(e) => setPkName(e.target.value)} sx={{ ...fieldSx, flex: 1 }} />
            <FormControl size="small" sx={{ width: 70 }}>
              <Select value={pkType} onChange={(e) => setPkType(e.target.value as 'S' | 'N' | 'B')} sx={{ ...selSx, fontSize: 12 }}>
                <MenuItem value="S">S</MenuItem><MenuItem value="N">N</MenuItem><MenuItem value="B">B</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <FormControlLabel control={<Switch checked={hasSortKey} onChange={(e) => setHasSortKey(e.target.checked)} size="small" />}
            label="Sort Key" sx={{ color: 'grey.400' }} />
          {hasSortKey && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField size="small" label="Sort Key" value={skName} onChange={(e) => setSkName(e.target.value)} sx={{ ...fieldSx, flex: 1 }} />
              <FormControl size="small" sx={{ width: 70 }}>
                <Select value={skType} onChange={(e) => setSkType(e.target.value as 'S' | 'N' | 'B')} sx={{ ...selSx, fontSize: 12 }}>
                  <MenuItem value="S">S</MenuItem><MenuItem value="N">N</MenuItem><MenuItem value="B">B</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}

          <Typography variant="subtitle2" sx={{ color: 'grey.400', mt: 2, mb: 1 }}>
            Additional Attributes
            <IconButton size="small" onClick={addAttribute} sx={{ color: 'grey.400', ml: 1 }}><Add sx={{ fontSize: 16 }} /></IconButton>
          </Typography>
          {attributes.map((a, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
              <TextField size="small" value={a.name} onChange={(e) => { const u = [...attributes]; u[i].name = e.target.value; setAttributes(u); }} placeholder="name" sx={{ ...fieldSx, flex: 1, mb: 0 }} />
              <FormControl size="small" sx={{ width: 70 }}>
                <Select value={a.type} onChange={(e) => { const u = [...attributes]; u[i].type = e.target.value as 'S' | 'N' | 'B'; setAttributes(u); }} sx={{ ...selSx, fontSize: 12 }}>
                  <MenuItem value="S">S</MenuItem><MenuItem value="N">N</MenuItem><MenuItem value="B">B</MenuItem>
                </Select>
              </FormControl>
              <IconButton size="small" onClick={() => setAttributes(attributes.filter((_, idx) => idx !== i))} sx={{ color: 'grey.600' }}><Delete sx={{ fontSize: 16 }} /></IconButton>
            </Box>
          ))}

          <Typography variant="subtitle2" sx={{ color: 'grey.400', mt: 2, mb: 1 }}>
            Global Secondary Indexes ({gsis.length})
            <IconButton size="small" onClick={addGSI} sx={{ color: 'grey.400', ml: 1 }}><Add sx={{ fontSize: 16 }} /></IconButton>
          </Typography>
          {gsis.map((g) => (
            <Paper key={g.id} sx={{ bgcolor: '#0a0a0a', border: '1px solid #222', p: 1.5, mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <TextField size="small" value={g.name} onChange={(e) => updateGSI(g.id, 'name', e.target.value)} placeholder="Index name" sx={{ ...fieldSx, mb: 0, flex: 1, mr: 1 }} />
                <IconButton size="small" onClick={() => removeGSI(g.id)} sx={{ color: 'grey.600' }}><Delete sx={{ fontSize: 16 }} /></IconButton>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                <TextField size="small" value={g.partitionKey} onChange={(e) => updateGSI(g.id, 'partitionKey', e.target.value)} placeholder="Partition key" sx={{ ...fieldSx, mb: 0, flex: 1 }} />
                <TextField size="small" value={g.sortKey} onChange={(e) => updateGSI(g.id, 'sortKey', e.target.value)} placeholder="Sort key (opt)" sx={{ ...fieldSx, mb: 0, flex: 1 }} />
              </Box>
              <FormControl size="small" fullWidth sx={{ mt: 0.5 }}>
                <Select value={g.projectionType} onChange={(e) => updateGSI(g.id, 'projectionType', e.target.value)} sx={{ ...selSx, fontSize: 12 }}>
                  <MenuItem value="ALL">ALL</MenuItem><MenuItem value="KEYS_ONLY">KEYS_ONLY</MenuItem><MenuItem value="INCLUDE">INCLUDE</MenuItem>
                </Select>
              </FormControl>
              {g.projectionType === 'INCLUDE' && (
                <TextField size="small" fullWidth value={g.includeAttrs} onChange={(e) => updateGSI(g.id, 'includeAttrs', e.target.value)} placeholder="attr1, attr2" sx={{ ...fieldSx, mt: 0.5, mb: 0 }} />
              )}
            </Paper>
          ))}

          <Typography variant="subtitle2" sx={{ color: 'grey.400', mt: 2, mb: 1 }}>
            Local Secondary Indexes ({lsis.length})
            <IconButton size="small" onClick={addLSI} sx={{ color: 'grey.400', ml: 1 }}><Add sx={{ fontSize: 16 }} /></IconButton>
          </Typography>
          {lsis.map((l) => (
            <Paper key={l.id} sx={{ bgcolor: '#0a0a0a', border: '1px solid #222', p: 1.5, mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <TextField size="small" value={l.name} onChange={(e) => updateLSI(l.id, 'name', e.target.value)} placeholder="Index name" sx={{ ...fieldSx, mb: 0, flex: 1, mr: 1 }} />
                <IconButton size="small" onClick={() => removeLSI(l.id)} sx={{ color: 'grey.600' }}><Delete sx={{ fontSize: 16 }} /></IconButton>
              </Box>
              <TextField size="small" fullWidth value={l.sortKey} onChange={(e) => updateLSI(l.id, 'sortKey', e.target.value)} placeholder="Sort key" sx={{ ...fieldSx, mt: 0.5, mb: 0 }} />
              <FormControl size="small" fullWidth sx={{ mt: 0.5 }}>
                <Select value={l.projectionType} onChange={(e) => updateLSI(l.id, 'projectionType', e.target.value)} sx={{ ...selSx, fontSize: 12 }}>
                  <MenuItem value="ALL">ALL</MenuItem><MenuItem value="KEYS_ONLY">KEYS_ONLY</MenuItem><MenuItem value="INCLUDE">INCLUDE</MenuItem>
                </Select>
              </FormControl>
            </Paper>
          ))}

          <Typography variant="subtitle2" sx={{ color: 'grey.400', mt: 2, mb: 1 }}>Other Settings</Typography>
          <TextField size="small" fullWidth label="TTL Attribute" value={ttlAttr} onChange={(e) => setTtlAttr(e.target.value)} sx={fieldSx} />
          <FormControlLabel control={<Switch checked={streamEnabled} onChange={(e) => setStreamEnabled(e.target.checked)} size="small" />}
            label="DynamoDB Streams" sx={{ color: 'grey.400', display: 'block' }} />
          {streamEnabled && (
            <FormControl size="small" fullWidth sx={{ mb: 1 }}>
              <InputLabel sx={{ color: 'grey.500' }}>Stream View Type</InputLabel>
              <Select value={streamViewType} label="Stream View Type" onChange={(e) => setStreamViewType(e.target.value)} sx={selSx}>
                <MenuItem value="NEW_IMAGE">NEW_IMAGE</MenuItem>
                <MenuItem value="OLD_IMAGE">OLD_IMAGE</MenuItem>
                <MenuItem value="NEW_AND_OLD_IMAGES">NEW_AND_OLD_IMAGES</MenuItem>
                <MenuItem value="KEYS_ONLY">KEYS_ONLY</MenuItem>
              </Select>
            </FormControl>
          )}
          <Typography variant="subtitle2" sx={{ color: 'grey.400', mt: 1, mb: 1 }}>
            Tags
            <IconButton size="small" onClick={addTag} sx={{ color: 'grey.400', ml: 1 }}><Add sx={{ fontSize: 16 }} /></IconButton>
          </Typography>
          {tags.map((t, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
              <TextField size="small" value={t.key} onChange={(e) => { const u = [...tags]; u[i].key = e.target.value; setTags(u); }} placeholder="Key" sx={{ ...fieldSx, flex: 1, mb: 0 }} />
              <TextField size="small" value={t.value} onChange={(e) => { const u = [...tags]; u[i].value = e.target.value; setTags(u); }} placeholder="Value" sx={{ ...fieldSx, flex: 1, mb: 0 }} />
              <IconButton size="small" onClick={() => setTags(tags.filter((_, idx) => idx !== i))} sx={{ color: 'grey.600' }}><Delete sx={{ fontSize: 16 }} /></IconButton>
            </Box>
          ))}
        </Paper>

        {/* Output panel */}
        <Paper sx={{ flex: 1, bgcolor: '#111', border: '1px solid #222', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Box sx={{ borderBottom: '1px solid #222' }}>
            <Tabs value={outputTab} onChange={(_, v) => setOutputTab(v)} variant="scrollable"
              sx={{ '& .MuiTab-root': { color: 'grey.500', fontSize: 12, minHeight: 42 } }}>
              {outputLabels.map((l, i) => <Tab key={l} label={l} />)}
            </Tabs>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, borderBottom: '1px solid #222' }}>
            <Tooltip title="Copy">
              <IconButton size="small" onClick={() => handleCopy(outputs[outputTab])} sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
            <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 12, color: '#98c379', whiteSpace: 'pre-wrap', m: 0 }}>
              {outputs[outputTab]}
            </Typography>
          </Box>
        </Paper>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
