import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  MapStore,
  MapState,
  BasemapType,
  ViewType,
  LayerConfig,
  WidgetConfig,
  GraphicConfig,
  PopupTemplateConfig,
  JsonDataLayerConfig,
  CustomBasemapConfig,
} from '../types';

// Generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Initial state
const initialState: MapState = {
  map: {
    basemap: 'dark-gray-vector',
    viewType: '2d',
    center: [77.59, 12.97],
    zoom: 6,
    spatialReference: 4326,
  },
  layers: [],
  widgets: [],
  graphics: [],
  popupTemplates: [],
  jsonDataLayers: [],
};

export const useMapStore = create<MapStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // Map actions
        setBasemap: (basemap: BasemapType) =>
          set(
            (state) => ({ map: { ...state.map, basemap } }),
            false,
            'setBasemap'
          ),

        setViewType: (viewType: ViewType) =>
          set(
            (state) => ({ map: { ...state.map, viewType } }),
            false,
            'setViewType'
          ),

        setCenter: (center: [number, number]) =>
          set(
            (state) => ({ map: { ...state.map, center } }),
            false,
            'setCenter'
          ),

        setZoom: (zoom: number) =>
          set(
            (state) => ({ map: { ...state.map, zoom } }),
            false,
            'setZoom'
          ),

        setSpatialReference: (wkid: number) =>
          set(
            (state) => ({ map: { ...state.map, spatialReference: wkid } }),
            false,
            'setSpatialReference'
          ),

        setBackgroundColor: (color: [number, number, number]) =>
          set(
            (state) => ({ map: { ...state.map, backgroundColor: color } }),
            false,
            'setBackgroundColor'
          ),

        setCustomBasemap: (config: CustomBasemapConfig | undefined) =>
          set(
            (state) => ({ map: { ...state.map, customBasemap: config } }),
            false,
            'setCustomBasemap'
          ),

        // Layer actions
        addLayer: (layer) =>
          set(
            (state) => ({
              layers: [
                ...state.layers,
                {
                  ...layer,
                  id: generateId(),
                  order: state.layers.length,
                } as LayerConfig,
              ],
            }),
            false,
            'addLayer'
          ),

        updateLayer: (id, updates) =>
          set(
            (state) => ({
              layers: state.layers.map((layer) =>
                layer.id === id ? { ...layer, ...updates } : layer
              ),
            }),
            false,
            'updateLayer'
          ),

        removeLayer: (id) =>
          set(
            (state) => ({
              layers: state.layers
                .filter((layer) => layer.id !== id)
                .map((layer, index) => ({ ...layer, order: index })),
            }),
            false,
            'removeLayer'
          ),

        reorderLayers: (layers) =>
          set(
            () => ({
              layers: layers.map((layer, index) => ({ ...layer, order: index })),
            }),
            false,
            'reorderLayers'
          ),

        // Widget actions
        addWidget: (widget) =>
          set(
            (state) => ({
              widgets: [
                ...state.widgets,
                { ...widget, id: generateId() } as WidgetConfig,
              ],
            }),
            false,
            'addWidget'
          ),

        updateWidget: (id, updates) =>
          set(
            (state) => ({
              widgets: state.widgets.map((widget) =>
                widget.id === id ? { ...widget, ...updates } : widget
              ),
            }),
            false,
            'updateWidget'
          ),

        removeWidget: (id) =>
          set(
            (state) => ({
              widgets: state.widgets.filter((widget) => widget.id !== id),
            }),
            false,
            'removeWidget'
          ),

        // Graphic actions
        addGraphic: (graphic) =>
          set(
            (state) => ({
              graphics: [
                ...state.graphics,
                { ...graphic, id: generateId() } as GraphicConfig,
              ],
            }),
            false,
            'addGraphic'
          ),

        updateGraphic: (id, updates) =>
          set(
            (state) => ({
              graphics: state.graphics.map((graphic) =>
                graphic.id === id ? { ...graphic, ...updates } : graphic
              ),
            }),
            false,
            'updateGraphic'
          ),

        removeGraphic: (id) =>
          set(
            (state) => ({
              graphics: state.graphics.filter((graphic) => graphic.id !== id),
            }),
            false,
            'removeGraphic'
          ),

        // Popup template actions
        addPopupTemplate: (template) =>
          set(
            (state) => ({
              popupTemplates: [
                ...state.popupTemplates,
                { ...template, id: generateId() } as PopupTemplateConfig,
              ],
            }),
            false,
            'addPopupTemplate'
          ),

        updatePopupTemplate: (id, updates) =>
          set(
            (state) => ({
              popupTemplates: state.popupTemplates.map((template) =>
                template.id === id ? { ...template, ...updates } : template
              ),
            }),
            false,
            'updatePopupTemplate'
          ),

        removePopupTemplate: (id) =>
          set(
            (state) => ({
              popupTemplates: state.popupTemplates.filter(
                (template) => template.id !== id
              ),
            }),
            false,
            'removePopupTemplate'
          ),

        // JSON data layer actions
        addJsonDataLayer: (layer) =>
          set(
            (state) => ({
              jsonDataLayers: [
                ...state.jsonDataLayers,
                { ...layer, id: generateId() } as JsonDataLayerConfig,
              ],
            }),
            false,
            'addJsonDataLayer'
          ),

        updateJsonDataLayer: (id, updates) =>
          set(
            (state) => ({
              jsonDataLayers: state.jsonDataLayers.map((layer) =>
                layer.id === id ? { ...layer, ...updates } : layer
              ),
            }),
            false,
            'updateJsonDataLayer'
          ),

        removeJsonDataLayer: (id) =>
          set(
            (state) => ({
              jsonDataLayers: state.jsonDataLayers.filter(
                (layer) => layer.id !== id
              ),
            }),
            false,
            'removeJsonDataLayer'
          ),

        // Utility actions
        loadState: (state) =>
          set(
            () => ({
              map: state.map,
              layers: state.layers,
              widgets: state.widgets,
              graphics: state.graphics,
              popupTemplates: state.popupTemplates,
              jsonDataLayers: state.jsonDataLayers || [],
            }),
            false,
            'loadState'
          ),

        resetState: () => set(() => initialState, false, 'resetState'),
      }),
      {
        name: 'arcgis-map-builder-storage',
      }
    ),
    { name: 'MapStore' }
  )
);
