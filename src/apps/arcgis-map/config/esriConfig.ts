/**
 * ArcGIS Configuration File
 * Central configuration for all ESRI/ArcGIS resources
 */

// =============================================================================
// BASEMAP CONFIGURATIONS
// =============================================================================

export const ESRI_BASEMAPS = {
  // Vector Basemaps (Recommended)
  vector: [
    { id: 'arcgis-navigation', label: 'Navigation', thumbnail: 'navigation' },
    { id: 'arcgis-navigation-night', label: 'Navigation (Night)', thumbnail: 'navigation-night' },
    { id: 'arcgis-streets', label: 'Streets', thumbnail: 'streets' },
    { id: 'arcgis-streets-night', label: 'Streets (Night)', thumbnail: 'streets-night' },
    { id: 'arcgis-streets-relief', label: 'Streets Relief', thumbnail: 'streets-relief' },
    { id: 'arcgis-topographic', label: 'Topographic', thumbnail: 'topographic' },
    { id: 'arcgis-light-gray', label: 'Light Gray Canvas', thumbnail: 'light-gray' },
    { id: 'arcgis-dark-gray', label: 'Dark Gray Canvas', thumbnail: 'dark-gray' },
    { id: 'arcgis-human-geography', label: 'Human Geography', thumbnail: 'human-geography' },
    { id: 'arcgis-human-geography-dark', label: 'Human Geography (Dark)', thumbnail: 'human-geography-dark' },
    { id: 'arcgis-charted-territory', label: 'Charted Territory', thumbnail: 'charted-territory' },
    { id: 'arcgis-community', label: 'Community', thumbnail: 'community' },
    { id: 'arcgis-nova', label: 'Nova', thumbnail: 'nova' },
    { id: 'arcgis-colored-pencil', label: 'Colored Pencil', thumbnail: 'colored-pencil' },
    { id: 'arcgis-modern-antique', label: 'Modern Antique', thumbnail: 'modern-antique' },
    { id: 'arcgis-midcentury', label: 'Midcentury', thumbnail: 'midcentury' },
    { id: 'arcgis-newspaper', label: 'Newspaper', thumbnail: 'newspaper' },
    { id: 'osm-standard', label: 'OpenStreetMap', thumbnail: 'osm' },
    { id: 'osm-standard-relief', label: 'OpenStreetMap Relief', thumbnail: 'osm-relief' },
  ],

  // Imagery Basemaps
  imagery: [
    { id: 'arcgis-imagery', label: 'Imagery', thumbnail: 'imagery' },
    { id: 'arcgis-imagery-standard', label: 'Imagery Standard', thumbnail: 'imagery-standard' },
    { id: 'arcgis-imagery-labels', label: 'Imagery with Labels', thumbnail: 'imagery-labels' },
  ],

  // Legacy Basemaps (still supported)
  legacy: [
    { id: 'streets', label: 'Streets (Legacy)', thumbnail: 'streets' },
    { id: 'satellite', label: 'Satellite', thumbnail: 'satellite' },
    { id: 'hybrid', label: 'Hybrid', thumbnail: 'hybrid' },
    { id: 'topo', label: 'Topographic (Legacy)', thumbnail: 'topo' },
    { id: 'gray', label: 'Gray Canvas (Legacy)', thumbnail: 'gray' },
    { id: 'dark-gray', label: 'Dark Gray (Legacy)', thumbnail: 'dark-gray' },
    { id: 'oceans', label: 'Oceans', thumbnail: 'oceans' },
    { id: 'national-geographic', label: 'National Geographic', thumbnail: 'national-geographic' },
    { id: 'terrain', label: 'Terrain', thumbnail: 'terrain' },
    { id: 'osm', label: 'OpenStreetMap (Legacy)', thumbnail: 'osm' },
    { id: 'streets-vector', label: 'Streets Vector', thumbnail: 'streets-vector' },
    { id: 'streets-night-vector', label: 'Streets Night Vector', thumbnail: 'streets-night-vector' },
    { id: 'streets-navigation-vector', label: 'Navigation Vector', thumbnail: 'navigation-vector' },
    { id: 'topo-vector', label: 'Topographic Vector', thumbnail: 'topo-vector' },
    { id: 'gray-vector', label: 'Light Gray Vector', thumbnail: 'gray-vector' },
    { id: 'dark-gray-vector', label: 'Dark Gray Vector', thumbnail: 'dark-gray-vector' },
  ],

  // 3D-specific Basemaps
  '3d': [
    { id: 'arcgis-imagery', label: 'Imagery 3D', thumbnail: 'imagery' },
    { id: 'arcgis-topographic', label: 'Topographic 3D', thumbnail: 'topographic' },
  ],
};

