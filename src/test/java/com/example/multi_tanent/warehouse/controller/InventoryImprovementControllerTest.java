package com.example.multi_tanent.warehouse.controller;

import com.example.multi_tanent.warehouse.dto.InventoryImprovementRequest;
import com.example.multi_tanent.warehouse.dto.InventoryImprovementResponse;
import com.example.multi_tanent.warehouse.enums.MovementType;
import com.example.multi_tanent.warehouse.enums.StockStatus;
import com.example.multi_tanent.warehouse.service.InventoryImprovementService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(InventoryImprovementController.class)
@AutoConfigureMockMvc(addFilters = false)
class InventoryImprovementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private InventoryImprovementService inventoryImprovementService;

    @Autowired
    private ObjectMapper objectMapper;

    private InventoryImprovementResponse mockResponse;
    private InventoryImprovementRequest mockRequest;

    @BeforeEach
    void setUp() {
        mockResponse = InventoryImprovementResponse.builder()
                .id(1L)
                .movementNo("MOV-001")
                .type(MovementType.INWARD)
                .status(StockStatus.AVAILABLE)
                .build();

        mockRequest = InventoryImprovementRequest.builder()
                .movementNo("MOV-001")
                .type(MovementType.INWARD)
                .status(StockStatus.AVAILABLE)
                .warehouseId(1L)
                .quantity(100.0)
                .build();
    }

    @Test
    void getAll_ShouldReturnOk() throws Exception {
        when(inventoryImprovementService.getAll()).thenReturn(List.of(mockResponse));

        mockMvc.perform(get("/api/warehouse/inventory-movements"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].movementNo").value("MOV-001"));

        verify(inventoryImprovementService).getAll();
    }

    @Test
    void getById_ShouldReturnOk() throws Exception {
        when(inventoryImprovementService.getById(1L)).thenReturn(mockResponse);

        mockMvc.perform(get("/api/warehouse/inventory-movements/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.movementNo").value("MOV-001"));
    }

    @Test
    void create_ShouldReturnCreated() throws Exception {
        when(inventoryImprovementService.create(any(InventoryImprovementRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/warehouse/inventory-movements")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mockRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.movementNo").value("MOV-001"));
    }

    @Test
    void delete_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/warehouse/inventory-movements/1"))
                .andExpect(status().isNoContent());

        verify(inventoryImprovementService).delete(1L);
    }
}
