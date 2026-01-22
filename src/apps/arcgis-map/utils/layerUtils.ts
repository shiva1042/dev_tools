import type { LayerType } from '../types';

export interface SublayerInfo {
  id: number;
  name: string;
  parentLayerId: number;
  defaultVisibility: boolean;
  minScale: number;
  maxScale: number;
  type?: string;
}

export interface WMSLayerInfo {
  name: string;
  title: string;
  abstract?: string;
  queryable?: boolean;
  children?: WMSLayerInfo[];
}

export interface LayerServiceInfo {
  type: LayerType;
  name: string;
  description?: string;
  sublayers?: SublayerInfo[];
  wmsLayers?: WMSLayerInfo[];
  fields?: Array<{ name: string; type: string; alias: string }>;
  geometryType?: string;
  serviceUrl: string;
  capabilities?: string;
}

// Fetch JSON from ArcGIS REST endpoint
async function fetchServiceJson(url: string): Promise<any> {
  const serviceUrl = new URL(url);
  serviceUrl.searchParams.set('f', 'json');

  const response = await fetch(serviceUrl.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch service info: ${response.statusText}`);
  }
  return response.json();
}

// Fetch and parse WMS GetCapabilities
async function fetchWMSCapabilities(url: string): Promise<WMSLayerInfo[]> {
  // Build GetCapabilities URL
  const wmsUrl = new URL(url);
  wmsUrl.searchParams.set('SERVICE', 'WMS');
  wmsUrl.searchParams.set('REQUEST', 'GetCapabilities');

  const response = await fetch(wmsUrl.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch WMS capabilities: ${response.statusText}`);
  }

  const text = await response.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, 'text/xml');

  // Check for parse errors
  const parseError = xml.querySelector('parsererror');
  if (parseError) {
    throw new Error('Failed to parse WMS capabilities XML');
  }

  // Find all Layer elements (WMS 1.1.1 and 1.3.0 compatible)
  const layers: WMSLayerInfo[] = [];

  // Get the root Capability/Layer element
  const capabilityLayer = xml.querySelector('Capability > Layer') ||
    xml.querySelector('WMS_Capabilities > Capability > Layer') ||
    xml.querySelector('WMT_MS_Capabilities > Capability > Layer');

  if (capabilityLayer) {
    // Parse child layers (skip the root layer as it's usually just a container)
    const childLayers = capabilityLayer.querySelectorAll(':scope > Layer');
    childLayers.forEach((layerEl) => {
      const layerInfo = parseWMSLayer(layerEl);
      if (layerInfo) {
        layers.push(layerInfo);
      }
    });
  }

  // If no child layers found, try to get all layers with Name element
  if (layers.length === 0) {
    const allLayers = xml.querySelectorAll('Layer');
    allLayers.forEach((layerEl) => {
      const nameEl = layerEl.querySelector(':scope > Name');
      if (nameEl && nameEl.textContent) {
        const layerInfo = parseWMSLayer(layerEl);
        if (layerInfo) {
          layers.push(layerInfo);
        }
      }
    });
  }

  return layers;
}

// Parse a single WMS Layer element
function parseWMSLayer(layerEl: Element): WMSLayerInfo | null {
  const nameEl = layerEl.querySelector(':scope > Name');
  const titleEl = layerEl.querySelector(':scope > Title');
  const abstractEl = layerEl.querySelector(':scope > Abstract');

  // Layer must have a Name to be requestable
  if (!nameEl || !nameEl.textContent) {
    // Check if it has child layers
    const childLayers = layerEl.querySelectorAll(':scope > Layer');
    if (childLayers.length === 0) {
      return null;
    }
  }

  const queryable = layerEl.getAttribute('queryable') === '1';

  const layer: WMSLayerInfo = {
    name: nameEl?.textContent || '',
    title: titleEl?.textContent || nameEl?.textContent || 'Unnamed Layer',
    abstract: abstractEl?.textContent || undefined,
    queryable,
  };

  // Parse child layers recursively
  const childLayers = layerEl.querySelectorAll(':scope > Layer');
  if (childLayers.length > 0) {
    layer.children = [];
    childLayers.forEach((childEl) => {
      const childInfo = parseWMSLayer(childEl);
      if (childInfo) {
        layer.children!.push(childInfo);
      }
    });
  }

  return layer;
}

