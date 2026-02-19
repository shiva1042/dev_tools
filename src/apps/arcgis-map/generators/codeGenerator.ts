import type {
  MapState,
  LayerConfig,
  WidgetConfig,
  GraphicConfig,
  PopupTemplateConfig,
  JsonDataLayerConfig,
  PointSymbol,
  SimpleSymbol,
  PictureMarkerSymbol,
} from '../types';

// Generate imports based on what's used
function generateImports(state: MapState): string {
  const imports: string[] = [
    'import { useEffect, useRef } from "react";',
    'import Map from "@arcgis/core/Map";',
  ];

  // Basemap imports for custom/none/local-image
  if (state.map.basemap === 'none') {
    imports.push('import Color from "@arcgis/core/Color";');
  }

  if (state.map.basemap === 'local-image') {
    imports.push('import MediaLayer from "@arcgis/core/layers/MediaLayer";');
    imports.push('import ImageElement from "@arcgis/core/layers/support/ImageElement";');
    imports.push('import ExtentAndRotationGeoreference from "@arcgis/core/layers/support/ExtentAndRotationGeoreference";');
    imports.push('import Extent from "@arcgis/core/geometry/Extent";');
  }

  if (state.map.basemap === 'custom' && state.map.customBasemap) {
    imports.push('import Basemap from "@arcgis/core/Basemap";');
    switch (state.map.customBasemap.type) {
      case 'wms':
        imports.push('import WMSLayer from "@arcgis/core/layers/WMSLayer";');
        break;
      case 'wmts':
        imports.push('import WMTSLayer from "@arcgis/core/layers/WMTSLayer";');
        break;
      case 'tile':
        if (state.map.customBasemap.url.includes('{z}')) {
          imports.push('import WebTileLayer from "@arcgis/core/layers/WebTileLayer";');
        } else {
          imports.push('import TileLayer from "@arcgis/core/layers/TileLayer";');
        }
        break;
      case 'vector-tile':
        imports.push('import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer";');
        break;
    }
  }

  // View imports
  if (state.map.viewType === '2d') {
    imports.push('import MapView from "@arcgis/core/views/MapView";');
  } else {
    imports.push('import SceneView from "@arcgis/core/views/SceneView";');
  }

  // Layer imports
  const layerTypes = new Set(state.layers.map((l) => l.type));
  layerTypes.forEach((type) => {
    imports.push(`import ${type} from "@arcgis/core/layers/${type}";`);
  });

  // Graphics imports
  const hasGraphics = state.graphics.length > 0;
  const hasJsonDataLayers = state.jsonDataLayers && state.jsonDataLayers.length > 0;

  if (hasGraphics || hasJsonDataLayers) {
    imports.push('import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";');
    imports.push('import Graphic from "@arcgis/core/Graphic";');
    imports.push('import Point from "@arcgis/core/geometry/Point";');

    // Collect all symbol types from graphics
    const symbolTypes = new Set<string>();

    if (hasGraphics) {
      const geometryTypes = new Set(state.graphics.map((g) => g.geometry.type));
      geometryTypes.forEach((type) => {
        const capitalized = type.charAt(0).toUpperCase() + type.slice(1);
        imports.push(`import ${capitalized} from "@arcgis/core/geometry/${capitalized}";`);
      });

      state.graphics.forEach((g) => {
        if (g.symbol.type === 'simple-marker') symbolTypes.add('SimpleMarkerSymbol');
        else if (g.symbol.type === 'simple-line') symbolTypes.add('SimpleLineSymbol');
        else if (g.symbol.type === 'simple-fill') symbolTypes.add('SimpleFillSymbol');
        else if (g.symbol.type === 'picture-marker') symbolTypes.add('PictureMarkerSymbol');
      });
    }

    // Collect symbol types from JSON data layers
    if (hasJsonDataLayers) {
      state.jsonDataLayers.forEach((layer) => {
        if (layer.symbol.type === 'simple-marker') symbolTypes.add('SimpleMarkerSymbol');
        else if (layer.symbol.type === 'picture-marker') symbolTypes.add('PictureMarkerSymbol');

        // Check renderer unique values
        if (layer.renderer?.uniqueValueInfos) {
          layer.renderer.uniqueValueInfos.forEach((info) => {
            if (info.symbol.type === 'simple-marker') symbolTypes.add('SimpleMarkerSymbol');
            else if (info.symbol.type === 'picture-marker') symbolTypes.add('PictureMarkerSymbol');
          });
        }
      });
    }

    symbolTypes.forEach((type) => {
      imports.push(`import ${type} from "@arcgis/core/symbols/${type}";`);
    });
  }

  // Widget imports
  const widgetTypes = new Set(state.widgets.map((w) => w.type));
  widgetTypes.forEach((type) => {
    imports.push(`import ${type} from "@arcgis/core/widgets/${type}";`);
  });

  if (state.widgets.some((w) => w.expand)) {
    imports.push('import Expand from "@arcgis/core/widgets/Expand";');
  }

  return imports.join('\n');
}

