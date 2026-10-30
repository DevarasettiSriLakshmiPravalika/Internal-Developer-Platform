package com.forgeflow.service;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "services")
public class ServiceEntity {

    public enum ServiceStatus {
        PENDING, PROVISIONING, ACTIVE, FAILED, ARCHIVED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 30)
    private String language;

    @Column(length = 50)
    private String framework;

    @Column(name = "owner_email", nullable = false)
    private String ownerEmail;

    @Column(name = "github_repo_url", length = 500)
    private String githubRepoUrl;

    @Column(name = "github_repo_name", length = 200)
    private String githubRepoName;

    @Column(name = "docker_image", length = 300)
    private String dockerImage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ServiceStatus status = ServiceStatus.PENDING;

    @Column(nullable = false, length = 100)
    private String namespace = "default";

    @Column(nullable = false)
    private int port = 8080;

    @Column(nullable = false)
    private int replicas = 2;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected ServiceEntity() {}

    public ServiceEntity(String name, String description, String language, String framework,
                         String ownerEmail, String namespace, int port, int replicas) {
        this.name = name;
        this.description = description;
        this.language = language;
        this.framework = framework;
        this.ownerEmail = ownerEmail;
        this.namespace = namespace;
        this.port = port;
        this.replicas = replicas;
    }

    @PreUpdate
    void onUpdate() { this.updatedAt = Instant.now(); }

    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getLanguage() { return language; }
    public String getFramework() { return framework; }
    public String getOwnerEmail() { return ownerEmail; }
    public String getGithubRepoUrl() { return githubRepoUrl; }
    public String getGithubRepoName() { return githubRepoName; }
    public String getDockerImage() { return dockerImage; }
    public ServiceStatus getStatus() { return status; }
    public String getNamespace() { return namespace; }
    public int getPort() { return port; }
    public int getReplicas() { return replicas; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    // Setters
    public void setStatus(ServiceStatus status) { this.status = status; }
    public void setGithubRepoUrl(String githubRepoUrl) { this.githubRepoUrl = githubRepoUrl; }
    public void setGithubRepoName(String githubRepoName) { this.githubRepoName = githubRepoName; }
    public void setDockerImage(String dockerImage) { this.dockerImage = dockerImage; }
}
