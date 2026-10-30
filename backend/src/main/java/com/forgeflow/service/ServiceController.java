package com.forgeflow.service;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private final ServiceProvisioningService provisioningService;

    public ServiceController(ServiceProvisioningService provisioningService) {
        this.provisioningService = provisioningService;
    }

    @PostMapping
    public ResponseEntity<ServiceDtos.ServiceResponse> create(
            @Valid @RequestBody ServiceDtos.CreateServiceRequest request,
            Authentication auth) {
        ServiceDtos.ServiceResponse response = provisioningService.provision(request, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public Page<ServiceDtos.ServiceResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return provisioningService.list(PageRequest.of(page, Math.min(size, 100),
                Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    @GetMapping("/{id}")
    public ServiceDtos.ServiceResponse get(@PathVariable Long id) {
        return provisioningService.getById(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication auth) {
        provisioningService.deleteService(id, auth.getName());
    }
}