// All basemaps flattened for dropdown
export const ALL_BASEMAPS = [
  { id: 'none', label: 'No Basemap', group: 'special' },
  { id: 'custom', label: 'Custom Basemap', group: 'special' },
  ...ESRI_BASEMAPS.vector.map(b => ({ ...b, group: 'vector' })),
  ...ESRI_BASEMAPS.imagery.map(b => ({ ...b, group: 'imagery' })),
  ...ESRI_BASEMAPS.legacy.map(b => ({ ...b, group: 'legacy' })),
];

// =============================================================================
// SERVICE URLs
// =============================================================================

export const ESRI_SERVICE_URLS = {
  // Base URLs
  arcgisOnline: 'https://www.arcgis.com',
  arcgisServer: 'https://services.arcgis.com',
  livingAtlas: 'https://livingatlas.arcgis.com',

  // Geocoding
  geocoding: {
    world: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer',
  },

  // Routing
  routing: {
    world: 'https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World',
    closest: 'https://route.arcgis.com/arcgis/rest/services/World/ClosestFacility/NAServer/ClosestFacility_World',
    serviceArea: 'https://route.arcgis.com/arcgis/rest/services/World/ServiceAreas/NAServer/ServiceArea_World',
  },

  // Geometry Service
  geometry: 'https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer',

  // Print Service
  print: 'https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',

  // Elevation Services
  elevation: {
    world: 'https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer',
    worldTopoBathy: 'https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/TopoBathy3D/ImageServer',
  },

  // Sample Feature Services
  samples: {
    usaCities: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Major_Cities/FeatureServer/0',
    usaStates: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_States_Generalized/FeatureServer/0',
    worldCountries: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Countries/FeatureServer/0',
    earthquakes: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson',
    traffic: 'https://traffic.arcgis.com/arcgis/rest/services/World/Traffic/MapServer',
    weather: 'https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/NOAA_Precipitation_Analysis/FeatureServer/0',
  },
};

// =============================================================================
// LAYER TYPES
// =============================================================================

export interface LayerTypeConfig {
  type: string;
  label: string;
  description: string;
  category: 'feature' | 'tile' | 'imagery' | 'scene' | 'other';
  requiresUrl: boolean;
  supports2D: boolean;
  supports3D: boolean;
  urlPlaceholder?: string;
  additionalProps?: string[];
}

