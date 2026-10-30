package com.forgeflow.pipeline;

import com.forgeflow.service.ServiceEntity;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "pipeline_runs")
public class PipelineRun {

    public enum PipelineStatus {
        PENDING, RUNNING, SUCCESS, FAILED, CANCELLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceEntity service;

    @Column(name = "deployment_id")
    private Long deploymentId;

    @Column(name = "run_number", length = 50)
    private String runNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PipelineStatus status = PipelineStatus.PENDING;

    @Column(length = 50)
    private String stage;

    @Column(name = "sonarqube_status", length = 30)
    private String sonarqubeStatus;

    @Column(name = "sonarqube_url", length = 500)
    private String sonarqubeUrl;

    @Column(name = "trivy_status", length = 30)
    private String trivyStatus;

    @Column(name = "trivy_critical_count")
    private int trivyCriticalCount = 0;

    @Column(name = "trivy_high_count")
    private int trivyHighCount = 0;

    @Column(name = "docker_image_tag", length = 200)
    private String dockerImageTag;

    @Column(name = "logs_url", length = 500)
    private String logsUrl;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected PipelineRun() {}

    public PipelineRun(ServiceEntity service, String runNumber) {
        this.service = service;
        this.runNumber = runNumber;
        this.startedAt = Instant.now();
    }

    public Long getId() { return id; }
    public ServiceEntity getService() { return service; }
    public Long getDeploymentId() { return deploymentId; }
    public String getRunNumber() { return runNumber; }
    public PipelineStatus getStatus() { return status; }
    public String getStage() { return stage; }
    public String getSonarqubeStatus() { return sonarqubeStatus; }
    public String getSonarqubeUrl() { return sonarqubeUrl; }
    public String getTrivyStatus() { return trivyStatus; }
    public int getTrivyCriticalCount() { return trivyCriticalCount; }
    public int getTrivyHighCount() { return trivyHighCount; }
    public String getDockerImageTag() { return dockerImageTag; }
    public String getLogsUrl() { return logsUrl; }
    public Instant getStartedAt() { return startedAt; }
    public Instant getCompletedAt() { return completedAt; }
    public Instant getCreatedAt() { return createdAt; }

    public void setStatus(PipelineStatus status) { this.status = status; }
    public void setStage(String stage) { this.stage = stage; }
    public void setSonarqubeStatus(String sonarqubeStatus) { this.sonarqubeStatus = sonarqubeStatus; }
    public void setSonarqubeUrl(String sonarqubeUrl) { this.sonarqubeUrl = sonarqubeUrl; }
    public void setTrivyStatus(String trivyStatus) { this.trivyStatus = trivyStatus; }
    public void setTrivyCriticalCount(int trivyCriticalCount) { this.trivyCriticalCount = trivyCriticalCount; }
    public void setTrivyHighCount(int trivyHighCount) { this.trivyHighCount = trivyHighCount; }
    public void setDockerImageTag(String dockerImageTag) { this.dockerImageTag = dockerImageTag; }
    public void setLogsUrl(String logsUrl) { this.logsUrl = logsUrl; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
    public void setDeploymentId(Long deploymentId) { this.deploymentId = deploymentId; }
}
