package com.forgeflow.audit;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuditService {

    private final AuditLogRepository repository;

    public AuditService(AuditLogRepository repository) {
        this.repository = repository;
    }

    public void log(String actorEmail, String action, String resourceType, String resourceId, String detail, String ipAddress) {
        repository.save(new AuditLog(actorEmail, action, resourceType, resourceId, detail, ipAddress));
    }

    public void log(String actorEmail, String action, String resourceType, String resourceId, String detail) {
        log(actorEmail, action, resourceType, resourceId, detail, null);
    }
}