export const LAYER_TYPES: LayerTypeConfig[] = [
  // Feature Layers
  {
    type: 'FeatureLayer',
    label: 'Feature Layer',
    description: 'Vector features from ArcGIS services or GeoJSON',
    category: 'feature',
    requiresUrl: true,
    supports2D: true,
    supports3D: true,
    urlPlaceholder: 'https://services.arcgis.com/.../FeatureServer/0',
  },
  {
    type: 'GeoJSONLayer',
    label: 'GeoJSON Layer',
    description: 'Features from GeoJSON files or URLs',
    category: 'feature',
    requiresUrl: true,
    supports2D: true,
    supports3D: true,
    urlPlaceholder: 'https://example.com/data.geojson',
  },
  {
    type: 'CSVLayer',
    label: 'CSV Layer',
    description: 'Point features from CSV files with lat/lon',
    category: 'feature',
    requiresUrl: true,
    supports2D: true,
    supports3D: true,
    urlPlaceholder: 'https://example.com/data.csv',
  },
  {
    type: 'OGCFeatureLayer',
    label: 'OGC Feature Layer',
    description: 'Features from OGC API - Features services',
    category: 'feature',
    requiresUrl: true,
    supports2D: true,
    supports3D: true,
    urlPlaceholder: 'https://example.com/ogc/features/collections/layer',
  },
  {
    type: 'WFSLayer',
    label: 'WFS Layer',
    description: 'Features from OGC WFS services',
    category: 'feature',
    requiresUrl: true,
    supports2D: true,
    supports3D: false,
    urlPlaceholder: 'https://example.com/wfs',
  },
  {
    type: 'StreamLayer',
    label: 'Stream Layer',
    description: 'Real-time streaming features',
    category: 'feature',
    requiresUrl: true,
    supports2D: true,
    supports3D: true,
    urlPlaceholder: 'wss://example.com/stream',
  },
  {
    type: 'KMLLayer',
    label: 'KML Layer',
    description: 'Features from KML/KMZ files',
    category: 'feature',
    requiresUrl: true,
    supports2D: true,
    supports3D: false,
    urlPlaceholder: 'https://example.com/data.kml',
  },
  {
    type: 'GeoRSSLayer',
    label: 'GeoRSS Layer',
    description: 'Features from GeoRSS feeds',
    category: 'feature',
    requiresUrl: true,
    supports2D: true,
    supports3D: false,
    urlPlaceholder: 'https://example.com/feed.rss',
  },

  // Tile Layers
  {
    type: 'TileLayer',
    label: 'Tile Layer',
    description: 'Cached map tiles from ArcGIS services',
    category: 'tile',
    requiresUrl: true,
    supports2D: true,
    supports3D: true,
    urlPlaceholder: 'https://services.arcgis.com/.../MapServer',
  },
  {
    type: 'VectorTileLayer',
    label: 'Vector Tile Layer',
    description: 'Vector tiles with custom styling',
    category: 'tile',
    requiresUrl: true,
    supports2D: true,
    supports3D: true,
    urlPlaceholder: 'https://example.com/VectorTileServer',
  },
  {
    type: 'WebTileLayer',
    label: 'Web Tile Layer',
    description: 'XYZ/TMS tiles from any tile server',
    category: 'tile',
    requiresUrl: true,
    supports2D: true,
    supports3D: false,
    urlPlaceholder: 'https://{subDomain}.tile.example.com/{z}/{x}/{y}.png',
  },
  {
    type: 'WMTSLayer',
    label: 'WMTS Layer',
    description: 'Tiles from OGC WMTS services',
    category: 'tile',
    requiresUrl: true,
    supports2D: true,
    supports3D: false,
    urlPlaceholder: 'https://example.com/wmts',
  },
  {
    type: 'OpenStreetMapLayer',
    label: 'OpenStreetMap Layer',
    description: 'OpenStreetMap tiles',
    category: 'tile',
    requiresUrl: false,
    supports2D: true,
    supports3D: false,
  },
  {
    type: 'BingMapsLayer',
    label: 'Bing Maps Layer',
    description: 'Bing Maps tiles (requires API key)',
    category: 'tile',
    requiresUrl: false,
    supports2D: true,
    supports3D: false,
    additionalProps: ['apiKey', 'style'],
  },

  // Map Image Layers
  {
    type: 'MapImageLayer',
    label: 'Map Image Layer',
    description: 'Dynamic map images from ArcGIS services',
    category: 'imagery',
    requiresUrl: true,
    supports2D: true,
    supports3D: false,
    urlPlaceholder: 'https://services.arcgis.com/.../MapServer',
  },
  {
    type: 'ImageryLayer',
    label: 'Imagery Layer',
    description: 'Raster imagery from Image Services',
    category: 'imagery',
    requiresUrl: true,
    supports2D: true,
    supports3D: true,
    urlPlaceholder: 'https://services.arcgis.com/.../ImageServer',
  },
  {
    type: 'ImageryTileLayer',
    label: 'Imagery Tile Layer',
    description: 'Tiled imagery from Image Services',
    category: 'imagery',
    requiresUrl: true,
    supports2D: true,
    supports3D: true,
    urlPlaceholder: 'https://services.arcgis.com/.../ImageServer',
  },
  {
    type: 'WMSLayer',
    label: 'WMS Layer',
    description: 'Maps from OGC WMS services',
    category: 'imagery',
    requiresUrl: true,
    supports2D: true,
    supports3D: false,
    urlPlaceholder: 'https://example.com/wms',
  },

  // 3D Scene Layers
  {
    type: 'SceneLayer',
    label: 'Scene Layer',
    description: '3D scene layer (buildings, objects)',
    category: 'scene',
    requiresUrl: true,
    supports2D: false,
    supports3D: true,
    urlPlaceholder: 'https://services.arcgis.com/.../SceneServer',
  },
  {
    type: 'IntegratedMeshLayer',
    label: 'Integrated Mesh Layer',
    description: '3D mesh from reality capture',
    category: 'scene',
    requiresUrl: true,
    supports2D: false,
    supports3D: true,
    urlPlaceholder: 'https://services.arcgis.com/.../SceneServer',
  },
  {
    type: 'PointCloudLayer',
    label: 'Point Cloud Layer',
    description: 'LiDAR point clouds',
    category: 'scene',
    requiresUrl: true,
    supports2D: false,
    supports3D: true,
    urlPlaceholder: 'https://services.arcgis.com/.../SceneServer',
  },
  {
    type: 'BuildingSceneLayer',
    label: 'Building Scene Layer',
    description: '3D buildings with BIM data',
    category: 'scene',
    requiresUrl: true,
    supports2D: false,
    supports3D: true,
    urlPlaceholder: 'https://services.arcgis.com/.../SceneServer',
  },
  {
    type: 'ElevationLayer',
    label: 'Elevation Layer',
    description: 'Terrain elevation data',
    category: 'scene',
    requiresUrl: true,
    supports2D: false,
    supports3D: true,
    urlPlaceholder: 'https://elevation3d.arcgis.com/.../ImageServer',
  },

  // Other Layers
  {
    type: 'GraphicsLayer',
    label: 'Graphics Layer',
    description: 'Client-side graphics and drawings',
    category: 'other',
    requiresUrl: false,
    supports2D: true,
    supports3D: true,
  },
  {
    type: 'GroupLayer',
    label: 'Group Layer',
    description: 'Container for organizing layers',
    category: 'other',
    requiresUrl: false,
    supports2D: true,
    supports3D: true,
  },
  {
    type: 'MediaLayer',
    label: 'Media Layer',
    description: 'Images or videos on the map',
    category: 'other',
    requiresUrl: true,
    supports2D: true,
    supports3D: false,
    urlPlaceholder: 'https://example.com/image.png',
  },
  {
    type: 'RouteLayer',
    label: 'Route Layer',
    description: 'Routing results visualization',
    category: 'other',
    requiresUrl: false,
    supports2D: true,
    supports3D: false,
  },
];

