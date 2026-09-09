# Runtime image using pre-compiled jar
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create non-root user and directories
RUN addgroup -S spring && adduser -S spring -G spring \
    && mkdir -p /app/uploads /app/invoices \
    && chown -R spring:spring /app

USER spring:spring

# Copy jar from target
COPY target/*.jar app.jar

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Run application
ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-Dspring.profiles.active=prod", \
  "-jar", \
  "app.jar"]
