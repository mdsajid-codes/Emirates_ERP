package com.example.multi_tanent.hanger.service;

import com.example.multi_tanent.hanger.entity.HngJobCard;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class HngJobCardPdfService {

        private static final Logger logger = LoggerFactory.getLogger(HngJobCardPdfService.class);
        private PdfFont font;
        private PdfFont boldFont;

        public byte[] generateJobCardPdf(HngJobCard jobCard) {
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                try (
                                PdfWriter writer = new PdfWriter(baos);
                                PdfDocument pdf = new PdfDocument(writer);
                                Document document = new Document(pdf, PageSize.A4)) {
                        document.setMargins(36, 36, 36, 36);
                        loadFonts();

                        addHeader(document, jobCard);
                        document.add(new Paragraph("\n"));
                        addDetailsTable(document, jobCard);
                        document.add(new Paragraph("\n"));
                        addMetricsTable(document, jobCard);
                        document.add(new Paragraph("\n"));
                        addQualitySection(document, jobCard);
                        addFooter(document);

                } catch (Exception e) {
                        logger.error("Error generating Job Card PDF", e);
                        throw new RuntimeException("Error generating Job Card PDF", e);
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

        private void addHeader(Document document, HngJobCard jobCard) {
                Table headerTable = new Table(UnitValue.createPercentArray(new float[] { 3, 3 }))
                                .useAllAvailableWidth();
                headerTable.setBorder(Border.NO_BORDER);

                Cell left = new Cell().setBorder(Border.NO_BORDER);
                left.add(new Paragraph("PRODUCTION JOB CARD").setFont(boldFont).setFontSize(20)
                                .setFontColor(ColorConstants.BLUE));
                left.add(new Paragraph(jobCard.getTenant().getName()).setFont(boldFont).setFontSize(12));
                headerTable.addCell(left);

                Cell right = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT);
                right.add(new Paragraph("Job Card No: " + jobCard.getJobCardNo()).setFont(boldFont).setFontSize(12));
                right.add(new Paragraph("Batch No: " + jobCard.getBatch().getBatchNo()).setFont(font).setFontSize(10));
                right.add(new Paragraph(
                                "Date: " + jobCard.getCreatedAt().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")))
                                .setFont(font).setFontSize(10));
                headerTable.addCell(right);

                document.add(headerTable);
                document.add(
                                new com.itextpdf.layout.element.LineSeparator(
                                                new com.itextpdf.kernel.pdf.canvas.draw.SolidLine()));
        }

        private void addDetailsTable(Document document, HngJobCard jobCard) {
                document.add(new Paragraph("Operation Details").setFont(boldFont).setFontSize(14).setMarginBottom(5));
                Table table = new Table(UnitValue.createPercentArray(new float[] { 3, 7 })).useAllAvailableWidth();

                addInfoRow(table, "Workstation", jobCard.getWorkstation().getWorkstationName());
                addInfoRow(table, "Operator",
                                jobCard.getOperator().getFirstName() + " " + jobCard.getOperator().getLastName());
                addInfoRow(table, "Shift", jobCard.getShift());
                addInfoRow(table, "Hanger Type", jobCard.getBatch().getHangerType().getTypeName().getLabel());
                addInfoRow(table, "Tool/Die No", jobCard.getToolDieNo() != null ? jobCard.getToolDieNo() : "N/A");
                addInfoRow(table, "Start Time",
                                jobCard.getStartTime() != null
                                                ? jobCard.getStartTime()
                                                                .format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm"))
                                                : "N/A");
                addInfoRow(table, "End Time",
                                jobCard.getEndTime() != null
                                                ? jobCard.getEndTime()
                                                                .format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm"))
                                                : "N/A");

                document.add(table);
        }

        private void addMetricsTable(Document document, HngJobCard jobCard) {
                document.add(new Paragraph("Production Execution Metrics").setFont(boldFont).setFontSize(14)
                                .setMarginBottom(5)
                                .setMarginTop(10));
                Table table = new Table(UnitValue.createPercentArray(new float[] { 2, 2, 2, 2, 2 }))
                                .useAllAvailableWidth();

                table.addHeaderCell(createHeaderCell("Target Qty", boldFont));
                table.addHeaderCell(createHeaderCell("Produced Qty", boldFont));
                table.addHeaderCell(createHeaderCell("Rejected Qty", boldFont));
                table.addHeaderCell(createHeaderCell("OEE %", boldFont));
                table.addHeaderCell(createHeaderCell("Status", boldFont));

                table.addCell(
                                createBodyCell(String.valueOf(jobCard.getTargetQty()), font)
                                                .setTextAlignment(TextAlignment.CENTER));
                table.addCell(
                                createBodyCell(String.valueOf(jobCard.getProducedQty()), font)
                                                .setTextAlignment(TextAlignment.CENTER));
                table.addCell(
                                createBodyCell(String.valueOf(jobCard.getRejectedQty()), font)
                                                .setTextAlignment(TextAlignment.CENTER));
                table.addCell(createBodyCell(jobCard.getOeePct() != null ? jobCard.getOeePct() + "%" : "N/A", font)
                                .setTextAlignment(TextAlignment.CENTER));

                String status = jobCard.getProducedQty() >= jobCard.getTargetQty() ? "ACHIEVED" : "INCOMPLETE";
                table.addCell(createBodyCell(status, font).setTextAlignment(TextAlignment.CENTER));

                document.add(table);
        }

        private void addQualitySection(Document document, HngJobCard jobCard) {
                document.add(new Paragraph("Quality & Dimensions Check").setFont(boldFont).setFontSize(14)
                                .setMarginBottom(5)
                                .setMarginTop(10));
                Table table = new Table(UnitValue.createPercentArray(new float[] { 3, 3, 4 })).useAllAvailableWidth();

                table.addHeaderCell(createHeaderCell("Shoulder Width (mm)", boldFont));
                table.addHeaderCell(createHeaderCell("Hook Size (mm)", boldFont));
                table.addHeaderCell(createHeaderCell("Dimension Result", boldFont));

                table.addCell(createBodyCell(
                                jobCard.getActualShoulderWidthMm() != null
                                                ? String.valueOf(jobCard.getActualShoulderWidthMm())
                                                : "N/A",
                                font).setTextAlignment(TextAlignment.CENTER));
                table.addCell(createBodyCell(
                                jobCard.getActualHookSizeMm() != null ? String.valueOf(jobCard.getActualHookSizeMm())
                                                : "N/A",
                                font)
                                .setTextAlignment(TextAlignment.CENTER));

                String result = Boolean.TRUE.equals(jobCard.getDimensionPass()) ? "PASS" : "FAIL/CHECK";
                table.addCell(createBodyCell(result, font).setTextAlignment(TextAlignment.CENTER));

                document.add(table);

                if (jobCard.getRemarks() != null && !jobCard.getRemarks().isEmpty()) {
                        document.add(new Paragraph("\nRemarks:").setFont(boldFont).setFontSize(10));
                        document.add(new Paragraph(jobCard.getRemarks()).setFont(font).setFontSize(10));
                }
        }

        private void addInfoRow(Table table, String label, String value) {
                table.addCell(new Cell().add(new Paragraph(label).setFont(boldFont).setFontSize(10))
                                .setBackgroundColor(new DeviceGray(0.95f)));
                table.addCell(new Cell().add(new Paragraph(value != null ? value : "—").setFont(font).setFontSize(10)));
        }

        private void addFooter(Document document) {
                Paragraph footer = new Paragraph("\nProduced by GTR Hanger Manufacturing ERP")
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
                return new Cell().add(new Paragraph(text).setFont(cellFont).setFontSize(9)).setPadding(4);
        }
}
