import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Shield, Plus, Trash2 } from 'lucide-react';

interface SecurityRule {
  id: string;
  pattern: string;
  methods: string[];
  access: 'permitAll' | 'authenticated' | 'hasRole' | 'hasAuthority';
  roles?: string[];
}

interface CorsConfig {
  enabled: boolean;
  origins: string[];
  methods: string[];
  headers: string[];
  credentials: boolean;
}

export default function SpringSecurityBuilder() {
  const [authType, setAuthType] = useState<'jwt' | 'session' | 'oauth2' | 'basic'>('jwt');
  const [csrfEnabled, setCsrfEnabled] = useState(false);
  const [cors, setCors] = useState<CorsConfig>({
    enabled: true,
    origins: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    headers: ['*'],
    credentials: true,
  });
  const [rules, setRules] = useState<SecurityRule[]>([
    { id: '1', pattern: '/api/auth/**', methods: ['POST'], access: 'permitAll' },
    { id: '2', pattern: '/api/public/**', methods: ['GET'], access: 'permitAll' },
    { id: '3', pattern: '/api/admin/**', methods: ['*'], access: 'hasRole', roles: ['ADMIN'] },
    { id: '4', pattern: '/api/**', methods: ['*'], access: 'authenticated' },
  ]);
  const [jwtSecret, setJwtSecret] = useState('your-256-bit-secret-key-here');
  const [jwtExpiration, setJwtExpiration] = useState('86400000');
  const [copied, setCopied] = useState<string | null>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const generateSecurityConfig = (): string => {
    const lines: string[] = [];

    lines.push('package com.example.config;');
    lines.push('');
    lines.push('import org.springframework.context.annotation.Bean;');
    lines.push('import org.springframework.context.annotation.Configuration;');
    lines.push('import org.springframework.security.config.annotation.web.builders.HttpSecurity;');
    lines.push('import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;');
    lines.push('import org.springframework.security.config.http.SessionCreationPolicy;');
    lines.push('import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;');
    lines.push('import org.springframework.security.crypto.password.PasswordEncoder;');
    lines.push('import org.springframework.security.web.SecurityFilterChain;');

    if (authType === 'jwt') {
      lines.push('import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;');
    }

    if (cors.enabled) {
      lines.push('import org.springframework.web.cors.CorsConfiguration;');
      lines.push('import org.springframework.web.cors.CorsConfigurationSource;');
      lines.push('import org.springframework.web.cors.UrlBasedCorsConfigurationSource;');
      lines.push('import java.util.Arrays;');
    }

    lines.push('');
    lines.push('@Configuration');
    lines.push('@EnableWebSecurity');
    lines.push('public class SecurityConfig {');
    lines.push('');

    if (authType === 'jwt') {
      lines.push('    private final JwtAuthenticationFilter jwtAuthFilter;');
      lines.push('');
      lines.push('    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {');
      lines.push('        this.jwtAuthFilter = jwtAuthFilter;');
      lines.push('    }');
      lines.push('');
    }

    lines.push('    @Bean');
    lines.push('    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {');
    lines.push('        http');

    if (cors.enabled) {
      lines.push('            .cors(cors -> cors.configurationSource(corsConfigurationSource()))');
    }

    if (!csrfEnabled) {
      lines.push('            .csrf(csrf -> csrf.disable())');
    }

    if (authType === 'jwt') {
      lines.push('            .sessionManagement(session -> session');
      lines.push('                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))');
    }

    lines.push('            .authorizeHttpRequests(auth -> auth');

    rules.forEach((rule) => {
      const methodMatcher = rule.methods.includes('*')
        ? ''
        : rule.methods.map(m => `HttpMethod.${m}`).join(', ');

      let accessExpr = '';
      switch (rule.access) {
        case 'permitAll':
          accessExpr = 'permitAll()';
          break;
        case 'authenticated':
          accessExpr = 'authenticated()';
          break;
        case 'hasRole':
          accessExpr = `hasAnyRole(${rule.roles?.map(r => `"${r}"`).join(', ')})`;
          break;
        case 'hasAuthority':
          accessExpr = `hasAnyAuthority(${rule.roles?.map(r => `"${r}"`).join(', ')})`;
          break;
      }

      if (methodMatcher) {
        lines.push(`                .requestMatchers(${methodMatcher}, "${rule.pattern}").${accessExpr}`);
      } else {
        lines.push(`                .requestMatchers("${rule.pattern}").${accessExpr}`);
      }
    });

    lines.push('                .anyRequest().authenticated()');
    lines.push('            )');

    if (authType === 'jwt') {
      lines.push('            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)');
    } else if (authType === 'basic') {
      lines.push('            .httpBasic(Customizer.withDefaults())');
    } else if (authType === 'oauth2') {
      lines.push('            .oauth2Login(Customizer.withDefaults())');
      lines.push('            .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))');
    }

    lines.push('        ;');
    lines.push('');
    lines.push('        return http.build();');
    lines.push('    }');
    lines.push('');

    lines.push('    @Bean');
    lines.push('    public PasswordEncoder passwordEncoder() {');
    lines.push('        return new BCryptPasswordEncoder();');
    lines.push('    }');

    if (cors.enabled) {
      lines.push('');
      lines.push('    @Bean');
      lines.push('    public CorsConfigurationSource corsConfigurationSource() {');
      lines.push('        CorsConfiguration configuration = new CorsConfiguration();');
      lines.push(`        configuration.setAllowedOrigins(Arrays.asList(${cors.origins.map(o => `"${o}"`).join(', ')}));`);
      lines.push(`        configuration.setAllowedMethods(Arrays.asList(${cors.methods.map(m => `"${m}"`).join(', ')}));`);
      lines.push(`        configuration.setAllowedHeaders(Arrays.asList(${cors.headers.map(h => `"${h}"`).join(', ')}));`);
      lines.push(`        configuration.setAllowCredentials(${cors.credentials});`);
      lines.push('        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();');
      lines.push('        source.registerCorsConfiguration("/**", configuration);');
      lines.push('        return source;');
      lines.push('    }');
    }

    lines.push('}');

    return lines.join('\n');
  };

  const generateJwtFilter = (): string => {
    if (authType !== 'jwt') return '';

    return `package com.example.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        username = jwtService.extractUsername(jwt);

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}`;
  };

  const generateApplicationYml = (): string => {
    const lines: string[] = [];
    lines.push('spring:');
    lines.push('  security:');

    if (authType === 'jwt') {
      lines.push('');
      lines.push('# JWT Configuration (custom properties)');
      lines.push('jwt:');
      lines.push(`  secret: ${jwtSecret}`);
      lines.push(`  expiration: ${jwtExpiration}`);
    } else if (authType === 'oauth2') {
      lines.push('    oauth2:');
      lines.push('      client:');
      lines.push('        registration:');
      lines.push('          google:');
      lines.push('            client-id: your-client-id');
      lines.push('            client-secret: your-client-secret');
      lines.push('            scope: openid, profile, email');
    }

    return lines.join('\n');
  };

  const addRule = () => {
    setRules([...rules, { id: generateId(), pattern: '/api/**', methods: ['GET'], access: 'authenticated' }]);
  };

  const updateRule = (id: string, updates: Partial<SecurityRule>) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const removeRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-green-400" />
              Spring Security Config Builder
            </h1>
            <p className="text-gray-400 text-sm">Generate Spring Security 6 configurations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Builder */}
          <div className="space-y-4">
            {/* Auth Type */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Authentication Type</h3>
              <div className="flex flex-wrap gap-2">
                {(['jwt', 'session', 'oauth2', 'basic'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setAuthType(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium uppercase ${
                      authType === type
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* JWT Config */}
            {authType === 'jwt' && (
              <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                <h3 className="text-sm font-medium text-gray-300 mb-3">JWT Configuration</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Secret Key</label>
                    <input
                      type="text"
                      value={jwtSecret}
                      onChange={(e) => setJwtSecret(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Expiration (ms)</label>
                    <input
                      type="text"
                      value={jwtExpiration}
                      onChange={(e) => setJwtExpiration(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Options */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Security Options</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={csrfEnabled}
                    onChange={(e) => setCsrfEnabled(e.target.checked)}
                    className="accent-green-500"
                  />
                  <span className="text-sm text-gray-400">Enable CSRF Protection</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={cors.enabled}
                    onChange={(e) => setCors({ ...cors, enabled: e.target.checked })}
                    className="accent-green-500"
                  />
                  <span className="text-sm text-gray-400">Enable CORS</span>
                </label>
                {cors.enabled && (
                  <div className="ml-6 space-y-2">
                    <input
                      type="text"
                      value={cors.origins.join(', ')}
                      onChange={(e) => setCors({ ...cors, origins: e.target.value.split(',').map((s) => s.trim()) })}
                      className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs"
                      placeholder="Allowed origins (comma-separated)"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Security Rules */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">Authorization Rules</h3>
                <button
                  onClick={addRule}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs"
                >
                  <Plus className="w-3 h-3" /> Add Rule
                </button>
              </div>
              <div className="space-y-2">
                {rules.map((rule) => (
                  <div key={rule.id} className="p-3 bg-gray-800 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={rule.pattern}
                        onChange={(e) => updateRule(rule.id, { pattern: e.target.value })}
                        className="flex-1 px-2 py-1.5 bg-gray-900 border border-gray-700 rounded text-sm font-mono"
                        placeholder="/api/**"
                      />
                      <select
                        value={rule.access}
                        onChange={(e) => updateRule(rule.id, { access: e.target.value as SecurityRule['access'] })}
                        className="px-2 py-1.5 bg-gray-900 border border-gray-700 rounded text-sm"
                      >
                        <option value="permitAll">Permit All</option>
                        <option value="authenticated">Authenticated</option>
                        <option value="hasRole">Has Role</option>
                        <option value="hasAuthority">Has Authority</option>
                      </select>
                      <button
                        onClick={() => removeRule(rule.id)}
                        className="p-1.5 hover:bg-gray-700 rounded text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {(rule.access === 'hasRole' || rule.access === 'hasAuthority') && (
                      <input
                        type="text"
                        value={rule.roles?.join(', ') || ''}
                        onChange={(e) =>
                          updateRule(rule.id, { roles: e.target.value.split(',').map((s) => s.trim()) })
                        }
                        className="w-full px-2 py-1.5 bg-gray-900 border border-gray-700 rounded text-xs"
                        placeholder="ADMIN, USER"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="space-y-4">
            {/* Security Config */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">SecurityConfig.java</h3>
                <button
                  onClick={() => copyToClipboard(generateSecurityConfig(), 'config')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
                >
                  {copied === 'config' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="p-4 bg-gray-950 rounded-lg text-xs font-mono text-green-400 overflow-x-auto max-h-96 overflow-y-auto whitespace-pre">
                {generateSecurityConfig()}
              </pre>
            </div>

            {/* JWT Filter */}
            {authType === 'jwt' && (
              <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-300">JwtAuthenticationFilter.java</h3>
                  <button
                    onClick={() => copyToClipboard(generateJwtFilter(), 'filter')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
                  >
                    {copied === 'filter' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <pre className="p-4 bg-gray-950 rounded-lg text-xs font-mono text-green-400 overflow-x-auto max-h-64 overflow-y-auto whitespace-pre">
                  {generateJwtFilter()}
                </pre>
              </div>
            )}

            {/* Application YML */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">application.yml</h3>
                <button
                  onClick={() => copyToClipboard(generateApplicationYml(), 'yml')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
                >
                  {copied === 'yml' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="p-4 bg-gray-950 rounded-lg text-xs font-mono text-green-400 overflow-x-auto whitespace-pre">
                {generateApplicationYml()}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
