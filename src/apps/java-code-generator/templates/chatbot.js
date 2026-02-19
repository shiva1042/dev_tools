// Chatbot Templates

export const chatbotTemplates = {
  CHATBOT_SERVICE: {
    name: 'Chatbot Service',
    description: 'Core chatbot service with message handling',
    generate: (className, packageName) => ({
      name: `${className} Chatbot Service`,
      fileName: `${className}ChatbotService.java`,
      packagePath: `${packageName}.service`,
      useCase: 'Core chatbot service with session management and response generation',
      code: `package ${packageName}.service;

import ${packageName}.model.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ${className}ChatbotService {

    private final Map<String, ConversationContext> conversations = new ConcurrentHashMap<>();

    public ChatResponse processMessage(ChatRequest request) {
        String sessionId = request.sessionId();
        String userMessage = request.message();

        ConversationContext context = conversations.computeIfAbsent(
                sessionId, id -> new ConversationContext(id)
        );

        context.addMessage(new ChatMessage("user", userMessage, LocalDateTime.now()));

        String response = generateResponse(userMessage, context);

        context.addMessage(new ChatMessage("assistant", response, LocalDateTime.now()));

        return new ChatResponse(sessionId, response, context.getSuggestedActions());
    }

    private String generateResponse(String message, ConversationContext context) {
        String lower = message.toLowerCase();

        if (lower.contains("hello") || lower.contains("hi")) {
            return "Hello! How can I help you today?";
        } else if (lower.contains("help")) {
            return "I can help you with various tasks. What would you like to know?";
        } else if (lower.contains("bye")) {
            return "Goodbye! Have a great day!";
        }

        return "I understand. Could you tell me more about what you need?";
    }

    public List<ChatMessage> getHistory(String sessionId) {
        ConversationContext context = conversations.get(sessionId);
        return context != null ? context.getMessages() : List.of();
    }

    public void clearSession(String sessionId) {
        conversations.remove(sessionId);
    }
}

record ChatRequest(String sessionId, String message) {}
record ChatResponse(String sessionId, String message, List<String> suggestedActions) {}
record ChatMessage(String role, String content, LocalDateTime timestamp) {}

class ConversationContext {
    private final String sessionId;
    private final List<ChatMessage> messages = new ArrayList<>();

    ConversationContext(String sessionId) { this.sessionId = sessionId; }

    void addMessage(ChatMessage msg) { messages.add(msg); }
    List<ChatMessage> getMessages() { return List.copyOf(messages); }
    List<String> getSuggestedActions() { return List.of("Help", "Start over"); }
}`,
      explanation: 'Chatbot service with session management and simple response generation.',
      bestPractices: ['Use ConcurrentHashMap for thread-safe sessions', 'Maintain conversation history'],
      commonMistakes: ['Not handling session timeouts', 'Storing too much history'],
      java21Tips: ['Use records for message types', 'Virtual threads for concurrent conversations']
    })
  },

  CHATBOT_CONTROLLER: {
    name: 'Chatbot Controller',
    description: 'REST API for chatbot interactions',
    generate: (className, packageName) => ({
      name: `${className} Chat Controller`,
      fileName: `${className}ChatController.java`,
      packagePath: `${packageName}.controller`,
      useCase: 'REST API endpoints for chatbot interactions',
      code: `package ${packageName}.controller;

import ${packageName}.service.${className}ChatbotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ${className}ChatController {

    private final ${className}ChatbotService chatbotService;

    public ${className}ChatController(${className}ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping("/message")
    public ResponseEntity<ChatResponseDTO> sendMessage(@RequestBody ChatRequestDTO request) {
        var response = chatbotService.processMessage(
            new ChatRequest(request.sessionId(), request.message())
        );
        return ResponseEntity.ok(new ChatResponseDTO(
            response.sessionId(), response.message(), response.suggestedActions()
        ));
    }

    @GetMapping("/history/{sessionId}")
    public ResponseEntity<List<ChatMessageDTO>> getHistory(@PathVariable String sessionId) {
        var messages = chatbotService.getHistory(sessionId);
        var dtos = messages.stream()
            .map(m -> new ChatMessageDTO(m.role(), m.content(), m.timestamp().toString()))
            .toList();
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/session/{sessionId}")
    public ResponseEntity<Void> clearSession(@PathVariable String sessionId) {
        chatbotService.clearSession(sessionId);
        return ResponseEntity.noContent().build();
    }

    record ChatRequestDTO(String sessionId, String message) {}
    record ChatResponseDTO(String sessionId, String message, List<String> suggestedActions) {}
    record ChatMessageDTO(String role, String content, String timestamp) {}
}`,
      explanation: 'REST controller for chatbot with message, history, and session endpoints.',
      bestPractices: ['Use DTOs separate from domain objects', 'Include session management endpoints'],
      commonMistakes: ['Exposing internal message format', 'Missing error responses'],
      java21Tips: ['Records make DTOs concise']
    })
  },

  CHATBOT_WEBSOCKET: {
    name: 'Chatbot WebSocket',
    description: 'Real-time chat with WebSocket',
    generate: (className, packageName) => ({
      name: `${className} WebSocket Chat`,
      fileName: `${className}WebSocketChat.java`,
      packagePath: `${packageName}.websocket`,
      useCase: 'Real-time chat using WebSocket with STOMP protocol',
      code: `package ${packageName}.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.config.annotation.*;

import java.time.LocalDateTime;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/chat").setAllowedOrigins("*").withSockJS();
    }
}

@Controller
class ${className}WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    public ${className}WebSocketController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat.send")
    @SendTo("/topic/messages")
    public WebSocketMessage handleMessage(WebSocketMessage message) {
        return new WebSocketMessage(
            message.sessionId(), "assistant",
            "I received: " + message.content(),
            LocalDateTime.now().toString()
        );
    }

    @MessageMapping("/chat.typing")
    @SendTo("/topic/typing")
    public TypingIndicator handleTyping(TypingIndicator indicator) {
        return indicator;
    }
}

record WebSocketMessage(String sessionId, String role, String content, String timestamp) {}
record TypingIndicator(String sessionId, String username, boolean isTyping) {}`,
      explanation: 'WebSocket configuration and controller for real-time chat.',
      bestPractices: ['Use STOMP for structured messaging', 'Include typing indicators'],
      commonMistakes: ['Not handling disconnections', 'Missing CORS configuration'],
      java21Tips: ['Virtual threads can handle many WebSocket connections']
    })
  },

  CHATBOT_INTENT: {
    name: 'Intent Handler',
    description: 'Intent recognition and routing',
    generate: (className, packageName) => ({
      name: 'Intent Handler',
      fileName: 'IntentHandler.java',
      packagePath: `${packageName}.service`,
      useCase: 'Intent detection using pattern matching for chatbot routing',
      code: `package ${packageName}.service;

import org.springframework.stereotype.Component;
import java.util.*;
import java.util.regex.Pattern;

@Component
public class IntentHandler {

    private final List<IntentMatcher> matchers = List.of(
        new PatternMatcher("greeting", List.of("hello", "hi", "hey"), 0.95),
        new PatternMatcher("farewell", List.of("bye", "goodbye", "see you"), 0.95),
        new PatternMatcher("help", List.of("help", "support", "how do i"), 0.9),
        new PatternMatcher("affirm", List.of("yes", "yeah", "sure", "ok"), 0.9),
        new PatternMatcher("deny", List.of("no", "nope", "wrong"), 0.9)
    );

    public Intent detectIntent(String message) {
        String normalized = message.toLowerCase().trim();

        for (IntentMatcher matcher : matchers) {
            Optional<Intent> result = matcher.match(normalized);
            if (result.isPresent()) {
                return result.get();
            }
        }

        return new Intent("unknown", 0.5);
    }
}

record Intent(String name, double confidence) {}

interface IntentMatcher {
    Optional<Intent> match(String message);
}

class PatternMatcher implements IntentMatcher {
    private final String intentName;
    private final List<String> patterns;
    private final double confidence;

    PatternMatcher(String intentName, List<String> patterns, double confidence) {
        this.intentName = intentName;
        this.patterns = patterns;
        this.confidence = confidence;
    }

    @Override
    public Optional<Intent> match(String message) {
        for (String pattern : patterns) {
            if (message.contains(pattern)) {
                return Optional.of(new Intent(intentName, confidence));
            }
        }
        return Optional.empty();
    }
}`,
      explanation: 'Extensible intent detection using pattern matching with confidence scores.',
      bestPractices: ['Order matchers by specificity', 'Use confidence scores for ambiguous cases'],
      commonMistakes: ['Not handling unknown intents', 'Hardcoding all intents'],
      java21Tips: ['Use pattern matching switch for intent routing']
    })
  }
};
