package com.forgeflow.service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ServiceService {
    private final Map<UUID, ServiceRecord> services = new ConcurrentHashMap<>();

    public List<ServiceDtos.ServiceResponse> findAll(String ownerEmail) {
        return services.values().stream().filter(item -> item.ownerEmail().equals(ownerEmail))
                .sorted(Comparator.comparing(ServiceRecord::createdAt).reversed()).map(ServiceRecord::response).toList();
    }

    public ServiceDtos.ServiceResponse findById(UUID id, String ownerEmail) { return findOwned(id, ownerEmail).response(); }

    public ServiceDtos.ServiceResponse create(ServiceDtos.CreateServiceRequest request, String ownerEmail) {
        boolean duplicate = services.values().stream().anyMatch(item -> item.ownerEmail().equals(ownerEmail)
                && item.serviceName().equals(request.serviceName()));
        if (duplicate) throw new ResponseStatusException(HttpStatus.CONFLICT, "A service with this name already exists");
        Instant now = Instant.now();
        ServiceRecord service = new ServiceRecord(UUID.randomUUID(), request.serviceName(),
                request.description() == null ? "" : request.description().trim(), request.language(),
                request.framework().trim(), request.port(), ownerEmail, now, now);
        services.put(service.id(), service);
        return service.response();
    }

    public ServiceDtos.ServiceResponse update(UUID id, ServiceDtos.UpdateServiceRequest request, String ownerEmail) {
        ServiceRecord updated = findOwned(id, ownerEmail).update(request);
        services.put(id, updated);
        return updated.response();
    }

    public void delete(UUID id, String ownerEmail) { services.remove(findOwned(id, ownerEmail).id()); }

    private ServiceRecord findOwned(UUID id, String ownerEmail) {
        ServiceRecord service = services.get(id);
        if (service == null || !service.ownerEmail().equals(ownerEmail)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found");
        }
        return service;
    }
}
