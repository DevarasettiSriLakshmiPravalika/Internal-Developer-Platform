package com.forgeflow.service;

import com.forgeflow.audit.AuditService;
import com.forgeflow.deployment.Deployment;
import com.forgeflow.deployment.DeploymentRepository;
import com.forgeflow.github.GitHubService;
import com.forgeflow.pipeline.PipelineRun;
import com.forgeflow.pipeline.PipelineRunRepository;
import com.forgeflow.template.TemplateEngine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

/**
 * Central orchestrator: creates a service record, provisions the GitHub repo,
 * generates all artifacts, and triggers a pipeline run.
 */
@Service
@Transactional
public class ServiceProvisioningService {

    private static final Logger log = LoggerFactory.getLogger(ServiceProvisioningService.class);

    private final ServiceRepository serviceRepository;
    private final DeploymentRepository deploymentRepository;
    private final PipelineRunRepository pipelineRunRepository;
    private final TemplateEngine templateEngine;
    private final GitHubService gitHubService;
    private final AuditService auditService;

    @Value("${integrations.dockerhub.username:forgeflow}")
    private String dockerHubUsername;

    @Value("${integrations.github.org:}")
    private String githubOrg;

    public ServiceProvisioningService(
            ServiceRepository serviceRepository,
            DeploymentRepository deploymentRepository,
            PipelineRunRepository pipelineRunRepository,
            TemplateEngine templateEngine,
            GitHubService gitHubService,
            AuditService auditService) {
        this.serviceRepository = serviceRepository;
        this.deploymentRepository = deploymentRepository;
        this.pipelineRunRepository = pipelineRunRepository;
        this.templateEngine = templateEngine;
        this.gitHubService = gitHubService;
        this.auditService = auditService;
    }

    /**
     * Create a service record and start async provisioning.
     */
    public ServiceDtos.ServiceResponse provision(ServiceDtos.CreateServiceRequest request, String ownerEmail) {
        if (serviceRepository.existsByName(request.name())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A service named '" + request.name() + "' already exists");
        }

        String namespace = request.namespace() != null ? request.namespace() : "default";
        int port = request.port() != null ? request.port() : 8080;
        int replicas = request.replicas() != null ? request.replicas() : 2;

        ServiceEntity entity = new ServiceEntity(
                request.name(), request.description(), request.language(),
                request.framework(), ownerEmail, namespace, port, replicas);
        entity = serviceRepository.save(entity);

        auditService.log(ownerEmail, "SERVICE_CREATED", "service", entity.getName(),
                "Created service: " + entity.getName() + " (" + entity.getLanguage() + ")");

        // Kick off async provisioning
        provisionAsync(entity.getId(), ownerEmail);

        return toResponse(entity);
    }

    @Async
    public void provisionAsync(Long serviceId, String ownerEmail) {
        ServiceEntity entity = serviceRepository.findById(serviceId).orElseThrow();
        entity.setStatus(ServiceEntity.ServiceStatus.PROVISIONING);
        serviceRepository.save(entity);

        try {
            String repoName = entity.getName();
            String repoFullName;

            // 1. Create GitHub repository
            String repoUrl = gitHubService.createRepository(repoName, entity.getDescription(), true);
            if (repoUrl != null) {
                entity.setGithubRepoUrl(repoUrl);
                repoFullName = (githubOrg != null && !githubOrg.isBlank() ? githubOrg : "forgeflow") + "/" + repoName;
                entity.setGithubRepoName(repoFullName);
            } else {
                repoFullName = "forgeflow/" + repoName;
                entity.setGithubRepoName(repoFullName);
            }

            String dockerImage = dockerHubUsername + "/" + repoName;
            entity.setDockerImage(dockerImage);
            serviceRepository.save(entity);

            // 2. Generate and push artifacts
            if (gitHubService.isConfigured()) {
                pushGeneratedFiles(entity, repoFullName, dockerImage, ownerEmail);
            }

            // 3. Create a pipeline run record
            PipelineRun run = new PipelineRun(entity, UUID.randomUUID().toString().substring(0, 8));
            run.setStage("PROVISION");
            run.setDockerImageTag(dockerImage + ":latest");
            pipelineRunRepository.save(run);

            // 4. Mark service as ACTIVE
            entity.setStatus(ServiceEntity.ServiceStatus.ACTIVE);
            serviceRepository.save(entity);

            // 5. Create initial deployment record
            Deployment deployment = new Deployment(entity, "1.0.0", "production", ownerEmail);
            deployment.setStatus(Deployment.DeploymentStatus.RUNNING);
            deployment.setImageTag(dockerImage + ":latest");
            deploymentRepository.save(deployment);

            auditService.log(ownerEmail, "SERVICE_PROVISIONED", "service", entity.getName(),
                    "Service provisioned successfully; repo=" + entity.getGithubRepoUrl());

            log.info("Service '{}' provisioned successfully", entity.getName());
        } catch (Exception e) {
            log.error("Provisioning failed for service {}: {}", serviceId, e.getMessage(), e);
            entity.setStatus(ServiceEntity.ServiceStatus.FAILED);
            serviceRepository.save(entity);
            auditService.log(ownerEmail, "SERVICE_PROVISION_FAILED", "service", entity.getName(), e.getMessage());
        }
    }

