// Testing Templates

export const testingTemplates = {
  JUNIT_TEST: {
    name: 'JUnit 5 Test',
    description: 'Basic JUnit 5 test class',
    generate: (className, packageName) => ({
      name: `${className} JUnit Test`,
      fileName: `${className}Test.java`,
      packagePath: packageName,
      useCase: 'Comprehensive JUnit 5 test class',
      code: `package ${packageName};

import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.*;

import java.util.stream.Stream;
import static org.junit.jupiter.api.Assertions.*;

@DisplayName("${className} Tests")
class ${className}Test {

    private ${className} underTest;

    @BeforeEach
    void setUp() {
        underTest = new ${className}();
    }

    @Test
    @DisplayName("should do something when condition is met")
    void shouldDoSomething() {
        // Given
        String input = "test";

        // When
        String result = underTest.process(input);

        // Then
        assertNotNull(result);
        assertEquals("expected", result);
    }

    @Test
    @DisplayName("should throw exception for invalid input")
    void shouldThrowExceptionForInvalidInput() {
        assertThrows(IllegalArgumentException.class, () -> {
            underTest.process(null);
        });
    }

    @ParameterizedTest
    @DisplayName("should handle various inputs")
    @ValueSource(strings = {"input1", "input2", "input3"})
    void shouldHandleVariousInputs(String input) {
        assertDoesNotThrow(() -> underTest.process(input));
    }

    @ParameterizedTest
    @CsvSource({"input1, expected1", "input2, expected2"})
    void shouldReturnCorrectResults(String input, String expected) {
        assertEquals(expected, underTest.process(input));
    }

    @Nested
    @DisplayName("When processing valid data")
    class WhenValidData {
        @Test
        void shouldReturnSuccess() {
            assertTrue(underTest.isValid("valid"));
        }
    }

    @Test
    @Disabled("Not implemented yet")
    void futureFeatureTest() {
        // TODO: Implement
    }
}`,
      explanation: 'JUnit 5 test class with lifecycle methods and parameterized tests.',
      bestPractices: ['Use @DisplayName for readable names', 'Follow Given-When-Then'],
      commonMistakes: ['Testing implementation over behavior', 'Missing edge cases'],
      java21Tips: ['Use records for test data']
    })
  },

  MOCK_TEST: {
    name: 'Mockito Test',
    description: 'Test with Mockito mocking',
    generate: (className, packageName) => ({
      name: `${className} Mockito Test`,
      fileName: `${className}ServiceTest.java`,
      packagePath: packageName,
      useCase: 'Service layer tests with Mockito',
      code: `package ${packageName};

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("${className}Service Tests")
class ${className}ServiceTest {

    @Mock
    private ${className}Repository repository;

    @InjectMocks
    private ${className}Service underTest;

    @Captor
    private ArgumentCaptor<${className}> captor;

    @Test
    @DisplayName("should find by id when exists")
    void shouldFindByIdWhenExists() {
        // Given
        var entity = new ${className}(1L, "Test");
        given(repository.findById(1L)).willReturn(Optional.of(entity));

        // When
        Optional<${className}> result = underTest.findById(1L);

        // Then
        assertTrue(result.isPresent());
        assertEquals("Test", result.get().name());
        then(repository).should().findById(1L);
    }

    @Test
    @DisplayName("should save entity")
    void shouldSaveEntity() {
        // Given
        var entity = new ${className}(null, "Test");
        given(repository.save(any())).willReturn(new ${className}(1L, "Test"));

        // When
        ${className} saved = underTest.save(entity);

        // Then
        assertNotNull(saved.id());
        then(repository).should().save(captor.capture());
        assertEquals("Test", captor.getValue().name());
    }

    @Test
    @DisplayName("should throw when service fails")
    void shouldThrowWhenFails() {
        // Given
        given(repository.findById(anyLong())).willThrow(new RuntimeException("Error"));

        // When & Then
        assertThrows(RuntimeException.class, () -> underTest.findById(1L));
    }
}

record ${className}(Long id, String name) {}
interface ${className}Repository {
    Optional<${className}> findById(Long id);
    ${className} save(${className} entity);
}
class ${className}Service {
    private final ${className}Repository repository;
    ${className}Service(${className}Repository repository) { this.repository = repository; }
    Optional<${className}> findById(Long id) { return repository.findById(id); }
    ${className} save(${className} entity) { return repository.save(entity); }
}`,
      explanation: 'Mockito test with BDD style and argument captors.',
      bestPractices: ['Use BDD style: given/when/then', 'Use ArgumentCaptor for verifications'],
      commonMistakes: ['Over-mocking', 'Not verifying interactions'],
      java21Tips: ['Records work well as test data']
    })
  },

  INTEGRATION_TEST: {
    name: 'Integration Test',
    description: 'Spring Boot integration test',
    generate: (className, packageName) => ({
      name: `${className} Integration Test`,
      fileName: `${className}IntegrationTest.java`,
      packagePath: packageName,
      useCase: 'Full integration tests with Spring Boot',
      code: `package ${packageName};

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("${className} Integration Tests")
class ${className}IntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    private String baseUrl;

    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port + "/api/${className.toLowerCase()}s";
    }

    @Test
    @Order(1)
    @DisplayName("should create entity")
    void shouldCreate() {
        var request = new ${className}Request("Test");
        ResponseEntity<${className}Response> response = restTemplate.postForEntity(
                baseUrl, request, ${className}Response.class);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody().id());
    }

    @Test
    @Order(2)
    @DisplayName("should get by id")
    void shouldGetById() {
        ResponseEntity<${className}Response> response = restTemplate.getForEntity(
                baseUrl + "/1", ${className}Response.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    @DisplayName("should return 404 for non-existent")
    void shouldReturn404() {
        ResponseEntity<String> response = restTemplate.getForEntity(
                baseUrl + "/99999", String.class);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }
}

record ${className}Request(String name) {}
record ${className}Response(Long id, String name) {}`,
      explanation: 'Integration tests with TestRestTemplate and ordered execution.',
      bestPractices: ['Use random port', 'Use test profile', 'Order dependent tests'],
      commonMistakes: ['Not cleaning up data', 'Tests depending on external state'],
      java21Tips: ['Use records for DTOs']
    })
  },

  CONTROLLER_TEST: {
    name: 'Controller Test',
    description: 'MockMvc controller test',
    generate: (className, packageName) => ({
      name: `${className} Controller Test`,
      fileName: `${className}ControllerTest.java`,
      packagePath: packageName,
      useCase: 'Controller tests with MockMvc',
      code: `package ${packageName};

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.BDDMockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(${className}Controller.class)
@DisplayName("${className}Controller Tests")
class ${className}ControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ${className}Service service;

    @Test
    @DisplayName("GET /${className.toLowerCase()}s/{id} - should return entity")
    void shouldReturnById() throws Exception {
        given(service.findById(1L)).willReturn(Optional.of(new ${className}DTO(1L, "Test")));

        mockMvc.perform(get("/api/${className.toLowerCase()}s/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Test"));
    }

    @Test
    @DisplayName("GET /${className.toLowerCase()}s/{id} - should return 404")
    void shouldReturn404() throws Exception {
        given(service.findById(anyLong())).willReturn(Optional.empty());

        mockMvc.perform(get("/api/${className.toLowerCase()}s/{id}", 999L))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /${className.toLowerCase()}s - should create")
    void shouldCreate() throws Exception {
        var request = new ${className}Request("New");
        given(service.create(any())).willReturn(new ${className}DTO(1L, "New"));

        mockMvc.perform(post("/api/${className.toLowerCase()}s")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists());
    }
}

class ${className}Controller {}
interface ${className}Service {
    Optional<${className}DTO> findById(Long id);
    ${className}DTO create(${className}Request request);
}
record ${className}DTO(Long id, String name) {}
record ${className}Request(String name) {}`,
      explanation: 'Controller tests with MockMvc and JSON assertions.',
      bestPractices: ['Use @WebMvcTest for fast tests', 'Mock service layer'],
      commonMistakes: ['Not testing error responses', 'Missing content type'],
      java21Tips: ['Use records for test DTOs']
    })
  }
};
