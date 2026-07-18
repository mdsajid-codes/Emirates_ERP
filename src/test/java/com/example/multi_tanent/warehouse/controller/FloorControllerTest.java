package com.example.multi_tanent.warehouse.controller;

import com.example.multi_tanent.warehouse.dto.FloorRequest;
import com.example.multi_tanent.warehouse.dto.FloorResponse;
import com.example.multi_tanent.warehouse.service.FloorService;
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

@WebMvcTest(FloorController.class)
@AutoConfigureMockMvc(addFilters = false)
class FloorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FloorService floorService;

    @Autowired
    private ObjectMapper objectMapper;

    private FloorResponse mockResponse;
    private FloorRequest mockRequest;

    @BeforeEach
    void setUp() {
        mockResponse = FloorResponse.builder()
                .id(1L)
                .code("FL-001")
                .name("Ground Floor")
                .levelNo(0)
                .isActive(true)
                .build();

        mockRequest = FloorRequest.builder()
                .code("FL-001")
                .name("Ground Floor")
                .warehouseId(1L)
                .levelNo(0)
                .isActive(true)
                .build();
    }

    @Test
    void getAllFloors_ShouldReturnOk() throws Exception {
        when(floorService.getAllFloors()).thenReturn(List.of(mockResponse));

        mockMvc.perform(get("/api/warehouse/floors"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("FL-001"));

        verify(floorService).getAllFloors();
    }

    @Test
    void getById_ShouldReturnOk() throws Exception {
        when(floorService.getById(1L)).thenReturn(mockResponse);

        mockMvc.perform(get("/api/warehouse/floors/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("FL-001"));
    }

    @Test
    void create_ShouldReturnCreated() throws Exception {
        when(floorService.create(any(FloorRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/warehouse/floors")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mockRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("FL-001"));
    }

    @Test
    void update_ShouldReturnOk() throws Exception {
        when(floorService.update(eq(1L), any(FloorRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(put("/api/warehouse/floors/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mockRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("FL-001"));
    }

    @Test
    void delete_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/warehouse/floors/1"))
                .andExpect(status().isNoContent());

        verify(floorService).delete(1L);
    }
}
