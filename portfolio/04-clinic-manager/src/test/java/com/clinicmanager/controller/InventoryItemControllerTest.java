package com.clinicmanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.clinicmanager.dto.InventoryItemRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class InventoryItemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private InventoryItemRequest request(String name, int quantity, int threshold) {
        InventoryItemRequest request = new InventoryItemRequest();
        request.setName(name);
        request.setQuantity(quantity);
        request.setUnit("box");
        request.setReorderThreshold(threshold);
        return request;
    }

    @Test
    void createInventoryItem_returnsCreatedItem() throws Exception {
        mockMvc.perform(post("/api/inventory")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request("Ibuprofen", 100, 20))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Ibuprofen"));
    }

    @Test
    void createInventoryItem_withNegativeQuantity_returnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/inventory")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request("Aspirin", -5, 20))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void lowStockEndpoint_returnsOnlyItemsAtOrBelowThreshold() throws Exception {
        mockMvc.perform(post("/api/inventory")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request("LowStockSyrup", 2, 10))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/inventory")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request("WellStockedGauze", 1000, 50))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/inventory/low-stock"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.name=='LowStockSyrup')]").exists())
                .andExpect(jsonPath("$[?(@.name=='WellStockedGauze')]").doesNotExist());
    }
}
