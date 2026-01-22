// Map configuration types
export type ViewType = '2d' | '3d';

export type BasemapType =
  | 'streets'
  | 'streets-vector'
  | 'satellite'
  | 'hybrid'
  | 'topo'
  | 'topo-vector'
  | 'gray'
  | 'gray-vector'
  | 'dark-gray'
  | 'dark-gray-vector'
  | 'oceans'
  | 'national-geographic'
  | 'terrain'
  | 'osm'
  | 'streets-night-vector'
  | 'streets-navigation-vector'
  | 'none'
  | 'custom';

export interface CustomBasemapConfig {
  type: 'tile' | 'wms' | 'wmts' | 'vector-tile';
  url: string;
  title?: string;
  sublayers?: string[]; // For WMS layer names
}

export interface MapConfig {
  basemap: BasemapType;
  viewType: ViewType;
  center: [number, number];
  zoom: number;
  spatialReference?: number;
  backgroundColor?: [number, number, number]; // RGB for 'none' basemap
  customBasemap?: CustomBasemapConfig; // For 'custom' basemap
}

// Layer types - All available ArcGIS JS layer types
export type LayerType =
  // Feature Layers
  | 'FeatureLayer'
  | 'GeoJSONLayer'
  | 'CSVLayer'
  | 'OGCFeatureLayer'
  | 'WFSLayer'
  | 'StreamLayer'
  | 'KMLLayer'
  | 'GeoRSSLayer'
  // Tile Layers
  | 'TileLayer'
  | 'VectorTileLayer'
  | 'WebTileLayer'
  | 'WMTSLayer'
  | 'OpenStreetMapLayer'
  | 'BingMapsLayer'
  // Map Image Layers
  | 'MapImageLayer'
  | 'ImageryLayer'
  | 'ImageryTileLayer'
  | 'WMSLayer'
  // 3D Scene Layers
  | 'SceneLayer'
  | 'IntegratedMeshLayer'
  | 'PointCloudLayer'
  | 'BuildingSceneLayer'
  | 'ElevationLayer'
  // Other Layers
  | 'GraphicsLayer'
  | 'GroupLayer'
  | 'MediaLayer'
  | 'RouteLayer';

export type RendererType = 'simple' | 'unique-value' | 'class-breaks';

export interface SimpleSymbol {
  type: 'simple-marker' | 'simple-line' | 'simple-fill';
  color: [number, number, number, number];
  size?: number;
  style?: 'circle' | 'square' | 'diamond' | 'cross' | 'x' | 'triangle';
  outline?: {
    color: [number, number, number, number];
    width: number;
  };
}

export interface PictureMarkerSymbol {
  type: 'picture-marker';
  url: string;
  width: number;
  height: number;
  xoffset?: number;
  yoffset?: number;
}

export type PointSymbol = SimpleSymbol | PictureMarkerSymbol;

export interface RendererConfig {
  type: RendererType;
  symbol?: PointSymbol;
  field?: string;
  uniqueValueInfos?: Array<{
    value: string | number;
    symbol: PointSymbol;
    label?: string;
  }>;
  classBreakInfos?: Array<{
    minValue: number;
    maxValue: number;
    symbol: PointSymbol;
    label?: string;
  }>;
}

// JSON Data Layer configuration
export interface JsonFieldMapping {
  latitudeField: string;
  longitudeField: string;
  attributeFields: string[];
}

export interface JsonDataLayerConfig {
  id: string;
  title: string;
  data: Record<string, unknown>[];
  fieldMapping: JsonFieldMapping;
  symbol: PointSymbol;
  renderer?: RendererConfig;
  popupTemplateId?: string;
}

export interface LabelConfig {
  enabled: boolean;
  labelExpressionInfo?: {
    expression: string;
  };
  symbol?: {
    type: 'text';
    color: [number, number, number, number];
    haloColor?: [number, number, number, number];
    haloSize?: number;
    font?: {
      size: number;
      family: string;
      weight: string;
    };
  };
}

export interface SublayerConfig {
  id: number;
  visible: boolean;
  title?: string;
  definitionExpression?: string;
}

export interface WMSSublayerConfig {
  name: string;
  title?: string;
}

export interface LayerConfig {
  id: string;
  type: LayerType;
  title: string;
  url?: string;
  visible: boolean;
  opacity: number;
  definitionExpression?: string;
  renderer?: RendererConfig;
  labelingInfo?: LabelConfig;
  popupTemplateId?: string;
  sublayers?: SublayerConfig[];
  wmsSublayers?: WMSSublayerConfig[];
  order: number;
}

