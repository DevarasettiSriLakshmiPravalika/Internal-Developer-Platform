package com.forgeflow.github;

import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.forgeflow.service.ServiceDtos;
import com.forgeflow.service.ServiceService;

@RestController
@RequestMapping("/api/repositories")
public class RepositoryController {
    private final GitHubService gitHubService;
    private final ServiceService serviceService;

    public RepositoryController(GitHubService gitHubService, ServiceService serviceService) {
        this.gitHubService = gitHubService;
        this.serviceService = serviceService;
    }

    @GetMapping public GitHubDtos.IntegrationResponse list() { return gitHubService.getRepositories(); }

    @PostMapping("/services/{serviceId}")
    public GitHubDtos.RepositoryResponse createForService(@PathVariable UUID serviceId, Authentication auth) {
        ServiceDtos.ServiceResponse service = serviceService.findById(serviceId, auth.getName());
        return gitHubService.createRepository(service.serviceName(), service.description());
    }
}
