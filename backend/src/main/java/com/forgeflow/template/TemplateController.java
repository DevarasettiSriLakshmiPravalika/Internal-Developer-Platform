package com.forgeflow.template;

import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.forgeflow.service.ServiceService;

@RestController
@RequestMapping("/api/services/{serviceId}/template")
public class TemplateController {
    private final ServiceService serviceService;
    private final TemplateService templateService;

    public TemplateController(ServiceService serviceService, TemplateService templateService) {
        this.serviceService = serviceService;
        this.templateService = templateService;
    }

    @GetMapping
    public TemplateDtos.TemplateResponse generate(@PathVariable UUID serviceId, Authentication auth) {
        return templateService.generate(serviceService.findById(serviceId, auth.getName()));
    }
}
