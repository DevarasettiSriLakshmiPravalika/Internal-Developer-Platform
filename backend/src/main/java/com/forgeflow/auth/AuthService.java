package com.forgeflow.auth;

import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final Map<String, UserAccount> users = new ConcurrentHashMap<>();
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        String email = normalizeEmail(request.email());
        UserAccount account = new UserAccount(email, request.displayName().trim(),
                passwordEncoder.encode(request.password()), Role.DEVELOPER);
        if (users.putIfAbsent(email, account) != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        return issueToken(account);
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        UserAccount account = users.get(normalizeEmail(request.email()));
        if (account == null || !passwordEncoder.matches(request.password(), account.passwordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        return issueToken(account);
    }

    public UserAccount findByEmail(String email) {
        return users.get(normalizeEmail(email));
    }

    private AuthDtos.AuthResponse issueToken(UserAccount account) {
        return new AuthDtos.AuthResponse(jwtService.createToken(account), "Bearer", jwtService.getExpirationSeconds());
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
