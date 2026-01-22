/**
 * QueryBuilderEngine
 *
 * This engine converts the UI state (filters, aggregations, analytics) into
 * valid Elasticsearch Query DSL JSON. It handles:
 * - Nested bool logic (must, should, must_not, filter)
 * - Complex filter operators (range, geo, script, etc.)
 * - Recursive sub-aggregations
 * - Pipeline aggregations (bucket_script, bucket_selector)
 * - Analytics presets (unique MMSI, first/latest record, deduplication)
 */

import type {
  Filter,
  FilterGroup,
  FilterItem,
  Aggregation,
  AnalyticsConfig,
  ElasticsearchQuery,
  RangeValue,
  GeoBoundingBox,
  GeoDistance,
  GeoPolygon,
  ScriptQuery,
  TermsAggConfig,
  DateHistogramAggConfig,
  GeoHashGridAggConfig,
  GeoTileGridAggConfig,
  CardinalityAggConfig,
  MetricAggConfig,
  TopHitsAggConfig,
  BucketScriptAggConfig,
  BucketSelectorAggConfig,
  CompositeAggConfig,
} from '../types';

// ============================================
// Filter to Query DSL Conversion
// ============================================

/**
 * Converts a single filter to its Elasticsearch query representation
 * This is where each operator type is mapped to its ES query clause
 */
const filterToQueryClause = (filter: Filter): Record<string, unknown> | null => {
  if (!filter.enabled || !filter.field) return null;

  const { field, operator, value } = filter;

  switch (operator) {
    case 'equals':
      // Uses term query for exact matching on keyword fields
      return { term: { [field]: value } };

    case 'not_equals':
      // Wrapped in bool.must_not for negation
      return { bool: { must_not: { term: { [field]: value } } } };

    case 'in':
      // Uses terms query for matching any value in array
      return { terms: { [field]: Array.isArray(value) ? value : [value] } };

    case 'exists':
      // Checks if field has any non-null value
      return { exists: { field } };

    case 'range':
      // Range query for numeric/date comparisons
      return { range: { [field]: value as RangeValue } };

    case 'match':
      // Full-text search with analysis
      return { match: { [field]: value } };

    case 'wildcard':
      // Pattern matching with * and ? wildcards
      return { wildcard: { [field]: { value: String(value) } } };

    case 'regex':
      // Regular expression matching
      return { regexp: { [field]: { value: String(value) } } };

    case 'geo_bounding_box': {
      // Geo query filtering by rectangular area
      const box = value as GeoBoundingBox;
      return {
        geo_bounding_box: {
          [field]: {
            top_left: box.top_left,
            bottom_right: box.bottom_right,
          },
        },
      };
    }

    case 'geo_distance': {
      // Geo query filtering by distance from a point
      const dist = value as GeoDistance;
      return {
        geo_distance: {
          distance: dist.distance,
          [field]: dist.location,
        },
      };
    }

    case 'geo_polygon': {
      // Geo query filtering by polygon area
      const poly = value as GeoPolygon;
      return {
        geo_polygon: {
          [field]: {
            points: poly.points,
          },
        },
      };
    }

    case 'script': {
      // Script-based query for custom logic
      const script = value as ScriptQuery;
      return {
        script: {
          script: {
            source: script.source,
            lang: script.lang || 'painless',
            params: script.params || {},
          },
        },
      };
    }

    default:
      return null;
  }
};

/**
 * Converts a filter group to a bool query
 * Groups filters by their bool clause type and creates nested structure
 */
