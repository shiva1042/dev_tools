// Messaging Templates - Kafka, RabbitMQ, Event-Driven Architecture

export const messagingTemplates = {
  KAFKA_PRODUCER: {
    name: 'Kafka Producer',
    description: 'Apache Kafka message producer',
    generate: (className, packageName) => ({
      name: 'Kafka Producer Service',
      fileName: `${className}KafkaProducer.java`,
      packagePath: `${packageName}.messaging`,
      useCase: 'Publish messages to Apache Kafka topics',
      code: `package ${packageName}.messaging;

import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.header.internals.RecordHeader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
public class ${className}KafkaProducer {

    private static final Logger log = LoggerFactory.getLogger(${className}KafkaProducer.class);

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public ${className}KafkaProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    /**
     * Send message with auto-generated key
     */
    public CompletableFuture<SendResult<String, Object>> send(String topic, Object message) {
        String key = UUID.randomUUID().toString();
        return send(topic, key, message);
    }

    /**
     * Send message with specific key
     */
    public CompletableFuture<SendResult<String, Object>> send(String topic, String key, Object message) {
        log.info("Sending message to topic: {} with key: {}", topic, key);

        return kafkaTemplate.send(topic, key, message)
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to send message to topic: {}", topic, ex);
                } else {
                    log.info("Message sent successfully to topic: {}, partition: {}, offset: {}",
                        topic,
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
                }
            });
    }

    /**
     * Send message with headers
     */
    public CompletableFuture<SendResult<String, Object>> sendWithHeaders(
            String topic, String key, Object message, String correlationId) {

        ProducerRecord<String, Object> record = new ProducerRecord<>(topic, key, message);
        record.headers()
            .add(new RecordHeader("correlation-id", correlationId.getBytes(StandardCharsets.UTF_8)))
            .add(new RecordHeader("timestamp", String.valueOf(System.currentTimeMillis()).getBytes(StandardCharsets.UTF_8)));

        return kafkaTemplate.send(record)
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to send message with correlation-id: {}", correlationId, ex);
                } else {
                    log.info("Message sent with correlation-id: {}", correlationId);
                }
            });
    }

    /**
     * Send message to specific partition
     */
    public CompletableFuture<SendResult<String, Object>> sendToPartition(
            String topic, int partition, String key, Object message) {

        return kafkaTemplate.send(topic, partition, key, message);
    }

    /**
     * Send and wait synchronously
     */
    public SendResult<String, Object> sendSync(String topic, String key, Object message) {
        try {
            return kafkaTemplate.send(topic, key, message).get();
        } catch (Exception e) {
            throw new RuntimeException("Failed to send message synchronously", e);
        }
    }
}`,
      explanation: 'Kafka producer service with various send methods and error handling.',
      bestPractices: [
        'Use correlation IDs for tracing',
        'Handle send failures gracefully',
        'Consider idempotent producer settings'
      ],
      commonMistakes: [
        'Not handling async failures',
        'Missing error logging'
      ],
      java21Tips: ['Use virtual threads for high-throughput scenarios']
    })
  },

  KAFKA_CONSUMER: {
    name: 'Kafka Consumer',
    description: 'Apache Kafka message consumer',
    generate: (className, packageName) => ({
      name: 'Kafka Consumer Service',
      fileName: `${className}KafkaConsumer.java`,
      packagePath: `${packageName}.messaging`,
      useCase: 'Consume messages from Apache Kafka topics',
      code: `package ${packageName}.messaging;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.kafka.retrytopic.TopicSuffixingStrategy;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.retry.annotation.Backoff;
import org.springframework.stereotype.Service;

@Service
public class ${className}KafkaConsumer {

    private static final Logger log = LoggerFactory.getLogger(${className}KafkaConsumer.class);

    /**
     * Basic consumer with manual acknowledgment
     */
    @KafkaListener(
        topics = "\${kafka.topics.${className.toLowerCase()}}",
        groupId = "\${kafka.consumer.group-id}",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void consume(
            @Payload String message,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            @Header(KafkaHeaders.RECEIVED_KEY) String key,
            Acknowledgment ack) {

        log.info("Received message from topic: {}, partition: {}, offset: {}, key: {}",
            topic, partition, offset, key);

        try {
            processMessage(message);
            ack.acknowledge();
            log.info("Message processed successfully");
        } catch (Exception e) {
            log.error("Error processing message", e);
            // Don't acknowledge - message will be redelivered
            throw e;
        }
    }

    /**
     * Consumer with retry and dead letter topic
     */
    @RetryableTopic(
        attempts = "3",
        backoff = @Backoff(delay = 1000, multiplier = 2.0),
        topicSuffixingStrategy = TopicSuffixingStrategy.SUFFIX_WITH_INDEX_VALUE,
        dltTopicSuffix = "-dlt",
        autoCreateTopics = "true"
    )
    @KafkaListener(topics = "orders", groupId = "order-processor")
    public void consumeWithRetry(ConsumerRecord<String, String> record) {
        log.info("Processing order: {}", record.value());

        if (shouldFail(record.value())) {
            throw new RuntimeException("Processing failed - will retry");
        }

        processMessage(record.value());
    }

    /**
     * Dead Letter Topic handler
     */
    @KafkaListener(topics = "orders-dlt", groupId = "order-dlt-processor")
    public void handleDlt(ConsumerRecord<String, String> record) {
        log.error("Received message in DLT: topic={}, key={}, value={}",
            record.topic(), record.key(), record.value());

        // Store for manual review or alerting
        storeFailedMessage(record);
    }

    /**
     * Batch consumer
     */
    @KafkaListener(
        topics = "batch-events",
        groupId = "batch-processor",
        containerFactory = "batchKafkaListenerContainerFactory"
    )
    public void consumeBatch(java.util.List<ConsumerRecord<String, String>> records, Acknowledgment ack) {
        log.info("Received batch of {} messages", records.size());

        try {
            records.forEach(record -> processMessage(record.value()));
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Batch processing failed", e);
            throw e;
        }
    }

    private void processMessage(String message) {
        // Business logic here
        log.debug("Processing: {}", message);
    }

    private boolean shouldFail(String message) {
        return message.contains("fail");
    }

    private void storeFailedMessage(ConsumerRecord<String, String> record) {
        // Store in database for manual review
    }
}`,
      explanation: 'Kafka consumer with retry, DLT, batch processing, and manual acknowledgment.',
      bestPractices: [
        'Use manual acknowledgment for at-least-once delivery',
        'Implement retry with exponential backoff',
        'Use DLT for failed messages'
      ],
      commonMistakes: [
        'Auto-committing offsets with failures',
        'Not handling poison pills'
      ],
      java21Tips: ['Use virtual threads for I/O bound message processing']
    })
  },

  RABBITMQ_PRODUCER: {
    name: 'RabbitMQ Producer',
    description: 'RabbitMQ message publisher',
    generate: (className, packageName) => ({
      name: 'RabbitMQ Producer',
      fileName: `${className}RabbitProducer.java`,
      packagePath: `${packageName}.messaging`,
      useCase: 'Publish messages to RabbitMQ exchanges',
      code: `package ${packageName}.messaging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.CorrelationData;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ${className}RabbitProducer {

    private static final Logger log = LoggerFactory.getLogger(${className}RabbitProducer.class);

    private final RabbitTemplate rabbitTemplate;

    public ${className}RabbitProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
        setupConfirmCallback();
    }

    private void setupConfirmCallback() {
        rabbitTemplate.setConfirmCallback((correlationData, ack, cause) -> {
            String id = correlationData != null ? correlationData.getId() : "unknown";
            if (ack) {
                log.info("Message confirmed: {}", id);
            } else {
                log.error("Message NOT confirmed: {}, cause: {}", id, cause);
            }
        });

        rabbitTemplate.setReturnsCallback(returned -> {
            log.error("Message returned: exchange={}, routingKey={}, replyCode={}, replyText={}",
                returned.getExchange(),
                returned.getRoutingKey(),
                returned.getReplyCode(),
                returned.getReplyText());
        });
    }

    /**
     * Send to direct exchange
     */
    public void sendDirect(String exchange, String routingKey, Object message) {
        String correlationId = UUID.randomUUID().toString();
        CorrelationData correlationData = new CorrelationData(correlationId);

        log.info("Sending message to exchange: {}, routingKey: {}, correlationId: {}",
            exchange, routingKey, correlationId);

        rabbitTemplate.convertAndSend(exchange, routingKey, message, msg -> {
            msg.getMessageProperties().setCorrelationId(correlationId);
            msg.getMessageProperties().setContentType("application/json");
            return msg;
        }, correlationData);
    }

    /**
     * Send to fanout exchange (broadcast)
     */
    public void sendFanout(String exchange, Object message) {
        rabbitTemplate.convertAndSend(exchange, "", message);
    }

    /**
     * Send to topic exchange with routing pattern
     */
    public void sendTopic(String exchange, String routingKey, Object message) {
        rabbitTemplate.convertAndSend(exchange, routingKey, message);
    }

    /**
     * Send with delay (requires delayed message plugin)
     */
    public void sendDelayed(String exchange, String routingKey, Object message, int delayMs) {
        rabbitTemplate.convertAndSend(exchange, routingKey, message, msg -> {
            msg.getMessageProperties().setDelay(delayMs);
            return msg;
        });
    }

    /**
     * Send with TTL
     */
    public void sendWithTTL(String exchange, String routingKey, Object message, int ttlMs) {
        rabbitTemplate.convertAndSend(exchange, routingKey, message, msg -> {
            msg.getMessageProperties().setExpiration(String.valueOf(ttlMs));
            return msg;
        });
    }

    /**
     * Send with priority
     */
    public void sendWithPriority(String exchange, String routingKey, Object message, int priority) {
        rabbitTemplate.convertAndSend(exchange, routingKey, message, msg -> {
            msg.getMessageProperties().setPriority(priority);
            return msg;
        });
    }
}`,
      explanation: 'RabbitMQ producer with publisher confirms, routing patterns, and message properties.',
      bestPractices: [
        'Use publisher confirms for reliability',
        'Set correlation IDs for tracing',
        'Handle returned messages'
      ],
      commonMistakes: [
        'Not handling publisher confirms',
        'Ignoring returned messages'
      ],
      java21Tips: ['Use records for message DTOs']
    })
  },

  RABBITMQ_CONSUMER: {
    name: 'RabbitMQ Consumer',
    description: 'RabbitMQ message listener',
    generate: (className, packageName) => ({
      name: 'RabbitMQ Consumer',
      fileName: `${className}RabbitConsumer.java`,
      packagePath: `${packageName}.messaging`,
      useCase: 'Consume messages from RabbitMQ queues',
      code: `package ${packageName}.messaging;

import com.rabbitmq.client.Channel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.*;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class ${className}RabbitConsumer {

    private static final Logger log = LoggerFactory.getLogger(${className}RabbitConsumer.class);

    /**
     * Basic listener with auto-acknowledgment
     */
    @RabbitListener(queues = "\${rabbitmq.queues.${className.toLowerCase()}}")
    public void consume(@Payload String message) {
        log.info("Received message: {}", message);
        processMessage(message);
    }

    /**
     * Listener with manual acknowledgment
     */
    @RabbitListener(
        queues = "\${rabbitmq.queues.orders}",
        ackMode = "MANUAL"
    )
    public void consumeManualAck(
            @Payload String message,
            Channel channel,
            @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag,
            @Header(AmqpHeaders.CORRELATION_ID) String correlationId) throws IOException {

        log.info("Received message with correlationId: {}", correlationId);

        try {
            processMessage(message);
            channel.basicAck(deliveryTag, false);
            log.info("Message acknowledged");
        } catch (Exception e) {
            log.error("Error processing message", e);
            // Reject and requeue
            channel.basicNack(deliveryTag, false, true);
        }
    }

    /**
     * Listener with retry and DLQ
     */
    @RabbitListener(
        bindings = @QueueBinding(
            value = @Queue(value = "events.queue", durable = "true",
                arguments = {
                    @Argument(name = "x-dead-letter-exchange", value = "events.dlx"),
                    @Argument(name = "x-dead-letter-routing-key", value = "events.dlq")
                }),
            exchange = @Exchange(value = "events.exchange", type = "topic"),
            key = "events.#"
        )
    )
    public void consumeWithDLQ(Message message, Channel channel) throws IOException {
        long deliveryTag = message.getMessageProperties().getDeliveryTag();
        Integer retryCount = (Integer) message.getMessageProperties().getHeaders()
            .getOrDefault("x-retry-count", 0);

        try {
            processMessage(new String(message.getBody()));
            channel.basicAck(deliveryTag, false);
        } catch (Exception e) {
            if (retryCount >= 3) {
                log.error("Max retries reached, sending to DLQ");
                channel.basicReject(deliveryTag, false); // Goes to DLQ
            } else {
                log.warn("Retry {} for message", retryCount + 1);
                channel.basicNack(deliveryTag, false, true);
            }
        }
    }

    /**
     * Dead Letter Queue handler
     */
    @RabbitListener(queues = "events.dlq")
    public void handleDeadLetter(Message message) {
        log.error("Dead letter received: {}", new String(message.getBody()));
        // Store for manual review
    }

    /**
     * Concurrent listener
     */
    @RabbitListener(
        queues = "high-volume.queue",
        concurrency = "3-10"
    )
    public void consumeConcurrent(@Payload String message) {
        log.info("Processing on thread: {}", Thread.currentThread().getName());
        processMessage(message);
    }

    private void processMessage(String message) {
        // Business logic
        log.debug("Processing: {}", message);
    }
}`,
      explanation: 'RabbitMQ consumer with manual acknowledgment, DLQ, retry, and concurrency.',
      bestPractices: [
        'Use manual acknowledgment for reliability',
        'Implement DLQ for failed messages',
        'Configure appropriate concurrency'
      ],
      commonMistakes: [
        'Auto-acknowledging before processing completes',
        'Not handling channel exceptions'
      ],
      java21Tips: ['Use virtual threads for I/O bound consumers']
    })
  },

  EVENT_SOURCING: {
    name: 'Event Sourcing',
    description: 'Event sourcing pattern implementation',
    generate: (className, packageName) => ({
      name: 'Event Sourcing',
      fileName: `${className}EventStore.java`,
      packagePath: `${packageName}.eventsourcing`,
      useCase: 'Event sourcing pattern for audit trail and state reconstruction',
      code: `package ${packageName}.eventsourcing;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

// Event base class
public sealed interface DomainEvent permits
        ${className}Created, ${className}Updated, ${className}Deleted {
    String aggregateId();
    Instant occurredAt();
    String eventType();
}

record ${className}Created(String aggregateId, Instant occurredAt, Map<String, Object> data)
        implements DomainEvent {
    public String eventType() { return "${className}Created"; }
}

record ${className}Updated(String aggregateId, Instant occurredAt, Map<String, Object> changes)
        implements DomainEvent {
    public String eventType() { return "${className}Updated"; }
}

record ${className}Deleted(String aggregateId, Instant occurredAt, String reason)
        implements DomainEvent {
    public String eventType() { return "${className}Deleted"; }
}

// Event Store
@Repository
class ${className}EventStore {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public ${className}EventStore(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void append(DomainEvent event) {
        try {
            String payload = objectMapper.writeValueAsString(event);
            jdbcTemplate.update(
                """
                INSERT INTO event_store (aggregate_id, event_type, payload, occurred_at, version)
                VALUES (?, ?, ?::jsonb, ?,
                    (SELECT COALESCE(MAX(version), 0) + 1 FROM event_store WHERE aggregate_id = ?))
                """,
                event.aggregateId(),
                event.eventType(),
                payload,
                event.occurredAt(),
                event.aggregateId()
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to append event", e);
        }
    }

    public List<DomainEvent> getEvents(String aggregateId) {
        return jdbcTemplate.query(
            "SELECT * FROM event_store WHERE aggregate_id = ? ORDER BY version",
            (rs, rowNum) -> {
                try {
                    String eventType = rs.getString("event_type");
                    String payload = rs.getString("payload");
                    return switch (eventType) {
                        case "${className}Created" -> objectMapper.readValue(payload, ${className}Created.class);
                        case "${className}Updated" -> objectMapper.readValue(payload, ${className}Updated.class);
                        case "${className}Deleted" -> objectMapper.readValue(payload, ${className}Deleted.class);
                        default -> throw new IllegalArgumentException("Unknown event type: " + eventType);
                    };
                } catch (Exception e) {
                    throw new RuntimeException("Failed to deserialize event", e);
                }
            },
            aggregateId
        );
    }

    public List<DomainEvent> getEventsSince(String aggregateId, int version) {
        return jdbcTemplate.query(
            "SELECT * FROM event_store WHERE aggregate_id = ? AND version > ? ORDER BY version",
            (rs, rowNum) -> deserializeEvent(rs.getString("event_type"), rs.getString("payload")),
            aggregateId, version
        );
    }

    private DomainEvent deserializeEvent(String type, String payload) {
        // Implementation
        return null;
    }
}

// Aggregate that rebuilds state from events
@Service
class ${className}Aggregate {

    private final ${className}EventStore eventStore;

    private String id;
    private Map<String, Object> state = new HashMap<>();
    private boolean deleted = false;
    private int version = 0;

    public ${className}Aggregate(${className}EventStore eventStore) {
        this.eventStore = eventStore;
    }

    public void loadFromHistory(String aggregateId) {
        this.id = aggregateId;
        List<DomainEvent> events = eventStore.getEvents(aggregateId);
        events.forEach(this::apply);
    }

    private void apply(DomainEvent event) {
        version++;
        switch (event) {
            case ${className}Created created -> state.putAll(created.data());
            case ${className}Updated updated -> state.putAll(updated.changes());
            case ${className}Deleted deleted -> this.deleted = true;
        }
    }

    public Map<String, Object> getState() {
        return Collections.unmodifiableMap(state);
    }

    public boolean isDeleted() {
        return deleted;
    }
}`,
      explanation: 'Event sourcing implementation with event store and aggregate reconstruction.',
      bestPractices: [
        'Use sealed interfaces for event types',
        'Store events immutably',
        'Use snapshots for long event streams'
      ],
      commonMistakes: [
        'Modifying stored events',
        'Not handling event versioning'
      ],
      java21Tips: [
        'Sealed interfaces for type-safe events',
        'Pattern matching for event handling',
        'Records for immutable events'
      ]
    })
  },

  SAGA_PATTERN: {
    name: 'Saga Orchestrator',
    description: 'Distributed transaction saga pattern',
    generate: (className, packageName) => ({
      name: 'Saga Orchestrator',
      fileName: `${className}SagaOrchestrator.java`,
      packagePath: `${packageName}.saga`,
      useCase: 'Manage distributed transactions across microservices',
      code: `package ${packageName}.saga;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.CompletableFuture;

// Saga step definition
record SagaStep<T>(
    String name,
    java.util.function.Function<SagaContext, CompletableFuture<T>> execute,
    java.util.function.Consumer<SagaContext> compensate
) {}

// Saga context to pass data between steps
class SagaContext {
    private final Map<String, Object> data = new HashMap<>();
    private final List<String> completedSteps = new ArrayList<>();
    private String sagaId;

    public SagaContext(String sagaId) {
        this.sagaId = sagaId;
    }

    public void put(String key, Object value) { data.put(key, value); }
    public <T> T get(String key, Class<T> type) { return type.cast(data.get(key)); }
    public void markCompleted(String step) { completedSteps.add(step); }
    public List<String> getCompletedSteps() { return new ArrayList<>(completedSteps); }
    public String getSagaId() { return sagaId; }
}

// Saga orchestrator
@Service
public class ${className}SagaOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(${className}SagaOrchestrator.class);

    private final List<SagaStep<?>> steps = new ArrayList<>();

    /**
     * Add step to saga
     */
    public <T> ${className}SagaOrchestrator addStep(
            String name,
            java.util.function.Function<SagaContext, CompletableFuture<T>> execute,
            java.util.function.Consumer<SagaContext> compensate) {
        steps.add(new SagaStep<>(name, execute, compensate));
        return this;
    }

    /**
     * Execute saga
     */
    public CompletableFuture<SagaContext> execute(SagaContext context) {
        log.info("Starting saga: {}", context.getSagaId());

        return executeSteps(context, 0);
    }

    private CompletableFuture<SagaContext> executeSteps(SagaContext context, int stepIndex) {
        if (stepIndex >= steps.size()) {
            log.info("Saga completed successfully: {}", context.getSagaId());
            return CompletableFuture.completedFuture(context);
        }

        SagaStep<?> step = steps.get(stepIndex);
        log.info("Executing step: {} for saga: {}", step.name(), context.getSagaId());

        return step.execute().apply(context)
            .thenCompose(result -> {
                context.markCompleted(step.name());
                return executeSteps(context, stepIndex + 1);
            })
            .exceptionallyCompose(ex -> {
                log.error("Step {} failed for saga: {}", step.name(), context.getSagaId(), ex);
                return compensate(context, stepIndex - 1)
                    .thenCompose(v -> CompletableFuture.failedFuture(ex));
            });
    }

    private CompletableFuture<Void> compensate(SagaContext context, int fromStep) {
        log.info("Starting compensation from step {} for saga: {}", fromStep, context.getSagaId());

        for (int i = fromStep; i >= 0; i--) {
            SagaStep<?> step = steps.get(i);
            if (context.getCompletedSteps().contains(step.name())) {
                log.info("Compensating step: {}", step.name());
                try {
                    step.compensate().accept(context);
                } catch (Exception e) {
                    log.error("Compensation failed for step: {}", step.name(), e);
                    // Continue compensating other steps
                }
            }
        }

        return CompletableFuture.completedFuture(null);
    }
}

// Example usage
@Service
class Order${className}Saga {

    private final ${className}SagaOrchestrator orchestrator;

    public Order${className}Saga() {
        this.orchestrator = new ${className}SagaOrchestrator()
            .addStep("reserveInventory",
                ctx -> reserveInventory(ctx.get("orderId", String.class)),
                ctx -> releaseInventory(ctx.get("orderId", String.class)))
            .addStep("processPayment",
                ctx -> processPayment(ctx.get("orderId", String.class)),
                ctx -> refundPayment(ctx.get("orderId", String.class)))
            .addStep("shipOrder",
                ctx -> shipOrder(ctx.get("orderId", String.class)),
                ctx -> cancelShipment(ctx.get("orderId", String.class)));
    }

    public CompletableFuture<SagaContext> createOrder(String orderId) {
        SagaContext context = new SagaContext(UUID.randomUUID().toString());
        context.put("orderId", orderId);
        return orchestrator.execute(context);
    }

    private CompletableFuture<Void> reserveInventory(String orderId) {
        return CompletableFuture.completedFuture(null);
    }
    private void releaseInventory(String orderId) {}
    private CompletableFuture<Void> processPayment(String orderId) {
        return CompletableFuture.completedFuture(null);
    }
    private void refundPayment(String orderId) {}
    private CompletableFuture<Void> shipOrder(String orderId) {
        return CompletableFuture.completedFuture(null);
    }
    private void cancelShipment(String orderId) {}
}`,
      explanation: 'Saga orchestrator pattern for managing distributed transactions.',
      bestPractices: [
        'Always implement compensating transactions',
        'Log all saga steps for debugging',
        'Use idempotent operations'
      ],
      commonMistakes: [
        'Not handling compensation failures',
        'Missing idempotency'
      ],
      java21Tips: [
        'Use structured concurrency for step execution',
        'Virtual threads for parallel compensations'
      ]
    })
  }
};
