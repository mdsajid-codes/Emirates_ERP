package com.example.multi_tanent.fleet.service;

import com.example.multi_tanent.fleet.entity.Trip;
import com.example.multi_tanent.fleet.entity.TripInvoice;
import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
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
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
public class TripInvoicePdfService {

    private static final Logger logger = LoggerFactory.getLogger(TripInvoicePdfService.class);
    private PdfFont font;
    private PdfFont boldFont;

    public byte[] generateInvoicePdf(TripInvoice invoice) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (
                PdfWriter writer = new PdfWriter(baos);
                PdfDocument pdf = new PdfDocument(writer);
                Document document = new Document(pdf, PageSize.A4)
        ) {
            document.setMargins(36, 36, 36, 36);

            loadFonts();

            addHeader(document, invoice);
            document.add(new Paragraph("\n"));
            addCustomerDetails(document, invoice);
            document.add(new Paragraph("\n"));
            addTripsTable(document, invoice);
            document.add(new Paragraph("\n"));
            addTotals(document, invoice);
            document.add(new Paragraph("\n\n"));
            addFooter(document);

        } catch (Exception e) {
            logger.error("Error generating trip invoice PDF", e);
            throw new RuntimeException("Error generating trip invoice PDF", e);
        }
        return baos.toByteArray();
    }

    private void loadFonts() {
        if (font == null || boldFont == null) {
            try {
                ClassPathResource fontRes = new ClassPathResource("fonts/NotoNaskhArabic-Regular.ttf");
                byte[] fontBytes = IOUtils.toByteArray(fontRes.getInputStream());
                font = PdfFontFactory.createFont(fontBytes, PdfEncodings.IDENTITY_H, PdfFontFactory.EmbeddingStrategy.PREFER_EMBEDDED);
                boldFont = PdfFontFactory.createFont(fontBytes, PdfEncodings.IDENTITY_H, PdfFontFactory.EmbeddingStrategy.PREFER_EMBEDDED);
            } catch (IOException e) {
                logger.warn("Custom font not found, falling back to default.", e);
                try {
                    font = PdfFontFactory.createFont("Helvetica");
                    boldFont = PdfFontFactory.createFont("Helvetica-Bold");
                } catch (IOException ex) {
                    throw new RuntimeException("Failed to load default fonts.", ex);
                }
            }
        }
    }

    private void addHeader(Document document, TripInvoice invoice) {
        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{1.5f, 3f, 1.5f})).useAllAvailableWidth();
        headerTable.setBorder(Border.NO_BORDER);

        headerTable.addCell(new Cell().add(new Paragraph("")).setBorder(Border.NO_BORDER));

        Cell center = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.CENTER);
        try {
            ClassPathResource logoRes = new ClassPathResource("static/logo.png");
            byte[] logoBytes = IOUtils.toByteArray(logoRes.getInputStream());
            ImageData imgData = ImageDataFactory.create(logoBytes);
            Image logo = new Image(imgData);
            logo.setMaxHeight(60);
            logo.setAutoScale(true);
            center.add(logo);
        } catch (Exception e) {
            logger.warn("Could not load logo.png");
        }
        
        center.add(new Paragraph(invoice.getTenant().getName()).setFont(boldFont).setFontSize(14));
        if (invoice.getTenant().getTenantId() != null) {
             center.add(new Paragraph("TRN: " + invoice.getTenant().getTenantId()).setFont(font).setFontSize(9));
        }
        headerTable.addCell(center);

        Cell titleCell = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT);
        titleCell.add(new Paragraph("TAX INVOICE").setFont(boldFont).setFontSize(14).setFontColor(ColorConstants.BLUE));
        titleCell.add(new Paragraph("Invoice #: " + invoice.getInvoiceNumber()).setFont(boldFont).setFontSize(10));
        titleCell.add(new Paragraph("Date: " + invoice.getInvoiceDate().format(DateTimeFormatter.ofPattern("dd-MM-yyyy"))).setFont(font).setFontSize(9));
        if (invoice.getDueDate() != null) {
            titleCell.add(new Paragraph("Due Date: " + invoice.getDueDate().format(DateTimeFormatter.ofPattern("dd-MM-yyyy"))).setFont(boldFont).setFontSize(9).setFontColor(ColorConstants.RED));
        }
        headerTable.addCell(titleCell);

        document.add(headerTable);
    }

    private void addCustomerDetails(Document document, TripInvoice invoice) {
        if (invoice.getCustomer() == null) return;

        Table customerTable = new Table(UnitValue.createPercentArray(new float[]{1, 1})).useAllAvailableWidth();
        customerTable.setBorder(Border.NO_BORDER);

        Cell billTo = new Cell().setBorder(Border.NO_BORDER);
        billTo.add(new Paragraph("BILL TO:").setFont(boldFont).setFontSize(10));
        billTo.add(new Paragraph(invoice.getCustomer().getCompanyName()).setFont(boldFont).setFontSize(11));
        if (invoice.getCustomer().getAddress() != null) {
            billTo.add(new Paragraph(invoice.getCustomer().getAddress()).setFont(font).setFontSize(9));
        }
        if (invoice.getCustomer().getTrnNumber() != null) {
            billTo.add(new Paragraph("TRN: " + invoice.getCustomer().getTrnNumber()).setFont(font).setFontSize(9));
        }
        customerTable.addCell(billTo);
        
        customerTable.addCell(new Cell().setBorder(Border.NO_BORDER)); // Empty right cell
        
        document.add(customerTable);
    }

    private void addTripsTable(Document document, TripInvoice invoice) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{2f, 2f, 3f, 2f, 2f, 2f})).useAllAvailableWidth();

        table.addHeaderCell(createHeaderCell("Trip No", boldFont));
        table.addHeaderCell(createHeaderCell("Date", boldFont));
        table.addHeaderCell(createHeaderCell("Route", boldFont));
        table.addHeaderCell(createHeaderCell("Amount", boldFont));
        table.addHeaderCell(createHeaderCell("VAT", boldFont));
        table.addHeaderCell(createHeaderCell("Total", boldFont));

        for (Trip trip : invoice.getTrips()) {
            table.addCell(createBodyCell("TRP-" + trip.getTripNo(), font));
            table.addCell(createBodyCell(trip.getTripDate().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")), font));
            table.addCell(createBodyCell(trip.getFromLocation() + " to " + trip.getToLocation(), font));
            
            BigDecimal tripBase = trip.getCharges() != null ? trip.getCharges().getAmount() : BigDecimal.ZERO;
            BigDecimal tripVat = trip.getCharges() != null ? trip.getCharges().getVatAmount() : BigDecimal.ZERO;
            BigDecimal tripTotal = trip.getCharges() != null ? trip.getCharges().getTotalAmount() : BigDecimal.ZERO;
            
            table.addCell(createBodyCell(tripBase.toString(), font).setTextAlignment(TextAlignment.RIGHT));
            table.addCell(createBodyCell(tripVat.toString(), font).setTextAlignment(TextAlignment.RIGHT));
            table.addCell(createBodyCell(tripTotal.toString(), font).setTextAlignment(TextAlignment.RIGHT));
        }

        document.add(table);
    }

    private void addTotals(Document document, TripInvoice invoice) {
        Table totalsTable = new Table(UnitValue.createPercentArray(new float[]{7, 3})).useAllAvailableWidth();

        addTotalRow(totalsTable, "Subtotal (Excl. VAT)", invoice.getSubTotalAmount());
        if (invoice.getTotalTokenAmount() != null && invoice.getTotalTokenAmount().compareTo(BigDecimal.ZERO) > 0) {
            addTotalRow(totalsTable, "Token Amount (0% VAT)", invoice.getTotalTokenAmount());
        }
        if (invoice.getTotalOtherCharges() != null && invoice.getTotalOtherCharges().compareTo(BigDecimal.ZERO) > 0) {
            addTotalRow(totalsTable, "Other Charges", invoice.getTotalOtherCharges());
        }
        addTotalRow(totalsTable, "Total VAT (5%)", invoice.getTotalVatAmount());
        
        Cell grandTotalLabel = new Cell().add(new Paragraph("GRAND TOTAL").setFont(boldFont).setFontSize(12)).setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT);
        Cell grandTotalVal = new Cell().add(new Paragraph(invoice.getGrandTotal().toString() + " AED").setFont(boldFont).setFontSize(12).setFontColor(ColorConstants.BLUE)).setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT);
        
        totalsTable.addCell(grandTotalLabel);
        totalsTable.addCell(grandTotalVal);

        document.add(totalsTable);
    }

    private void addTotalRow(Table table, String label, BigDecimal value) {
        table.addCell(new Cell().add(new Paragraph(label).setFont(font).setFontSize(10)).setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT));
        table.addCell(new Cell().add(new Paragraph(value != null ? value.toString() : "0.00").setFont(font).setFontSize(10)).setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT));
    }

    private Cell createHeaderCell(String text, PdfFont cellFont) {
        return new Cell().add(new Paragraph(text).setFont(cellFont).setFontSize(10))
                .setBackgroundColor(new DeviceGray(0.9f))
                .setTextAlignment(TextAlignment.CENTER);
    }

    private Cell createBodyCell(String text, PdfFont cellFont) {
        return new Cell().add(new Paragraph(text).setFont(cellFont).setFontSize(9)).setPadding(4);
    }

    private void addFooter(Document document) {
        Paragraph footer = new Paragraph("Thank you for your business!\nThis is a computer generated document and does not require a signature.")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.GRAY)
                .setFontSize(9)
                .setFont(font);
        document.add(footer);
    }
}
