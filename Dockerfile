# Root-level Dockerfile for Render deployment
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy backend files
COPY backend/pom.xml .
COPY backend/src ./src

# Build the application
RUN apt-get update && apt-get install -y maven
RUN mvn clean package -DskipTests

# Copy the built JAR
COPY backend/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Start the application
ENTRYPOINT ["java","-jar","app.jar"]