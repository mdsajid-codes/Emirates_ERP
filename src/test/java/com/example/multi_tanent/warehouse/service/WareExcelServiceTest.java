package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.warehouse.dto.WareProductRequest;
import com.example.multi_tanent.warehouse.dto.WareProductResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class WareExcelServiceTest {

    @InjectMocks
    private WareExcelService excelService;

    @Test
    void generateTemplate_ShouldReturnNonEmptyByteArray() throws IOException {
        byte[] result = excelService.generateTemplate();

        assertNotNull(result);
        assertTrue(result.length > 0);

        // Verify it's a valid Excel file by reading it
        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(result))) {
            Sheet sheet = workbook.getSheetAt(0);
            assertEquals("Products Template", sheet.getSheetName());
            Row header = sheet.getRow(0);
            assertEquals("SKU", header.getCell(0).getStringCellValue());
        }
    }

    @Test
    void parseExcel_ShouldReturnProductRequests() throws IOException {
        byte[] content;
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet();
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("SKU");
            header.createCell(1).setCellValue("Name");
            header.createCell(6).setCellValue("Purchase Price");

            Row data = sheet.createRow(1);
            data.createCell(0).setCellValue("SKU001");
            data.createCell(1).setCellValue("Product 1");
            data.createCell(6).setCellValue(10.5);

            workbook.write(out);
            content = out.toByteArray();
        }

        MockMultipartFile file = new MockMultipartFile("file", "test.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", content);
        List<WareProductRequest> result = excelService.parseExcel(file);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("SKU001", result.get(0).getSku());
        assertEquals(new BigDecimal("10.5"), result.get(0).getPurchasePrice());
    }

    @Test
    void exportToExcel_ShouldReturnNonEmptyByteArray() throws IOException {
        WareProductResponse p = WareProductResponse.builder()
                .sku("SKU001")
                .name("Product 1")
                .purchasePrice(new BigDecimal("10.5"))
                .isActive(true)
                .build();

        byte[] result = excelService.exportToExcel(List.of(p));

        assertNotNull(result);
        assertTrue(result.length > 0);

        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(result))) {
            Sheet sheet = workbook.getSheetAt(0);
            Row data = sheet.getRow(1);
            assertEquals("SKU001", data.getCell(0).getStringCellValue());
        }
    }
}
