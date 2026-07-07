package com.dncehub.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.Map;

/**
 * Configures per-cache TTLs and JSON serialization for Redis.
 *
 * Uses a dedicated ObjectMapper (not the app's) with activateDefaultTyping so
 * Jackson embeds the concrete class name in JSON — required to reconstruct
 * typed objects (e.g. ArrayList<InstructorProfileResponse>) on cache reads.
 */
@Configuration
public class CacheConfig {

    public static final String CACHE_INSTRUCTORS = "instructors";
    public static final String CACHE_WORKSHOPS   = "workshops";

    @Value("${app.cache.instructors-ttl-seconds:300}")
    private long instructorsTtl;

    @Value("${app.cache.workshops-ttl-seconds:180}")
    private long workshopsTtl;

    @Value("${app.cache.single-item-ttl-seconds:600}")
    private long singleItemTtl;

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
        ObjectMapper cacheMapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                .activateDefaultTyping(
                        LaissezFaireSubTypeValidator.instance,
                        ObjectMapper.DefaultTyping.NON_FINAL,
                        JsonTypeInfo.As.PROPERTY);

        GenericJackson2JsonRedisSerializer serializer =
                new GenericJackson2JsonRedisSerializer(cacheMapper);

        RedisCacheConfiguration defaults = RedisCacheConfiguration.defaultCacheConfig()
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(serializer))
                .disableCachingNullValues();

        return RedisCacheManager.builder(factory)
                .cacheDefaults(defaults.entryTtl(Duration.ofSeconds(singleItemTtl)))
                .withInitialCacheConfigurations(Map.of(
                        CACHE_INSTRUCTORS, defaults.entryTtl(Duration.ofSeconds(instructorsTtl)),
                        CACHE_WORKSHOPS,   defaults.entryTtl(Duration.ofSeconds(workshopsTtl))
                ))
                .build();
    }
}