// Flatten WMS layer hierarchy for display
export function flattenWMSLayers(layers: WMSLayerInfo[], depth: number = 0): Array<WMSLayerInfo & { depth: number }> {
  const result: Array<WMSLayerInfo & { depth: number }> = [];

  layers.forEach((layer) => {
    // Only add layers that have a name (are requestable)
    if (layer.name) {
      result.push({ ...layer, depth });
    }

    if (layer.children) {
      result.push(...flattenWMSLayers(layer.children, depth + 1));
    }
  });

  return result;
}

// Detect layer type from URL and service info
export async function analyzeLayerUrl(url: string): Promise<LayerServiceInfo> {
  try {
    let cleanUrl = url.trim();
    const baseUrl = cleanUrl.split('?')[0];
    const lowerUrl = cleanUrl.toLowerCase();

    // Check if it's a WMS service
    if (lowerUrl.includes('wms') ||
        lowerUrl.includes('service=wms') ||
        lowerUrl.includes('getcapabilities')) {
      try {
        const wmsLayers = await fetchWMSCapabilities(baseUrl);
        return {
          type: 'WMSLayer',
          name: 'WMS Service',
          wmsLayers,
          serviceUrl: baseUrl,
        };
      } catch (err) {
        console.warn('Failed to fetch WMS capabilities:', err);
        return {
          type: 'WMSLayer',
          name: 'WMS Service',
          serviceUrl: baseUrl,
        };
      }
    }

    // Fetch ArcGIS REST service info
    const info = await fetchServiceJson(baseUrl);

    if (info.error) {
      throw new Error(info.error.message || 'Service returned an error');
    }

    let layerType: LayerType;
    let sublayers: SublayerInfo[] | undefined;

    // Check if it's a MapServer with sublayers
    if (info.layers && Array.isArray(info.layers) && info.layers.length > 0) {
      const layerIdMatch = baseUrl.match(/\/(\d+)$/);

      if (layerIdMatch) {
        layerType = 'FeatureLayer';
      } else {
        layerType = 'MapImageLayer';
        sublayers = info.layers.map((layer: any) => ({
          id: layer.id,
          name: layer.name,
          parentLayerId: layer.parentLayerId ?? -1,
          defaultVisibility: layer.defaultVisibility ?? true,
          minScale: layer.minScale ?? 0,
          maxScale: layer.maxScale ?? 0,
          type: layer.type,
        }));
      }
    }
    // Check for FeatureServer or single layer
    else if (info.type === 'Feature Layer' || info.geometryType) {
      layerType = 'FeatureLayer';
    }
    // Check for VectorTileServer
    else if (info.type === 'VectorTileServer' || baseUrl.includes('VectorTileServer')) {
      layerType = 'VectorTileLayer';
    }
    // Check for GeoJSON
    else if (baseUrl.endsWith('.geojson') || baseUrl.endsWith('.json')) {
      layerType = 'GeoJSONLayer';
    }
    else {
      layerType = 'FeatureLayer';
    }

    return {
      type: layerType,
      name: info.name || info.mapName || info.documentInfo?.Title || 'Unnamed Service',
      description: info.description || info.serviceDescription,
      sublayers,
      fields: info.fields,
      geometryType: info.geometryType,
      serviceUrl: baseUrl,
      capabilities: info.capabilities,
    };
  } catch (error) {
    const guessedType = guessLayerTypeFromUrl(url);

    // Try WMS if guessed as WMS
    if (guessedType === 'WMSLayer') {
      try {
        const baseUrl = url.split('?')[0];
        const wmsLayers = await fetchWMSCapabilities(baseUrl);
        return {
          type: 'WMSLayer',
          name: 'WMS Service',
          wmsLayers,
          serviceUrl: baseUrl,
        };
      } catch {
        // Fall through to default
      }
    }

    return {
      type: guessedType,
      name: 'Unknown Service',
      serviceUrl: url.split('?')[0],
    };
  }
}

// Guess layer type from URL pattern
function guessLayerTypeFromUrl(url: string): LayerType {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('featureserver') || lowerUrl.match(/\/\d+$/)) {
    return 'FeatureLayer';
  }
  if (lowerUrl.includes('mapserver') && !lowerUrl.match(/\/\d+$/)) {
    return 'MapImageLayer';
  }
  if (lowerUrl.includes('wms') || lowerUrl.includes('getcapabilities')) {
    return 'WMSLayer';
  }
  if (lowerUrl.includes('vectortileserver')) {
    return 'VectorTileLayer';
  }
  if (lowerUrl.endsWith('.geojson') || lowerUrl.endsWith('.json')) {
    return 'GeoJSONLayer';
  }

  return 'FeatureLayer';
}
