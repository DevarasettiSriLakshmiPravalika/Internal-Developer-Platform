FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline
COPY src src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /workspace/target/forgeflow-api-*.jar app.jar
EXPOSE 8090
USER 10001
ENTRYPOINT ["java", "-jar", "/app/app.jar"]