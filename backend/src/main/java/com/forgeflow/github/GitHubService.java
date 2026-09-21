package com.forgeflow.github;

public interface GitHubService {
    GitHubDtos.IntegrationResponse getRepositories();
    GitHubDtos.RepositoryResponse createRepository(String name, String description);
}