// =============================================================================
// WIDGET TYPES
// =============================================================================

export interface WidgetTypeConfig {
  type: string;
  label: string;
  description: string;
  category: 'navigation' | 'location' | 'layers' | 'editing' | 'measurement' | 'analysis' | 'utility' | '3d-only';
  supports2D: boolean;
  supports3D: boolean;
  defaultPosition: string;
  requiresLayer?: boolean;
  requiresService?: string;
}

export const WIDGET_TYPES: WidgetTypeConfig[] = [
  // Navigation Widgets
  {
    type: 'Home',
    label: 'Home',
    description: 'Return to initial map extent',
    category: 'navigation',
    supports2D: true,
    supports3D: true,
    defaultPosition: 'top-left',
  },
  {
    type: 'Zoom',
    label: 'Zoom',
    description: 'Zoom in/out buttons',
    category: 'navigation',
    supports2D: true,
    supports3D: true,
    defaultPosition: 'top-left',
  },
  {
    type: 'Compass',
    label: 'Compass',
    description: 'Show and reset map orientation',
    category: 'navigation',
    supports2D: true,
    supports3D: true,
    defaultPosition: 'top-left',
  },
  {
    type: 'NavigationToggle',
    label: 'Navigation Toggle',
    description: 'Toggle between pan and rotate modes (3D)',
    category: 'navigation',
    supports2D: false,
    supports3D: true,
    defaultPosition: 'top-left',
  },
  {
    type: 'Fullscreen',
    label: 'Fullscreen',
    description: 'Toggle fullscreen mode',
    category: 'navigation',
    supports2D: true,
    supports3D: true,
    defaultPosition: 'top-right',
  },

  // Location Widgets
  {
    type: 'Search',
    label: 'Search',
    description: 'Search for places and addresses',
    category: 'location',
    supports2D: true,
    supports3D: true,
    defaultPosition: 'top-right',
  },
  {
    type: 'Locate',
    label: 'Locate',
    description: 'Find user\'s current location',
    category: 'location',
    supports2D: true,
    supports3D: true,
    defaultPosition: 'top-left',
  },
  {
    type: 'Track',
    label: 'Track',
    description: 'Continuously track user location',
    category: 'location',
    supports2D: true,
    supports3D: true,
    defaultPosition: 'top-left',
  },
  {
    type: 'CoordinateConversion',
    label: 'Coordinate Conversion',
    description: 'Display/convert coordinates in multiple formats',
    category: 'location',
    supports2D: true,
    supports3D: true,
    defaultPosition: 'bottom-left',
  },

  // Layer Widgets
  {
    type: 'Legend',
    label: 'Legend',
    description: 'Display map legend',
    category: 'layers',
    supports2D: true,
    supports3D: true,
    defaultPosition: 'bottom-left',
  },
  {
    type: 'LayerList',
    label: 'Layer List',
    description: 'Toggle layer visibility',
    category: 'layers',
    supports2D: true,
    supports3D: true,
    defaultPosition: 'top-right',
  },
  {
    type: 'BasemapGallery',
    label: 'Basemap Gallery',
    description: 'Switch between basemaps',
    category: 'layers',
    supports2D: true,
    supports3D: true,
    defaultPosition: 'top-right',
  },
  {
    type: 'BasemapToggle',
    label: 'Basemap Toggle',
    description: 'Quick toggle between two basemaps',
    category: 'layers',
    supports2D: true,
    supports3D: true,
    defaultPosition: 'bottom-right',
  },
  {
    type: 'BasemapLayerList',
    label: 'Basemap Layer List',
    description: 'Control basemap sublayers',
    category: 'layers',
    supports2D: true,
    supports3D: true,
    defaultPosition: 'top-right',
  },
  {
    type: 'TableList',
    label: 'Table List',
    description: 'List of feature tables',
    category: 'layers',
    supports2D: true,
    supports3D: true,
    defaultPosition: 'top-right',
  },

  // Editing Widgets
  {
    type: 'Sketch',
    label: 'Sketch',
    description: 'Draw graphics on the map',
    category: 'editing',
    supports2D: true,
    supports3D: true,
    defaultPosition: 'top-right',
    requiresLayer: true,
  },
  {
    type: 'Editor',
    label: 'Editor',
    description: 'Edit feature layer attributes and geometry',
    category: 'editing',
    supports2D: true,
    supports3D: true,
    defaultPosition: 'top-right',
  },
  {
    type: 'FeatureForm',
    label: 'Feature Form',
    description: 'Form for editing feature attributes',
    category: 'editing',
    supports2D: true,
    supports3D: true,
    defaultPosition: 'top-right',
  },
  {
    type: 'FeatureTemplates',
    label: 'Feature Templates',
    description: 'Templates for creating new features',
    category: 'editing',
    supports2D: true,
    supports3D: true,
    defaultPosition: 'top-right',
  },
  {
    type: 'FeatureTable',
    label: 'Feature Table',
    description: 'Tabular view of feature data',
    category: 'editing',
    supports2D: true,
    supports3D: true,
    defaultPosition: 'bottom',
  },

  // Measurement Widgets
  {
    type: 'ScaleBar',
    label: 'Scale Bar',
    description: 'Display map scale',
    category: 'measurement',
    supports2D: true,
    supports3D: false,
    defaultPosition: 'bottom-left',
  },
  {
    type: 'DistanceMeasurement2D',
    label: 'Distance Measurement (2D)',
    description: 'Measure distances on 2D map',
    category: 'measurement',
    supports2D: true,
    supports3D: false,
    defaultPosition: 'top-right',
  },
  {
    type: 'AreaMeasurement2D',
    label: 'Area Measurement (2D)',
    description: 'Measure areas on 2D map',
    category: 'measurement',
    supports2D: true,
    supports3D: false,
    defaultPosition: 'top-right',
  },
  {
    type: 'DirectLineMeasurement3D',
    label: 'Direct Line Measurement (3D)',
    description: 'Measure 3D distances',
    category: 'measurement',
    supports2D: false,
    supports3D: true,
    defaultPosition: 'top-right',
  },
  {
    type: 'AreaMeasurement3D',
    label: 'Area Measurement (3D)',
    description: 'Measure areas in 3D',
    category: 'measurement',
    supports2D: false,
    supports3D: true,
    defaultPosition: 'top-right',
  },
  {
    type: 'ElevationProfile',
    label: 'Elevation Profile',
    description: 'View elevation along a path',
    category: 'measurement',
    supports2D: true,
    supports3D: true,
    defaultPosition: 'top-right',
  },

  // Analysis Widgets (3D-only)
  {
    type: 'LineOfSight',
    label: 'Line of Sight',
    description: 'Analyze visibility between points',
    category: '3d-only',
    supports2D: false,
    supports3D: true,
    defaultPosition: 'top-right',
  },
  {
    type: 'Slice',
    label: 'Slice',
    description: 'Slice through 3D content',
    category: '3d-only',
    supports2D: false,
    supports3D: true,
    defaultPosition: 'top-right',
  },
  {
    type: 'Daylight',
    label: 'Daylight',
    description: 'Control sun position and shadows',
    category: '3d-only',
    supports2D: false,
    supports3D: true,
    defaultPosition: 'top-right',
  },
  {
    type: 'Weather',
    label: 'Weather',
    description: 'Add weather effects (clouds, rain, fog)',
    category: '3d-only',
    supports2D: false,
    supports3D: true,
    defaultPosition: 'top-right',
  },
  {
    type: 'ShadowCast',
    label: 'Shadow Cast',
    description: 'Analyze shadow casting',
    category: '3d-only',
    supports2D: false,
    supports3D: true,
    defaultPosition: 'top-right',
  },
  {
    type: 'BuildingExplorer',
    label: 'Building Explorer',
    description: 'Explore building scene layers',
    category: '3d-only',
    supports2D: false,
    supports3D: true,
    defaultPosition: 'top-right',
  },

  // Utility Widgets
  {
    type: 'Print',
    label: 'Print',
    description: 'Print or export the map',
    category: 'utility',
    supports2D: true,
    supports3D: true,
    defaultPosition: 'top-right',
    requiresService: 'print',
  },
  {
    type: 'Bookmarks',
    label: 'Bookmarks',
    description: 'Save and navigate to map locations',
    category: 'utility',
    supports2D: true,
    supports3D: true,
    defaultPosition: 'top-right',
  },
  {
    type: 'Directions',
    label: 'Directions',
    description: 'Get routing directions',
    category: 'utility',
    supports2D: true,
    supports3D: true,
    defaultPosition: 'top-right',
    requiresService: 'routing',
  },
  {
    type: 'TimeSlider',
    label: 'Time Slider',
    description: 'Filter time-aware layers',
    category: 'utility',
    supports2D: true,
    supports3D: true,
    defaultPosition: 'bottom',
  },
  {
    type: 'Swipe',
    label: 'Swipe',
    description: 'Compare layers with swipe',
    category: 'utility',
    supports2D: true,
    supports3D: false,
    defaultPosition: 'top-right',
  },
  {
    type: 'Popup',
    label: 'Popup',
    description: 'Feature information popup',
    category: 'utility',
    supports2D: true,
    supports3D: true,
    defaultPosition: 'auto',
  },
  {
    type: 'Feature',
    label: 'Feature Widget',
    description: 'Display a single feature',
    category: 'utility',
    supports2D: true,
    supports3D: true,
    defaultPosition: 'top-right',
  },
  {
    type: 'Attribution',
    label: 'Attribution',
    description: 'Data attribution display',
    category: 'utility',
    supports2D: true,
    supports3D: true,
    defaultPosition: 'bottom-right',
  },
  {
    type: 'ScaleRangeSlider',
    label: 'Scale Range Slider',
    description: 'Set layer visibility scale range',
    category: 'utility',
    supports2D: true,
    supports3D: false,
    defaultPosition: 'top-right',
  },
  {
    type: 'FloorFilter',
    label: 'Floor Filter',
    description: 'Filter indoor map floors',
    category: 'utility',
    supports2D: true,
    supports3D: true,
    defaultPosition: 'top-right',
  },
];

