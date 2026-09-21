package com.forgeflow.github;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

@Service
public class GitHubRestService implements GitHubService {
    private final RestClient client;
    private final String token;
    private final String owner;

    public GitHubRestService(@Value("${integrations.github.api-url:https://api.github.com}") String apiUrl,
            @Value("${integrations.github.token:}") String token,
            @Value("${integrations.github.owner:}") String owner) {
        client = RestClient.builder().baseUrl(apiUrl).build();
        this.token = token.trim();
        this.owner = owner.trim();
    }

    @Override
    public GitHubDtos.IntegrationResponse getRepositories() {
        if (!configured()) return new GitHubDtos.IntegrationResponse("NOT_CONNECTED",
                "GitHub is not configured. Set GITHUB_TOKEN and GITHUB_OWNER.", List.of());
        GitHubDtos.GitHubRepository[] repositories = client.get().uri("/user/repos?per_page=100&sort=updated")
                .headers(headers -> headers.setBearerAuth(token)).retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> { throw new ResponseStatusException(response.getStatusCode(),
                        "GitHub repository listing failed. Check GitHub integration credentials."); })
                .body(GitHubDtos.GitHubRepository[].class);
        List<GitHubDtos.RepositoryResponse> result = Arrays.stream(repositories == null ? new GitHubDtos.GitHubRepository[0] : repositories)
                .map(this::response).toList();
        return new GitHubDtos.IntegrationResponse("CONNECTED", "GitHub connection is active.", result);
    }

    @Override
    public GitHubDtos.RepositoryResponse createRepository(String name, String description) {
        if (!configured()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "GitHub repository creation is unavailable. Configure GITHUB_TOKEN and GITHUB_OWNER.");
        GitHubDtos.GitHubRepository repository = client.post().uri("/user/repos")
                .headers(headers -> headers.setBearerAuth(token))
                .body(new GitHubDtos.CreateRepositoryRequest(name, description, true)).retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> { throw new ResponseStatusException(response.getStatusCode(),
                        "GitHub repository creation failed. Check GitHub integration credentials."); })
                .body(GitHubDtos.GitHubRepository.class);
        return response(repository);
    }

    private boolean configured() { return !token.isBlank() && !owner.isBlank(); }
    private GitHubDtos.RepositoryResponse response(GitHubDtos.GitHubRepository repository) {
        return new GitHubDtos.RepositoryResponse(repository.name(), repository.htmlUrl(), repository.privateRepository(), repository.defaultBranch());
    }
}