// Generate layer code
function generateLayerCode(layer: LayerConfig): string {
  const props: string[] = [
    `    id: "${layer.id}"`,
    `    title: "${layer.title}"`,
    `    visible: ${layer.visible}`,
    `    opacity: ${layer.opacity}`,
  ];

  if (layer.url) {
    props.push(`    url: "${layer.url}"`);
  }

  if (layer.definitionExpression) {
    props.push(`    definitionExpression: "${layer.definitionExpression}"`);
  }

  // Add sublayers configuration for MapImageLayer
  if (layer.type === 'MapImageLayer' && layer.sublayers && layer.sublayers.length > 0) {
    const sublayerCode = layer.sublayers.map(sub => {
      const subProps = [`id: ${sub.id}`, `visible: ${sub.visible}`];
      if (sub.title) {
        subProps.push(`title: "${sub.title}"`);
      }
      if (sub.definitionExpression) {
        subProps.push(`definitionExpression: "${sub.definitionExpression}"`);
      }
      return `      { ${subProps.join(', ')} }`;
    }).join(',\n');
    props.push(`    sublayers: [\n${sublayerCode}\n    ]`);
  }

  // Add sublayers configuration for WMSLayer
  if (layer.type === 'WMSLayer' && layer.wmsSublayers && layer.wmsSublayers.length > 0) {
    const sublayerCode = layer.wmsSublayers.map(sub => {
      const subProps = [`name: "${sub.name}"`];
      if (sub.title) {
        subProps.push(`title: "${sub.title}"`);
      }
      return `      { ${subProps.join(', ')} }`;
    }).join(',\n');
    props.push(`    sublayers: [\n${sublayerCode}\n    ]`);
  }

  return `  const ${layer.id.replace(/-/g, '_')} = new ${layer.type}({
${props.join(',\n')}
  });`;
}

// Generate symbol code
function generateSymbolCode(symbol: PointSymbol | SimpleSymbol, indent: string = '    '): string {
  if (symbol.type === 'picture-marker') {
    const pms = symbol as PictureMarkerSymbol;
    const props = [
      `url: "${pms.url}"`,
      `width: ${pms.width}`,
      `height: ${pms.height}`,
    ];
    if (pms.xoffset) props.push(`xoffset: ${pms.xoffset}`);
    if (pms.yoffset) props.push(`yoffset: ${pms.yoffset}`);
    return `new PictureMarkerSymbol({
${indent}  ${props.join(`,\n${indent}  `)}
${indent}})`;
  }

  const sms = symbol as SimpleSymbol;
  const symbolClass =
    sms.type === 'simple-marker'
      ? 'SimpleMarkerSymbol'
      : sms.type === 'simple-line'
        ? 'SimpleLineSymbol'
        : 'SimpleFillSymbol';

  const symbolProps = [
    `color: [${sms.color.join(', ')}]`,
  ];

  if (sms.size) {
    symbolProps.push(`size: ${sms.size}`);
  }

  if (sms.style && sms.type === 'simple-marker') {
    symbolProps.push(`style: "${sms.style}"`);
  }

  if (sms.outline) {
    symbolProps.push(
      `outline: { color: [${sms.outline.color.join(', ')}], width: ${sms.outline.width} }`
    );
  }

  return `new ${symbolClass}({
${indent}  ${symbolProps.join(`,\n${indent}  `)}
${indent}})`;
}

// Generate graphic code
function generateGraphicCode(graphic: GraphicConfig, index: number): string {
  let geometryCode: string;

  if (graphic.geometry.type === 'point') {
    geometryCode = `new Point({
      longitude: ${graphic.geometry.longitude},
      latitude: ${graphic.geometry.latitude}
    })`;
  } else if (graphic.geometry.type === 'polyline') {
    geometryCode = `new Polyline({
      paths: ${JSON.stringify(graphic.geometry.paths)}
    })`;
  } else {
    geometryCode = `new Polygon({
      rings: ${JSON.stringify(graphic.geometry.rings)}
    })`;
  }

  const symbolCode = generateSymbolCode(graphic.symbol, '    ');

  return `  const graphic${index} = new Graphic({
    geometry: ${geometryCode},
    symbol: ${symbolCode}
  });`;
}