// =============================================================================
// SYMBOL TYPES
// =============================================================================

export const SYMBOL_TYPES = {
  marker: [
    { type: 'simple-marker', label: 'Simple Marker', description: 'Basic shape markers' },
    { type: 'picture-marker', label: 'Picture Marker', description: 'Image-based markers' },
    { type: 'text', label: 'Text Symbol', description: 'Text labels' },
    { type: 'web-style', label: 'Web Style Symbol', description: 'Styled symbols from portal' },
  ],
  line: [
    { type: 'simple-line', label: 'Simple Line', description: 'Basic line styles' },
    { type: 'cim', label: 'CIM Symbol', description: 'Advanced cartographic symbols' },
  ],
  fill: [
    { type: 'simple-fill', label: 'Simple Fill', description: 'Basic polygon fills' },
    { type: 'picture-fill', label: 'Picture Fill', description: 'Image pattern fills' },
  ],
  '3d': [
    { type: 'point-3d', label: 'Point 3D', description: '3D point symbols' },
    { type: 'line-3d', label: 'Line 3D', description: '3D line symbols' },
    { type: 'polygon-3d', label: 'Polygon 3D', description: '3D polygon symbols' },
    { type: 'mesh-3d', label: 'Mesh 3D', description: '3D mesh symbols' },
    { type: 'label-3d', label: 'Label 3D', description: '3D text labels' },
  ],
};

