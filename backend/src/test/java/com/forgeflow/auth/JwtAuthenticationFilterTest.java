package com.forgeflow.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.mock.web.MockFilterChain;

import io.jsonwebtoken.Claims;
import jakarta.servlet.ServletException;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private Claims claims;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void authenticatesBearerTokenAndAddsRoleAuthority() throws ServletException, IOException {
        when(jwtService.parseToken("token")).thenReturn(claims);
        when(claims.getSubject()).thenReturn("developer@example.com");
        when(claims.get("role", String.class)).thenReturn("DEVELOPER");
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtService);
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(requestWithAuthorization("Bearer token"), new MockHttpServletResponse(), chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication().getName()).isEqualTo("developer@example.com");
        assertThat(SecurityContextHolder.getContext().getAuthentication().getAuthorities())
                .extracting("authority").containsExactly("ROLE_DEVELOPER");
        assertThat(chain.getRequest()).isNotNull();
    }

    @Test
    void forwardsRequestWithoutAuthenticationWhenHeaderIsMissing() throws ServletException, IOException {
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtService);
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(new MockHttpServletRequest(), new MockHttpServletResponse(), chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(jwtService, org.mockito.Mockito.never()).parseToken(org.mockito.ArgumentMatchers.anyString());
        assertThat(chain.getRequest()).isNotNull();
    }

    @Test
    void clearsContextWhenTokenIsInvalid() throws ServletException, IOException {
        when(jwtService.parseToken("invalid")).thenThrow(new IllegalArgumentException("invalid token"));
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtService);
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(requestWithAuthorization("Bearer invalid"), new MockHttpServletResponse(), chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        assertThat(chain.getRequest()).isNotNull();
    }

    private MockHttpServletRequest requestWithAuthorization(String authorization) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", authorization);
        return request;
    }
}
