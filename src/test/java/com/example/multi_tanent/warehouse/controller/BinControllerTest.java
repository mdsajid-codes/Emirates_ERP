package com.example.multi_tanent.warehouse.controller;

import com.example.multi_tanent.warehouse.dto.BinRequest;
import com.example.multi_tanent.warehouse.dto.BinResponse;
import com.example.multi_tanent.warehouse.dto.PaginatedResponse;
import com.example.multi_tanent.warehouse.enums.BinType;
import com.example.multi_tanent.warehouse.service.BinService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BinController.class)
@AutoConfigureMockMvc(addFilters = false)
class BinControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BinService binService;

    @Autowired
    private ObjectMapper objectMapper;

    private BinResponse mockResponse;
    private BinRequest mockRequest;

    @BeforeEach
    void setUp() {
        mockResponse = BinResponse.builder()
                .id(1L)
                .binCode("B001")
                .barcodeTag("TAG001")
                .binType(BinType.STORAGE)
                .isActive(true)
                .build();

        mockRequest = BinRequest.builder()
                .binCode("B001")
                .shelfId(1L)
                .warehouseId(1L)
                .binType(BinType.STORAGE)
                .isActive(true)
                .build();
    }

    @Test
    void list_ShouldReturnOk() throws Exception {
        when(binService.listAll()).thenReturn(List.of(mockResponse));

        mockMvc.perform(get("/api/warehouse/bins"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].binCode").value("B001"));

        verify(binService).listAll();
    }

    @Test
    void listPaginated_ShouldReturnOk() throws Exception {
        PaginatedResponse<BinResponse> paginatedResponse = PaginatedResponse.<BinResponse>builder()
                .content(List.of(mockResponse))
                .pageNo(0)
                .pageSize(10)
                .totalElements(1)
                .totalPages(1)
                .last(true)
                .build();

        when(binService.listPaginated(any(Pageable.class))).thenReturn(paginatedResponse);

        mockMvc.perform(get("/api/warehouse/bins/paginated")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].binCode").value("B001"));
    }

    @Test
    void getById_ShouldReturnOk() throws Exception {
        when(binService.getById(1L)).thenReturn(mockResponse);

        mockMvc.perform(get("/api/warehouse/bins/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.binCode").value("B001"));
    }

    @Test
    void getByBarcodeTag_ShouldReturnOk() throws Exception {
        when(binService.fetchByBarcodeTag("TAG001")).thenReturn(mockResponse);

        mockMvc.perform(get("/api/warehouse/bins/barcode/TAG001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.binCode").value("B001"))
                .andExpect(jsonPath("$.barcodeTag").value("TAG001"));

        verify(binService).fetchByBarcodeTag("TAG001");
    }

    @Test
    void getActiveBins_ShouldReturnOk() throws Exception {
        when(binService.fetchByActive(true)).thenReturn(List.of(mockResponse));

        mockMvc.perform(get("/api/warehouse/bins/active").param("isActive", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].isActive").value(true));
    }

    @Test
    void getBinsByType_ShouldReturnOk() throws Exception {
        when(binService.fetchByBinType(BinType.STORAGE)).thenReturn(List.of(mockResponse));

        mockMvc.perform(get("/api/warehouse/bins/type/STORAGE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].binType").value("STORAGE"));
    }

    @Test
    void create_ShouldReturnOk() throws Exception {
        when(binService.create(any(BinRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/warehouse/bins")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mockRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.binCode").value("B001"));
    }

    @Test
    void update_ShouldReturnOk() throws Exception {
        when(binService.update(eq(1L), any(BinRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(put("/api/warehouse/bins/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mockRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.binCode").value("B001"));
    }

    @Test
    void delete_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/warehouse/bins/1"))
                .andExpect(status().isNoContent());

        verify(binService).delete(1L);
    }
}
