package com.forgeflow.service;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/services")
public class ServiceController {
    private final ServiceService serviceService;
    public ServiceController(ServiceService serviceService) { this.serviceService = serviceService; }

    @GetMapping public List<ServiceDtos.ServiceResponse> list(Authentication auth) { return serviceService.findAll(auth.getName()); }

    @PostMapping
    public ResponseEntity<ServiceDtos.ServiceResponse> create(@Valid @RequestBody ServiceDtos.CreateServiceRequest request,
            Authentication auth) {
        ServiceDtos.ServiceResponse response = serviceService.create(request, auth.getName());
        return ResponseEntity.created(URI.create("/api/services/" + response.id())).body(response);
    }

    @GetMapping("/{id}") public ServiceDtos.ServiceResponse get(@PathVariable UUID id, Authentication auth) { return serviceService.findById(id, auth.getName()); }

    @PutMapping("/{id}")
    public ServiceDtos.ServiceResponse update(@PathVariable UUID id, @Valid @RequestBody ServiceDtos.UpdateServiceRequest request,
            Authentication auth) { return serviceService.update(id, request, auth.getName()); }

    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable UUID id, Authentication auth) {
        serviceService.delete(id, auth.getName()); return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/deploy") public ServiceDtos.DeploymentResponse deploy(@PathVariable UUID id, Authentication auth) {
        serviceService.findById(id, auth.getName());
        return new ServiceDtos.DeploymentResponse("Deployment provisioning is not configured yet");
    }

    @GetMapping("/{id}/deployments") public List<ServiceDtos.DeploymentResponse> deployments(@PathVariable UUID id, Authentication auth) {
        serviceService.findById(id, auth.getName()); return List.of();
    }
}
