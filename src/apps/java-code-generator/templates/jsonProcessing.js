// JSON Processing Templates

export const jsonProcessingTemplates = {
  JACKSON_DTO: {
    name: 'Jackson DTO',
    description: 'DTO with Jackson annotations',
    generate: (className, packageName) => ({
      name: `${className} Jackson DTO`,
      fileName: `${className}DTO.java`,
      packagePath: `${packageName}.dto`,
      useCase: 'DTO with comprehensive Jackson annotations',
      code: `package ${packageName}.dto;

import com.fasterxml.jackson.annotation.*;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public record ${className}DTO(
        @JsonProperty("id")
        Long id,

        @JsonProperty(value = "name", required = true)
        String name,

        @JsonProperty("description")
        @JsonAlias({"desc", "summary"})
        String description,

        @JsonProperty("created_at")
        @JsonSerialize(using = LocalDateTimeSerializer.class)
        @JsonDeserialize(using = LocalDateTimeDeserializer.class)
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime createdAt,

        @JsonProperty("tags")
        List<String> tags,

        @JsonProperty("metadata")
        Map<String, Object> metadata,

        @JsonProperty("status")
        Status status
) {
    public ${className}DTO {
        tags = tags != null ? List.copyOf(tags) : List.of();
        metadata = metadata != null ? Map.copyOf(metadata) : Map.of();
    }

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    public enum Status {
        @JsonProperty("active") ACTIVE,
        @JsonProperty("inactive") INACTIVE,
        @JsonProperty("pending") PENDING
    }
}`,
      explanation: 'Record-based DTO with Jackson annotations for JSON serialization.',
      bestPractices: ['Use @JsonInclude for null handling', 'Use @JsonIgnoreProperties for forward compatibility'],
      commonMistakes: ['Mismatch between JSON names and fields', 'Not handling dates'],
      java21Tips: ['Records work seamlessly with Jackson']
    })
  },

  JSON_NODE: {
    name: 'JsonNode Parsing',
    description: 'Dynamic JSON parsing',
    generate: (className, packageName) => ({
      name: 'JsonNode Parser',
      fileName: 'JsonNodeParser.java',
      packagePath: `${packageName}.util`,
      useCase: 'Dynamic JSON parsing with path navigation',
      code: `package ${packageName}.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.util.List;
import java.util.stream.StreamSupport;

public class JsonNodeParser {

    private final ObjectMapper mapper = new ObjectMapper();

    public JsonNode parse(String json) throws JsonProcessingException {
        return mapper.readTree(json);
    }

    public String getString(JsonNode node, String path, String defaultValue) {
        JsonNode value = navigatePath(node, path);
        return value != null && value.isTextual() ? value.asText() : defaultValue;
    }

    public int getInt(JsonNode node, String path, int defaultValue) {
        JsonNode value = navigatePath(node, path);
        return value != null && value.isNumber() ? value.asInt() : defaultValue;
    }

    public List<String> getStringList(JsonNode node, String path) {
        JsonNode value = navigatePath(node, path);
        if (value == null || !value.isArray()) return List.of();
        return StreamSupport.stream(value.spliterator(), false)
                .filter(JsonNode::isTextual)
                .map(JsonNode::asText)
                .toList();
    }

    // Navigate dotted path like "user.address.city"
    public JsonNode navigatePath(JsonNode node, String path) {
        if (node == null || path == null) return null;
        String[] parts = path.split("\\\\.");
        JsonNode current = node;
        for (String part : parts) {
            if (current == null) return null;
            current = current.get(part);
        }
        return current;
    }

    public ObjectNode createObject() {
        return mapper.createObjectNode();
    }

    public <T> T toObject(JsonNode node, Class<T> type) throws JsonProcessingException {
        return mapper.treeToValue(node, type);
    }
}`,
      explanation: 'Utility class for parsing and navigating JSON dynamically.',
      bestPractices: ['Use JsonNode for unknown structures', 'Provide default values'],
      commonMistakes: ['Not handling null nodes', 'Assuming structure'],
      java21Tips: ['Use Stream API with spliterator for arrays']
    })
  },

  JSON_STREAMING: {
    name: 'JSON Streaming',
    description: 'Streaming large JSON files',
    generate: (className, packageName) => ({
      name: 'JSON Streaming',
      fileName: 'JsonStreamProcessor.java',
      packagePath: `${packageName}.util`,
      useCase: 'Streaming JSON processing for large files',
      code: `package ${packageName}.util;

import com.fasterxml.jackson.core.*;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.*;
import java.util.function.Consumer;

public class JsonStreamProcessor {

    private final ObjectMapper mapper = new ObjectMapper();
    private final JsonFactory factory = mapper.getFactory();

    public <T> void streamArray(InputStream input, Class<T> type, Consumer<T> consumer) throws IOException {
        try (JsonParser parser = factory.createParser(input)) {
            if (parser.nextToken() != JsonToken.START_ARRAY) {
                throw new IllegalStateException("Expected array start");
            }

            while (parser.nextToken() != JsonToken.END_ARRAY) {
                T item = mapper.readValue(parser, type);
                consumer.accept(item);
            }
        }
    }

    public <T> void writeArray(OutputStream output, Iterable<T> items) throws IOException {
        try (JsonGenerator generator = factory.createGenerator(output, JsonEncoding.UTF8)) {
            generator.writeStartArray();
            for (T item : items) {
                mapper.writeValue(generator, item);
            }
            generator.writeEndArray();
        }
    }

    public <T> void streamWithBatch(InputStream input, Class<T> type, int batchSize, Consumer<java.util.List<T>> batchConsumer) throws IOException {
        java.util.List<T> batch = new java.util.ArrayList<>(batchSize);

        try (JsonParser parser = factory.createParser(input)) {
            if (parser.nextToken() != JsonToken.START_ARRAY) {
                throw new IllegalStateException("Expected array start");
            }

            while (parser.nextToken() != JsonToken.END_ARRAY) {
                batch.add(mapper.readValue(parser, type));
                if (batch.size() >= batchSize) {
                    batchConsumer.accept(java.util.List.copyOf(batch));
                    batch.clear();
                }
            }

            if (!batch.isEmpty()) {
                batchConsumer.accept(java.util.List.copyOf(batch));
            }
        }
    }
}`,
      explanation: 'Utility for streaming JSON parsing for memory-efficient processing.',
      bestPractices: ['Use streaming for large files', 'Process in batches'],
      commonMistakes: ['Loading entire file into memory', 'Not closing resources'],
      java21Tips: ['Use virtual threads for parallel batch processing']
    })
  }
};
