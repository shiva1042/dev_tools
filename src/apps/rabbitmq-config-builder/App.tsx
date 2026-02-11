import { useState, useCallback, useMemo } from 'react';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Tooltip, Tabs, Tab,
  Chip, Snackbar, Select, MenuItem, FormControl, InputLabel, Switch,
  FormControlLabel, Divider, Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import { ContentCopy, Home, Add, Delete, ExpandMore } from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface Exchange { name: string; type: string; durable: boolean; autoDelete: boolean; }
interface Queue { name: string; durable: boolean; exclusive: boolean; autoDelete: boolean; ttl: string; maxLength: string; dlx: string; dlrk: string; queueType: string; }
interface Binding { source: string; destination: string; destType: string; routingKey: string; }
interface Connection { host: string; port: string; vhost: string; user: string; pass: string; }

const uid = () => Math.random().toString(36).slice(2, 8);

export default function App() {
  const [exchanges, setExchanges] = useState<Exchange[]>([
    { name: 'my.exchange', type: 'topic', durable: true, autoDelete: false },
    { name: 'my.dlx', type: 'fanout', durable: true, autoDelete: false },
  ]);
  const [queues, setQueues] = useState<Queue[]>([
    { name: 'my.queue', durable: true, exclusive: false, autoDelete: false, ttl: '86400000', maxLength: '', dlx: 'my.dlx', dlrk: 'dead-letter', queueType: 'classic' },
    { name: 'my.dlq', durable: true, exclusive: false, autoDelete: false, ttl: '', maxLength: '10000', dlx: '', dlrk: '', queueType: 'classic' },
  ]);
  const [bindings, setBindings] = useState<Binding[]>([
    { source: 'my.exchange', destination: 'my.queue', destType: 'queue', routingKey: 'events.#' },
    { source: 'my.dlx', destination: 'my.dlq', destType: 'queue', routingKey: '' },
  ]);
  const [conn, setConn] = useState<Connection>({ host: 'localhost', port: '5672', vhost: '/', user: 'guest', pass: 'guest' });
  const [outputTab, setOutputTab] = useState(0);
  const [snack, setSnack] = useState('');

  const copy = useCallback((t: string) => { navigator.clipboard.writeText(t); setSnack('Copied!'); }, []);

  const addExchange = () => setExchanges(prev => [...prev, { name: '', type: 'direct', durable: true, autoDelete: false }]);
  const addQueue = () => setQueues(prev => [...prev, { name: '', durable: true, exclusive: false, autoDelete: false, ttl: '', maxLength: '', dlx: '', dlrk: '', queueType: 'classic' }]);
  const addBinding = () => setBindings(prev => [...prev, { source: '', destination: '', destType: 'queue', routingKey: '' }]);

  const updateExchange = (i: number, patch: Partial<Exchange>) => setExchanges(prev => prev.map((e, j) => j === i ? { ...e, ...patch } : e));
  const updateQueue = (i: number, patch: Partial<Queue>) => setQueues(prev => prev.map((q, j) => j === i ? { ...q, ...patch } : q));
  const updateBinding = (i: number, patch: Partial<Binding>) => setBindings(prev => prev.map((b, j) => j === i ? { ...b, ...patch } : b));

  const sxField = { '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#333' }, '&:hover fieldset': { borderColor: '#555' }, '&.Mui-focused fieldset': { borderColor: '#1976d2' } }, '& .MuiInputLabel-root': { color: 'grey.500' }, '& .MuiInputBase-input': { color: 'grey.300' }, '& .MuiSelect-icon': { color: 'grey.500' } };
  const sxSwitch = { color: 'grey.400', '& .MuiSwitch-switchBase.Mui-checked': { color: '#1976d2' } };

  const outputs = useMemo(() => {
    const amqpUrl = `amqp://${conn.user}:${conn.pass}@${conn.host}:${conn.port}${conn.vhost === '/' ? '' : '/' + conn.vhost}`;

    const rabbitmqadmin = `#!/bin/bash
# rabbitmqadmin commands
${exchanges.filter(e => e.name).map(e => `rabbitmqadmin declare exchange name=${e.name} type=${e.type} durable=${e.durable} auto_delete=${e.autoDelete}`).join('\n')}

${queues.filter(q => q.name).map(q => {
  const args: string[] = [];
  if (q.ttl) args.push(`x-message-ttl=${q.ttl}`);
  if (q.maxLength) args.push(`x-max-length=${q.maxLength}`);
  if (q.dlx) args.push(`x-dead-letter-exchange=${q.dlx}`);
  if (q.dlrk) args.push(`x-dead-letter-routing-key=${q.dlrk}`);
  if (q.queueType !== 'classic') args.push(`x-queue-type=${q.queueType}`);
  return `rabbitmqadmin declare queue name=${q.name} durable=${q.durable} auto_delete=${q.autoDelete}${args.length ? ' arguments=\'{"' + args.map(a => { const [k, v] = a.split('='); return `"${k}":"${v}"`; }).join(',') + '}\'' : ''}`;
}).join('\n')}

${bindings.filter(b => b.source && b.destination).map(b => `rabbitmqadmin declare binding source=${b.source} destination=${b.destination} destination_type=${b.destType} routing_key="${b.routingKey}"`).join('\n')}`;

    const pika = `# Python (pika) Configuration
import pika

credentials = pika.PlainCredentials('${conn.user}', '${conn.pass}')
parameters = pika.ConnectionParameters(
    host='${conn.host}', port=${conn.port},
    virtual_host='${conn.vhost}', credentials=credentials,
)
connection = pika.BlockingConnection(parameters)
channel = connection.channel()

# Declare Exchanges
${exchanges.filter(e => e.name).map(e => `channel.exchange_declare(exchange='${e.name}', exchange_type='${e.type}', durable=${e.durable ? 'True' : 'False'}, auto_delete=${e.autoDelete ? 'True' : 'False'})`).join('\n')}

# Declare Queues
${queues.filter(q => q.name).map(q => {
  const args: string[] = [];
  if (q.ttl) args.push(`'x-message-ttl': ${q.ttl}`);
  if (q.maxLength) args.push(`'x-max-length': ${q.maxLength}`);
  if (q.dlx) args.push(`'x-dead-letter-exchange': '${q.dlx}'`);
  if (q.dlrk) args.push(`'x-dead-letter-routing-key': '${q.dlrk}'`);
  if (q.queueType !== 'classic') args.push(`'x-queue-type': '${q.queueType}'`);
  return `channel.queue_declare(queue='${q.name}', durable=${q.durable ? 'True' : 'False'}, exclusive=${q.exclusive ? 'True' : 'False'}, auto_delete=${q.autoDelete ? 'True' : 'False'}${args.length ? `, arguments={${args.join(', ')}}` : ''})`;
}).join('\n')}

# Create Bindings
${bindings.filter(b => b.source && b.destination).map(b => b.destType === 'queue'
  ? `channel.queue_bind(queue='${b.destination}', exchange='${b.source}', routing_key='${b.routingKey}')`
  : `channel.exchange_bind(destination='${b.destination}', source='${b.source}', routing_key='${b.routingKey}')`
).join('\n')}`;

    const amqplib = `// Node.js (amqplib) Configuration
const amqplib = require('amqplib');

async function setup() {
  const conn = await amqplib.connect('${amqpUrl}');
  const ch = await conn.createChannel();

  // Exchanges
${exchanges.filter(e => e.name).map(e => `  await ch.assertExchange('${e.name}', '${e.type}', { durable: ${e.durable}, autoDelete: ${e.autoDelete} });`).join('\n')}

  // Queues
${queues.filter(q => q.name).map(q => {
  const args: string[] = [];
  if (q.ttl) args.push(`'x-message-ttl': ${q.ttl}`);
  if (q.maxLength) args.push(`'x-max-length': ${q.maxLength}`);
  if (q.dlx) args.push(`'x-dead-letter-exchange': '${q.dlx}'`);
  if (q.dlrk) args.push(`'x-dead-letter-routing-key': '${q.dlrk}'`);
  if (q.queueType !== 'classic') args.push(`'x-queue-type': '${q.queueType}'`);
  return `  await ch.assertQueue('${q.name}', { durable: ${q.durable}, exclusive: ${q.exclusive}, autoDelete: ${q.autoDelete}${args.length ? `, arguments: { ${args.join(', ')} }` : ''} });`;
}).join('\n')}

  // Bindings
${bindings.filter(b => b.source && b.destination).map(b => b.destType === 'queue'
  ? `  await ch.bindQueue('${b.destination}', '${b.source}', '${b.routingKey}');`
  : `  await ch.bindExchange('${b.destination}', '${b.source}', '${b.routingKey}');`
).join('\n')}

  return { conn, ch };
}

setup().then(({ ch }) => {
  console.log('RabbitMQ setup complete');
});`;

    const spring = `// Java (Spring AMQP) Configuration
@Configuration
public class RabbitMQConfig {

${exchanges.filter(e => e.name).map(e => {
  const methodName = e.name.replace(/[^a-zA-Z0-9]/g, '') + 'Exchange';
  const exchangeClass = { direct: 'DirectExchange', topic: 'TopicExchange', fanout: 'FanoutExchange', headers: 'HeadersExchange' }[e.type] || 'TopicExchange';
  return `    @Bean
    public ${exchangeClass} ${methodName}() {
        return new ${exchangeClass}("${e.name}", ${e.durable}, ${e.autoDelete});
    }`;
}).join('\n\n')}

${queues.filter(q => q.name).map(q => {
  const methodName = q.name.replace(/[^a-zA-Z0-9]/g, '') + 'Queue';
  const args: string[] = [];
  if (q.ttl) args.push(`.withArgument("x-message-ttl", ${q.ttl})`);
  if (q.maxLength) args.push(`.withArgument("x-max-length", ${q.maxLength})`);
  if (q.dlx) args.push(`.withArgument("x-dead-letter-exchange", "${q.dlx}")`);
  if (q.dlrk) args.push(`.withArgument("x-dead-letter-routing-key", "${q.dlrk}")`);
  return `    @Bean
    public Queue ${methodName}() {
        return QueueBuilder.${q.durable ? 'durable' : 'nonDurable'}("${q.name}")
            ${args.join('\n            ')}
            .build();
    }`;
}).join('\n\n')}

${bindings.filter(b => b.source && b.destination).map((b, i) => `    @Bean
    public Binding binding${i}() {
        return BindingBuilder.bind(${b.destination.replace(/[^a-zA-Z0-9]/g, '')}Queue())
            .to(${b.source.replace(/[^a-zA-Z0-9]/g, '')}Exchange())
            ${b.routingKey ? `.with("${b.routingKey}")` : ''};
    }`).join('\n\n')}
}`;

    const jsonDefs = JSON.stringify({
      rabbit_version: '3.12.0',
      vhosts: [{ name: conn.vhost }],
      users: [{ name: conn.user, password_hash: '(set your password hash)', tags: 'administrator' }],
      permissions: [{ user: conn.user, vhost: conn.vhost, configure: '.*', write: '.*', read: '.*' }],
      exchanges: exchanges.filter(e => e.name).map(e => ({ name: e.name, vhost: conn.vhost, type: e.type, durable: e.durable, auto_delete: e.autoDelete, internal: false, arguments: {} })),
      queues: queues.filter(q => q.name).map(q => {
        const args: Record<string, unknown> = {};
        if (q.ttl) args['x-message-ttl'] = parseInt(q.ttl);
        if (q.maxLength) args['x-max-length'] = parseInt(q.maxLength);
        if (q.dlx) args['x-dead-letter-exchange'] = q.dlx;
        if (q.dlrk) args['x-dead-letter-routing-key'] = q.dlrk;
        if (q.queueType !== 'classic') args['x-queue-type'] = q.queueType;
        return { name: q.name, vhost: conn.vhost, durable: q.durable, auto_delete: q.autoDelete, arguments: args };
      }),
      bindings: bindings.filter(b => b.source && b.destination).map(b => ({ source: b.source, vhost: conn.vhost, destination: b.destination, destination_type: b.destType, routing_key: b.routingKey, arguments: {} })),
    }, null, 2);

    const docker = `# docker-compose.yml
version: '3.8'
services:
  rabbitmq:
    image: rabbitmq:3.12-management
    container_name: rabbitmq
    hostname: rabbitmq
    ports:
      - "${conn.port}:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: ${conn.user}
      RABBITMQ_DEFAULT_PASS: ${conn.pass}
      RABBITMQ_DEFAULT_VHOST: ${conn.vhost}
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
      - ./definitions.json:/etc/rabbitmq/definitions.json
      - ./rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf
    healthcheck:
      test: rabbitmq-diagnostics -q ping
      interval: 30s
      timeout: 10s
      retries: 5

volumes:
  rabbitmq_data:

# rabbitmq.conf
# management.load_definitions = /etc/rabbitmq/definitions.json`;

    return [rabbitmqadmin, pika, amqplib, spring, jsonDefs, docker];
  }, [exchanges, queues, bindings, conn]);

  const tabLabels = ['rabbitmqadmin', 'Python (pika)', 'Node.js (amqplib)', 'Spring AMQP', 'JSON Definitions', 'Docker Compose'];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'grey.300', p: 3 }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>RabbitMQ Config Builder</Typography>
        </Box>

        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Connection</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField size="small" label="Host" value={conn.host} onChange={e => setConn({ ...conn, host: e.target.value })} sx={{ flex: 1, minWidth: 120, ...sxField }} />
            <TextField size="small" label="Port" value={conn.port} onChange={e => setConn({ ...conn, port: e.target.value })} sx={{ width: 80, ...sxField }} />
            <TextField size="small" label="VHost" value={conn.vhost} onChange={e => setConn({ ...conn, vhost: e.target.value })} sx={{ width: 80, ...sxField }} />
            <TextField size="small" label="User" value={conn.user} onChange={e => setConn({ ...conn, user: e.target.value })} sx={{ flex: 1, minWidth: 100, ...sxField }} />
            <TextField size="small" label="Password" value={conn.pass} onChange={e => setConn({ ...conn, pass: e.target.value })} sx={{ flex: 1, minWidth: 100, ...sxField }} />
          </Box>
        </Paper>

        <Accordion defaultExpanded sx={{ bgcolor: '#111', border: '1px solid #222', mb: 1, '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'grey.500' }} />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Exchanges ({exchanges.length})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {exchanges.map((e, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField size="small" label="Name" value={e.name} onChange={ev => updateExchange(i, { name: ev.target.value })} sx={{ flex: 1, minWidth: 150, ...sxField }} />
                <FormControl size="small" sx={{ width: 120, ...sxField }}>
                  <InputLabel sx={{ color: 'grey.500' }}>Type</InputLabel>
                  <Select value={e.type} label="Type" onChange={ev => updateExchange(i, { type: ev.target.value })} sx={{ color: 'grey.300' }}>
                    {['direct', 'topic', 'fanout', 'headers'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControlLabel control={<Switch checked={e.durable} onChange={ev => updateExchange(i, { durable: ev.target.checked })} size="small" />} label={<Typography variant="caption" sx={{ color: 'grey.400' }}>Durable</Typography>} />
                <FormControlLabel control={<Switch checked={e.autoDelete} onChange={ev => updateExchange(i, { autoDelete: ev.target.checked })} size="small" />} label={<Typography variant="caption" sx={{ color: 'grey.400' }}>Auto-del</Typography>} />
                <IconButton size="small" onClick={() => setExchanges(prev => prev.filter((_, j) => j !== i))} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>
              </Box>
            ))}
            <Button size="small" startIcon={<Add />} onClick={addExchange} sx={{ color: 'grey.500' }}>Add Exchange</Button>
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded sx={{ bgcolor: '#111', border: '1px solid #222', mb: 1, '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'grey.500' }} />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Queues ({queues.length})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {queues.map((q, i) => (
              <Paper key={i} sx={{ bgcolor: '#0d0d0d', border: '1px solid #1a1a1a', p: 1.5, mb: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <TextField size="small" label="Name" value={q.name} onChange={ev => updateQueue(i, { name: ev.target.value })} sx={{ flex: 1, minWidth: 150, ...sxField }} />
                  <FormControl size="small" sx={{ width: 120, ...sxField }}>
                    <InputLabel sx={{ color: 'grey.500' }}>Type</InputLabel>
                    <Select value={q.queueType} label="Type" onChange={ev => updateQueue(i, { queueType: ev.target.value })} sx={{ color: 'grey.300' }}>
                      {['classic', 'quorum'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControlLabel control={<Switch checked={q.durable} onChange={ev => updateQueue(i, { durable: ev.target.checked })} size="small" />} label={<Typography variant="caption" sx={{ color: 'grey.400' }}>Durable</Typography>} />
                  <FormControlLabel control={<Switch checked={q.exclusive} onChange={ev => updateQueue(i, { exclusive: ev.target.checked })} size="small" />} label={<Typography variant="caption" sx={{ color: 'grey.400' }}>Exclusive</Typography>} />
                  <IconButton size="small" onClick={() => setQueues(prev => prev.filter((_, j) => j !== i))} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <TextField size="small" label="TTL (ms)" value={q.ttl} onChange={ev => updateQueue(i, { ttl: ev.target.value })} sx={{ width: 120, ...sxField }} />
                  <TextField size="small" label="Max Length" value={q.maxLength} onChange={ev => updateQueue(i, { maxLength: ev.target.value })} sx={{ width: 120, ...sxField }} />
                  <TextField size="small" label="Dead Letter Exchange" value={q.dlx} onChange={ev => updateQueue(i, { dlx: ev.target.value })} sx={{ flex: 1, minWidth: 150, ...sxField }} />
                  <TextField size="small" label="DL Routing Key" value={q.dlrk} onChange={ev => updateQueue(i, { dlrk: ev.target.value })} sx={{ flex: 1, minWidth: 120, ...sxField }} />
                </Box>
              </Paper>
            ))}
            <Button size="small" startIcon={<Add />} onClick={addQueue} sx={{ color: 'grey.500' }}>Add Queue</Button>
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded sx={{ bgcolor: '#111', border: '1px solid #222', mb: 1, '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'grey.500' }} />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Bindings ({bindings.length})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {bindings.map((b, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 150, ...sxField }}>
                  <InputLabel sx={{ color: 'grey.500' }}>Source Exchange</InputLabel>
                  <Select value={b.source} label="Source Exchange" onChange={ev => updateBinding(i, { source: ev.target.value })} sx={{ color: 'grey.300' }}>
                    {exchanges.filter(e => e.name).map(e => <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <Typography sx={{ color: 'grey.600' }}>-&gt;</Typography>
                <FormControl size="small" sx={{ width: 100, ...sxField }}>
                  <InputLabel sx={{ color: 'grey.500' }}>Dest Type</InputLabel>
                  <Select value={b.destType} label="Dest Type" onChange={ev => updateBinding(i, { destType: ev.target.value })} sx={{ color: 'grey.300' }}>
                    <MenuItem value="queue">Queue</MenuItem>
                    <MenuItem value="exchange">Exchange</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150, ...sxField }}>
                  <InputLabel sx={{ color: 'grey.500' }}>Destination</InputLabel>
                  <Select value={b.destination} label="Destination" onChange={ev => updateBinding(i, { destination: ev.target.value })} sx={{ color: 'grey.300' }}>
                    {(b.destType === 'queue' ? queues.filter(q => q.name).map(q => q.name) : exchanges.filter(e => e.name).map(e => e.name)).map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField size="small" label="Routing Key" value={b.routingKey} onChange={ev => updateBinding(i, { routingKey: ev.target.value })} sx={{ flex: 1, minWidth: 120, ...sxField }} />
                <IconButton size="small" onClick={() => setBindings(prev => prev.filter((_, j) => j !== i))} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>
              </Box>
            ))}
            <Button size="small" startIcon={<Add />} onClick={addBinding} sx={{ color: 'grey.500' }}>Add Binding</Button>
          </AccordionDetails>
        </Accordion>

        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Tabs value={outputTab} onChange={(_, v) => setOutputTab(v)} variant="scrollable" scrollButtons="auto" sx={{ '& .MuiTab-root': { color: 'grey.500', fontSize: 12, textTransform: 'none' }, '& .Mui-selected': { color: '#90caf9' } }}>
              {tabLabels.map(l => <Tab key={l} label={l} />)}
            </Tabs>
            <Tooltip title="Copy"><IconButton onClick={() => copy(outputs[outputTab])} sx={{ color: 'grey.400' }}><ContentCopy /></IconButton></Tooltip>
          </Box>
          <Box component="pre" sx={{ color: '#81c784', fontFamily: 'monospace', fontSize: 12, overflow: 'auto', maxHeight: 500, whiteSpace: 'pre-wrap', m: 0, mt: 1 }}>{outputs[outputTab]}</Box>
        </Paper>
      </Box>
      <Snackbar open={!!snack} autoHideDuration={2000} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
}
