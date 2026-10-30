package com.forgeflow.github;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Integrates with the GitHub REST API to provision repositories and push generated files.
 */
@Service
public class GitHubService {

    private static final Logger log = LoggerFactory.getLogger(GitHubService.class);
    private static final String GITHUB_API = "https://api.github.com";

    private final RestTemplate restTemplate;
    private final String githubToken;
    private final String githubOrg;

    public GitHubService(
            @Value("${integrations.github.token:}") String githubToken,
            @Value("${integrations.github.org:}") String githubOrg) {
        this.restTemplate = new RestTemplate();
        this.githubToken = githubToken;
        this.githubOrg = githubOrg;
    }

    public boolean isConfigured() {
        return githubToken != null && !githubToken.isBlank();
    }

    /**
     * Creates a new GitHub repository under the configured org or user.
     * @return the HTML URL of the created repository, or null if not configured.
     */
    public String createRepository(String repoName, String description, boolean isPrivate) {
        if (!isConfigured()) {
            log.warn("GitHub token not configured — skipping repo creation for '{}'", repoName);
            return null;
        }

        String url = githubOrg != null && !githubOrg.isBlank()
                ? GITHUB_API + "/orgs/" + githubOrg + "/repos"
                : GITHUB_API + "/user/repos";

        Map<String, Object> body = Map.of(
                "name", repoName,
                "description", description != null ? description : "",
                "private", isPrivate,
                "auto_init", true,
                "gitignore_template", "Java"
        );

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.POST,
                    new HttpEntity<>(body, buildHeaders()),
                    Map.class);

            if (response.getStatusCode() == HttpStatus.CREATED && response.getBody() != null) {
                String repoUrl = (String) response.getBody().get("html_url");
                log.info("Created GitHub repo: {}", repoUrl);
                return repoUrl;
            }
        } catch (Exception e) {
            log.error("Failed to create GitHub repository '{}': {}", repoName, e.getMessage());
        }
        return null;
    }

    /**
     * Creates or updates a file in the given GitHub repository via the Contents API.
     */
    public boolean pushFile(String repoFullName, String filePath, String content, String commitMessage) {
        if (!isConfigured()) return false;
        String url = GITHUB_API + "/repos/" + repoFullName + "/contents/" + filePath;

        String encoded = java.util.Base64.getEncoder().encodeToString(content.getBytes());
        Map<String, Object> body = Map.of(
                "message", commitMessage,
                "content", encoded
        );

        try {
            restTemplate.exchange(url, HttpMethod.PUT, new HttpEntity<>(body, buildHeaders()), Map.class);
            return true;
        } catch (Exception e) {
            log.error("Failed to push file '{}' to '{}': {}", filePath, repoFullName, e.getMessage());
            return false;
        }
    }

    private HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(githubToken);
        headers.set("Accept", "application/vnd.github+json");
        return headers;
    }
}
