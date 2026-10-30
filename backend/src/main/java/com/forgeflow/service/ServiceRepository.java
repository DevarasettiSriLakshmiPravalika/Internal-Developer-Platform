package com.forgeflow.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {
    Page<ServiceEntity> findByOwnerEmail(String ownerEmail, Pageable pageable);
    List<ServiceEntity> findByStatus(ServiceEntity.ServiceStatus status);
    Optional<ServiceEntity> findByName(String name);
    boolean existsByName(String name);
}
