package com.dncehub.config;

import com.dncehub.dto.response.ApiResponse;
import com.dncehub.exception.ErrorCode;
import com.dncehub.security.JwtAuthenticationFilter;
import com.dncehub.security.UserDetailsServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
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
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsServiceImpl userDetailsService;
    private final ObjectMapper objectMapper;
    private final Environment environment;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          UserDetailsServiceImpl userDetailsService,
                          ObjectMapper objectMapper,
                          Environment environment) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService;
        this.objectMapper = objectMapper;
        this.environment = environment;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(AbstractHttpConfigurer::disable)
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> {
                auth.requestMatchers("/api/v1/auth/**").permitAll();
                auth.requestMatchers(HttpMethod.GET, "/api/v1/health").permitAll();

                // Swagger is local-dev only (`mvn spring-boot:run` sets profile=dev).
                // Prod/docker have no such permit, so anonymous callers get 401.
                if (environment.acceptsProfiles(Profiles.of("dev"))) {
                    auth.requestMatchers(
                            "/swagger-ui/**",
                            "/swagger-ui.html",
                            "/v3/api-docs/**"
                    ).permitAll();
                }

                // Auth-required GETs — must be before the public GET wildcards
                auth.requestMatchers(HttpMethod.GET, "/api/v1/instructors/me").authenticated();
                auth.requestMatchers(HttpMethod.GET, "/api/v1/workshops/my").authenticated();
                auth.requestMatchers(HttpMethod.GET, "/api/v1/workshops/my-registrations").authenticated();
                auth.requestMatchers(HttpMethod.GET, "/api/v1/workshops/*/registrants").authenticated();
                auth.requestMatchers(HttpMethod.GET, "/api/v1/bookings/my/**").authenticated();

                // ROLE_INSTRUCTOR writes
                auth.requestMatchers(HttpMethod.POST, "/api/v1/workshops").hasRole("INSTRUCTOR");
                auth.requestMatchers(HttpMethod.PUT, "/api/v1/workshops/*").hasRole("INSTRUCTOR");
                auth.requestMatchers(HttpMethod.DELETE, "/api/v1/workshops/*").hasRole("INSTRUCTOR");
                auth.requestMatchers(HttpMethod.POST, "/api/v1/instructors").hasRole("INSTRUCTOR");
                auth.requestMatchers(HttpMethod.PUT, "/api/v1/instructors/me").hasRole("INSTRUCTOR");
                auth.requestMatchers(HttpMethod.DELETE, "/api/v1/instructors/me").hasRole("INSTRUCTOR");
                auth.requestMatchers(HttpMethod.PUT, "/api/v1/instructors/*").hasRole("INSTRUCTOR");
                auth.requestMatchers(HttpMethod.DELETE, "/api/v1/instructors/*").hasRole("INSTRUCTOR");
                auth.requestMatchers(HttpMethod.POST, "/api/v1/instructors/*/availability").hasRole("INSTRUCTOR");
                auth.requestMatchers(HttpMethod.PUT, "/api/v1/instructors/*/availability/*").hasRole("INSTRUCTOR");
                auth.requestMatchers(HttpMethod.DELETE, "/api/v1/instructors/*/availability/*").hasRole("INSTRUCTOR");
                auth.requestMatchers(HttpMethod.PATCH, "/api/v1/bookings/*/confirm").hasRole("INSTRUCTOR");
                auth.requestMatchers(HttpMethod.PATCH, "/api/v1/bookings/*/complete").hasRole("INSTRUCTOR");

                // ROLE_STUDENT writes
                auth.requestMatchers(HttpMethod.POST, "/api/v1/bookings").hasRole("STUDENT");
                auth.requestMatchers(HttpMethod.PATCH, "/api/v1/bookings/*/pay").hasRole("STUDENT");
                auth.requestMatchers(HttpMethod.POST, "/api/v1/workshops/*/register").hasRole("STUDENT");
                auth.requestMatchers(HttpMethod.DELETE, "/api/v1/workshops/*/register").hasRole("STUDENT");
                auth.requestMatchers(HttpMethod.PATCH, "/api/v1/workshops/*/pay-registration").hasRole("STUDENT");
                auth.requestMatchers("/api/v1/students/**").hasRole("STUDENT");

                // Public catalogue GETs
                auth.requestMatchers(HttpMethod.GET, "/api/v1/instructors/**").permitAll();
                auth.requestMatchers(HttpMethod.GET, "/api/v1/workshops/**").permitAll();

                auth.anyRequest().authenticated();
            })
            .exceptionHandling(ex -> ex
                .accessDeniedHandler((request, response, denied) -> {
                    response.setStatus(ErrorCode.ACCESS_DENIED.getStatus().value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    objectMapper.writeValue(response.getOutputStream(),
                            ApiResponse.error(ErrorCode.ACCESS_DENIED.getMessage()));
                })
            )
            .addFilterBefore(jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
