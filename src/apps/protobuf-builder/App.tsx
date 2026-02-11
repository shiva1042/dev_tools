import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Home,
  ContentCopy,
  Add,
  Delete,
  Download,
  Description,
} from '@mui/icons-material';

type Syntax = 'proto3' | 'proto2';
type StreamMode = 'none' | 'server' | 'client' | 'bidi';

interface ProtoField {
  id: string;
  name: string;
  type: string;
  number: number;
  repeated: boolean;
  optional: boolean;
  mapKey: string;
  mapValue: string;
  isMap: boolean;
}

interface ProtoEnum {
  id: string;
  name: string;
  values: { name: string; number: number }[];
}

interface ProtoRPC {
  id: string;
  name: string;
  requestType: string;
  responseType: string;
  streaming: StreamMode;
}

interface ProtoService {
  id: string;
  name: string;
  rpcs: ProtoRPC[];
}

interface ProtoMessage {
  id: string;
  name: string;
  fields: ProtoField[];
}

const SCALAR_TYPES = ['double', 'float', 'int32', 'int64', 'uint32', 'uint64', 'sint32', 'sint64', 'fixed32', 'fixed64', 'sfixed32', 'sfixed64', 'bool', 'string', 'bytes'];

let _nextId = 1;
function uid(): string { return `_${_nextId++}`; }

function makeField(number: number): ProtoField {
  return { id: uid(), name: '', type: 'string', number, repeated: false, optional: false, mapKey: 'string', mapValue: 'string', isMap: false };
}