// Generate JSON data layer code
function generateJsonDataLayerCode(layer: JsonDataLayerConfig, index: number): string {
  const varName = `jsonDataLayer${index}`;
  const dataVarName = `jsonData${index}`;

  // Generate data array (truncated for readability)
  const dataPreview = layer.data.slice(0, 5);
  const hasMore = layer.data.length > 5;

  let code = `  // JSON Data Layer: ${layer.title}
  const ${dataVarName} = ${JSON.stringify(dataPreview, null, 2).split('\n').join('\n  ')}${hasMore ? `\n  // ... and ${layer.data.length - 5} more items (data truncated for readability)` : ''};

  const ${varName} = new GraphicsLayer({
    id: "${layer.id}",
    title: "${layer.title}"
  });

  // Add graphics from JSON data
  ${dataVarName}.forEach((item: any) => {
    const lat = item["${layer.fieldMapping.latitudeField}"];
    const lon = item["${layer.fieldMapping.longitudeField}"];
    if (lat == null || lon == null) return;
`;

  // Generate renderer logic
  if (layer.renderer?.type === 'unique-value' && layer.renderer.field && layer.renderer.uniqueValueInfos) {
    code += `
    // Unique value renderer
    const value = item["${layer.renderer.field}"];
    let symbol;
    switch (value) {
`;
    layer.renderer.uniqueValueInfos.forEach((info) => {
      const symbolCode = generateSymbolCode(info.symbol, '        ');
      code += `      case ${typeof info.value === 'string' ? `"${info.value}"` : info.value}:
        symbol = ${symbolCode};
        break;
`;
    });

    const defaultSymbolCode = generateSymbolCode(layer.symbol, '        ');
    code += `      default:
        symbol = ${defaultSymbolCode};
    }
`;
  } else {
    const symbolCode = generateSymbolCode(layer.symbol, '      ');
    code += `    const symbol = ${symbolCode};
`;
  }

  code += `
    const graphic = new Graphic({
      geometry: new Point({ longitude: lon, latitude: lat }),
      symbol,
      attributes: {
        ${layer.fieldMapping.attributeFields.map((f) => `"${f}": item["${f}"]`).join(',\n        ')}
      }
    });
    ${varName}.add(graphic);
  });`;

  return code;
}

// Generate widget code
function generateWidgetCode(widget: WidgetConfig): string {
  let widgetCode: string;

  switch (widget.type) {
    case 'Home':
    case 'Compass':
      widgetCode = `new ${widget.type}({ view })`;
      break;
    case 'ScaleBar':
      widgetCode = `new ScaleBar({ view, unit: "dual" })`;
      break;
    case 'Legend':
    case 'LayerList':
    case 'BasemapGallery':
    case 'Search':
      widgetCode = `new ${widget.type}({ view })`;
      break;
    case 'Sketch':
      widgetCode = `new Sketch({ view, layer: graphicsLayer })`;
      break;
    default:
      widgetCode = `new ${widget.type}({ view })`;
  }

  if (widget.expand) {
    return `    const ${widget.type.toLowerCase()}Widget = ${widgetCode};
    const ${widget.type.toLowerCase()}Expand = new Expand({
      view,
      content: ${widget.type.toLowerCase()}Widget,
      expandTooltip: "${widget.expandTooltip || widget.type}"
    });
    view.ui.add(${widget.type.toLowerCase()}Expand, "${widget.position}");`;
  }

  return `    view.ui.add(${widgetCode}, "${widget.position}");`;
}

// Generate popup template code
function generatePopupTemplateCode(template: PopupTemplateConfig): string {
  const props: string[] = [
    `    title: "${template.title}"`,
  ];

  if (template.content) {
    props.push(`    content: \`${template.content}\``);
  }

  if (template.fieldInfos && template.fieldInfos.length > 0) {
    const fieldInfosStr = template.fieldInfos
      .map(
        (f) =>
          `      { fieldName: "${f.fieldName}", label: "${f.label || f.fieldName}", visible: ${f.visible} }`
      )
      .join(',\n');
    props.push(`    fieldInfos: [\n${fieldInfosStr}\n    ]`);
  }

  if (template.expressionInfos && template.expressionInfos.length > 0) {
    const exprStr = template.expressionInfos
      .map(
        (e) =>
          `      { name: "${e.name}", title: "${e.title}", expression: "${e.expression}" }`
      )
      .join(',\n');
    props.push(`    expressionInfos: [\n${exprStr}\n    ]`);
  }

  return `const popupTemplate_${template.id.replace(/-/g, '_')} = {
${props.join(',\n')}
  };`;
}

