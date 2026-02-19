// Elasticsearch Templates

export const elasticsearchTemplates = {
  ES_CONFIG: {
    name: 'Elasticsearch Config',
    description: 'Elasticsearch client configuration',
    generate: (className, packageName) => ({
      name: 'Elasticsearch Configuration',
      fileName: 'ElasticsearchConfig.java',
      packagePath: `${packageName}.config`,
      useCase: 'Elasticsearch client configuration with connection pooling',
      code: `package ${packageName}.config;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import co.elastic.clients.transport.ElasticsearchTransport;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ElasticsearchConfig {

    @Value("\${elasticsearch.host:localhost}")
    private String host;

    @Value("\${elasticsearch.port:9200}")
    private int port;

    @Value("\${elasticsearch.scheme:http}")
    private String scheme;

    @Value("\${elasticsearch.username:}")
    private String username;

    @Value("\${elasticsearch.password:}")
    private String password;

    @Value("\${elasticsearch.connection-timeout:5000}")
    private int connectionTimeout;

    @Value("\${elasticsearch.socket-timeout:60000}")
    private int socketTimeout;

    @Bean
    public RestClient restClient() {
        RestClientBuilder builder = RestClient.builder(new HttpHost(host, port, scheme))
                .setRequestConfigCallback(requestConfigBuilder -> requestConfigBuilder
                        .setConnectTimeout(connectionTimeout)
                        .setSocketTimeout(socketTimeout)
                );

        // Add authentication if credentials are provided
        if (username != null && !username.isEmpty()) {
            BasicCredentialsProvider credentialsProvider = new BasicCredentialsProvider();
            credentialsProvider.setCredentials(AuthScope.ANY,
                    new UsernamePasswordCredentials(username, password));

            builder.setHttpClientConfigCallback(httpClientBuilder ->
                    httpClientBuilder.setDefaultCredentialsProvider(credentialsProvider));
        }

        return builder.build();
    }

    @Bean
    public ElasticsearchTransport elasticsearchTransport(RestClient restClient) {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        return new RestClientTransport(restClient, new JacksonJsonpMapper(objectMapper));
    }

    @Bean
    public ElasticsearchClient elasticsearchClient(ElasticsearchTransport transport) {
        return new ElasticsearchClient(transport);
    }
}

/*
 * application.yml:
 *
 * elasticsearch:
 *   host: localhost
 *   port: 9200
 *   scheme: http
 *   username: elastic
 *   password: changeme
 *   connection-timeout: 5000
 *   socket-timeout: 60000
 *
 * pom.xml dependencies:
 *   <dependency>
 *     <groupId>co.elastic.clients</groupId>
 *     <artifactId>elasticsearch-java</artifactId>
 *     <version>8.11.0</version>
 *   </dependency>
 *   <dependency>
 *     <groupId>com.fasterxml.jackson.core</groupId>
 *     <artifactId>jackson-databind</artifactId>
 *   </dependency>
 */`,
      explanation: 'Elasticsearch 8.x client configuration with authentication and connection pooling.',
      bestPractices: ['Configure connection timeouts', 'Use credentials provider for auth', 'Register JavaTimeModule for dates'],
      commonMistakes: ['Not configuring socket timeout', 'Missing Jackson time module'],
      java21Tips: ['Virtual threads work well with async ES operations']
    })
  },

  ES_DOCUMENT: {
    name: 'ES Document',
    description: 'Elasticsearch document entity',
    generate: (className, packageName) => ({
      name: `${className} Document`,
      fileName: `${className}Document.java`,
      packagePath: `${packageName}.document`,
      useCase: 'Elasticsearch document with field annotations',
      code: `package ${packageName}.document;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ${className}Document(
    @JsonProperty("id")
    String id,

    @JsonProperty("name")
    String name,

    @JsonProperty("description")
    String description,

    @JsonProperty("status")
    String status,

    @JsonProperty("tags")
    List<String> tags,

    @JsonProperty("metadata")
    Map<String, Object> metadata,

    @JsonProperty("location")
    GeoPoint location,

    @JsonProperty("created_at")
    LocalDateTime createdAt,

    @JsonProperty("updated_at")
    LocalDateTime updatedAt,

    @JsonProperty("search_score")
    Float searchScore
) {
    // Builder pattern for convenience
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String name;
        private String description;
        private String status;
        private List<String> tags;
        private Map<String, Object> metadata;
        private GeoPoint location;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Float searchScore;

        public Builder id(String id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder tags(List<String> tags) { this.tags = tags; return this; }
        public Builder metadata(Map<String, Object> metadata) { this.metadata = metadata; return this; }
        public Builder location(GeoPoint location) { this.location = location; return this; }
        public Builder location(double lat, double lon) { this.location = new GeoPoint(lat, lon); return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public Builder searchScore(Float searchScore) { this.searchScore = searchScore; return this; }

        public ${className}Document build() {
            return new ${className}Document(id, name, description, status, tags,
                    metadata, location, createdAt, updatedAt, searchScore);
        }
    }

    // GeoPoint for location queries
    public record GeoPoint(
        @JsonProperty("lat") double lat,
        @JsonProperty("lon") double lon
    ) {}
}`,
      explanation: 'Elasticsearch document using Java records with nested objects and geo point.',
      bestPractices: ['Use records for immutable documents', 'Include @JsonProperty for ES field mapping', 'Handle unknown properties gracefully'],
      commonMistakes: ['Mutable document classes', 'Missing JSON annotations for ES'],
      java21Tips: ['Records are perfect for ES documents']
    })
  },

  ES_INDEX_SERVICE: {
    name: 'ES Index Service',
    description: 'Index management service',
    generate: (className, packageName) => ({
      name: `${className} Index Service`,
      fileName: `${className}IndexService.java`,
      packagePath: `${packageName}.service`,
      useCase: 'Elasticsearch index creation and management',
      code: `package ${packageName}.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.mapping.*;
import co.elastic.clients.elasticsearch.indices.*;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;

@Service
public class ${className}IndexService {

    private final ElasticsearchClient client;
    public static final String INDEX_NAME = "${className.toLowerCase()}s";

    public ${className}IndexService(ElasticsearchClient client) {
        this.client = client;
    }

    public boolean indexExists() throws IOException {
        return client.indices().exists(e -> e.index(INDEX_NAME)).value();
    }

    public void createIndex() throws IOException {
        if (indexExists()) {
            return;
        }

        CreateIndexRequest request = CreateIndexRequest.of(builder -> builder
            .index(INDEX_NAME)
            .settings(settings -> settings
                .numberOfShards("1")
                .numberOfReplicas("1")
                .analysis(analysis -> analysis
                    .analyzer("custom_analyzer", analyzer -> analyzer
                        .custom(custom -> custom
                            .tokenizer("standard")
                            .filter("lowercase", "asciifolding", "edge_ngram_filter")
                        )
                    )
                    .filter("edge_ngram_filter", filter -> filter
                        .definition(def -> def
                            .edgeNgram(ngram -> ngram
                                .minGram(2)
                                .maxGram(20)
                            )
                        )
                    )
                )
            )
            .mappings(mappings -> mappings
                .properties("id", p -> p.keyword(k -> k))
                .properties("name", p -> p.text(t -> t
                    .analyzer("custom_analyzer")
                    .searchAnalyzer("standard")
                    .fields("keyword", f -> f.keyword(k -> k.ignoreAbove(256)))
                ))
                .properties("description", p -> p.text(t -> t
                    .analyzer("standard")
                ))
                .properties("status", p -> p.keyword(k -> k))
                .properties("tags", p -> p.keyword(k -> k))
                .properties("metadata", p -> p.object(o -> o.enabled(true)))
                .properties("location", p -> p.geoPoint(g -> g))
                .properties("created_at", p -> p.date(d -> d
                    .format("strict_date_optional_time||epoch_millis")
                ))
                .properties("updated_at", p -> p.date(d -> d
                    .format("strict_date_optional_time||epoch_millis")
                ))
            )
        );

        client.indices().create(request);
    }

    public void deleteIndex() throws IOException {
        if (indexExists()) {
            client.indices().delete(d -> d.index(INDEX_NAME));
        }
    }

    public void recreateIndex() throws IOException {
        deleteIndex();
        createIndex();
    }

    public void updateMapping(Map<String, Property> newProperties) throws IOException {
        PutMappingRequest request = PutMappingRequest.of(builder -> {
            builder.index(INDEX_NAME);
            newProperties.forEach(builder::properties);
            return builder;
        });

        client.indices().putMapping(request);
    }

    public void refreshIndex() throws IOException {
        client.indices().refresh(r -> r.index(INDEX_NAME));
    }

    public IndexSettings getSettings() throws IOException {
        GetIndicesSettingsResponse response = client.indices()
                .getSettings(s -> s.index(INDEX_NAME));
        return response.get(INDEX_NAME).settings();
    }

    public TypeMapping getMapping() throws IOException {
        GetMappingResponse response = client.indices()
                .getMapping(m -> m.index(INDEX_NAME));
        return response.get(INDEX_NAME).mappings();
    }
}`,
      explanation: 'Elasticsearch index management with custom analyzers and mappings.',
      bestPractices: ['Use custom analyzers for search', 'Define explicit mappings', 'Use edge_ngram for autocomplete'],
      commonMistakes: ['Not defining mappings explicitly', 'Wrong date formats'],
      java21Tips: ['Use pattern matching for response handling']
    })
  },

  ES_REPOSITORY: {
    name: 'ES Repository',
    description: 'Elasticsearch repository with CRUD',
    generate: (className, packageName) => ({
      name: `${className} ES Repository`,
      fileName: `${className}ElasticsearchRepository.java`,
      packagePath: `${packageName}.repository`,
      useCase: 'Elasticsearch repository with CRUD and bulk operations',
      code: `package ${packageName}.repository;

import ${packageName}.document.${className}Document;
import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.Refresh;
import co.elastic.clients.elasticsearch._types.Result;
import co.elastic.clients.elasticsearch.core.*;
import co.elastic.clients.elasticsearch.core.bulk.BulkOperation;
import co.elastic.clients.elasticsearch.core.bulk.BulkResponseItem;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class ${className}ElasticsearchRepository {

    private final ElasticsearchClient client;
    private static final String INDEX = "${className.toLowerCase()}s";

    public ${className}ElasticsearchRepository(ElasticsearchClient client) {
        this.client = client;
    }

    // Create or Update
    public ${className}Document save(${className}Document document) throws IOException {
        IndexResponse response = client.index(i -> i
            .index(INDEX)
            .id(document.id())
            .document(document)
            .refresh(Refresh.True)
        );

        return document;
    }

    // Read by ID
    public Optional<${className}Document> findById(String id) throws IOException {
        GetResponse<${className}Document> response = client.get(g -> g
            .index(INDEX)
            .id(id),
            ${className}Document.class
        );

        if (response.found()) {
            return Optional.ofNullable(response.source());
        }
        return Optional.empty();
    }

    // Check exists
    public boolean existsById(String id) throws IOException {
        return client.exists(e -> e.index(INDEX).id(id)).value();
    }

    // Delete by ID
    public boolean deleteById(String id) throws IOException {
        DeleteResponse response = client.delete(d -> d
            .index(INDEX)
            .id(id)
            .refresh(Refresh.True)
        );

        return response.result() == Result.Deleted;
    }

    // Bulk index
    public BulkResponse bulkIndex(List<${className}Document> documents) throws IOException {
        List<BulkOperation> operations = documents.stream()
            .map(doc -> BulkOperation.of(op -> op
                .index(idx -> idx
                    .index(INDEX)
                    .id(doc.id())
                    .document(doc)
                )
            ))
            .collect(Collectors.toList());

        return client.bulk(b -> b.operations(operations).refresh(Refresh.True));
    }

    // Bulk delete
    public BulkResponse bulkDelete(List<String> ids) throws IOException {
        List<BulkOperation> operations = ids.stream()
            .map(id -> BulkOperation.of(op -> op
                .delete(d -> d.index(INDEX).id(id))
            ))
            .collect(Collectors.toList());

        return client.bulk(b -> b.operations(operations).refresh(Refresh.True));
    }

    // Count documents
    public long count() throws IOException {
        return client.count(c -> c.index(INDEX)).count();
    }

    // Delete all
    public void deleteAll() throws IOException {
        client.deleteByQuery(d -> d
            .index(INDEX)
            .query(q -> q.matchAll(m -> m))
            .refresh(true)
        );
    }

    // Check bulk response for errors
    public List<String> getBulkErrors(BulkResponse response) {
        if (!response.errors()) {
            return List.of();
        }

        return response.items().stream()
            .filter(item -> item.error() != null)
            .map(BulkResponseItem::id)
            .collect(Collectors.toList());
    }
}`,
      explanation: 'Elasticsearch repository with CRUD and bulk operations using new Java client.',
      bestPractices: ['Use Refresh.True for immediate visibility', 'Handle bulk errors properly', 'Use Optional for find operations'],
      commonMistakes: ['Not checking bulk response errors', 'Forgetting to refresh after writes'],
      java21Tips: ['Use records for response DTOs']
    })
  },

  ES_SEARCH_SERVICE: {
    name: 'ES Search Service',
    description: 'Advanced search queries',
    generate: (className, packageName) => ({
      name: `${className} Search Service`,
      fileName: `${className}SearchService.java`,
      packagePath: `${packageName}.service`,
      useCase: 'Advanced Elasticsearch search with full-text, filters, and highlighting',
      code: `package ${packageName}.service;

import ${packageName}.document.${className}Document;
import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.query_dsl.*;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.Hit;
import co.elastic.clients.elasticsearch.core.search.HighlightField;
import co.elastic.clients.elasticsearch.core.search.TotalHits;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ${className}SearchService {

    private final ElasticsearchClient client;
    private static final String INDEX = "${className.toLowerCase()}s";

    public ${className}SearchService(ElasticsearchClient client) {
        this.client = client;
    }

    // Full-text search with highlighting
    public SearchResult<${className}Document> search(String query, int from, int size) throws IOException {
        SearchResponse<${className}Document> response = client.search(s -> s
            .index(INDEX)
            .from(from)
            .size(size)
            .query(q -> q
                .multiMatch(m -> m
                    .query(query)
                    .fields("name^3", "description", "tags^2")
                    .type(TextQueryType.BestFields)
                    .fuzziness("AUTO")
                )
            )
            .highlight(h -> h
                .fields("name", HighlightField.of(hf -> hf.preTags("<em>").postTags("</em>")))
                .fields("description", HighlightField.of(hf -> hf.preTags("<em>").postTags("</em>")))
            )
            .sort(sort -> sort.score(sc -> sc.order(SortOrder.Desc))),
            ${className}Document.class
        );

        return toSearchResult(response);
    }

    // Bool query with filters
    public SearchResult<${className}Document> searchWithFilters(
            String query,
            String status,
            List<String> tags,
            int from,
            int size) throws IOException {

        SearchResponse<${className}Document> response = client.search(s -> s
            .index(INDEX)
            .from(from)
            .size(size)
            .query(q -> q
                .bool(b -> {
                    // Must: full-text search
                    if (query != null && !query.isBlank()) {
                        b.must(m -> m.multiMatch(mm -> mm
                            .query(query)
                            .fields("name^3", "description")
                            .fuzziness("AUTO")
                        ));
                    }

                    // Filter: status
                    if (status != null) {
                        b.filter(f -> f.term(t -> t.field("status").value(status)));
                    }

                    // Filter: tags
                    if (tags != null && !tags.isEmpty()) {
                        b.filter(f -> f.terms(t -> t
                            .field("tags")
                            .terms(tv -> tv.value(tags.stream()
                                .map(tag -> co.elastic.clients.elasticsearch._types.FieldValue.of(tag))
                                .collect(Collectors.toList())))
                        ));
                    }

                    return b;
                })
            )
            .sort(sort -> sort.field(f -> f.field("created_at").order(SortOrder.Desc))),
            ${className}Document.class
        );

        return toSearchResult(response);
    }

    // Autocomplete / Prefix search
    public List<${className}Document> autocomplete(String prefix, int size) throws IOException {
        SearchResponse<${className}Document> response = client.search(s -> s
            .index(INDEX)
            .size(size)
            .query(q -> q
                .bool(b -> b
                    .should(sh -> sh.prefix(p -> p.field("name").value(prefix.toLowerCase())))
                    .should(sh -> sh.match(m -> m.field("name").query(prefix).fuzziness("AUTO")))
                )
            )
            .source(src -> src.filter(f -> f.includes("id", "name"))),
            ${className}Document.class
        );

        return response.hits().hits().stream()
            .map(Hit::source)
            .collect(Collectors.toList());
    }

    // Phrase search
    public SearchResult<${className}Document> phraseSearch(String phrase, int from, int size) throws IOException {
        SearchResponse<${className}Document> response = client.search(s -> s
            .index(INDEX)
            .from(from)
            .size(size)
            .query(q -> q
                .matchPhrase(mp -> mp
                    .field("description")
                    .query(phrase)
                    .slop(2)
                )
            ),
            ${className}Document.class
        );

        return toSearchResult(response);
    }

    // Range query (date range)
    public SearchResult<${className}Document> searchByDateRange(
            String startDate,
            String endDate,
            int from,
            int size) throws IOException {

        SearchResponse<${className}Document> response = client.search(s -> s
            .index(INDEX)
            .from(from)
            .size(size)
            .query(q -> q
                .range(r -> r
                    .field("created_at")
                    .gte(co.elastic.clients.json.JsonData.of(startDate))
                    .lte(co.elastic.clients.json.JsonData.of(endDate))
                )
            )
            .sort(sort -> sort.field(f -> f.field("created_at").order(SortOrder.Desc))),
            ${className}Document.class
        );

        return toSearchResult(response);
    }

    // IDs query
    public List<${className}Document> findByIds(List<String> ids) throws IOException {
        SearchResponse<${className}Document> response = client.search(s -> s
            .index(INDEX)
            .size(ids.size())
            .query(q -> q.ids(i -> i.values(ids))),
            ${className}Document.class
        );

        return response.hits().hits().stream()
            .map(Hit::source)
            .collect(Collectors.toList());
    }

    // Helper to convert response
    private SearchResult<${className}Document> toSearchResult(SearchResponse<${className}Document> response) {
        List<${className}Document> documents = response.hits().hits().stream()
            .map(hit -> {
                ${className}Document doc = hit.source();
                // Attach score if needed
                if (doc != null && hit.score() != null) {
                    doc = ${className}Document.builder()
                        .id(doc.id())
                        .name(doc.name())
                        .description(doc.description())
                        .status(doc.status())
                        .tags(doc.tags())
                        .metadata(doc.metadata())
                        .location(doc.location())
                        .createdAt(doc.createdAt())
                        .updatedAt(doc.updatedAt())
                        .searchScore(hit.score().floatValue())
                        .build();
                }
                return doc;
            })
            .collect(Collectors.toList());

        TotalHits totalHits = response.hits().total();
        long total = totalHits != null ? totalHits.value() : documents.size();

        return new SearchResult<>(documents, total, response.took());
    }

    // Search result wrapper
    public record SearchResult<T>(
        List<T> documents,
        long totalHits,
        long tookMs
    ) {}
}`,
      explanation: 'Advanced Elasticsearch search with multi-match, filters, highlighting, and autocomplete.',
      bestPractices: ['Use field boosting (^) for relevance', 'Apply filters in filter context', 'Use fuzziness for typo tolerance'],
      commonMistakes: ['Not using filter context for exact matches', 'Missing field boosting'],
      java21Tips: ['Use records for search result wrappers']
    })
  },

  ES_AGGREGATION_SERVICE: {
    name: 'ES Aggregation Service',
    description: 'Aggregation queries',
    generate: (className, packageName) => ({
      name: `${className} Aggregation Service`,
      fileName: `${className}AggregationService.java`,
      packagePath: `${packageName}.service`,
      useCase: 'Elasticsearch aggregations for analytics and faceted search',
      code: `package ${packageName}.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.aggregations.*;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class ${className}AggregationService {

    private final ElasticsearchClient client;
    private static final String INDEX = "${className.toLowerCase()}s";

    public ${className}AggregationService(ElasticsearchClient client) {
        this.client = client;
    }

    // Terms aggregation - count by status
    public Map<String, Long> countByStatus() throws IOException {
        SearchResponse<Void> response = client.search(s -> s
            .index(INDEX)
            .size(0)
            .aggregations("status_counts", a -> a
                .terms(t -> t.field("status").size(10))
            ),
            Void.class
        );

        Map<String, Long> result = new LinkedHashMap<>();
        StringTermsAggregate agg = response.aggregations()
            .get("status_counts")
            .sterms();

        for (StringTermsBucket bucket : agg.buckets().array()) {
            result.put(bucket.key().stringValue(), bucket.docCount());
        }

        return result;
    }

    // Terms aggregation - count by tags
    public Map<String, Long> countByTags(int topN) throws IOException {
        SearchResponse<Void> response = client.search(s -> s
            .index(INDEX)
            .size(0)
            .aggregations("tag_counts", a -> a
                .terms(t -> t.field("tags").size(topN))
            ),
            Void.class
        );

        Map<String, Long> result = new LinkedHashMap<>();
        StringTermsAggregate agg = response.aggregations()
            .get("tag_counts")
            .sterms();

        for (StringTermsBucket bucket : agg.buckets().array()) {
            result.put(bucket.key().stringValue(), bucket.docCount());
        }

        return result;
    }

    // Date histogram - documents by month
    public Map<String, Long> countByMonth() throws IOException {
        SearchResponse<Void> response = client.search(s -> s
            .index(INDEX)
            .size(0)
            .aggregations("monthly_counts", a -> a
                .dateHistogram(dh -> dh
                    .field("created_at")
                    .calendarInterval(CalendarInterval.Month)
                    .format("yyyy-MM")
                    .minDocCount(0)
                )
            ),
            Void.class
        );

        Map<String, Long> result = new LinkedHashMap<>();
        DateHistogramAggregate agg = response.aggregations()
            .get("monthly_counts")
            .dateHistogram();

        for (DateHistogramBucket bucket : agg.buckets().array()) {
            result.put(bucket.keyAsString(), bucket.docCount());
        }

        return result;
    }

    // Stats aggregation
    public StatsResult getCreatedAtStats() throws IOException {
        SearchResponse<Void> response = client.search(s -> s
            .index(INDEX)
            .size(0)
            .aggregations("date_stats", a -> a
                .stats(st -> st.field("created_at"))
            ),
            Void.class
        );

        StatsAggregate stats = response.aggregations().get("date_stats").stats();
        return new StatsResult(
            stats.count(),
            stats.minAsString(),
            stats.maxAsString(),
            stats.avgAsString()
        );
    }

    // Multi-aggregation query
    public DashboardStats getDashboardStats() throws IOException {
        SearchResponse<Void> response = client.search(s -> s
            .index(INDEX)
            .size(0)
            .aggregations("total", a -> a.valueCount(vc -> vc.field("id")))
            .aggregations("by_status", a -> a.terms(t -> t.field("status")))
            .aggregations("by_month", a -> a
                .dateHistogram(dh -> dh
                    .field("created_at")
                    .calendarInterval(CalendarInterval.Month)
                    .format("yyyy-MM")
                )
            )
            .aggregations("top_tags", a -> a.terms(t -> t.field("tags").size(10))),
            Void.class
        );

        long total = (long) response.aggregations().get("total").valueCount().value();

        Map<String, Long> byStatus = new HashMap<>();
        for (StringTermsBucket bucket : response.aggregations()
                .get("by_status").sterms().buckets().array()) {
            byStatus.put(bucket.key().stringValue(), bucket.docCount());
        }

        Map<String, Long> byMonth = new LinkedHashMap<>();
        for (DateHistogramBucket bucket : response.aggregations()
                .get("by_month").dateHistogram().buckets().array()) {
            byMonth.put(bucket.keyAsString(), bucket.docCount());
        }

        Map<String, Long> topTags = new LinkedHashMap<>();
        for (StringTermsBucket bucket : response.aggregations()
                .get("top_tags").sterms().buckets().array()) {
            topTags.put(bucket.key().stringValue(), bucket.docCount());
        }

        return new DashboardStats(total, byStatus, byMonth, topTags);
    }

    // Nested aggregation with sub-aggregation
    public Map<String, Map<String, Long>> countTagsByStatus() throws IOException {
        SearchResponse<Void> response = client.search(s -> s
            .index(INDEX)
            .size(0)
            .aggregations("by_status", a -> a
                .terms(t -> t.field("status"))
                .aggregations("tags", sub -> sub
                    .terms(t -> t.field("tags").size(5))
                )
            ),
            Void.class
        );

        Map<String, Map<String, Long>> result = new LinkedHashMap<>();

        for (StringTermsBucket statusBucket : response.aggregations()
                .get("by_status").sterms().buckets().array()) {

            String status = statusBucket.key().stringValue();
            Map<String, Long> tags = new LinkedHashMap<>();

            for (StringTermsBucket tagBucket : statusBucket.aggregations()
                    .get("tags").sterms().buckets().array()) {
                tags.put(tagBucket.key().stringValue(), tagBucket.docCount());
            }

            result.put(status, tags);
        }

        return result;
    }

    // Result records
    public record StatsResult(long count, String min, String max, String avg) {}

    public record DashboardStats(
        long total,
        Map<String, Long> byStatus,
        Map<String, Long> byMonth,
        Map<String, Long> topTags
    ) {}
}`,
      explanation: 'Elasticsearch aggregations for analytics, faceted search, and dashboards.',
      bestPractices: ['Use size(0) when only aggregations needed', 'Use LinkedHashMap for ordered results', 'Combine multiple aggregations in one query'],
      commonMistakes: ['Fetching documents when only aggregations needed', 'Not setting aggregation size'],
      java21Tips: ['Use records for aggregation result DTOs']
    })
  },

  ES_GEO_SERVICE: {
    name: 'ES Geo Service',
    description: 'Geo-spatial queries',
    generate: (className, packageName) => ({
      name: `${className} Geo Service`,
      fileName: `${className}GeoService.java`,
      packagePath: `${packageName}.service`,
      useCase: 'Elasticsearch geo-spatial queries for location-based search',
      code: `package ${packageName}.service;

import ${packageName}.document.${className}Document;
import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.GeoDistanceType;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.Hit;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ${className}GeoService {

    private final ElasticsearchClient client;
    private static final String INDEX = "${className.toLowerCase()}s";

    public ${className}GeoService(ElasticsearchClient client) {
        this.client = client;
    }

    // Find within distance (radius search)
    public List<${className}Document> findWithinDistance(
            double lat,
            double lon,
            String distance,
            int size) throws IOException {

        SearchResponse<${className}Document> response = client.search(s -> s
            .index(INDEX)
            .size(size)
            .query(q -> q
                .geoDistance(gd -> gd
                    .field("location")
                    .location(loc -> loc.latlon(ll -> ll.lat(lat).lon(lon)))
                    .distance(distance)
                    .distanceType(GeoDistanceType.Arc)
                )
            )
            .sort(sort -> sort
                .geoDistance(gs -> gs
                    .field("location")
                    .location(loc -> loc.latlon(ll -> ll.lat(lat).lon(lon)))
                    .order(SortOrder.Asc)
                    .unit(co.elastic.clients.elasticsearch._types.DistanceUnit.Kilometers)
                )
            ),
            ${className}Document.class
        );

        return response.hits().hits().stream()
            .map(Hit::source)
            .collect(Collectors.toList());
    }

    // Find within bounding box
    public List<${className}Document> findWithinBoundingBox(
            double topLeftLat,
            double topLeftLon,
            double bottomRightLat,
            double bottomRightLon,
            int size) throws IOException {

        SearchResponse<${className}Document> response = client.search(s -> s
            .index(INDEX)
            .size(size)
            .query(q -> q
                .geoBoundingBox(gb -> gb
                    .field("location")
                    .boundingBox(bb -> bb
                        .tlbr(tlbr -> tlbr
                            .topLeft(tl -> tl.latlon(ll -> ll.lat(topLeftLat).lon(topLeftLon)))
                            .bottomRight(br -> br.latlon(ll -> ll.lat(bottomRightLat).lon(bottomRightLon)))
                        )
                    )
                )
            ),
            ${className}Document.class
        );

        return response.hits().hits().stream()
            .map(Hit::source)
            .collect(Collectors.toList());
    }

    // Find within polygon
    public List<${className}Document> findWithinPolygon(
            List<double[]> polygonPoints,
            int size) throws IOException {

        SearchResponse<${className}Document> response = client.search(s -> s
            .index(INDEX)
            .size(size)
            .query(q -> q
                .geoPolygon(gp -> gp
                    .field("location")
                    .polygon(p -> p.points(
                        polygonPoints.stream()
                            .map(point -> co.elastic.clients.elasticsearch._types.GeoLocation.of(
                                gl -> gl.latlon(ll -> ll.lat(point[0]).lon(point[1]))
                            ))
                            .collect(Collectors.toList())
                    ))
                )
            ),
            ${className}Document.class
        );

        return response.hits().hits().stream()
            .map(Hit::source)
            .collect(Collectors.toList());
    }

    // Search with geo distance filter and text query
    public List<${className}Document> searchNearby(
            String query,
            double lat,
            double lon,
            String distance,
            int size) throws IOException {

        SearchResponse<${className}Document> response = client.search(s -> s
            .index(INDEX)
            .size(size)
            .query(q -> q
                .bool(b -> b
                    .must(m -> m.multiMatch(mm -> mm
                        .query(query)
                        .fields("name", "description")
                    ))
                    .filter(f -> f.geoDistance(gd -> gd
                        .field("location")
                        .location(loc -> loc.latlon(ll -> ll.lat(lat).lon(lon)))
                        .distance(distance)
                    ))
                )
            )
            .sort(sort -> sort
                .geoDistance(gs -> gs
                    .field("location")
                    .location(loc -> loc.latlon(ll -> ll.lat(lat).lon(lon)))
                    .order(SortOrder.Asc)
                    .unit(co.elastic.clients.elasticsearch._types.DistanceUnit.Kilometers)
                )
            ),
            ${className}Document.class
        );

        return response.hits().hits().stream()
            .map(Hit::source)
            .collect(Collectors.toList());
    }

    // Geo aggregation - distance ranges
    public List<DistanceRangeBucket> aggregateByDistance(
            double lat,
            double lon) throws IOException {

        SearchResponse<Void> response = client.search(s -> s
            .index(INDEX)
            .size(0)
            .aggregations("distance_ranges", a -> a
                .geoDistance(gd -> gd
                    .field("location")
                    .origin(o -> o.latlon(ll -> ll.lat(lat).lon(lon)))
                    .unit(co.elastic.clients.elasticsearch._types.DistanceUnit.Kilometers)
                    .ranges(
                        r -> r.to(1.0),
                        r -> r.from(1.0).to(5.0),
                        r -> r.from(5.0).to(10.0),
                        r -> r.from(10.0).to(50.0),
                        r -> r.from(50.0)
                    )
                )
            ),
            Void.class
        );

        return response.aggregations()
            .get("distance_ranges")
            .geoDistance()
            .buckets()
            .array()
            .stream()
            .map(bucket -> new DistanceRangeBucket(
                bucket.from(),
                bucket.to(),
                bucket.docCount()
            ))
            .collect(Collectors.toList());
    }

    public record DistanceRangeBucket(Double from, Double to, long count) {}
}`,
      explanation: 'Geo-spatial queries including radius search, bounding box, polygon, and geo aggregations.',
      bestPractices: ['Use filter context for geo queries when combining with text search', 'Sort by distance for nearest results', 'Use Arc distance type for accuracy'],
      commonMistakes: ['Not using geo_point mapping', 'Wrong coordinate order (ES uses lat,lon)'],
      java21Tips: ['Use records for geo result containers']
    })
  },

  ES_SCROLL_SERVICE: {
    name: 'ES Scroll Service',
    description: 'Scroll API for large datasets',
    generate: (className, packageName) => ({
      name: `${className} Scroll Service`,
      fileName: `${className}ScrollService.java`,
      packagePath: `${packageName}.service`,
      useCase: 'Elasticsearch scroll and search_after for processing large datasets',
      code: `package ${packageName}.service;

import ${packageName}.document.${className}Document;
import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.Time;
import co.elastic.clients.elasticsearch.core.*;
import co.elastic.clients.elasticsearch.core.search.Hit;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;
import java.util.stream.Collectors;

@Service
public class ${className}ScrollService {

    private final ElasticsearchClient client;
    private static final String INDEX = "${className.toLowerCase()}s";
    private static final int SCROLL_SIZE = 1000;

    public ${className}ScrollService(ElasticsearchClient client) {
        this.client = client;
    }

    // Scroll through all documents
    public void scrollAll(Consumer<List<${className}Document>> batchProcessor) throws IOException {
        // Initial search with scroll
        SearchResponse<${className}Document> response = client.search(s -> s
            .index(INDEX)
            .size(SCROLL_SIZE)
            .scroll(Time.of(t -> t.time("5m")))
            .query(q -> q.matchAll(m -> m))
            .sort(sort -> sort.field(f -> f.field("_doc"))),
            ${className}Document.class
        );

        String scrollId = response.scrollId();
        List<Hit<${className}Document>> hits = response.hits().hits();

        try {
            while (!hits.isEmpty()) {
                List<${className}Document> documents = hits.stream()
                    .map(Hit::source)
                    .collect(Collectors.toList());

                batchProcessor.accept(documents);

                // Continue scrolling
                ScrollResponse<${className}Document> scrollResponse = client.scroll(sc -> sc
                    .scrollId(scrollId)
                    .scroll(Time.of(t -> t.time("5m"))),
                    ${className}Document.class
                );

                scrollId = scrollResponse.scrollId();
                hits = scrollResponse.hits().hits();
            }
        } finally {
            // Clear scroll context
            if (scrollId != null) {
                client.clearScroll(c -> c.scrollId(scrollId));
            }
        }
    }

    // Search_after for deep pagination (preferred over scroll for user-facing)
    public SearchAfterResult<${className}Document> searchAfter(
            Object[] searchAfter,
            int size) throws IOException {

        SearchResponse<${className}Document> response = client.search(s -> {
            s.index(INDEX)
                .size(size)
                .query(q -> q.matchAll(m -> m))
                .sort(sort -> sort.field(f -> f.field("created_at").order(SortOrder.Desc)))
                .sort(sort -> sort.field(f -> f.field("id").order(SortOrder.Asc)));

            if (searchAfter != null && searchAfter.length > 0) {
                s.searchAfter(List.of(
                    co.elastic.clients.elasticsearch._types.FieldValue.of(searchAfter[0].toString()),
                    co.elastic.clients.elasticsearch._types.FieldValue.of(searchAfter[1].toString())
                ));
            }

            return s;
        }, ${className}Document.class);

        List<${className}Document> documents = response.hits().hits().stream()
            .map(Hit::source)
            .collect(Collectors.toList());

        // Get sort values from last hit for next page
        Object[] nextSearchAfter = null;
        List<Hit<${className}Document>> hits = response.hits().hits();
        if (!hits.isEmpty()) {
            Hit<${className}Document> lastHit = hits.get(hits.size() - 1);
            if (lastHit.sort() != null && !lastHit.sort().isEmpty()) {
                nextSearchAfter = lastHit.sort().stream()
                    .map(fv -> fv.stringValue())
                    .toArray();
            }
        }

        return new SearchAfterResult<>(documents, nextSearchAfter);
    }

    // Process all documents with search_after (for exports, migrations)
    public void processAll(Consumer<${className}Document> processor) throws IOException {
        Object[] searchAfter = null;
        boolean hasMore = true;

        while (hasMore) {
            SearchAfterResult<${className}Document> result = searchAfter(searchAfter, SCROLL_SIZE);

            for (${className}Document doc : result.documents()) {
                processor.accept(doc);
            }

            searchAfter = result.nextSearchAfter();
            hasMore = result.documents().size() == SCROLL_SIZE && searchAfter != null;
        }
    }

    // Export all documents
    public List<${className}Document> exportAll() throws IOException {
        List<${className}Document> allDocuments = new ArrayList<>();
        processAll(allDocuments::add);
        return allDocuments;
    }

    // Point-in-time for consistent snapshots
    public List<${className}Document> searchWithPit(String query, int size) throws IOException {
        // Open point-in-time
        OpenPointInTimeResponse pitResponse = client.openPointInTime(o -> o
            .index(INDEX)
            .keepAlive(Time.of(t -> t.time("5m")))
        );

        String pitId = pitResponse.id();

        try {
            SearchResponse<${className}Document> response = client.search(s -> s
                .pit(p -> p.id(pitId).keepAlive(Time.of(t -> t.time("5m"))))
                .size(size)
                .query(q -> q.match(m -> m.field("name").query(query)))
                .sort(sort -> sort.field(f -> f.field("_shard_doc"))),
                ${className}Document.class
            );

            return response.hits().hits().stream()
                .map(Hit::source)
                .collect(Collectors.toList());

        } finally {
            // Close point-in-time
            client.closePointInTime(c -> c.id(pitId));
        }
    }

    public record SearchAfterResult<T>(List<T> documents, Object[] nextSearchAfter) {}
}`,
      explanation: 'Scroll API and search_after for efficient processing of large datasets.',
      bestPractices: ['Use scroll for batch processing, search_after for pagination', 'Always clear scroll context', 'Use point-in-time for consistent results'],
      commonMistakes: ['Not clearing scroll context', 'Using scroll for user-facing pagination'],
      java21Tips: ['Use virtual threads for parallel batch processing']
    })
  }
};