const filterGroupToQueryClause = (group: FilterGroup): Record<string, unknown> | null => {
  if (!group.enabled) return null;

  const boolQuery: Record<string, unknown[]> = {
    must: [],
    should: [],
    must_not: [],
    filter: [],
  };

  // Process each child item (filter or nested group)
  for (const child of group.children) {
    let clause: Record<string, unknown> | null = null;

    if ('children' in child && child.type === 'group') {
      // Recursively process nested filter groups
      clause = filterGroupToQueryClause(child);
    } else {
      // Convert individual filter to query clause
      clause = filterToQueryClause(child as Filter);
    }

    if (clause) {
      // Add clause to appropriate bool section based on boolClause type
      const targetClause = child.boolClause;
      boolQuery[targetClause].push(clause);
    }
  }

  // Remove empty arrays to keep query clean
  const cleanedBool: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(boolQuery)) {
    if (Array.isArray(value) && value.length > 0) {
      cleanedBool[key] = value;
    }
  }

  if (Object.keys(cleanedBool).length === 0) return null;

  return { bool: cleanedBool };
};

/**
 * Builds the complete query section from all filters
 * Organizes filters into a bool query structure
 */
export const buildQueryFromFilters = (filters: FilterItem[]): Record<string, unknown> | null => {
  if (filters.length === 0) return null;

  const boolQuery: Record<string, unknown[]> = {
    must: [],
    should: [],
    must_not: [],
    filter: [],
  };

  for (const item of filters) {
    let clause: Record<string, unknown> | null = null;

    if ('children' in item && item.type === 'group') {
      clause = filterGroupToQueryClause(item);
    } else {
      clause = filterToQueryClause(item as Filter);
    }

    if (clause) {
      const targetClause = item.boolClause;
      boolQuery[targetClause].push(clause);
    }
  }

  // Clean up empty arrays
  const cleanedBool: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(boolQuery)) {
    if (Array.isArray(value) && value.length > 0) {
      cleanedBool[key] = value;
    }
  }

  if (Object.keys(cleanedBool).length === 0) return null;

  return { bool: cleanedBool };
};

// ============================================
// Aggregation to Query DSL Conversion
// ============================================

/**
 * Converts a single aggregation config to ES aggregation DSL
 * Each aggregation type has its own structure and parameters
 */
const aggregationConfigToDsl = (
  type: Aggregation['type'],
  config: Aggregation['config']
): Record<string, unknown> => {
  switch (type) {
    case 'terms': {
      const c = config as TermsAggConfig;
      const agg: Record<string, unknown> = { field: c.field };
      if (c.size) agg.size = c.size;
      if (c.order) agg.order = { [c.order.field]: c.order.order };
      if (c.missing !== undefined) agg.missing = c.missing;
      return { terms: agg };
    }

    case 'date_histogram': {
      const c = config as DateHistogramAggConfig;
      const agg: Record<string, unknown> = { field: c.field };
      if (c.calendar_interval) agg.calendar_interval = c.calendar_interval;
      if (c.fixed_interval) agg.fixed_interval = c.fixed_interval;
      if (c.format) agg.format = c.format;
      if (c.time_zone) agg.time_zone = c.time_zone;
      if (c.min_doc_count !== undefined) agg.min_doc_count = c.min_doc_count;
      return { date_histogram: agg };
    }

    case 'geohash_grid': {
      const c = config as GeoHashGridAggConfig;
      return {
        geohash_grid: {
          field: c.field,
          precision: c.precision || 5,
        },
      };
    }

    case 'geotile_grid': {
      const c = config as GeoTileGridAggConfig;
      return {
        geotile_grid: {
          field: c.field,
          precision: c.precision || 7,
        },
      };
    }

    case 'cardinality': {
      const c = config as CardinalityAggConfig;
      const agg: Record<string, unknown> = { field: c.field };
      if (c.precision_threshold) agg.precision_threshold = c.precision_threshold;
      return { cardinality: agg };
    }

    case 'sum':
    case 'avg':
    case 'min':
    case 'max': {
      const c = config as MetricAggConfig;
      const agg: Record<string, unknown> = { field: c.field };
      if (c.script) {
        agg.script = {
          source: c.script.source,
          lang: c.script.lang || 'painless',
        };
      }
      return { [type]: agg };
    }

    case 'top_hits': {
      const c = config as TopHitsAggConfig;
      const agg: Record<string, unknown> = {};
      if (c.size) agg.size = c.size;
      if (c.sort) {
        agg.sort = c.sort.map((s) => ({ [s.field]: s.order }));
      }
      if (c._source !== undefined) agg._source = c._source;
      return { top_hits: agg };
    }

    case 'bucket_script': {
      const c = config as BucketScriptAggConfig;
      return {
        bucket_script: {
          buckets_path: c.buckets_path,
          script: c.script,
        },
      };
    }

    case 'bucket_selector': {
      const c = config as BucketSelectorAggConfig;
      return {
        bucket_selector: {
          buckets_path: c.buckets_path,
          script: c.script,
        },
      };
    }

    case 'composite': {
      const c = config as CompositeAggConfig;
      const sources = c.sources.map((source) => {
        const sourceConfig: Record<string, unknown> = { field: source.field };
        if (source.order) sourceConfig.order = source.order;
        if (source.calendar_interval) sourceConfig.calendar_interval = source.calendar_interval;
        return { [source.name]: { [source.type]: sourceConfig } };
      });
      const agg: Record<string, unknown> = { sources };
      if (c.size) agg.size = c.size;
      if (c.after) agg.after = c.after;
      return { composite: agg };
    }

    default:
      return {};
  }
};