// Generate main Map component
export function generateMapComponent(state: MapState): string {
  const imports = generateImports(state);
  const viewType = state.map.viewType === '2d' ? 'MapView' : 'SceneView';

  // Generate layers
  const layerCode = state.layers.map(generateLayerCode).join('\n\n');
  const layerNames = state.layers.map((l) => l.id.replace(/-/g, '_')).join(', ');

  // Generate graphics
  const graphicsCode =
    state.graphics.length > 0
      ? state.graphics.map((g, i) => generateGraphicCode(g, i)).join('\n\n')
      : '';
  const graphicNames = state.graphics.map((_, i) => `graphic${i}`).join(', ');

  // Generate JSON data layers
  const jsonDataLayers = state.jsonDataLayers || [];
  const jsonLayerCode = jsonDataLayers.length > 0
    ? jsonDataLayers.map((l, i) => generateJsonDataLayerCode(l, i)).join('\n\n')
    : '';
  const jsonLayerNames = jsonDataLayers.map((_, i) => `jsonDataLayer${i}`).join(', ');

  // Generate widgets
  const widgetCode = state.widgets.map(generateWidgetCode).join('\n');

  // Generate popup templates
  const popupCode = state.popupTemplates.map(generatePopupTemplateCode).join('\n\n');

  // Generate basemap code
  let basemapCode = '';
  let mapBasemapArg = `"${state.map.basemap}"`;

  if (state.map.basemap === 'none' || state.map.basemap === 'local-image') {
    mapBasemapArg = 'undefined';
  } else if (state.map.basemap === 'custom' && state.map.customBasemap) {
    const { type, url, title, sublayers } = state.map.customBasemap;
    let layerCode = '';

    switch (type) {
      case 'wms':
        layerCode = `new WMSLayer({
      url: "${url}",
      title: "${title || 'Custom WMS'}"${sublayers?.length ? `,
      sublayers: [${sublayers.map((s) => `{ name: "${s}" }`).join(', ')}]` : ''}
    })`;
        break;
      case 'wmts':
        layerCode = `new WMTSLayer({
      url: "${url}",
      title: "${title || 'Custom WMTS'}"
    })`;
        break;
      case 'tile':
        if (url.includes('{z}')) {
          layerCode = `new WebTileLayer({
      urlTemplate: "${url}",
      title: "${title || 'Custom Tiles'}"
    })`;
        } else {
          layerCode = `new TileLayer({
      url: "${url}",
      title: "${title || 'Custom Tiles'}"
    })`;
        }
        break;
      case 'vector-tile':
        layerCode = `new VectorTileLayer({
      url: "${url}",
      title: "${title || 'Custom Vector Tiles'}"
    })`;
        break;
    }

    basemapCode = `    // Create custom basemap
    const customBasemap = new Basemap({
      baseLayers: [${layerCode}],
      title: "${title || 'Custom Basemap'}"
    });

`;
    mapBasemapArg = 'customBasemap';
  }

  // Generate local image MediaLayer code
  let localImageCode = '';
  if (state.map.basemap === 'local-image' && state.map.localImage) {
    const { path, name, extent } = state.map.localImage;
    localImageCode = `
    // Create local map image layer
    const mapImageElement = new ImageElement({
      image: "${path}",
      georeference: new ExtentAndRotationGeoreference({
        extent: new Extent({
          xmin: ${extent.xmin},
          ymin: ${extent.ymin},
          xmax: ${extent.xmax},
          ymax: ${extent.ymax},
          spatialReference: { wkid: 4326 }
        })
      })
    });

    const localBasemapLayer = new MediaLayer({
      source: [mapImageElement],
      title: "${name}",
      id: "local-basemap-layer"
    });
    map.add(localBasemapLayer, 0);
`;
  }

  // Generate view background option for 'none'/'local-image' basemap
  let viewBackgroundCode = '';
  if (state.map.basemap === 'none' && state.map.backgroundColor) {
    const [r, g, b] = state.map.backgroundColor;
    viewBackgroundCode = `,
      background: {
        color: new Color([${r}, ${g}, ${b}, 1])
      }`;
  } else if (state.map.basemap === 'local-image') {
    viewBackgroundCode = `,
      background: {
        color: [30, 30, 30, 1] as any
      }`;
  }

  return `${imports}

// Popup templates
${popupCode || '// No popup templates configured'}

/**
 * ArcGIS Map Component
 * Generated by ArcGIS React Builder
 */
export default function ArcGISMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

${basemapCode}    // Create map
    const map = new Map({
      basemap: ${mapBasemapArg}
    });
${localImageCode}
    // Create layers
${layerCode || '    // No layers configured'}

    // Add layers to map
${state.layers.length > 0 ? `    map.addMany([${layerNames}]);` : '    // No layers to add'}

${
  state.graphics.length > 0
    ? `    // Create graphics layer
    const graphicsLayer = new GraphicsLayer({ id: "graphics-layer" });
    map.add(graphicsLayer);

    // Create graphics
${graphicsCode}

    // Add graphics to layer
    graphicsLayer.addMany([${graphicNames}]);`
    : '    // No graphics configured'
}

${
  jsonDataLayers.length > 0
    ? `    // Create JSON data layers
${jsonLayerCode}

    // Add JSON data layers to map
    map.addMany([${jsonLayerNames}]);`
    : '    // No JSON data layers configured'
}

    // Create view
    const view = new ${viewType}({
      container: mapRef.current,
      map,
      center: [${state.map.center[0]}, ${state.map.center[1]}],
      zoom: ${state.map.zoom}${viewBackgroundCode}
    });

    // Add widgets
    view.when(() => {
${widgetCode || '      // No widgets configured'}
    });

    // Cleanup
    return () => {
      view.destroy();
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "100%"
      }}
    />
  );
}
`;
}

// Generate App.tsx wrapper
export function generateAppComponent(): string {
  return `import ArcGISMap from "./ArcGISMap";
import "@arcgis/core/assets/esri/themes/dark/main.css";

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ArcGISMap />
    </div>
  );
}
`;
}

