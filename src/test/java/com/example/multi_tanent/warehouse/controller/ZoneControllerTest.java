package com.example.multi_tanent.warehouse.controller;

import com.example.multi_tanent.warehouse.dto.ZoneRequest;
import com.example.multi_tanent.warehouse.dto.ZoneResponse;
import com.example.multi_tanent.warehouse.enums.ZoneType;
import com.example.multi_tanent.warehouse.service.ZoneService;
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

@WebMvcTest(ZoneController.class)
@AutoConfigureMockMvc(addFilters = false)
class ZoneControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ZoneService zoneService;

    @Autowired
    private ObjectMapper objectMapper;

    private ZoneResponse mockResponse;
    private ZoneRequest mockRequest;

    @BeforeEach
    void setUp() {
        mockResponse = ZoneResponse.builder()
                .id(1L)
                .name("Z001")
                .zoneType(ZoneType.STORAGE)
                .isActive(true)
                .build();

        mockRequest = ZoneRequest.builder()
                .name("Z001")
                .warehouseId(1L)
                .zoneType(ZoneType.STORAGE)
                .isActive(true)
                .build();
    }

    @Test
    void getAllZones_ShouldReturnOk() throws Exception {
        when(zoneService.getAllZones()).thenReturn(List.of(mockResponse));

        mockMvc.perform(get("/api/warehouse/zones"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Z001"));

        verify(zoneService).getAllZones();
    }

    @Test
    void getById_ShouldReturnOk() throws Exception {
        when(zoneService.getById(1L)).thenReturn(mockResponse);

        mockMvc.perform(get("/api/warehouse/zones/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Z001"));
    }

    @Test
    void getByActive_ShouldReturnOk() throws Exception {
        when(zoneService.fetchByActive(true)).thenReturn(List.of(mockResponse));

        mockMvc.perform(get("/api/warehouse/zones/status").param("isActive", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].isActive").value(true));
    }

    @Test
    void getByZoneType_ShouldReturnOk() throws Exception {
        when(zoneService.fetchByZoneType(ZoneType.STORAGE)).thenReturn(List.of(mockResponse));

        mockMvc.perform(get("/api/warehouse/zones/type/STORAGE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].zoneType").value("STORAGE"));
    }

    @Test
    void create_ShouldReturnCreated() throws Exception {
        when(zoneService.create(any(ZoneRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/warehouse/zones")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mockRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Z001"));
    }

    @Test
    void update_ShouldReturnOk() throws Exception {
        when(zoneService.update(eq(1L), any(ZoneRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(put("/api/warehouse/zones/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mockRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Z001"));
    }

    @Test
    void delete_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/warehouse/zones/1"))
                .andExpect(status().isNoContent());

        verify(zoneService).delete(1L);
    }
}
