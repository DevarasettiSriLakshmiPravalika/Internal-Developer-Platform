package com.forgeflow.github;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

public final class GitHubDtos {
    private GitHubDtos() { }
    public record IntegrationResponse(String status, String message, List<RepositoryResponse> repositories) { }
    public record RepositoryResponse(String name, String url, boolean isPrivate, String defaultBranch) { }
    public record CreateRepositoryRequest(String name, String description, boolean isPrivate) { }
    record GitHubRepository(String name, @JsonProperty("html_url") String htmlUrl,
            @JsonProperty("private") boolean privateRepository,
            @JsonProperty("default_branch") String defaultBranch) { }
}
