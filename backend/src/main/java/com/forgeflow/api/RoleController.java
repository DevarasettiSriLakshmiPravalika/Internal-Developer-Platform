package com.forgeflow.api;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RoleController {

    @GetMapping("/api/admin/ping")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminPing() {
        return "admin access granted";
    }
}
