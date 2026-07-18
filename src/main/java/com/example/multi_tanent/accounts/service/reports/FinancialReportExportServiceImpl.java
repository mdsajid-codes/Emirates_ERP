package com.example.multi_tanent.accounts.service.reports;

import com.example.multi_tanent.accounts.dto.reports.*;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceGray;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FinancialReportExportServiceImpl implements FinancialReportExportService {

    private final TrialBalanceService trialBalanceService;
    private final IncomeStatementService incomeStatementService;
    private final BalanceSheetService balanceSheetService;

    private PdfFont getFont(String name) {
        try {
            return PdfFontFactory.createFont(name);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load standard PDF font: " + name, e);
        }
    }

    @Override
    public byte[] exportTrialBalanceExcel(Long tenantId, LocalDate fromDate, LocalDate toDate) {
        List<TrialBalanceRow> data = trialBalanceService.getTrialBalance(tenantId, fromDate, toDate);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Trial Balance");

            // Title
            Row titleRow = sheet.createRow(0);
            org.apache.poi.ss.usermodel.Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Trial Balance");
            CellStyle titleStyle = workbook.createCellStyle();
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 16);
            titleStyle.setFont(titleFont);
            titleCell.setCellStyle(titleStyle);

            // Date Range
            Row dateRow = sheet.createRow(1);
            dateRow.createCell(0).setCellValue("Period: " + fromDate + " to " + toDate);

            // Headers
            Row headerRow = sheet.createRow(3);
            String[] headers = {"Code", "Account", "Opening Debit", "Opening Credit", "Debit Turnover", "Credit Turnover", "Closing Debit", "Closing Credit"};
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            for (int i = 0; i < headers.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data
            int rowIdx = 4;
            BigDecimal totalOpeningDr = BigDecimal.ZERO;
            BigDecimal totalOpeningCr = BigDecimal.ZERO;
            BigDecimal totalTurnoverDr = BigDecimal.ZERO;
            BigDecimal totalTurnoverCr = BigDecimal.ZERO;
            BigDecimal totalClosingDr = BigDecimal.ZERO;
            BigDecimal totalClosingCr = BigDecimal.ZERO;

            for (TrialBalanceRow row : data) {
                totalOpeningDr = totalOpeningDr.add(row.getOpeningDebit() != null ? row.getOpeningDebit() : BigDecimal.ZERO);
                totalOpeningCr = totalOpeningCr.add(row.getOpeningCredit() != null ? row.getOpeningCredit() : BigDecimal.ZERO);
                totalTurnoverDr = totalTurnoverDr.add(row.getDebitTurnover() != null ? row.getDebitTurnover() : BigDecimal.ZERO);
                totalTurnoverCr = totalTurnoverCr.add(row.getCreditTurnover() != null ? row.getCreditTurnover() : BigDecimal.ZERO);
                totalClosingDr = totalClosingDr.add(row.getClosingDebit() != null ? row.getClosingDebit() : BigDecimal.ZERO);
                totalClosingCr = totalClosingCr.add(row.getClosingCredit() != null ? row.getClosingCredit() : BigDecimal.ZERO);
            }

            CellStyle boldStyle = workbook.createCellStyle();
            Font boldFont = workbook.createFont();
            boldFont.setBold(true);
            boldStyle.setFont(boldFont);

            rowIdx = writeTrialBalanceExcelRecursive(sheet, data, rowIdx, 1, boldStyle);

            // Totals Row
            Row totalRow = sheet.createRow(rowIdx);
            org.apache.poi.ss.usermodel.Cell totalLabelCell = totalRow.createCell(0);
            totalLabelCell.setCellValue("TOTALS");
            CellStyle totalStyle = workbook.createCellStyle();
            Font totalFont = workbook.createFont();
            totalFont.setBold(true);
            totalStyle.setFont(totalFont);
            totalLabelCell.setCellStyle(totalStyle);

            totalRow.createCell(2).setCellValue(totalOpeningDr.doubleValue());
            totalRow.createCell(3).setCellValue(totalOpeningCr.doubleValue());
            totalRow.createCell(4).setCellValue(totalTurnoverDr.doubleValue());
            totalRow.createCell(5).setCellValue(totalTurnoverCr.doubleValue());
            totalRow.createCell(6).setCellValue(totalClosingDr.doubleValue());
            totalRow.createCell(7).setCellValue(totalClosingCr.doubleValue());

            for (int i = 2; i <= 7; i++) {
                totalRow.getCell(i).setCellStyle(totalStyle);
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Excel generation failed", e);
        }
    }

    private int writeTrialBalanceExcelRecursive(Sheet sheet, List<TrialBalanceRow> rows, int rowIdx, int level, CellStyle boldStyle) {
        for (TrialBalanceRow row : rows) {
            Row excelRow = sheet.createRow(rowIdx++);
            
            String indent = "";
            for (int i = 1; i < level; i++) indent += "    ";
            
            org.apache.poi.ss.usermodel.Cell codeCell = excelRow.createCell(0);
            codeCell.setCellValue(row.getAccountCode());
            org.apache.poi.ss.usermodel.Cell descCell = excelRow.createCell(1);
            descCell.setCellValue(indent + row.getDescription());
            
            excelRow.createCell(2).setCellValue(row.getOpeningDebit() != null ? row.getOpeningDebit().doubleValue() : 0);
            excelRow.createCell(3).setCellValue(row.getOpeningCredit() != null ? row.getOpeningCredit().doubleValue() : 0);
            excelRow.createCell(4).setCellValue(row.getDebitTurnover() != null ? row.getDebitTurnover().doubleValue() : 0);
            excelRow.createCell(5).setCellValue(row.getCreditTurnover() != null ? row.getCreditTurnover().doubleValue() : 0);
            excelRow.createCell(6).setCellValue(row.getClosingDebit() != null ? row.getClosingDebit().doubleValue() : 0);
            excelRow.createCell(7).setCellValue(row.getClosingCredit() != null ? row.getClosingCredit().doubleValue() : 0);

            if (Boolean.TRUE.equals(row.getIsGroup())) {
                codeCell.setCellStyle(boldStyle);
                descCell.setCellStyle(boldStyle);
            }

            if (row.getChildren() != null && !row.getChildren().isEmpty()) {
                rowIdx = writeTrialBalanceExcelRecursive(sheet, row.getChildren(), rowIdx, level + 1, boldStyle);
            }
        }
        return rowIdx;
    }

    @Override
    public byte[] exportTrialBalancePdf(Long tenantId, LocalDate fromDate, LocalDate toDate) {
        List<TrialBalanceRow> data = trialBalanceService.getTrialBalance(tenantId, fromDate, toDate);
        PdfFont font = getFont("Helvetica");
        PdfFont boldFont = getFont("Helvetica-Bold");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (
                PdfWriter writer = new PdfWriter(baos);
                PdfDocument pdf = new PdfDocument(writer);
                Document document = new Document(pdf, PageSize.A4.rotate())
        ) {
            document.setMargins(36, 36, 36, 36);

            document.add(new Paragraph("Trial Balance").setFont(boldFont).setFontSize(18));
            document.add(new Paragraph("Period: " + fromDate + " to " + toDate).setFont(font).setFontSize(10));
            document.add(new Paragraph("\n"));

            Table table = new Table(UnitValue.createPercentArray(new float[]{1.5f, 3.5f, 2f, 2f, 2f, 2f, 2f, 2f})).useAllAvailableWidth();
            table.addHeaderCell(createHeaderCell("Code", boldFont));
            table.addHeaderCell(createHeaderCell("Account", boldFont));
            table.addHeaderCell(createHeaderCell("Opening Dr", boldFont));
            table.addHeaderCell(createHeaderCell("Opening Cr", boldFont));
            table.addHeaderCell(createHeaderCell("Turnover Dr", boldFont));
            table.addHeaderCell(createHeaderCell("Turnover Cr", boldFont));
            table.addHeaderCell(createHeaderCell("Closing Dr", boldFont));
            table.addHeaderCell(createHeaderCell("Closing Cr", boldFont));

            BigDecimal totalOpeningDr = BigDecimal.ZERO;
            BigDecimal totalOpeningCr = BigDecimal.ZERO;
            BigDecimal totalTurnoverDr = BigDecimal.ZERO;
            BigDecimal totalTurnoverCr = BigDecimal.ZERO;
            BigDecimal totalClosingDr = BigDecimal.ZERO;
            BigDecimal totalClosingCr = BigDecimal.ZERO;

            for (TrialBalanceRow row : data) {
                totalOpeningDr = totalOpeningDr.add(row.getOpeningDebit() != null ? row.getOpeningDebit() : BigDecimal.ZERO);
                totalOpeningCr = totalOpeningCr.add(row.getOpeningCredit() != null ? row.getOpeningCredit() : BigDecimal.ZERO);
                totalTurnoverDr = totalTurnoverDr.add(row.getDebitTurnover() != null ? row.getDebitTurnover() : BigDecimal.ZERO);
                totalTurnoverCr = totalTurnoverCr.add(row.getCreditTurnover() != null ? row.getCreditTurnover() : BigDecimal.ZERO);
                totalClosingDr = totalClosingDr.add(row.getClosingDebit() != null ? row.getClosingDebit() : BigDecimal.ZERO);
                totalClosingCr = totalClosingCr.add(row.getClosingCredit() != null ? row.getClosingCredit() : BigDecimal.ZERO);
            }

            writeTrialBalancePdfRecursive(table, data, 1, font, boldFont);

            // Add totals row
            table.addCell(createBodyCell("TOTALS", boldFont));
            table.addCell(createBodyCell("", boldFont));
            table.addCell(createBodyCell(totalOpeningDr.toString(), boldFont).setTextAlignment(TextAlignment.RIGHT));
            table.addCell(createBodyCell(totalOpeningCr.toString(), boldFont).setTextAlignment(TextAlignment.RIGHT));
            table.addCell(createBodyCell(totalTurnoverDr.toString(), boldFont).setTextAlignment(TextAlignment.RIGHT));
            table.addCell(createBodyCell(totalTurnoverCr.toString(), boldFont).setTextAlignment(TextAlignment.RIGHT));
            table.addCell(createBodyCell(totalClosingDr.toString(), boldFont).setTextAlignment(TextAlignment.RIGHT));
            table.addCell(createBodyCell(totalClosingCr.toString(), boldFont).setTextAlignment(TextAlignment.RIGHT));

            document.add(table);
        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed", e);
        }
        return baos.toByteArray();
    }

    private void writeTrialBalancePdfRecursive(Table table, List<TrialBalanceRow> rows, int level, PdfFont font, PdfFont boldFont) {
        for (TrialBalanceRow row : rows) {
            String indent = "";
            for (int i = 1; i < level; i++) indent += "    ";
            
            PdfFont cellFont = Boolean.TRUE.equals(row.getIsGroup()) ? boldFont : font;

            table.addCell(createBodyCell(row.getAccountCode(), cellFont));
            table.addCell(createBodyCell(indent + row.getDescription(), cellFont));
            table.addCell(createBodyCell(row.getOpeningDebit() != null ? row.getOpeningDebit().toString() : "0", cellFont).setTextAlignment(TextAlignment.RIGHT));
            table.addCell(createBodyCell(row.getOpeningCredit() != null ? row.getOpeningCredit().toString() : "0", cellFont).setTextAlignment(TextAlignment.RIGHT));
            table.addCell(createBodyCell(row.getDebitTurnover() != null ? row.getDebitTurnover().toString() : "0", cellFont).setTextAlignment(TextAlignment.RIGHT));
            table.addCell(createBodyCell(row.getCreditTurnover() != null ? row.getCreditTurnover().toString() : "0", cellFont).setTextAlignment(TextAlignment.RIGHT));
            table.addCell(createBodyCell(row.getClosingDebit() != null ? row.getClosingDebit().toString() : "0", cellFont).setTextAlignment(TextAlignment.RIGHT));
            table.addCell(createBodyCell(row.getClosingCredit() != null ? row.getClosingCredit().toString() : "0", cellFont).setTextAlignment(TextAlignment.RIGHT));

            if (row.getChildren() != null && !row.getChildren().isEmpty()) {
                writeTrialBalancePdfRecursive(table, row.getChildren(), level + 1, font, boldFont);
            }
        }
    }

    @Override
    public byte[] exportIncomeStatementExcel(Long tenantId, LocalDate fromDate, LocalDate toDate) {
        IncomeStatementResponse data = incomeStatementService.getIncomeStatement(tenantId, fromDate, toDate);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Profit and Loss");

            // Title
            Row titleRow = sheet.createRow(0);
            org.apache.poi.ss.usermodel.Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Income Statement (Profit and Loss)");
            CellStyle titleStyle = workbook.createCellStyle();
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 16);
            titleStyle.setFont(titleFont);
            titleCell.setCellStyle(titleStyle);

            Row dateRow = sheet.createRow(1);
            dateRow.createCell(0).setCellValue("Period: " + fromDate + " to " + toDate);

            CellStyle sectionHeaderStyle = workbook.createCellStyle();
            Font sectionHeaderFont = workbook.createFont();
            sectionHeaderFont.setBold(true);
            sectionHeaderStyle.setFont(sectionHeaderFont);

            CellStyle rightAlignStyle = workbook.createCellStyle();
            rightAlignStyle.setAlignment(HorizontalAlignment.RIGHT);

            int rowIdx = 3;
            for (IncomeStatementSection section : data.getSections()) {
                Row secHeader = sheet.createRow(rowIdx++);
                org.apache.poi.ss.usermodel.Cell secCell = secHeader.createCell(0);
                secCell.setCellValue(section.getSectionName());
                secCell.setCellStyle(sectionHeaderStyle);

                for (IncomeStatementSection.AccountBalanceRow row : section.getAccounts()) {
                    Row accountRow = sheet.createRow(rowIdx++);
                    accountRow.createCell(0).setCellValue(row.getAccountCode() + " - " + row.getDescription());
                    accountRow.createCell(1).setCellValue(row.getBalance().doubleValue());
                }

                Row totalSecRow = sheet.createRow(rowIdx++);
                org.apache.poi.ss.usermodel.Cell totalSecCell = totalSecRow.createCell(0);
                totalSecCell.setCellValue("Total " + section.getSectionName());
                totalSecCell.setCellStyle(sectionHeaderStyle);
                org.apache.poi.ss.usermodel.Cell totalSecValCell = totalSecRow.createCell(1);
                totalSecValCell.setCellValue(section.getTotalAmount().doubleValue());
                totalSecValCell.setCellStyle(sectionHeaderStyle);
                rowIdx++; // Empty row separator
            }

            Row gpRow = sheet.createRow(rowIdx++);
            org.apache.poi.ss.usermodel.Cell gpLabel = gpRow.createCell(0);
            gpLabel.setCellValue("GROSS PROFIT");
            gpLabel.setCellStyle(titleStyle);
            org.apache.poi.ss.usermodel.Cell gpVal = gpRow.createCell(1);
            gpVal.setCellValue(data.getGrossProfit().doubleValue());
            gpVal.setCellStyle(titleStyle);

            rowIdx++;

            Row npRow = sheet.createRow(rowIdx);
            org.apache.poi.ss.usermodel.Cell npLabel = npRow.createCell(0);
            npLabel.setCellValue("NET PROFIT");
            npLabel.setCellStyle(titleStyle);
            org.apache.poi.ss.usermodel.Cell npVal = npRow.createCell(1);
            npVal.setCellValue(data.getNetProfit().doubleValue());
            npVal.setCellStyle(titleStyle);

            sheet.autoSizeColumn(0);
            sheet.autoSizeColumn(1);

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Excel generation failed", e);
        }
    }

    @Override
    public byte[] exportIncomeStatementPdf(Long tenantId, LocalDate fromDate, LocalDate toDate) {
        IncomeStatementResponse data = incomeStatementService.getIncomeStatement(tenantId, fromDate, toDate);
        PdfFont font = getFont("Helvetica");
        PdfFont boldFont = getFont("Helvetica-Bold");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (
                PdfWriter writer = new PdfWriter(baos);
                PdfDocument pdf = new PdfDocument(writer);
                Document document = new Document(pdf, PageSize.A4)
        ) {
            document.setMargins(36, 36, 36, 36);

            document.add(new Paragraph("Income Statement").setFont(boldFont).setFontSize(18));
            document.add(new Paragraph("Period: " + fromDate + " to " + toDate).setFont(font).setFontSize(10));
            document.add(new Paragraph("\n"));

            Table table = new Table(UnitValue.createPercentArray(new float[]{8f, 4f})).useAllAvailableWidth();

            for (IncomeStatementSection section : data.getSections()) {
                Cell secHeader = new Cell(1, 2)
                        .add(new Paragraph(section.getSectionName()).setFont(boldFont).setFontSize(11))
                        .setBackgroundColor(new DeviceGray(0.95f))
                        .setBorder(Border.NO_BORDER);
                table.addCell(secHeader);

                for (IncomeStatementSection.AccountBalanceRow row : section.getAccounts()) {
                    table.addCell(new Cell().add(new Paragraph(row.getAccountCode() + " - " + row.getDescription()).setFont(font).setFontSize(9)).setBorder(Border.NO_BORDER));
                    table.addCell(new Cell().add(new Paragraph(row.getBalance().toString()).setFont(font).setFontSize(9)).setTextAlignment(TextAlignment.RIGHT).setBorder(Border.NO_BORDER));
                }

                table.addCell(new Cell().add(new Paragraph("Total " + section.getSectionName()).setFont(boldFont).setFontSize(10)).setBorder(Border.NO_BORDER));
                table.addCell(new Cell().add(new Paragraph(section.getTotalAmount().toString()).setFont(boldFont).setFontSize(10)).setTextAlignment(TextAlignment.RIGHT).setBorder(Border.NO_BORDER));
                
                // Add empty spacer row
                table.addCell(new Cell(1, 2).add(new Paragraph("")).setBorder(Border.NO_BORDER).setHeight(10));
            }

            table.addCell(new Cell().add(new Paragraph("GROSS PROFIT").setFont(boldFont).setFontSize(12)).setBorder(Border.NO_BORDER));
            table.addCell(new Cell().add(new Paragraph(data.getGrossProfit().toString()).setFont(boldFont).setFontSize(12)).setTextAlignment(TextAlignment.RIGHT).setBorder(Border.NO_BORDER));

            table.addCell(new Cell(1, 2).add(new Paragraph("")).setBorder(Border.NO_BORDER).setHeight(10));

            table.addCell(new Cell().add(new Paragraph("NET PROFIT").setFont(boldFont).setFontSize(12)).setBorder(Border.NO_BORDER));
            table.addCell(new Cell().add(new Paragraph(data.getNetProfit().toString()).setFont(boldFont).setFontSize(12)).setTextAlignment(TextAlignment.RIGHT).setBorder(Border.NO_BORDER));

            document.add(table);
        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed", e);
        }
        return baos.toByteArray();
    }

    @Override
    public byte[] exportBalanceSheetExcel(Long tenantId, LocalDate toDate) {
        BalanceSheetResponse data = balanceSheetService.getBalanceSheet(tenantId, toDate);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Balance Sheet");

            // Title
            Row titleRow = sheet.createRow(0);
            org.apache.poi.ss.usermodel.Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Balance Sheet");
            CellStyle titleStyle = workbook.createCellStyle();
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 16);
            titleStyle.setFont(titleFont);
            titleCell.setCellStyle(titleStyle);

            Row dateRow = sheet.createRow(1);
            dateRow.createCell(0).setCellValue("As of date: " + toDate);

            CellStyle sectionHeaderStyle = workbook.createCellStyle();
            Font sectionHeaderFont = workbook.createFont();
            sectionHeaderFont.setBold(true);
            sectionHeaderStyle.setFont(sectionHeaderFont);

            int rowIdx = 3;
            for (BalanceSheetSection section : data.getSections()) {
                Row secHeader = sheet.createRow(rowIdx++);
                org.apache.poi.ss.usermodel.Cell secCell = secHeader.createCell(0);
                secCell.setCellValue(section.getSectionName());
                secCell.setCellStyle(sectionHeaderStyle);

                for (BalanceSheetSection.AccountBalanceRow row : section.getAccounts()) {
                    Row accountRow = sheet.createRow(rowIdx++);
                    accountRow.createCell(0).setCellValue(row.getAccountCode() + " - " + row.getDescription());
                    accountRow.createCell(1).setCellValue(row.getBalance().doubleValue());
                }

                Row totalSecRow = sheet.createRow(rowIdx++);
                org.apache.poi.ss.usermodel.Cell totalSecCell = totalSecRow.createCell(0);
                totalSecCell.setCellValue("Total " + section.getSectionName());
                totalSecCell.setCellStyle(sectionHeaderStyle);
                org.apache.poi.ss.usermodel.Cell totalSecValCell = totalSecRow.createCell(1);
                totalSecValCell.setCellValue(section.getTotalAmount().doubleValue());
                totalSecValCell.setCellStyle(sectionHeaderStyle);
                rowIdx++;
            }

            Row assetsRow = sheet.createRow(rowIdx++);
            org.apache.poi.ss.usermodel.Cell assetsLabel = assetsRow.createCell(0);
            assetsLabel.setCellValue("TOTAL ASSETS");
            assetsLabel.setCellStyle(titleStyle);
            org.apache.poi.ss.usermodel.Cell assetsVal = assetsRow.createCell(1);
            assetsVal.setCellValue(data.getTotalAssets().doubleValue());
            assetsVal.setCellStyle(titleStyle);

            rowIdx++;

            Row liabEqRow = sheet.createRow(rowIdx);
            org.apache.poi.ss.usermodel.Cell liabEqLabel = liabEqRow.createCell(0);
            liabEqLabel.setCellValue("TOTAL LIABILITIES AND EQUITY");
            liabEqLabel.setCellStyle(titleStyle);
            org.apache.poi.ss.usermodel.Cell liabEqVal = liabEqRow.createCell(1);
            liabEqVal.setCellValue(data.getTotalLiabilitiesAndEquity().doubleValue());
            liabEqVal.setCellStyle(titleStyle);

            sheet.autoSizeColumn(0);
            sheet.autoSizeColumn(1);

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Excel generation failed", e);
        }
    }

    @Override
    public byte[] exportBalanceSheetPdf(Long tenantId, LocalDate toDate) {
        BalanceSheetResponse data = balanceSheetService.getBalanceSheet(tenantId, toDate);
        PdfFont font = getFont("Helvetica");
        PdfFont boldFont = getFont("Helvetica-Bold");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (
                PdfWriter writer = new PdfWriter(baos);
                PdfDocument pdf = new PdfDocument(writer);
                Document document = new Document(pdf, PageSize.A4)
        ) {
            document.setMargins(36, 36, 36, 36);

            document.add(new Paragraph("Balance Sheet").setFont(boldFont).setFontSize(18));
            document.add(new Paragraph("As of date: " + toDate).setFont(font).setFontSize(10));
            document.add(new Paragraph("\n"));

            Table table = new Table(UnitValue.createPercentArray(new float[]{8f, 4f})).useAllAvailableWidth();

            for (BalanceSheetSection section : data.getSections()) {
                Cell secHeader = new Cell(1, 2)
                        .add(new Paragraph(section.getSectionName()).setFont(boldFont).setFontSize(11))
                        .setBackgroundColor(new DeviceGray(0.95f))
                        .setBorder(Border.NO_BORDER);
                table.addCell(secHeader);

                for (BalanceSheetSection.AccountBalanceRow row : section.getAccounts()) {
                    table.addCell(new Cell().add(new Paragraph(row.getAccountCode() + " - " + row.getDescription()).setFont(font).setFontSize(9)).setBorder(Border.NO_BORDER));
                    table.addCell(new Cell().add(new Paragraph(row.getBalance().toString()).setFont(font).setFontSize(9)).setTextAlignment(TextAlignment.RIGHT).setBorder(Border.NO_BORDER));
                }

                table.addCell(new Cell().add(new Paragraph("Total " + section.getSectionName()).setFont(boldFont).setFontSize(10)).setBorder(Border.NO_BORDER));
                table.addCell(new Cell().add(new Paragraph(section.getTotalAmount().toString()).setFont(boldFont).setFontSize(10)).setTextAlignment(TextAlignment.RIGHT).setBorder(Border.NO_BORDER));
                
                table.addCell(new Cell(1, 2).add(new Paragraph("")).setBorder(Border.NO_BORDER).setHeight(10));
            }

            table.addCell(new Cell().add(new Paragraph("TOTAL ASSETS").setFont(boldFont).setFontSize(12)).setBorder(Border.NO_BORDER));
            table.addCell(new Cell().add(new Paragraph(data.getTotalAssets().toString()).setFont(boldFont).setFontSize(12)).setTextAlignment(TextAlignment.RIGHT).setBorder(Border.NO_BORDER));

            table.addCell(new Cell(1, 2).add(new Paragraph("")).setBorder(Border.NO_BORDER).setHeight(10));

            table.addCell(new Cell().add(new Paragraph("TOTAL LIABILITIES AND EQUITY").setFont(boldFont).setFontSize(12)).setBorder(Border.NO_BORDER));
            table.addCell(new Cell().add(new Paragraph(data.getTotalLiabilitiesAndEquity().toString()).setFont(boldFont).setFontSize(12)).setTextAlignment(TextAlignment.RIGHT).setBorder(Border.NO_BORDER));

            document.add(table);
        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed", e);
        }
        return baos.toByteArray();
    }

    private Cell createHeaderCell(String text, PdfFont cellFont) {
        return new Cell().add(new Paragraph(text).setFont(cellFont).setFontSize(10))
                .setBackgroundColor(new DeviceGray(0.9f))
                .setTextAlignment(TextAlignment.CENTER);
    }

    private Cell createBodyCell(String text, PdfFont cellFont) {
        return new Cell().add(new Paragraph(text).setFont(cellFont).setFontSize(9)).setPadding(4);
    }
}