// Generate index.tsx
export function generateIndexFile(): string {
  return `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
}

// Generate index.css
export function generateIndexCss(): string {
  return `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body, #root {
  width: 100%;
  height: 100%;
}
`;
}

// Generate package.json
export function generatePackageJson(_state: MapState): string {
  return JSON.stringify(
    {
      name: 'arcgis-react-map',
      version: '1.0.0',
      private: true,
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'tsc && vite build',
        preview: 'vite preview',
      },
      dependencies: {
        '@arcgis/core': '^4.28.0',
        react: '^18.2.0',
        'react-dom': '^18.2.0',
      },
      devDependencies: {
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
        '@vitejs/plugin-react': '^4.0.0',
        typescript: '^5.0.0',
        vite: '^5.0.0',
      },
    },
    null,
    2
  );
}

// Generate vite.config.ts
export function generateViteConfig(): string {
  return `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["@arcgis/core"]
  }
});
`;
}

// Generate tsconfig.json
export function generateTsConfig(): string {
  return JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2020',
        useDefineForClassFields: true,
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-jsx',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
      },
      include: ['src'],
      references: [{ path: './tsconfig.node.json' }],
    },
    null,
    2
  );
}

// Generate index.html
export function generateIndexHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ArcGIS React Map</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

// Generate map configuration JSON
export function generateConfigJson(state: MapState): string {
  return JSON.stringify(state, null, 2);
}

// ============================================================================
// JavaScript Wrapper Style Code Generator
// ============================================================================

// Generate JS wrapper-style imports (AMD/require style)
function generateJSWrapperImports(state: MapState): string {
  const modules: string[] = [
    '"esri/Map"',
  ];

  // Local image basemap imports
  if (state.map.basemap === 'local-image') {
    modules.push('"esri/layers/MediaLayer"');
    modules.push('"esri/layers/support/ImageElement"');
    modules.push('"esri/layers/support/ExtentAndRotationGeoreference"');
    modules.push('"esri/geometry/Extent"');
  }

  // Basemap imports for custom
  if (state.map.basemap === 'custom' && state.map.customBasemap) {
    modules.push('"esri/Basemap"');
    switch (state.map.customBasemap.type) {
      case 'wms':
        modules.push('"esri/layers/WMSLayer"');
        break;
      case 'wmts':
        modules.push('"esri/layers/WMTSLayer"');
        break;
      case 'tile':
        if (state.map.customBasemap.url.includes('{z}')) {
          modules.push('"esri/layers/WebTileLayer"');
        } else {
          modules.push('"esri/layers/TileLayer"');
        }
        break;
      case 'vector-tile':
        modules.push('"esri/layers/VectorTileLayer"');
        break;
    }
  }

  // View imports
  if (state.map.viewType === '2d') {
    modules.push('"esri/views/MapView"');
  } else {
    modules.push('"esri/views/SceneView"');
  }

  // Layer imports
  const layerTypes = new Set(state.layers.map((l) => l.type));
  layerTypes.forEach((type) => {
    modules.push(`"esri/layers/${type}"`);
  });

  // Graphics imports
  const hasGraphics = state.graphics.length > 0;
  const hasJsonDataLayers = state.jsonDataLayers && state.jsonDataLayers.length > 0;

  if (hasGraphics || hasJsonDataLayers) {
    modules.push('"esri/layers/GraphicsLayer"');
    modules.push('"esri/Graphic"');
    modules.push('"esri/geometry/Point"');

    const symbolTypes = new Set<string>();
    const geometryTypes = new Set<string>();

    if (hasGraphics) {
      state.graphics.forEach((g) => {
        geometryTypes.add(g.geometry.type);
        if (g.symbol.type === 'simple-marker') symbolTypes.add('SimpleMarkerSymbol');
        else if (g.symbol.type === 'simple-line') symbolTypes.add('SimpleLineSymbol');
        else if (g.symbol.type === 'simple-fill') symbolTypes.add('SimpleFillSymbol');
        else if (g.symbol.type === 'picture-marker') symbolTypes.add('PictureMarkerSymbol');
      });

      geometryTypes.forEach((type) => {
        const capitalized = type.charAt(0).toUpperCase() + type.slice(1);
        modules.push(`"esri/geometry/${capitalized}"`);
      });
    }

    if (hasJsonDataLayers) {
      state.jsonDataLayers.forEach((layer) => {
        if (layer.symbol.type === 'simple-marker') symbolTypes.add('SimpleMarkerSymbol');
        else if (layer.symbol.type === 'picture-marker') symbolTypes.add('PictureMarkerSymbol');
        if (layer.renderer?.uniqueValueInfos) {
          layer.renderer.uniqueValueInfos.forEach((info) => {
            if (info.symbol.type === 'simple-marker') symbolTypes.add('SimpleMarkerSymbol');
            else if (info.symbol.type === 'picture-marker') symbolTypes.add('PictureMarkerSymbol');
          });
        }
      });
    }

    symbolTypes.forEach((type) => {
      modules.push(`"esri/symbols/${type}"`);
    });
  }

  // Widget imports
  const widgetTypes = new Set(state.widgets.map((w) => w.type));
  widgetTypes.forEach((type) => {
    modules.push(`"esri/widgets/${type}"`);
  });

  if (state.widgets.some((w) => w.expand)) {
    modules.push('"esri/widgets/Expand"');
  }

  return modules.join(',\n    ');
}

// Generate JS wrapper module names
function generateJSWrapperModuleNames(state: MapState): string {
  const names: string[] = ['Map'];

  if (state.map.basemap === 'local-image') {
    names.push('MediaLayer', 'ImageElement', 'ExtentAndRotationGeoreference', 'Extent');
  }

  if (state.map.basemap === 'custom' && state.map.customBasemap) {
    names.push('Basemap');
    switch (state.map.customBasemap.type) {
      case 'wms': names.push('WMSLayer'); break;
      case 'wmts': names.push('WMTSLayer'); break;
      case 'tile':
        names.push(state.map.customBasemap.url.includes('{z}') ? 'WebTileLayer' : 'TileLayer');
        break;
      case 'vector-tile': names.push('VectorTileLayer'); break;
    }
  }

  names.push(state.map.viewType === '2d' ? 'MapView' : 'SceneView');

  const layerTypes = new Set(state.layers.map((l) => l.type));
  layerTypes.forEach((type) => names.push(type));

  const hasGraphics = state.graphics.length > 0;
  const hasJsonDataLayers = state.jsonDataLayers && state.jsonDataLayers.length > 0;

  if (hasGraphics || hasJsonDataLayers) {
    names.push('GraphicsLayer', 'Graphic', 'Point');

    const symbolTypes = new Set<string>();
    const geometryTypes = new Set<string>();

    if (hasGraphics) {
      state.graphics.forEach((g) => {
        geometryTypes.add(g.geometry.type);
        if (g.symbol.type === 'simple-marker') symbolTypes.add('SimpleMarkerSymbol');
        else if (g.symbol.type === 'simple-line') symbolTypes.add('SimpleLineSymbol');
        else if (g.symbol.type === 'simple-fill') symbolTypes.add('SimpleFillSymbol');
        else if (g.symbol.type === 'picture-marker') symbolTypes.add('PictureMarkerSymbol');
      });
      geometryTypes.forEach((type) => {
        names.push(type.charAt(0).toUpperCase() + type.slice(1));
      });
    }

    if (hasJsonDataLayers) {
      state.jsonDataLayers.forEach((layer) => {
        if (layer.symbol.type === 'simple-marker') symbolTypes.add('SimpleMarkerSymbol');
        else if (layer.symbol.type === 'picture-marker') symbolTypes.add('PictureMarkerSymbol');
        if (layer.renderer?.uniqueValueInfos) {
          layer.renderer.uniqueValueInfos.forEach((info) => {
            if (info.symbol.type === 'simple-marker') symbolTypes.add('SimpleMarkerSymbol');
            else if (info.symbol.type === 'picture-marker') symbolTypes.add('PictureMarkerSymbol');
          });
        }
      });
    }

    symbolTypes.forEach((type) => names.push(type));
  }

  const widgetTypes = new Set(state.widgets.map((w) => w.type));
  widgetTypes.forEach((type) => names.push(type));

  if (state.widgets.some((w) => w.expand)) {
    names.push('Expand');
  }

  return names.join(', ');
}

// Generate JS symbol code
function generateJSSymbolCode(symbol: PointSymbol | SimpleSymbol, indent: string = '      '): string {
  if (symbol.type === 'picture-marker') {
    const pms = symbol as PictureMarkerSymbol;
    return `{
${indent}  type: "picture-marker",
${indent}  url: "${pms.url}",
${indent}  width: ${pms.width},
${indent}  height: ${pms.height}${pms.xoffset ? `,\n${indent}  xoffset: ${pms.xoffset}` : ''}${pms.yoffset ? `,\n${indent}  yoffset: ${pms.yoffset}` : ''}
${indent}}`;
  }

  const sms = symbol as SimpleSymbol;
  const props = [`type: "${sms.type}"`, `color: [${sms.color.join(', ')}]`];
  if (sms.size) props.push(`size: ${sms.size}`);
  if (sms.style && sms.type === 'simple-marker') props.push(`style: "${sms.style}"`);
  if (sms.outline) {
    props.push(`outline: { color: [${sms.outline.color.join(', ')}], width: ${sms.outline.width} }`);
  }

  return `{\n${indent}  ${props.join(`,\n${indent}  `)}\n${indent}}`;
}

// Generate JavaScript Wrapper Style code
export function generateJSWrapperCode(state: MapState): string {
  const viewType = state.map.viewType === '2d' ? 'MapView' : 'SceneView';
  const imports = generateJSWrapperImports(state);
  const moduleNames = generateJSWrapperModuleNames(state);

  // Generate createBasemap function if custom
  let createBasemapFn = '';
  let basemapArg = `"${state.map.basemap}"`;

  if (state.map.basemap === 'none' || state.map.basemap === 'local-image') {
    basemapArg = 'null';
  } else if (state.map.basemap === 'custom' && state.map.customBasemap) {
    const { type, url, title, sublayers } = state.map.customBasemap;
    let layerCode = '';

    switch (type) {
      case 'wms':
        layerCode = `new WMSLayer({
        url: "${url}",
        title: "${title || 'Custom WMS'}"${sublayers?.length ? `,
        sublayers: [${sublayers.map((s) => `{ name: "${s}" }`).join(', ')}]` : ''}
      })`;
        break;
      case 'wmts':
        layerCode = `new WMTSLayer({ url: "${url}", title: "${title || 'Custom WMTS'}" })`;
        break;
      case 'tile':
        if (url.includes('{z}')) {
          layerCode = `new WebTileLayer({ urlTemplate: "${url}", title: "${title || 'Custom Tiles'}" })`;
        } else {
          layerCode = `new TileLayer({ url: "${url}", title: "${title || 'Custom Tiles'}" })`;
        }
        break;
      case 'vector-tile':
        layerCode = `new VectorTileLayer({ url: "${url}", title: "${title || 'Custom Vector Tiles'}" })`;
        break;
    }

    createBasemapFn = `
  /**
   * Create custom basemap
   * @returns {Basemap} Custom basemap instance
   */
  function createBasemap() {
    return new Basemap({
      baseLayers: [${layerCode}],
      title: "${title || 'Custom Basemap'}"
    });
  }
