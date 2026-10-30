package com.forgeflow.deployment;

import com.forgeflow.service.ServiceEntity;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "deployments")
public class Deployment {

    public enum DeploymentStatus {
        PENDING, DEPLOYING, RUNNING, FAILED, ROLLED_BACK
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceEntity service;

    @Column(nullable = false, length = 50)
    private String version;

    @Column(nullable = false, length = 20)
    private String environment = "production";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DeploymentStatus status = DeploymentStatus.PENDING;

    @Column(name = "image_tag", length = 200)
    private String imageTag;

    @Column(name = "deployed_by", nullable = false)
    private String deployedBy;

    @Column(name = "argocd_app_url", length = 500)
    private String argocdAppUrl;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected Deployment() {}

    public Deployment(ServiceEntity service, String version, String environment, String deployedBy) {
        this.service = service;
        this.version = version;
        this.environment = environment;
        this.deployedBy = deployedBy;
    }

    @PreUpdate
    void onUpdate() { this.updatedAt = Instant.now(); }

    public Long getId() { return id; }
    public ServiceEntity getService() { return service; }
    public String getVersion() { return version; }
    public String getEnvironment() { return environment; }
    public DeploymentStatus getStatus() { return status; }
    public String getImageTag() { return imageTag; }
    public String getDeployedBy() { return deployedBy; }
    public String getArgocdAppUrl() { return argocdAppUrl; }
    public String getNotes() { return notes; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setStatus(DeploymentStatus status) { this.status = status; }
    public void setImageTag(String imageTag) { this.imageTag = imageTag; }
    public void setArgocdAppUrl(String argocdAppUrl) { this.argocdAppUrl = argocdAppUrl; }
    public void setNotes(String notes) { this.notes = notes; }
}
