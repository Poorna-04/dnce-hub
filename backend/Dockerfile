# Stage 1 — build
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

# Stage 2 — run
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN apk add --no-cache wget
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
# Heap tracks the cgroup limit (Cloud Run --memory=512Mi → ~384MB heap).
# JAVA_TOOL_OPTIONS is picked up automatically; override at deploy if needed.
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=25.0"
ENTRYPOINT ["java", "-jar", "app.jar"]

