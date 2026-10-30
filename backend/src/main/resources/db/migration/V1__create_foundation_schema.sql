CREATE TABLE platform_metadata (
    id BIGINT NOT NULL AUTO_INCREMENT,
    platform_key VARCHAR(100) NOT NULL,
    platform_value VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uq_platform_metadata_key UNIQUE (platform_key)
);