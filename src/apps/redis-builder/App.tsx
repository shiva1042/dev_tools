import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Database, Plus, Trash2 } from 'lucide-react';

type CommandCategory = 'strings' | 'lists' | 'sets' | 'hashes' | 'sorted-sets' | 'keys' | 'pub-sub';

interface CommandTemplate {
  name: string;
  syntax: string;
  description: string;
  args: { name: string; type: string; optional?: boolean }[];
}

const commands: Record<CommandCategory, CommandTemplate[]> = {
  strings: [
    { name: 'GET', syntax: 'GET key', description: 'Get the value of a key', args: [{ name: 'key', type: 'string' }] },
    { name: 'SET', syntax: 'SET key value [EX seconds] [NX|XX]', description: 'Set the value of a key', args: [{ name: 'key', type: 'string' }, { name: 'value', type: 'string' }, { name: 'ex', type: 'number', optional: true }, { name: 'condition', type: 'select', optional: true }] },
    { name: 'MGET', syntax: 'MGET key [key ...]', description: 'Get values of multiple keys', args: [{ name: 'keys', type: 'array' }] },
    { name: 'MSET', syntax: 'MSET key value [key value ...]', description: 'Set multiple keys', args: [{ name: 'pairs', type: 'keyvalue' }] },
    { name: 'INCR', syntax: 'INCR key', description: 'Increment value by 1', args: [{ name: 'key', type: 'string' }] },
    { name: 'INCRBY', syntax: 'INCRBY key increment', description: 'Increment by given value', args: [{ name: 'key', type: 'string' }, { name: 'increment', type: 'number' }] },
    { name: 'DECR', syntax: 'DECR key', description: 'Decrement value by 1', args: [{ name: 'key', type: 'string' }] },
    { name: 'APPEND', syntax: 'APPEND key value', description: 'Append value to key', args: [{ name: 'key', type: 'string' }, { name: 'value', type: 'string' }] },
  ],
  lists: [
    { name: 'LPUSH', syntax: 'LPUSH key element [element ...]', description: 'Push elements to list head', args: [{ name: 'key', type: 'string' }, { name: 'elements', type: 'array' }] },
    { name: 'RPUSH', syntax: 'RPUSH key element [element ...]', description: 'Push elements to list tail', args: [{ name: 'key', type: 'string' }, { name: 'elements', type: 'array' }] },
    { name: 'LPOP', syntax: 'LPOP key [count]', description: 'Remove and get first elements', args: [{ name: 'key', type: 'string' }, { name: 'count', type: 'number', optional: true }] },
    { name: 'RPOP', syntax: 'RPOP key [count]', description: 'Remove and get last elements', args: [{ name: 'key', type: 'string' }, { name: 'count', type: 'number', optional: true }] },
    { name: 'LRANGE', syntax: 'LRANGE key start stop', description: 'Get range of elements', args: [{ name: 'key', type: 'string' }, { name: 'start', type: 'number' }, { name: 'stop', type: 'number' }] },
    { name: 'LLEN', syntax: 'LLEN key', description: 'Get list length', args: [{ name: 'key', type: 'string' }] },
  ],
  sets: [
    { name: 'SADD', syntax: 'SADD key member [member ...]', description: 'Add members to set', args: [{ name: 'key', type: 'string' }, { name: 'members', type: 'array' }] },
    { name: 'SREM', syntax: 'SREM key member [member ...]', description: 'Remove members from set', args: [{ name: 'key', type: 'string' }, { name: 'members', type: 'array' }] },
    { name: 'SMEMBERS', syntax: 'SMEMBERS key', description: 'Get all set members', args: [{ name: 'key', type: 'string' }] },
    { name: 'SISMEMBER', syntax: 'SISMEMBER key member', description: 'Check if member exists', args: [{ name: 'key', type: 'string' }, { name: 'member', type: 'string' }] },
    { name: 'SCARD', syntax: 'SCARD key', description: 'Get set cardinality', args: [{ name: 'key', type: 'string' }] },
    { name: 'SUNION', syntax: 'SUNION key [key ...]', description: 'Union of sets', args: [{ name: 'keys', type: 'array' }] },
    { name: 'SINTER', syntax: 'SINTER key [key ...]', description: 'Intersection of sets', args: [{ name: 'keys', type: 'array' }] },
  ],
  hashes: [
    { name: 'HSET', syntax: 'HSET key field value [field value ...]', description: 'Set hash fields', args: [{ name: 'key', type: 'string' }, { name: 'field', type: 'string' }, { name: 'value', type: 'string' }] },
    { name: 'HGET', syntax: 'HGET key field', description: 'Get hash field value', args: [{ name: 'key', type: 'string' }, { name: 'field', type: 'string' }] },
    { name: 'HMGET', syntax: 'HMGET key field [field ...]', description: 'Get multiple hash fields', args: [{ name: 'key', type: 'string' }, { name: 'fields', type: 'array' }] },
    { name: 'HGETALL', syntax: 'HGETALL key', description: 'Get all hash fields and values', args: [{ name: 'key', type: 'string' }] },
    { name: 'HDEL', syntax: 'HDEL key field [field ...]', description: 'Delete hash fields', args: [{ name: 'key', type: 'string' }, { name: 'fields', type: 'array' }] },
    { name: 'HINCRBY', syntax: 'HINCRBY key field increment', description: 'Increment hash field', args: [{ name: 'key', type: 'string' }, { name: 'field', type: 'string' }, { name: 'increment', type: 'number' }] },
  ],
  'sorted-sets': [
    { name: 'ZADD', syntax: 'ZADD key score member [score member ...]', description: 'Add members with scores', args: [{ name: 'key', type: 'string' }, { name: 'score', type: 'number' }, { name: 'member', type: 'string' }] },
    { name: 'ZRANGE', syntax: 'ZRANGE key start stop [WITHSCORES]', description: 'Get range by index', args: [{ name: 'key', type: 'string' }, { name: 'start', type: 'number' }, { name: 'stop', type: 'number' }, { name: 'withscores', type: 'boolean', optional: true }] },
    { name: 'ZRANGEBYSCORE', syntax: 'ZRANGEBYSCORE key min max', description: 'Get range by score', args: [{ name: 'key', type: 'string' }, { name: 'min', type: 'string' }, { name: 'max', type: 'string' }] },
    { name: 'ZREM', syntax: 'ZREM key member [member ...]', description: 'Remove members', args: [{ name: 'key', type: 'string' }, { name: 'members', type: 'array' }] },
    { name: 'ZSCORE', syntax: 'ZSCORE key member', description: 'Get member score', args: [{ name: 'key', type: 'string' }, { name: 'member', type: 'string' }] },
    { name: 'ZCARD', syntax: 'ZCARD key', description: 'Get sorted set cardinality', args: [{ name: 'key', type: 'string' }] },
  ],
  keys: [
    { name: 'KEYS', syntax: 'KEYS pattern', description: 'Find keys by pattern', args: [{ name: 'pattern', type: 'string' }] },
    { name: 'EXISTS', syntax: 'EXISTS key [key ...]', description: 'Check if keys exist', args: [{ name: 'keys', type: 'array' }] },
    { name: 'DEL', syntax: 'DEL key [key ...]', description: 'Delete keys', args: [{ name: 'keys', type: 'array' }] },
    { name: 'EXPIRE', syntax: 'EXPIRE key seconds', description: 'Set key expiration', args: [{ name: 'key', type: 'string' }, { name: 'seconds', type: 'number' }] },
    { name: 'TTL', syntax: 'TTL key', description: 'Get key time to live', args: [{ name: 'key', type: 'string' }] },
    { name: 'TYPE', syntax: 'TYPE key', description: 'Get key data type', args: [{ name: 'key', type: 'string' }] },
    { name: 'RENAME', syntax: 'RENAME key newkey', description: 'Rename a key', args: [{ name: 'key', type: 'string' }, { name: 'newkey', type: 'string' }] },
  ],
  'pub-sub': [
    { name: 'PUBLISH', syntax: 'PUBLISH channel message', description: 'Publish message to channel', args: [{ name: 'channel', type: 'string' }, { name: 'message', type: 'string' }] },
    { name: 'SUBSCRIBE', syntax: 'SUBSCRIBE channel [channel ...]', description: 'Subscribe to channels', args: [{ name: 'channels', type: 'array' }] },
    { name: 'PSUBSCRIBE', syntax: 'PSUBSCRIBE pattern [pattern ...]', description: 'Subscribe to pattern', args: [{ name: 'patterns', type: 'array' }] },
  ],
};

