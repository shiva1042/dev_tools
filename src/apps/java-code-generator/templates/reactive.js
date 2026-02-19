// Reactive/WebFlux Templates
// Spring WebFlux, Reactive Streams, R2DBC patterns

export const reactiveTemplates = {
  webfluxController: {
    name: 'WebFlux Controller',
    description: 'Reactive REST controller with Mono/Flux returns',
    generate: (className, packageName) => ({
      fileName: `${className}ReactiveController.java`,
      content: `package ${packageName};

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.time.Duration;

@RestController
@RequestMapping("/api/reactive/${className.toLowerCase()}s")
public class ${className}ReactiveController {

    private final ${className}ReactiveService service;

    public ${className}ReactiveController(${className}ReactiveService service) {
        this.service = service;
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public Flux<${className}> getAll() {
        return service.findAll();
    }

    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<${className}> getById(@PathVariable String id) {
        return service.findById(id)
            .switchIfEmpty(Mono.error(new ${className}NotFoundException(id)));
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<${className}> streamAll() {
        return service.findAll()
            .delayElements(Duration.ofMillis(100));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<${className}> create(@RequestBody ${className} entity) {
        return service.save(entity);
    }

    @PutMapping("/{id}")
    public Mono<${className}> update(@PathVariable String id, @RequestBody ${className} entity) {
        return service.findById(id)
            .flatMap(existing -> {
                existing.updateFrom(entity);
                return service.save(existing);
            })
            .switchIfEmpty(Mono.error(new ${className}NotFoundException(id)));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> delete(@PathVariable String id) {
        return service.deleteById(id);
    }

    @GetMapping("/search")
    public Flux<${className}> search(@RequestParam String query) {
        return service.search(query)
            .take(100); // Limit results
    }

    @PostMapping("/batch")
    public Flux<${className}> createBatch(@RequestBody Flux<${className}> entities) {
        return service.saveAll(entities);
    }
}
`,
      language: 'java'
    })
  },

  webfluxService: {
    name: 'WebFlux Service',
    description: 'Reactive service with error handling and operators',
    generate: (className, packageName) => ({
      fileName: `${className}ReactiveService.java`,
      content: `package ${packageName};

import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import reactor.util.retry.Retry;
import java.time.Duration;
import java.util.function.Predicate;

@Service
public class ${className}ReactiveService {

    private final ${className}ReactiveRepository repository;

    public ${className}ReactiveService(${className}ReactiveRepository repository) {
        this.repository = repository;
    }

    public Flux<${className}> findAll() {
        return repository.findAll()
            .subscribeOn(Schedulers.boundedElastic())
            .doOnNext(item -> log.debug("Found: {}", item.getId()))
            .onErrorResume(e -> {
                log.error("Error finding all", e);
                return Flux.empty();
            });
    }

    public Mono<${className}> findById(String id) {
        return repository.findById(id)
            .timeout(Duration.ofSeconds(5))
            .retryWhen(Retry.backoff(3, Duration.ofMillis(100)))
            .doOnSuccess(item -> log.debug("Found by id: {}", id))
            .doOnError(e -> log.error("Error finding by id: {}", id, e));
    }

    public Mono<${className}> save(${className} entity) {
        return Mono.just(entity)
            .flatMap(this::validate)
            .flatMap(repository::save)
            .doOnSuccess(saved -> log.info("Saved: {}", saved.getId()));
    }

    public Flux<${className}> saveAll(Flux<${className}> entities) {
        return entities
            .buffer(100) // Batch processing
            .flatMap(batch -> repository.saveAll(batch))
            .doOnComplete(() -> log.info("Batch save completed"));
    }

    public Mono<Void> deleteById(String id) {
        return repository.existsById(id)
            .flatMap(exists -> {
                if (!exists) {
                    return Mono.error(new ${className}NotFoundException(id));
                }
                return repository.deleteById(id);
            });
    }

    public Flux<${className}> search(String query) {
        return repository.findByNameContainingIgnoreCase(query)
            .filter(Predicate.not(${className}::isDeleted))
            .sort((a, b) -> a.getName().compareToIgnoreCase(b.getName()));
    }

    public Flux<${className}> findWithPagination(int page, int size) {
        return repository.findAll()
            .skip((long) page * size)
            .take(size);
    }

    public Mono<Long> count() {
        return repository.count()
            .cache(Duration.ofMinutes(1));
    }

    private Mono<${className}> validate(${className} entity) {
        if (entity.getName() == null || entity.getName().isBlank()) {
            return Mono.error(new ValidationException("Name is required"));
        }
        return Mono.just(entity);
    }

    // Combine multiple reactive sources
    public Mono<${className}Details> getDetails(String id) {
        return Mono.zip(
            findById(id),
            getMetadata(id),
            getStatistics(id)
        ).map(tuple -> new ${className}Details(
            tuple.getT1(),
            tuple.getT2(),
            tuple.getT3()
        ));
    }

    private Mono<${className}Metadata> getMetadata(String id) {
        return Mono.just(new ${className}Metadata()); // Placeholder
    }

    private Mono<${className}Statistics> getStatistics(String id) {
        return Mono.just(new ${className}Statistics()); // Placeholder
    }
}
`,
      language: 'java'
    })
  },

  r2dbcRepository: {
    name: 'R2DBC Repository',
    description: 'Reactive database repository with R2DBC',
    generate: (className, packageName) => ({
      fileName: `${className}R2dbcRepository.java`,
      content: `package ${packageName};

import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface ${className}R2dbcRepository extends R2dbcRepository<${className}, Long> {

    Flux<${className}> findByStatus(String status);

    Flux<${className}> findByNameContainingIgnoreCase(String name);

    @Query("SELECT * FROM ${className.toLowerCase()}s WHERE active = true ORDER BY created_at DESC LIMIT :limit")
    Flux<${className}> findRecentActive(int limit);

    @Query("SELECT * FROM ${className.toLowerCase()}s WHERE category = :category AND active = true")
    Flux<${className}> findByCategory(String category);

    @Query("UPDATE ${className.toLowerCase()}s SET status = :status WHERE id = :id")
    Mono<Integer> updateStatus(Long id, String status);

    @Query("SELECT COUNT(*) FROM ${className.toLowerCase()}s WHERE status = :status")
    Mono<Long> countByStatus(String status);

    Mono<Boolean> existsByName(String name);

    Flux<${className}> findByCreatedAtBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
}
`,
      language: 'java'
    })
  },

  r2dbcEntity: {
    name: 'R2DBC Entity',
    description: 'Reactive entity for R2DBC with Spring Data',
    generate: (className, packageName) => ({
      fileName: `${className}Entity.java`,
      content: `package ${packageName};

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Version;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;
import java.time.LocalDateTime;

@Table("${className.toLowerCase()}s")
public class ${className}Entity {

    @Id
    private Long id;

    @Column("name")
    private String name;

    @Column("description")
    private String description;

    @Column("status")
    private String status;

    @Column("category")
    private String category;

    @Column("active")
    private boolean active = true;

    @Column("deleted")
    private boolean deleted = false;

    @CreatedDate
    @Column("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column("updated_at")
    private LocalDateTime updatedAt;

    @Version
    private Long version;

    // Default constructor
    public ${className}Entity() {}

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final ${className}Entity entity = new ${className}Entity();

        public Builder name(String name) {
            entity.name = name;
            return this;
        }

        public Builder description(String description) {
            entity.description = description;
            return this;
        }

        public Builder status(String status) {
            entity.status = status;
            return this;
        }

        public Builder category(String category) {
            entity.category = category;
            return this;
        }

        public Builder active(boolean active) {
            entity.active = active;
            return this;
        }

        public ${className}Entity build() {
            return entity;
        }
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public Long getVersion() { return version; }

    public void updateFrom(${className}Entity other) {
        this.name = other.name;
        this.description = other.description;
        this.status = other.status;
        this.category = other.category;
        this.active = other.active;
    }
}
`,
      language: 'java'
    })
  },

  webClient: {
    name: 'WebClient Service',
    description: 'Reactive HTTP client with WebClient',
    generate: (className, packageName) => ({
      fileName: `${className}WebClient.java`,
      content: `package ${packageName};

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;
import java.time.Duration;

@Service
public class ${className}WebClient {

    private final WebClient webClient;

    public ${className}WebClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
            .baseUrl("https://api.example.com")
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
            .filter((request, next) -> {
                log.debug("Request: {} {}", request.method(), request.url());
                return next.exchange(request)
                    .doOnNext(response -> log.debug("Response: {}", response.statusCode()));
            })
            .build();
    }

    public Mono<${className}Response> get${className}(String id) {
        return webClient.get()
            .uri("/api/${className.toLowerCase()}s/{id}", id)
            .retrieve()
            .onStatus(HttpStatus.NOT_FOUND::equals,
                response -> Mono.error(new ${className}NotFoundException(id)))
            .onStatus(HttpStatus::is5xxServerError,
                response -> response.bodyToMono(String.class)
                    .flatMap(body -> Mono.error(new ServiceException(body))))
            .bodyToMono(${className}Response.class)
            .timeout(Duration.ofSeconds(10))
            .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
                .filter(e -> e instanceof WebClientResponseException.ServiceUnavailable));
    }

    public Flux<${className}Response> getAll${className}s() {
        return webClient.get()
            .uri("/api/${className.toLowerCase()}s")
            .retrieve()
            .bodyToFlux(${className}Response.class)
            .onErrorResume(e -> {
                log.error("Error fetching all", e);
                return Flux.empty();
            });
    }

    public Mono<${className}Response> create${className}(${className}Request request) {
        return webClient.post()
            .uri("/api/${className.toLowerCase()}s")
            .bodyValue(request)
            .retrieve()
            .bodyToMono(${className}Response.class);
    }

    public Mono<${className}Response> update${className}(String id, ${className}Request request) {
        return webClient.put()
            .uri("/api/${className.toLowerCase()}s/{id}", id)
            .bodyValue(request)
            .retrieve()
            .bodyToMono(${className}Response.class);
    }

    public Mono<Void> delete${className}(String id) {
        return webClient.delete()
            .uri("/api/${className.toLowerCase()}s/{id}", id)
            .retrieve()
            .bodyToMono(Void.class);
    }

    public Flux<${className}Response> streamUpdates() {
        return webClient.get()
            .uri("/api/${className.toLowerCase()}s/stream")
            .accept(MediaType.TEXT_EVENT_STREAM)
            .retrieve()
            .bodyToFlux(${className}Response.class);
    }

    // With exchange for full control
    public Mono<${className}Response> getWithExchange(String id) {
        return webClient.get()
            .uri("/api/${className.toLowerCase()}s/{id}", id)
            .exchangeToMono(this::handleResponse);
    }

    private Mono<${className}Response> handleResponse(ClientResponse response) {
        if (response.statusCode().is2xxSuccessful()) {
            return response.bodyToMono(${className}Response.class);
        } else if (response.statusCode() == HttpStatus.NOT_FOUND) {
            return Mono.empty();
        } else {
            return response.createException().flatMap(Mono::error);
        }
    }
}
`,
      language: 'java'
    })
  },

  fluxOperators: {
    name: 'Flux Operators Examples',
    description: 'Common Flux/Mono operators and patterns',
    generate: (className, packageName) => ({
      fileName: `${className}FluxExamples.java`,
      content: `package ${packageName};

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import reactor.util.function.Tuple2;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

public class ${className}FluxExamples {

    // Transformation operators
    public Flux<String> transformExamples(Flux<${className}> source) {
        return source
            .map(${className}::getName)                    // Transform each element
            .flatMap(this::asyncLookup)                   // Async transformation
            .flatMapSequential(this::asyncLookup)         // Preserve order
            .concatMap(this::asyncLookup)                 // Sequential processing
            .filter(name -> name.length() > 3)            // Filter elements
            .distinct()                                    // Remove duplicates
            .take(10)                                      // Limit to first 10
            .skip(5)                                       // Skip first 5
            .sort();                                       // Sort elements
    }

    // Combining operators
    public Flux<${className}> combiningExamples() {
        Flux<${className}> flux1 = getSource1();
        Flux<${className}> flux2 = getSource2();

        // Merge - interleave elements
        Flux<${className}> merged = Flux.merge(flux1, flux2);

        // Concat - sequential
        Flux<${className}> concatenated = Flux.concat(flux1, flux2);

        // Zip - pair elements
        Flux<Tuple2<${className}, ${className}>> zipped = Flux.zip(flux1, flux2);

        // CombineLatest
        Flux<String> combined = Flux.combineLatest(
            flux1.map(${className}::getName),
            flux2.map(${className}::getName),
            (a, b) -> a + "-" + b
        );

        return merged;
    }

    // Error handling
    public Flux<${className}> errorHandlingExamples(Flux<${className}> source) {
        return source
            .onErrorReturn(new ${className}())            // Default on error
            .onErrorResume(e -> Flux.empty())            // Switch to another flux
            .onErrorMap(e -> new CustomException(e))     // Transform error
            .doOnError(e -> log.error("Error", e))       // Side effect on error
            .retry(3)                                     // Retry on error
            .retryWhen(Retry.backoff(3, Duration.ofSeconds(1)));
    }

    // Batching and buffering
    public Flux<List<${className}>> batchingExamples(Flux<${className}> source) {
        // Buffer by count
        Flux<List<${className}>> buffered = source.buffer(100);

        // Buffer by time
        Flux<List<${className}>> timedBuffer = source.buffer(Duration.ofSeconds(1));

        // Window - stream of streams
        Flux<Flux<${className}>> windowed = source.window(10);

        // Group by
        Flux<GroupedFlux<String, ${className}>> grouped =
            source.groupBy(${className}::getCategory);

        return buffered;
    }

    // Threading and scheduling
    public Flux<${className}> schedulingExamples(Flux<${className}> source) {
        return source
            .subscribeOn(Schedulers.boundedElastic())    // Subscribe on thread pool
            .publishOn(Schedulers.parallel())             // Publish on parallel
            .parallel(4)                                  // Parallel processing
            .runOn(Schedulers.parallel())
            .sequential();                                // Back to sequential
    }

    // Caching and replay
    public Flux<${className}> cachingExamples() {
        Flux<${className}> cached = getExpensiveSource()
            .cache(Duration.ofMinutes(5));               // Cache for 5 minutes

        Flux<${className}> replayed = getSource1()
            .replay(10)                                   // Replay last 10
            .autoConnect();

        return cached;
    }

    // Side effects
    public Flux<${className}> sideEffectExamples(Flux<${className}> source) {
        AtomicInteger counter = new AtomicInteger(0);

        return source
            .doOnNext(item -> log.debug("Processing: {}", item))
            .doOnComplete(() -> log.info("Completed"))
            .doOnError(e -> log.error("Error", e))
            .doOnSubscribe(s -> log.info("Subscribed"))
            .doOnCancel(() -> log.info("Cancelled"))
            .doOnTerminate(() -> log.info("Terminated"))
            .doFinally(signalType -> log.info("Signal: {}", signalType))
            .index()
            .doOnNext(tuple -> counter.incrementAndGet())
            .map(Tuple2::getT2);
    }

    // Conditional operators
    public Mono<${className}> conditionalExamples(String id) {
        return findById(id)
            .switchIfEmpty(Mono.defer(() -> createDefault()))
            .defaultIfEmpty(new ${className}())
            .hasElement()
            .flatMap(exists -> exists ? findById(id) : createDefault());
    }

    // Collect to different types
    public Mono<Map<String, ${className}>> collectExamples(Flux<${className}> source) {
        // To list
        Mono<List<${className}>> list = source.collectList();

        // To map
        Mono<Map<String, ${className}>> map = source
            .collectMap(${className}::getId, item -> item);

        // To multimap
        Mono<Map<String, Collection<${className}>>> multimap = source
            .collectMultimap(${className}::getCategory, item -> item);

        // Reduce
        Mono<${className}> reduced = source.reduce((a, b) -> a);

        return map;
    }

    // Helper methods
    private Mono<String> asyncLookup(String name) {
        return Mono.just(name.toUpperCase())
            .delayElement(Duration.ofMillis(10));
    }

    private Flux<${className}> getSource1() { return Flux.empty(); }
    private Flux<${className}> getSource2() { return Flux.empty(); }
    private Flux<${className}> getExpensiveSource() { return Flux.empty(); }
    private Mono<${className}> findById(String id) { return Mono.empty(); }
    private Mono<${className}> createDefault() { return Mono.just(new ${className}()); }
}
`,
      language: 'java'
    })
  }
};