// Marker styles
export const MARKER_STYLES = [
  'circle', 'square', 'cross', 'x', 'diamond', 'triangle', 'path'
];

// Line styles
export const LINE_STYLES = [
  'solid', 'dash', 'dot', 'dash-dot', 'long-dash', 'long-dash-dot',
  'long-dash-dot-dot', 'short-dash', 'short-dash-dot', 'short-dash-dot-dot',
  'short-dot', 'none'
];

// Fill styles
export const FILL_STYLES = [
  'solid', 'none', 'horizontal', 'vertical', 'forward-diagonal',
  'backward-diagonal', 'cross', 'diagonal-cross'
];

// =============================================================================
// RENDERER TYPES
// =============================================================================

export const RENDERER_TYPES = [
  { type: 'simple', label: 'Simple', description: 'Same symbol for all features' },
  { type: 'unique-value', label: 'Unique Value', description: 'Symbol based on attribute value' },
  { type: 'class-breaks', label: 'Class Breaks', description: 'Symbol based on numeric ranges' },
  { type: 'heatmap', label: 'Heatmap', description: 'Density-based visualization' },
  { type: 'dot-density', label: 'Dot Density', description: 'Dots representing quantities' },
  { type: 'dictionary', label: 'Dictionary', description: 'Military symbols (MIL-STD-2525)' },
];

