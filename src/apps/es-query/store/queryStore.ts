/**
 * Zustand Store for ElasticQueryDesigner
 * Manages the entire query state including filters, aggregations, and analytics
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  QueryState,
  Filter,
  FilterGroup,
  FilterItem,
  Aggregation,
  AnalyticsConfig,
  IndexMapping,
  AggregationType,
  AggregationConfig,
  QueryResult,
} from '../types';

// ============================================
// Store State Interface
// ============================================

interface QueryStore extends QueryState {
  // Query result state
  queryResult: QueryResult | null;
  isLoading: boolean;
  error: string | null;

  // Index actions
  setSelectedIndex: (index: string) => void;
  setAvailableIndices: (indices: string[]) => void;
  setIndexMapping: (indexName: string, mapping: IndexMapping) => void;

  // Filter actions
  addFilter: (filter?: Partial<Filter>) => void;
  addFilterGroup: (parentId?: string) => void;
  updateFilter: (id: string, updates: Partial<Filter>) => void;
  removeFilter: (id: string) => void;
  toggleFilter: (id: string) => void;
  moveFilter: (activeId: string, overId: string) => void;
  reorderFilters: (newOrder: FilterItem[]) => void;

  // Aggregation actions
  addAggregation: (parentId?: string, agg?: Partial<Aggregation>) => void;
  updateAggregation: (id: string, updates: Partial<Aggregation>) => void;
  updateAggregationConfig: (id: string, config: Partial<AggregationConfig>) => void;
  removeAggregation: (id: string) => void;
  toggleAggregation: (id: string) => void;
  reorderAggregations: (newOrder: Aggregation[]) => void;

  // Analytics actions
  toggleAnalytics: (preset: AnalyticsConfig['preset']) => void;
  updateAnalyticsConfig: (preset: AnalyticsConfig['preset'], config: Partial<AnalyticsConfig>) => void;

  // Query settings actions
  setQuerySize: (size: number) => void;
  setFrom: (from: number) => void;
  setTrackTotalHits: (value: boolean | number) => void;

  // Query execution actions
  setQueryResult: (result: QueryResult | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Reset actions
  resetFilters: () => void;
  resetAggregations: () => void;
  resetAll: () => void;
}

// ============================================
// Helper Functions
// ============================================

const createDefaultFilter = (overrides?: Partial<Filter>): Filter => ({
  id: uuidv4(),
  field: '',
  operator: 'equals',
  value: '',
  boolClause: 'must',
  enabled: true,
  ...overrides,
});

const createDefaultFilterGroup = (): FilterGroup => ({
  id: uuidv4(),
  type: 'group',
  boolClause: 'must',
  children: [],
  enabled: true,
});

const createDefaultAggregation = (type: AggregationType = 'terms', overrides?: Partial<Aggregation>): Aggregation => {
  const getDefaultConfig = (aggType: AggregationType): AggregationConfig => {
    switch (aggType) {
      case 'terms':
        return { field: '', size: 10 };
      case 'date_histogram':
        return { field: '', calendar_interval: 'day' };
      case 'geohash_grid':
        return { field: '', precision: 5 };
      case 'geotile_grid':
        return { field: '', precision: 7 };
      case 'cardinality':
        return { field: '' };
      case 'sum':
      case 'avg':
      case 'min':
      case 'max':
        return { field: '' };
      case 'top_hits':
        return { size: 1 };
      case 'bucket_script':
        return { buckets_path: {}, script: '' };
      case 'bucket_selector':
        return { buckets_path: {}, script: '' };
      case 'composite':
        return { size: 10, sources: [] };
      default:
        return { field: '' };
    }
  };

  return {
    id: uuidv4(),
    name: `agg_${Date.now()}`,
    type,
    config: getDefaultConfig(type),
    subAggregations: [],
    enabled: true,
    ...overrides,
  };
};

// Recursive helper to find and update items in nested structure
const findAndUpdateFilter = (
  items: FilterItem[],
  id: string,
  updater: (item: FilterItem) => FilterItem | null
): FilterItem[] => {
  return items
    .map((item) => {
      if (item.id === id) {
        return updater(item);
      }
      if ('children' in item && item.type === 'group') {
        return {
          ...item,
          children: findAndUpdateFilter(item.children, id, updater),
        };
      }
      return item;
    })
    .filter((item): item is FilterItem => item !== null);
};

// Recursive helper to find and update aggregations
const findAndUpdateAggregation = (
  items: Aggregation[],
  id: string,
  updater: (item: Aggregation) => Aggregation | null
): Aggregation[] => {
  return items
    .map((item) => {
      if (item.id === id) {
        return updater(item);
      }
      return {
        ...item,
        subAggregations: findAndUpdateAggregation(item.subAggregations, id, updater),
      };
    })
    .filter((item): item is Aggregation => item !== null);
};

// Helper to add aggregation to parent or root
const addAggregationToParent = (
  items: Aggregation[],
  parentId: string | undefined,
  newAgg: Aggregation
): Aggregation[] => {
  if (!parentId) {
    return [...items, newAgg];
  }

  return items.map((item) => {
    if (item.id === parentId) {
      return {
        ...item,
        subAggregations: [...item.subAggregations, newAgg],
      };
    }
    return {
      ...item,
      subAggregations: addAggregationToParent(item.subAggregations, parentId, newAgg),
    };
  });
};

// ============================================
// Zustand Store
// ============================================

export const useQueryStore = create<QueryStore>((set) => ({
  // Initial state
  selectedIndex: '',
  availableIndices: [],
  indexMappings: {},
  filters: [],
  aggregations: [],
  analytics: [],
  querySize: 10,
  from: 0,
  trackTotalHits: true,
  queryResult: null,
  isLoading: false,
  error: null,

  // Index actions
  setSelectedIndex: (index) => set({ selectedIndex: index }),
  setAvailableIndices: (indices) => set({ availableIndices: indices }),
  setIndexMapping: (indexName, mapping) =>
    set((state) => ({
      indexMappings: { ...state.indexMappings, [indexName]: mapping },
    })),

  // Filter actions
  addFilter: (filter) =>
    set((state) => ({
      filters: [...state.filters, createDefaultFilter(filter)],
    })),

  addFilterGroup: (parentId) =>
    set((state) => {
      const newGroup = createDefaultFilterGroup();
      if (!parentId) {
        return { filters: [...state.filters, newGroup] };
      }
      return {
        filters: findAndUpdateFilter(state.filters, parentId, (item) => {
          if ('children' in item && item.type === 'group') {
            return { ...item, children: [...item.children, newGroup] };
          }
          return item;
        }),
      };
    }),

  updateFilter: (id, updates) =>
    set((state) => ({
      filters: findAndUpdateFilter(state.filters, id, (item) => {
        if ('children' in item && item.type === 'group') {
          return { ...item, ...updates } as FilterGroup;
        }
        return { ...item, ...updates } as Filter;
      }),
    })),

  removeFilter: (id) =>
    set((state) => ({
      filters: findAndUpdateFilter(state.filters, id, () => null),
    })),

  toggleFilter: (id) =>
    set((state) => ({
      filters: findAndUpdateFilter(state.filters, id, (item) => ({
        ...item,
        enabled: !item.enabled,
      })),
    })),

  moveFilter: (activeId, overId) =>
    set((state) => {
      const oldIndex = state.filters.findIndex((f) => f.id === activeId);
      const newIndex = state.filters.findIndex((f) => f.id === overId);
      if (oldIndex === -1 || newIndex === -1) return state;

      const newFilters = [...state.filters];
      const [removed] = newFilters.splice(oldIndex, 1);
      newFilters.splice(newIndex, 0, removed);
      return { filters: newFilters };
    }),

  reorderFilters: (newOrder) => set({ filters: newOrder }),

  // Aggregation actions
  addAggregation: (parentId, agg) =>
    set((state) => ({
      aggregations: addAggregationToParent(
        state.aggregations,
        parentId,
        createDefaultAggregation(agg?.type || 'terms', agg)
      ),
    })),

  updateAggregation: (id, updates) =>
    set((state) => ({
      aggregations: findAndUpdateAggregation(state.aggregations, id, (item) => ({
        ...item,
        ...updates,
      })),
    })),

  updateAggregationConfig: (id, config) =>
    set((state) => ({
      aggregations: findAndUpdateAggregation(state.aggregations, id, (item) => ({
        ...item,
        config: { ...item.config, ...config } as AggregationConfig,
      })),
    })),

  removeAggregation: (id) =>
    set((state) => ({
      aggregations: findAndUpdateAggregation(state.aggregations, id, () => null),
    })),

  toggleAggregation: (id) =>
    set((state) => ({
      aggregations: findAndUpdateAggregation(state.aggregations, id, (item) => ({
        ...item,
        enabled: !item.enabled,
      })),
    })),

  reorderAggregations: (newOrder) => set({ aggregations: newOrder }),

  // Analytics actions
  toggleAnalytics: (preset) =>
    set((state) => {
      const existing = state.analytics.find((a) => a.preset === preset);
      if (existing) {
        return {
          analytics: state.analytics.map((a) =>
            a.preset === preset ? { ...a, enabled: !a.enabled } : a
          ),
        };
      }
      return {
        analytics: [...state.analytics, { preset, enabled: true }],
      };
    }),

  updateAnalyticsConfig: (preset, config) =>
    set((state) => ({
      analytics: state.analytics.map((a) =>
        a.preset === preset ? { ...a, ...config } : a
      ),
    })),

  // Query settings actions
  setQuerySize: (size) => set({ querySize: size }),
  setFrom: (from) => set({ from }),
  setTrackTotalHits: (value) => set({ trackTotalHits: value }),

  // Query execution actions
  setQueryResult: (result) => set({ queryResult: result }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // Reset actions
  resetFilters: () => set({ filters: [] }),
  resetAggregations: () => set({ aggregations: [] }),
  resetAll: () =>
    set({
      filters: [],
      aggregations: [],
      analytics: [],
      querySize: 10,
      from: 0,
      trackTotalHits: true,
      queryResult: null,
      error: null,
    }),
}));