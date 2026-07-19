# ─────────────────────────────────────────────
#  Stage 1: Build the JAR
# ─────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy dependency manifest first for layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn package -DskipTests -B

# ─────────────────────────────────────────────
#  Stage 2: Run on a slim JRE image
# ─────────────────────────────────────────────
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Create a non-root user for security
RUN groupadd --system spring && useradd --system --gid spring spring

# Copy the fat JAR from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Directory for uploaded files (mounted as a volume)
RUN mkdir -p /app/uploads && chown -R spring:spring /app

USER spring

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
