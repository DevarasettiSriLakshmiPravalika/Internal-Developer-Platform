package com.forgeflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ForgeFlowApplication {
    public static void main(String[] args) {
        SpringApplication.run(ForgeFlowApplication.class, args);
    }
}
