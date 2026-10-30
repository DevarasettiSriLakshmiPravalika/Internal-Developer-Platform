package com.forgeflow.auth;

public record UserAccount(String email, String displayName, String passwordHash, Role role) {
}
