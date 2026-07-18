package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.warehouse.dto.WareProductRequest;
import com.example.multi_tanent.warehouse.dto.WareProductResponse;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WareExcelService {

    private final String[] COLUMNS = { "SKU", "Name", "Barcode", "Description", "Brand", "Model", "Purchase Price",
            "Sale Price", "Is Active" };

    public byte[] generateTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Products Template");

            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);

            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < COLUMNS.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(COLUMNS[col]);
                cell.setCellStyle(headerCellStyle);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    public List<WareProductRequest> parseExcel(MultipartFile file) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            List<WareProductRequest> productRequests = new ArrayList<>();
            int rowNumber = 0;
            while (rows.hasNext()) {
                Row currentRow = rows.next();

                if (rowNumber == 0) {
                    rowNumber++;
                    continue;
                }

                WareProductRequest req = new WareProductRequest();
                req.setSku(getCellValueAsString(currentRow.getCell(0)));
                req.setName(getCellValueAsString(currentRow.getCell(1)));
                req.setBarcode(getCellValueAsString(currentRow.getCell(2)));
                req.setDescription(getCellValueAsString(currentRow.getCell(3)));
                req.setBrand(getCellValueAsString(currentRow.getCell(4)));
                req.setModel(getCellValueAsString(currentRow.getCell(5)));

                String purchasePrice = getCellValueAsString(currentRow.getCell(6));
                if (purchasePrice != null && !purchasePrice.isEmpty()) {
                    req.setPurchasePrice(new BigDecimal(purchasePrice));
                }

                String salePrice = getCellValueAsString(currentRow.getCell(7));
                if (salePrice != null && !salePrice.isEmpty()) {
                    req.setSalePrice(new BigDecimal(salePrice));
                }

                String isActive = getCellValueAsString(currentRow.getCell(8));
                req.setIsActive(
                        isActive == null || isActive.equalsIgnoreCase("true") || isActive.equalsIgnoreCase("yes"));

                productRequests.add(req);
            }
            return productRequests;
        }
    }

    public byte[] exportToExcel(List<WareProductResponse> products) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Products Export");

            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < COLUMNS.length; col++) {
                headerRow.createCell(col).setCellValue(COLUMNS[col]);
            }

            int rowIdx = 1;
            for (WareProductResponse p : products) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(p.getSku());
                row.createCell(1).setCellValue(p.getName());
                row.createCell(2).setCellValue(p.getBarcode());
                row.createCell(3).setCellValue(p.getDescription());
                row.createCell(4).setCellValue(p.getBrand());
                row.createCell(5).setCellValue(p.getModel());
                row.createCell(6).setCellValue(p.getPurchasePrice() != null ? p.getPurchasePrice().doubleValue() : 0);
                row.createCell(7).setCellValue(p.getSalePrice() != null ? p.getSalePrice().doubleValue() : 0);
                row.createCell(8).setCellValue(p.getIsActive() != null && p.getIsActive() ? "TRUE" : "FALSE");
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null)
            return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }
}
