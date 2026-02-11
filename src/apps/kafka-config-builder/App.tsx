import { useState, useCallback, useMemo } from 'react';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Tooltip, Tabs, Tab,
  Chip, Snackbar, Select, MenuItem, FormControl, InputLabel, Switch,
  FormControlLabel, Divider, Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import { ContentCopy, Home, ExpandMore } from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface ConfigField { key: string; value: string; description: string; type: 'string' | 'number' | 'boolean' | 'select'; options?: string[]; }

const makeFields = (fields: Array<[string, string, string, string, string[]?]>): ConfigField[] =>
  fields.map(([key, value, description, type, options]) => ({ key, value, description, type: type as ConfigField['type'], options }));

const BROKER_DEFAULTS = makeFields([
  ['broker.id', '0', 'Unique broker identifier', 'number'],
  ['listeners', 'PLAINTEXT://:9092', 'Listener configuration', 'string'],
  ['advertised.listeners', 'PLAINTEXT://localhost:9092', 'Listeners published to ZooKeeper', 'string'],
  ['log.dirs', '/var/kafka-logs', 'Log directory', 'string'],
  ['num.partitions', '3', 'Default number of partitions', 'number'],
  ['default.replication.factor', '1', 'Default replication factor', 'number'],
  ['log.retention.hours', '168', 'Hours to keep log segments', 'number'],
  ['log.retention.bytes', '-1', 'Max bytes per partition (-1=unlimited)', 'number'],
  ['log.segment.bytes', '1073741824', 'Max size of a log segment (bytes)', 'number'],
  ['zookeeper.connect', 'localhost:2181', 'ZooKeeper connection string', 'string'],
  ['auto.create.topics.enable', 'true', 'Auto-create topics', 'select', ['true', 'false']],
  ['num.io.threads', '8', 'I/O threads for network requests', 'number'],
  ['num.network.threads', '3', 'Network threads', 'number'],
  ['message.max.bytes', '1048576', 'Max message size (bytes)', 'number'],
]);

const TOPIC_DEFAULTS = makeFields([
  ['name', 'my-topic', 'Topic name', 'string'],
  ['partitions', '3', 'Number of partitions', 'number'],
  ['replication-factor', '1', 'Replication factor', 'number'],
  ['cleanup.policy', 'delete', 'Cleanup policy', 'select', ['delete', 'compact', 'delete,compact']],
  ['retention.ms', '604800000', 'Retention time (ms), 7 days default', 'number'],
  ['segment.bytes', '1073741824', 'Segment size (bytes)', 'number'],
  ['min.insync.replicas', '1', 'Min in-sync replicas', 'number'],
  ['compression.type', 'producer', 'Compression type', 'select', ['producer', 'none', 'gzip', 'snappy', 'lz4', 'zstd']],
  ['max.message.bytes', '1048576', 'Max message bytes', 'number'],
]);

const PRODUCER_DEFAULTS = makeFields([
  ['bootstrap.servers', 'localhost:9092', 'Broker list', 'string'],
  ['acks', 'all', 'Acknowledgment setting', 'select', ['all', '0', '1', '-1']],
  ['retries', '2147483647', 'Number of retries', 'number'],
  ['batch.size', '16384', 'Batch size (bytes)', 'number'],
  ['linger.ms', '0', 'Linger time (ms)', 'number'],
  ['buffer.memory', '33554432', 'Buffer memory (bytes)', 'number'],
  ['key.serializer', 'org.apache.kafka.common.serialization.StringSerializer', 'Key serializer', 'string'],
  ['value.serializer', 'org.apache.kafka.common.serialization.StringSerializer', 'Value serializer', 'string'],
  ['enable.idempotence', 'true', 'Enable idempotent producer', 'select', ['true', 'false']],
  ['max.in.flight.requests.per.connection', '5', 'Max in-flight requests', 'number'],
  ['compression.type', 'none', 'Compression', 'select', ['none', 'gzip', 'snappy', 'lz4', 'zstd']],
]);