`;
    basemapArg = 'createBasemap()';
  }

  // Generate local image layer function
  let createLocalImageFn = '';
  if (state.map.basemap === 'local-image' && state.map.localImage) {
    const { path, name, extent } = state.map.localImage;
    createLocalImageFn = `
  /**
   * Create local map image basemap layer
   * @returns {MediaLayer} Media layer with local map image
   */
  function createLocalImageLayer() {
    var imageElement = new ImageElement({
      image: "${path}",
      georeference: new ExtentAndRotationGeoreference({
        extent: new Extent({
          xmin: ${extent.xmin},
          ymin: ${extent.ymin},
          xmax: ${extent.xmax},
          ymax: ${extent.ymax},
          spatialReference: { wkid: 4326 }
        })
      })
    });

    return new MediaLayer({
      source: [imageElement],
      title: "${name}",
      id: "local-basemap-layer"
    });
  }
`;
  }

  // Generate createLayers function
  let createLayersFn = '';
  if (state.layers.length > 0) {
    const layerCodes = state.layers.map((layer) => {
      const props = [
        `id: "${layer.id}"`,
        `title: "${layer.title}"`,
        `visible: ${layer.visible}`,
        `opacity: ${layer.opacity}`,
      ];
      if (layer.url) props.push(`url: "${layer.url}"`);
      if (layer.definitionExpression) props.push(`definitionExpression: "${layer.definitionExpression}"`);

      if (layer.type === 'MapImageLayer' && layer.sublayers?.length) {
        const subs = layer.sublayers.map(s => {
          const sp = [`id: ${s.id}`, `visible: ${s.visible}`];
          if (s.title) sp.push(`title: "${s.title}"`);
          if (s.definitionExpression) sp.push(`definitionExpression: "${s.definitionExpression}"`);
          return `{ ${sp.join(', ')} }`;
        }).join(', ');
        props.push(`sublayers: [${subs}]`);
      }

      if (layer.type === 'WMSLayer' && layer.wmsSublayers?.length) {
        const subs = layer.wmsSublayers.map(s => {
          const sp = [`name: "${s.name}"`];
          if (s.title) sp.push(`title: "${s.title}"`);
          return `{ ${sp.join(', ')} }`;
        }).join(', ');
        props.push(`sublayers: [${subs}]`);
      }

      return `    new ${layer.type}({
      ${props.join(',\n      ')}
    })`;
    }).join(',\n');

    createLayersFn = `
  /**
   * Create all map layers
   * @returns {Array} Array of layer instances
   */
  function createLayers() {
    return [
${layerCodes}
    ];
  }
