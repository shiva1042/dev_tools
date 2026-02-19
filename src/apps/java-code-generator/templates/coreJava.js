// Core Java Templates - Comprehensive Java 21 Examples

export const coreJavaTemplates = {
  NESTED_LOOPS: {
    name: 'Nested Loops',
    description: 'Nested loop patterns with matrices and algorithms',
    generate: (className, packageName) => ({
      name: 'Nested Loop Patterns',
      fileName: 'NestedLoopExamples.java',
      packagePath: `${packageName}.util`,
      useCase: 'Nested loops for matrix operations, pattern printing, and algorithmic processing',
      code: `package ${packageName}.util;

import java.util.*;

/**
 * Nested Loop Patterns - Common use cases and optimizations
 */
public class NestedLoopExamples {

    // ============================================
    // MATRIX OPERATIONS
    // ============================================

    /**
     * Process a 2D matrix with row and column iteration
     */
    public void processMatrix(int[][] matrix) {
        int rows = matrix.length;
        int cols = matrix[0].length;

        for (int row = 0; row < rows; row++) {
            for (int col = 0; col < cols; col++) {
                int value = matrix[row][col];
                System.out.printf("matrix[%d][%d] = %d%n", row, col, value);
            }
        }
    }

    /**
     * Matrix multiplication - O(n³) complexity
     */
    public int[][] multiplyMatrices(int[][] a, int[][] b) {
        int rowsA = a.length;
        int colsA = a[0].length;
        int colsB = b[0].length;

        int[][] result = new int[rowsA][colsB];

        for (int i = 0; i < rowsA; i++) {
            for (int j = 0; j < colsB; j++) {
                int sum = 0;
                for (int k = 0; k < colsA; k++) {
                    sum += a[i][k] * b[k][j];
                }
                result[i][j] = sum;
            }
        }
        return result;
    }

    /**
     * Find element in sorted 2D matrix - optimized O(m+n)
     */
    public boolean searchSortedMatrix(int[][] matrix, int target) {
        if (matrix.length == 0) return false;

        int row = 0;
        int col = matrix[0].length - 1;

        while (row < matrix.length && col >= 0) {
            if (matrix[row][col] == target) {
                return true;
            } else if (matrix[row][col] > target) {
                col--;
            } else {
                row++;
            }
        }
        return false;
    }

    // ============================================
    // PATTERN PRINTING
    // ============================================

    /**
     * Print pyramid pattern
     * Example for n=4:
     *    *
     *   ***
     *  *****
     * *******
     */
    public void printPyramid(int n) {
        for (int i = 1; i <= n; i++) {
            // Print leading spaces
            for (int space = 1; space <= n - i; space++) {
                System.out.print(" ");
            }
            // Print stars
            for (int star = 1; star <= 2 * i - 1; star++) {
                System.out.print("*");
            }
            System.out.println();
        }
    }

    /**
     * Print multiplication table
     */
    public void printMultiplicationTable(int size) {
        for (int i = 1; i <= size; i++) {
            for (int j = 1; j <= size; j++) {
                System.out.printf("%4d", i * j);
            }
            System.out.println();
        }
    }

    // ============================================
    // ALGORITHMIC PATTERNS
    // ============================================

    /**
     * Find all pairs with given sum - O(n²)
     */
    public List<int[]> findPairsWithSum(int[] arr, int targetSum) {
        List<int[]> pairs = new ArrayList<>();

        for (int i = 0; i < arr.length - 1; i++) {
            for (int j = i + 1; j < arr.length; j++) {
                if (arr[i] + arr[j] == targetSum) {
                    pairs.add(new int[]{arr[i], arr[j]});
                }
            }
        }
        return pairs;
    }

    /**
     * Bubble sort with optimization - stops if already sorted
     */
    public void bubbleSort(int[] arr) {
        int n = arr.length;
        boolean swapped;

        for (int i = 0; i < n - 1; i++) {
            swapped = false;

            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    // Swap elements
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    swapped = true;
                }
            }

            // If no swapping occurred, array is sorted
            if (!swapped) break;
        }
    }

    /**
     * Process nested list structure
     */
    public void processNestedList(List<List<String>> nestedList) {
        for (int i = 0; i < nestedList.size(); i++) {
            List<String> innerList = nestedList.get(i);
            System.out.println("Group " + i + ":");

            for (int j = 0; j < innerList.size(); j++) {
                System.out.println("  [" + j + "] = " + innerList.get(j));
            }
        }
    }

    // ============================================
    // LOOP CONTROL PATTERNS
    // ============================================

    /**
     * Break out of nested loops using labeled break
     */
    public int[] findElement(int[][] matrix, int target) {
        int[] result = {-1, -1};

        outerLoop:
        for (int i = 0; i < matrix.length; i++) {
            for (int j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j] == target) {
                    result[0] = i;
                    result[1] = j;
                    break outerLoop; // Exit both loops
                }
            }
        }
        return result;
    }

    /**
     * Continue in nested loops
     */
    public void skipSpecificCombinations(int rows, int cols) {
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                // Skip when i equals j (diagonal)
                if (i == j) continue;

                System.out.printf("Processing [%d, %d]%n", i, j);
            }
        }
    }
}`,
      explanation: `This template demonstrates nested loop patterns commonly used in Java programming:

**Matrix Operations:**
- Basic 2D array traversal with row/column indexing
- Matrix multiplication using triple nested loops (O(n³) complexity)
- Optimized sorted matrix search using staircase approach (O(m+n))

**Pattern Printing:**
- Pyramid patterns using space and character printing
- Multiplication tables with formatted output

**Algorithmic Patterns:**
- Finding pairs with a target sum
- Bubble sort with early termination optimization
- Processing nested collections

**Loop Control:**
- Labeled break to exit multiple loop levels
- Strategic use of continue for skipping iterations

The examples show both basic patterns and performance-optimized approaches.`,
      bestPractices: [
        'Use labeled break/continue for complex nested loop control',
        'Consider time complexity - nested loops are often O(n²) or worse',
        'Extract inner loop body to methods for readability',
        'Use early termination conditions when possible',
        'Consider streams for simple nested iterations'
      ],
      commonMistakes: [
        'Off-by-one errors with loop bounds',
        'Modifying loop variables inside the loop body',
        'Not considering performance for large datasets',
        'Forgetting to handle empty arrays/lists',
        'Using wrong index variable (i vs j confusion)'
      ],
      java21Tips: [
        'Consider using Stream.flatMap() for nested collection processing',
        'Virtual threads can parallelize independent iterations',
        'Pattern matching can simplify conditional logic inside loops'
      ]
    })
  },

  NESTED_CONDITIONALS: {
    name: 'Nested Conditionals',
    description: 'Complex conditional logic and pattern matching',
    generate: (className, packageName) => ({
      name: 'Nested Conditional Patterns',
      fileName: 'ConditionalExamples.java',
      packagePath: `${packageName}.util`,
      useCase: 'Complex conditional logic, validation chains, and Java 21 pattern matching',
      code: `package ${packageName}.util;

import java.time.*;
import java.util.*;

/**
 * Nested Conditionals and Pattern Matching in Java 21
 */
public class ConditionalExamples {

    // ============================================
    // TRADITIONAL NESTED IF-ELSE
    // ============================================

    /**
     * Complex validation with nested conditions
     */
    public ValidationResult validateUser(User user) {
        if (user == null) {
            return new ValidationResult(false, "User cannot be null");
        }

        if (user.name() == null || user.name().isBlank()) {
            return new ValidationResult(false, "Name is required");
        } else {
            if (user.name().length() < 2) {
                return new ValidationResult(false, "Name must be at least 2 characters");
            } else if (user.name().length() > 100) {
                return new ValidationResult(false, "Name cannot exceed 100 characters");
            }
        }

        if (user.email() == null || user.email().isBlank()) {
            return new ValidationResult(false, "Email is required");
        } else {
            if (!user.email().contains("@")) {
                return new ValidationResult(false, "Invalid email format");
            } else {
                String domain = user.email().substring(user.email().indexOf("@") + 1);
                if (domain.isBlank() || !domain.contains(".")) {
                    return new ValidationResult(false, "Invalid email domain");
                }
            }
        }

        if (user.age() != null) {
            if (user.age() < 0) {
                return new ValidationResult(false, "Age cannot be negative");
            } else if (user.age() < 13) {
                return new ValidationResult(false, "User must be at least 13 years old");
            } else if (user.age() > 150) {
                return new ValidationResult(false, "Invalid age value");
            }
        }

        return new ValidationResult(true, "Validation passed");
    }

    // ============================================
    // GUARD CLAUSES (BETTER APPROACH)
    // ============================================

    /**
     * Same validation using guard clauses - cleaner code
     */
    public ValidationResult validateUserWithGuards(User user) {
        // Guard clauses - fail fast
        if (user == null)
            return invalid("User cannot be null");

        if (user.name() == null || user.name().isBlank())
            return invalid("Name is required");

        if (user.name().length() < 2)
            return invalid("Name must be at least 2 characters");

        if (user.name().length() > 100)
            return invalid("Name cannot exceed 100 characters");

        if (user.email() == null || user.email().isBlank())
            return invalid("Email is required");

        if (!isValidEmail(user.email()))
            return invalid("Invalid email format");

        if (user.age() != null && (user.age() < 13 || user.age() > 150))
            return invalid("Age must be between 13 and 150");

        return new ValidationResult(true, "Validation passed");
    }

    private ValidationResult invalid(String message) {
        return new ValidationResult(false, message);
    }

    private boolean isValidEmail(String email) {
        return email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\\\.[A-Za-z]{2,}$");
    }

    // ============================================
    // JAVA 21 PATTERN MATCHING WITH SWITCH
    // ============================================

    /**
     * Pattern matching for type checks - Java 21
     */
    public String describeShape(Shape shape) {
        return switch (shape) {
            case Circle c when c.radius() > 100 -> "Large circle with radius " + c.radius();
            case Circle c -> "Circle with radius " + c.radius();
            case Rectangle r when r.width() == r.height() -> "Square with side " + r.width();
            case Rectangle r -> "Rectangle " + r.width() + "x" + r.height();
            case Triangle t -> "Triangle with base " + t.base();
            case null -> "No shape provided";
        };
    }

    /**
     * Record pattern matching - Java 21
     */
    public double calculateArea(Shape shape) {
        return switch (shape) {
            case Circle(double radius) -> Math.PI * radius * radius;
            case Rectangle(double width, double height) -> width * height;
            case Triangle(double base, double height) -> 0.5 * base * height;
            case null -> 0.0;
        };
    }

    /**
     * Nested record patterns - Java 21
     */
    public String describeOrder(Order order) {
        return switch (order) {
            case Order(Customer(String name, _), List<Item> items, _)
                when items.isEmpty() -> name + " has an empty order";

            case Order(Customer(String name, Address(_, String city, _)), List<Item> items, Status.SHIPPED)
                -> name + " from " + city + " - " + items.size() + " items shipped";

            case Order(Customer(String name, _), List<Item> items, Status.PENDING)
                -> name + " has " + items.size() + " pending items";

            case Order(_, _, Status.CANCELLED)
                -> "Cancelled order";

            default -> "Unknown order status";
        };
    }

    // ============================================
    // BUSINESS LOGIC WITH CONDITIONS
    // ============================================

    /**
     * Complex pricing logic with multiple factors
     */
    public PricingResult calculatePrice(Order order, Customer customer) {
        double basePrice = order.items().stream()
                .mapToDouble(Item::price)
                .sum();

        double discount = 0.0;
        String discountReason = "No discount";

        // Loyalty discount
        if (customer.loyaltyYears() >= 5) {
            if (customer.loyaltyYears() >= 10) {
                discount = 0.20; // 20% for 10+ years
                discountReason = "Platinum loyalty discount";
            } else {
                discount = 0.10; // 10% for 5-9 years
                discountReason = "Gold loyalty discount";
            }
        } else if (customer.loyaltyYears() >= 2) {
            discount = 0.05; // 5% for 2-4 years
            discountReason = "Silver loyalty discount";
        }

        // Bulk discount (stacks with loyalty)
        if (order.items().size() >= 10) {
            if (order.items().size() >= 50) {
                discount += 0.15;
                discountReason += " + Bulk (50+)";
            } else if (order.items().size() >= 20) {
                discount += 0.10;
                discountReason += " + Bulk (20+)";
            } else {
                discount += 0.05;
                discountReason += " + Bulk (10+)";
            }
        }

        // Seasonal discount
        Month currentMonth = LocalDate.now().getMonth();
        if (currentMonth == Month.NOVEMBER || currentMonth == Month.DECEMBER) {
            if (basePrice >= 500) {
                discount += 0.10;
                discountReason += " + Holiday special";
            }
        }

        // Cap discount at 40%
        discount = Math.min(discount, 0.40);

        double finalPrice = basePrice * (1 - discount);
        return new PricingResult(basePrice, discount, finalPrice, discountReason);
    }

    // ============================================
    // RECORDS AND SEALED TYPES
    // ============================================

    public record User(String name, String email, Integer age) {}
    public record ValidationResult(boolean valid, String message) {}
    public record PricingResult(double basePrice, double discount, double finalPrice, String reason) {}

    public sealed interface Shape permits Circle, Rectangle, Triangle {}
    public record Circle(double radius) implements Shape {}
    public record Rectangle(double width, double height) implements Shape {}
    public record Triangle(double base, double height) implements Shape {}

    public record Customer(String name, Address address, int loyaltyYears) {}
    public record Address(String street, String city, String zipCode) {}
    public record Item(String name, double price) {}
    public record Order(Customer customer, List<Item> items, Status status) {}
    public enum Status { PENDING, SHIPPED, DELIVERED, CANCELLED }
}`,
      explanation: `This template covers conditional logic patterns from basic to advanced:

**Traditional Nested If-Else:**
- Complex validation with multiple levels of nesting
- Shows the "pyramid of doom" anti-pattern for comparison

**Guard Clauses (Recommended):**
- Early return pattern that flattens nested conditions
- Improves readability by handling edge cases first
- Each validation is independent and clear

**Java 21 Pattern Matching:**
- Switch expressions with pattern matching for types
- Guarded patterns using 'when' clause
- Record patterns for destructuring data
- Nested record patterns for complex structures

**Business Logic:**
- Real-world pricing calculation with multiple discount factors
- Demonstrates how conditions can stack and combine
- Shows proper use of early returns and discount capping

Pattern matching in Java 21 eliminates many instanceof checks and casts, making code more concise and type-safe.`,
      bestPractices: [
        'Use guard clauses to avoid deep nesting',
        'Prefer switch expressions with pattern matching over if-else chains',
        'Extract complex conditions into well-named methods',
        'Use sealed types with pattern matching for exhaustive handling',
        'Consider using Optional instead of null checks'
      ],
      commonMistakes: [
        'Deep nesting making code hard to follow',
        'Duplicating conditions in if and else branches',
        'Not handling all cases in switch expressions',
        'Forgetting null checks before dereferencing',
        'Complex boolean expressions without extraction'
      ],
      java21Tips: [
        'Pattern matching in switch is fully stable in Java 21',
        'Use record patterns to destructure in one step',
        'Sealed types + pattern matching = exhaustive checking',
        'Guarded patterns (when clause) replace nested if inside case'
      ]
    })
  },

  JSON_PROCESSING: {
    name: 'JSON Processing',
    description: 'Jackson JSON parsing and manipulation',
    generate: (className, packageName) => ({
      name: 'JSON Processing Patterns',
      fileName: 'JsonProcessor.java',
      packagePath: `${packageName}.util`,
      useCase: 'Comprehensive JSON parsing, transformation, and manipulation with Jackson',
      code: `package ${packageName}.util;

import com.fasterxml.jackson.annotation.*;
import com.fasterxml.jackson.core.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.io.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.*;

/**
 * Comprehensive JSON Processing with Jackson
 */
public class JsonProcessor {

    private final ObjectMapper objectMapper;

    public JsonProcessor() {
        this.objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
            .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
            .configure(SerializationFeature.INDENT_OUTPUT, true);
    }

    // ============================================
    // BASIC SERIALIZATION / DESERIALIZATION
    // ============================================

    /**
     * Serialize object to JSON string
     */
    public String toJson(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            throw new JsonException("Failed to serialize to JSON", e);
        }
    }

    /**
     * Deserialize JSON string to object
     */
    public <T> T fromJson(String json, Class<T> clazz) {
        try {
            return objectMapper.readValue(json, clazz);
        } catch (JsonProcessingException e) {
            throw new JsonException("Failed to deserialize JSON", e);
        }
    }

    /**
     * Deserialize JSON to generic types (List, Map, etc.)
     */
    public <T> T fromJson(String json, TypeReference<T> typeRef) {
        try {
            return objectMapper.readValue(json, typeRef);
        } catch (JsonProcessingException e) {
            throw new JsonException("Failed to deserialize JSON", e);
        }
    }

    // ============================================
    // JSONNODE MANIPULATION
    // ============================================

    /**
     * Parse JSON string to JsonNode for dynamic access
     */
    public JsonNode parseJson(String json) {
        try {
            return objectMapper.readTree(json);
        } catch (JsonProcessingException e) {
            throw new JsonException("Failed to parse JSON", e);
        }
    }

    /**
     * Navigate nested JSON structure safely
     */
    public Optional<String> extractNestedValue(String json, String... path) {
        JsonNode node = parseJson(json);

        for (String key : path) {
            if (node == null || node.isMissingNode()) {
                return Optional.empty();
            }

            if (key.matches("\\\\d+")) {
                // Array index
                node = node.get(Integer.parseInt(key));
            } else {
                // Object field
                node = node.get(key);
            }
        }

        return node != null && !node.isMissingNode() && !node.isNull()
            ? Optional.of(node.asText())
            : Optional.empty();
    }

    /**
     * Extract multiple values from JSON array
     */
    public List<String> extractArrayValues(String json, String arrayPath, String fieldName) {
        JsonNode root = parseJson(json);
        JsonNode arrayNode = root.at("/" + arrayPath.replace(".", "/"));

        if (!arrayNode.isArray()) {
            return List.of();
        }

        List<String> values = new ArrayList<>();
        for (JsonNode element : arrayNode) {
            JsonNode fieldNode = element.get(fieldName);
            if (fieldNode != null && !fieldNode.isNull()) {
                values.add(fieldNode.asText());
            }
        }
        return values;
    }

    // ============================================
    // JSON TRANSFORMATION
    // ============================================

    /**
     * Transform JSON structure - flatten nested objects
     */
    public Map<String, Object> flattenJson(String json) {
        JsonNode root = parseJson(json);
        Map<String, Object> result = new LinkedHashMap<>();
        flattenNode("", root, result);
        return result;
    }

    private void flattenNode(String prefix, JsonNode node, Map<String, Object> result) {
        if (node.isObject()) {
            Iterator<Map.Entry<String, JsonNode>> fields = node.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> entry = fields.next();
                String newPrefix = prefix.isEmpty() ? entry.getKey() : prefix + "." + entry.getKey();
                flattenNode(newPrefix, entry.getValue(), result);
            }
        } else if (node.isArray()) {
            for (int i = 0; i < node.size(); i++) {
                flattenNode(prefix + "[" + i + "]", node.get(i), result);
            }
        } else {
            result.put(prefix, extractValue(node));
        }
    }

    private Object extractValue(JsonNode node) {
        if (node.isNull()) return null;
        if (node.isBoolean()) return node.booleanValue();
        if (node.isInt()) return node.intValue();
        if (node.isLong()) return node.longValue();
        if (node.isDouble()) return node.doubleValue();
        return node.asText();
    }

    /**
     * Merge two JSON objects
     */
    public String mergeJson(String json1, String json2) {
        ObjectNode node1 = (ObjectNode) parseJson(json1);
        JsonNode node2 = parseJson(json2);

        // Deep merge
        mergeNodes(node1, node2);

        return toJson(node1);
    }

    private void mergeNodes(ObjectNode target, JsonNode source) {
        Iterator<Map.Entry<String, JsonNode>> fields = source.fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> entry = fields.next();
            String fieldName = entry.getKey();
            JsonNode sourceValue = entry.getValue();
            JsonNode targetValue = target.get(fieldName);

            if (targetValue != null && targetValue.isObject() && sourceValue.isObject()) {
                mergeNodes((ObjectNode) targetValue, sourceValue);
            } else {
                target.set(fieldName, sourceValue);
            }
        }
    }

    /**
     * Build JSON programmatically
     */
    public String buildJson() {
        ObjectNode root = objectMapper.createObjectNode();

        root.put("id", 1);
        root.put("name", "Example");
        root.put("active", true);
        root.put("score", 95.5);

        ArrayNode tags = root.putArray("tags");
        tags.add("java");
        tags.add("json");
        tags.add("jackson");

        ObjectNode metadata = root.putObject("metadata");
        metadata.put("createdAt", LocalDateTime.now().toString());
        metadata.put("version", "1.0");

        ArrayNode items = root.putArray("items");
        for (int i = 0; i < 3; i++) {
            ObjectNode item = items.addObject();
            item.put("index", i);
            item.put("value", "item-" + i);
        }

        return toJson(root);
    }

    // ============================================
    // JSON VALIDATION & COMPARISON
    // ============================================

    /**
     * Validate JSON string
     */
    public boolean isValidJson(String json) {
        try {
            objectMapper.readTree(json);
            return true;
        } catch (JsonProcessingException e) {
            return false;
        }
    }

    /**
     * Compare two JSON strings for equality (ignoring formatting)
     */
    public boolean jsonEquals(String json1, String json2) {
        try {
            JsonNode node1 = objectMapper.readTree(json1);
            JsonNode node2 = objectMapper.readTree(json2);
            return node1.equals(node2);
        } catch (JsonProcessingException e) {
            return false;
        }
    }

    /**
     * Find differences between two JSON objects
     */
    public List<String> findJsonDifferences(String json1, String json2) {
        List<String> differences = new ArrayList<>();
        JsonNode node1 = parseJson(json1);
        JsonNode node2 = parseJson(json2);
        compareNodes("", node1, node2, differences);
        return differences;
    }

    private void compareNodes(String path, JsonNode node1, JsonNode node2, List<String> diffs) {
        if (node1.equals(node2)) return;

        if (node1.getNodeType() != node2.getNodeType()) {
            diffs.add(path + ": type mismatch " + node1.getNodeType() + " vs " + node2.getNodeType());
            return;
        }

        if (node1.isObject()) {
            Set<String> allKeys = new HashSet<>();
            node1.fieldNames().forEachRemaining(allKeys::add);
            node2.fieldNames().forEachRemaining(allKeys::add);

            for (String key : allKeys) {
                String childPath = path.isEmpty() ? key : path + "." + key;
                if (!node1.has(key)) {
                    diffs.add(childPath + ": added in second");
                } else if (!node2.has(key)) {
                    diffs.add(childPath + ": removed in second");
                } else {
                    compareNodes(childPath, node1.get(key), node2.get(key), diffs);
                }
            }
        } else if (node1.isArray()) {
            if (node1.size() != node2.size()) {
                diffs.add(path + ": array size " + node1.size() + " vs " + node2.size());
            }
            int minSize = Math.min(node1.size(), node2.size());
            for (int i = 0; i < minSize; i++) {
                compareNodes(path + "[" + i + "]", node1.get(i), node2.get(i), diffs);
            }
        } else {
            diffs.add(path + ": " + node1.asText() + " vs " + node2.asText());
        }
    }

    // ============================================
    // EXCEPTION HANDLING
    // ============================================

    public static class JsonException extends RuntimeException {
        public JsonException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    // ============================================
    // EXAMPLE DTOs
    // ============================================

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ApiResponse<T>(
        @JsonProperty("success") boolean success,
        @JsonProperty("data") T data,
        @JsonProperty("error") String error,
        @JsonProperty("timestamp") LocalDateTime timestamp
    ) {}

    public record User(
        @JsonProperty("id") Long id,
        @JsonProperty("name") String name,
        @JsonProperty("email") String email,
        @JsonProperty("roles") List<String> roles
    ) {}
}`,
      explanation: `This template provides comprehensive JSON processing capabilities using Jackson:

**Basic Operations:**
- Object to JSON serialization with proper configuration
- JSON to object deserialization with type safety
- Generic type handling using TypeReference for Lists and Maps

**JsonNode Manipulation:**
- Parse JSON to tree structure for dynamic access
- Navigate nested structures safely using paths
- Extract values from arrays with field selection

**JSON Transformation:**
- Flatten nested JSON into dot-notation keys
- Deep merge two JSON objects
- Programmatic JSON building with ObjectNode/ArrayNode

**Validation & Comparison:**
- Validate JSON string syntax
- Compare JSON documents ignoring formatting
- Find specific differences between two JSON structures

**Best Practices Demonstrated:**
- ObjectMapper configuration for dates and unknown properties
- Exception wrapping for cleaner error handling
- Use of records for DTOs with Jackson annotations

The template uses Jackson's powerful tree model (JsonNode) alongside data binding for flexible JSON handling.`,
      bestPractices: [
        'Configure ObjectMapper once and reuse it (thread-safe)',
        'Register JavaTimeModule for Java 8+ date/time types',
        'Use FAIL_ON_UNKNOWN_PROPERTIES = false for forward compatibility',
        'Use TypeReference for generic types like List<T>',
        'Wrap Jackson exceptions in domain-specific exceptions'
      ],
      commonMistakes: [
        'Creating new ObjectMapper for each operation (expensive)',
        'Not handling JsonProcessingException properly',
        'Forgetting to register JavaTimeModule',
        'Using JsonNode when data binding would be simpler',
        'Not considering null values in JSON'
      ],
      java21Tips: [
        'Records work seamlessly with Jackson for DTOs',
        'Use sealed interfaces for polymorphic JSON',
        'Pattern matching can simplify JsonNode type checks'
      ]
    })
  },

  ES_RESPONSE_PROCESSING: {
    name: 'ES Response Processing',
    description: 'Elasticsearch response parsing and transformation',
    generate: (className, packageName) => ({
      name: 'Elasticsearch Response Processor',
      fileName: 'ElasticsearchResponseProcessor.java',
      packagePath: `${packageName}.util`,
      useCase: 'Parse and transform Elasticsearch search responses, aggregations, and hits',
      code: `package ${packageName}.util;

import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import com.fasterxml.jackson.core.type.TypeReference;

import java.util.*;
import java.util.stream.*;

/**
 * Elasticsearch Response Processing Utilities
 * Works with both raw JSON responses and typed responses
 */
public class ElasticsearchResponseProcessor {

    private final ObjectMapper objectMapper;

    public ElasticsearchResponseProcessor() {
        this.objectMapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    // ============================================
    // SEARCH RESPONSE PROCESSING
    // ============================================

    /**
     * Parse search response and extract hits
     */
    public <T> SearchResult<T> parseSearchResponse(String jsonResponse, Class<T> hitClass) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);

            // Extract metadata
            long took = root.path("took").asLong(0);
            boolean timedOut = root.path("timed_out").asBoolean(false);

            // Extract total hits
            JsonNode hitsNode = root.path("hits");
            JsonNode totalNode = hitsNode.path("total");
            long totalHits = totalNode.isObject()
                ? totalNode.path("value").asLong(0)
                : totalNode.asLong(0);

            String relation = totalNode.path("relation").asText("eq");

            // Extract max score
            Double maxScore = hitsNode.path("max_score").isNull()
                ? null
                : hitsNode.path("max_score").asDouble();

            // Extract hits array
            List<Hit<T>> hits = new ArrayList<>();
            JsonNode hitsArray = hitsNode.path("hits");

            for (JsonNode hitNode : hitsArray) {
                Hit<T> hit = parseHit(hitNode, hitClass);
                hits.add(hit);
            }

            return new SearchResult<>(took, timedOut, totalHits, relation, maxScore, hits);

        } catch (Exception e) {
            throw new EsProcessingException("Failed to parse search response", e);
        }
    }

    /**
     * Parse individual hit with source, score, and highlights
     */
    private <T> Hit<T> parseHit(JsonNode hitNode, Class<T> sourceClass) throws Exception {
        String index = hitNode.path("_index").asText();
        String id = hitNode.path("_id").asText();
        Double score = hitNode.path("_score").isNull() ? null : hitNode.path("_score").asDouble();

        // Parse source document
        JsonNode sourceNode = hitNode.path("_source");
        T source = objectMapper.treeToValue(sourceNode, sourceClass);

        // Parse highlights if present
        Map<String, List<String>> highlights = new HashMap<>();
        JsonNode highlightNode = hitNode.path("highlight");
        if (!highlightNode.isMissingNode()) {
            Iterator<Map.Entry<String, JsonNode>> fields = highlightNode.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> entry = fields.next();
                List<String> fragments = new ArrayList<>();
                for (JsonNode fragment : entry.getValue()) {
                    fragments.add(fragment.asText());
                }
                highlights.put(entry.getKey(), fragments);
            }
        }

        // Parse sort values if present
        List<Object> sortValues = new ArrayList<>();
        JsonNode sortNode = hitNode.path("sort");
        if (sortNode.isArray()) {
            for (JsonNode sortValue : sortNode) {
                sortValues.add(extractSortValue(sortValue));
            }
        }

        return new Hit<>(index, id, score, source, highlights, sortValues);
    }

    private Object extractSortValue(JsonNode node) {
        if (node.isNull()) return null;
        if (node.isNumber()) return node.numberValue();
        if (node.isBoolean()) return node.booleanValue();
        return node.asText();
    }

    // ============================================
    // AGGREGATION PROCESSING
    // ============================================

    /**
     * Parse aggregations from response
     */
    public Map<String, AggregationResult> parseAggregations(String jsonResponse) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode aggsNode = root.path("aggregations");

            if (aggsNode.isMissingNode()) {
                return Map.of();
            }

            Map<String, AggregationResult> results = new LinkedHashMap<>();
            Iterator<Map.Entry<String, JsonNode>> fields = aggsNode.fields();

            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> entry = fields.next();
                results.put(entry.getKey(), parseAggregation(entry.getValue()));
            }

            return results;

        } catch (Exception e) {
            throw new EsProcessingException("Failed to parse aggregations", e);
        }
    }

    private AggregationResult parseAggregation(JsonNode aggNode) {
        // Terms aggregation (has buckets)
        if (aggNode.has("buckets")) {
            List<Bucket> buckets = new ArrayList<>();
            JsonNode bucketsNode = aggNode.path("buckets");

            // Handle both array and object bucket formats
            if (bucketsNode.isArray()) {
                for (JsonNode bucketNode : bucketsNode) {
                    buckets.add(parseBucket(bucketNode));
                }
            } else if (bucketsNode.isObject()) {
                Iterator<Map.Entry<String, JsonNode>> fields = bucketsNode.fields();
                while (fields.hasNext()) {
                    Map.Entry<String, JsonNode> entry = fields.next();
                    Bucket bucket = parseBucket(entry.getValue());
                    buckets.add(new Bucket(entry.getKey(), bucket.docCount(), bucket.subAggregations()));
                }
            }

            return new BucketAggregation(buckets);
        }

        // Metric aggregation (has value)
        if (aggNode.has("value")) {
            return new MetricAggregation(aggNode.path("value").asDouble());
        }

        // Stats aggregation
        if (aggNode.has("count") && aggNode.has("min") && aggNode.has("max")) {
            return new StatsAggregation(
                aggNode.path("count").asLong(),
                aggNode.path("min").asDouble(),
                aggNode.path("max").asDouble(),
                aggNode.path("avg").asDouble(),
                aggNode.path("sum").asDouble()
            );
        }

        return new UnknownAggregation(aggNode.toString());
    }

    private Bucket parseBucket(JsonNode bucketNode) {
        String key = bucketNode.path("key_as_string").isMissingNode()
            ? bucketNode.path("key").asText()
            : bucketNode.path("key_as_string").asText();

        long docCount = bucketNode.path("doc_count").asLong();

        // Parse sub-aggregations
        Map<String, AggregationResult> subAggs = new LinkedHashMap<>();
        Iterator<Map.Entry<String, JsonNode>> fields = bucketNode.fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> entry = fields.next();
            String fieldName = entry.getKey();
            if (!fieldName.equals("key") && !fieldName.equals("key_as_string")
                && !fieldName.equals("doc_count") && !fieldName.equals("doc_count_error_upper_bound")
                && !fieldName.equals("sum_other_doc_count")) {
                subAggs.put(fieldName, parseAggregation(entry.getValue()));
            }
        }

        return new Bucket(key, docCount, subAggs);
    }

    // ============================================
    // CONVENIENCE METHODS
    // ============================================

    /**
     * Extract just the source documents from response
     */
    public <T> List<T> extractDocuments(String jsonResponse, Class<T> docClass) {
        SearchResult<T> result = parseSearchResponse(jsonResponse, docClass);
        return result.hits().stream()
            .map(Hit::source)
            .collect(Collectors.toList());
    }

    /**
     * Extract terms aggregation as Map<key, count>
     */
    public Map<String, Long> extractTermsAggregation(String jsonResponse, String aggName) {
        Map<String, AggregationResult> aggs = parseAggregations(jsonResponse);
        AggregationResult agg = aggs.get(aggName);

        if (agg instanceof BucketAggregation bucketAgg) {
            return bucketAgg.buckets().stream()
                .collect(Collectors.toMap(
                    Bucket::key,
                    Bucket::docCount,
                    (a, b) -> a,
                    LinkedHashMap::new
                ));
        }
        return Map.of();
    }

    /**
     * Get scroll ID for pagination
     */
    public Optional<String> extractScrollId(String jsonResponse) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode scrollId = root.path("_scroll_id");
            return scrollId.isMissingNode() ? Optional.empty() : Optional.of(scrollId.asText());
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    // ============================================
    // RESULT TYPES
    // ============================================

    public record SearchResult<T>(
        long took,
        boolean timedOut,
        long totalHits,
        String totalRelation,
        Double maxScore,
        List<Hit<T>> hits
    ) {
        public boolean hasHits() { return !hits.isEmpty(); }
        public int hitCount() { return hits.size(); }
    }

    public record Hit<T>(
        String index,
        String id,
        Double score,
        T source,
        Map<String, List<String>> highlights,
        List<Object> sortValues
    ) {
        public Optional<List<String>> getHighlight(String field) {
            return Optional.ofNullable(highlights.get(field));
        }
    }

    public sealed interface AggregationResult permits
        BucketAggregation, MetricAggregation, StatsAggregation, UnknownAggregation {}

    public record BucketAggregation(List<Bucket> buckets) implements AggregationResult {}
    public record MetricAggregation(double value) implements AggregationResult {}
    public record StatsAggregation(long count, double min, double max, double avg, double sum)
        implements AggregationResult {}
    public record UnknownAggregation(String raw) implements AggregationResult {}

    public record Bucket(String key, long docCount, Map<String, AggregationResult> subAggregations) {
        public Optional<AggregationResult> getSubAggregation(String name) {
            return Optional.ofNullable(subAggregations.get(name));
        }
    }

    public static class EsProcessingException extends RuntimeException {
        public EsProcessingException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}`,
      explanation: `This template handles Elasticsearch response parsing for common use cases:

**Search Response Processing:**
- Parses the full search response structure (took, timed_out, hits)
- Handles both old-style and new-style total hits format
- Extracts source documents with type-safe deserialization
- Parses highlight fragments for each field
- Extracts sort values for search_after pagination

**Aggregation Processing:**
- Parses terms/histogram aggregations with buckets
- Handles metric aggregations (avg, sum, etc.)
- Parses stats aggregations (min, max, avg, count, sum)
- Supports nested sub-aggregations within buckets
- Handles both array and object bucket formats

**Convenience Methods:**
- Extract just documents without metadata
- Convert terms aggregation to simple Map<String, Long>
- Extract scroll ID for scroll API pagination

**Type Safety:**
- Uses sealed interfaces for aggregation result types
- Pattern matching can exhaustively handle all result types
- Generic Hit<T> preserves source document type

The processor works with raw JSON strings, making it compatible with any HTTP client.`,
      bestPractices: [
        'Reuse ObjectMapper instance across calls',
        'Handle missing nodes gracefully with path()',
        'Use records for immutable result types',
        'Provide convenience methods for common extractions',
        'Use sealed interfaces for type-safe result handling'
      ],
      commonMistakes: [
        'Not handling both total hits formats (object vs number)',
        'Forgetting null checks for optional fields like score',
        'Not handling bucket format variations (array vs object)',
        'Ignoring sub-aggregations in bucket processing',
        'Not extracting sort values needed for search_after'
      ],
      java21Tips: [
        'Sealed interfaces enable exhaustive pattern matching',
        'Records are ideal for immutable response DTOs',
        'Pattern matching simplifies aggregation type handling',
        'Use pattern matching in switch for AggregationResult types'
      ]
    })
  },

  STREAM_API: {
    name: 'Stream API Advanced',
    description: 'Advanced Stream operations and collectors',
    generate: (className, packageName) => ({
      name: 'Advanced Stream Patterns',
      fileName: 'StreamPatterns.java',
      packagePath: `${packageName}.util`,
      useCase: 'Advanced Stream API operations including custom collectors and parallel processing',
      code: `package ${packageName}.util;

import java.util.*;
import java.util.concurrent.*;
import java.util.function.*;
import java.util.stream.*;

/**
 * Advanced Stream API Patterns in Java 21
 */
public class StreamPatterns {

    // ============================================
    // GROUPING AND PARTITIONING
    // ============================================

    public record Person(String name, String department, int age, double salary) {}

    /**
     * Multi-level grouping
     */
    public Map<String, Map<String, List<Person>>> groupByDepartmentAndAgeGroup(List<Person> people) {
        return people.stream()
            .collect(Collectors.groupingBy(
                Person::department,
                Collectors.groupingBy(p -> p.age() < 30 ? "Junior" : p.age() < 50 ? "Senior" : "Expert")
            ));
    }

    /**
     * Grouping with downstream aggregation
     */
    public Map<String, DoubleSummaryStatistics> salaryStatsByDepartment(List<Person> people) {
        return people.stream()
            .collect(Collectors.groupingBy(
                Person::department,
                Collectors.summarizingDouble(Person::salary)
            ));
    }

    /**
     * Partitioning with downstream collection
     */
    public Map<Boolean, Long> countByAgeThreshold(List<Person> people, int threshold) {
        return people.stream()
            .collect(Collectors.partitioningBy(
                p -> p.age() >= threshold,
                Collectors.counting()
            ));
    }

    // ============================================
    // CUSTOM COLLECTORS
    // ============================================

    /**
     * Collect to comma-separated string with limit
     */
    public String joinNames(List<Person> people, int limit) {
        return people.stream()
            .map(Person::name)
            .limit(limit)
            .collect(Collectors.joining(", ", "Names: [", "]"));
    }

    /**
     * Collect to immutable sorted set
     */
    public Set<String> uniqueDepartmentsSorted(List<Person> people) {
        return people.stream()
            .map(Person::department)
            .collect(Collectors.toCollection(TreeSet::new));
    }

    /**
     * Teeing collector - compute two results at once
     */
    public record SalaryRange(double min, double max) {}

    public SalaryRange getSalaryRange(List<Person> people) {
        return people.stream()
            .map(Person::salary)
            .collect(Collectors.teeing(
                Collectors.minBy(Double::compare),
                Collectors.maxBy(Double::compare),
                (min, max) -> new SalaryRange(
                    min.orElse(0.0),
                    max.orElse(0.0)
                )
            ));
    }

    // ============================================
    // FLATMAP AND MAPMULTI
    // ============================================

    public record Order(String id, List<LineItem> items) {}
    public record LineItem(String product, int quantity, double price) {}

    /**
     * FlatMap to process nested collections
     */
    public List<String> allProductNames(List<Order> orders) {
        return orders.stream()
            .flatMap(order -> order.items().stream())
            .map(LineItem::product)
            .distinct()
            .sorted()
            .toList();
    }

    /**
     * MapMulti for conditional expansion (Java 16+)
     */
    public List<String> expandItems(List<Order> orders) {
        return orders.stream()
            .<String>mapMulti((order, consumer) -> {
                for (LineItem item : order.items()) {
                    // Emit product name 'quantity' times
                    for (int i = 0; i < item.quantity(); i++) {
                        consumer.accept(item.product());
                    }
                }
            })
            .toList();
    }

    /**
     * MapMulti with filtering
     */
    public List<LineItem> highValueItems(List<Order> orders, double minValue) {
        return orders.stream()
            .<LineItem>mapMulti((order, consumer) -> {
                for (LineItem item : order.items()) {
                    double value = item.quantity() * item.price();
                    if (value >= minValue) {
                        consumer.accept(item);
                    }
                }
            })
            .toList();
    }

    // ============================================
    // REDUCE OPERATIONS
    // ============================================

    /**
     * Complex reduce with combiner
     */
    public record OrderSummary(int totalItems, double totalValue, int orderCount) {
        public OrderSummary add(OrderSummary other) {
            return new OrderSummary(
                this.totalItems + other.totalItems,
                this.totalValue + other.totalValue,
                this.orderCount + other.orderCount
            );
        }
    }

    public OrderSummary summarizeOrders(List<Order> orders) {
        return orders.stream()
            .map(order -> {
                int items = order.items().stream().mapToInt(LineItem::quantity).sum();
                double value = order.items().stream()
                    .mapToDouble(li -> li.quantity() * li.price())
                    .sum();
                return new OrderSummary(items, value, 1);
            })
            .reduce(
                new OrderSummary(0, 0.0, 0),
                OrderSummary::add
            );
    }

    // ============================================
    // PARALLEL STREAM PATTERNS
    // ============================================

    /**
     * Parallel processing with custom fork-join pool
     */
    public List<String> processInParallel(List<String> items, int parallelism) {
        ForkJoinPool customPool = new ForkJoinPool(parallelism);
        try {
            return customPool.submit(() ->
                items.parallelStream()
                    .map(this::expensiveOperation)
                    .toList()
            ).get();
        } catch (Exception e) {
            throw new RuntimeException("Parallel processing failed", e);
        } finally {
            customPool.shutdown();
        }
    }

    private String expensiveOperation(String input) {
        // Simulate CPU-intensive work
        return input.toUpperCase();
    }

    /**
     * Parallel stream with thread-safe collection
     */
    public Map<String, Long> parallelWordCount(List<String> texts) {
        return texts.parallelStream()
            .flatMap(text -> Arrays.stream(text.split("\\\\s+")))
            .map(String::toLowerCase)
            .collect(Collectors.groupingByConcurrent(
                Function.identity(),
                Collectors.counting()
            ));
    }

    // ============================================
    // STREAM UTILITIES
    // ============================================

    /**
     * Zip two streams together
     */
    public <A, B, C> Stream<C> zip(Stream<A> streamA, Stream<B> streamB,
                                    BiFunction<A, B, C> zipper) {
        Iterator<A> iterA = streamA.iterator();
        Iterator<B> iterB = streamB.iterator();

        return Stream.generate(() -> zipper.apply(iterA.next(), iterB.next()))
            .takeWhile(x -> iterA.hasNext() && iterB.hasNext());
    }

    /**
     * Batch stream into chunks
     */
    public <T> Stream<List<T>> batch(Stream<T> stream, int batchSize) {
        Iterator<T> iterator = stream.iterator();

        return Stream.generate(() -> {
            List<T> batch = new ArrayList<>(batchSize);
            for (int i = 0; i < batchSize && iterator.hasNext(); i++) {
                batch.add(iterator.next());
            }
            return batch;
        }).takeWhile(batch -> !batch.isEmpty());
    }

    /**
     * Window/sliding view over stream
     */
    public <T> Stream<List<T>> sliding(List<T> list, int windowSize) {
        if (windowSize > list.size()) {
            return Stream.of(list);
        }
        return IntStream.rangeClosed(0, list.size() - windowSize)
            .mapToObj(i -> list.subList(i, i + windowSize));
    }
}`,
      explanation: `This template covers advanced Stream API patterns:

**Grouping and Partitioning:**
- Multi-level grouping with nested collectors
- Downstream aggregation (statistics, counting)
- Partitioning with custom predicates

**Custom Collectors:**
- String joining with prefix/suffix
- Collection to specific implementations (TreeSet)
- Teeing collector for computing two results simultaneously

**FlatMap and MapMulti:**
- FlatMap for nested collection processing
- MapMulti for conditional/multiple element emission
- Combining filtering with mapping in mapMulti

**Reduce Operations:**
- Complex reduce with custom accumulator
- Using records for intermediate reduction state

**Parallel Streams:**
- Custom ForkJoinPool for controlled parallelism
- Thread-safe concurrent collectors
- When to use parallel vs sequential

**Stream Utilities:**
- Zip two streams together
- Batch stream into fixed-size chunks
- Sliding window over collections`,
      bestPractices: [
        'Use toList() instead of collect(Collectors.toList()) for immutable lists',
        'Prefer mapMulti over flatMap for conditional expansion',
        'Use groupingByConcurrent for parallel stream grouping',
        'Size your custom ForkJoinPool appropriately',
        'Use teeing collector instead of multiple stream passes'
      ],
      commonMistakes: [
        'Using parallel streams for I/O operations',
        'Modifying shared state in stream operations',
        'Creating streams from iterators incorrectly',
        'Not closing streams from I/O sources',
        'Using parallel for small collections (overhead > benefit)'
      ],
      java21Tips: [
        'Virtual threads are better than parallel streams for I/O',
        'mapMulti is more efficient than flatMap for filtering',
        'Gatherers API (preview) will add more stream operations'
      ]
    })
  },

  PATTERN_MATCHING: {
    name: 'Pattern Matching',
    description: 'Java 21 pattern matching features',
    generate: (className, packageName) => ({
      name: 'Pattern Matching Examples',
      fileName: 'PatternMatchingExamples.java',
      packagePath: `${packageName}.util`,
      useCase: 'Java 21 pattern matching for instanceof, switch, and records',
      code: `package ${packageName}.util;

import java.time.*;
import java.util.*;

/**
 * Java 21 Pattern Matching - Complete Guide
 */
public class PatternMatchingExamples {

    // ============================================
    // PATTERN MATCHING FOR INSTANCEOF
    // ============================================

    /**
     * Traditional vs Pattern Matching instanceof
     */
    public void instanceofPatterns(Object obj) {
        // Traditional (before Java 16)
        if (obj instanceof String) {
            String s = (String) obj;
            System.out.println(s.toUpperCase());
        }

        // Pattern matching (Java 16+)
        if (obj instanceof String s) {
            System.out.println(s.toUpperCase());
        }

        // With logical operators
        if (obj instanceof String s && s.length() > 5) {
            System.out.println("Long string: " + s);
        }

        // Negation pattern
        if (!(obj instanceof String s)) {
            System.out.println("Not a string");
            return;
        }
        // s is in scope here
        System.out.println("String: " + s);
    }

    // ============================================
    // SWITCH PATTERN MATCHING
    // ============================================

    /**
     * Type pattern matching in switch
     */
    public String formatValue(Object value) {
        return switch (value) {
            case null -> "null";
            case Integer i -> "int: " + i;
            case Long l -> "long: " + l;
            case Double d -> String.format("double: %.2f", d);
            case String s -> "string: \\"" + s + "\\"";
            case List<?> list -> "list with " + list.size() + " elements";
            case Map<?, ?> map -> "map with " + map.size() + " entries";
            case int[] arr -> "int array of length " + arr.length;
            default -> "unknown: " + value.getClass().getSimpleName();
        };
    }

    /**
     * Guarded patterns with when clause
     */
    public String categorizeNumber(Number n) {
        return switch (n) {
            case null -> "null";
            case Integer i when i < 0 -> "negative integer: " + i;
            case Integer i when i == 0 -> "zero";
            case Integer i when i > 0 && i <= 100 -> "small positive: " + i;
            case Integer i -> "large positive: " + i;
            case Double d when d.isNaN() -> "not a number";
            case Double d when d.isInfinite() -> "infinite";
            case Double d when d < 0 -> "negative double";
            case Double d -> "positive double: " + d;
            default -> "other number type";
        };
    }

    // ============================================
    // RECORD PATTERNS
    // ============================================

    public sealed interface Shape permits Circle, Rectangle, Triangle {}
    public record Circle(double radius) implements Shape {}
    public record Rectangle(double width, double height) implements Shape {}
    public record Triangle(double a, double b, double c) implements Shape {}

    /**
     * Record pattern deconstruction
     */
    public double calculateArea(Shape shape) {
        return switch (shape) {
            case Circle(double r) -> Math.PI * r * r;
            case Rectangle(double w, double h) -> w * h;
            case Triangle(double a, double b, double c) -> {
                // Heron's formula
                double s = (a + b + c) / 2;
                yield Math.sqrt(s * (s - a) * (s - b) * (s - c));
            }
        };
    }

    /**
     * Nested record patterns
     */
    public record Point(double x, double y) {}
    public record Line(Point start, Point end) {}
    public record ColoredLine(Line line, String color) {}

    public double lineLength(Object obj) {
        return switch (obj) {
            // Nested deconstruction in one step
            case ColoredLine(Line(Point(double x1, double y1), Point(double x2, double y2)), _) ->
                Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

            case Line(Point(double x1, double y1), Point(double x2, double y2)) ->
                Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

            default -> 0.0;
        };
    }

    // ============================================
    // SEALED TYPES WITH EXHAUSTIVE MATCHING
    // ============================================

    public sealed interface Result<T> permits Success, Failure, Pending {}
    public record Success<T>(T value) implements Result<T> {}
    public record Failure<T>(String error, Exception cause) implements Result<T> {}
    public record Pending<T>(String taskId) implements Result<T> {}

    /**
     * Exhaustive pattern matching - compiler ensures all cases
     */
    public <T> String describeResult(Result<T> result) {
        return switch (result) {
            case Success(var value) -> "Success: " + value;
            case Failure(var error, var cause) -> "Failed: " + error +
                (cause != null ? " (" + cause.getMessage() + ")" : "");
            case Pending(var taskId) -> "Pending: " + taskId;
            // No default needed - compiler knows all cases are covered
        };
    }

    /**
     * Pattern matching with sealed interface hierarchy
     */
    public sealed interface Event permits UserEvent, SystemEvent {}
    public sealed interface UserEvent extends Event permits Login, Logout, Action {}
    public sealed interface SystemEvent extends Event permits Start, Stop, Error {}

    public record Login(String userId, Instant time) implements UserEvent {}
    public record Logout(String userId, Instant time) implements UserEvent {}
    public record Action(String userId, String action, Map<String, Object> data) implements UserEvent {}
    public record Start(Instant time) implements SystemEvent {}
    public record Stop(Instant time, String reason) implements SystemEvent {}
    public record Error(Instant time, String message, Throwable cause) implements SystemEvent {}

    public String handleEvent(Event event) {
        return switch (event) {
            case Login(var user, var time) ->
                "User " + user + " logged in at " + time;
            case Logout(var user, var time) ->
                "User " + user + " logged out at " + time;
            case Action(var user, var action, var data) ->
                "User " + user + " performed " + action + " with " + data.size() + " params";
            case Start(var time) ->
                "System started at " + time;
            case Stop(var time, var reason) ->
                "System stopped at " + time + ": " + reason;
            case Error(var time, var msg, _) ->
                "Error at " + time + ": " + msg;
        };
    }

    // ============================================
    // UNNAMED PATTERNS (Java 21)
    // ============================================

    public record Response(int status, String body, Map<String, String> headers) {}

    /**
     * Unnamed pattern variables with underscore
     */
    public String getResponseInfo(Response response) {
        return switch (response) {
            // We only care about status, ignore other components
            case Response(int status, _, _) when status >= 200 && status < 300 ->
                "Success: " + status;
            case Response(int status, String body, _) when status >= 400 ->
                "Error " + status + ": " + body;
            case Response(int status, _, _) ->
                "Status: " + status;
        };
    }

    /**
     * Unnamed in nested patterns
     */
    public boolean isValidLine(Object obj) {
        return switch (obj) {
            case Line(Point(double x1, _), Point(double x2, _)) when x1 != x2 -> true;
            case ColoredLine(Line(Point(_, double y1), Point(_, double y2)), _) when y1 != y2 -> true;
            default -> false;
        };
    }
}`,
      explanation: `This template covers all Java 21 pattern matching features:

**instanceof Pattern Matching:**
- Combines type check and cast in single expression
- Variable is scoped to true branch
- Works with logical operators (&&)
- Negation patterns with proper scoping

**Switch Pattern Matching:**
- Type patterns for any object type
- null handling as first-class case
- Guarded patterns with 'when' clause
- Exhaustive matching with sealed types

**Record Patterns:**
- Deconstruct record components directly
- Nested patterns for deep matching
- Combine with guards for complex conditions

**Sealed Types:**
- Compiler verifies exhaustiveness
- No default case needed when all cases covered
- Hierarchical sealed interfaces

**Unnamed Patterns (Java 21):**
- Use underscore (_) for unused components
- Cleaner code when only some components matter
- Works in both record patterns and lambda parameters

Pattern matching makes code more concise and type-safe by combining checks and extraction.`,
      bestPractices: [
        'Use sealed types with pattern matching for exhaustive handling',
        'Prefer pattern matching over explicit casts',
        'Use guard clauses (when) for complex conditions',
        'Use unnamed patterns (_) for unused components',
        'Order cases from specific to general'
      ],
      commonMistakes: [
        'Forgetting null case in switch (causes NPE)',
        'Wrong case ordering (more specific must come first)',
        'Not using sealed types for exhaustiveness',
        'Overcomplicating nested patterns',
        'Using pattern matching when simple equals() suffices'
      ],
      java21Tips: [
        'Unnamed patterns (_) reduce visual noise',
        'Record patterns work with generics',
        'Sealed interfaces enable compile-time exhaustiveness checks',
        'Pattern matching works in both switch statements and expressions'
      ]
    })
  },

  OPTIONAL_HANDLING: {
    name: 'Optional Patterns',
    description: 'Proper Optional usage patterns',
    generate: (className, packageName) => ({
      name: 'Optional Handling Patterns',
      fileName: 'OptionalPatterns.java',
      packagePath: `${packageName}.util`,
      useCase: 'Comprehensive Optional usage patterns for null-safe programming',
      code: `package ${packageName}.util;

import java.util.*;
import java.util.function.*;
import java.util.stream.*;

/**
 * Optional Patterns - Best practices and anti-patterns
 */
public class OptionalPatterns {

    // ============================================
    // CREATING OPTIONALS
    // ============================================

    public Optional<String> createOptional(String value) {
        // Never use Optional.of() with potentially null values
        return Optional.ofNullable(value);
    }

    public Optional<String> emptyOptional() {
        return Optional.empty();
    }

    // ============================================
    // CONSUMING OPTIONALS
    // ============================================

    /**
     * Basic value extraction patterns
     */
    public void consumePatterns(Optional<String> opt) {
        // Pattern 1: ifPresent - execute if value exists
        opt.ifPresent(value -> System.out.println("Value: " + value));

        // Pattern 2: ifPresentOrElse - handle both cases (Java 9+)
        opt.ifPresentOrElse(
            value -> System.out.println("Found: " + value),
            () -> System.out.println("Not found")
        );

        // Pattern 3: orElse - provide default value
        String result = opt.orElse("default");

        // Pattern 4: orElseGet - lazy default (use for expensive operations)
        String lazyResult = opt.orElseGet(() -> computeDefault());

        // Pattern 5: orElseThrow - throw if empty
        String required = opt.orElseThrow(() ->
            new IllegalStateException("Value is required"));
    }

    private String computeDefault() {
        return "computed-default";
    }

    // ============================================
    // TRANSFORMING OPTIONALS
    // ============================================

    public record User(Long id, String name, String email) {}
    public record UserDTO(Long id, String displayName) {}

    /**
     * Mapping and filtering
     */
    public Optional<UserDTO> transformUser(Optional<User> userOpt) {
        return userOpt
            .filter(user -> user.email() != null)
            .map(user -> new UserDTO(user.id(), user.name().toUpperCase()));
    }

    /**
     * FlatMap for nested Optionals
     */
    public Optional<String> getEmailDomain(Optional<User> userOpt) {
        return userOpt
            .map(User::email)
            .flatMap(this::extractDomain);
    }

    private Optional<String> extractDomain(String email) {
        if (email == null || !email.contains("@")) {
            return Optional.empty();
        }
        return Optional.of(email.substring(email.indexOf("@") + 1));
    }

    // ============================================
    // CHAINING OPTIONALS (Java 9+)
    // ============================================

    public interface UserRepository {
        Optional<User> findById(Long id);
        Optional<User> findByEmail(String email);
        Optional<User> findByName(String name);
    }

    /**
     * or() for fallback Optionals
     */
    public Optional<User> findUser(UserRepository repo, Long id, String email, String name) {
        return repo.findById(id)
            .or(() -> repo.findByEmail(email))
            .or(() -> repo.findByName(name));
    }

    // ============================================
    // STREAM INTEGRATION
    // ============================================

    /**
     * Optional to Stream (Java 9+)
     */
    public List<String> collectPresentValues(List<Optional<String>> optionals) {
        return optionals.stream()
            .flatMap(Optional::stream)  // Converts Optional to 0 or 1 element stream
            .toList();
    }

    /**
     * Filter map pattern - transform and filter nulls
     */
    public List<UserDTO> transformUsers(List<User> users) {
        return users.stream()
            .map(this::tryTransform)
            .flatMap(Optional::stream)
            .toList();
    }

    private Optional<UserDTO> tryTransform(User user) {
        if (user.email() == null) {
            return Optional.empty();
        }
        return Optional.of(new UserDTO(user.id(), user.name()));
    }

    // ============================================
    // OPTIONAL WITH PRIMITIVES
    // ============================================

    /**
     * Use OptionalInt, OptionalLong, OptionalDouble for primitives
     */
    public OptionalInt findMaxAge(List<User> users) {
        // Avoid boxing with primitive optionals
        return users.stream()
            .mapToInt(u -> u.name().length())
            .max();
    }

    public OptionalDouble calculateAverageLength(List<String> strings) {
        return strings.stream()
            .mapToInt(String::length)
            .average();
    }

    // ============================================
    // ANTI-PATTERNS TO AVOID
    // ============================================

    public class AntiPatterns {

        // WRONG: Don't use Optional for fields
        // private Optional<String> name; // BAD

        // WRONG: Don't use Optional in method parameters
        // public void process(Optional<String> input) {} // BAD

        // WRONG: Don't use Optional.get() without checking
        public String badGet(Optional<String> opt) {
            // return opt.get(); // BAD - can throw NoSuchElementException

            // CORRECT alternatives:
            return opt.orElse("default");
            // or
            // return opt.orElseThrow(() -> new IllegalStateException("Missing"));
        }

        // WRONG: Don't use isPresent() + get()
        public String badIsPresentGet(Optional<String> opt) {
            // BAD pattern:
            // if (opt.isPresent()) {
            //     return opt.get();
            // }
            // return "default";

            // CORRECT:
            return opt.orElse("default");
        }

        // WRONG: orElse with expensive operation
        public String badOrElse(Optional<String> opt) {
            // BAD - expensiveDefault() is ALWAYS called
            // return opt.orElse(expensiveDefault());

            // CORRECT - only called if empty
            return opt.orElseGet(this::expensiveDefault);
        }

        private String expensiveDefault() {
            // Expensive computation
            return "computed";
        }

        // WRONG: Returning null from Optional-returning method
        public Optional<String> badReturnNull(String input) {
            // return input == null ? null : Optional.of(input); // BAD

            // CORRECT:
            return Optional.ofNullable(input);
        }
    }

    // ============================================
    // BEST PRACTICE: RETURN OPTIONAL FROM METHODS
    // ============================================

    /**
     * Return Optional for methods that may not find a result
     */
    public Optional<User> findUserById(List<User> users, Long id) {
        return users.stream()
            .filter(u -> u.id().equals(id))
            .findFirst();
    }

    /**
     * Use empty collections instead of Optional<List>
     */
    public List<User> findUsersByName(List<User> users, String name) {
        // Return empty list, not Optional<List>
        return users.stream()
            .filter(u -> u.name().contains(name))
            .toList();
    }
}`,
      explanation: `This template covers Optional best practices and anti-patterns:

**Creating Optionals:**
- Optional.ofNullable() for potentially null values
- Optional.of() only when value is guaranteed non-null
- Optional.empty() for explicit absence

**Consuming Optionals:**
- ifPresent() for side effects
- ifPresentOrElse() for handling both cases
- orElse() vs orElseGet() - lazy evaluation matters
- orElseThrow() for required values

**Transforming:**
- map() for value transformation
- filter() for conditional presence
- flatMap() to avoid Optional<Optional<T>>

**Java 9+ Features:**
- or() for fallback Optional chains
- stream() for integration with Stream API
- ifPresentOrElse() for complete handling

**Primitive Optionals:**
- OptionalInt, OptionalLong, OptionalDouble
- Avoid boxing overhead

**Anti-patterns to Avoid:**
- Don't use Optional for fields or parameters
- Don't use get() without checking
- Don't use isPresent() + get() pattern
- Don't use orElse() with expensive computations
- Never return null from Optional-returning methods`,
      bestPractices: [
        'Use Optional for return types, not parameters or fields',
        'Prefer orElseGet() over orElse() for expensive defaults',
        'Use flatMap() to chain Optional-returning methods',
        'Never call get() without isPresent() check',
        'Return empty collections instead of Optional<Collection>'
      ],
      commonMistakes: [
        'Using Optional.get() without checking presence',
        'Using orElse() with method calls (always evaluated)',
        'Returning null from Optional-returning methods',
        'Using Optional as method parameters',
        'Overusing Optional where null is acceptable internally'
      ],
      java21Tips: [
        'Pattern matching works with Optional in some cases',
        'Consider sealed types + pattern matching as alternative',
        'Virtual threads make blocking orElseGet() safer'
      ]
    })
  },

  EXCEPTION_HANDLING: {
    name: 'Exception Handling',
    description: 'Modern exception handling patterns',
    generate: (className, packageName) => ({
      name: 'Exception Handling Patterns',
      fileName: 'ExceptionPatterns.java',
      packagePath: `${packageName}.util`,
      useCase: 'Modern exception handling with custom exceptions and functional patterns',
      code: `package ${packageName}.util;

import java.io.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.function.*;

/**
 * Modern Exception Handling Patterns
 */
public class ExceptionPatterns {

    // ============================================
    // CUSTOM EXCEPTION HIERARCHY
    // ============================================

    /**
     * Base domain exception using sealed classes
     */
    public sealed class DomainException extends RuntimeException
        permits ValidationException, NotFoundException, ConflictException, ExternalServiceException {

        private final String errorCode;

        public DomainException(String errorCode, String message) {
            super(message);
            this.errorCode = errorCode;
        }

        public DomainException(String errorCode, String message, Throwable cause) {
            super(message, cause);
            this.errorCode = errorCode;
        }

        public String getErrorCode() { return errorCode; }
    }

    public final class ValidationException extends DomainException {
        private final Map<String, String> fieldErrors;

        public ValidationException(Map<String, String> fieldErrors) {
            super("VALIDATION_ERROR", "Validation failed");
            this.fieldErrors = Map.copyOf(fieldErrors);
        }

        public Map<String, String> getFieldErrors() { return fieldErrors; }
    }

    public final class NotFoundException extends DomainException {
        private final String resourceType;
        private final String resourceId;

        public NotFoundException(String resourceType, String resourceId) {
            super("NOT_FOUND", resourceType + " not found: " + resourceId);
            this.resourceType = resourceType;
            this.resourceId = resourceId;
        }

        public String getResourceType() { return resourceType; }
        public String getResourceId() { return resourceId; }
    }

    public final class ConflictException extends DomainException {
        public ConflictException(String message) {
            super("CONFLICT", message);
        }
    }

    public final class ExternalServiceException extends DomainException {
        private final String serviceName;
        private final int statusCode;

        public ExternalServiceException(String serviceName, int statusCode, String message) {
            super("EXTERNAL_SERVICE_ERROR", serviceName + " error: " + message);
            this.serviceName = serviceName;
            this.statusCode = statusCode;
        }

        public String getServiceName() { return serviceName; }
        public int getStatusCode() { return statusCode; }
    }

    // ============================================
    // TRY-WITH-RESOURCES PATTERNS
    // ============================================

    /**
     * Multiple resources with try-with-resources
     */
    public String readFile(String path) {
        try (var reader = new BufferedReader(new FileReader(path));
             var lines = reader.lines()) {
            return lines.reduce("", (a, b) -> a + "\\n" + b);
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to read: " + path, e);
        }
    }

    /**
     * Custom AutoCloseable
     */
    public class ManagedResource implements AutoCloseable {
        private boolean open = true;

        public void doWork() {
            if (!open) throw new IllegalStateException("Resource is closed");
            // Work...
        }

        @Override
        public void close() {
            if (open) {
                open = false;
                // Cleanup...
            }
        }
    }

    // ============================================
    // FUNCTIONAL EXCEPTION HANDLING
    // ============================================

    /**
     * Functional interface that can throw checked exceptions
     */
    @FunctionalInterface
    public interface ThrowingFunction<T, R, E extends Exception> {
        R apply(T t) throws E;
    }

    /**
     * Wrapper to convert checked to unchecked
     */
    public static <T, R> Function<T, R> unchecked(ThrowingFunction<T, R, Exception> f) {
        return t -> {
            try {
                return f.apply(t);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        };
    }

    /**
     * Usage with streams
     */
    public List<String> readFiles(List<String> paths) {
        return paths.stream()
            .map(unchecked(path -> new String(java.nio.file.Files.readAllBytes(
                java.nio.file.Path.of(path)))))
            .toList();
    }

    // ============================================
    // RESULT TYPE PATTERN (Alternative to exceptions)
    // ============================================

    public sealed interface Result<T> permits Result.Success, Result.Failure {

        record Success<T>(T value) implements Result<T> {}
        record Failure<T>(String error, Exception cause) implements Result<T> {}

        static <T> Result<T> success(T value) {
            return new Success<>(value);
        }

        static <T> Result<T> failure(String error) {
            return new Failure<>(error, null);
        }

        static <T> Result<T> failure(String error, Exception cause) {
            return new Failure<>(error, cause);
        }

        default boolean isSuccess() { return this instanceof Success; }
        default boolean isFailure() { return this instanceof Failure; }

        default T getOrThrow() {
            return switch (this) {
                case Success(var value) -> value;
                case Failure(var error, var cause) ->
                    throw new RuntimeException(error, cause);
            };
        }

        default T getOrElse(T defaultValue) {
            return switch (this) {
                case Success(var value) -> value;
                case Failure(_, _) -> defaultValue;
            };
        }

        default <U> Result<U> map(Function<T, U> mapper) {
            return switch (this) {
                case Success(var value) -> success(mapper.apply(value));
                case Failure(var error, var cause) -> failure(error, cause);
            };
        }

        default <U> Result<U> flatMap(Function<T, Result<U>> mapper) {
            return switch (this) {
                case Success(var value) -> mapper.apply(value);
                case Failure(var error, var cause) -> failure(error, cause);
            };
        }
    }

    /**
     * Using Result type
     */
    public Result<Integer> parseNumber(String input) {
        try {
            return Result.success(Integer.parseInt(input));
        } catch (NumberFormatException e) {
            return Result.failure("Invalid number: " + input, e);
        }
    }

    public Result<Integer> divide(int a, int b) {
        if (b == 0) {
            return Result.failure("Division by zero");
        }
        return Result.success(a / b);
    }

    /**
     * Chaining Result operations
     */
    public Result<Integer> calculate(String numStr, int divisor) {
        return parseNumber(numStr)
            .flatMap(num -> divide(num * 2, divisor))
            .map(result -> result + 10);
    }

    // ============================================
    // RETRY PATTERN
    // ============================================

    public <T> T retry(Supplier<T> operation, int maxAttempts, long delayMs) {
        Exception lastException = null;

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return operation.get();
            } catch (Exception e) {
                lastException = e;
                if (attempt < maxAttempts) {
                    try {
                        Thread.sleep(delayMs * attempt); // Exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Retry interrupted", ie);
                    }
                }
            }
        }

        throw new RuntimeException("Failed after " + maxAttempts + " attempts", lastException);
    }

    // ============================================
    // EXCEPTION HANDLING WITH COMPLETABLE FUTURE
    // ============================================

    public CompletableFuture<String> asyncOperation() {
        return CompletableFuture
            .supplyAsync(() -> {
                // Some async operation
                return "result";
            })
            .exceptionally(ex -> {
                // Handle exception, return fallback
                System.err.println("Error: " + ex.getMessage());
                return "fallback";
            });
    }

    public CompletableFuture<String> asyncWithRecovery() {
        return CompletableFuture
            .supplyAsync(this::riskyOperation)
            .handle((result, ex) -> {
                if (ex != null) {
                    return "recovered from: " + ex.getMessage();
                }
                return result;
            });
    }

    private String riskyOperation() {
        if (Math.random() > 0.5) {
            throw new RuntimeException("Random failure");
        }
        return "success";
    }
}`,
      explanation: `This template covers modern exception handling approaches:

**Custom Exception Hierarchy:**
- Sealed classes for closed hierarchy
- Domain-specific exceptions with error codes
- Rich exception data (field errors, resource info)

**Try-with-Resources:**
- Multiple resources in single try block
- Custom AutoCloseable implementations
- Proper resource cleanup patterns

**Functional Exception Handling:**
- ThrowingFunction interface for checked exceptions
- Wrapper to convert checked to unchecked
- Clean stream integration

**Result Type Pattern:**
- Alternative to exceptions for expected failures
- map/flatMap for chaining operations
- Pattern matching for handling success/failure

**Retry Pattern:**
- Configurable retry with exponential backoff
- Proper exception tracking
- Interruption handling

**CompletableFuture:**
- exceptionally() for fallback values
- handle() for both success and failure
- Async exception recovery`,
      bestPractices: [
        'Use sealed classes for exception hierarchies',
        'Include error codes for API responses',
        'Use Result type for expected failures, exceptions for unexpected',
        'Always use try-with-resources for AutoCloseable',
        'Wrap checked exceptions at API boundaries'
      ],
      commonMistakes: [
        'Catching Exception or Throwable too broadly',
        'Swallowing exceptions without logging',
        'Not preserving exception cause in wrapping',
        'Using exceptions for flow control',
        'Not closing resources properly'
      ],
      java21Tips: [
        'Pattern matching works great with sealed exceptions',
        'Virtual threads need careful exception handling',
        'Structured concurrency provides better exception propagation'
      ]
    })
  },

  FUNCTIONAL_INTERFACES: {
    name: 'Functional Interfaces',
    description: 'Custom functional interfaces and lambdas',
    generate: (className, packageName) => ({
      name: 'Functional Interface Patterns',
      fileName: 'FunctionalPatterns.java',
      packagePath: `${packageName}.util`,
      useCase: 'Custom functional interfaces, method references, and lambda patterns',
      code: `package ${packageName}.util;

import java.util.*;
import java.util.function.*;

/**
 * Functional Interface Patterns in Java 21
 */
public class FunctionalPatterns {

    // ============================================
    // BUILT-IN FUNCTIONAL INTERFACES
    // ============================================

    /**
     * Common functional interface examples
     */
    public void builtInExamples() {
        // Supplier - no input, returns value
        Supplier<String> supplier = () -> "Hello";
        Supplier<Double> random = Math::random;

        // Consumer - takes input, no return
        Consumer<String> printer = System.out::println;
        Consumer<List<String>> sorter = Collections::sort;

        // Function - transform input to output
        Function<String, Integer> length = String::length;
        Function<Integer, String> toString = Object::toString;

        // Predicate - test condition
        Predicate<String> isEmpty = String::isEmpty;
        Predicate<Integer> isPositive = n -> n > 0;

        // BiFunction - two inputs, one output
        BiFunction<String, String, String> concat = String::concat;
        BiFunction<Integer, Integer, Integer> multiply = (a, b) -> a * b;

        // UnaryOperator - same type in and out
        UnaryOperator<String> upper = String::toUpperCase;
        UnaryOperator<Integer> increment = n -> n + 1;

        // BinaryOperator - combine two of same type
        BinaryOperator<Integer> add = Integer::sum;
        BinaryOperator<String> longer = (a, b) -> a.length() >= b.length() ? a : b;
    }

    // ============================================
    // CUSTOM FUNCTIONAL INTERFACES
    // ============================================

    /**
     * Tri-function for three arguments
     */
    @FunctionalInterface
    public interface TriFunction<A, B, C, R> {
        R apply(A a, B b, C c);

        default <V> TriFunction<A, B, C, V> andThen(Function<? super R, ? extends V> after) {
            Objects.requireNonNull(after);
            return (a, b, c) -> after.apply(apply(a, b, c));
        }
    }

    /**
     * Checked exception throwing function
     */
    @FunctionalInterface
    public interface CheckedFunction<T, R> {
        R apply(T t) throws Exception;

        static <T, R> Function<T, R> unchecked(CheckedFunction<T, R> f) {
            return t -> {
                try {
                    return f.apply(t);
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            };
        }
    }

    /**
     * Validator functional interface
     */
    @FunctionalInterface
    public interface Validator<T> {
        ValidationResult validate(T value);

        default Validator<T> and(Validator<T> other) {
            return value -> {
                ValidationResult result = this.validate(value);
                return result.isValid() ? other.validate(value) : result;
            };
        }

        default Validator<T> or(Validator<T> other) {
            return value -> {
                ValidationResult result = this.validate(value);
                return result.isValid() ? result : other.validate(value);
            };
        }

        static <T> Validator<T> of(Predicate<T> predicate, String message) {
            return value -> predicate.test(value)
                ? ValidationResult.valid()
                : ValidationResult.invalid(message);
        }
    }

    public record ValidationResult(boolean isValid, List<String> errors) {
        public static ValidationResult valid() {
            return new ValidationResult(true, List.of());
        }
        public static ValidationResult invalid(String error) {
            return new ValidationResult(false, List.of(error));
        }
    }

    // ============================================
    // METHOD REFERENCE PATTERNS
    // ============================================

    public record Person(String name, int age) {
        public static Person create(String name) {
            return new Person(name, 0);
        }
        public boolean isAdult() {
            return age >= 18;
        }
    }

    public void methodReferenceExamples() {
        List<Person> people = List.of(
            new Person("Alice", 30),
            new Person("Bob", 17)
        );

        // Static method reference: ClassName::staticMethod
        List<Person> created = List.of("Alice", "Bob").stream()
            .map(Person::create)
            .toList();

        // Instance method of particular object: object::method
        Person alice = new Person("Alice", 30);
        Supplier<Boolean> isAliceAdult = alice::isAdult;

        // Instance method of arbitrary object: ClassName::instanceMethod
        List<String> names = people.stream()
            .map(Person::name)
            .toList();

        // Constructor reference: ClassName::new
        BiFunction<String, Integer, Person> constructor = Person::new;
        Person newPerson = constructor.apply("Charlie", 25);

        // Array constructor reference
        Function<Integer, String[]> arrayCreator = String[]::new;
        String[] array = arrayCreator.apply(10);
    }

    // ============================================
    // COMPOSITION AND CHAINING
    // ============================================

    public void compositionExamples() {
        // Function composition
        Function<String, String> trim = String::trim;
        Function<String, String> upper = String::toUpperCase;
        Function<String, Integer> length = String::length;

        // andThen: first this, then that
        Function<String, Integer> pipeline = trim.andThen(upper).andThen(length);

        // compose: first that, then this
        Function<String, Integer> reversed = length.compose(upper).compose(trim);

        // Predicate composition
        Predicate<String> notEmpty = s -> !s.isEmpty();
        Predicate<String> notNull = Objects::nonNull;
        Predicate<String> hasContent = notNull.and(notEmpty);

        Predicate<Integer> isEven = n -> n % 2 == 0;
        Predicate<Integer> isPositive = n -> n > 0;
        Predicate<Integer> isOdd = isEven.negate();
        Predicate<Integer> isPositiveEven = isEven.and(isPositive);

        // Consumer chaining
        Consumer<String> log = s -> System.out.println("Log: " + s);
        Consumer<String> store = s -> System.out.println("Store: " + s);
        Consumer<String> combined = log.andThen(store);
    }

    // ============================================
    // CURRYING AND PARTIAL APPLICATION
    // ============================================

    /**
     * Convert BiFunction to curried form
     */
    public <A, B, R> Function<A, Function<B, R>> curry(BiFunction<A, B, R> biFunction) {
        return a -> b -> biFunction.apply(a, b);
    }

    /**
     * Partial application - fix one argument
     */
    public <A, B, R> Function<B, R> partial(BiFunction<A, B, R> biFunction, A a) {
        return b -> biFunction.apply(a, b);
    }

    public void curryingExample() {
        BiFunction<Integer, Integer, Integer> add = Integer::sum;

        // Curry: transform (a, b) -> r into a -> b -> r
        Function<Integer, Function<Integer, Integer>> curriedAdd = curry(add);
        Function<Integer, Integer> add5 = curriedAdd.apply(5);
        int result = add5.apply(3); // 8

        // Partial application: fix first argument
        Function<Integer, Integer> add10 = partial(add, 10);
        int result2 = add10.apply(7); // 17
    }

    // ============================================
    // MEMOIZATION
    // ============================================

    /**
     * Memoize a function (cache results)
     */
    public <T, R> Function<T, R> memoize(Function<T, R> function) {
        Map<T, R> cache = new HashMap<>();
        return input -> cache.computeIfAbsent(input, function);
    }

    public void memoizationExample() {
        // Expensive function
        Function<Integer, Integer> factorial = n -> {
            System.out.println("Computing factorial of " + n);
            int result = 1;
            for (int i = 2; i <= n; i++) result *= i;
            return result;
        };

        // Memoized version
        Function<Integer, Integer> memoizedFactorial = memoize(factorial);

        // First call computes
        memoizedFactorial.apply(5); // Prints "Computing..."
        // Second call uses cache
        memoizedFactorial.apply(5); // No print, returns cached
    }
}`,
      explanation: `This template covers functional programming patterns in Java:

**Built-in Functional Interfaces:**
- Supplier, Consumer, Function, Predicate
- BiFunction, UnaryOperator, BinaryOperator
- Common use cases and method references

**Custom Functional Interfaces:**
- TriFunction for three-argument operations
- CheckedFunction for exception handling
- Validator with and/or composition

**Method References:**
- Static method: ClassName::staticMethod
- Instance method: object::method or ClassName::instanceMethod
- Constructor: ClassName::new
- Array constructor: Type[]::new

**Composition:**
- Function.andThen() and compose()
- Predicate.and(), or(), negate()
- Consumer.andThen()

**Currying and Partial Application:**
- Transform BiFunction to nested Functions
- Fix arguments to create specialized functions

**Memoization:**
- Cache function results
- Use computeIfAbsent for thread-safe caching`,
      bestPractices: [
        'Use built-in functional interfaces when possible',
        'Create custom interfaces only for clarity or special needs',
        'Prefer method references over lambdas when clearer',
        'Use composition to build complex operations',
        'Consider memoization for expensive pure functions'
      ],
      commonMistakes: [
        'Creating unnecessary custom functional interfaces',
        'Complex lambdas that should be methods',
        'Not handling null in function composition',
        'Mutating state in functions (breaks purity)',
        'Overusing currying where it reduces readability'
      ],
      java21Tips: [
        'Pattern matching can simplify conditional lambdas',
        'Records work great as function results',
        'Consider using sealed types for result types'
      ]
    })
  }
};