/**
 * Recursively builds aggregations including sub-aggregations
 * Creates the nested aggs structure that ES expects
 */
const buildAggregationDsl = (aggregations: Aggregation[]): Record<string, unknown> | null => {
  if (aggregations.length === 0) return null;

  const aggs: Record<string, unknown> = {};

  for (const agg of aggregations) {
    if (!agg.enabled) continue;

    const aggDsl = aggregationConfigToDsl(agg.type, agg.config);

    // Add sub-aggregations recursively if they exist
    if (agg.subAggregations.length > 0) {
      const subAggs = buildAggregationDsl(agg.subAggregations);
      if (subAggs) {
        (aggDsl as Record<string, unknown>).aggs = subAggs;
      }
    }

    aggs[agg.name] = aggDsl;
  }

  return Object.keys(aggs).length > 0 ? aggs : null;
};

// ============================================
// Analytics Presets to Query/Aggregation DSL
// ============================================

/**
 * Applies analytics presets to modify the query or add special aggregations
 * These are shortcuts for common ES query patterns
 */
const applyAnalyticsPresets = (
  analytics: AnalyticsConfig[],
  query: ElasticsearchQuery
): ElasticsearchQuery => {
  const result = { ...query };
  const enabledAnalytics = analytics.filter((a) => a.enabled);

  for (const preset of enabledAnalytics) {
    switch (preset.preset) {
      case 'unique_mmsi':
        // Adds cardinality aggregation for unique MMSI count
        result.aggs = {
          ...result.aggs,
          unique_mmsi: {
            cardinality: {
              field: preset.field || 'mmsi',
              precision_threshold: 40000,
            },
          },
        };
        break;

      case 'first_record_per_mmsi':
        // Uses composite + top_hits to get first record per MMSI
        result.aggs = {
          ...result.aggs,
          by_mmsi: {
            composite: {
              size: preset.size || 10000,
              sources: [{ mmsi: { terms: { field: preset.field || 'mmsi' } } }],
            },
            aggs: {
              first_record: {
                top_hits: {
                  size: 1,
                  sort: [{ timestamp: 'asc' }],
                },
              },
            },
          },
        };
        break;

      case 'latest_record_per_mmsi':
        // Uses composite + top_hits to get latest record per MMSI
        result.aggs = {
          ...result.aggs,
          by_mmsi: {
            composite: {
              size: preset.size || 10000,
              sources: [{ mmsi: { terms: { field: preset.field || 'mmsi' } } }],
            },
            aggs: {
              latest_record: {
                top_hits: {
                  size: 1,
                  sort: [{ timestamp: 'desc' }],
                },
              },
            },
          },
        };
        break;

      case 'deduplicate_by_field':
        // Uses collapse to deduplicate results by a field
        (result as Record<string, unknown>).collapse = {
          field: preset.field || 'id',
        };
        break;

      case 'time_sampling':
        // Adds date_histogram for time-based sampling
        result.aggs = {
          ...result.aggs,
          time_samples: {
            date_histogram: {
              field: 'timestamp',
              fixed_interval: preset.interval || '1h',
            },
          },
        };
        break;

      case 'limit_buckets':
        // Sets track_total_hits and limits size
        result.track_total_hits = preset.size || 10000;
        break;

      case 'skip_duplicates':
        // Uses field collapsing to skip duplicates
        (result as Record<string, unknown>).collapse = {
          field: preset.field || 'id',
          inner_hits: {
            name: 'duplicates',
            size: 0,
          },
        };
        break;
    }
  }

  return result;
};

