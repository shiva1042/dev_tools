// Neo4j Templates

export const neo4jTemplates = {
  NEO4J_CONFIG: {
    name: 'Neo4j Config',
    description: 'Neo4j driver configuration',
    generate: (className, packageName) => ({
      name: 'Neo4j Configuration',
      fileName: 'Neo4jConfig.java',
      packagePath: `${packageName}.config`,
      useCase: 'Neo4j driver configuration with connection pooling',
      code: `package ${packageName}.config;

import org.neo4j.driver.AuthTokens;
import org.neo4j.driver.Config;
import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.neo4j.config.AbstractNeo4jConfig;
import org.springframework.data.neo4j.repository.config.EnableNeo4jRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableNeo4jRepositories(basePackages = "${packageName}.repository")
@EnableTransactionManagement
public class Neo4jConfig extends AbstractNeo4jConfig {

    @Value("\${neo4j.uri:bolt://localhost:7687}")
    private String uri;

    @Value("\${neo4j.username:neo4j}")
    private String username;

    @Value("\${neo4j.password:password}")
    private String password;

    @Value("\${neo4j.database:neo4j}")
    private String database;

    @Value("\${neo4j.max-connection-pool-size:50}")
    private int maxConnectionPoolSize;

    @Value("\${neo4j.connection-acquisition-timeout:60}")
    private int connectionAcquisitionTimeout;

    @Bean
    @Override
    public Driver driver() {
        Config config = Config.builder()
                .withMaxConnectionPoolSize(maxConnectionPoolSize)
                .withConnectionAcquisitionTimeout(connectionAcquisitionTimeout, TimeUnit.SECONDS)
                .withMaxConnectionLifetime(30, TimeUnit.MINUTES)
                .withConnectionLivenessCheckTimeout(1, TimeUnit.MINUTES)
                .withEncryption()
                .build();

        return GraphDatabase.driver(uri, AuthTokens.basic(username, password), config);
    }

    @Override
    protected String database() {
        return database;
    }
}

/*
 * application.yml:
 *
 * neo4j:
 *   uri: bolt://localhost:7687
 *   username: neo4j
 *   password: your-password
 *   database: neo4j
 *   max-connection-pool-size: 50
 *   connection-acquisition-timeout: 60
 *
 * pom.xml dependencies:
 *   <dependency>
 *     <groupId>org.springframework.boot</groupId>
 *     <artifactId>spring-boot-starter-data-neo4j</artifactId>
 *   </dependency>
 */`,
      explanation: 'Neo4j configuration with Spring Data Neo4j and connection pooling.',
      bestPractices: ['Configure connection pool size', 'Enable transaction management', 'Use encryption in production'],
      commonMistakes: ['Not configuring pool size for high load', 'Missing transaction management'],
      java21Tips: ['Virtual threads work well with Neo4j async operations']
    })
  },

  NODE_ENTITY: {
    name: 'Node Entity',
    description: 'Neo4j node entity',
    generate: (className, packageName) => ({
      name: `${className} Node`,
      fileName: `${className}Node.java`,
      packagePath: `${packageName}.entity`,
      useCase: 'Neo4j node entity with properties and relationships',
      code: `package ${packageName}.entity;

import org.springframework.data.neo4j.core.schema.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Node("${className}")
public class ${className}Node {

    @Id
    @GeneratedValue
    private Long id;

    @Property("name")
    private String name;

    @Property("description")
    private String description;

    @Property("status")
    private String status;

    @Property("created_at")
    private LocalDateTime createdAt;

    @Property("updated_at")
    private LocalDateTime updatedAt;

    // Outgoing relationship: this node -> other nodes
    @Relationship(type = "RELATES_TO", direction = Relationship.Direction.OUTGOING)
    private Set<${className}Node> relatedTo = new HashSet<>();

    // Incoming relationship: other nodes -> this node
    @Relationship(type = "RELATES_TO", direction = Relationship.Direction.INCOMING)
    private Set<${className}Node> relatedFrom = new HashSet<>();

    // Relationship with properties
    @Relationship(type = "CONNECTED_TO", direction = Relationship.Direction.OUTGOING)
    private Set<ConnectionRelationship> connections = new HashSet<>();

    // Constructors
    public ${className}Node() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public ${className}Node(String name, String description) {
        this();
        this.name = name;
        this.description = description;
        this.status = "ACTIVE";
    }

    // Relationship methods
    public void addRelation(${className}Node other) {
        this.relatedTo.add(other);
    }

    public void removeRelation(${className}Node other) {
        this.relatedTo.remove(other);
    }

    public void addConnection(${className}Node target, String connectionType, int weight) {
        this.connections.add(new ConnectionRelationship(target, connectionType, weight));
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Set<${className}Node> getRelatedTo() { return relatedTo; }
    public void setRelatedTo(Set<${className}Node> relatedTo) { this.relatedTo = relatedTo; }

    public Set<${className}Node> getRelatedFrom() { return relatedFrom; }
    public void setRelatedFrom(Set<${className}Node> relatedFrom) { this.relatedFrom = relatedFrom; }

    public Set<ConnectionRelationship> getConnections() { return connections; }
    public void setConnections(Set<ConnectionRelationship> connections) { this.connections = connections; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ${className}Node that)) return false;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "${className}Node{id=" + id + ", name='" + name + "'}";
    }
}`,
      explanation: 'Neo4j node entity with properties, relationships, and relationship properties.',
      bestPractices: ['Use @GeneratedValue for IDs', 'Define relationship directions explicitly', 'Initialize collections'],
      commonMistakes: ['Circular references causing stack overflow', 'Missing relationship direction'],
      java21Tips: ['Use pattern matching in equals()']
    })
  },

  RELATIONSHIP_ENTITY: {
    name: 'Relationship Entity',
    description: 'Neo4j relationship with properties',
    generate: (className, packageName) => ({
      name: `${className} Relationship`,
      fileName: 'ConnectionRelationship.java',
      packagePath: `${packageName}.entity`,
      useCase: 'Neo4j relationship entity with properties',
      code: `package ${packageName}.entity;

import org.springframework.data.neo4j.core.schema.*;

import java.time.LocalDateTime;

@RelationshipProperties
public class ConnectionRelationship {

    @Id
    @GeneratedValue
    private Long id;

    @TargetNode
    private ${className}Node target;

    @Property("connection_type")
    private String connectionType;

    @Property("weight")
    private int weight;

    @Property("created_at")
    private LocalDateTime createdAt;

    @Property("metadata")
    private String metadata;

    // Constructors
    public ConnectionRelationship() {
        this.createdAt = LocalDateTime.now();
    }

    public ConnectionRelationship(${className}Node target, String connectionType, int weight) {
        this();
        this.target = target;
        this.connectionType = connectionType;
        this.weight = weight;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ${className}Node getTarget() { return target; }
    public void setTarget(${className}Node target) { this.target = target; }

    public String getConnectionType() { return connectionType; }
    public void setConnectionType(String connectionType) { this.connectionType = connectionType; }

    public int getWeight() { return weight; }
    public void setWeight(int weight) { this.weight = weight; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }
}

/*
 * Cypher representation:
 * (source)-[r:CONNECTED_TO {connection_type: "...", weight: 10, created_at: datetime()}]->(target)
 */`,
      explanation: 'Neo4j relationship entity with custom properties using @RelationshipProperties.',
      bestPractices: ['Use @TargetNode for the end node', 'Store relationship metadata as properties', 'Use meaningful relationship types'],
      commonMistakes: ['Forgetting @TargetNode annotation', 'Not using @RelationshipProperties'],
      java21Tips: ['Consider records for simple relationship data']
    })
  },

  NEO4J_REPOSITORY: {
    name: 'Neo4j Repository',
    description: 'Repository with Cypher queries',
    generate: (className, packageName) => ({
      name: `${className} Repository`,
      fileName: `${className}Repository.java`,
      packagePath: `${packageName}.repository`,
      useCase: 'Neo4j repository with custom Cypher queries',
      code: `package ${packageName}.repository;

import ${packageName}.entity.${className}Node;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ${className}Repository extends Neo4jRepository<${className}Node, Long> {

    // Derived query methods
    Optional<${className}Node> findByName(String name);

    List<${className}Node> findByStatus(String status);

    List<${className}Node> findByNameContainingIgnoreCase(String name);

    boolean existsByName(String name);

    // Custom Cypher queries
    @Query("MATCH (n:${className}) WHERE n.name CONTAINS $keyword RETURN n ORDER BY n.name LIMIT $limit")
    List<${className}Node> searchByName(@Param("keyword") String keyword, @Param("limit") int limit);

    @Query("MATCH (n:${className}) WHERE n.status = $status RETURN n ORDER BY n.created_at DESC")
    List<${className}Node> findByStatusOrdered(@Param("status") String status);

    // Find with relationships
    @Query("MATCH (n:${className})-[r:RELATES_TO]->(m:${className}) WHERE n.id = $id RETURN n, collect(r), collect(m)")
    Optional<${className}Node> findByIdWithRelations(@Param("id") Long id);

    // Find neighbors (directly connected nodes)
    @Query("MATCH (n:${className} {id: $id})-[:RELATES_TO]-(neighbor) RETURN neighbor")
    List<${className}Node> findNeighbors(@Param("id") Long id);

    // Find at depth
    @Query("MATCH (n:${className} {id: $id})-[:RELATES_TO*1..$depth]-(connected) RETURN DISTINCT connected")
    List<${className}Node> findConnectedAtDepth(@Param("id") Long id, @Param("depth") int depth);

    // Count relationships
    @Query("MATCH (n:${className} {id: $id})-[r:RELATES_TO]->() RETURN count(r)")
    long countOutgoingRelations(@Param("id") Long id);

    @Query("MATCH ()-[r:RELATES_TO]->(n:${className} {id: $id}) RETURN count(r)")
    long countIncomingRelations(@Param("id") Long id);

    // Aggregation queries
    @Query("MATCH (n:${className}) RETURN n.status as status, count(n) as count")
    List<StatusCount> countByStatus();

    // Find by relationship property
    @Query("MATCH (n:${className})-[r:CONNECTED_TO {connection_type: $type}]->(m:${className}) " +
           "WHERE n.id = $id RETURN m")
    List<${className}Node> findByConnectionType(@Param("id") Long id, @Param("type") String type);

    // Find with weighted connections
    @Query("MATCH (n:${className} {id: $id})-[r:CONNECTED_TO]->(m) " +
           "WHERE r.weight >= $minWeight RETURN m ORDER BY r.weight DESC")
    List<${className}Node> findStrongConnections(@Param("id") Long id, @Param("minWeight") int minWeight);

    // Bulk delete by status
    @Query("MATCH (n:${className}) WHERE n.status = $status DETACH DELETE n")
    void deleteByStatus(@Param("status") String status);

    // Update property
    @Query("MATCH (n:${className}) WHERE n.id = $id SET n.status = $status, n.updated_at = datetime() RETURN n")
    Optional<${className}Node> updateStatus(@Param("id") Long id, @Param("status") String status);

    // Projection interface
    interface StatusCount {
        String getStatus();
        Long getCount();
    }
}`,
      explanation: 'Neo4j repository with derived queries and custom Cypher queries for graph operations.',
      bestPractices: ['Use @Query for complex graph traversals', 'Use DETACH DELETE to remove nodes with relationships', 'Define projections for aggregations'],
      commonMistakes: ['Forgetting DETACH before DELETE', 'Not using parameters in Cypher'],
      java21Tips: ['Use sealed interfaces for projections']
    })
  },

  NEO4J_SERVICE: {
    name: 'Neo4j Service',
    description: 'Service layer for graph operations',
    generate: (className, packageName) => ({
      name: `${className} Service`,
      fileName: `${className}Service.java`,
      packagePath: `${packageName}.service`,
      useCase: 'Service layer for Neo4j graph operations',
      code: `package ${packageName}.service;

import ${packageName}.entity.${className}Node;
import ${packageName}.repository.${className}Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class ${className}Service {

    private final ${className}Repository repository;

    public ${className}Service(${className}Repository repository) {
        this.repository = repository;
    }

    // CRUD Operations
    public Optional<${className}Node> findById(Long id) {
        return repository.findById(id);
    }

    public ${className}Node getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NodeNotFoundException("${className} not found: " + id));
    }

    public Optional<${className}Node> findByName(String name) {
        return repository.findByName(name);
    }

    public List<${className}Node> findAll() {
        return repository.findAll();
    }

    public List<${className}Node> findByStatus(String status) {
        return repository.findByStatus(status);
    }

    public List<${className}Node> search(String keyword, int limit) {
        return repository.searchByName(keyword, limit);
    }

    @Transactional
    public ${className}Node create(${className}Node node) {
        if (repository.existsByName(node.getName())) {
            throw new DuplicateNodeException("${className} already exists: " + node.getName());
        }
        return repository.save(node);
    }

    @Transactional
    public ${className}Node update(Long id, ${className}Node updated) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setName(updated.getName());
                    existing.setDescription(updated.getDescription());
                    existing.setStatus(updated.getStatus());
                    existing.setUpdatedAt(LocalDateTime.now());
                    return repository.save(existing);
                })
                .orElseThrow(() -> new NodeNotFoundException("${className} not found: " + id));
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    // Relationship Operations
    public Optional<${className}Node> findWithRelations(Long id) {
        return repository.findByIdWithRelations(id);
    }

    public List<${className}Node> findNeighbors(Long id) {
        return repository.findNeighbors(id);
    }

    public List<${className}Node> findConnectedAtDepth(Long id, int depth) {
        return repository.findConnectedAtDepth(id, depth);
    }

    @Transactional
    public void createRelation(Long sourceId, Long targetId) {
        ${className}Node source = getById(sourceId);
        ${className}Node target = getById(targetId);
        source.addRelation(target);
        repository.save(source);
    }

    @Transactional
    public void removeRelation(Long sourceId, Long targetId) {
        ${className}Node source = getById(sourceId);
        ${className}Node target = getById(targetId);
        source.removeRelation(target);
        repository.save(source);
    }

    @Transactional
    public void createConnection(Long sourceId, Long targetId, String type, int weight) {
        ${className}Node source = getById(sourceId);
        ${className}Node target = getById(targetId);
        source.addConnection(target, type, weight);
        repository.save(source);
    }

    // Statistics
    public long countRelations(Long id, boolean outgoing) {
        return outgoing
                ? repository.countOutgoingRelations(id)
                : repository.countIncomingRelations(id);
    }

    public List<${className}Repository.StatusCount> getStatusCounts() {
        return repository.countByStatus();
    }

    // Exception classes
    public static class NodeNotFoundException extends RuntimeException {
        public NodeNotFoundException(String message) { super(message); }
    }

    public static class DuplicateNodeException extends RuntimeException {
        public DuplicateNodeException(String message) { super(message); }
    }
}`,
      explanation: 'Service layer for Neo4j with CRUD, relationship management, and graph traversal.',
      bestPractices: ['Use transactions for write operations', 'Encapsulate relationship logic', 'Provide depth-limited traversals'],
      commonMistakes: ['Not handling relationship persistence', 'Unbounded graph traversals'],
      java21Tips: ['Use sealed classes for exception hierarchy']
    })
  },

  GRAPH_TRAVERSAL_SERVICE: {
    name: 'Graph Traversal Service',
    description: 'Advanced graph traversal queries',
    generate: (className, packageName) => ({
      name: `${className} Graph Traversal Service`,
      fileName: `${className}GraphService.java`,
      packagePath: `${packageName}.service`,
      useCase: 'Advanced graph traversal, pathfinding, and pattern matching',
      code: `package ${packageName}.service;

import ${packageName}.entity.${className}Node;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;
import org.neo4j.driver.Values;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ${className}GraphService {

    private final Driver driver;

    public ${className}GraphService(Driver driver) {
        this.driver = driver;
    }

    // Shortest path between two nodes
    public PathResult findShortestPath(Long startId, Long endId) {
        String cypher = """
            MATCH path = shortestPath(
                (start:${className} {id: $startId})-[:RELATES_TO*]-(end:${className} {id: $endId})
            )
            RETURN path,
                   [n IN nodes(path) | n.name] as nodeNames,
                   length(path) as pathLength
            """;

        try (Session session = driver.session()) {
            return session.executeRead(tx -> {
                Result result = tx.run(cypher, Values.parameters("startId", startId, "endId", endId));
                if (result.hasNext()) {
                    var record = result.next();
                    return new PathResult(
                            record.get("nodeNames").asList(v -> v.asString()),
                            record.get("pathLength").asInt()
                    );
                }
                return null;
            });
        }
    }

    // All paths between nodes (with max depth)
    public List<PathResult> findAllPaths(Long startId, Long endId, int maxDepth) {
        String cypher = """
            MATCH path = (start:${className} {id: $startId})-[:RELATES_TO*1..""" + maxDepth + """
            ]-(end:${className} {id: $endId})
            RETURN [n IN nodes(path) | n.name] as nodeNames,
                   length(path) as pathLength
            ORDER BY pathLength
            LIMIT 10
            """;

        try (Session session = driver.session()) {
            return session.executeRead(tx -> {
                Result result = tx.run(cypher, Values.parameters("startId", startId, "endId", endId));
                return result.stream()
                        .map(record -> new PathResult(
                                record.get("nodeNames").asList(v -> v.asString()),
                                record.get("pathLength").asInt()
                        ))
                        .collect(Collectors.toList());
            });
        }
    }

    // Weighted shortest path
    public WeightedPathResult findWeightedShortestPath(Long startId, Long endId) {
        String cypher = """
            MATCH (start:${className} {id: $startId}), (end:${className} {id: $endId})
            CALL apoc.algo.dijkstra(start, end, 'CONNECTED_TO', 'weight') YIELD path, weight
            RETURN [n IN nodes(path) | n.name] as nodeNames,
                   weight as totalWeight
            """;

        try (Session session = driver.session()) {
            return session.executeRead(tx -> {
                Result result = tx.run(cypher, Values.parameters("startId", startId, "endId", endId));
                if (result.hasNext()) {
                    var record = result.next();
                    return new WeightedPathResult(
                            record.get("nodeNames").asList(v -> v.asString()),
                            record.get("totalWeight").asDouble()
                    );
                }
                return null;
            });
        }
    }

    // Find common neighbors (intersection)
    public List<String> findCommonNeighbors(Long id1, Long id2) {
        String cypher = """
            MATCH (n1:${className} {id: $id1})-[:RELATES_TO]-(common)-[:RELATES_TO]-(n2:${className} {id: $id2})
            RETURN DISTINCT common.name as name
            """;

        try (Session session = driver.session()) {
            return session.executeRead(tx -> {
                Result result = tx.run(cypher, Values.parameters("id1", id1, "id2", id2));
                return result.stream()
                        .map(record -> record.get("name").asString())
                        .collect(Collectors.toList());
            });
        }
    }

    // Find nodes that form triangles
    public List<TriangleResult> findTriangles() {
        String cypher = """
            MATCH (a:${className})-[:RELATES_TO]-(b:${className})-[:RELATES_TO]-(c:${className})-[:RELATES_TO]-(a)
            WHERE id(a) < id(b) AND id(b) < id(c)
            RETURN a.name as node1, b.name as node2, c.name as node3
            LIMIT 100
            """;

        try (Session session = driver.session()) {
            return session.executeRead(tx -> {
                Result result = tx.run(cypher);
                return result.stream()
                        .map(record -> new TriangleResult(
                                record.get("node1").asString(),
                                record.get("node2").asString(),
                                record.get("node3").asString()
                        ))
                        .collect(Collectors.toList());
            });
        }
    }

    // PageRank-like influence scoring
    public List<NodeScore> calculateInfluence() {
        String cypher = """
            MATCH (n:${className})
            OPTIONAL MATCH (n)<-[r:RELATES_TO]-()
            WITH n, count(r) as inDegree
            OPTIONAL MATCH (n)-[r2:RELATES_TO]->()
            WITH n, inDegree, count(r2) as outDegree
            RETURN n.id as id, n.name as name,
                   inDegree, outDegree,
                   inDegree + outDegree as totalConnections
            ORDER BY totalConnections DESC
            LIMIT 20
            """;

        try (Session session = driver.session()) {
            return session.executeRead(tx -> {
                Result result = tx.run(cypher);
                return result.stream()
                        .map(record -> new NodeScore(
                                record.get("id").asLong(),
                                record.get("name").asString(),
                                record.get("inDegree").asInt(),
                                record.get("outDegree").asInt(),
                                record.get("totalConnections").asInt()
                        ))
                        .collect(Collectors.toList());
            });
        }
    }

    // Find disconnected components
    public List<List<String>> findConnectedComponents() {
        String cypher = """
            CALL gds.wcc.stream({
                nodeProjection: '${className}',
                relationshipProjection: 'RELATES_TO'
            })
            YIELD nodeId, componentId
            WITH componentId, collect(gds.util.asNode(nodeId).name) as members
            RETURN componentId, members
            ORDER BY size(members) DESC
            """;

        try (Session session = driver.session()) {
            return session.executeRead(tx -> {
                Result result = tx.run(cypher);
                return result.stream()
                        .map(record -> record.get("members").asList(v -> v.asString()))
                        .collect(Collectors.toList());
            });
        }
    }

    // Subgraph pattern matching
    public List<Map<String, String>> findPattern(String pattern) {
        // Example pattern: "MATCH (a:${className})-[:RELATES_TO]->(b:${className})-[:RELATES_TO]->(c:${className})"
        String cypher = pattern + """
            WHERE a <> c
            RETURN a.name as a, b.name as b, c.name as c
            LIMIT 50
            """;

        try (Session session = driver.session()) {
            return session.executeRead(tx -> {
                Result result = tx.run(cypher);
                return result.stream()
                        .map(record -> {
                            Map<String, String> map = new HashMap<>();
                            map.put("a", record.get("a").asString());
                            map.put("b", record.get("b").asString());
                            map.put("c", record.get("c").asString());
                            return map;
                        })
                        .collect(Collectors.toList());
            });
        }
    }

    // Result records
    public record PathResult(List<String> nodes, int length) {}
    public record WeightedPathResult(List<String> nodes, double totalWeight) {}
    public record TriangleResult(String node1, String node2, String node3) {}
    public record NodeScore(Long id, String name, int inDegree, int outDegree, int total) {}
}`,
      explanation: 'Advanced graph traversal with pathfinding, pattern matching, and graph algorithms.',
      bestPractices: ['Use parameterized queries', 'Limit result sets', 'Use APOC and GDS for algorithms'],
      commonMistakes: ['Unbounded traversals', 'Not closing sessions', 'Cartesian products in patterns'],
      java21Tips: ['Use text blocks for Cypher queries', 'Records for result types']
    })
  },

  NEO4J_CONTROLLER: {
    name: 'Neo4j Controller',
    description: 'REST controller for graph operations',
    generate: (className, packageName) => ({
      name: `${className} Controller`,
      fileName: `${className}Controller.java`,
      packagePath: `${packageName}.controller`,
      useCase: 'REST controller for Neo4j graph operations',
      code: `package ${packageName}.controller;

import ${packageName}.entity.${className}Node;
import ${packageName}.service.${className}Service;
import ${packageName}.service.${className}GraphService;
import ${packageName}.service.${className}GraphService.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/${className.toLowerCase()}s")
public class ${className}Controller {

    private final ${className}Service service;
    private final ${className}GraphService graphService;

    public ${className}Controller(${className}Service service, ${className}GraphService graphService) {
        this.service = service;
        this.graphService = graphService;
    }

    // CRUD endpoints
    @GetMapping
    public ResponseEntity<List<${className}Response>> findAll() {
        List<${className}Response> response = service.findAll().stream()
                .map(${className}Response::from)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<${className}Response> findById(@PathVariable Long id) {
        return service.findById(id)
                .map(${className}Response::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/with-relations")
    public ResponseEntity<${className}Response> findWithRelations(@PathVariable Long id) {
        return service.findWithRelations(id)
                .map(${className}Response::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<${className}Response>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit) {
        List<${className}Response> response = service.search(q, limit).stream()
                .map(${className}Response::from)
                .toList();
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<${className}Response> create(@RequestBody ${className}Request request) {
        ${className}Node node = request.toNode();
        ${className}Node saved = service.create(node);
        return ResponseEntity.status(HttpStatus.CREATED).body(${className}Response.from(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<${className}Response> update(
            @PathVariable Long id,
            @RequestBody ${className}Request request) {
        ${className}Node updated = service.update(id, request.toNode());
        return ResponseEntity.ok(${className}Response.from(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Relationship endpoints
    @GetMapping("/{id}/neighbors")
    public ResponseEntity<List<${className}Response>> getNeighbors(@PathVariable Long id) {
        List<${className}Response> response = service.findNeighbors(id).stream()
                .map(${className}Response::from)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/connected")
    public ResponseEntity<List<${className}Response>> getConnected(
            @PathVariable Long id,
            @RequestParam(defaultValue = "2") int depth) {
        List<${className}Response> response = service.findConnectedAtDepth(id, depth).stream()
                .map(${className}Response::from)
                .toList();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{sourceId}/relations/{targetId}")
    public ResponseEntity<Void> createRelation(
            @PathVariable Long sourceId,
            @PathVariable Long targetId) {
        service.createRelation(sourceId, targetId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{sourceId}/relations/{targetId}")
    public ResponseEntity<Void> removeRelation(
            @PathVariable Long sourceId,
            @PathVariable Long targetId) {
        service.removeRelation(sourceId, targetId);
        return ResponseEntity.noContent().build();
    }

    // Graph traversal endpoints
    @GetMapping("/path")
    public ResponseEntity<PathResult> findShortestPath(
            @RequestParam Long start,
            @RequestParam Long end) {
        PathResult path = graphService.findShortestPath(start, end);
        return path != null ? ResponseEntity.ok(path) : ResponseEntity.notFound().build();
    }

    @GetMapping("/paths")
    public ResponseEntity<List<PathResult>> findAllPaths(
            @RequestParam Long start,
            @RequestParam Long end,
            @RequestParam(defaultValue = "5") int maxDepth) {
        return ResponseEntity.ok(graphService.findAllPaths(start, end, maxDepth));
    }

    @GetMapping("/common-neighbors")
    public ResponseEntity<List<String>> findCommonNeighbors(
            @RequestParam Long id1,
            @RequestParam Long id2) {
        return ResponseEntity.ok(graphService.findCommonNeighbors(id1, id2));
    }

    @GetMapping("/influence")
    public ResponseEntity<List<NodeScore>> getInfluenceScores() {
        return ResponseEntity.ok(graphService.calculateInfluence());
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        var statusCounts = service.getStatusCounts();
        return ResponseEntity.ok(Map.of(
                "statusCounts", statusCounts,
                "totalNodes", service.findAll().size()
        ));
    }

    // DTOs
    public record ${className}Request(String name, String description, String status) {
        public ${className}Node toNode() {
            ${className}Node node = new ${className}Node(name, description);
            if (status != null) node.setStatus(status);
            return node;
        }
    }

    public record ${className}Response(
            Long id,
            String name,
            String description,
            String status,
            int relationCount
    ) {
        public static ${className}Response from(${className}Node node) {
            return new ${className}Response(
                    node.getId(),
                    node.getName(),
                    node.getDescription(),
                    node.getStatus(),
                    node.getRelatedTo() != null ? node.getRelatedTo().size() : 0
            );
        }
    }
}`,
      explanation: 'REST controller with CRUD, relationship management, and graph traversal endpoints.',
      bestPractices: ['Separate graph operations from CRUD', 'Use DTOs for API responses', 'Limit traversal depth via parameter'],
      commonMistakes: ['Exposing internal node structure', 'Unbounded traversal endpoints'],
      java21Tips: ['Use records for request/response DTOs']
    })
  },

  NEO4J_PROJECTIONS: {
    name: 'Neo4j Projections',
    description: 'DTO projections for Neo4j queries',
    generate: (className, packageName) => ({
      name: `${className} Projections`,
      fileName: `${className}Projections.java`,
      packagePath: `${packageName}.dto`,
      useCase: 'DTO projections for efficient Neo4j queries',
      code: `package ${packageName}.dto;

import org.springframework.data.neo4j.core.schema.Id;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Projection interfaces and records for Neo4j queries
 */
public class ${className}Projections {

    // Simple projection - only basic fields
    public record ${className}Summary(
        Long id,
        String name,
        String status
    ) {}

    // Projection with computed fields
    public record ${className}WithStats(
        Long id,
        String name,
        String status,
        int incomingRelations,
        int outgoingRelations,
        LocalDateTime lastActivity
    ) {}

    // Projection for graph visualization
    public record ${className}GraphNode(
        Long id,
        String name,
        String status,
        String group,
        int size
    ) {}

    // Projection for relationship
    public record ${className}Relationship(
        Long sourceId,
        String sourceName,
        Long targetId,
        String targetName,
        String relationshipType,
        int weight
    ) {}

    // Graph visualization data
    public record GraphVisualization(
        List<${className}GraphNode> nodes,
        List<${className}Edge> edges
    ) {}

    public record ${className}Edge(
        Long source,
        Long target,
        String type,
        int weight
    ) {}

    // Path projection
    public record ${className}Path(
        List<${className}Summary> nodes,
        List<String> relationships,
        int length,
        double totalWeight
    ) {}

    // Hierarchy projection (for tree structures)
    public record ${className}TreeNode(
        Long id,
        String name,
        List<${className}TreeNode> children,
        int depth,
        int childCount
    ) {}

    // Search result with score
    public record ${className}SearchHit(
        Long id,
        String name,
        String description,
        double score,
        List<String> matchedFields
    ) {}

    // Aggregation result
    public record ${className}Aggregation(
        String groupBy,
        long count,
        double avgConnections,
        LocalDateTime oldest,
        LocalDateTime newest
    ) {}

    // Recommendation result
    public record ${className}Recommendation(
        Long id,
        String name,
        double score,
        String reason,
        List<String> commonConnections
    ) {}
}`,
      explanation: 'DTO projections for efficient Neo4j query results and graph visualization.',
      bestPractices: ['Use projections to avoid fetching unnecessary data', 'Create specific projections for each use case', 'Include computed fields in projections'],
      commonMistakes: ['Fetching full entities when only summary needed', 'Not using projections for API responses'],
      java21Tips: ['Records are perfect for immutable projections']
    })
  }
};
