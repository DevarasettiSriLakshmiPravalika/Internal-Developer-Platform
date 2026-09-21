package com.forgeflow.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record RegisterRequest(
            @NotBlank @Email String email,
            @NotBlank @Size(min = 2, max = 80) String displayName,
            @NotBlank @Size(min = 12, max = 128) String password) {
    }

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password) {
    }

    public record AuthResponse(String accessToken, String tokenType, long expiresInSeconds) {
    }

    public record CurrentUserResponse(String email, String displayName, Role role) {
    }
}