// ============================================
// Main Engine Interface
// ============================================

export interface QueryBuilderEngineInput {
  filters: FilterItem[];
  aggregations: Aggregation[];
  analytics: AnalyticsConfig[];
  size: number;
  from: number;
  trackTotalHits: boolean | number;
}

export interface QueryValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates the query before generation
 * Checks for common issues that would cause ES to reject the query
 */
export const validateQuery = (input: QueryBuilderEngineInput): QueryValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate filters
  for (const filter of input.filters) {
    if (!('children' in filter) && filter.enabled) {
      const f = filter as Filter;
      if (!f.field && f.operator !== 'script') {
        errors.push(`Filter missing field selection`);
      }
      if (f.operator === 'range') {
        const range = f.value as RangeValue;
        if (!range.gte && !range.gt && !range.lte && !range.lt) {
          warnings.push(`Range filter for "${f.field}" has no range values set`);
        }
      }
    }
  }

  // Validate aggregations
  const validateAgg = (agg: Aggregation): void => {
    if (!agg.enabled) return;

    const config = agg.config as Record<string, unknown>;
    if ('field' in config && !config.field) {
      errors.push(`Aggregation "${agg.name}" missing field selection`);
    }

    // Validate bucket script/selector have buckets_path
    if (agg.type === 'bucket_script' || agg.type === 'bucket_selector') {
      const c = config as unknown as BucketScriptAggConfig;
      if (!c.buckets_path || Object.keys(c.buckets_path).length === 0) {
        errors.push(`${agg.type} "${agg.name}" requires buckets_path configuration`);
      }
    }

    // Recursively validate sub-aggregations
    agg.subAggregations.forEach(validateAgg);
  };

  input.aggregations.forEach(validateAgg);

  // Size/from validation
  if (input.size < 0) {
    errors.push('Query size cannot be negative');
  }
  if (input.size > 10000) {
    warnings.push('Query size exceeds 10000, consider using scroll or search_after');
  }
  if (input.from < 0) {
    errors.push('Query from cannot be negative');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Main function to build the complete Elasticsearch query
 * Combines filters, aggregations, and analytics into valid ES Query DSL
 */
export const buildElasticsearchQuery = (input: QueryBuilderEngineInput): ElasticsearchQuery => {
  let query: ElasticsearchQuery = {};

  // Build query section from filters
  const queryClause = buildQueryFromFilters(input.filters);
  if (queryClause) {
    query.query = queryClause;
  }

  // Build aggregations section
  const aggs = buildAggregationDsl(input.aggregations);
  if (aggs) {
    query.aggs = aggs;
  }

  // Add pagination and tracking
  query.size = input.size;
  if (input.from > 0) {
    query.from = input.from;
  }
  if (input.trackTotalHits !== true) {
    query.track_total_hits = input.trackTotalHits;
  }

  // Apply analytics presets
  query = applyAnalyticsPresets(input.analytics, query);

  return query;
};

/**
 * Prettify the generated query JSON
 */
export const prettifyQuery = (query: ElasticsearchQuery): string => {
  return JSON.stringify(query, null, 2);
};

// Default export for convenience
export default {
  buildElasticsearchQuery,
  validateQuery,
  prettifyQuery,
  buildQueryFromFilters,
  buildAggregationDsl: (aggs: Aggregation[]) => buildAggregationDsl(aggs),
};