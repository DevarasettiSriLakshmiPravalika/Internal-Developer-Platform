package com.forgeflow.template;

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
class TemplateControllerTest {
    @Autowired private MockMvc mockMvc;

    @Test
    void generatesDeterministicSpringBootFilesForOwnedService() throws Exception {
        String token = register();
        MvcResult created = mockMvc.perform(post("/api/services").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content("""
                        {"serviceName":"orders-api","description":"Orders","language":"spring-boot","framework":"Spring Boot 3","port":8081}
                        """))
                .andExpect(status().isCreated()).andReturn();
        String id = JsonPath.read(created.getResponse().getContentAsString(), "$.id");

        mockMvc.perform(get("/api/services/" + id + "/template").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.serviceName").value("orders-api"))
                .andExpect(jsonPath("$.files[0].path").value("Dockerfile"))
                .andExpect(jsonPath("$.files[0].content").value(org.hamcrest.Matchers.containsString("EXPOSE 8081")));
    }

    @Test
    void requiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/services/" + UUID.randomUUID() + "/template"))
                .andExpect(status().isUnauthorized());
    }

    private String register() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content("""
                {"email":"template-%s@example.com","displayName":"Template User","password":"correct-horse-battery"}
                """.formatted(UUID.randomUUID()))).andExpect(status().isCreated()).andReturn();
        return JsonPath.read(result.getResponse().getContentAsString(), "$.accessToken");
    }
}
