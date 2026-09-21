package com.forgeflow.template;

import java.util.List;

public final class TemplateDtos {
    private TemplateDtos() { }
    public record GeneratedFile(String path, String content) { }
    public record TemplateResponse(String serviceName, String language, List<GeneratedFile> files) { }
}
