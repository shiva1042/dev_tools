// WebSocket Templates

export const websocketTemplates = {
  WEBSOCKET_CONFIG: {
    name: 'WebSocket Config',
    description: 'WebSocket configuration',
    generate: (className, packageName) => ({
      name: 'WebSocket Configuration',
      fileName: 'WebSocketConfig.java',
      packagePath: `${packageName}.config`,
      useCase: 'WebSocket configuration with STOMP message broker',
      code: `package ${packageName}.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple broker for subscriptions
        config.enableSimpleBroker("/topic", "/queue");
        // Prefix for @MessageMapping methods
        config.setApplicationDestinationPrefixes("/app");
        // Prefix for user-specific messages
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("*")
                .withSockJS();
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration
                .setMessageSizeLimit(128 * 1024)  // 128KB
                .setSendBufferSizeLimit(512 * 1024)  // 512KB
                .setSendTimeLimit(20 * 1000);  // 20 seconds
    }
}`,
      explanation: 'WebSocket configuration using STOMP protocol with message broker.',
      bestPractices: ['Use STOMP for structured messaging', 'Configure message size limits'],
      commonMistakes: ['Not setting allowed origins', 'No message size limits'],
      java21Tips: ['Virtual threads handle many connections efficiently']
    })
  },

  WEBSOCKET_HANDLER: {
    name: 'WebSocket Handler',
    description: 'WebSocket message handler',
    generate: (className, packageName) => ({
      name: `${className} WebSocket Handler`,
      fileName: `${className}WebSocketHandler.java`,
      packagePath: `${packageName}.websocket`,
      useCase: 'Raw WebSocket handler with session management',
      code: `package ${packageName}.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ${className}WebSocketHandler extends TextWebSocketHandler {

    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.put(session.getId(), session);
        session.sendMessage(new TextMessage("{\\"type\\":\\"connected\\",\\"id\\":\\"" + session.getId() + "\\"}"));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();

        // Echo back to sender
        session.sendMessage(new TextMessage("{\\"type\\":\\"echo\\",\\"data\\":" + payload + "}"));

        // Broadcast to all
        broadcast("{\\"type\\":\\"broadcast\\",\\"from\\":\\"" + session.getId() + "\\",\\"data\\":" + payload + "}");
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session.getId());
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        if (session.isOpen()) session.close(CloseStatus.SERVER_ERROR);
    }

    public void sendToSession(String sessionId, String message) throws IOException {
        WebSocketSession session = sessions.get(sessionId);
        if (session != null && session.isOpen()) {
            session.sendMessage(new TextMessage(message));
        }
    }

    public void broadcast(String message) {
        TextMessage textMessage = new TextMessage(message);
        sessions.values().forEach(session -> {
            try {
                if (session.isOpen()) session.sendMessage(textMessage);
            } catch (IOException e) { /* log error */ }
        });
    }

    public int getActiveConnections() {
        return (int) sessions.values().stream().filter(WebSocketSession::isOpen).count();
    }
}`,
      explanation: 'WebSocket handler with session tracking and broadcasting.',
      bestPractices: ['Use ConcurrentHashMap for sessions', 'Check session.isOpen() before sending'],
      commonMistakes: ['Not handling closed sessions', 'Memory leaks from uncleaned sessions'],
      java21Tips: ['Virtual threads scale well with many connections']
    })
  },

  STOMP_CONTROLLER: {
    name: 'STOMP Controller',
    description: 'STOMP messaging controller',
    generate: (className, packageName) => ({
      name: `${className} STOMP Controller`,
      fileName: `${className}StompController.java`,
      packagePath: `${packageName}.controller`,
      useCase: 'STOMP messaging controller with channels',
      code: `package ${packageName}.controller;

import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
public class ${className}StompController {

    private final SimpMessagingTemplate messagingTemplate;

    public ${className}StompController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat")
    @SendTo("/topic/messages")
    public ChatMessage handleChat(ChatMessage message) {
        return new ChatMessage(message.sender(), message.content(), LocalDateTime.now().toString());
    }

    @MessageMapping("/private")
    @SendToUser("/queue/private")
    public ChatMessage handlePrivate(ChatMessage message) {
        return message;
    }

    @MessageMapping("/room/{roomId}")
    public void handleRoom(@DestinationVariable String roomId, ChatMessage message) {
        messagingTemplate.convertAndSend("/topic/room/" + roomId, message);
    }

    public void sendToUser(String username, String destination, Object payload) {
        messagingTemplate.convertAndSendToUser(username, destination, payload);
    }

    public void broadcast(String destination, Object payload) {
        messagingTemplate.convertAndSend(destination, payload);
    }

    @MessageExceptionHandler
    @SendToUser("/queue/errors")
    public ErrorMessage handleException(Exception ex) {
        return new ErrorMessage(ex.getMessage(), LocalDateTime.now().toString());
    }
}

record ChatMessage(String sender, String content, String timestamp) {}
record ErrorMessage(String error, String timestamp) {}`,
      explanation: 'STOMP controller with public, private, and room channels.',
      bestPractices: ['Use @SendTo for broadcasts', 'Use @SendToUser for private messages'],
      commonMistakes: ['Wrong destination prefixes', 'Missing error handling'],
      java21Tips: ['Records for immutable message types']
    })
  }
};
