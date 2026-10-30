CREATE TABLE deployments (
    id BIGINT NOT NULL AUTO_INCREMENT,
    service_id BIGINT NOT NULL,
    version VARCHAR(50) NOT NULL,
    environment VARCHAR(20) NOT NULL DEFAULT 'production',
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    image_tag VARCHAR(200),
    deployed_by VARCHAR(255) NOT NULL,
    argocd_app_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_deployments_service FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE CASCADE
);
