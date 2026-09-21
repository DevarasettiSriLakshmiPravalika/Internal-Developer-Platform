package com.forgeflow.template;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import com.forgeflow.service.ServiceDtos;

@Service
public class TemplateService {
    public TemplateDtos.TemplateResponse generate(ServiceDtos.ServiceResponse service) {
        List<TemplateDtos.GeneratedFile> files = switch (service.language()) {
            case "spring-boot" -> springBootFiles(service);
            case "node" -> nodeFiles(service);
            case "python" -> pythonFiles(service);
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported template language");
        };
        return new TemplateDtos.TemplateResponse(service.serviceName(), service.language(), files);
    }

    private List<TemplateDtos.GeneratedFile> springBootFiles(ServiceDtos.ServiceResponse service) {
        return List.of(
                new TemplateDtos.GeneratedFile("Dockerfile", """
                        FROM eclipse-temurin:21-jdk AS build
                        WORKDIR /workspace
                        COPY . .
                        RUN ./mvnw -q -DskipTests package
                        FROM eclipse-temurin:21-jre
                        WORKDIR /app
                        COPY --from=build /workspace/target/*.jar app.jar
                        USER 10001
                        EXPOSE %d
                        ENTRYPOINT [\"java\", \"-jar\", \"/app/app.jar\"]
                        """.formatted(service.port())),
                new TemplateDtos.GeneratedFile("src/main/resources/application.yml", """
                        server:
                          port: ${PORT:%d}
                        spring:
                          application:
                            name: %s
                        """.formatted(service.port(), service.serviceName())),
                new TemplateDtos.GeneratedFile(".dockerignore", """
                        target/
                        .git/
                        .env
                        """));
    }

    private List<TemplateDtos.GeneratedFile> nodeFiles(ServiceDtos.ServiceResponse service) {
        return List.of(
                new TemplateDtos.GeneratedFile("Dockerfile", """
                        FROM node:22-alpine
                        WORKDIR /app
                        COPY package*.json ./
                        RUN npm ci --omit=dev
                        COPY . .
                        USER node
                        EXPOSE %d
                        CMD [\"npm\", \"start\"]
                        """.formatted(service.port())),
                new TemplateDtos.GeneratedFile(".dockerignore", """
                        node_modules/
                        .git/
                        .env
                        """));
    }

    private List<TemplateDtos.GeneratedFile> pythonFiles(ServiceDtos.ServiceResponse service) {
        return List.of(
                new TemplateDtos.GeneratedFile("Dockerfile", """
                        FROM python:3.12-slim
                        WORKDIR /app
                        COPY requirements.txt .
                        RUN pip install --no-cache-dir -r requirements.txt
                        COPY . .
                        RUN useradd --create-home appuser
                        USER appuser
                        EXPOSE %d
                        CMD [\"python\", \"app.py\"]
                        """.formatted(service.port())),
                new TemplateDtos.GeneratedFile(".dockerignore", """
                        __pycache__/
                        .git/
                        .env
                        """));
    }
}
