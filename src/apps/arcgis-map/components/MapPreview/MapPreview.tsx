import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import SceneView from '@arcgis/core/views/SceneView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import WMSLayer from '@arcgis/core/layers/WMSLayer';
import WMTSLayer from '@arcgis/core/layers/WMTSLayer';
import TileLayer from '@arcgis/core/layers/TileLayer';
import WebTileLayer from '@arcgis/core/layers/WebTileLayer';
import Basemap from '@arcgis/core/Basemap';
import Color from '@arcgis/core/Color';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Polyline from '@arcgis/core/geometry/Polyline';
import Polygon from '@arcgis/core/geometry/Polygon';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol';
// Navigation Widgets
import Home from '@arcgis/core/widgets/Home';
import Zoom from '@arcgis/core/widgets/Zoom';
import Compass from '@arcgis/core/widgets/Compass';
import Fullscreen from '@arcgis/core/widgets/Fullscreen';
// Location Widgets
import Search from '@arcgis/core/widgets/Search';
import Locate from '@arcgis/core/widgets/Locate';
import Track from '@arcgis/core/widgets/Track';
import CoordinateConversion from '@arcgis/core/widgets/CoordinateConversion';
// Layer Widgets
import Legend from '@arcgis/core/widgets/Legend';
import LayerList from '@arcgis/core/widgets/LayerList';
import BasemapGallery from '@arcgis/core/widgets/BasemapGallery';
import BasemapToggle from '@arcgis/core/widgets/BasemapToggle';
import BasemapLayerList from '@arcgis/core/widgets/BasemapLayerList';
// Editing Widgets
import Sketch from '@arcgis/core/widgets/Sketch';
import Editor from '@arcgis/core/widgets/Editor';
// Measurement Widgets
import ScaleBar from '@arcgis/core/widgets/ScaleBar';
import DistanceMeasurement2D from '@arcgis/core/widgets/DistanceMeasurement2D';
import AreaMeasurement2D from '@arcgis/core/widgets/AreaMeasurement2D';
import ElevationProfile from '@arcgis/core/widgets/ElevationProfile';
// Utility Widgets
import Print from '@arcgis/core/widgets/Print';
import Bookmarks from '@arcgis/core/widgets/Bookmarks';
import TimeSlider from '@arcgis/core/widgets/TimeSlider';
import Swipe from '@arcgis/core/widgets/Swipe';
// Container Widget
import Expand from '@arcgis/core/widgets/Expand';
import { useMapStore } from '../../store/mapStore';
import type {
  LayerConfig,
  WidgetConfig,
  GraphicConfig,
  SimpleSymbol,
  PointSymbol,
  PictureMarkerSymbol as PictureMarkerSymbolType,
  JsonDataLayerConfig,
} from '../../types';

// Helper to create symbol from config
function createSymbol(symbolConfig: PointSymbol | SimpleSymbol) {
  const { type } = symbolConfig;

  if (type === 'picture-marker') {
    const pms = symbolConfig as PictureMarkerSymbolType;
    return new PictureMarkerSymbol({
      url: pms.url,
      width: pms.width,
      height: pms.height,
      xoffset: pms.xoffset,
      yoffset: pms.yoffset,
    });
  }

  const sms = symbolConfig as SimpleSymbol;
  const { color, size, outline } = sms;

  if (type === 'simple-marker') {
    return new SimpleMarkerSymbol({
      color,
      size: size || 8,
      style: sms.style || 'circle',
      outline: outline ? {
        color: outline.color,
        width: outline.width,
      } : undefined,
    });
  } else if (type === 'simple-line') {
    return new SimpleLineSymbol({
      color,
      width: size || 2,
    });
  } else {
    return new SimpleFillSymbol({
      color,
      outline: outline ? {
        color: outline.color,
        width: outline.width,
      } : undefined,
    });
  }
}

// Helper to create layer from config
function createLayer(config: LayerConfig) {
  const commonProps = {
    id: config.id,
    title: config.title,
    visible: config.visible,
    opacity: config.opacity,
  };

  switch (config.type) {
    case 'FeatureLayer':
      return new FeatureLayer({
        ...commonProps,
        url: config.url,
        definitionExpression: config.definitionExpression,
      });
    case 'MapImageLayer': {
      const mapImageProps: any = {
        ...commonProps,
        url: config.url,
      };
      // Add sublayers if configured
      if (config.sublayers && config.sublayers.length > 0) {
        mapImageProps.sublayers = config.sublayers.map(sub => ({
          id: sub.id,
          visible: sub.visible,
          title: sub.title,
          definitionExpression: sub.definitionExpression,
        }));
      }
      return new MapImageLayer(mapImageProps);
    }
    case 'WMSLayer': {
      const wmsProps: any = {
        ...commonProps,
        url: config.url,
      };
      // Add sublayers if configured
      if (config.wmsSublayers && config.wmsSublayers.length > 0) {
        wmsProps.sublayers = config.wmsSublayers.map(sub => ({
          name: sub.name,
          title: sub.title,
        }));
      }
      return new WMSLayer(wmsProps);
    }
    case 'GeoJSONLayer':
      return new GeoJSONLayer({
        ...commonProps,
        url: config.url,
      });
    case 'VectorTileLayer':
      return new VectorTileLayer({
        ...commonProps,
        url: config.url,
      });
    case 'GraphicsLayer':
      return new GraphicsLayer(commonProps);
    default:
      return null;
  }
}

