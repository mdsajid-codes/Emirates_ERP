package com.example.multi_tanent.hanger.service;

import com.example.multi_tanent.hanger.entity.HngBatchPacking;
import com.example.multi_tanent.hanger.entity.HngPackingCarton;
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
public class HngBatchPackingPdfService {

    private static final Logger logger = LoggerFactory.getLogger(HngBatchPackingPdfService.class);
    private PdfFont font;
    private PdfFont boldFont;

    public byte[] generatePackingListPdf(HngBatchPacking packing) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (
                PdfWriter writer = new PdfWriter(baos);
                PdfDocument pdf = new PdfDocument(writer);
                Document document = new Document(pdf, PageSize.A4)) {
            document.setMargins(36, 36, 36, 36);
            loadFonts();

            addHeader(document, packing);
            document.add(new Paragraph("\n"));
            addCartonTable(document, packing);
            document.add(new Paragraph("\n"));
            addSummary(document, packing);
            addFooter(document);

        } catch (Exception e) {
            logger.error("Error generating packing list PDF", e);
            throw new RuntimeException("Error generating packing list PDF", e);
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

    private void addHeader(Document document, HngBatchPacking packing) {
        Table headerTable = new Table(UnitValue.createPercentArray(new float[] { 3, 3 })).useAllAvailableWidth();
        headerTable.setBorder(Border.NO_BORDER);

        Cell left = new Cell().setBorder(Border.NO_BORDER);
        left.add(new Paragraph("PACKING LIST").setFont(boldFont).setFontSize(20).setFontColor(ColorConstants.BLUE));
        left.add(new Paragraph(packing.getTenant().getName()).setFont(boldFont).setFontSize(12));
        headerTable.addCell(left);

        Cell right = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT);
        right.add(new Paragraph("Batch No: " + packing.getPackingBatchNo()).setFont(boldFont).setFontSize(12));
        right.add(new Paragraph("Date: " + packing.getCreatedAt().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")))
                .setFont(font).setFontSize(10));
        if (packing.getSalesOrder() != null) {
            right.add(
                    new Paragraph("Sales Order: " + packing.getSalesOrder().getSalesOrderNumber()).setFont(font)
                            .setFontSize(10));
        }
        headerTable.addCell(right);

        document.add(headerTable);
        document.add(
                new com.itextpdf.layout.element.LineSeparator(new com.itextpdf.kernel.pdf.canvas.draw.SolidLine()));
    }

    private void addCartonTable(Document document, HngBatchPacking packing) {
        Table table = new Table(UnitValue.createPercentArray(new float[] { 2, 2, 2, 2, 2 })).useAllAvailableWidth();

        table.addHeaderCell(createHeaderCell("Carton No", boldFont));
        table.addHeaderCell(createHeaderCell("Bundles", boldFont));
        table.addHeaderCell(createHeaderCell("Qty", boldFont));
        table.addHeaderCell(createHeaderCell("Gross Weight (kg)", boldFont));
        table.addHeaderCell(createHeaderCell("Status", boldFont));

        for (HngPackingCarton carton : packing.getCartons()) {
            table.addCell(createBodyCell(carton.getCartonNo(), font));
            table.addCell(createBodyCell(String.valueOf(carton.getBundlesInCarton()), font)
                    .setTextAlignment(TextAlignment.CENTER));
            table.addCell(createBodyCell(String.valueOf(carton.getQtyInCarton()), font)
                    .setTextAlignment(TextAlignment.CENTER));
            table.addCell(createBodyCell(String.valueOf(carton.getGrossWeightKg()), font)
                    .setTextAlignment(TextAlignment.RIGHT));
            table.addCell(
                    createBodyCell(carton.getSealStatus().toString(), font).setTextAlignment(TextAlignment.CENTER));
        }

        document.add(table);
    }

    private void addSummary(Document document, HngBatchPacking packing) {
        Table summaryTable = new Table(UnitValue.createPercentArray(new float[] { 7, 3 })).useAllAvailableWidth();
        summaryTable.setBorder(Border.NO_BORDER);

        summaryTable.addCell(new Cell().add(new Paragraph("Total Packed Quantity:").setFont(boldFont))
                .setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT));
        summaryTable.addCell(new Cell().add(new Paragraph(String.valueOf(packing.getPackedQty())).setFont(boldFont))
                .setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT));

        summaryTable.addCell(new Cell().add(new Paragraph("Total Gross Weight:").setFont(boldFont))
                .setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT));
        summaryTable.addCell(new Cell().add(new Paragraph(packing.getGrossWeightKg() + " kg").setFont(boldFont))
                .setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT));

        document.add(summaryTable);
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
