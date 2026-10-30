package com.forgeflow.pipeline;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PipelineRunRepository extends JpaRepository<PipelineRun, Long> {
    Page<PipelineRun> findByServiceId(Long serviceId, Pageable pageable);
    List<PipelineRun> findTop5ByOrderByCreatedAtDesc();
    long countByStatus(PipelineRun.PipelineStatus status);
}
