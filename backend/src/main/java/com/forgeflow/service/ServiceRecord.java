package com.forgeflow.service;

import java.time.Instant;
import java.util.UUID;

record ServiceRecord(UUID id, String serviceName, String description, String language, String framework, int port,
        String ownerEmail, Instant createdAt, Instant updatedAt) {
    ServiceDtos.ServiceResponse response() {
        return new ServiceDtos.ServiceResponse(id, serviceName, description, language, framework, port, ownerEmail,
                "REGISTERED", createdAt, updatedAt);
    }

    ServiceRecord update(ServiceDtos.UpdateServiceRequest request) {
        return new ServiceRecord(id, serviceName, request.description().trim(), request.language(),
                request.framework().trim(), request.port(), ownerEmail, createdAt, Instant.now());
    }
}
