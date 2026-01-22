/**
 * Core types for ElasticQueryDesigner
 * These types define the structure of filters, aggregations, and the overall query state
 */

// ============================================
// Field Types
// ============================================

export type FieldType =
  | 'text'
  | 'keyword'
  | 'long'
  | 'integer'
  | 'short'
  | 'byte'
  | 'double'
  | 'float'
  | 'date'
  | 'boolean'
  | 'geo_point'
  | 'geo_shape'
  | 'nested'
  | 'object';

export interface FieldMapping {
  name: string;
  type: FieldType;
  path: string; // Full path for nested fields
  fields?: Record<string, FieldMapping>; // Sub-fields for multi-field mappings
}

export interface IndexMapping {
  indexName: string;
  fields: FieldMapping[];
}

// ============================================
// Filter/Query Types
// ============================================

export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'in'
  | 'exists'
  | 'range'
  | 'match'
  | 'wildcard'
  | 'regex'
  | 'geo_bounding_box'
  | 'geo_distance'
  | 'geo_polygon'
  | 'script';

export type BoolClauseType = 'must' | 'should' | 'must_not' | 'filter';

export interface RangeValue {
  gte?: string | number;
  gt?: string | number;
  lte?: string | number;
  lt?: string | number;
}

export interface GeoBoundingBox {
  top_left: { lat: number; lon: number };
  bottom_right: { lat: number; lon: number };
}

export interface GeoDistance {
  distance: string;
  location: { lat: number; lon: number };
}

export interface GeoPolygon {
  points: Array<{ lat: number; lon: number }>;
}

export interface ScriptQuery {
  source: string;
  lang?: string;
  params?: Record<string, unknown>;
}

export interface Filter {
  id: string;
  field: string;
  operator: FilterOperator;
  value: string | number | boolean | string[] | RangeValue | GeoBoundingBox | GeoDistance | GeoPolygon | ScriptQuery;
  boolClause: BoolClauseType;
  enabled: boolean;
}

export interface FilterGroup {
  id: string;
  type: 'group';
  boolClause: BoolClauseType;
  children: Array<Filter | FilterGroup>;
  enabled: boolean;
}

export type FilterItem = Filter | FilterGroup;

// ============================================
// Aggregation Types
// ============================================

export type AggregationType =
  | 'terms'
  | 'date_histogram'
  | 'geohash_grid'
  | 'geotile_grid'
  | 'cardinality'
  | 'sum'
  | 'avg'
  | 'min'
  | 'max'
  | 'top_hits'
  | 'bucket_script'
  | 'bucket_selector'
  | 'composite';

export type SortOrder = 'asc' | 'desc';

export interface AggregationSort {
  field: string;
  order: SortOrder;
}

export interface TermsAggConfig {
  field: string;
  size?: number;
  order?: AggregationSort;
  missing?: string | number;
}

export interface DateHistogramAggConfig {
  field: string;
  calendar_interval?: string;
  fixed_interval?: string;
  format?: string;
  time_zone?: string;
  min_doc_count?: number;
}

export interface GeoHashGridAggConfig {
  field: string;
  precision?: number;
}

export interface GeoTileGridAggConfig {
  field: string;
  precision?: number;
}

export interface CardinalityAggConfig {
  field: string;
  precision_threshold?: number;
}

export interface MetricAggConfig {
  field: string;
  script?: ScriptQuery;
}

export interface TopHitsAggConfig {
  size?: number;
  sort?: Array<{ field: string; order: SortOrder }>;
  _source?: string[] | boolean;
}

export interface BucketScriptAggConfig {
  buckets_path: Record<string, string>;
  script: string;
}

export interface BucketSelectorAggConfig {
  buckets_path: Record<string, string>;
  script: string;
}

export interface CompositeSource {
  name: string;
  type: 'terms' | 'date_histogram' | 'geotile_grid';
  field: string;
  order?: SortOrder;
  calendar_interval?: string;
}

export interface CompositeAggConfig {
  size?: number;
  sources: CompositeSource[];
  after?: Record<string, unknown>;
}

export type AggregationConfig =
  | TermsAggConfig
  | DateHistogramAggConfig
  | GeoHashGridAggConfig
  | GeoTileGridAggConfig
  | CardinalityAggConfig
  | MetricAggConfig
  | TopHitsAggConfig
  | BucketScriptAggConfig
  | BucketSelectorAggConfig
  | CompositeAggConfig;

export interface Aggregation {
  id: string;
  name: string;
  type: AggregationType;
  config: AggregationConfig;
  subAggregations: Aggregation[];
  enabled: boolean;
}

// ============================================
// Special Analytics Presets
// ============================================

export type AnalyticsPreset =
  | 'unique_mmsi'
  | 'first_record_per_mmsi'
  | 'latest_record_per_mmsi'
  | 'deduplicate_by_field'
  | 'time_sampling'
  | 'limit_buckets'
  | 'skip_duplicates';

export interface AnalyticsConfig {
  preset: AnalyticsPreset;
  enabled: boolean;
  field?: string;
  size?: number;
  interval?: string;
}

// ============================================
// Query State
// ============================================

export interface QueryState {
  selectedIndex: string;
  availableIndices: string[];
  indexMappings: Record<string, IndexMapping>;
  filters: FilterItem[];
  aggregations: Aggregation[];
  analytics: AnalyticsConfig[];
  querySize: number;
  from: number;
  trackTotalHits: boolean | number;
}

// ============================================
// Generated Query
// ============================================

export interface ElasticsearchQuery {
  query?: Record<string, unknown>;
  aggs?: Record<string, unknown>;
  size?: number;
  from?: number;
  track_total_hits?: boolean | number;
  sort?: Array<Record<string, unknown>>;
  _source?: string[] | boolean;
}

// ============================================
// API Response Types
// ============================================

export interface QueryResult {
  took: number;
  timed_out: boolean;
  hits: {
    total: { value: number; relation: string };
    hits: Array<{
      _index: string;
      _id: string;
      _score: number;
      _source: Record<string, unknown>;
    }>;
  };
  aggregations?: Record<string, unknown>;
}