package com.forgeflow.pipeline;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/pipelines")
public class PipelineController {

    private final PipelineRunRepository pipelineRunRepository;

    public PipelineController(PipelineRunRepository pipelineRunRepository) {
        this.pipelineRunRepository = pipelineRunRepository;
    }

    @GetMapping
    public Page<PipelineDto> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long serviceId) {
        PageRequest pr = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<PipelineRun> results = (serviceId != null)
                ? pipelineRunRepository.findByServiceId(serviceId, pr)
                : pipelineRunRepository.findAll(pr);
        return results.map(this::toDto);
    }

    @GetMapping("/{id}")
    public PipelineDto get(@PathVariable Long id) {
        return toDto(pipelineRunRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pipeline run not found")));
    }

    @PatchMapping("/{id}")
    public PipelineDto update(@PathVariable Long id, @RequestBody UpdatePipelineRequest request) {
        PipelineRun run = pipelineRunRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pipeline run not found"));
        if (request.status() != null) run.setStatus(PipelineRun.PipelineStatus.valueOf(request.status()));
        if (request.stage() != null) run.setStage(request.stage());
        if (request.sonarqubeStatus() != null) run.setSonarqubeStatus(request.sonarqubeStatus());
        if (request.trivyStatus() != null) run.setTrivyStatus(request.trivyStatus());
        if (request.trivyCriticalCount() != null) run.setTrivyCriticalCount(request.trivyCriticalCount());
        if (request.trivyHighCount() != null) run.setTrivyHighCount(request.trivyHighCount());
        if (request.dockerImageTag() != null) run.setDockerImageTag(request.dockerImageTag());
        return toDto(pipelineRunRepository.save(run));
    }

    private PipelineDto toDto(PipelineRun r) {
        return new PipelineDto(r.getId(), r.getService().getId(), r.getService().getName(),
                r.getRunNumber(), r.getStatus().name(), r.getStage(),
                r.getSonarqubeStatus(), r.getSonarqubeUrl(),
                r.getTrivyStatus(), r.getTrivyCriticalCount(), r.getTrivyHighCount(),
                r.getDockerImageTag(), r.getLogsUrl(),
                r.getStartedAt() != null ? r.getStartedAt().toString() : null,
                r.getCompletedAt() != null ? r.getCompletedAt().toString() : null,
                r.getCreatedAt().toString());
    }

    public record PipelineDto(Long id, Long serviceId, String serviceName, String runNumber,
                              String status, String stage, String sonarqubeStatus, String sonarqubeUrl,
                              String trivyStatus, int trivyCriticalCount, int trivyHighCount,
                              String dockerImageTag, String logsUrl,
                              String startedAt, String completedAt, String createdAt) {}

    public record UpdatePipelineRequest(String status, String stage, String sonarqubeStatus,
                                        String trivyStatus, Integer trivyCriticalCount, Integer trivyHighCount,
                                        String dockerImageTag, String logsUrl) {}
}
