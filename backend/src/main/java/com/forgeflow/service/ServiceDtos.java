package com.forgeflow.service;

import java.time.Instant;
import java.util.UUID;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class ServiceDtos {
    private ServiceDtos() { }

    public record CreateServiceRequest(
            @NotBlank @Pattern(regexp = "[a-z0-9]([a-z0-9-]*[a-z0-9])?", message = "Service name must use lowercase letters, numbers, and hyphens") @Size(max = 50) String serviceName,
            @Size(max = 500) String description,
            @NotBlank @Pattern(regexp = "spring-boot|node|python", message = "Language must be spring-boot, node, or python") String language,
            @NotBlank @Size(max = 80) String framework,
            @Min(1) @Max(65535) int port) { }

    public record UpdateServiceRequest(
            @NotBlank @Size(max = 500) String description,
            @NotBlank @Pattern(regexp = "spring-boot|node|python", message = "Language must be spring-boot, node, or python") String language,
            @NotBlank @Size(max = 80) String framework,
            @Min(1) @Max(65535) int port) { }

    public record ServiceResponse(UUID id, String serviceName, String description, String language, String framework,
            int port, String ownerEmail, String status, Instant createdAt, Instant updatedAt) { }

    public record DeploymentResponse(String message) { }
}
