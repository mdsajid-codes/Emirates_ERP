package com.example.multi_tanent.warehouse.controller;

import com.example.multi_tanent.warehouse.dto.ShelfRequest;
import com.example.multi_tanent.warehouse.dto.ShelfResponse;
import com.example.multi_tanent.warehouse.service.ShelfService;
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
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ShelfController.class)
@AutoConfigureMockMvc(addFilters = false)
class ShelfControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ShelfService shelfService;

    @Autowired
    private ObjectMapper objectMapper;

    private ShelfResponse mockResponse;
    private ShelfRequest mockRequest;

    @BeforeEach
    void setUp() {
        mockResponse = ShelfResponse.builder()
                .id(1L)
                .shelfCode("S001")
                .barcodeTag("SHF-S001-TAG")
                .isActive(true)
                .build();

        mockRequest = ShelfRequest.builder()
                .shelfCode("S001")
                .rackId(1L)
                .isActive(true)
                .build();
    }

    @Test
    void getAllShelves_ShouldReturnOk() throws Exception {
        when(shelfService.getAllShelves()).thenReturn(List.of(mockResponse));

        mockMvc.perform(get("/api/warehouse/shelves"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].shelfCode").value("S001"));

        verify(shelfService).getAllShelves();
    }

    @Test
    void getShelfById_ShouldReturnOk() throws Exception {
        when(shelfService.getShelfById(1L)).thenReturn(mockResponse);

        mockMvc.perform(get("/api/warehouse/shelves/1"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shelfCode").value("S001"));
    }

    @Test
    void getByActive_ShouldReturnOk() throws Exception {
        when(shelfService.fetchByActive(true)).thenReturn(List.of(mockResponse));

        mockMvc.perform(get("/api/warehouse/shelves/status").param("isActive", "true"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].isActive").value(true));
    }

    @Test
    void getByBarcodeTag_ShouldReturnOk() throws Exception {
        when(shelfService.fetchByBarcodeTag("SHF-S001-TAG")).thenReturn(mockResponse);

        mockMvc.perform(get("/api/warehouse/shelves/barcode/SHF-S001-TAG"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.barcodeTag").value("SHF-S001-TAG"));
    }

    @Test
    void createShelf_ShouldReturnCreated() throws Exception {
        when(shelfService.createShelf(any(ShelfRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/warehouse/shelves")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mockRequest)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.shelfCode").value("S001"));
    }

    @Test
    void updateShelf_ShouldReturnOk() throws Exception {
        when(shelfService.updateShelf(eq(1L), any(ShelfRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(put("/api/warehouse/shelves/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mockRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shelfCode").value("S001"));
    }

    @Test
    void deleteShelf_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/warehouse/shelves/1"))
                .andDo(print())
                .andExpect(status().isNoContent());

        verify(shelfService).deleteShelf(1L);
    }
}
