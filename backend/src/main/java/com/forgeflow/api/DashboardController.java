package com.forgeflow.api;

import com.forgeflow.deployment.DeploymentRepository;
import com.forgeflow.pipeline.PipelineRun;
import com.forgeflow.pipeline.PipelineRunRepository;
import com.forgeflow.service.ServiceEntity;
import com.forgeflow.service.ServiceRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Dashboard metrics endpoint — summary statistics for the Overview page.
 */
@RestController
@RequestMapping("/api/dashboard")
@Transactional(readOnly = true)
public class DashboardController {

    private final ServiceRepository serviceRepository;
    private final DeploymentRepository deploymentRepository;
    private final PipelineRunRepository pipelineRunRepository;

    public DashboardController(ServiceRepository serviceRepository,
                               DeploymentRepository deploymentRepository,
                               PipelineRunRepository pipelineRunRepository) {
        this.serviceRepository = serviceRepository;
        this.deploymentRepository = deploymentRepository;
        this.pipelineRunRepository = pipelineRunRepository;
    }

    @GetMapping
    public DashboardResponse dashboard() {
        long totalServices = serviceRepository.count();
        long activeServices = serviceRepository.findByStatus(ServiceEntity.ServiceStatus.ACTIVE).size();
        long failedServices = serviceRepository.findByStatus(ServiceEntity.ServiceStatus.FAILED).size();
        long totalDeployments = deploymentRepository.count();
        long runningDeployments = deploymentRepository.findByStatus(
                com.forgeflow.deployment.Deployment.DeploymentStatus.RUNNING).size();
        long successPipelines = pipelineRunRepository.countByStatus(PipelineRun.PipelineStatus.SUCCESS);
        long failedPipelines = pipelineRunRepository.countByStatus(PipelineRun.PipelineStatus.FAILED);
        long totalPipelines = pipelineRunRepository.count();

        double pipelineHealthPct = totalPipelines > 0
                ? Math.round((double) successPipelines / totalPipelines * 1000.0) / 10.0
                : 0.0;

        List<RecentActivity> recentActivities = pipelineRunRepository
                .findTop5ByOrderByCreatedAtDesc().stream()
                .map(r -> new RecentActivity(
                        r.getService().getName(),
                        r.getStatus().name(),
                        r.getCreatedAt().toString()))
                .toList();

        return new DashboardResponse(
                totalServices, activeServices, failedServices,
                totalDeployments, runningDeployments,
                pipelineHealthPct, successPipelines, failedPipelines,
                recentActivities);
    }

    public record DashboardResponse(
            long totalServices, long activeServices, long failedServices,
            long totalDeployments, long runningDeployments,
            double pipelineHealthPercent, long successPipelines, long failedPipelines,
            List<RecentActivity> recentActivity) {}

    public record RecentActivity(String serviceName, String status, String timestamp) {}
}