`;
  }

  // Generate createGraphics function
  let createGraphicsFn = '';
  if (state.graphics.length > 0) {
    const graphicCodes = state.graphics.map((g, i) => {
      let geomCode = '';
      if (g.geometry.type === 'point') {
        geomCode = `new Point({ longitude: ${g.geometry.longitude}, latitude: ${g.geometry.latitude} })`;
      } else if (g.geometry.type === 'polyline') {
        geomCode = `new Polyline({ paths: ${JSON.stringify(g.geometry.paths)} })`;
      } else {
        geomCode = `new Polygon({ rings: ${JSON.stringify(g.geometry.rings)} })`;
      }
      const symbolCode = generateJSSymbolCode(g.symbol, '      ');
      return `    // Graphic ${i + 1}
    new Graphic({
      geometry: ${geomCode},
      symbol: ${symbolCode}
    })`;
    }).join(',\n');

    createGraphicsFn = `
  /**
   * Create all graphics
   * @returns {Array} Array of graphic instances
   */
  function createGraphics() {
    return [
${graphicCodes}
    ];
  }

  /**
   * Create graphics layer with all graphics
   * @returns {GraphicsLayer} Graphics layer instance
   */
  function createGraphicsLayer() {
    var layer = new GraphicsLayer({ id: "graphics-layer", title: "Graphics" });
    layer.addMany(createGraphics());
    return layer;
  }
`;
  }

  // Generate createJsonDataLayers function
  let createJsonLayersFn = '';
  const jsonDataLayers = state.jsonDataLayers || [];
  if (jsonDataLayers.length > 0) {
    const layerFunctions = jsonDataLayers.map((layer, idx) => {
      const dataPreview = layer.data.slice(0, 3);
      const hasMore = layer.data.length > 3;

      let rendererCode = '';
      if (layer.renderer?.type === 'unique-value' && layer.renderer.field && layer.renderer.uniqueValueInfos) {
        const cases = layer.renderer.uniqueValueInfos.map((info) => {
          const sym = generateJSSymbolCode(info.symbol, '          ');
          return `        case ${typeof info.value === 'string' ? `"${info.value}"` : info.value}: return ${sym};`;
        }).join('\n');
        const defaultSym = generateJSSymbolCode(layer.symbol, '          ');
        rendererCode = `
      // Unique value renderer
      var fieldValue = item["${layer.renderer.field}"];
      switch (fieldValue) {
${cases}
        default: return ${defaultSym};
      }`;
      } else {
        const sym = generateJSSymbolCode(layer.symbol, '        ');
        rendererCode = `return ${sym};`;
      }

      return `  /**
   * Create JSON data layer: ${layer.title}
   * @param {Array} data - Array of data objects
   * @returns {GraphicsLayer} Graphics layer with data points
   */
  function createJsonDataLayer${idx}(data) {
    var layer = new GraphicsLayer({
      id: "${layer.id}",
      title: "${layer.title}"
    });

    function getSymbol(item) {
      ${rendererCode}
    }

    data.forEach(function(item) {
      var lat = item["${layer.fieldMapping.latitudeField}"];
      var lon = item["${layer.fieldMapping.longitudeField}"];
      if (lat == null || lon == null) return;

      var graphic = new Graphic({
        geometry: new Point({ longitude: lon, latitude: lat }),
        symbol: getSymbol(item),
        attributes: {
          ${layer.fieldMapping.attributeFields.map((f) => `"${f}": item["${f}"]`).join(',\n          ')}
        }
      });
      layer.add(graphic);
    });

    return layer;
  }

  // Sample data for layer ${idx} (showing first 3 items)
  var sampleData${idx} = ${JSON.stringify(dataPreview, null, 2).split('\n').join('\n  ')}${hasMore ? `\n  // ... and ${layer.data.length - 3} more items` : ''};`;
    }).join('\n\n');

    createJsonLayersFn = `
