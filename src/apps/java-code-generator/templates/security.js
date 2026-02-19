// Security Templates

export const securityTemplates = {
  SECURITY_CONFIG: {
    name: 'Security Config',
    description: 'Spring Security configuration',
    generate: (className, packageName) => ({
      name: 'Security Configuration',
      fileName: 'SecurityConfig.java',
      packagePath: `${packageName}.config`,
      useCase: 'Spring Security configuration with JWT',
      code: `package ${packageName}.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/api/public/**").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}`,
      explanation: 'Spring Security with JWT and stateless sessions.',
      bestPractices: ['Use stateless sessions for APIs', 'Use BCrypt for passwords'],
      commonMistakes: ['Enabling CSRF for stateless APIs', 'Weak password encoders'],
      java21Tips: ['Use records for security DTOs']
    })
  },

  JWT_SERVICE: {
    name: 'JWT Service',
    description: 'JWT token generation/validation',
    generate: (className, packageName) => ({
      name: 'JWT Service',
      fileName: 'JwtService.java',
      packagePath: `${packageName}.security`,
      useCase: 'JWT token generation and validation',
      code: `package ${packageName}.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("\${jwt.secret:your-256-bit-secret-key-here-must-be-at-least-32-chars}")
    private String secretKey;

    @Value("\${jwt.expiration:86400000}") // 24 hours
    private long jwtExpiration;

    @Value("\${jwt.refresh-expiration:604800000}") // 7 days
    private long refreshExpiration;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(extractAllClaims(token));
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return buildToken(extraClaims, userDetails, jwtExpiration);
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return buildToken(new HashMap<>(), userDetails, refreshExpiration);
    }

    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, long expiration) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        return extractUsername(token).equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }
}`,
      explanation: 'JWT service for token generation and validation.',
      bestPractices: ['Use strong secret keys', 'Store secrets in environment variables'],
      commonMistakes: ['Weak or hardcoded secrets', 'No token expiration'],
      java21Tips: ['Records for token responses']
    })
  },

  AUTH_CONTROLLER: {
    name: 'Auth Controller',
    description: 'Authentication endpoints',
    generate: (className, packageName) => ({
      name: 'Auth Controller',
      fileName: 'AuthController.java',
      packagePath: `${packageName}.controller`,
      useCase: 'Authentication endpoints for register, login, refresh',
      code: `package ${packageName}.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authManager, JwtService jwtService,
                          UserService userService, PasswordEncoder passwordEncoder) {
        this.authManager = authManager;
        this.jwtService = jwtService;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (userService.existsByEmail(request.email())) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Email already registered", null, null));
        }

        var user = userService.createUser(request.name(), request.email(), passwordEncoder.encode(request.password()));
        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return ResponseEntity.ok(new AuthResponse(true, "Registration successful", accessToken, refreshToken));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            var auth = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));

            UserDetails user = (UserDetails) auth.getPrincipal();
            return ResponseEntity.ok(new AuthResponse(true, "Login successful",
                    jwtService.generateToken(user), jwtService.generateRefreshToken(user)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Invalid credentials", null, null));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshRequest request) {
        try {
            String username = jwtService.extractUsername(request.refreshToken());
            UserDetails user = userService.loadUserByUsername(username);

            if (jwtService.isTokenValid(request.refreshToken(), user)) {
                return ResponseEntity.ok(new AuthResponse(true, "Token refreshed",
                        jwtService.generateToken(user), request.refreshToken()));
            }
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Invalid token", null, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Invalid token", null, null));
        }
    }
}

record RegisterRequest(
        @NotBlank String name,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8) String password
) {}

record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}
record RefreshRequest(String refreshToken) {}
record AuthResponse(boolean success, String message, String accessToken, String refreshToken) {}

interface JwtService {
    String generateToken(UserDetails user);
    String generateRefreshToken(UserDetails user);
    String extractUsername(String token);
    boolean isTokenValid(String token, UserDetails user);
}

interface UserService extends org.springframework.security.core.userdetails.UserDetailsService {
    boolean existsByEmail(String email);
    UserDetails createUser(String name, String email, String encodedPassword);
}`,
      explanation: 'Authentication controller with register, login, and refresh.',
      bestPractices: ['Validate all inputs', 'Use BCrypt for passwords'],
      commonMistakes: ['Returning detailed errors', 'Not validating input'],
      java21Tips: ['Use records for DTOs with validation']
    })
  }
};
