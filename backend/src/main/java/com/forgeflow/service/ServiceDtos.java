package com.forgeflow.service;

import jakarta.validation.constraints.*;

public final class ServiceDtos {

    private ServiceDtos() {}

    public record CreateServiceRequest(
            @NotBlank @Size(min = 2, max = 100)
            @Pattern(regexp = "[a-z][a-z0-9-]*", message = "Service name must be lowercase alphanumeric with hyphens")
            String name,

            @Size(max = 1000) String description,

            @NotBlank @Pattern(regexp = "java|python|nodejs|go|dotnet", message = "Unsupported language")
            String language,

            String framework,
            String namespace,
            Integer port,
            Integer replicas
    ) {}

    public record ServiceResponse(
            Long id,
            String name,
            String description,
            String language,
            String framework,
            String ownerEmail,
            String githubRepoUrl,
            String githubRepoName,
            String dockerImage,
            String status,
            String namespace,
            int port,
            int replicas,
            String createdAt,
            String updatedAt
    ) {}

    public record ServiceSummaryResponse(
            Long id,
            String name,
            String language,
            String status,
            String githubRepoUrl,
            String createdAt
    ) {}
}
