package com.forgeflow.github;

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
class RepositoryControllerTest {
    @Autowired private MockMvc mockMvc;

    @Test
    void rejectsUnauthenticatedRepositoryListing() throws Exception {
        mockMvc.perform(get("/api/repositories")).andExpect(status().isUnauthorized());
    }

    @Test
    void reportsNotConnectedWithoutCredentials() throws Exception {
        String token = register("github-" + UUID.randomUUID() + "@example.com");
        mockMvc.perform(get("/api/repositories").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("NOT_CONNECTED"))
                .andExpect(jsonPath("$.repositories").isEmpty());
    }

    @Test
    void refusesRepositoryCreationWithoutCredentials() throws Exception {
        String token = register("repo-" + UUID.randomUUID() + "@example.com");
        MvcResult service = mockMvc.perform(post("/api/services").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content("""
                        {"serviceName":"catalog-api","description":"Catalog","language":"node","framework":"Node.js","port":3000}
                        """))
                .andExpect(status().isCreated()).andReturn();
        String serviceId = JsonPath.read(service.getResponse().getContentAsString(), "$.id");
        mockMvc.perform(post("/api/repositories/services/" + serviceId).header("Authorization", "Bearer " + token))
                .andExpect(status().isServiceUnavailable());
    }

    private String register(String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content("""
                {"email":"%s","displayName":"GitHub User","password":"correct-horse-battery"}
                """.formatted(email))).andExpect(status().isCreated()).andReturn();
        return JsonPath.read(result.getResponse().getContentAsString(), "$.accessToken");
    }
}
