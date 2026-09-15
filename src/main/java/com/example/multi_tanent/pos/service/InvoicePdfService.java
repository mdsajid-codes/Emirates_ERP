package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.pos.dto.InvoiceDto;
import com.example.multi_tanent.pos.dto.InvoiceItemDto;
import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.kernel.colors.ColorConstants;
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
    private static final String DASHED_SEP = "--------------------------------------------------";

    private PdfFont font;
    private PdfFont boldFont;

    public byte[] generateInvoicePdf(InvoiceDto invoice) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        float widthInPoints = 226.77f;
        int itemCount = (invoice != null && invoice.getItems() != null) ? invoice.getItems().size() : 1;
        float calculatedHeight = Math.max(500f, 320f + (itemCount * 38f));
        PageSize thermalPageSize = new PageSize(widthInPoints, calculatedHeight);

        try (
                PdfWriter writer = new PdfWriter(baos);
                PdfDocument pdf = new PdfDocument(writer);
                Document document = new Document(pdf, thermalPageSize)
        ) {
            document.setMargins(8, 8, 8, 8);

            loadFonts();

            addStoreHeader(document, invoice);
            addDashedSeparator(document);
            addTaxInvoiceTitle(document);
            addDashedSeparator(document);
            addMetadataSection(document, invoice);
            addDashedSeparator(document);
            addItemsTable(document, invoice);
            addDashedSeparator(document);
            addTotalsSection(document, invoice);
            addDashedSeparator(document);
            addFooterSection(document);

        } catch (Exception e) {
            logger.error("Error generating thermal receipt PDF", e);
            throw new RuntimeException("Error generating thermal receipt PDF", e);
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
                logger.warn("Custom font not found, falling back to Courier thermal font.", e);
                try {
                    font = PdfFontFactory.createFont("Courier");
                    boldFont = PdfFontFactory.createFont("Courier-Bold");
                } catch (IOException ex) {
                    throw new RuntimeException("Failed to load default fonts.", ex);
                }
            }
        }
    }

    private void addDashedSeparator(Document document) {
        Paragraph p = new Paragraph(DASHED_SEP)
                .setFont(boldFont)
                .setFontSize(7.5f)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(0.5f)
                .setMarginBottom(0.5f);
        document.add(p);
    }

    private void addStoreHeader(Document document, InvoiceDto invoice) {
        String storeName = (invoice != null && invoice.getStore() != null && invoice.getStore().getName() != null)
                ? invoice.getStore().getName().toUpperCase()
                : "EMIRATES ERP POS";

        Paragraph p = new Paragraph(storeName)
                .setFont(boldFont)
                .setFontSize(12f)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(2f)
                .setMarginBottom(1f);
        document.add(p);

        if (invoice != null && invoice.getStore() != null && invoice.getStore().getAddress() != null) {
            Paragraph addr = new Paragraph(invoice.getStore().getAddress())
                    .setFont(font)
                    .setFontSize(7f)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(2f);
            document.add(addr);
        }
    }

    private void addTaxInvoiceTitle(Document document) {
        Paragraph p = new Paragraph("*** TAX INVOICE ***")
                .setFont(boldFont)
                .setFontSize(9.5f)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(1f)
                .setMarginBottom(1f);
        document.add(p);
    }

    private void addMetadataSection(Document document, InvoiceDto invoice) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{6f, 4f})).useAllAvailableWidth();
        table.setMarginTop(2f).setMarginBottom(2f);

        String orderId = (invoice != null && invoice.getOrderId() != null) ? invoice.getOrderId() : (invoice != null ? invoice.getInvoiceNo() : "ORD-000000");
        String orderType = (invoice != null && invoice.getOrderType() != null) ? invoice.getOrderType() : "DINE IN";
        String dateStr = (invoice != null && invoice.getInvoiceDate() != null)
                ? invoice.getInvoiceDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy hh:mm a"))
                : "-";
        String customerStr = (invoice != null && invoice.getCustomer() != null && invoice.getCustomer().getName() != null)
                ? invoice.getCustomer().getName()
                : "Walk-in";
        String cashierStr = (invoice != null && invoice.getCashierName() != null) ? invoice.getCashierName() : "Admin";

        // Row 1: Order ID | Type
        Paragraph left1 = new Paragraph().setFontSize(7.5f)
                .add(new Text("Order ID: ").setFont(font))
                .add(new Text(orderId).setFont(boldFont));
        Paragraph right1 = new Paragraph().setFontSize(7.5f).setTextAlignment(TextAlignment.RIGHT)
                .add(new Text("Type: ").setFont(font))
                .add(new Text(orderType).setFont(boldFont));

        table.addCell(new Cell().add(left1).setBorder(Border.NO_BORDER).setPadding(1));
        table.addCell(new Cell().add(right1).setBorder(Border.NO_BORDER).setPadding(1));

        // Row 2: Date
        Paragraph left2 = new Paragraph().setFontSize(7.5f)
                .add(new Text("Date: ").setFont(font))
                .add(new Text(dateStr).setFont(font));

        table.addCell(new Cell(1, 2).add(left2).setBorder(Border.NO_BORDER).setPadding(1));

        // Row 3: Customer | Cashier
        Paragraph left3 = new Paragraph().setFontSize(7.5f)
                .add(new Text("Customer: ").setFont(font))
                .add(new Text(customerStr).setFont(boldFont));
        Paragraph right3 = new Paragraph().setFontSize(7.5f).setTextAlignment(TextAlignment.RIGHT)
                .add(new Text("Cashier: ").setFont(font))
                .add(new Text(cashierStr).setFont(boldFont));

        table.addCell(new Cell().add(left3).setBorder(Border.NO_BORDER).setPadding(1));
        table.addCell(new Cell().add(right3).setBorder(Border.NO_BORDER).setPadding(1));

        document.add(table);
    }

    private void addItemsTable(Document document, InvoiceDto invoice) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{4.6f, 1.2f, 2.1f, 2.1f})).useAllAvailableWidth();
        String currency = (invoice != null && invoice.getStore() != null && invoice.getStore().getCurrency() != null) ? invoice.getStore().getCurrency() : "AED";

        // Header
        table.addHeaderCell(createNoBorderCell("ITEM", boldFont, 8f, TextAlignment.LEFT));
        table.addHeaderCell(createNoBorderCell("QTY", boldFont, 8f, TextAlignment.CENTER));
        table.addHeaderCell(createNoBorderCell("PRICE", boldFont, 8f, TextAlignment.RIGHT));
        table.addHeaderCell(createNoBorderCell("TOTAL", boldFont, 8f, TextAlignment.RIGHT));

        if (invoice != null && invoice.getItems() != null) {
            for (InvoiceItemDto item : invoice.getItems()) {
                String itemText = item.getProductName();
                long unitPriceCents = item.getQuantity() > 0 ? (item.getLineTotalCents() / item.getQuantity()) : item.getLineTotalCents();

                table.addCell(createNoBorderCell(itemText, boldFont, 7.5f, TextAlignment.LEFT));
                table.addCell(createNoBorderCell(String.valueOf(item.getQuantity()), font, 7.5f, TextAlignment.CENTER));
                table.addCell(createNoBorderCell(formatCurrency(unitPriceCents, currency), font, 7.5f, TextAlignment.RIGHT));
                table.addCell(createNoBorderCell(formatCurrency(item.getLineTotalCents(), currency), boldFont, 7.5f, TextAlignment.RIGHT));
            }
        }

        document.add(table);
    }

    private void addTotalsSection(Document document, InvoiceDto invoice) {
        if (invoice == null) return;
        Table table = new Table(UnitValue.createPercentArray(new float[]{5.5f, 4.5f})).useAllAvailableWidth();
        table.setMarginTop(2f).setMarginBottom(2f);
        String currency = (invoice.getStore() != null && invoice.getStore().getCurrency() != null) ? invoice.getStore().getCurrency() : "AED";

        // Subtotal
        table.addCell(createNoBorderCell("Subtotal:", font, 8f, TextAlignment.LEFT));
        table.addCell(createNoBorderCell(formatCurrency(invoice.getSubtotalCents(), currency), font, 8f, TextAlignment.RIGHT));

        // Discount if any
        if (invoice.getDiscountCents() != null && invoice.getDiscountCents() > 0) {
            table.addCell(createNoBorderCell("Discount:", font, 8f, TextAlignment.LEFT));
            table.addCell(createNoBorderCell("-" + formatCurrency(invoice.getDiscountCents(), currency), font, 8f, TextAlignment.RIGHT));
        }

        // Tax
        if (invoice.getTaxCents() != null) {
            table.addCell(createNoBorderCell("Tax (Included):", font, 8f, TextAlignment.LEFT));
            table.addCell(createNoBorderCell(formatCurrency(invoice.getTaxCents(), currency), font, 8f, TextAlignment.RIGHT));
        }

        // Add Solid Divider before TOTAL
        Cell dividerCell = new Cell(1, 2).setBorder(Border.NO_BORDER)
                .setBorderTop(new SolidBorder(ColorConstants.BLACK, 1f))
                .setPadding(0);
        table.addCell(dividerCell);

        // GRAND TOTAL
        table.addCell(createNoBorderCell("TOTAL:", boldFont, 10f, TextAlignment.LEFT));
        table.addCell(createNoBorderCell(formatCurrency(invoice.getTotalCents(), currency), boldFont, 10f, TextAlignment.RIGHT));

        // Add Solid Divider below TOTAL
        Cell dividerCell2 = new Cell(1, 2).setBorder(Border.NO_BORDER)
                .setBorderTop(new SolidBorder(ColorConstants.BLACK, 1f))
                .setPadding(0);
        table.addCell(dividerCell2);

        // Payment Method
        String paymentMethod = (invoice.getPaymentMethod() != null) ? invoice.getPaymentMethod().toUpperCase() : "CASH";
        table.addCell(createNoBorderCell("Payment Method:", font, 8.5f, TextAlignment.LEFT));
        table.addCell(createNoBorderCell(paymentMethod, boldFont, 8.5f, TextAlignment.RIGHT));

        document.add(table);
    }

    private void addFooterSection(Document document) {
        Paragraph p1 = new Paragraph("Thank you for your business!")
                .setFont(boldFont)
                .setFontSize(8.5f)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(3f)
                .setMarginBottom(1f);
        document.add(p1);

        Paragraph p2 = new Paragraph("Please keep this receipt for warranty purposes.")
                .setFont(font)
                .setFontColor(ColorConstants.DARK_GRAY)
                .setFontSize(7f)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(3f);
        document.add(p2);
    }

    private Cell createNoBorderCell(String text, PdfFont cellFont, float fontSize, TextAlignment alignment) {
        Paragraph p = new Paragraph(text != null ? text : "").setFont(cellFont).setFontSize(fontSize);
        return new Cell().add(p)
                .setBorder(Border.NO_BORDER)
                .setPadding(1.5f)
                .setTextAlignment(alignment);
    }

    private String formatCurrency(Long cents, String currency) {
        if (cents == null) {
            cents = 0L;
        }
        double amount = cents / 100.0;
        return String.format("%s %.2f", currency != null ? currency : "AED", amount);
    }
}