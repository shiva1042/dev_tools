import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Plug, Unplug, Trash2, Copy, Check } from 'lucide-react';

interface Message {
  id: string;
  type: 'sent' | 'received' | 'system';
  content: string;
  timestamp: Date;
}

export default function WebSocketTester() {
  const [url, setUrl] = useState('wss://echo.websocket.org');
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [autoReconnect, setAutoReconnect] = useState(false);
  const [heartbeat, setHeartbeat] = useState(false);
  const [heartbeatInterval, setHeartbeatInterval] = useState(30);
  const [copied, setCopied] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const heartbeatTimerRef = useRef<number | null>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addMessage = (type: Message['type'], content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: generateId(), type, content, timestamp: new Date() },
    ]);
  };

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        addMessage('system', `Connected to ${url}`);

        if (heartbeat) {
          heartbeatTimerRef.current = window.setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send('ping');
              addMessage('sent', 'ping (heartbeat)');
            }
          }, heartbeatInterval * 1000);
        }
      };

      wsRef.current.onmessage = (event) => {
        addMessage('received', event.data);
      };

      wsRef.current.onclose = (event) => {
        setIsConnected(false);
        addMessage('system', `Disconnected: ${event.code} ${event.reason || ''}`);

        if (heartbeatTimerRef.current) {
          clearInterval(heartbeatTimerRef.current);
          heartbeatTimerRef.current = null;
        }

        if (autoReconnect && event.code !== 1000) {
          addMessage('system', 'Attempting to reconnect in 3 seconds...');
          setTimeout(connect, 3000);
        }
      };

      wsRef.current.onerror = () => {
        addMessage('system', 'Connection error occurred');
      };
    } catch (error) {
      addMessage('system', `Failed to connect: ${error}`);
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  };

  const sendMessage = () => {
    if (!message.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    wsRef.current.send(message);
    addMessage('sent', message);
    setMessage('');
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const copyMessages = async () => {
    const text = messages
      .map((m) => `[${m.timestamp.toLocaleTimeString()}] ${m.type.toUpperCase()}: ${m.content}`)
      .join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const templates = [
    { label: 'Echo Server', url: 'wss://echo.websocket.org' },
    { label: 'Localhost 8080', url: 'ws://localhost:8080' },
    { label: 'Localhost 3000', url: 'ws://localhost:3000/ws' },
  ];

  const messageTemplates = [
    { label: 'Hello', value: 'Hello, WebSocket!' },
    { label: 'JSON', value: JSON.stringify({ type: 'message', data: 'test' }) },
    { label: 'Ping', value: 'ping' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Plug className="w-6 h-6 text-yellow-400" />
              WebSocket Tester
            </h1>
            <p className="text-gray-400 text-sm">Test WebSocket connections</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Connection Panel */}
          <div className="space-y-4">
            {/* URL Input */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <label className="text-xs text-gray-500 block mb-2">WebSocket URL</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isConnected}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm font-mono disabled:opacity-50"
                placeholder="wss://example.com/socket"
              />

              <div className="flex gap-2 mt-3">
                {!isConnected ? (
                  <button
                    onClick={connect}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-sm hover:bg-green-500/30"
                  >
                    <Plug className="w-4 h-4" />
                    Connect
                  </button>
                ) : (
                  <button
                    onClick={disconnect}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm hover:bg-red-500/30"
                  >
                    <Unplug className="w-4 h-4" />
                    Disconnect
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 mt-3">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-xs text-gray-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>

            {/* Quick URLs */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-xs text-gray-500 mb-2">Quick Connect</h3>
              <div className="space-y-1.5">
                {templates.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => setUrl(t.url)}
                    disabled={isConnected}
                    className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg text-xs transition-colors"
                  >
                    <span className="text-gray-400">{t.label}</span>
                    <span className="block text-gray-500 font-mono truncate">{t.url}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-xs text-gray-500 mb-3">Options</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    checked={autoReconnect}
                    onChange={(e) => setAutoReconnect(e.target.checked)}
                    className="accent-yellow-500"
                  />
                  Auto Reconnect
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    checked={heartbeat}
                    onChange={(e) => setHeartbeat(e.target.checked)}
                    className="accent-yellow-500"
                  />
                  Heartbeat
                </label>
                {heartbeat && (
                  <div className="ml-6">
                    <input
                      type="number"
                      value={heartbeatInterval}
                      onChange={(e) => setHeartbeatInterval(parseInt(e.target.value) || 30)}
                      className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs"
                    />
                    <span className="text-xs text-gray-500 ml-2">seconds</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages Panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Message Input */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex gap-2 mb-3">
                {messageTemplates.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => setMessage(t.value)}
                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder="Enter message to send..."
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm font-mono resize-none h-20"
                />
                <button
                  onClick={sendMessage}
                  disabled={!isConnected || !message.trim()}
                  className="px-4 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages List */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">Messages ({messages.length})</h3>
                <div className="flex gap-2">
                  <button
                    onClick={copyMessages}
                    disabled={messages.length === 0}
                    className="p-1.5 hover:bg-gray-800 rounded disabled:opacity-50"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={clearMessages}
                    disabled={messages.length === 0}
                    className="p-1.5 hover:bg-gray-800 rounded text-red-400 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="h-96 overflow-y-auto space-y-2 p-2 bg-gray-950 rounded-lg">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-8">
                    No messages yet. Connect and send a message.
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-2 rounded-lg text-sm ${
                        msg.type === 'sent'
                          ? 'bg-yellow-500/10 border border-yellow-500/20 ml-8'
                          : msg.type === 'received'
                          ? 'bg-green-500/10 border border-green-500/20 mr-8'
                          : 'bg-gray-800 border border-gray-700 text-center'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs font-medium ${
                            msg.type === 'sent'
                              ? 'text-yellow-400'
                              : msg.type === 'received'
                              ? 'text-green-400'
                              : 'text-gray-400'
                          }`}
                        >
                          {msg.type === 'sent' ? '→ Sent' : msg.type === 'received' ? '← Received' : 'System'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <pre className="font-mono text-xs text-gray-300 whitespace-pre-wrap break-all">
                        {msg.content}
                      </pre>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