// Helper to create graphic from config
function createGraphic(config: GraphicConfig): Graphic {
  let geometry;

  if (config.geometry.type === 'point') {
    geometry = new Point({
      longitude: config.geometry.longitude,
      latitude: config.geometry.latitude,
    });
  } else if (config.geometry.type === 'polyline') {
    geometry = new Polyline({
      paths: config.geometry.paths,
    });
  } else {
    geometry = new Polygon({
      rings: config.geometry.rings,
    });
  }

  return new Graphic({
    geometry,
    symbol: createSymbol(config.symbol),
    attributes: config.attributes,
  });
}

// Helper to create widget
function createWidget(
  config: WidgetConfig,
  view: MapView | SceneView,
  graphicsLayer?: GraphicsLayer
) {
  let widget;
  const is3D = view.type === '3d';

  switch (config.type) {
    // Navigation Widgets
    case 'Home':
      widget = new Home({ view });
      break;
    case 'Zoom':
      widget = new Zoom({ view });
      break;
    case 'Compass':
      widget = new Compass({ view });
      break;
    case 'Fullscreen':
      widget = new Fullscreen({ view });
      break;

    // Location Widgets
    case 'Search':
      widget = new Search({ view });
      break;
    case 'Locate':
      widget = new Locate({ view });
      break;
    case 'Track':
      widget = new Track({ view });
      break;
    case 'CoordinateConversion':
      widget = new CoordinateConversion({ view });
      break;

    // Layer Widgets
    case 'Legend':
      widget = new Legend({ view });
      break;
    case 'LayerList':
      widget = new LayerList({ view });
      break;
    case 'BasemapGallery':
      widget = new BasemapGallery({ view });
      break;
    case 'BasemapToggle':
      widget = new BasemapToggle({
        view,
        nextBasemap: 'hybrid'
      });
      break;
    case 'BasemapLayerList':
      widget = new BasemapLayerList({ view });
      break;

    // Editing Widgets
    case 'Sketch':
      widget = graphicsLayer
        ? new Sketch({ view: view as MapView, layer: graphicsLayer })
        : null;
      break;
    case 'Editor':
      widget = new Editor({ view });
      break;

    // Measurement Widgets
    case 'ScaleBar':
      // ScaleBar is 2D only
      if (!is3D) {
        widget = new ScaleBar({ view: view as MapView, unit: 'dual' });
      }
      break;
    case 'DistanceMeasurement2D':
      if (!is3D) {
        widget = new DistanceMeasurement2D({ view: view as MapView });
      }
      break;
    case 'AreaMeasurement2D':
      if (!is3D) {
        widget = new AreaMeasurement2D({ view: view as MapView });
      }
      break;
    case 'ElevationProfile':
      widget = new ElevationProfile({ view });
      break;

    // Utility Widgets
    case 'Print':
      widget = new Print({ view: view as any });
      break;
    case 'Bookmarks':
      widget = new Bookmarks({ view });
      break;
    case 'TimeSlider':
      widget = new TimeSlider({ view: view as any });
      break;
    case 'Swipe':
      // Swipe requires at least one layer, create a placeholder
      if (!is3D && view.map && view.map.layers.length > 0) {
        widget = new Swipe({
          view: view as MapView,
          leadingLayers: [],
          trailingLayers: [],
        });
      }
      break;

    default:
      // For unsupported widgets, return null (will be skipped)
      console.log(`Widget type "${config.type}" not yet supported in preview`);
      return null;
  }

  if (!widget) return null;

  // Wrap in Expand if configured
  if (config.expand) {
    return new Expand({
      view,
      content: widget,
      expandTooltip: config.expandTooltip || config.type,
    });
  }

  return widget;
}

