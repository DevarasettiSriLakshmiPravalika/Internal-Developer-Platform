package com.forgeflow.deployment;

import com.forgeflow.service.ServiceEntity;
import com.forgeflow.service.ServiceRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/deployments")
@Transactional(readOnly = true)
public class DeploymentController {

    private final DeploymentRepository deploymentRepository;
    private final ServiceRepository serviceRepository;

    public DeploymentController(DeploymentRepository deploymentRepository, ServiceRepository serviceRepository) {
        this.deploymentRepository = deploymentRepository;
        this.serviceRepository = serviceRepository;
    }

    @GetMapping
    public Page<DeploymentDto> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long serviceId) {
        PageRequest pr = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Deployment> results = (serviceId != null)
                ? deploymentRepository.findByServiceId(serviceId, pr)
                : deploymentRepository.findAll(pr);
        return results.map(this::toDto);
    }

    @GetMapping("/{id}")
    public DeploymentDto get(@PathVariable Long id) {
        return toDto(deploymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deployment not found")));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<DeploymentDto> create(@Valid @RequestBody CreateDeploymentRequest request, Authentication auth) {
        ServiceEntity service = serviceRepository.findById(request.serviceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found"));
        Deployment deployment = new Deployment(service, request.version(), request.environment(), auth.getName());
        deployment.setImageTag(request.imageTag());
        deployment.setNotes(request.notes());
        Deployment saved = deploymentRepository.save(deployment);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(saved));
    }

    @PatchMapping("/{id}/status")
    @Transactional
    public DeploymentDto updateStatus(@PathVariable Long id, @RequestBody UpdateStatusRequest request) {
        Deployment deployment = deploymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deployment not found"));
        deployment.setStatus(Deployment.DeploymentStatus.valueOf(request.status()));
        if (request.argocdAppUrl() != null) deployment.setArgocdAppUrl(request.argocdAppUrl());
        return toDto(deploymentRepository.save(deployment));
    }

    private DeploymentDto toDto(Deployment d) {
        return new DeploymentDto(d.getId(), d.getService().getId(), d.getService().getName(),
                d.getVersion(), d.getEnvironment(), d.getStatus().name(),
                d.getImageTag(), d.getDeployedBy(), d.getArgocdAppUrl(), d.getNotes(),
                d.getCreatedAt().toString(), d.getUpdatedAt().toString());
    }

    public record DeploymentDto(Long id, Long serviceId, String serviceName, String version,
                                String environment, String status, String imageTag, String deployedBy,
                                String argocdAppUrl, String notes, String createdAt, String updatedAt) {}

    public record CreateDeploymentRequest(
            @jakarta.validation.constraints.NotNull Long serviceId,
            @NotBlank String version,
            String environment,
            String imageTag,
            String notes) {}

    public record UpdateStatusRequest(String status, String argocdAppUrl) {}
}
