// PostgreSQL / JPA Templates

export const postgresqlTemplates = {
  JPA_ENTITY: {
    name: 'JPA Entity',
    description: 'JPA entity with auditing and validation',
    generate: (className, packageName) => ({
      name: `${className} Entity`,
      fileName: `${className}.java`,
      packagePath: `${packageName}.entity`,
      useCase: 'JPA entity with full annotations, auditing, and validation',
      code: `package ${packageName}.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "${className.toLowerCase()}s", indexes = {
    @Index(name = "idx_${className.toLowerCase()}_name", columnList = "name"),
    @Index(name = "idx_${className.toLowerCase()}_status", columnList = "status")
})
@EntityListeners(AuditingEntityListener.class)
public class ${className} {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Column(nullable = false, length = 100)
    private String name;

    @Size(max = 500)
    @Column(length = 500)
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.ACTIVE;

    @Email(message = "Invalid email format")
    @Column(unique = true)
    private String email;

    @Version
    private Long version;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @CreatedBy
    @Column(updatable = false)
    private String createdBy;

    @LastModifiedBy
    private String updatedBy;

    public enum Status {
        ACTIVE, INACTIVE, PENDING, ARCHIVED
    }

    // Constructors
    public ${className}() {}

    public ${className}(String name, String description) {
        this.name = name;
        this.description = description;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Long getVersion() { return version; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public String getCreatedBy() { return createdBy; }
    public String getUpdatedBy() { return updatedBy; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ${className} that)) return false;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "${className}{id=" + id + ", name='" + name + "', status=" + status + "}";
    }
}`,
      explanation: 'Full-featured JPA entity with auditing, validation, versioning, and indexes.',
      bestPractices: ['Use @Version for optimistic locking', 'Add indexes for frequently queried columns', 'Use enums for status fields'],
      commonMistakes: ['Missing @EntityListeners for auditing', 'Not implementing equals/hashCode properly'],
      java21Tips: ['Use pattern matching in equals: if (!(o instanceof ${className} that))']
    })
  },

  JPA_REPOSITORY: {
    name: 'JPA Repository',
    description: 'Repository with custom queries',
    generate: (className, packageName) => ({
      name: `${className} Repository`,
      fileName: `${className}Repository.java`,
      packagePath: `${packageName}.repository`,
      useCase: 'JPA repository with custom JPQL, native queries, and projections',
      code: `package ${packageName}.repository;

import ${packageName}.entity.${className};
import ${packageName}.entity.${className}.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ${className}Repository extends JpaRepository<${className}, Long>, JpaSpecificationExecutor<${className}> {

    // Basic finder methods
    Optional<${className}> findByEmail(String email);

    List<${className}> findByStatus(Status status);

    List<${className}> findByNameContainingIgnoreCase(String name);

    boolean existsByEmail(String email);

    // Pagination
    Page<${className}> findByStatus(Status status, Pageable pageable);

    Slice<${className}> findByNameContaining(String name, Pageable pageable);

    // JPQL Queries
    @Query("SELECT e FROM ${className} e WHERE e.status = :status AND e.createdAt > :since")
    List<${className}> findActiveAfterDate(@Param("status") Status status, @Param("since") LocalDateTime since);

    @Query("SELECT e FROM ${className} e WHERE LOWER(e.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<${className}> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // Native SQL Query
    @Query(value = "SELECT * FROM ${className.toLowerCase()}s WHERE status = :status " +
                   "ORDER BY created_at DESC LIMIT :limit", nativeQuery = true)
    List<${className}> findTopByStatusNative(@Param("status") String status, @Param("limit") int limit);

    // Aggregate queries
    @Query("SELECT COUNT(e) FROM ${className} e WHERE e.status = :status")
    long countByStatus(@Param("status") Status status);

    @Query("SELECT e.status, COUNT(e) FROM ${className} e GROUP BY e.status")
    List<Object[]> countGroupByStatus();

    // Update queries
    @Modifying
    @Query("UPDATE ${className} e SET e.status = :status WHERE e.id IN :ids")
    int updateStatusByIds(@Param("status") Status status, @Param("ids") List<Long> ids);

    @Modifying
    @Query("DELETE FROM ${className} e WHERE e.status = :status AND e.updatedAt < :before")
    int deleteOldByStatus(@Param("status") Status status, @Param("before") LocalDateTime before);

    // Projection
    @Query("SELECT e.id as id, e.name as name, e.status as status FROM ${className} e WHERE e.status = :status")
    List<${className}Summary> findSummaryByStatus(@Param("status") Status status);

    interface ${className}Summary {
        Long getId();
        String getName();
        Status getStatus();
    }
}`,
      explanation: 'Comprehensive JPA repository with JPQL, native queries, pagination, and projections.',
      bestPractices: ['Extend JpaSpecificationExecutor for dynamic queries', 'Use @Modifying for update/delete queries', 'Use projections for performance'],
      commonMistakes: ['Forgetting @Modifying on update queries', 'Not using @Param for named parameters'],
      java21Tips: ['Use sealed interfaces for projections in Java 21']
    })
  },

  JPA_SPECIFICATION: {
    name: 'JPA Specification',
    description: 'Dynamic query specification',
    generate: (className, packageName) => ({
      name: `${className} Specification`,
      fileName: `${className}Specification.java`,
      packagePath: `${packageName}.repository`,
      useCase: 'Dynamic query building with JPA Criteria API',
      code: `package ${packageName}.repository;

import ${packageName}.entity.${className};
import ${packageName}.entity.${className}.Status;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ${className}Specification {

    public static Specification<${className}> hasName(String name) {
        return (root, query, cb) ->
            name == null ? null : cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<${className}> hasStatus(Status status) {
        return (root, query, cb) ->
            status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<${className}> hasEmail(String email) {
        return (root, query, cb) ->
            email == null ? null : cb.equal(root.get("email"), email);
    }

    public static Specification<${className}> createdAfter(LocalDateTime date) {
        return (root, query, cb) ->
            date == null ? null : cb.greaterThan(root.get("createdAt"), date);
    }

    public static Specification<${className}> createdBefore(LocalDateTime date) {
        return (root, query, cb) ->
            date == null ? null : cb.lessThan(root.get("createdAt"), date);
    }

    public static Specification<${className}> createdBetween(LocalDateTime start, LocalDateTime end) {
        return (root, query, cb) -> {
            if (start == null && end == null) return null;
            if (start == null) return cb.lessThan(root.get("createdAt"), end);
            if (end == null) return cb.greaterThan(root.get("createdAt"), start);
            return cb.between(root.get("createdAt"), start, end);
        };
    }

    public static Specification<${className}> hasStatusIn(List<Status> statuses) {
        return (root, query, cb) ->
            statuses == null || statuses.isEmpty() ? null : root.get("status").in(statuses);
    }

    // Combine multiple specifications dynamically
    public static Specification<${className}> buildSearchSpec(${className}SearchCriteria criteria) {
        List<Specification<${className}>> specs = new ArrayList<>();

        if (criteria.name() != null) {
            specs.add(hasName(criteria.name()));
        }
        if (criteria.status() != null) {
            specs.add(hasStatus(criteria.status()));
        }
        if (criteria.email() != null) {
            specs.add(hasEmail(criteria.email()));
        }
        if (criteria.createdAfter() != null) {
            specs.add(createdAfter(criteria.createdAfter()));
        }
        if (criteria.createdBefore() != null) {
            specs.add(createdBefore(criteria.createdBefore()));
        }

        return specs.stream()
                .reduce(Specification::and)
                .orElse((root, query, cb) -> cb.conjunction());
    }

    // Search criteria record
    public record ${className}SearchCriteria(
        String name,
        Status status,
        String email,
        LocalDateTime createdAfter,
        LocalDateTime createdBefore
    ) {
        public static Builder builder() {
            return new Builder();
        }

        public static class Builder {
            private String name;
            private Status status;
            private String email;
            private LocalDateTime createdAfter;
            private LocalDateTime createdBefore;

            public Builder name(String name) { this.name = name; return this; }
            public Builder status(Status status) { this.status = status; return this; }
            public Builder email(String email) { this.email = email; return this; }
            public Builder createdAfter(LocalDateTime date) { this.createdAfter = date; return this; }
            public Builder createdBefore(LocalDateTime date) { this.createdBefore = date; return this; }

            public ${className}SearchCriteria build() {
                return new ${className}SearchCriteria(name, status, email, createdAfter, createdBefore);
            }
        }
    }
}`,
      explanation: 'Dynamic query specification using JPA Criteria API with fluent builder pattern.',
      bestPractices: ['Return null for optional criteria', 'Use records for search criteria', 'Combine specs with and/or'],
      commonMistakes: ['Not handling null criteria', 'Complex nested conditions without proper grouping'],
      java21Tips: ['Use records for immutable search criteria']
    })
  },

  JPA_SERVICE: {
    name: 'JPA Service',
    description: 'Service layer with transactions',
    generate: (className, packageName) => ({
      name: `${className} Service`,
      fileName: `${className}Service.java`,
      packagePath: `${packageName}.service`,
      useCase: 'Transactional service layer with business logic',
      code: `package ${packageName}.service;

import ${packageName}.entity.${className};
import ${packageName}.entity.${className}.Status;
import ${packageName}.repository.${className}Repository;
import ${packageName}.repository.${className}Specification;
import ${packageName}.repository.${className}Specification.${className}SearchCriteria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    // Read operations
    public Optional<${className}> findById(Long id) {
        return repository.findById(id);
    }

    public ${className} getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("${className} not found with id: " + id));
    }

    public Optional<${className}> findByEmail(String email) {
        return repository.findByEmail(email);
    }

    public List<${className}> findAll() {
        return repository.findAll();
    }

    public Page<${className}> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public List<${className}> findByStatus(Status status) {
        return repository.findByStatus(status);
    }

    public Page<${className}> search(${className}SearchCriteria criteria, Pageable pageable) {
        return repository.findAll(${className}Specification.buildSearchSpec(criteria), pageable);
    }

    public Page<${className}> searchByKeyword(String keyword, Pageable pageable) {
        return repository.searchByKeyword(keyword, pageable);
    }

    public long countByStatus(Status status) {
        return repository.countByStatus(status);
    }

    public boolean existsByEmail(String email) {
        return repository.existsByEmail(email);
    }

    // Write operations
    @Transactional
    public ${className} create(${className} entity) {
        if (entity.getEmail() != null && repository.existsByEmail(entity.getEmail())) {
            throw new DuplicateEntityException("Email already exists: " + entity.getEmail());
        }
        return repository.save(entity);
    }

    @Transactional
    public ${className} update(Long id, ${className} updated) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setName(updated.getName());
                    existing.setDescription(updated.getDescription());
                    existing.setStatus(updated.getStatus());
                    if (updated.getEmail() != null && !updated.getEmail().equals(existing.getEmail())) {
                        if (repository.existsByEmail(updated.getEmail())) {
                            throw new DuplicateEntityException("Email already exists: " + updated.getEmail());
                        }
                        existing.setEmail(updated.getEmail());
                    }
                    return repository.save(existing);
                })
                .orElseThrow(() -> new EntityNotFoundException("${className} not found with id: " + id));
    }

    @Transactional
    public void updateStatus(Long id, Status status) {
        ${className} entity = getById(id);
        entity.setStatus(status);
        repository.save(entity);
    }

    @Transactional
    public int bulkUpdateStatus(List<Long> ids, Status status) {
        return repository.updateStatusByIds(status, ids);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("${className} not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Transactional
    public void softDelete(Long id) {
        ${className} entity = getById(id);
        entity.setStatus(Status.ARCHIVED);
        repository.save(entity);
    }

    @Transactional
    public int cleanupOld(Status status, LocalDateTime before) {
        return repository.deleteOldByStatus(status, before);
    }

    // Batch operations
    @Transactional
    public List<${className}> saveAll(List<${className}> entities) {
        return repository.saveAll(entities);
    }

    // Custom exceptions
    public static class EntityNotFoundException extends RuntimeException {
        public EntityNotFoundException(String message) { super(message); }
    }

    public static class DuplicateEntityException extends RuntimeException {
        public DuplicateEntityException(String message) { super(message); }
    }
}`,
      explanation: 'Transactional service with CRUD, search, bulk operations, and custom exceptions.',
      bestPractices: ['Use @Transactional(readOnly = true) at class level', 'Override with @Transactional for writes', 'Throw domain-specific exceptions'],
      commonMistakes: ['Not marking read methods as readOnly', 'Catching exceptions in transaction boundary'],
      java21Tips: ['Use sealed classes for exceptions hierarchy']
    })
  },

  JPA_CONTROLLER: {
    name: 'JPA Controller',
    description: 'REST controller for entity CRUD',
    generate: (className, packageName) => ({
      name: `${className} Controller`,
      fileName: `${className}Controller.java`,
      packagePath: `${packageName}.controller`,
      useCase: 'REST controller with full CRUD and pagination',
      code: `package ${packageName}.controller;

import ${packageName}.entity.${className};
import ${packageName}.entity.${className}.Status;
import ${packageName}.repository.${className}Specification.${className}SearchCriteria;
import ${packageName}.service.${className}Service;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/${className.toLowerCase()}s")
public class ${className}Controller {

    private final ${className}Service service;

    public ${className}Controller(${className}Service service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<Page<${className}Response>> findAll(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<${className}Response> page = service.findAll(pageable).map(${className}Response::from);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/{id}")
    public ResponseEntity<${className}Response> findById(@PathVariable Long id) {
        return service.findById(id)
                .map(${className}Response::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<Page<${className}Response>> search(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) LocalDateTime createdAfter,
            @RequestParam(required = false) LocalDateTime createdBefore,
            @PageableDefault(size = 20) Pageable pageable) {

        ${className}SearchCriteria criteria = ${className}SearchCriteria.builder()
                .name(name)
                .status(status)
                .email(email)
                .createdAfter(createdAfter)
                .createdBefore(createdBefore)
                .build();

        Page<${className}Response> page = service.search(criteria, pageable).map(${className}Response::from);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/keyword")
    public ResponseEntity<Page<${className}Response>> searchByKeyword(
            @RequestParam String q,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<${className}Response> page = service.searchByKeyword(q, pageable).map(${className}Response::from);
        return ResponseEntity.ok(page);
    }

    @PostMapping
    public ResponseEntity<${className}Response> create(@Valid @RequestBody ${className}Request request) {
        ${className} entity = request.toEntity();
        ${className} saved = service.create(entity);
        return ResponseEntity.status(HttpStatus.CREATED).body(${className}Response.from(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<${className}Response> update(
            @PathVariable Long id,
            @Valid @RequestBody ${className}Request request) {
        ${className} updated = service.update(id, request.toEntity());
        return ResponseEntity.ok(${className}Response.from(updated));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Long id,
            @RequestParam Status status) {
        service.updateStatus(id, status);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/bulk-status")
    public ResponseEntity<BulkUpdateResponse> bulkUpdateStatus(
            @RequestBody BulkStatusRequest request) {
        int updated = service.bulkUpdateStatus(request.ids(), request.status());
        return ResponseEntity.ok(new BulkUpdateResponse(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/soft")
    public ResponseEntity<Void> softDelete(@PathVariable Long id) {
        service.softDelete(id);
        return ResponseEntity.noContent().build();
    }

    // DTOs
    public record ${className}Request(
            @jakarta.validation.constraints.NotBlank String name,
            String description,
            Status status,
            @jakarta.validation.constraints.Email String email
    ) {
        public ${className} toEntity() {
            ${className} entity = new ${className}(name, description);
            if (status != null) entity.setStatus(status);
            entity.setEmail(email);
            return entity;
        }
    }

    public record ${className}Response(
            Long id,
            String name,
            String description,
            Status status,
            String email,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        public static ${className}Response from(${className} entity) {
            return new ${className}Response(
                    entity.getId(),
                    entity.getName(),
                    entity.getDescription(),
                    entity.getStatus(),
                    entity.getEmail(),
                    entity.getCreatedAt(),
                    entity.getUpdatedAt()
            );
        }
    }

    public record BulkStatusRequest(List<Long> ids, Status status) {}
    public record BulkUpdateResponse(int updatedCount) {}
}`,
      explanation: 'Full REST controller with CRUD, search, pagination, and bulk operations.',
      bestPractices: ['Use DTOs for request/response', 'Use @PageableDefault for pagination defaults', 'Return appropriate HTTP status codes'],
      commonMistakes: ['Exposing entity directly', 'Not validating input', 'Wrong HTTP methods for operations'],
      java21Tips: ['Use records for DTOs']
    })
  },

  JSONB_ENTITY: {
    name: 'JSONB Entity',
    description: 'Entity with PostgreSQL JSONB support',
    generate: (className, packageName) => ({
      name: `${className} JSONB Entity`,
      fileName: `${className}WithMetadata.java`,
      packagePath: `${packageName}.entity`,
      useCase: 'Entity with PostgreSQL JSONB column for flexible metadata',
      code: `package ${packageName}.entity;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "${className.toLowerCase()}_with_metadata")
public class ${className}WithMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // JSONB as Map
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> metadata = new HashMap<>();

    // JSONB as JsonNode (for complex/dynamic JSON)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private JsonNode settings;

    // JSONB as custom object
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private ${className}Config config;

    // Constructors
    public ${className}WithMetadata() {}

    public ${className}WithMetadata(String name) {
        this.name = name;
    }

    // Metadata helper methods
    public void addMetadata(String key, Object value) {
        this.metadata.put(key, value);
    }

    public Object getMetadataValue(String key) {
        return this.metadata.get(key);
    }

    @SuppressWarnings("unchecked")
    public <T> T getMetadataValue(String key, Class<T> type) {
        Object value = this.metadata.get(key);
        return type.isInstance(value) ? (T) value : null;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }

    public JsonNode getSettings() { return settings; }
    public void setSettings(JsonNode settings) { this.settings = settings; }

    public ${className}Config getConfig() { return config; }
    public void setConfig(${className}Config config) { this.config = config; }

    // Embedded config class for JSONB
    public record ${className}Config(
        boolean enabled,
        int maxRetries,
        String endpoint,
        Map<String, String> headers
    ) {}
}

/*
-- PostgreSQL table creation with JSONB indexes:
CREATE TABLE ${className.toLowerCase()}_with_metadata (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}',
    settings JSONB,
    config JSONB
);

-- GIN index for JSONB containment queries
CREATE INDEX idx_metadata_gin ON ${className.toLowerCase()}_with_metadata USING GIN (metadata);

-- Specific key index
CREATE INDEX idx_metadata_type ON ${className.toLowerCase()}_with_metadata ((metadata->>'type'));

-- Query examples:
-- Find by JSONB key value:
-- SELECT * FROM ${className.toLowerCase()}_with_metadata WHERE metadata->>'type' = 'premium';
--
-- Find by JSONB containment:
-- SELECT * FROM ${className.toLowerCase()}_with_metadata WHERE metadata @> '{"active": true}';
*/`,
      explanation: 'Entity with JSONB columns using Hibernate 6 @JdbcTypeCode annotation.',
      bestPractices: ['Use Map for simple key-value', 'Use JsonNode for complex dynamic JSON', 'Add GIN indexes for JSONB queries'],
      commonMistakes: ['Forgetting columnDefinition = "jsonb"', 'Not indexing JSONB columns'],
      java21Tips: ['Use records for embedded config objects']
    })
  },

  AUDIT_CONFIG: {
    name: 'JPA Auditing Config',
    description: 'Auditing configuration for entities',
    generate: (className, packageName) => ({
      name: 'JPA Auditing Configuration',
      fileName: 'JpaAuditingConfig.java',
      packagePath: `${packageName}.config`,
      useCase: 'Enable JPA auditing with Spring Security integration',
      code: `package ${packageName}.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
public class JpaAuditingConfig {

    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()) {
                return Optional.of("system");
            }

            return Optional.of(authentication.getName());
        };
    }
}

/*
 * Usage in entities:
 *
 * @EntityListeners(AuditingEntityListener.class)
 * public class YourEntity {
 *
 *     @CreatedDate
 *     @Column(nullable = false, updatable = false)
 *     private LocalDateTime createdAt;
 *
 *     @LastModifiedDate
 *     @Column(nullable = false)
 *     private LocalDateTime updatedAt;
 *
 *     @CreatedBy
 *     @Column(updatable = false)
 *     private String createdBy;
 *
 *     @LastModifiedBy
 *     private String updatedBy;
 * }
 */`,
      explanation: 'JPA auditing configuration with Spring Security integration for tracking created/modified by.',
      bestPractices: ['Use "system" for unauthenticated operations', 'Always include both date and user auditing'],
      commonMistakes: ['Forgetting @EnableJpaAuditing', 'Not setting auditorAwareRef'],
      java21Tips: ['Consider using virtual threads for async audit logging']
    })
  },

  BATCH_INSERT: {
    name: 'Batch Insert Service',
    description: 'High-performance batch insert',
    generate: (className, packageName) => ({
      name: `${className} Batch Service`,
      fileName: `${className}BatchService.java`,
      packagePath: `${packageName}.service`,
      useCase: 'High-performance batch insert with JDBC batch processing',
      code: `package ${packageName}.service;

import ${packageName}.entity.${className};
import jakarta.persistence.EntityManager;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ${className}BatchService {

    private final EntityManager entityManager;
    private final JdbcTemplate jdbcTemplate;

    private static final int BATCH_SIZE = 1000;

    public ${className}BatchService(EntityManager entityManager, JdbcTemplate jdbcTemplate) {
        this.entityManager = entityManager;
        this.jdbcTemplate = jdbcTemplate;
    }

    // JPA batch insert with periodic flush
    @Transactional
    public void batchInsertJpa(List<${className}> entities) {
        for (int i = 0; i < entities.size(); i++) {
            entityManager.persist(entities.get(i));

            if (i > 0 && i % BATCH_SIZE == 0) {
                entityManager.flush();
                entityManager.clear();
            }
        }
        entityManager.flush();
        entityManager.clear();
    }

    // JDBC batch insert (fastest)
    @Transactional
    public void batchInsertJdbc(List<${className}> entities) {
        String sql = "INSERT INTO ${className.toLowerCase()}s (name, description, status, email, created_at, updated_at) " +
                     "VALUES (?, ?, ?, ?, ?, ?)";

        jdbcTemplate.batchUpdate(sql, entities, BATCH_SIZE, (PreparedStatement ps, ${className} entity) -> {
            ps.setString(1, entity.getName());
            ps.setString(2, entity.getDescription());
            ps.setString(3, entity.getStatus().name());
            ps.setString(4, entity.getEmail());
            ps.setTimestamp(5, Timestamp.valueOf(LocalDateTime.now()));
            ps.setTimestamp(6, Timestamp.valueOf(LocalDateTime.now()));
        });
    }

    // Chunked processing for very large datasets
    @Transactional
    public void batchInsertChunked(List<${className}> entities) {
        int totalSize = entities.size();
        int chunks = (totalSize + BATCH_SIZE - 1) / BATCH_SIZE;

        for (int chunk = 0; chunk < chunks; chunk++) {
            int start = chunk * BATCH_SIZE;
            int end = Math.min(start + BATCH_SIZE, totalSize);
            List<${className}> batch = entities.subList(start, end);

            batchInsertJdbc(batch);
        }
    }

    // PostgreSQL COPY for maximum performance
    @Transactional
    public void copyInsert(List<${className}> entities) {
        // For PostgreSQL, use COPY command for maximum insert performance
        // This requires pg-copy-streams or similar library

        String copyCommand = "COPY ${className.toLowerCase()}s (name, description, status, email, created_at, updated_at) " +
                            "FROM STDIN WITH (FORMAT csv)";

        // Implementation would use PostgreSQL's CopyManager
        // See: org.postgresql.copy.CopyManager
    }
}

/*
 * application.yml configuration for batch inserts:
 *
 * spring:
 *   jpa:
 *     properties:
 *       hibernate:
 *         jdbc:
 *           batch_size: 1000
 *           batch_versioned_data: true
 *         order_inserts: true
 *         order_updates: true
 */`,
      explanation: 'High-performance batch insert using JPA batching and JDBC batch updates.',
      bestPractices: ['Use JDBC for large batches', 'Configure hibernate.jdbc.batch_size', 'Flush and clear periodically'],
      commonMistakes: ['Not enabling batch_size in Hibernate', 'Using IDENTITY generation strategy (breaks batching)'],
      java21Tips: ['Use virtual threads for parallel batch processing of independent chunks']
    })
  }
};