export default function MapPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | SceneView | null>(null);
  const mapRef = useRef<Map | null>(null);
  const [viewReady, setViewReady] = useState(false);

  // Track previous center/zoom to avoid unnecessary goTo calls
  const prevCenterRef = useRef<[number, number] | null>(null);
  const prevZoomRef = useRef<number | null>(null);

  const mapConfig = useMapStore((state) => state.map);
  const layers = useMapStore((state) => state.layers);
  const widgets = useMapStore((state) => state.widgets);
  const graphics = useMapStore((state) => state.graphics);
  const jsonDataLayers = useMapStore((state) => state.jsonDataLayers);

  // Create basemap based on config
  const createBasemap = () => {
    if (mapConfig.basemap === 'none') {
      // No basemap - return undefined, will set background color on view
      return undefined;
    }

    if (mapConfig.basemap === 'custom' && mapConfig.customBasemap) {
      const { type, url, title, sublayers } = mapConfig.customBasemap;

      if (!url) return undefined;

      let basemapLayer;
      switch (type) {
        case 'wms':
          basemapLayer = new WMSLayer({
            url,
            title: title || 'Custom WMS',
            sublayers: sublayers?.map((name) => ({ name })),
          });
          break;
        case 'wmts':
          basemapLayer = new WMTSLayer({
            url,
            title: title || 'Custom WMTS',
          });
          break;
        case 'tile':
          // Check if it's an XYZ template URL
          if (url.includes('{z}') || url.includes('{x}') || url.includes('{y}')) {
            basemapLayer = new WebTileLayer({
              urlTemplate: url,
              title: title || 'Custom Tiles',
            });
          } else {
            basemapLayer = new TileLayer({
              url,
              title: title || 'Custom Tiles',
            });
          }
          break;
        case 'vector-tile':
          basemapLayer = new VectorTileLayer({
            url,
            title: title || 'Custom Vector Tiles',
          });
          break;
        default:
          return undefined;
      }

      return new Basemap({
        baseLayers: [basemapLayer],
        title: title || 'Custom Basemap',
      });
    }

    // Standard ArcGIS basemap
    return mapConfig.basemap;
  };

  // Initialize map
  useEffect(() => {
    if (!containerRef.current) return;

    setViewReady(false);

    // Create basemap
    const basemap = createBasemap();

    // Create map
    const map = new Map({
      basemap: basemap as any,
    });
    mapRef.current = map;

    // Create view based on type
    const ViewClass = mapConfig.viewType === '3d' ? SceneView : MapView;
    const viewOptions: any = {
      container: containerRef.current,
      map,
      center: mapConfig.center,
      zoom: mapConfig.zoom,
    };

    // Set background color for 'none' basemap
    if (mapConfig.basemap === 'none' && mapConfig.backgroundColor) {
      viewOptions.background = {
        color: new Color([
          mapConfig.backgroundColor[0],
          mapConfig.backgroundColor[1],
          mapConfig.backgroundColor[2],
          1,
        ]),
      };
    }

    const view = new ViewClass(viewOptions);
    viewRef.current = view;

    // Store initial values
    prevCenterRef.current = mapConfig.center;
    prevZoomRef.current = mapConfig.zoom;

    // Wait for view to be ready
    view.when(() => {
      setViewReady(true);
    }).catch((err) => {
      console.error('View failed to load:', err);
    });

    // Cleanup
    return () => {
      setViewReady(false);
      view.destroy();
      viewRef.current = null;
      mapRef.current = null;
    };
  }, [mapConfig.viewType]);

  // Update basemap
  useEffect(() => {
    if (!mapRef.current || !viewReady) return;

    const basemap = createBasemap();
    mapRef.current.basemap = basemap as any;

    // Update background color for 'none' basemap
    if (viewRef.current && mapConfig.basemap === 'none' && mapConfig.backgroundColor) {
      (viewRef.current as any).background = {
        color: new Color([
          mapConfig.backgroundColor[0],
          mapConfig.backgroundColor[1],
          mapConfig.backgroundColor[2],
          1,
        ]),
      };
    }
  }, [mapConfig.basemap, mapConfig.customBasemap, mapConfig.backgroundColor, viewReady]);

  // Update center and zoom
  useEffect(() => {
    if (!viewRef.current || !viewReady) return;

    // Check if center or zoom actually changed
    const centerChanged =
      !prevCenterRef.current ||
      prevCenterRef.current[0] !== mapConfig.center[0] ||
      prevCenterRef.current[1] !== mapConfig.center[1];
    const zoomChanged =
      prevZoomRef.current === null || prevZoomRef.current !== mapConfig.zoom;

    if (centerChanged || zoomChanged) {
      prevCenterRef.current = mapConfig.center;
      prevZoomRef.current = mapConfig.zoom;

      viewRef.current.goTo({
        center: mapConfig.center,
        zoom: mapConfig.zoom,
      }).catch((err) => {
        // Ignore abort errors from rapid changes
        if (err.name !== 'AbortError') {
          console.error('goTo failed:', err);
        }
      });
    }
  }, [mapConfig.center, mapConfig.zoom, viewReady]);

  // Update layers
  useEffect(() => {
    if (!mapRef.current || !viewReady) return;

    // Remove all layers except graphics layer and JSON data layers
    const existingLayers = mapRef.current.layers.toArray();
    existingLayers.forEach((layer) => {
      if (layer.id !== 'graphics-layer' && !layer.id.startsWith('json-data-layer-')) {
        mapRef.current?.remove(layer);
      }
    });

    // Add layers in order
    const sortedLayers = [...layers].sort((a, b) => a.order - b.order);
    sortedLayers.forEach((layerConfig) => {
      const layer = createLayer(layerConfig);
      if (layer) {
        mapRef.current?.add(layer);
      }
    });
  }, [layers, viewReady]);

  // Update graphics
  useEffect(() => {
    if (!mapRef.current || !viewReady) return;

    // Find or create graphics layer
    let graphicsLayer = mapRef.current.findLayerById(
      'graphics-layer'
    ) as GraphicsLayer;

    if (!graphicsLayer) {
      graphicsLayer = new GraphicsLayer({ id: 'graphics-layer' });
      mapRef.current.add(graphicsLayer);
    }

    // Clear and add graphics
    graphicsLayer.removeAll();
    graphics.forEach((graphicConfig) => {
      const graphic = createGraphic(graphicConfig);
      graphicsLayer.add(graphic);
    });
  }, [graphics, viewReady]);

  // Update JSON data layers
  useEffect(() => {
    if (!mapRef.current || !viewReady) return;

    // Remove existing JSON data layers
    const existingLayers = mapRef.current.layers.toArray();
    existingLayers.forEach((layer) => {
      if (layer.id.startsWith('json-data-layer-')) {
        mapRef.current?.remove(layer);
      }
    });

    // Create and add JSON data layers
    jsonDataLayers.forEach((layerConfig: JsonDataLayerConfig) => {
      const graphicsLayer = new GraphicsLayer({
        id: `json-data-layer-${layerConfig.id}`,
        title: layerConfig.title,
      });

      // Create graphics from JSON data
      layerConfig.data.forEach((item) => {
        const lat = item[layerConfig.fieldMapping.latitudeField];
        const lon = item[layerConfig.fieldMapping.longitudeField];

        if (lat == null || lon == null || typeof lat !== 'number' || typeof lon !== 'number') {
          return;
        }

        // Determine symbol based on renderer
        let symbol;
        if (
          layerConfig.renderer?.type === 'unique-value' &&
          layerConfig.renderer.field &&
          layerConfig.renderer.uniqueValueInfos
        ) {
          const value = item[layerConfig.renderer.field];
          const matchedInfo = layerConfig.renderer.uniqueValueInfos.find(
            (info) => info.value === value
          );
          symbol = matchedInfo
            ? createSymbol(matchedInfo.symbol)
            : createSymbol(layerConfig.symbol);
        } else {
          symbol = createSymbol(layerConfig.symbol);
        }

        // Build attributes
        const attributes: Record<string, unknown> = {};
        layerConfig.fieldMapping.attributeFields.forEach((field) => {
          attributes[field] = item[field];
        });

        const graphic = new Graphic({
          geometry: new Point({
            longitude: lon,
            latitude: lat,
          }),
          symbol,
          attributes,
        });

        graphicsLayer.add(graphic);
      });

      mapRef.current?.add(graphicsLayer);
    });
  }, [jsonDataLayers, viewReady]);

  // Update widgets
  useEffect(() => {
    const view = viewRef.current;
    const map = mapRef.current;

    if (!view || !map || !viewReady) return;

    // Remove existing widgets from all positions
    view.ui.empty('top-left');
    view.ui.empty('top-right');
    view.ui.empty('bottom-left');
    view.ui.empty('bottom-right');

    // Find or create graphics layer for Sketch widget
    let graphicsLayer = map.findLayerById('graphics-layer') as GraphicsLayer;
    if (!graphicsLayer) {
      graphicsLayer = new GraphicsLayer({ id: 'graphics-layer' });
      map.add(graphicsLayer);
    }

    // Add widgets
    let addedCount = 0;
    widgets.forEach((widgetConfig) => {
      try {
        const widget = createWidget(widgetConfig, view, graphicsLayer);
        if (widget) {
          // Handle 'bottom' position - use 'bottom-left' for full-width widgets
          const position = widgetConfig.position === 'bottom'
            ? 'bottom-left'
            : widgetConfig.position;
          view.ui.add(widget, position);
          addedCount++;
        }
      } catch (err) {
        console.error(`Failed to create widget ${widgetConfig.type}:`, err);
      }
    });

    console.log('Widgets updated:', addedCount, 'of', widgets.length, 'widgets added');
  }, [widgets, graphics, viewReady]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        bgcolor: '#1a1a1a',
      }}
    />
  );
}
