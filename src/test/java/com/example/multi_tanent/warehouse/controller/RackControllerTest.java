package com.example.multi_tanent.warehouse.controller;

import com.example.multi_tanent.warehouse.dto.RackRequest;
import com.example.multi_tanent.warehouse.dto.RackResponse;
import com.example.multi_tanent.warehouse.enums.RackType;
import com.example.multi_tanent.warehouse.service.RackService;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RackController.class)
@AutoConfigureMockMvc(addFilters = false)
class RackControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RackService rackService;

    @Autowired
    private ObjectMapper objectMapper;

    private RackResponse mockResponse;
    private RackRequest mockRequest;

    @BeforeEach
    void setUp() {
        mockResponse = RackResponse.builder()
                .id(1L)
                .rackCode("R001")
                .barcodeTag("RCK-R001-TAG")
                .rackType(RackType.STORAGE)
                .isActive(true)
                .build();

        mockRequest = RackRequest.builder()
                .rackCode("R001")
                .zoneId(1L)
                .rackType(RackType.STORAGE)
                .isActive(true)
                .build();
    }

    @Test
    void getAllRacks_ShouldReturnOk() throws Exception {
        when(rackService.getAllRacks()).thenReturn(List.of(mockResponse));

        mockMvc.perform(get("/api/warehouse/racks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].rackCode").value("R001"));

        verify(rackService).getAllRacks();
    }

    @Test
    void getById_ShouldReturnOk() throws Exception {
        when(rackService.getById(1L)).thenReturn(mockResponse);

        mockMvc.perform(get("/api/warehouse/racks/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rackCode").value("R001"));
    }

    @Test
    void getByActive_ShouldReturnOk() throws Exception {
        when(rackService.fetchByActive(true)).thenReturn(List.of(mockResponse));

        mockMvc.perform(get("/api/warehouse/racks/status").param("isActive", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].isActive").value(true));
    }

    @Test
    void getByRackType_ShouldReturnOk() throws Exception {
        when(rackService.fetchByRackType(RackType.STORAGE)).thenReturn(List.of(mockResponse));

        mockMvc.perform(get("/api/warehouse/racks/type/STORAGE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].rackType").value("STORAGE"));

        verify(rackService).fetchByRackType(RackType.STORAGE);
    }

    @Test
    void getByBarcodeTag_ShouldReturnOk() throws Exception {
        when(rackService.fetchByBarcodeTag("RCK-R001-TAG")).thenReturn(mockResponse);

        mockMvc.perform(get("/api/warehouse/racks/barcode/RCK-R001-TAG"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.barcodeTag").value("RCK-R001-TAG"));
    }

    @Test
    void create_ShouldReturnCreated() throws Exception {
        when(rackService.create(any(RackRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/warehouse/racks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mockRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.rackCode").value("R001"));
    }

    @Test
    void update_ShouldReturnOk() throws Exception {
        when(rackService.update(eq(1L), any(RackRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(put("/api/warehouse/racks/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mockRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rackCode").value("R001"));
    }

    @Test
    void delete_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/warehouse/racks/1"))
                .andExpect(status().isNoContent());

        verify(rackService).delete(1L);
    }
}
