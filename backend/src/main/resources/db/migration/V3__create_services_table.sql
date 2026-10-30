CREATE TABLE services (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    language VARCHAR(30) NOT NULL,
    framework VARCHAR(50),
    owner_email VARCHAR(255) NOT NULL,
    github_repo_url VARCHAR(500),
    github_repo_name VARCHAR(200),
    docker_image VARCHAR(300),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    namespace VARCHAR(100) NOT NULL DEFAULT 'default',
    port INT NOT NULL DEFAULT 8080,
    replicas INT NOT NULL DEFAULT 2,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uq_services_name UNIQUE (name)
);