    private void pushGeneratedFiles(ServiceEntity entity, String repoFullName, String dockerImage, String ownerEmail) {
        String name = entity.getName();
        int port = entity.getPort();
        int replicas = entity.getReplicas();

        // Dockerfile
        gitHubService.pushFile(repoFullName, "Dockerfile",
                templateEngine.generateDockerfile(entity.getLanguage(), entity.getFramework(), port),
                "chore: add Dockerfile (generated by ForgeFlow)");

        // Kubernetes manifests
        String k8sDeployment = templateEngine.generateKubernetesDeployment(name, dockerImage + ":latest",
                entity.getNamespace(), port, replicas);
        gitHubService.pushFile(repoFullName, "k8s/deployment.yaml", k8sDeployment,
                "chore: add Kubernetes Deployment manifest");

        gitHubService.pushFile(repoFullName, "k8s/service.yaml",
                templateEngine.generateKubernetesService(name, entity.getNamespace(), port),
                "chore: add Kubernetes Service manifest");

        gitHubService.pushFile(repoFullName, "k8s/ingress.yaml",
                templateEngine.generateKubernetesIngress(name, entity.getNamespace(), name + ".forgeflow.io"),
                "chore: add Kubernetes Ingress manifest");

        // Helm chart
        gitHubService.pushFile(repoFullName, "helm/" + name + "/Chart.yaml",
                templateEngine.generateHelmChart(name, entity.getDescription()),
                "chore: add Helm Chart.yaml");

        gitHubService.pushFile(repoFullName, "helm/" + name + "/values.yaml",
                templateEngine.generateHelmValues(name, dockerImage, port, replicas),
                "chore: add Helm values.yaml");

        // CI/CD
        gitHubService.pushFile(repoFullName, ".github/workflows/ci-cd.yml",
                templateEngine.generateGithubActionsWorkflow(name, entity.getLanguage(), dockerHubUsername),
                "ci: add GitHub Actions CI/CD pipeline");

        gitHubService.pushFile(repoFullName, "Jenkinsfile",
                templateEngine.generateJenkinsfile(name, dockerHubUsername),
                "ci: add Jenkinsfile");
    }

    @Transactional(readOnly = true)
    public Page<ServiceDtos.ServiceResponse> list(Pageable pageable) {
        return serviceRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ServiceDtos.ServiceResponse getById(Long id) {
        return toResponse(serviceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found")));
    }

    public void deleteService(Long id, String actorEmail) {
        ServiceEntity entity = serviceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found"));
        serviceRepository.delete(entity);
        auditService.log(actorEmail, "SERVICE_DELETED", "service", entity.getName(),
                "Service deleted: " + entity.getName());
    }

    private ServiceDtos.ServiceResponse toResponse(ServiceEntity e) {
        return new ServiceDtos.ServiceResponse(
                e.getId(), e.getName(), e.getDescription(), e.getLanguage(), e.getFramework(),
                e.getOwnerEmail(), e.getGithubRepoUrl(), e.getGithubRepoName(), e.getDockerImage(),
                e.getStatus().name(), e.getNamespace(), e.getPort(), e.getReplicas(),
                e.getCreatedAt().toString(), e.getUpdatedAt().toString());
    }
}
