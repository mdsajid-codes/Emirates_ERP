package com.example.multi_tanent.warehouse.controller;

import com.example.multi_tanent.warehouse.dto.PaginatedResponse;
import com.example.multi_tanent.warehouse.dto.WareProductRequest;
import com.example.multi_tanent.warehouse.dto.WareProductResponse;
import com.example.multi_tanent.warehouse.service.WareExcelService;
import com.example.multi_tanent.warehouse.service.WareProductsService;
import com.example.multi_tanent.warehouse.service.WareStorageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(WareProductsController.class)
@AutoConfigureMockMvc(addFilters = false)
class WareProductsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private WareProductsService productService;

    @MockBean
    private WareExcelService excelService;

    @MockBean
    private WareStorageService storageService;

    @Autowired
    private ObjectMapper objectMapper;

    private WareProductResponse mockResponse;
    private WareProductRequest mockRequest;

    @BeforeEach
    void setUp() {
        mockResponse = WareProductResponse.builder()
                .id(1L)
                .sku("SKU001")
                .name("Test Product")
                .purchasePrice(BigDecimal.valueOf(100.0))
                .salePrice(BigDecimal.valueOf(150.0))
                .build();

        mockRequest = WareProductRequest.builder()
                .sku("SKU001")
                .name("Test Product")
                .purchasePrice(BigDecimal.valueOf(100.0))
                .salePrice(BigDecimal.valueOf(150.0))
                .build();
    }

    @Test
    void list_ShouldReturnOk() throws Exception {
        when(productService.list()).thenReturn(List.of(mockResponse));

        mockMvc.perform(get("/api/warehouse/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sku").value("SKU001"))
                .andExpect(jsonPath("$[0].name").value("Test Product"));

        verify(productService).list();
    }

    @Test
    void listPaginated_ShouldReturnOk() throws Exception {
        PaginatedResponse<WareProductResponse> paginatedResponse = PaginatedResponse.<WareProductResponse>builder()
                .content(List.of(mockResponse))
                .pageNo(0)
                .pageSize(10)
                .totalElements(1)
                .totalPages(1)
                .last(true)
                .build();

        when(productService.listPaginated(any(Pageable.class))).thenReturn(paginatedResponse);

        mockMvc.perform(get("/api/warehouse/products/paginated")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].sku").value("SKU001"))
                .andExpect(jsonPath("$.pageNo").value(0))
                .andExpect(jsonPath("$.pageSize").value(10));

        verify(productService).listPaginated(any(Pageable.class));
    }

    @Test
    void getById_ShouldReturnOk() throws Exception {
        when(productService.getById(1L)).thenReturn(mockResponse);

        mockMvc.perform(get("/api/warehouse/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sku").value("SKU001"));

        verify(productService).getById(1L);
    }

    @Test
    void getByBarcode_ShouldReturnOk() throws Exception {
        when(productService.getByBarcode("BARCODE001")).thenReturn(mockResponse);

        mockMvc.perform(get("/api/warehouse/products/barcode/BARCODE001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sku").value("SKU001"));

        verify(productService).getByBarcode("BARCODE001");
    }

    @Test
    void create_ShouldReturnOk() throws Exception {
        when(productService.create(any(WareProductRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/warehouse/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mockRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sku").value("SKU001"));

        verify(productService).create(any(WareProductRequest.class));
    }

    @Test
    void update_ShouldReturnOk() throws Exception {
        when(productService.update(eq(1L), any(WareProductRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(put("/api/warehouse/products/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mockRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sku").value("SKU001"));

        verify(productService).update(eq(1L), any(WareProductRequest.class));
    }

    @Test
    void delete_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/warehouse/products/1"))
                .andExpect(status().isNoContent());

        verify(productService).delete(1L);
    }

    @Test
    void downloadTemplate_ShouldReturnExcelFile() throws Exception {
        byte[] content = "template content".getBytes();
        when(excelService.generateTemplate()).thenReturn(content);

        mockMvc.perform(get("/api/warehouse/products/template"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=products_template.xlsx"))
                .andExpect(content().bytes(content));

        verify(excelService).generateTemplate();
    }

    @Test
    void exportProducts_ShouldReturnExcelFile() throws Exception {
        byte[] content = "export content".getBytes();
        when(productService.list()).thenReturn(List.of(mockResponse));
        when(excelService.exportToExcel(any())).thenReturn(content);

        mockMvc.perform(get("/api/warehouse/products/export"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=products_export.xlsx"))
                .andExpect(content().bytes(content));

        verify(excelService).exportToExcel(any());
    }

    @Test
    void importProducts_ShouldReturnOk() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.xlsx",
                MediaType.MULTIPART_FORM_DATA_VALUE, "test data".getBytes());

        mockMvc.perform(multipart("/api/warehouse/products/import").file(file))
                .andExpect(status().isOk())
                .andExpect(content().string("Import processed successfully"));

        verify(excelService).parseExcel(any());
        verify(productService).importProducts(any());
    }
}
