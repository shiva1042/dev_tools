// Caching Templates - Redis, Caffeine, Spring Cache

export const cachingTemplates = {
  REDIS_SERVICE: {
    name: 'Redis Cache Service',
    description: 'Redis caching with Spring Data Redis',
    generate: (className, packageName) => ({
      name: 'Redis Cache Service',
      fileName: `${className}RedisService.java`,
      packagePath: `${packageName}.cache`,
      useCase: 'Distributed caching with Redis for scalable applications',
      code: `package ${packageName}.cache;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.*;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
public class ${className}RedisService {

    private static final Logger log = LoggerFactory.getLogger(${className}RedisService.class);

    private final RedisTemplate<String, Object> redisTemplate;
    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    public ${className}RedisService(RedisTemplate<String, Object> redisTemplate,
                                    StringRedisTemplate stringRedisTemplate,
                                    ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.stringRedisTemplate = stringRedisTemplate;
        this.objectMapper = objectMapper;
    }

    // ============================================
    // STRING OPERATIONS
    // ============================================

    public void set(String key, Object value) {
        redisTemplate.opsForValue().set(key, value);
    }

    public void set(String key, Object value, Duration ttl) {
        redisTemplate.opsForValue().set(key, value, ttl);
    }

    public <T> Optional<T> get(String key, Class<T> type) {
        Object value = redisTemplate.opsForValue().get(key);
        if (value == null) return Optional.empty();
        return Optional.of(objectMapper.convertValue(value, type));
    }

    public Boolean setIfAbsent(String key, Object value, Duration ttl) {
        return redisTemplate.opsForValue().setIfAbsent(key, value, ttl);
    }

    public Long increment(String key) {
        return stringRedisTemplate.opsForValue().increment(key);
    }

    public Long increment(String key, long delta) {
        return stringRedisTemplate.opsForValue().increment(key, delta);
    }

    // ============================================
    // HASH OPERATIONS
    // ============================================

    public void hashPut(String key, String hashKey, Object value) {
        redisTemplate.opsForHash().put(key, hashKey, value);
    }

    public void hashPutAll(String key, Map<String, Object> map) {
        redisTemplate.opsForHash().putAll(key, map);
    }

    public <T> Optional<T> hashGet(String key, String hashKey, Class<T> type) {
        Object value = redisTemplate.opsForHash().get(key, hashKey);
        if (value == null) return Optional.empty();
        return Optional.of(objectMapper.convertValue(value, type));
    }

    public Map<Object, Object> hashGetAll(String key) {
        return redisTemplate.opsForHash().entries(key);
    }

    public Long hashDelete(String key, String... hashKeys) {
        return redisTemplate.opsForHash().delete(key, (Object[]) hashKeys);
    }

    // ============================================
    // LIST OPERATIONS
    // ============================================

    public Long listPush(String key, Object value) {
        return redisTemplate.opsForList().rightPush(key, value);
    }

    public Long listPushAll(String key, Collection<?> values) {
        return redisTemplate.opsForList().rightPushAll(key, values);
    }

    public <T> List<T> listRange(String key, long start, long end, Class<T> type) {
        List<Object> values = redisTemplate.opsForList().range(key, start, end);
        if (values == null) return List.of();
        return values.stream()
            .map(v -> objectMapper.convertValue(v, type))
            .toList();
    }

    public Object listPop(String key) {
        return redisTemplate.opsForList().leftPop(key);
    }

    public Long listSize(String key) {
        return redisTemplate.opsForList().size(key);
    }

    // ============================================
    // SET OPERATIONS
    // ============================================

    public Long setAdd(String key, Object... values) {
        return redisTemplate.opsForSet().add(key, values);
    }

    public Set<Object> setMembers(String key) {
        return redisTemplate.opsForSet().members(key);
    }

    public Boolean setIsMember(String key, Object value) {
        return redisTemplate.opsForSet().isMember(key, value);
    }

    public Long setRemove(String key, Object... values) {
        return redisTemplate.opsForSet().remove(key, values);
    }

    // ============================================
    // SORTED SET OPERATIONS
    // ============================================

    public Boolean zAdd(String key, Object value, double score) {
        return redisTemplate.opsForZSet().add(key, value, score);
    }

    public Set<Object> zRange(String key, long start, long end) {
        return redisTemplate.opsForZSet().range(key, start, end);
    }

    public Set<Object> zRangeByScore(String key, double min, double max) {
        return redisTemplate.opsForZSet().rangeByScore(key, min, max);
    }

    public Double zScore(String key, Object value) {
        return redisTemplate.opsForZSet().score(key, value);
    }

    // ============================================
    // COMMON OPERATIONS
    // ============================================

    public Boolean delete(String key) {
        return redisTemplate.delete(key);
    }

    public Long delete(Collection<String> keys) {
        return redisTemplate.delete(keys);
    }

    public Boolean hasKey(String key) {
        return redisTemplate.hasKey(key);
    }

    public Boolean expire(String key, Duration duration) {
        return redisTemplate.expire(key, duration);
    }

    public Long getExpire(String key) {
        return redisTemplate.getExpire(key, TimeUnit.SECONDS);
    }

    public Set<String> keys(String pattern) {
        return redisTemplate.keys(pattern);
    }

    // ============================================
    // CACHE-ASIDE PATTERN
    // ============================================

    public <T> T getOrLoad(String key, Class<T> type, java.util.function.Supplier<T> loader, Duration ttl) {
        return get(key, type).orElseGet(() -> {
            log.info("Cache miss for key: {}", key);
            T value = loader.get();
            if (value != null) {
                set(key, value, ttl);
            }
            return value;
        });
    }
}`,
      explanation: 'Comprehensive Redis service with all data structure operations.',
      bestPractices: [
        'Use appropriate TTLs',
        'Implement cache-aside pattern',
        'Use pipelining for batch operations'
      ],
      commonMistakes: [
        'No TTL leading to memory issues',
        'Not handling connection failures'
      ],
      java21Tips: ['Use virtual threads for Redis operations']
    })
  },

  CAFFEINE_CACHE: {
    name: 'Caffeine Local Cache',
    description: 'High-performance local caching',
    generate: (className, packageName) => ({
      name: 'Caffeine Cache Config',
      fileName: 'CaffeineCacheConfig.java',
      packagePath: `${packageName}.config`,
      useCase: 'High-performance local caching with Caffeine',
      code: `package ${packageName}.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.RemovalCause;
import com.github.benmanes.caffeine.cache.RemovalListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.time.Duration;
import java.util.List;

@Configuration
@EnableCaching
public class CaffeineCacheConfig {

    private static final Logger log = LoggerFactory.getLogger(CaffeineCacheConfig.class);

    /**
     * Default cache manager with standard settings
     */
    @Bean
    @Primary
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(caffeineCacheBuilder());
        cacheManager.setCacheNames(List.of(
            "users",
            "products",
            "configurations",
            "sessions"
        ));
        return cacheManager;
    }

    /**
     * Cache manager for short-lived data
     */
    @Bean("shortLivedCacheManager")
    public CacheManager shortLivedCacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(Caffeine.newBuilder()
            .maximumSize(1000)
            .expireAfterWrite(Duration.ofMinutes(5))
            .recordStats());
        return cacheManager;
    }

    /**
     * Cache manager for long-lived data
     */
    @Bean("longLivedCacheManager")
    public CacheManager longLivedCacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(Caffeine.newBuilder()
            .maximumSize(10000)
            .expireAfterWrite(Duration.ofHours(24))
            .refreshAfterWrite(Duration.ofHours(1))
            .recordStats());
        return cacheManager;
    }

    private Caffeine<Object, Object> caffeineCacheBuilder() {
        return Caffeine.newBuilder()
            .initialCapacity(100)
            .maximumSize(5000)
            .expireAfterWrite(Duration.ofMinutes(30))
            .expireAfterAccess(Duration.ofMinutes(15))
            .recordStats()
            .removalListener(removalListener());
    }

    private RemovalListener<Object, Object> removalListener() {
        return (key, value, cause) -> {
            if (cause == RemovalCause.EXPIRED) {
                log.debug("Cache entry expired: {}", key);
            } else if (cause == RemovalCause.SIZE) {
                log.debug("Cache entry evicted due to size: {}", key);
            }
        };
    }
}

// Example service using caching
@org.springframework.stereotype.Service
class ${className}CachedService {

    private static final Logger log = LoggerFactory.getLogger(${className}CachedService.class);

    /**
     * Cache result of method
     */
    @org.springframework.cache.annotation.Cacheable(value = "users", key = "#id")
    public UserDto findById(String id) {
        log.info("Loading user from database: {}", id);
        // Simulate database call
        return new UserDto(id, "User " + id);
    }

    /**
     * Cache with condition
     */
    @org.springframework.cache.annotation.Cacheable(
        value = "products",
        key = "#id",
        condition = "#id != null",
        unless = "#result == null"
    )
    public ProductDto findProduct(String id) {
        return new ProductDto(id, "Product");
    }

    /**
     * Update cache on save
     */
    @org.springframework.cache.annotation.CachePut(value = "users", key = "#user.id")
    public UserDto save(UserDto user) {
        log.info("Saving user: {}", user.id());
        return user;
    }

    /**
     * Evict cache entry
     */
    @org.springframework.cache.annotation.CacheEvict(value = "users", key = "#id")
    public void delete(String id) {
        log.info("Deleting user: {}", id);
    }

    /**
     * Evict all entries
     */
    @org.springframework.cache.annotation.CacheEvict(value = "users", allEntries = true)
    public void clearCache() {
        log.info("Clearing users cache");
    }

    /**
     * Multiple cache operations
     */
    @org.springframework.cache.annotation.Caching(
        cacheable = @org.springframework.cache.annotation.Cacheable(value = "users", key = "#id"),
        put = @org.springframework.cache.annotation.CachePut(value = "users-backup", key = "#id")
    )
    public UserDto findAndBackup(String id) {
        return findById(id);
    }

    record UserDto(String id, String name) {}
    record ProductDto(String id, String name) {}
}`,
      explanation: 'Caffeine cache configuration with multiple cache managers and usage examples.',
      bestPractices: [
        'Use appropriate cache sizes',
        'Configure refresh for frequently accessed data',
        'Monitor cache statistics'
      ],
      commonMistakes: [
        'Not setting maximum size',
        'Caching mutable objects'
      ],
      java21Tips: ['Use records for cached objects']
    })
  },

  CACHE_ASIDE: {
    name: 'Cache-Aside Pattern',
    description: 'Read-through/write-through caching',
    generate: (className, packageName) => ({
      name: 'Cache-Aside Service',
      fileName: `${className}CacheAsideService.java`,
      packagePath: `${packageName}.cache`,
      useCase: 'Cache-aside pattern for database query caching',
      code: `package ${packageName}.cache;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;
import java.util.function.Function;
import java.util.function.Supplier;

@Service
public class ${className}CacheAsideService<K, V> {

    private static final Logger log = LoggerFactory.getLogger(${className}CacheAsideService.class);

    private final RedisTemplate<String, Object> redisTemplate;
    private final String cachePrefix;
    private final Duration defaultTtl;

    public ${className}CacheAsideService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.cachePrefix = "${className.toLowerCase()}:";
        this.defaultTtl = Duration.ofMinutes(30);
    }

    /**
     * Read-through: Get from cache, load from source if miss
     */
    @SuppressWarnings("unchecked")
    public V get(K key, Supplier<V> loader) {
        String cacheKey = buildKey(key);

        // Try cache first
        V cached = (V) redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            log.debug("Cache hit for key: {}", cacheKey);
            return cached;
        }

        // Cache miss - load from source
        log.debug("Cache miss for key: {}", cacheKey);
        V value = loader.get();

        if (value != null) {
            redisTemplate.opsForValue().set(cacheKey, value, defaultTtl);
            log.debug("Cached value for key: {}", cacheKey);
        }

        return value;
    }

    /**
     * Get with custom TTL
     */
    @SuppressWarnings("unchecked")
    public V get(K key, Supplier<V> loader, Duration ttl) {
        String cacheKey = buildKey(key);
        V cached = (V) redisTemplate.opsForValue().get(cacheKey);

        if (cached != null) {
            return cached;
        }

        V value = loader.get();
        if (value != null) {
            redisTemplate.opsForValue().set(cacheKey, value, ttl);
        }
        return value;
    }

    /**
     * Write-through: Update both cache and source
     */
    public V put(K key, V value, Function<V, V> saver) {
        String cacheKey = buildKey(key);

        // Save to source first
        V saved = saver.apply(value);

        // Then update cache
        redisTemplate.opsForValue().set(cacheKey, saved, defaultTtl);
        log.debug("Updated cache for key: {}", cacheKey);

        return saved;
    }

    /**
     * Write-around: Only invalidate cache on write
     */
    public V putWithInvalidation(K key, V value, Function<V, V> saver) {
        String cacheKey = buildKey(key);

        // Save to source
        V saved = saver.apply(value);

        // Invalidate cache (next read will reload)
        redisTemplate.delete(cacheKey);
        log.debug("Invalidated cache for key: {}", cacheKey);

        return saved;
    }

    /**
     * Delete from both cache and source
     */
    public void delete(K key, Runnable deleter) {
        String cacheKey = buildKey(key);

        // Delete from source first
        deleter.run();

        // Then remove from cache
        redisTemplate.delete(cacheKey);
        log.debug("Deleted cache for key: {}", cacheKey);
    }

    /**
     * Refresh cache entry
     */
    public V refresh(K key, Supplier<V> loader) {
        String cacheKey = buildKey(key);
        redisTemplate.delete(cacheKey);

        V value = loader.get();
        if (value != null) {
            redisTemplate.opsForValue().set(cacheKey, value, defaultTtl);
        }
        return value;
    }

    /**
     * Check if key exists in cache
     */
    public boolean exists(K key) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(buildKey(key)));
    }

    /**
     * Evict single entry
     */
    public void evict(K key) {
        redisTemplate.delete(buildKey(key));
    }

    /**
     * Evict by pattern
     */
    public void evictByPattern(String pattern) {
        var keys = redisTemplate.keys(cachePrefix + pattern);
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
            log.info("Evicted {} cache entries matching pattern: {}", keys.size(), pattern);
        }
    }

    private String buildKey(K key) {
        return cachePrefix + key.toString();
    }
}`,
      explanation: 'Cache-aside pattern implementation with read-through and write-through strategies.',
      bestPractices: [
        'Use write-through for consistency',
        'Use write-around for read-heavy workloads',
        'Implement cache warming for critical data'
      ],
      commonMistakes: [
        'Race conditions on cache miss',
        'Not handling cache failures'
      ],
      java21Tips: ['Use virtual threads for parallel cache operations']
    })
  },

  DISTRIBUTED_LOCK: {
    name: 'Distributed Lock',
    description: 'Redis-based distributed locking',
    generate: (className, packageName) => ({
      name: 'Distributed Lock Service',
      fileName: 'DistributedLockService.java',
      packagePath: `${packageName}.lock`,
      useCase: 'Distributed locking for coordinating access across services',
      code: `package ${packageName}.lock;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

@Service
public class DistributedLockService {

    private static final Logger log = LoggerFactory.getLogger(DistributedLockService.class);

    private final StringRedisTemplate redisTemplate;
    private final String lockPrefix = "lock:";

    // Lua script for atomic unlock
    private static final String UNLOCK_SCRIPT = """
        if redis.call('get', KEYS[1]) == ARGV[1] then
            return redis.call('del', KEYS[1])
        else
            return 0
        end
        """;

    // Lua script for lock extension
    private static final String EXTEND_SCRIPT = """
        if redis.call('get', KEYS[1]) == ARGV[1] then
            return redis.call('pexpire', KEYS[1], ARGV[2])
        else
            return 0
        end
        """;

    public DistributedLockService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Try to acquire a lock
     */
    public LockHandle tryLock(String lockName, Duration ttl) {
        String lockKey = lockPrefix + lockName;
        String lockValue = UUID.randomUUID().toString();

        Boolean acquired = redisTemplate.opsForValue()
            .setIfAbsent(lockKey, lockValue, ttl);

        if (Boolean.TRUE.equals(acquired)) {
            log.debug("Lock acquired: {}", lockName);
            return new LockHandle(lockKey, lockValue, true);
        }

        log.debug("Failed to acquire lock: {}", lockName);
        return new LockHandle(lockKey, lockValue, false);
    }

    /**
     * Try to acquire lock with retry
     */
    public LockHandle tryLock(String lockName, Duration ttl, Duration timeout) throws InterruptedException {
        long startTime = System.currentTimeMillis();
        long timeoutMs = timeout.toMillis();

        while (System.currentTimeMillis() - startTime < timeoutMs) {
            LockHandle handle = tryLock(lockName, ttl);
            if (handle.isAcquired()) {
                return handle;
            }
            Thread.sleep(50); // Small delay before retry
        }

        return new LockHandle(lockPrefix + lockName, "", false);
    }

    /**
     * Release a lock
     */
    public boolean unlock(LockHandle handle) {
        if (!handle.isAcquired()) {
            return false;
        }

        Long result = redisTemplate.execute(
            RedisScript.of(UNLOCK_SCRIPT, Long.class),
            List.of(handle.lockKey()),
            handle.lockValue()
        );

        boolean released = result != null && result == 1;
        if (released) {
            log.debug("Lock released: {}", handle.lockKey());
        } else {
            log.warn("Failed to release lock (already expired or stolen): {}", handle.lockKey());
        }
        return released;
    }

    /**
     * Extend lock TTL
     */
    public boolean extend(LockHandle handle, Duration newTtl) {
        if (!handle.isAcquired()) {
            return false;
        }

        Long result = redisTemplate.execute(
            RedisScript.of(EXTEND_SCRIPT, Long.class),
            List.of(handle.lockKey()),
            handle.lockValue(),
            String.valueOf(newTtl.toMillis())
        );

        return result != null && result == 1;
    }

    /**
     * Execute action with lock
     */
    public <T> T executeWithLock(String lockName, Duration ttl, Supplier<T> action) {
        LockHandle handle = tryLock(lockName, ttl);

        if (!handle.isAcquired()) {
            throw new LockAcquisitionException("Failed to acquire lock: " + lockName);
        }

        try {
            return action.get();
        } finally {
            unlock(handle);
        }
    }

    /**
     * Execute action with lock and retry
     */
    public <T> T executeWithLock(String lockName, Duration ttl, Duration timeout, Supplier<T> action)
            throws InterruptedException {
        LockHandle handle = tryLock(lockName, ttl, timeout);

        if (!handle.isAcquired()) {
            throw new LockAcquisitionException("Failed to acquire lock within timeout: " + lockName);
        }

        try {
            return action.get();
        } finally {
            unlock(handle);
        }
    }

    /**
     * Lock handle record
     */
    public record LockHandle(String lockKey, String lockValue, boolean isAcquired) {
        public boolean isAcquired() { return isAcquired; }
    }

    /**
     * Lock acquisition exception
     */
    public static class LockAcquisitionException extends RuntimeException {
        public LockAcquisitionException(String message) {
            super(message);
        }
    }
}`,
      explanation: 'Distributed lock implementation using Redis with atomic operations.',
      bestPractices: [
        'Use unique lock values to prevent accidental unlock',
        'Set appropriate TTLs to prevent deadlocks',
        'Use Lua scripts for atomic operations'
      ],
      commonMistakes: [
        'Not using unique lock values',
        'Forgetting to release locks'
      ],
      java21Tips: ['Use try-with-resources pattern with AutoCloseable lock handles']
    })
  }
};
