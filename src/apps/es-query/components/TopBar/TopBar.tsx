import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Play, RefreshCw, Settings, Database, AlertCircle, Lock, User, Home, Shield } from 'lucide-react';
import { Button, Select, Input } from '../Common';
import { useQueryStore } from '../../store/queryStore';
import type { FieldType } from '../../types';
import { buildElasticsearchQuery, validateQuery } from '../../engine/QueryBuilderEngine';
import axios, { type AxiosInstance } from 'axios';

export const TopBar = () => {
  const {
    selectedIndex,
    availableIndices,
    setSelectedIndex,
    setAvailableIndices,
    setIndexMapping,
    filters,
    aggregations,
    analytics,
    querySize,
    from,
    trackTotalHits,
    setQuerySize,
    setFrom,
    setQueryResult,
    setIsLoading,
    setError,
    isLoading,
    error,
  } = useQueryStore();

  const [esUrl, setEsUrl] = useState('https://localhost:9200');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [useProxy, setUseProxy] = useState(true); // Enable proxy by default for HTTPS

  // Normalize and validate ES URL
  const normalizeEsUrl = (url: string): string => {
    let normalized = url.trim();

    // Add protocol if missing
    if (normalized && !normalized.match(/^https?:\/\//i)) {
      // Default to https for remote servers, http for localhost
      const isLocalhost = normalized.startsWith('localhost') || normalized.startsWith('127.0.0.1');
      normalized = (isLocalhost ? 'http://' : 'https://') + normalized;
    }

    // Remove trailing slash
    normalized = normalized.replace(/\/+$/, '');

    return normalized;
  };

  // Validate URL and return error message if invalid
  const validateEsUrl = (url: string): string | null => {
    if (!url.trim()) {
      return 'Elasticsearch URL is required';
    }

    const normalized = normalizeEsUrl(url);

    try {
      const parsed = new URL(normalized);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return 'URL must use http:// or https:// protocol';
      }
      return null; // Valid
    } catch {
      return `Invalid URL format: "${url}". Use format like https://hostname:9200`;
    }
  };

  // Create axios instance with or without authentication
  const axiosInstance: AxiosInstance = useMemo(() => {
    // Normalize the ES URL before using it
    const normalizedEsUrl = normalizeEsUrl(esUrl);

    // When using proxy, requests go through Vite dev server to bypass CORS
    const baseURL = useProxy ? '/api/es' : normalizedEsUrl;

    const config: {
      baseURL: string;
      auth?: { username: string; password: string };
      headers?: Record<string, string>;
    } = {
      baseURL,
    };

    // Add basic auth if credentials are provided
    if (username && password) {
      if (useProxy) {
        // For proxy, send auth as header (will be forwarded)
        const token = btoa(`${username}:${password}`);
        config.headers = {
          'Authorization': `Basic ${token}`,
          'X-ES-Target': normalizedEsUrl, // Pass normalized target URL to proxy
        };
      } else {
        config.auth = {
          username,
          password,
        };
      }
    } else if (useProxy) {
      config.headers = {
        'X-ES-Target': normalizedEsUrl,
      };
    }

    return axios.create(config);
  }, [esUrl, username, password, useProxy]);

  // Fetch available indices from Elasticsearch
  const fetchIndices = useCallback(async () => {
    // Validate URL before making request
    const urlError = validateEsUrl(esUrl);
    if (urlError) {
      setError(urlError);
      setIsConnected(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await axiosInstance.get('/_cat/indices?format=json');
      const indices = response.data
        .map((idx: { index: string }) => idx.index)
        .filter((idx: string) => !idx.startsWith('.')) // Filter out system indices
        .sort();
      setAvailableIndices(indices);
      setIsConnected(true);
    } catch (err: any) {
      const status = err.response?.status;
      const responseData = err.response?.data;

      // Check for proxy-specific errors
      if (responseData?.error === 'Invalid target URL' || responseData?.error === 'Invalid Target URL') {
        setError(`Invalid Elasticsearch URL: "${esUrl}". Please use format like https://hostname:9200`);
      } else if (responseData?.error === 'Proxy Error') {
        setError(`Cannot connect to Elasticsearch at ${normalizeEsUrl(esUrl)}: ${responseData.message}`);
      } else if (status === 401) {
        setError('Authentication failed. Please check your username and password.');
      } else if (status === 403) {
        setError('Access denied. User does not have permission to list indices.');
      } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setError(`Network error: Cannot reach Elasticsearch. ${useProxy ? 'Check if the ES server is accessible from this machine.' : 'Try enabling "Use Proxy" to bypass CORS restrictions.'}`);
      } else {
        setError(`Failed to connect to Elasticsearch: ${err.message || 'Unknown error'}`);
      }
      setIsConnected(false);
      console.error('Failed to fetch indices:', err);
    } finally {
      setIsLoading(false);
    }
  }, [axiosInstance, esUrl, useProxy, setAvailableIndices, setIsLoading, setError]);

  // Fetch index mapping when an index is selected
  const fetchMapping = useCallback(
    async (indexName: string) => {
      if (!indexName) return;

      try {
        setIsLoading(true);
        const response = await axiosInstance.get(`/${indexName}/_mapping`);
        const mapping = response.data[indexName]?.mappings?.properties || {};

        // Convert ES mapping to our FieldMapping format (including nested fields)
        const extractFields = (props: Record<string, any>, prefix = ''): Array<{ name: string; type: FieldType; path: string }> => {
          const fields: Array<{ name: string; type: FieldType; path: string }> = [];
          for (const [name, config] of Object.entries(props)) {
            const path = prefix ? `${prefix}.${name}` : name;
            fields.push({
              name: prefix ? path : name,
              type: (config.type || 'object') as FieldType,
              path,
            });
            // Include nested properties
            if (config.properties) {
              fields.push(...extractFields(config.properties, path));
            }
          }
          return fields;
        };

        const fields = extractFields(mapping);
        setIndexMapping(indexName, { indexName, fields });
      } catch (err: any) {
        console.error('Failed to fetch mapping:', err);
        setError(`Failed to fetch mapping for ${indexName}`);
      } finally {
        setIsLoading(false);
      }
    },
    [axiosInstance, setIndexMapping, setIsLoading, setError]
  );

  // Handle index selection
  const handleIndexChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const indexName = e.target.value;
    setSelectedIndex(indexName);
    if (indexName) {
      fetchMapping(indexName);
    }
  };

  // Run the query against Elasticsearch
  const runQuery = useCallback(async () => {
    if (!selectedIndex) {
      setError('Please select an index first');
      return;
    }

    const input = {
      filters,
      aggregations,
      analytics,
      size: querySize,
      from,
      trackTotalHits,
    };

    const validation = validateQuery(input);
    if (!validation.valid) {
      setError(`Query validation failed: ${validation.errors.join(', ')}`);
      return;
    }

    const query = buildElasticsearchQuery(input);

    try {
      setIsLoading(true);
      setError(null);
      const response = await axiosInstance.post(`/${selectedIndex}/_search`, query);
      setQueryResult(response.data);
    } catch (err: any) {
      const status = err.response?.status;
      let message = err.response?.data?.error?.root_cause?.[0]?.reason || err.message;

      if (status === 401) {
        message = 'Authentication failed. Please check your credentials.';
      } else if (status === 403) {
        message = 'Access denied. User does not have permission to search this index.';
      }

      setError(`Query failed: ${message}`);
      setQueryResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedIndex,
    axiosInstance,
    filters,
    aggregations,
    analytics,
    querySize,
    from,
    trackTotalHits,
    setIsLoading,
    setError,
    setQueryResult,
  ]);

  const indexOptions = [
    { value: '', label: '-- Select Index --' },
    ...availableIndices.map((idx) => ({ value: idx, label: idx })),
  ];

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left section: Logo and Index selector */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
            title="Back to Home"
          >
            <Home size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <Database size={24} className="text-blue-600" />
            <h1 className="font-bold text-lg text-gray-800">ElasticQueryDesigner</h1>
          </div>

          <div className="flex items-center gap-2">
            <Select
              options={indexOptions}
              value={selectedIndex}
              onChange={handleIndexChange}
              className="w-48"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchIndices}
              disabled={isLoading}
              title="Refresh indices"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </Button>
            {isConnected && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Connected
              </span>
            )}
          </div>
        </div>

        {/* Middle section: Query settings */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Size:</label>
            <Input
              type="number"
              value={querySize}
              onChange={(e) => setQuerySize(parseInt(e.target.value) || 0)}
              className="w-20"
              min={0}
              max={10000}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">From:</label>
            <Input
              type="number"
              value={from}
              onChange={(e) => setFrom(parseInt(e.target.value) || 0)}
              className="w-20"
              min={0}
            />
          </div>
        </div>

        {/* Right section: Run button and Settings */}
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={runQuery}
            disabled={isLoading || !selectedIndex}
          >
            <Play size={16} className="mr-1" />
            {isLoading ? 'Running...' : 'Run Query'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className={showSettings ? 'bg-gray-200' : ''}
          >
            <Settings size={18} />
          </Button>
        </div>
      </div>

      {/* Settings row */}
      {showSettings && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-end gap-4 flex-wrap">
            {/* Elasticsearch URL */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Elasticsearch URL</label>
              <Input
                value={esUrl}
                onChange={(e) => setEsUrl(e.target.value)}
                placeholder="http://localhost:9200"
                className="w-64"
              />
            </div>

            {/* Username */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                <User size={12} /> Username
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="elastic"
                className="w-40"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                <Lock size={12} /> Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-40"
              />
            </div>

            {/* Connect button */}
            <Button variant="secondary" size="md" onClick={fetchIndices} disabled={isLoading}>
              {isLoading ? 'Connecting...' : 'Connect'}
            </Button>
          </div>

          {/* Proxy toggle and help text */}
          <div className="mt-3 flex items-start justify-between">
            <div className="text-xs text-gray-500">
              {username ? (
                <span className="flex items-center gap-1">
                  <Lock size={10} /> Using Basic Authentication
                </span>
              ) : (
                <span>No authentication configured. Add username and password if your Elasticsearch requires it.</span>
              )}
            </div>

            {/* Proxy toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useProxy}
                onChange={(e) => setUseProxy(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                <Shield size={12} /> Use Proxy (bypass CORS/HTTPS)
              </span>
            </label>
          </div>

          {/* Proxy info */}
          {useProxy && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
              <strong>Proxy Mode:</strong> Requests are routed through the dev server to bypass CORS and SSL certificate issues.
              Works with HTTPS and self-signed certificates.
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700 text-sm"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};