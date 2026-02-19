// Microservices Templates - Cloud Native Patterns

export const microservicesTemplates = {
  CIRCUIT_BREAKER: {
    name: 'Circuit Breaker',
    description: 'Resilience4j circuit breaker pattern',
    generate: (className, packageName) => ({
      name: 'Circuit Breaker Service',
      fileName: `${className}CircuitBreakerService.java`,
      packagePath: `${packageName}.service`,
      useCase: 'Fault tolerance with circuit breaker pattern for external service calls',
      code: `package ${packageName}.service;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import io.github.resilience4j.timelimiter.annotation.TimeLimiter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.concurrent.CompletableFuture;

@Service
public class ${className}CircuitBreakerService {

    private static final Logger log = LoggerFactory.getLogger(${className}CircuitBreakerService.class);
    private static final String CIRCUIT_BREAKER_INSTANCE = "${className.toLowerCase()}Service";

    private final RestTemplate restTemplate;

    public ${className}CircuitBreakerService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Call external service with circuit breaker protection
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_INSTANCE, fallbackMethod = "fallbackResponse")
    @Retry(name = CIRCUIT_BREAKER_INSTANCE, fallbackMethod = "fallbackResponse")
    public String callExternalService(String url) {
        log.info("Calling external service: {}", url);
        return restTemplate.getForObject(url, String.class);
    }

    /**
     * Async call with time limiter
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_INSTANCE, fallbackMethod = "asyncFallback")
    @TimeLimiter(name = CIRCUIT_BREAKER_INSTANCE)
    public CompletableFuture<String> callExternalServiceAsync(String url) {
        return CompletableFuture.supplyAsync(() -> {
            log.info("Async calling external service: {}", url);
            return restTemplate.getForObject(url, String.class);
        });
    }

    /**
     * Fallback method when circuit is open
     */
    private String fallbackResponse(String url, Throwable throwable) {
        log.warn("Circuit breaker fallback for URL: {}, reason: {}", url, throwable.getMessage());
        return "{\\"status\\": \\"Service temporarily unavailable\\", \\"cached\\": true}";
    }

    private CompletableFuture<String> asyncFallback(String url, Throwable throwable) {
        log.warn("Async circuit breaker fallback for URL: {}", url);
        return CompletableFuture.completedFuture(fallbackResponse(url, throwable));
    }
}`,
      explanation: 'Circuit breaker implementation using Resilience4j for fault tolerance.',
      bestPractices: [
        'Configure appropriate failure thresholds',
        'Implement meaningful fallback responses',
        'Monitor circuit breaker state',
        'Use different instances for different services'
      ],
      commonMistakes: [
        'Not implementing fallbacks',
        'Too aggressive threshold settings',
        'Ignoring circuit breaker metrics'
      ],
      java21Tips: [
        'Use virtual threads for async operations',
        'Pattern matching in fallback handlers'
      ]
    })
  },

  RATE_LIMITER: {
    name: 'Rate Limiter',
    description: 'API rate limiting with Bucket4j',
    generate: (className, packageName) => ({
      name: 'Rate Limiter',
      fileName: 'RateLimitingFilter.java',
      packagePath: `${packageName}.filter`,
      useCase: 'API rate limiting to prevent abuse and ensure fair usage',
      code: `package ${packageName}.filter;

import io.github.bucket4j.*;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingFilter implements Filter {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    // Rate limit: 100 requests per minute per IP
    private static final int CAPACITY = 100;
    private static final int REFILL_TOKENS = 100;
    private static final Duration REFILL_DURATION = Duration.ofMinutes(1);

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String clientIp = getClientIP(httpRequest);
        Bucket bucket = buckets.computeIfAbsent(clientIp, this::createNewBucket);

        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            // Add rate limit headers
            httpResponse.addHeader("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));
            httpResponse.addHeader("X-Rate-Limit-Limit", String.valueOf(CAPACITY));
            chain.doFilter(request, response);
        } else {
            // Rate limit exceeded
            long waitForRefill = probe.getNanosToWaitForRefill() / 1_000_000_000;
            httpResponse.addHeader("X-Rate-Limit-Retry-After-Seconds", String.valueOf(waitForRefill));
            httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write(
                "{\\"error\\": \\"Rate limit exceeded\\", \\"retryAfter\\": " + waitForRefill + "}"
            );
        }
    }

    private Bucket createNewBucket(String key) {
        Bandwidth limit = Bandwidth.classic(CAPACITY, Refill.greedy(REFILL_TOKENS, REFILL_DURATION));
        return Bucket.builder().addLimit(limit).build();
    }

    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}`,
      explanation: 'Rate limiting filter using Bucket4j token bucket algorithm.',
      bestPractices: [
        'Use distributed cache for clustered environments',
        'Different limits for different endpoints',
        'Include rate limit headers in responses'
      ],
      commonMistakes: [
        'Not handling X-Forwarded-For header',
        'In-memory buckets in clustered environments'
      ],
      java21Tips: ['Use virtual threads for high concurrency']
    })
  },

  SERVICE_DISCOVERY: {
    name: 'Service Discovery Client',
    description: 'Eureka/Consul service discovery',
    generate: (className, packageName) => ({
      name: 'Service Discovery Client',
      fileName: `${className}ServiceClient.java`,
      packagePath: `${packageName}.client`,
      useCase: 'Dynamic service discovery and load-balanced HTTP calls',
      code: `package ${packageName}.client;

import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;

@Service
public class ${className}ServiceClient {

    private final DiscoveryClient discoveryClient;
    private final RestTemplate loadBalancedRestTemplate;

    public ${className}ServiceClient(DiscoveryClient discoveryClient,
                                     RestTemplate loadBalancedRestTemplate) {
        this.discoveryClient = discoveryClient;
        this.loadBalancedRestTemplate = loadBalancedRestTemplate;
    }

    /**
     * Get all instances of a service
     */
    public List<ServiceInstance> getServiceInstances(String serviceName) {
        return discoveryClient.getInstances(serviceName);
    }

    /**
     * Get a specific service instance
     */
    public Optional<ServiceInstance> getServiceInstance(String serviceName) {
        List<ServiceInstance> instances = discoveryClient.getInstances(serviceName);
        return instances.isEmpty() ? Optional.empty() : Optional.of(instances.get(0));
    }

    /**
     * Call service using load-balanced RestTemplate
     */
    public <T> T callService(String serviceName, String path, Class<T> responseType) {
        String url = "http://" + serviceName + path;
        return loadBalancedRestTemplate.getForObject(url, responseType);
    }

    /**
     * Get all registered services
     */
    public List<String> getAllServices() {
        return discoveryClient.getServices();
    }

    /**
     * Check if service is available
     */
    public boolean isServiceAvailable(String serviceName) {
        return !discoveryClient.getInstances(serviceName).isEmpty();
    }
}

@Configuration
class ServiceDiscoveryConfig {

    @Bean
    @LoadBalanced
    public RestTemplate loadBalancedRestTemplate() {
        return new RestTemplate();
    }
}`,
      explanation: 'Service discovery client with load-balanced REST calls.',
      bestPractices: [
        'Use load-balanced RestTemplate for service calls',
        'Implement health checks',
        'Handle service unavailability gracefully'
      ],
      commonMistakes: [
        'Hardcoding service URLs',
        'Not using load balancing'
      ],
      java21Tips: ['Use HTTP client with virtual threads']
    })
  },

  API_GATEWAY_FILTER: {
    name: 'API Gateway Filter',
    description: 'Spring Cloud Gateway custom filter',
    generate: (className, packageName) => ({
      name: 'Gateway Filter',
      fileName: 'CustomGatewayFilter.java',
      packagePath: `${packageName}.gateway`,
      useCase: 'Custom API Gateway filter for request/response modification',
      code: `package ${packageName}.gateway;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
public class CustomGatewayFilter extends AbstractGatewayFilterFactory<CustomGatewayFilter.Config> {

    private static final Logger log = LoggerFactory.getLogger(CustomGatewayFilter.class);

    public CustomGatewayFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            // Pre-processing
            String correlationId = UUID.randomUUID().toString();
            long startTime = System.currentTimeMillis();

            log.info("Request: {} {} [correlationId={}]",
                exchange.getRequest().getMethod(),
                exchange.getRequest().getURI(),
                correlationId);

            // Modify request
            ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                .header("X-Correlation-ID", correlationId)
                .header("X-Request-Time", String.valueOf(startTime))
                .build();

            ServerWebExchange modifiedExchange = exchange.mutate()
                .request(modifiedRequest)
                .build();

            return chain.filter(modifiedExchange).then(Mono.fromRunnable(() -> {
                // Post-processing
                long duration = System.currentTimeMillis() - startTime;
                ServerHttpResponse response = exchange.getResponse();

                response.getHeaders().add("X-Correlation-ID", correlationId);
                response.getHeaders().add("X-Response-Time", duration + "ms");

                log.info("Response: {} [correlationId={}, duration={}ms]",
                    response.getStatusCode(), correlationId, duration);
            }));
        };
    }

    public static class Config {
        private boolean logging = true;
        private boolean addCorrelationId = true;

        public boolean isLogging() { return logging; }
        public void setLogging(boolean logging) { this.logging = logging; }
        public boolean isAddCorrelationId() { return addCorrelationId; }
        public void setAddCorrelationId(boolean addCorrelationId) { this.addCorrelationId = addCorrelationId; }
    }
}`,
      explanation: 'Custom Spring Cloud Gateway filter for cross-cutting concerns.',
      bestPractices: [
        'Add correlation IDs for distributed tracing',
        'Log request/response for debugging',
        'Measure request duration'
      ],
      commonMistakes: [
        'Not propagating correlation IDs',
        'Blocking operations in reactive filters'
      ],
      java21Tips: ['Use structured concurrency for complex async operations']
    })
  },

  DISTRIBUTED_TRACING: {
    name: 'Distributed Tracing',
    description: 'Micrometer tracing with spans',
    generate: (className, packageName) => ({
      name: 'Tracing Service',
      fileName: 'TracingService.java',
      packagePath: `${packageName}.tracing`,
      useCase: 'Distributed tracing for microservices observability',
      code: `package ${packageName}.tracing;

import io.micrometer.observation.Observation;
import io.micrometer.observation.ObservationRegistry;
import io.micrometer.tracing.Span;
import io.micrometer.tracing.Tracer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.function.Supplier;

@Service
public class TracingService {

    private static final Logger log = LoggerFactory.getLogger(TracingService.class);

    private final Tracer tracer;
    private final ObservationRegistry observationRegistry;

    public TracingService(Tracer tracer, ObservationRegistry observationRegistry) {
        this.tracer = tracer;
        this.observationRegistry = observationRegistry;
    }

    /**
     * Create a new span for a specific operation
     */
    public <T> T traceOperation(String operationName, Supplier<T> operation) {
        Span span = tracer.nextSpan().name(operationName).start();

        try (Tracer.SpanInScope ws = tracer.withSpan(span)) {
            log.info("Starting operation: {} [traceId={}]", operationName, span.context().traceId());
            T result = operation.get();
            span.tag("status", "success");
            return result;
        } catch (Exception e) {
            span.tag("status", "error");
            span.tag("error.message", e.getMessage());
            span.error(e);
            throw e;
        } finally {
            span.end();
            log.info("Completed operation: {} [traceId={}]", operationName, span.context().traceId());
        }
    }

    /**
     * Create observation for metrics and tracing
     */
    public <T> T observe(String name, Supplier<T> operation) {
        return Observation.createNotStarted(name, observationRegistry)
            .observe(operation);
    }

    /**
     * Add custom tags to current span
     */
    public void addTag(String key, String value) {
        Span currentSpan = tracer.currentSpan();
        if (currentSpan != null) {
            currentSpan.tag(key, value);
        }
    }

    /**
     * Add event to current span
     */
    public void addEvent(String eventName) {
        Span currentSpan = tracer.currentSpan();
        if (currentSpan != null) {
            currentSpan.event(eventName);
        }
    }

    /**
     * Get current trace ID
     */
    public String getCurrentTraceId() {
        Span currentSpan = tracer.currentSpan();
        return currentSpan != null ? currentSpan.context().traceId() : "N/A";
    }
}`,
      explanation: 'Distributed tracing service using Micrometer for observability.',
      bestPractices: [
        'Always propagate trace context',
        'Add meaningful tags to spans',
        'Use observations for automatic metrics'
      ],
      commonMistakes: [
        'Not closing spans properly',
        'Too many custom spans causing overhead'
      ],
      java21Tips: ['Use scoped values for context propagation']
    })
  },

  HEALTH_CHECK: {
    name: 'Custom Health Indicator',
    description: 'Spring Boot Actuator health checks',
    generate: (className, packageName) => ({
      name: 'Health Indicators',
      fileName: 'CustomHealthIndicators.java',
      packagePath: `${packageName}.health`,
      useCase: 'Custom health checks for external dependencies',
      code: `package ${packageName}.health;

import org.springframework.boot.actuate.health.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * Database Health Indicator
 */
@Component
public class DatabaseHealthIndicator implements HealthIndicator {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseHealthIndicator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public Health health() {
        try {
            long start = System.currentTimeMillis();
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            long responseTime = System.currentTimeMillis() - start;

            return Health.up()
                .withDetail("responseTime", responseTime + "ms")
                .withDetail("database", "PostgreSQL")
                .build();
        } catch (Exception e) {
            return Health.down()
                .withException(e)
                .build();
        }
    }
}

/**
 * External Service Health Indicator
 */
@Component
class ExternalServiceHealthIndicator implements HealthIndicator {

    private final RestTemplate restTemplate;
    private final String healthEndpoint = "http://external-service/health";

    public ExternalServiceHealthIndicator(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public Health health() {
        try {
            long start = System.currentTimeMillis();
            restTemplate.getForObject(healthEndpoint, String.class);
            long responseTime = System.currentTimeMillis() - start;

            return Health.up()
                .withDetail("service", "external-service")
                .withDetail("responseTime", responseTime + "ms")
                .build();
        } catch (Exception e) {
            return Health.down()
                .withDetail("service", "external-service")
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}

/**
 * Composite Health Contributor for grouped checks
 */
@Component("services")
class ServicesHealthContributor implements CompositeHealthContributor {

    private final Map<String, HealthContributor> contributors = new HashMap<>();

    public ServicesHealthContributor(DatabaseHealthIndicator dbHealth,
                                     ExternalServiceHealthIndicator externalHealth) {
        contributors.put("database", dbHealth);
        contributors.put("externalService", externalHealth);
    }

    @Override
    public HealthContributor getContributor(String name) {
        return contributors.get(name);
    }

    @Override
    public java.util.Iterator<NamedContributor<HealthContributor>> iterator() {
        return contributors.entrySet().stream()
            .map(e -> NamedContributor.of(e.getKey(), e.getValue()))
            .iterator();
    }
}`,
      explanation: 'Custom health indicators for comprehensive system health monitoring.',
      bestPractices: [
        'Include response times in health details',
        'Group related health checks',
        'Set appropriate timeouts'
      ],
      commonMistakes: [
        'Blocking health checks for too long',
        'Not handling timeouts'
      ],
      java21Tips: ['Use virtual threads for parallel health checks']
    })
  }
};
