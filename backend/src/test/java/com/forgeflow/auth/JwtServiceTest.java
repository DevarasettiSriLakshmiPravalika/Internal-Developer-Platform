package com.forgeflow.auth;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import io.jsonwebtoken.Claims;

class JwtServiceTest {

    private static final String SECRET = "01234567890123456789012345678901";

    @Test
    void createsAndParsesTokenWithUserClaims() {
        JwtService service = new JwtService(SECRET, 3600L);
        UserAccount account = new UserAccount("developer@example.com", "Developer", "hash", Role.DEVELOPER);

        Claims claims = service.parseToken(service.createToken(account));

        assertThat(claims.getSubject()).isEqualTo("developer@example.com");
        assertThat(claims.get("role", String.class)).isEqualTo("DEVELOPER");
        assertThat(service.getExpirationSeconds()).isEqualTo(3600L);
        assertThat(claims.getExpiration()).isAfter(claims.getIssuedAt());
    }

    @Test
    void generatesDevelopmentKeyWhenSecretIsBlank() {
        JwtService service = new JwtService("", 120L);
        UserAccount account = new UserAccount("viewer@example.com", "Viewer", "hash", Role.VIEWER);

        Claims claims = service.parseToken(service.createToken(account));

        assertThat(claims.getSubject()).isEqualTo("viewer@example.com");
        assertThat(service.getExpirationSeconds()).isEqualTo(120L);
    }
}
