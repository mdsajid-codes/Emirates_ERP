package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.pos.dto.InvoiceDto;
import com.example.multi_tanent.pos.dto.InvoiceItemDto;
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
import com.itextpdf.layout.borders.SolidBorder;
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
import java.time.format.DateTimeFormatter;

@Service
public class InvoicePdfService {

    private static final Logger logger = LoggerFactory.getLogger(InvoicePdfService.class);
    private PdfFont font;
    private PdfFont boldFont;

    public byte[] generateInvoicePdf(InvoiceDto invoice) {
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
            addItemsTable(document, invoice);
            document.add(new Paragraph("\n"));
            addTotals(document, invoice);
            document.add(new Paragraph("\n\n"));
            addFooter(document);

        } catch (Exception e) {
            logger.error("Error generating invoice PDF", e);
            throw new RuntimeException("Error generating invoice PDF", e);
        }
        return baos.toByteArray();
    }

    private void loadFonts() {
        if (font == null || boldFont == null) {
            try {
                // Load font from resources (TTF) — ensures Arabic/Unicode support
                ClassPathResource fontRes = new ClassPathResource("fonts/NotoNaskhArabic-Regular.ttf");
                byte[] fontBytes = IOUtils.toByteArray(fontRes.getInputStream());
                font = PdfFontFactory.createFont(fontBytes, PdfEncodings.IDENTITY_H, PdfFontFactory.EmbeddingStrategy.PREFER_EMBEDDED);
                boldFont = PdfFontFactory.createFont(fontBytes, PdfEncodings.IDENTITY_H, PdfFontFactory.EmbeddingStrategy.PREFER_EMBEDDED); // Using same font file for bold for simplicity
            } catch (IOException e) {
                logger.warn("Custom font not found, falling back to default. Arabic/Unicode may not render correctly.", e);
                // Fallback to default fonts if custom font is not found
                try {
                    font = PdfFontFactory.createFont("Helvetica");
                    boldFont = PdfFontFactory.createFont("Helvetica-Bold");
                } catch (IOException ex) {
                    throw new RuntimeException("Failed to load even default fonts.", ex);
                }
            }
        }
    }

    private void addHeader(Document document, InvoiceDto invoice) {
        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{1.5f, 3f, 1.5f})).useAllAvailableWidth();
        headerTable.setBorder(Border.NO_BORDER);

        // left cell (empty)
        headerTable.addCell(new Cell().add(new Paragraph("")).setBorder(Border.NO_BORDER));

        // center cell: logo + company name
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
            logger.warn("Could not load logo.png from classpath.", e);
        }
        if (invoice.getStore() != null) {
            center.add(new Paragraph(invoice.getStore().getName()).setFont(boldFont).setFontSize(12));
            center.add(new Paragraph(invoice.getStore().getAddress()).setFont(font).setFontSize(9));
        }
        headerTable.addCell(center);

        // right cell: invoice metadata
        Cell titleCell = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT);
        titleCell.add(new Paragraph("TAX Invoice").setFont(boldFont).setFontSize(12));
        titleCell.add(new Paragraph("Ref# " + invoice.getInvoiceNo()).setFont(font).setFontSize(9));
        titleCell.add(new Paragraph("Date: " + invoice.getInvoiceDate().format(DateTimeFormatter.ofPattern("dd-MM-yyyy"))).setFont(font).setFontSize(8));
        if (invoice.getOrderId() != null) {
            titleCell.add(new Paragraph("Order #: " + invoice.getOrderId()).setFont(font).setFontSize(8));
        }
        headerTable.addCell(titleCell);

        document.add(headerTable);
    }

    private void addCustomerDetails(Document document, InvoiceDto invoice) {
        if (invoice.getCustomer() == null) return;

        document.add(new Paragraph("Customer: " + invoice.getCustomer().getName()).setFont(font).setFontSize(10));
    }

    private void addItemsTable(Document document, InvoiceDto invoice) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{6f, 1f, 2f})).useAllAvailableWidth();
        String currency = (invoice.getStore() != null && invoice.getStore().getCurrency() != null) ? invoice.getStore().getCurrency() : "AED";

        // Headers
        table.addHeaderCell(createHeaderCell("Item / وصف", boldFont));
        table.addHeaderCell(createHeaderCell("Qty\nكمية", boldFont));
        table.addHeaderCell(createHeaderCell("Sub Total\nكلفة", boldFont));

        // Items
        for (InvoiceItemDto item : invoice.getItems()) {
            table.addCell(createBodyCell(item.getProductName() + "\n" + item.getVariantInfo(), font));
            table.addCell(createBodyCell(String.valueOf(item.getQuantity()), font).setTextAlignment(TextAlignment.CENTER));
            table.addCell(createBodyCell(formatCurrency(item.getLineTotalCents(), currency), font).setTextAlignment(TextAlignment.RIGHT));
        }

        document.add(table);
    }

    private void addTotals(Document document, InvoiceDto invoice) {
        Table totalsTable = new Table(UnitValue.createPercentArray(new float[]{7, 2})).useAllAvailableWidth();
        String currency = (invoice.getStore() != null && invoice.getStore().getCurrency() != null) ? invoice.getStore().getCurrency() : "AED";

        totalsTable.addCell(new Cell(1,1).add(new Paragraph("Subtotal / المبلغ الأساسي").setFont(font)).setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT));
        totalsTable.addCell(new Cell().add(new Paragraph(formatCurrency(invoice.getSubtotalCents(), currency)).setFont(font)).setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT));

        totalsTable.addCell(new Cell(1,1).add(new Paragraph("Discount / خصم").setFont(font)).setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT));
        totalsTable.addCell(new Cell().add(new Paragraph(formatCurrency(invoice.getDiscountCents(), currency)).setFont(font)).setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT));

        long amountBeforeVat = invoice.getSubtotalCents() - invoice.getDiscountCents();
        totalsTable.addCell(new Cell(1,1).add(new Paragraph("Amount Before VAT / المبلغ قبل الضريبة").setFont(font)).setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT));
        totalsTable.addCell(new Cell().add(new Paragraph(formatCurrency(amountBeforeVat, currency)).setFont(font)).setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT));

        totalsTable.addCell(new Cell(1,1).add(new Paragraph("VAT / ضريبة القيمة المضافة").setFont(font)).setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT));
        totalsTable.addCell(new Cell().add(new Paragraph(formatCurrency(invoice.getTaxCents(), currency)).setFont(font)).setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT));

        totalsTable.addCell(new Cell(1,1).add(new Paragraph("Grand Total/ المجموع الكلي").setFont(boldFont).setFontSize(11)).setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT));
        totalsTable.addCell(new Cell().add(new Paragraph(formatCurrency(invoice.getTotalCents(), currency)).setFont(boldFont).setFontSize(11)).setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT));

        document.add(totalsTable);
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
        Paragraph footer = new Paragraph("Thank you for your business! / شكرا لتعاملكم معنا")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.GRAY)
                .setFontSize(9)
                .setFont(font);
        document.add(footer);
    }

    private String formatCurrency(Long cents, String currency) {
        if (cents == null) {
            cents = 0L;
        }
        double amount = cents / 100.0;
        return String.format("%.2f %s", amount, currency != null ? currency : "AED");
    }
}