export default function RedisBuilder() {
  const [category, setCategory] = useState<CommandCategory>('strings');
  const [selectedCommand, setSelectedCommand] = useState<CommandTemplate | null>(commands.strings[0]);
  const [argValues, setArgValues] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const generateCommand = (): string => {
    if (!selectedCommand) return '';

    let cmd = selectedCommand.name;
    selectedCommand.args.forEach((arg) => {
      const value = argValues[arg.name] || '';
      if (value || !arg.optional) {
        if (arg.type === 'array') {
          cmd += ` ${value.split(',').map(v => v.trim()).filter(Boolean).join(' ')}`;
        } else if (arg.type === 'boolean' && value === 'true') {
          cmd += ' WITHSCORES';
        } else if (value) {
          cmd += ` ${value}`;
        }
      }
    });

    return cmd;
  };

  const copyToClipboard = async () => {
    const cmd = generateCommand();
    await navigator.clipboard.writeText(cmd);
    setCopied(true);
    setHistory([cmd, ...history.slice(0, 9)]);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectCommand = (cmd: CommandTemplate) => {
    setSelectedCommand(cmd);
    setArgValues({});
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Database className="w-6 h-6 text-red-400" />
              Redis Commands Builder
            </h1>
            <p className="text-gray-400 text-sm">Build Redis commands visually</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Command Selection */}
          <div className="space-y-4">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-1">
              {(Object.keys(commands) as CommandCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setSelectedCommand(commands[cat][0]);
                    setArgValues({});
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-medium capitalize ${
                    category === cat
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Commands List */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800 max-h-[500px] overflow-y-auto">
              <div className="space-y-1">
                {commands[category].map((cmd) => (
                  <button
                    key={cmd.name}
                    onClick={() => selectCommand(cmd)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCommand?.name === cmd.name
                        ? 'bg-red-500/20 text-red-400'
                        : 'hover:bg-gray-800 text-gray-300'
                    }`}
                  >
                    <div className="font-mono text-sm">{cmd.name}</div>
                    <div className="text-xs text-gray-500 truncate">{cmd.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Command Builder */}
          <div className="lg:col-span-2 space-y-4">
            {selectedCommand && (
              <>
                {/* Command Info */}
                <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                  <h3 className="text-lg font-bold text-red-400 mb-2">{selectedCommand.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">{selectedCommand.description}</p>
                  <code className="block p-2 bg-gray-800 rounded text-xs text-gray-300 font-mono">
                    {selectedCommand.syntax}
                  </code>
                </div>

                {/* Arguments */}
                <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Arguments</h3>
                  <div className="space-y-3">
                    {selectedCommand.args.map((arg) => (
                      <div key={arg.name}>
                        <label className="text-xs text-gray-500 block mb-1">
                          {arg.name}
                          {arg.optional && <span className="text-gray-600"> (optional)</span>}
                        </label>
                        {arg.type === 'boolean' ? (
                          <select
                            value={argValues[arg.name] || 'false'}
                            onChange={(e) => setArgValues({ ...argValues, [arg.name]: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                          >
                            <option value="false">No</option>
                            <option value="true">Yes</option>
                          </select>
                        ) : arg.type === 'select' ? (
                          <select
                            value={argValues[arg.name] || ''}
                            onChange={(e) => setArgValues({ ...argValues, [arg.name]: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                          >
                            <option value="">None</option>
                            <option value="NX">NX (only if not exists)</option>
                            <option value="XX">XX (only if exists)</option>
                          </select>
                        ) : (
                          <input
                            type={arg.type === 'number' ? 'number' : 'text'}
                            value={argValues[arg.name] || ''}
                            onChange={(e) => setArgValues({ ...argValues, [arg.name]: e.target.value })}
                            placeholder={arg.type === 'array' ? 'value1, value2, value3' : arg.name}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm font-mono"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Generated Command */}
                <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-300">Generated Command</h3>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="p-4 bg-gray-950 rounded-lg text-sm font-mono text-red-400">
                    {generateCommand()}
                  </pre>
                </div>

                {/* History */}
                {history.length > 0 && (
                  <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                    <h3 className="text-sm font-medium text-gray-300 mb-3">Recent Commands</h3>
                    <div className="space-y-1">
                      {history.map((cmd, i) => (
                        <div
                          key={i}
                          className="px-3 py-2 bg-gray-800 rounded text-xs font-mono text-gray-400 truncate"
                        >
                          {cmd}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
