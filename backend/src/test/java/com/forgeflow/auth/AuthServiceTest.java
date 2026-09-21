package com.forgeflow.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Test
    void registerNormalizesEmailTrimsDisplayNameAndIssuesToken() {
        when(passwordEncoder.encode("correct-password")).thenReturn("encoded-password");
        when(jwtService.createToken(any(UserAccount.class))).thenReturn("token");
        when(jwtService.getExpirationSeconds()).thenReturn(3600L);
        AuthService service = new AuthService(passwordEncoder, jwtService);

        AuthDtos.AuthResponse response = service.register(
                new AuthDtos.RegisterRequest("  Developer@Example.com ", "  Developer  ", "correct-password"));

        assertThat(response).isEqualTo(new AuthDtos.AuthResponse("token", "Bearer", 3600L));
        assertThat(service.findByEmail("developer@example.com")).satisfies(account -> {
            assertThat(account.displayName()).isEqualTo("Developer");
            assertThat(account.passwordHash()).isEqualTo("encoded-password");
            assertThat(account.role()).isEqualTo(Role.DEVELOPER);
        });
    }

    @Test
    void registerRejectsDuplicateNormalizedEmail() {
        when(passwordEncoder.encode(any(String.class))).thenReturn("encoded-password");
        when(jwtService.createToken(any(UserAccount.class))).thenReturn("token");
        when(jwtService.getExpirationSeconds()).thenReturn(3600L);
        AuthService service = new AuthService(passwordEncoder, jwtService);
        AuthDtos.RegisterRequest request = new AuthDtos.RegisterRequest("developer@example.com", "Developer",
                "correct-password");
        service.register(request);

        assertThatThrownBy(() -> service.register(
                new AuthDtos.RegisterRequest("DEVELOPER@example.com", "Another Developer", "correct-password")))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
    }

    @Test
    void loginRejectsUnknownOrIncorrectCredentials() {
        AuthService service = new AuthService(passwordEncoder, jwtService);
        service.register(new AuthDtos.RegisterRequest("developer@example.com", "Developer", "correct-password"));

        assertThatThrownBy(() -> service.login(new AuthDtos.LoginRequest("unknown@example.com", "wrong-password")))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED));
    }

    @Test
    void loginIssuesTokenForMatchingCredentials() {
        when(passwordEncoder.encode("correct-password")).thenReturn("stored-hash");
        when(passwordEncoder.matches("correct-password", "stored-hash")).thenReturn(true);
        when(jwtService.createToken(any(UserAccount.class))).thenReturn("token");
        when(jwtService.getExpirationSeconds()).thenReturn(3600L);
        AuthService service = new AuthService(passwordEncoder, jwtService);
        service.register(new AuthDtos.RegisterRequest("developer@example.com", "Developer", "correct-password"));

        AuthDtos.AuthResponse response = service.login(
                new AuthDtos.LoginRequest(" DEVELOPER@example.com ", "correct-password"));

        assertThat(response.accessToken()).isEqualTo("token");
    }
}