function generateProto(
  syntax: Syntax, packageName: string, imports: string[], options: { key: string; value: string }[],
  messages: ProtoMessage[], enums: ProtoEnum[], services: ProtoService[]
): string {
  const lines: string[] = [];
  lines.push(`syntax = "${syntax}";`);
  lines.push('');

  if (packageName) { lines.push(`package ${packageName};`); lines.push(''); }

  imports.forEach(imp => { if (imp.trim()) lines.push(`import "${imp.trim()}";`); });
  if (imports.some(i => i.trim())) lines.push('');

  options.forEach(opt => { if (opt.key.trim() && opt.value.trim()) lines.push(`option ${opt.key} = "${opt.value}";`); });
  if (options.some(o => o.key.trim())) lines.push('');

  enums.forEach(en => {
    lines.push(`enum ${en.name || 'UnnamedEnum'} {`);
    en.values.forEach(v => { lines.push(`  ${v.name} = ${v.number};`); });
    lines.push('}');
    lines.push('');
  });

  messages.forEach(msg => {
    lines.push(`message ${msg.name || 'UnnamedMessage'} {`);
    msg.fields.forEach(f => {
      if (!f.name) return;
      if (f.isMap) {
        lines.push(`  map<${f.mapKey}, ${f.mapValue}> ${f.name} = ${f.number};`);
      } else {
        const prefix = f.repeated ? 'repeated ' : (f.optional && syntax === 'proto3') ? 'optional ' : (f.optional && syntax === 'proto2') ? 'optional ' : (syntax === 'proto2' && !f.repeated) ? 'required ' : '';
        lines.push(`  ${prefix}${f.type} ${f.name} = ${f.number};`);
      }
    });
    lines.push('}');
    lines.push('');
  });

  services.forEach(svc => {
    lines.push(`service ${svc.name || 'UnnamedService'} {`);
    svc.rpcs.forEach(rpc => {
      if (!rpc.name) return;
      const req = rpc.streaming === 'client' || rpc.streaming === 'bidi' ? `stream ${rpc.requestType}` : rpc.requestType;
      const res = rpc.streaming === 'server' || rpc.streaming === 'bidi' ? `stream ${rpc.responseType}` : rpc.responseType;
      lines.push(`  rpc ${rpc.name} (${req}) returns (${res}) {}`);
    });
    lines.push('}');
    lines.push('');
  });

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

const fieldLabelSx = { color: 'grey.500', fontSize: 11, mb: 0.5 };
const smallTfSx = { '& .MuiInputBase-root': { bgcolor: '#0d0d0d', color: 'grey.300', fontSize: 12, height: 32 }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#222' } };
const sw = { '& .MuiSwitch-switchBase.Mui-checked': { color: '#8b5cf6' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#8b5cf6' } };

export default function ProtobufBuilder() {
  const [syntax, setSyntax] = useState<Syntax>('proto3');
  const [packageName, setPackageName] = useState('');
  const [imports, setImports] = useState<string[]>([]);
  const [options, setOptions] = useState<{ key: string; value: string }[]>([]);
  const [messages, setMessages] = useState<ProtoMessage[]>([{ id: uid(), name: 'MyMessage', fields: [makeField(1)] }]);
  const [enums, setEnums] = useState<ProtoEnum[]>([]);
  const [services, setServices] = useState<ProtoService[]>([]);
  const [snackOpen, setSnackOpen] = useState(false);

  const allTypeNames = [...messages.map(m => m.name), ...enums.map(e => e.name)].filter(Boolean);

  const output = generateProto(syntax, packageName, imports, options, messages, enums, services);

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(output);
    setSnackOpen(true);
  }, [output]);

  const download = useCallback(() => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${packageName || 'schema'}.proto`;
    a.click();
    URL.revokeObjectURL(url);
  }, [output, packageName]);

  const updateMessage = (msgId: string, updater: (m: ProtoMessage) => ProtoMessage) => {
    setMessages(prev => prev.map(m => m.id === msgId ? updater({ ...m }) : m));
  };

  const updateField = (msgId: string, fieldId: string, updater: (f: ProtoField) => ProtoField) => {
    updateMessage(msgId, m => ({ ...m, fields: m.fields.map(f => f.id === fieldId ? updater({ ...f }) : f) }));
  };

  const selectSx = { bgcolor: '#0d0d0d', color: 'grey.300', fontSize: 12, height: 32, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#222' }, '& .MuiSvgIcon-root': { color: 'grey.500' } };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'grey.300', p: 3 }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Description sx={{ color: '#8b5cf6' }} />
          <Typography variant="h5" fontWeight={700}>Protobuf Builder</Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
          {/* Builder Panel */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Header config */}
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
              <Typography variant="subtitle2" color="grey.400" mb={1}>Configuration</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel sx={{ color: 'grey.500', fontSize: 12 }}>Syntax</InputLabel>
                  <Select value={syntax} label="Syntax" onChange={e => setSyntax(e.target.value as Syntax)} sx={selectSx}>
                    <MenuItem value="proto3">proto3</MenuItem>
                    <MenuItem value="proto2">proto2</MenuItem>
                  </Select>
                </FormControl>
                <TextField size="small" value={packageName} onChange={e => setPackageName(e.target.value)} placeholder="package name" sx={{ flex: 1, ...smallTfSx }} />
              </Box>

              <Box sx={{ mt: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography sx={fieldLabelSx}>Imports</Typography>
                  <IconButton size="small" sx={{ color: 'grey.600', p: 0.3 }} onClick={() => setImports([...imports, ''])}><Add sx={{ fontSize: 14 }} /></IconButton>
                </Box>
                {imports.map((imp, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                    <TextField size="small" fullWidth value={imp} onChange={e => { const n = [...imports]; n[i] = e.target.value; setImports(n); }} placeholder="google/protobuf/timestamp.proto" sx={smallTfSx} />
                    <IconButton size="small" sx={{ color: 'grey.600' }} onClick={() => setImports(imports.filter((_, j) => j !== i))}><Delete sx={{ fontSize: 14 }} /></IconButton>
                  </Box>
                ))}
              </Box>

              <Box sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography sx={fieldLabelSx}>Options</Typography>
                  <IconButton size="small" sx={{ color: 'grey.600', p: 0.3 }} onClick={() => setOptions([...options, { key: '', value: '' }])}><Add sx={{ fontSize: 14 }} /></IconButton>
                </Box>
                {options.map((opt, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                    <TextField size="small" value={opt.key} onChange={e => { const n = [...options]; n[i] = { ...n[i], key: e.target.value }; setOptions(n); }} placeholder="java_package" sx={{ width: 160, ...smallTfSx }} />
                    <TextField size="small" fullWidth value={opt.value} onChange={e => { const n = [...options]; n[i] = { ...n[i], value: e.target.value }; setOptions(n); }} placeholder="com.example" sx={smallTfSx} />
                    <IconButton size="small" sx={{ color: 'grey.600' }} onClick={() => setOptions(options.filter((_, j) => j !== i))}><Delete sx={{ fontSize: 14 }} /></IconButton>
                  </Box>
                ))}
              </Box>
            </Paper>

            {/* Enums */}
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="grey.400">Enums</Typography>
                <Button size="small" startIcon={<Add />} onClick={() => setEnums([...enums, { id: uid(), name: '', values: [{ name: 'UNKNOWN', number: 0 }] }])}
                  sx={{ textTransform: 'none', color: 'grey.400', fontSize: 11 }}>Add Enum</Button>
              </Box>
              {enums.map((en, ei) => (
                <Paper key={en.id} sx={{ bgcolor: '#0d0d0d', border: '1px solid #1a1a1a', p: 1.5, mb: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                    <TextField size="small" value={en.name} onChange={e => { const n = [...enums]; n[ei] = { ...n[ei], name: e.target.value }; setEnums(n); }} placeholder="EnumName" sx={{ flex: 1, ...smallTfSx }} />
                    <IconButton size="small" sx={{ color: 'grey.600' }} onClick={() => setEnums(enums.filter((_, j) => j !== ei))}><Delete sx={{ fontSize: 14 }} /></IconButton>
                  </Box>
                  {en.values.map((v, vi) => (
                    <Box key={vi} sx={{ display: 'flex', gap: 1, mb: 0.5, pl: 1 }}>
                      <TextField size="small" value={v.name} onChange={e => { const n = [...enums]; n[ei].values[vi] = { ...v, name: e.target.value }; setEnums(n); }} placeholder="VALUE_NAME" sx={{ flex: 1, ...smallTfSx }} />
                      <TextField size="small" type="number" value={v.number} onChange={e => { const n = [...enums]; n[ei].values[vi] = { ...v, number: parseInt(e.target.value) || 0 }; setEnums(n); }} sx={{ width: 70, ...smallTfSx }} />
                      <IconButton size="small" sx={{ color: 'grey.600' }} onClick={() => { const n = [...enums]; n[ei] = { ...n[ei], values: n[ei].values.filter((_, j) => j !== vi) }; setEnums(n); }}><Delete sx={{ fontSize: 12 }} /></IconButton>
                    </Box>
                  ))}
                  <Button size="small" onClick={() => { const n = [...enums]; n[ei] = { ...n[ei], values: [...n[ei].values, { name: '', number: n[ei].values.length }] }; setEnums(n); }}
                    sx={{ textTransform: 'none', color: 'grey.500', fontSize: 10, mt: 0.5 }}>+ Value</Button>
                </Paper>
              ))}
            </Paper>

            {/* Messages */}
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="grey.400">Messages</Typography>
                <Button size="small" startIcon={<Add />} onClick={() => setMessages([...messages, { id: uid(), name: '', fields: [makeField(1)] }])}
                  sx={{ textTransform: 'none', color: 'grey.400', fontSize: 11 }}>Add Message</Button>
              </Box>
              {messages.map((msg) => (
                <Paper key={msg.id} sx={{ bgcolor: '#0d0d0d', border: '1px solid #1a1a1a', p: 1.5, mb: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                    <TextField size="small" value={msg.name} onChange={e => updateMessage(msg.id, m => ({ ...m, name: e.target.value }))} placeholder="MessageName" sx={{ flex: 1, ...smallTfSx }} />
                    <IconButton size="small" sx={{ color: 'grey.600' }} onClick={() => setMessages(messages.filter(m => m.id !== msg.id))}><Delete sx={{ fontSize: 14 }} /></IconButton>
                  </Box>
                  {msg.fields.map((f) => (
                    <Box key={f.id} sx={{ display: 'flex', gap: 0.5, mb: 0.5, pl: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                      <FormControl size="small" sx={{ minWidth: 100 }}>
                        <Select value={f.isMap ? 'map' : f.type} onChange={e => {
                          const val = e.target.value as string;
                          if (val === 'map') updateField(msg.id, f.id, fld => ({ ...fld, isMap: true }));
                          else updateField(msg.id, f.id, fld => ({ ...fld, type: val, isMap: false }));
                        }} sx={selectSx}>
                          {SCALAR_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                          {allTypeNames.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                          <MenuItem value="map">map</MenuItem>
                        </Select>
                      </FormControl>
                      {f.isMap && (
                        <>
                          <TextField size="small" value={f.mapKey} onChange={e => updateField(msg.id, f.id, fld => ({ ...fld, mapKey: e.target.value }))} placeholder="key type" sx={{ width: 80, ...smallTfSx }} />
                          <TextField size="small" value={f.mapValue} onChange={e => updateField(msg.id, f.id, fld => ({ ...fld, mapValue: e.target.value }))} placeholder="val type" sx={{ width: 80, ...smallTfSx }} />
                        </>
                      )}
                      <TextField size="small" value={f.name} onChange={e => updateField(msg.id, f.id, fld => ({ ...fld, name: e.target.value }))} placeholder="field_name" sx={{ flex: 1, minWidth: 90, ...smallTfSx }} />
                      <TextField size="small" type="number" value={f.number} onChange={e => updateField(msg.id, f.id, fld => ({ ...fld, number: parseInt(e.target.value) || 1 }))} sx={{ width: 55, ...smallTfSx }} />
                      {!f.isMap && (
                        <>
                          <Tooltip title="repeated"><Chip label="[]" size="small" onClick={() => updateField(msg.id, f.id, fld => ({ ...fld, repeated: !fld.repeated }))} sx={{ bgcolor: f.repeated ? '#8b5cf630' : '#1a1a1a', color: f.repeated ? '#8b5cf6' : 'grey.600', cursor: 'pointer', fontSize: 10, height: 24 }} /></Tooltip>
                          <Tooltip title="optional"><Chip label="?" size="small" onClick={() => updateField(msg.id, f.id, fld => ({ ...fld, optional: !fld.optional }))} sx={{ bgcolor: f.optional ? '#3b82f630' : '#1a1a1a', color: f.optional ? '#3b82f6' : 'grey.600', cursor: 'pointer', fontSize: 10, height: 24 }} /></Tooltip>
                        </>
                      )}
                      <IconButton size="small" sx={{ color: 'grey.600', p: 0.3 }} onClick={() => updateMessage(msg.id, m => ({ ...m, fields: m.fields.filter(x => x.id !== f.id) }))}><Delete sx={{ fontSize: 13 }} /></IconButton>
                    </Box>
                  ))}
                  <Button size="small" onClick={() => updateMessage(msg.id, m => ({ ...m, fields: [...m.fields, makeField(Math.max(...m.fields.map(f => f.number), 0) + 1)] }))}
                    sx={{ textTransform: 'none', color: 'grey.500', fontSize: 10, mt: 0.5 }}>+ Field</Button>
                </Paper>
              ))}
            </Paper>

            {/* Services */}
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="grey.400">Services</Typography>
                <Button size="small" startIcon={<Add />} onClick={() => setServices([...services, { id: uid(), name: '', rpcs: [{ id: uid(), name: '', requestType: '', responseType: '', streaming: 'none' }] }])}
                  sx={{ textTransform: 'none', color: 'grey.400', fontSize: 11 }}>Add Service</Button>
              </Box>
              {services.map((svc, si) => (
                <Paper key={svc.id} sx={{ bgcolor: '#0d0d0d', border: '1px solid #1a1a1a', p: 1.5, mb: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                    <TextField size="small" value={svc.name} onChange={e => { const n = [...services]; n[si] = { ...n[si], name: e.target.value }; setServices(n); }} placeholder="ServiceName" sx={{ flex: 1, ...smallTfSx }} />
                    <IconButton size="small" sx={{ color: 'grey.600' }} onClick={() => setServices(services.filter((_, j) => j !== si))}><Delete sx={{ fontSize: 14 }} /></IconButton>
                  </Box>
                  {svc.rpcs.map((rpc, ri) => (
                    <Box key={rpc.id} sx={{ display: 'flex', gap: 0.5, mb: 0.5, pl: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                      <TextField size="small" value={rpc.name} onChange={e => { const n = [...services]; n[si].rpcs[ri] = { ...rpc, name: e.target.value }; setServices(n); }} placeholder="RpcName" sx={{ flex: 1, minWidth: 80, ...smallTfSx }} />
                      <TextField size="small" value={rpc.requestType} onChange={e => { const n = [...services]; n[si].rpcs[ri] = { ...rpc, requestType: e.target.value }; setServices(n); }} placeholder="Request" sx={{ width: 90, ...smallTfSx }} />
                      <TextField size="small" value={rpc.responseType} onChange={e => { const n = [...services]; n[si].rpcs[ri] = { ...rpc, responseType: e.target.value }; setServices(n); }} placeholder="Response" sx={{ width: 90, ...smallTfSx }} />
                      <FormControl size="small" sx={{ minWidth: 80 }}>
                        <Select value={rpc.streaming} onChange={e => { const n = [...services]; n[si].rpcs[ri] = { ...rpc, streaming: e.target.value as StreamMode }; setServices(n); }} sx={selectSx}>
                          <MenuItem value="none">unary</MenuItem>
                          <MenuItem value="server">server</MenuItem>
                          <MenuItem value="client">client</MenuItem>
                          <MenuItem value="bidi">bidi</MenuItem>
                        </Select>
                      </FormControl>
                      <IconButton size="small" sx={{ color: 'grey.600', p: 0.3 }} onClick={() => { const n = [...services]; n[si] = { ...n[si], rpcs: n[si].rpcs.filter((_, j) => j !== ri) }; setServices(n); }}><Delete sx={{ fontSize: 13 }} /></IconButton>
                    </Box>
                  ))}
                  <Button size="small" onClick={() => { const n = [...services]; n[si] = { ...n[si], rpcs: [...n[si].rpcs, { id: uid(), name: '', requestType: '', responseType: '', streaming: 'none' }] }; setServices(n); }}
                    sx={{ textTransform: 'none', color: 'grey.500', fontSize: 10, mt: 0.5 }}>+ RPC</Button>
                </Paper>
              ))}
            </Paper>
          </Box>

          {/* Output Panel */}
          <Box>
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, position: 'sticky', top: 16 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="grey.400">.proto Output</Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Download"><IconButton size="small" sx={{ color: 'grey.500' }} onClick={download}><Download /></IconButton></Tooltip>
                  <Tooltip title="Copy"><IconButton size="small" sx={{ color: 'grey.500' }} onClick={copy}><ContentCopy /></IconButton></Tooltip>
                </Box>
              </Box>
              <Box sx={{ bgcolor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 1, p: 2, fontFamily: 'monospace', fontSize: 13, color: '#a5f3fc', whiteSpace: 'pre-wrap', minHeight: 600, maxHeight: 800, overflow: 'auto' }}>
                {output}
              </Box>
              <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                <Chip label={syntax} size="small" sx={{ bgcolor: '#8b5cf620', color: '#8b5cf6', fontSize: 10 }} />
                {packageName && <Chip label={packageName} size="small" sx={{ bgcolor: '#3b82f620', color: '#3b82f6', fontSize: 10 }} />}
                <Chip label={`${messages.length} msg`} size="small" sx={{ bgcolor: '#10b98120', color: '#10b981', fontSize: 10 }} />
                <Chip label={`${enums.length} enum`} size="small" sx={{ bgcolor: '#f59e0b20', color: '#f59e0b', fontSize: 10 }} />
                <Chip label={`${services.length} svc`} size="small" sx={{ bgcolor: '#ef444420', color: '#ef4444', fontSize: 10 }} />
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
      <Snackbar open={snackOpen} autoHideDuration={2000} onClose={() => setSnackOpen(false)} message="Copied to clipboard" />
    </Box>
  );
}