const CONSUMER_DEFAULTS = makeFields([
  ['bootstrap.servers', 'localhost:9092', 'Broker list', 'string'],
  ['group.id', 'my-consumer-group', 'Consumer group ID', 'string'],
  ['auto.offset.reset', 'earliest', 'Offset reset strategy', 'select', ['earliest', 'latest', 'none']],
  ['enable.auto.commit', 'true', 'Auto-commit offsets', 'select', ['true', 'false']],
  ['auto.commit.interval.ms', '5000', 'Auto-commit interval (ms)', 'number'],
  ['max.poll.records', '500', 'Max records per poll', 'number'],
  ['max.poll.interval.ms', '300000', 'Max poll interval (ms)', 'number'],
  ['session.timeout.ms', '45000', 'Session timeout (ms)', 'number'],
  ['key.deserializer', 'org.apache.kafka.common.serialization.StringDeserializer', 'Key deserializer', 'string'],
  ['value.deserializer', 'org.apache.kafka.common.serialization.StringDeserializer', 'Value deserializer', 'string'],
  ['fetch.min.bytes', '1', 'Min fetch bytes', 'number'],
  ['fetch.max.wait.ms', '500', 'Max fetch wait (ms)', 'number'],
]);

export default function App() {
  const [broker, setBroker] = useState<ConfigField[]>(BROKER_DEFAULTS);
  const [topic, setTopic] = useState<ConfigField[]>(TOPIC_DEFAULTS);
  const [producer, setProducer] = useState<ConfigField[]>(PRODUCER_DEFAULTS);
  const [consumer, setConsumer] = useState<ConfigField[]>(CONSUMER_DEFAULTS);
  const [outputTab, setOutputTab] = useState(0);
  const [snack, setSnack] = useState('');

  const copy = useCallback((t: string) => { navigator.clipboard.writeText(t); setSnack('Copied!'); }, []);

  const updateField = (section: ConfigField[], setter: (v: ConfigField[]) => void, key: string, value: string) => {
    setter(section.map(f => f.key === key ? { ...f, value } : f));
  };

  const fieldsToProps = (fields: ConfigField[]) => fields.map(f => `${f.key}=${f.value}`).join('\n');

  const topicName = topic.find(f => f.key === 'name')?.value || 'my-topic';
  const topicPartitions = topic.find(f => f.key === 'partitions')?.value || '3';
  const topicRF = topic.find(f => f.key === 'replication-factor')?.value || '1';
  const topicConfigs = topic.filter(f => !['name', 'partitions', 'replication-factor'].includes(f.key));

  const outputs = useMemo(() => {
    const properties = `# Kafka Broker Configuration\n${fieldsToProps(broker)}\n\n# Topic: ${topicName}\n# (Create via CLI or admin client)\n\n# Producer Configuration\n${fieldsToProps(producer)}\n\n# Consumer Configuration\n${fieldsToProps(consumer)}`;

    const yaml = `# Kafka Configuration (YAML)
broker:
${broker.map(f => `  ${f.key}: ${f.value}`).join('\n')}

topic:
  name: ${topicName}
  partitions: ${topicPartitions}
  replication-factor: ${topicRF}
  config:
${topicConfigs.map(f => `    ${f.key}: ${f.value}`).join('\n')}

producer:
${producer.map(f => `  ${f.key}: ${f.value}`).join('\n')}

consumer:
${consumer.map(f => `  ${f.key}: ${f.value}`).join('\n')}`;

    const topicConfigStr = topicConfigs.map(f => `${f.key}=${f.value}`).join(',');
    const cli = `#!/bin/bash
# Kafka CLI Commands

# Create Topic
kafka-topics.sh --create \\
  --bootstrap-server ${broker.find(f => f.key === 'listeners')?.value.replace('PLAINTEXT://', '') || 'localhost:9092'} \\
  --topic ${topicName} \\
  --partitions ${topicPartitions} \\
  --replication-factor ${topicRF} \\
  --config ${topicConfigs.map(f => `${f.key}=${f.value}`).join(' --config ')}

# Describe Topic
kafka-topics.sh --describe \\
  --bootstrap-server ${broker.find(f => f.key === 'listeners')?.value.replace('PLAINTEXT://', '') || 'localhost:9092'} \\
  --topic ${topicName}

# Producer (console)
kafka-console-producer.sh \\
  --bootstrap-server ${producer.find(f => f.key === 'bootstrap.servers')?.value || 'localhost:9092'} \\
  --topic ${topicName} \\
  --producer-property acks=${producer.find(f => f.key === 'acks')?.value || 'all'}

# Consumer (console)
kafka-console-consumer.sh \\
  --bootstrap-server ${consumer.find(f => f.key === 'bootstrap.servers')?.value || 'localhost:9092'} \\
  --topic ${topicName} \\
  --group ${consumer.find(f => f.key === 'group.id')?.value || 'my-group'} \\
  --from-beginning

# Describe Consumer Group
kafka-consumer-groups.sh \\
  --bootstrap-server ${consumer.find(f => f.key === 'bootstrap.servers')?.value || 'localhost:9092'} \\
  --group ${consumer.find(f => f.key === 'group.id')?.value || 'my-group'} \\
  --describe`;

    return [properties, yaml, cli];
  }, [broker, topic, producer, consumer]);

  const sxField = { '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#333' }, '&:hover fieldset': { borderColor: '#555' }, '&.Mui-focused fieldset': { borderColor: '#1976d2' } }, '& .MuiInputLabel-root': { color: 'grey.500' }, '& .MuiInputBase-input': { color: 'grey.300' }, '& .MuiSelect-icon': { color: 'grey.500' } };

  const renderFields = (fields: ConfigField[], setter: (v: ConfigField[]) => void) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {fields.map(f => (
        <Box key={f.key} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" sx={{ color: 'grey.500', fontFamily: 'monospace', minWidth: 280, fontSize: 12 }}>{f.key}</Typography>
          {f.type === 'select' ? (
            <FormControl size="small" sx={{ minWidth: 180, ...sxField }}>
              <Select value={f.value} onChange={e => updateField(fields, setter, f.key, e.target.value)} sx={{ color: 'grey.300', fontSize: 13 }}>
                {(f.options || []).map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          ) : (
            <TextField size="small" value={f.value} onChange={e => updateField(fields, setter, f.key, e.target.value)} type={f.type === 'number' ? 'text' : 'text'} sx={{ flex: 1, maxWidth: 400, ...sxField }} />
          )}
          <Typography variant="caption" sx={{ color: 'grey.600', fontSize: 11 }}>{f.description}</Typography>
        </Box>
      ))}
    </Box>
  );

  const sections = [
    { label: 'Broker Config', fields: broker, setter: setBroker },
    { label: 'Topic Config', fields: topic, setter: setTopic },
    { label: 'Producer Config', fields: producer, setter: setProducer },
    { label: 'Consumer Config', fields: consumer, setter: setConsumer },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'grey.300', p: 3 }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Kafka Config Builder</Typography>
        </Box>

        {sections.map(s => (
          <Accordion key={s.label} defaultExpanded sx={{ bgcolor: '#111', border: '1px solid #222', mb: 1, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'grey.500' }} />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'grey.300' }}>{s.label}</Typography>
            </AccordionSummary>
            <AccordionDetails>{renderFields(s.fields, s.setter)}</AccordionDetails>
          </Accordion>
        ))}

        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Tabs value={outputTab} onChange={(_, v) => setOutputTab(v)} sx={{ '& .MuiTab-root': { color: 'grey.500', fontSize: 12, textTransform: 'none' }, '& .Mui-selected': { color: '#90caf9' } }}>
              <Tab label="Properties" /><Tab label="YAML" /><Tab label="CLI Commands" />
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