// =============================================================================
// POPUP CONTENT TYPES
// =============================================================================

export const POPUP_CONTENT_TYPES = [
  { type: 'fields', label: 'Fields', description: 'Display attribute fields' },
  { type: 'text', label: 'Text', description: 'Custom text/HTML content' },
  { type: 'media', label: 'Media', description: 'Images and charts' },
  { type: 'attachments', label: 'Attachments', description: 'File attachments' },
  { type: 'custom', label: 'Custom', description: 'Custom HTML function' },
  { type: 'expression', label: 'Expression', description: 'Arcade expression content' },
  { type: 'relationship', label: 'Relationship', description: 'Related records' },
];

// =============================================================================
// SPATIAL REFERENCE SYSTEMS
// =============================================================================

export const COMMON_SPATIAL_REFERENCES = [
  { wkid: 4326, label: 'WGS 84 (Geographic)', description: 'Latitude/Longitude' },
  { wkid: 3857, label: 'Web Mercator', description: 'Used by most web maps' },
  { wkid: 102100, label: 'Web Mercator (Aux)', description: 'Auxiliary sphere' },
  { wkid: 4269, label: 'NAD 83', description: 'North American Datum 1983' },
  { wkid: 32632, label: 'UTM Zone 32N', description: 'WGS 84 / UTM zone 32N' },
  { wkid: 32633, label: 'UTM Zone 33N', description: 'WGS 84 / UTM zone 33N' },
];

// =============================================================================
// EXPORT ALL
// =============================================================================

export default {
  ESRI_BASEMAPS,
  ALL_BASEMAPS,
  ESRI_SERVICE_URLS,
  LAYER_TYPES,
  WIDGET_TYPES,
  SYMBOL_TYPES,
  MARKER_STYLES,
  LINE_STYLES,
  FILL_STYLES,
  RENDERER_TYPES,
  POPUP_CONTENT_TYPES,
  COMMON_SPATIAL_REFERENCES,
};
