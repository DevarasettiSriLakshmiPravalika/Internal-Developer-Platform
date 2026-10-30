package com.forgeflow.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    private final AuditLogRepository repository;

    public AuditLogController(AuditLogRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER')")
    public PagedResponse<AuditLogDto> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String actor,
            @RequestParam(required = false) String resourceType) {

        PageRequest pageRequest = PageRequest.of(page, Math.min(size, 100),
                Sort.by(Sort.Direction.DESC, "occurredAt"));

        Page<AuditLog> result;
        if (actor != null && !actor.isBlank()) {
            result = repository.findByActorEmail(actor, pageRequest);
        } else if (resourceType != null && !resourceType.isBlank()) {
            result = repository.findByResourceType(resourceType, pageRequest);
        } else {
            result = repository.findAllByOrderByOccurredAtDesc(pageRequest);
        }

        List<AuditLogDto> content = result.getContent().stream().map(this::toDto).toList();
        return new PagedResponse<>(content, result.getTotalElements(), result.getTotalPages(), page);
    }

    private AuditLogDto toDto(AuditLog log) {
        return new AuditLogDto(
                log.getId(), log.getActorEmail(), log.getAction(),
                log.getResourceType(), log.getResourceId(),
                log.getDetail(), log.getIpAddress(),
                log.getOccurredAt().toString());
    }

    public record AuditLogDto(Long id, String actorEmail, String action, String resourceType,
                               String resourceId, String detail, String ipAddress, String occurredAt) {}

    public record PagedResponse<T>(List<T> content, long totalElements, int totalPages, int page) {}
}
