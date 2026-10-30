package com.forgeflow.deployment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DeploymentRepository extends JpaRepository<Deployment, Long> {
    Page<Deployment> findByServiceId(Long serviceId, Pageable pageable);
    List<Deployment> findByStatus(Deployment.DeploymentStatus status);
    List<Deployment> findTop5ByOrderByCreatedAtDesc();
}
