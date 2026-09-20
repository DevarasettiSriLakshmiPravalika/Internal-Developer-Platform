package com.forgeflow.auth;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private final Key signingKey;
    private final long expirationSeconds;

    public JwtService(@Value("${security.jwt.secret:}") String configuredSecret,
            @Value("${security.jwt.expiration-seconds:3600}") long expirationSeconds) {
        this.signingKey = configuredSecret.isBlank()
                ? generateDevelopmentKey()
                : Keys.hmacShaKeyFor(configuredSecret.getBytes(StandardCharsets.UTF_8));
        this.expirationSeconds = expirationSeconds;
    }

    public String createToken(UserAccount account) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(account.email())
                .claim("role", account.role().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(expirationSeconds)))
                .signWith(signingKey)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser().verifyWith((SecretKey) signingKey).build().parseSignedClaims(token).getPayload();
    }

    public long getExpirationSeconds() {
        return expirationSeconds;
    }

    private SecretKey generateDevelopmentKey() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Keys.hmacShaKeyFor(bytes);
    }
}
