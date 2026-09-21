package com.forgeflow.service;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import com.jayway.jsonpath.JsonPath;

@SpringBootTest
@AutoConfigureMockMvc
class ServiceControllerTest {
    @Autowired private MockMvc mockMvc;

    @Test
    void createsListsAndReturnsEmptyDeployments() throws Exception {
        String token = register("service-" + UUID.randomUUID() + "@example.com");
        MvcResult created = mockMvc.perform(post("/api/services").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content("""
                        {"serviceName":"billing-api","description":"Billing","language":"spring-boot","framework":"Spring Boot 3","port":8080}
                        """))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.status").value("REGISTERED")).andReturn();
        String id = JsonPath.read(created.getResponse().getContentAsString(), "$.id");
        mockMvc.perform(get("/api/services").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(id));
        mockMvc.perform(get("/api/services/" + id + "/deployments").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$").isEmpty());
    }

    @Test void requiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/services")).andExpect(status().isUnauthorized());
    }

    private String register(String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content("""
                {"email":"%s","displayName":"Service Owner","password":"correct-horse-battery"}
                """.formatted(email))).andExpect(status().isCreated()).andReturn();
        return JsonPath.read(result.getResponse().getContentAsString(), "$.accessToken");
    }
}
