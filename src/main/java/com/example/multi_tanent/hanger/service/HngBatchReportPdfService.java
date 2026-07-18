package com.example.multi_tanent.hanger.service;

import com.example.multi_tanent.hanger.entity.*;
import com.example.multi_tanent.hanger.repository.*;
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
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HngBatchReportPdfService {

    private static final Logger logger = LoggerFactory.getLogger(HngBatchReportPdfService.class);
    private final HngJobCardRepository jobCardRepo;
    private final HngQcLogRepository qcLogRepo;
    private final HngScrapEntryRepository scrapRepo;
    private final HngReworkEntryRepository reworkRepo;
    private final HngBatchPackingRepository packingRepo;

    private PdfFont font;
    private PdfFont boldFont;

    public byte[] generateBatchSummaryReport(HngProductionBatch batch) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (
                PdfWriter writer = new PdfWriter(baos);
                PdfDocument pdf = new PdfDocument(writer);
                Document document = new Document(pdf, PageSize.A4)) {
            document.setMargins(36, 36, 36, 36);
            loadFonts();

            addHeader(document, batch);
            addBatchOverview(document, batch);

            document.add(new AreaBreak());
            addJobCardSummary(document, batch);

            document.add(new AreaBreak());
            addQualityAndScrapSection(document, batch);

            document.add(new AreaBreak());
            addReworkAndPackingSection(document, batch);

            addFooter(document);

        } catch (Exception e) {
            logger.error("Error generating Batch Summary Report PDF", e);
            throw new RuntimeException("Error generating Batch Summary Report PDF", e);
        }
        return baos.toByteArray();
    }

    private void loadFonts() {
        try {
            font = PdfFontFactory.createFont("Helvetica");
            boldFont = PdfFontFactory.createFont("Helvetica-Bold");
        } catch (Exception e) {
            throw new RuntimeException("Failed to load fonts", e);
        }
    }

    private void addHeader(Document document, HngProductionBatch batch) {
        Table headerTable = new Table(UnitValue.createPercentArray(new float[] { 3, 3 })).useAllAvailableWidth();
        headerTable.setBorder(Border.NO_BORDER);

        Cell left = new Cell().setBorder(Border.NO_BORDER);
        left.add(new Paragraph("BATCH SUMMARY REPORT").setFont(boldFont).setFontSize(22)
                .setFontColor(ColorConstants.BLUE));
        left.add(new Paragraph(batch.getTenant().getName()).setFont(boldFont).setFontSize(12));
        headerTable.addCell(left);

        Cell right = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT);
        right.add(new Paragraph("Batch No: " + batch.getBatchNo()).setFont(boldFont).setFontSize(14));
        right.add(new Paragraph(
                "Generated: " + java.time.OffsetDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm")))
                .setFont(font).setFontSize(10));
        headerTable.addCell(right);

        document.add(headerTable);
        document.add(
                new com.itextpdf.layout.element.LineSeparator(new com.itextpdf.kernel.pdf.canvas.draw.SolidLine()));
    }

    private void addBatchOverview(Document document, HngProductionBatch batch) {
        document.add(new Paragraph("\nBatch Overview").setFont(boldFont).setFontSize(16).setMarginBottom(10));
        Table table = new Table(UnitValue.createPercentArray(new float[] { 2, 3, 2, 3 })).useAllAvailableWidth();

        addInfoCell(table, "Hanger Type", batch.getHangerType().getTypeName().getLabel());
        addInfoCell(table, "MO Number", batch.getMo().getMoNumber());
        addInfoCell(table, "Planned Qty", String.valueOf(batch.getPlannedQty()));
        addInfoCell(table, "Actual Qty",
                batch.getActualQty() != null ? String.valueOf(batch.getActualQty()) : "IN PROGRESS");
        addInfoCell(table, "Batch Status", batch.getStatus().toString());
        addInfoCell(table, "Current Stage", batch.getCurrentStage().toString());
        addInfoCell(table, "Coil Reference", batch.getCoilStock() != null ? batch.getCoilStock().getCoilNo() : "N/A");
        addInfoCell(table, "Color", batch.getColor() != null ? batch.getColor() : "Standard");
        addInfoCell(table, "Started At", batch.getCreatedAt().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));
        addInfoCell(table, "Completed At",
                batch.getCompletedAt() != null
                        ? batch.getCompletedAt().format(DateTimeFormatter.ofPattern("dd-MM-yyyy"))
                        : "—");

        document.add(table);

        if (batch.getRemarks() != null && !batch.getRemarks().isEmpty()) {
            document.add(new Paragraph("\nBatch Remarks:").setFont(boldFont).setFontSize(10));
            document.add(new Paragraph(batch.getRemarks()).setFont(font).setFontSize(10));
        }
    }

    private void addJobCardSummary(Document document, HngProductionBatch batch) {
        document.add(
                new Paragraph("Production (Job Cards) Summary").setFont(boldFont).setFontSize(16).setMarginBottom(10));

        List<HngJobCard> cards = jobCardRepo.findByBatchIdAndTenantId(batch.getId(), batch.getTenant().getId());

        if (cards.isEmpty()) {
            document.add(new Paragraph("No job cards found for this batch.").setFont(font).setItalic());
            return;
        }

        Table table = new Table(UnitValue.createPercentArray(new float[] { 2, 3, 2, 1, 1, 1 })).useAllAvailableWidth();
        table.addHeaderCell(createHeaderCell("JC No", boldFont));
        table.addHeaderCell(createHeaderCell("Workstation", boldFont));
        table.addHeaderCell(createHeaderCell("Operator", boldFont));
        table.addHeaderCell(createHeaderCell("Target", boldFont));
        table.addHeaderCell(createHeaderCell("Produced", boldFont));
        table.addHeaderCell(createHeaderCell("OEE %", boldFont));

        for (HngJobCard jc : cards) {
            table.addCell(createBodyCell(jc.getJobCardNo(), font));
            table.addCell(createBodyCell(jc.getWorkstation().getWorkstationName(), font));
            table.addCell(createBodyCell(jc.getOperator().getFirstName(), font));
            table.addCell(
                    createBodyCell(String.valueOf(jc.getTargetQty()), font).setTextAlignment(TextAlignment.CENTER));
            table.addCell(
                    createBodyCell(String.valueOf(jc.getProducedQty()), font).setTextAlignment(TextAlignment.CENTER));
            table.addCell(createBodyCell(jc.getOeePct() != null ? jc.getOeePct() + "%" : "—", font)
                    .setTextAlignment(TextAlignment.CENTER));
        }

        document.add(table);
    }

    private void addQualityAndScrapSection(Document document, HngProductionBatch batch) {
        document.add(new Paragraph("Quality Assurance (QC)").setFont(boldFont).setFontSize(16).setMarginBottom(10));
        List<HngQcLog> qcLogs = qcLogRepo.findByBatch_IdAndTenantId(batch.getId(), batch.getTenant().getId());

        if (qcLogs.isEmpty()) {
            document.add(new Paragraph("No QC records found.").setFont(font).setItalic());
        } else {
            Table table = new Table(UnitValue.createPercentArray(new float[] { 3, 2, 2, 3 })).useAllAvailableWidth();
            table.addHeaderCell(createHeaderCell("QC Batch / Time", boldFont));
            table.addHeaderCell(createHeaderCell("Sample Qty", boldFont));
            table.addHeaderCell(createHeaderCell("Pass Qty", boldFont));
            table.addHeaderCell(createHeaderCell("Result", boldFont));

            for (HngQcLog log : qcLogs) {
                table.addCell(createBodyCell(log.getQcLogNo() + "\n"
                        + log.getCreatedAt().format(DateTimeFormatter.ofPattern("dd-MM HH:mm")), font));
                table.addCell(createBodyCell(String.valueOf(log.getSampleSize()), font)
                        .setTextAlignment(TextAlignment.CENTER));
                table.addCell(
                        createBodyCell(String.valueOf(log.getPassedQty()), font)
                                .setTextAlignment(TextAlignment.CENTER));
                table.addCell(
                        createBodyCell(log.getQcResult() != null ? log.getQcResult().toString() : "—",
                                font).setTextAlignment(TextAlignment.CENTER));
            }
            document.add(table);
        }

        document.add(new Paragraph("\nScrap Summary").setFont(boldFont).setFontSize(16).setMarginBottom(10));
        List<HngScrapEntry> scrapEntries = scrapRepo.findByBatchIdAndTenantId(batch.getId(), batch.getTenant().getId());

        if (scrapEntries.isEmpty()) {
            document.add(new Paragraph("No scrap recorded.").setFont(font).setItalic());
        } else {
            Table table = new Table(UnitValue.createPercentArray(new float[] { 3, 2, 2, 3 })).useAllAvailableWidth();
            table.addHeaderCell(createHeaderCell("Stage", boldFont));
            table.addHeaderCell(createHeaderCell("Type", boldFont));
            table.addHeaderCell(createHeaderCell("Weight (kg)", boldFont));
            table.addHeaderCell(createHeaderCell("Remarks", boldFont));

            double totalScrap = 0;
            for (HngScrapEntry entry : scrapEntries) {
                table.addCell(createBodyCell(entry.getStage().toString(), font));
                table.addCell(createBodyCell(entry.getScrapType().toString(), font));
                table.addCell(createBodyCell(String.valueOf(entry.getScrapWeightKg()), font)
                        .setTextAlignment(TextAlignment.RIGHT));
                table.addCell(createBodyCell(entry.getRemarks(), font));
                totalScrap += entry.getScrapWeightKg().doubleValue();
            }
            document.add(table);
            document.add(new Paragraph("Total Scrap: " + String.format("%.2f", totalScrap) + " kg").setFont(boldFont)
                    .setTextAlignment(TextAlignment.RIGHT));
        }
    }

    private void addReworkAndPackingSection(Document document, HngProductionBatch batch) {
        document.add(new Paragraph("Rework & Repairs").setFont(boldFont).setFontSize(16).setMarginBottom(10));
        List<HngReworkEntry> reworks = reworkRepo.findByBatchIdAndTenantId(batch.getId(), batch.getTenant().getId());

        if (reworks.isEmpty()) {
            document.add(new Paragraph("No rework recorded.").setFont(font).setItalic());
        } else {
            Table table = new Table(UnitValue.createPercentArray(new float[] { 3, 2, 2, 3 })).useAllAvailableWidth();
            table.addHeaderCell(createHeaderCell("Rework No", boldFont));
            table.addHeaderCell(createHeaderCell("Qty", boldFont));
            table.addHeaderCell(createHeaderCell("Assigned To", boldFont));
            table.addHeaderCell(createHeaderCell("Status", boldFont));

            for (HngReworkEntry r : reworks) {
                table.addCell(createBodyCell(r.getReworkNo(), font));
                table.addCell(
                        createBodyCell(String.valueOf(r.getReworkQty()), font).setTextAlignment(TextAlignment.CENTER));
                table.addCell(createBodyCell(r.getAssignedTo() != null ? r.getAssignedTo().getFirstName() : "—", font));
                table.addCell(createBodyCell(r.getStatus().toString(), font).setTextAlignment(TextAlignment.CENTER));
            }
            document.add(table);
        }

        document.add(new Paragraph("\nPacking Summary").setFont(boldFont).setFontSize(16).setMarginBottom(10));
        List<HngBatchPacking> packings = packingRepo.findByBatch_IdAndTenantId(batch.getId(),
                batch.getTenant().getId());

        if (packings.isEmpty()) {
            document.add(new Paragraph("No packing records found.").setFont(font).setItalic());
        } else {
            Table table = new Table(UnitValue.createPercentArray(new float[] { 3, 3, 4 })).useAllAvailableWidth();
            table.addHeaderCell(createHeaderCell("Packing Batch", boldFont));
            table.addHeaderCell(createHeaderCell("Qty Packed", boldFont));
            table.addHeaderCell(createHeaderCell("Cartons", boldFont));

            for (HngBatchPacking p : packings) {
                table.addCell(createBodyCell(p.getPackingBatchNo(), font));
                table.addCell(
                        createBodyCell(String.valueOf(p.getPackedQty()), font).setTextAlignment(TextAlignment.CENTER));
                table.addCell(createBodyCell(String.valueOf(p.getCartons().size()), font)
                        .setTextAlignment(TextAlignment.CENTER));
            }
            document.add(table);
        }
    }

    private void addInfoCell(Table table, String label, String value) {
        table.addCell(new Cell().add(new Paragraph(label).setFont(boldFont).setFontSize(9))
                .setBackgroundColor(new DeviceGray(0.95f)));
        table.addCell(new Cell().add(new Paragraph(value != null ? value : "—").setFont(font).setFontSize(9)));
    }

    private void addFooter(Document document) {
        Paragraph footer = new Paragraph("\nConfidential - GTR Hanger Manufacturing ERP - Internal Report")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.GRAY)
                .setFontSize(8)
                .setFont(font);
        document.add(footer);
    }

    private Cell createHeaderCell(String text, PdfFont cellFont) {
        return new Cell().add(new Paragraph(text).setFont(cellFont).setFontSize(10))
                .setBackgroundColor(new DeviceGray(0.9f))
                .setTextAlignment(TextAlignment.CENTER);
    }

    private Cell createBodyCell(String text, PdfFont cellFont) {
        return new Cell().add(new Paragraph(text != null ? text : "—").setFont(cellFont).setFontSize(9)).setPadding(4);
    }
}