${layerFunctions}

  /**
   * Create all JSON data layers
   * @returns {Array} Array of JSON data layer instances
   */
  function createJsonDataLayers() {
    return [
${jsonDataLayers.map((_, i) => `      createJsonDataLayer${i}(sampleData${i})`).join(',\n')}
    ];
  }
`;
  }

  // Generate createWidgets function
  let createWidgetsFn = '';
  if (state.widgets.length > 0) {
    const widgetCodes = state.widgets.map((w) => {
      let widgetCode = '';
      switch (w.type) {
        case 'ScaleBar':
          widgetCode = `new ScaleBar({ view: view, unit: "dual" })`;
          break;
        case 'Sketch':
          widgetCode = `new Sketch({ view: view, layer: graphicsLayer })`;
          break;
        default:
          widgetCode = `new ${w.type}({ view: view })`;
      }

      if (w.expand) {
        return `    // ${w.type} widget (expandable)
    var ${w.type.toLowerCase()}Widget = ${widgetCode};
    var ${w.type.toLowerCase()}Expand = new Expand({
      view: view,
      content: ${w.type.toLowerCase()}Widget,
      expandTooltip: "${w.expandTooltip || w.type}"
    });
    view.ui.add(${w.type.toLowerCase()}Expand, "${w.position}");`;
      }

      return `    // ${w.type} widget
    view.ui.add(${widgetCode}, "${w.position}");`;
    }).join('\n\n');

    createWidgetsFn = `
  /**
   * Add all widgets to the view
   * @param {MapView|SceneView} view - The map view instance
   * @param {GraphicsLayer} [graphicsLayer] - Graphics layer for Sketch widget
   */
  function addWidgets(view, graphicsLayer) {
${widgetCodes}
  }
`;
  }

  // Generate main initMap function
  return `/**
 * ArcGIS Map Application
 * Generated by ArcGIS Map Builder
 *
 * Usage:
 *   require(["path/to/this/file"], function(MapApp) {
 *     MapApp.init("map-container");
 *   });
 */
define([
    ${imports}
  ],
  function(${moduleNames}) {
    "use strict";
${createBasemapFn}${createLocalImageFn}${createLayersFn}${createGraphicsFn}${createJsonLayersFn}${createWidgetsFn}
    /**
     * Initialize the map application
     * @param {string|HTMLElement} container - Container element or ID
     * @returns {Object} Object containing map and view instances
     */
    function init(container) {
      // Create map
      var map = new Map({
        basemap: ${basemapArg}
      });

      // Add local map image layer
${createLocalImageFn ? '      map.add(createLocalImageLayer(), 0);' : '      // No local image basemap configured'}

      // Add layers
${state.layers.length > 0 ? '      map.addMany(createLayers());' : '      // No layers configured'}

      // Add graphics layer
${state.graphics.length > 0 ? '      var graphicsLayer = createGraphicsLayer();\n      map.add(graphicsLayer);' : '      // No graphics configured'}

      // Add JSON data layers
${jsonDataLayers.length > 0 ? '      map.addMany(createJsonDataLayers());' : '      // No JSON data layers configured'}

      // Create view
      var view = new ${viewType}({
        container: container,
        map: map,
        center: [${state.map.center[0]}, ${state.map.center[1]}],
        zoom: ${state.map.zoom}
      });

      // Add widgets when view is ready
      view.when(function() {
${state.widgets.length > 0 ? `        addWidgets(view${state.graphics.length > 0 ? ', graphicsLayer' : ''});` : '        // No widgets configured'}
      });

      return {
        map: map,
        view: view${state.graphics.length > 0 ? ',\n        graphicsLayer: graphicsLayer' : ''}
      };
    }

    /**
     * Destroy the map application
     * @param {Object} app - The app object returned by init()
     */
    function destroy(app) {
      if (app && app.view) {
        app.view.destroy();
      }
    }

    // Public API
    return {
      init: init,
      destroy: destroy${createLocalImageFn ? ',\n      createLocalImageLayer: createLocalImageLayer' : ''}${createLayersFn ? ',\n      createLayers: createLayers' : ''}${createGraphicsFn ? ',\n      createGraphics: createGraphics,\n      createGraphicsLayer: createGraphicsLayer' : ''}${createJsonLayersFn ? ',\n      createJsonDataLayers: createJsonDataLayers' : ''}${createWidgetsFn ? ',\n      addWidgets: addWidgets' : ''}
    };
  }
);
`;
}

// File generator type
export interface GeneratedFile {
  name: string;
  content: string;
  path: string;
}

// Generate all project files
export function generateAllFiles(state: MapState): GeneratedFile[] {
  return [
    { name: 'ArcGISMap.tsx', content: generateMapComponent(state), path: 'src/' },
    { name: 'App.tsx', content: generateAppComponent(), path: 'src/' },
    { name: 'main.tsx', content: generateIndexFile(), path: 'src/' },
    { name: 'index.css', content: generateIndexCss(), path: 'src/' },
    { name: 'package.json', content: generatePackageJson(state), path: '' },
    { name: 'vite.config.ts', content: generateViteConfig(), path: '' },
    { name: 'tsconfig.json', content: generateTsConfig(), path: '' },
    { name: 'index.html', content: generateIndexHtml(), path: '' },
    { name: 'map-config.json', content: generateConfigJson(state), path: '' },
  ];
}