// Widget types - All available ArcGIS JS widgets
export type WidgetType =
  // Navigation
  | 'Home'
  | 'Zoom'
  | 'Compass'
  | 'NavigationToggle'
  | 'Fullscreen'
  // Location
  | 'Search'
  | 'Locate'
  | 'Track'
  | 'CoordinateConversion'
  // Layers
  | 'Legend'
  | 'LayerList'
  | 'BasemapGallery'
  | 'BasemapToggle'
  | 'BasemapLayerList'
  | 'TableList'
  // Editing
  | 'Sketch'
  | 'Editor'
  | 'FeatureForm'
  | 'FeatureTemplates'
  | 'FeatureTable'
  // Measurement
  | 'ScaleBar'
  | 'DistanceMeasurement2D'
  | 'AreaMeasurement2D'
  | 'DirectLineMeasurement3D'
  | 'AreaMeasurement3D'
  | 'ElevationProfile'
  // 3D Analysis
  | 'LineOfSight'
  | 'Slice'
  | 'Daylight'
  | 'Weather'
  | 'ShadowCast'
  | 'BuildingExplorer'
  // Utility
  | 'Print'
  | 'Bookmarks'
  | 'Directions'
  | 'TimeSlider'
  | 'Swipe'
  | 'Popup'
  | 'Feature'
  | 'Attribution'
  | 'ScaleRangeSlider'
  | 'FloorFilter'
  // Legacy/Internal
  | 'Expand'
  | 'Measurement';

export type WidgetPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'bottom'
  | 'manual';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  position: WidgetPosition;
  index?: number;
  expand?: boolean;
  expandIconClass?: string;
  expandTooltip?: string;
  properties?: Record<string, unknown>;
}

// Graphics types
export type GeometryType = 'point' | 'polyline' | 'polygon';

export interface PointGeometry {
  type: 'point';
  longitude: number;
  latitude: number;
}

export interface PolylineGeometry {
  type: 'polyline';
  paths: number[][][];
}

export interface PolygonGeometry {
  type: 'polygon';
  rings: number[][][];
}

export type Geometry = PointGeometry | PolylineGeometry | PolygonGeometry;

export interface GraphicConfig {
  id: string;
  geometry: Geometry;
  symbol: PointSymbol | SimpleSymbol;
  attributes?: Record<string, unknown>;
  popupTemplateId?: string;
}

// Popup template types
export interface PopupFieldInfo {
  fieldName: string;
  label?: string;
  format?: {
    digitSeparator?: boolean;
    places?: number;
    dateFormat?: string;
  };
  visible: boolean;
}

export interface PopupMediaInfo {
  type: 'image' | 'bar-chart' | 'column-chart' | 'line-chart' | 'pie-chart';
  title?: string;
  caption?: string;
  value?: {
    sourceURL?: string;
    fields?: string[];
    normalizeField?: string;
  };
}

export interface PopupExpressionInfo {
  name: string;
  title: string;
  expression: string;
  returnType?: 'string' | 'number';
}

export interface PopupTemplateConfig {
  id: string;
  title: string;
  content?: string;
  fieldInfos?: PopupFieldInfo[];
  mediaInfos?: PopupMediaInfo[];
  expressionInfos?: PopupExpressionInfo[];
  outFields?: string[];
}

// Complete map state
export interface MapState {
  map: MapConfig;
  layers: LayerConfig[];
  widgets: WidgetConfig[];
  graphics: GraphicConfig[];
  popupTemplates: PopupTemplateConfig[];
  jsonDataLayers: JsonDataLayerConfig[];
}

// Store actions
export interface MapActions {
  // Map actions
  setBasemap: (basemap: BasemapType) => void;
  setViewType: (viewType: ViewType) => void;
  setCenter: (center: [number, number]) => void;
  setBackgroundColor: (color: [number, number, number]) => void;
  setCustomBasemap: (config: CustomBasemapConfig | undefined) => void;
  setZoom: (zoom: number) => void;
  setSpatialReference: (wkid: number) => void;

  // Layer actions
  addLayer: (layer: Omit<LayerConfig, 'id' | 'order'>) => void;
  updateLayer: (id: string, updates: Partial<LayerConfig>) => void;
  removeLayer: (id: string) => void;
  reorderLayers: (layers: LayerConfig[]) => void;

  // Widget actions
  addWidget: (widget: Omit<WidgetConfig, 'id'>) => void;
  updateWidget: (id: string, updates: Partial<WidgetConfig>) => void;
  removeWidget: (id: string) => void;

  // Graphic actions
  addGraphic: (graphic: Omit<GraphicConfig, 'id'>) => void;
  updateGraphic: (id: string, updates: Partial<GraphicConfig>) => void;
  removeGraphic: (id: string) => void;

  // Popup template actions
  addPopupTemplate: (template: Omit<PopupTemplateConfig, 'id'>) => void;
  updatePopupTemplate: (id: string, updates: Partial<PopupTemplateConfig>) => void;
  removePopupTemplate: (id: string) => void;

  // JSON data layer actions
  addJsonDataLayer: (layer: Omit<JsonDataLayerConfig, 'id'>) => void;
  updateJsonDataLayer: (id: string, updates: Partial<JsonDataLayerConfig>) => void;
  removeJsonDataLayer: (id: string) => void;

  // Utility actions
  loadState: (state: MapState) => void;
  resetState: () => void;
}

export type MapStore = MapState & MapActions;
