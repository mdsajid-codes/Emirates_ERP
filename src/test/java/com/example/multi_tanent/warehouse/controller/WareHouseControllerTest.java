package com.example.multi_tanent.warehouse.controller;

import com.example.multi_tanent.warehouse.dto.WareHouseRequest;
import com.example.multi_tanent.warehouse.dto.WareHouseResponse;
import com.example.multi_tanent.warehouse.enums.WarehouseType;
import com.example.multi_tanent.warehouse.service.WareHouseService;
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

@WebMvcTest(WareHouseController.class)
@AutoConfigureMockMvc(addFilters = false)
class WareHouseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private WareHouseService warehouseService;

    @Autowired
    private ObjectMapper objectMapper;

    private WareHouseResponse mockResponse;
    private WareHouseRequest mockRequest;

    @BeforeEach
    void setUp() {
        mockResponse = WareHouseResponse.builder()
                .id(1L)
                .code("W001")
                .name("Main Warehouse")
                .isActive(true)
                .warehouseType(WarehouseType.NORMAL)
                .build();

        mockRequest = WareHouseRequest.builder()
                .code("W001")
                .name("Main Warehouse")
                .isActive(true)
                .build();
    }

    @Test
    void getAllWarehouses_ShouldReturnOk() throws Exception {
        when(warehouseService.getAllWarehouses()).thenReturn(List.of(mockResponse));

        mockMvc.perform(get("/api/warehouse/warehouses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("W001"));

        verify(warehouseService).getAllWarehouses();
    }

    @Test
    void getById_ShouldReturnOk() throws Exception {
        when(warehouseService.getById(1L)).thenReturn(mockResponse);

        mockMvc.perform(get("/api/warehouse/warehouses/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("W001"));
    }

    @Test
    void getByCode_ShouldReturnOk() throws Exception {
        when(warehouseService.getByCode("W001")).thenReturn(mockResponse);

        mockMvc.perform(get("/api/warehouse/warehouses/code/W001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Main Warehouse"));
    }

    @Test
    void getByActive_ShouldReturnOk() throws Exception {
        when(warehouseService.fetchByActive(true)).thenReturn(List.of(mockResponse));

        mockMvc.perform(get("/api/warehouse/warehouses/status").param("isActive", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].isActive").value(true));
    }

    @Test
    void getByWarehouseType_ShouldReturnOk() throws Exception {
        when(warehouseService.fetchByWarehouseType(WarehouseType.NORMAL)).thenReturn(List.of(mockResponse));

        mockMvc.perform(get("/api/warehouse/warehouses/type/NORMAL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].warehouseType").value("NORMAL"));
    }

    @Test
    void create_ShouldReturnCreated() throws Exception {
        when(warehouseService.create(any(WareHouseRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/warehouse/warehouses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mockRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("W001"));
    }

    @Test
    void update_ShouldReturnOk() throws Exception {
        when(warehouseService.update(eq(1L), any(WareHouseRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(put("/api/warehouse/warehouses/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mockRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("W001"));
    }

    @Test
    void delete_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/warehouse/warehouses/1"))
                .andExpect(status().isNoContent());

        verify(warehouseService).delete(1L);
    }
}
