package com.example.multi_tanent.sales.service;

import com.example.multi_tanent.sales.dto.SalesOrderItemResponse;
import com.example.multi_tanent.sales.dto.SalesOrderResponse;
import com.itextpdf.html2pdf.HtmlConverter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
public class SalesOrderPdfService {

    public byte[] generateSalesOrderPdf(SalesOrderResponse salesOrder) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        String htmlContent = generateHtml(salesOrder);
        HtmlConverter.convertToPdf(htmlContent, baos);
        return baos.toByteArray();
    }

    public byte[] generatePdfFromHtml(String htmlContent) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        HtmlConverter.convertToPdf(htmlContent, baos);
        return baos.toByteArray();
    }

    private String generateHtml(SalesOrderResponse salesOrder) {
        StringBuilder html = new StringBuilder();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        html.append("<!DOCTYPE html>");
        html.append("<html>");
        html.append("<head>");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }");
        html.append(
                ".header { background-color: #0099cc; color: white; padding: 10px; text-align: center; font-size: 20px; font-weight: bold; }");
        html.append(".section { margin-top: 20px; }");
        html.append(".row { display: flex; justify-content: space-between; }");
        html.append(".column { width: 48%; }");
        html.append(".label { font-weight: bold; }");
        html.append("table { width: 100%; border-collapse: collapse; margin-top: 20px; }");
        html.append("th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }");
        html.append("th { background-color: #f2f2f2; }");
        html.append(".totals { margin-top: 20px; float: right; width: 40%; }");
        html.append(".totals-row { display: flex; justify-content: space-between; padding: 5px 0; }");
        html.append(".footer { margin-top: 50px; border-top: 1px solid #ddd; padding-top: 10px; font-size: 10px; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");

        // Header
        html.append("<div class='header'>Sales Order</div>");

        // Info Section
        html.append("<div class='section'>");
        html.append("<table style='border: none;'>");
        html.append("<tr style='border: none;'><td style='border: none; width: 50%; vertical-align: top;'>");
        html.append("<div><span class='label'>Customer Name:</span> ")
                .append(salesOrder.getCustomerName() != null ? salesOrder.getCustomerName() : "").append("</div>");
        html.append("<div><span class='label'>Sales Order No:</span> ").append(salesOrder.getSalesOrderNumber())
                .append("</div>");
        html.append("<div><span class='label'>Reference:</span> ")
                .append(salesOrder.getReference() != null ? salesOrder.getReference() : "").append("</div>");
        html.append("</td><td style='border: none; width: 50%; vertical-align: top;'>");
        html.append("<div><span class='label'>Date:</span> ")
                .append(salesOrder.getSalesOrderDate() != null ? salesOrder.getSalesOrderDate().format(formatter) : "")
                .append("</div>");
        html.append("<div><span class='label'>Customer PO No:</span> ")
                .append(salesOrder.getCustomerPoNo() != null ? salesOrder.getCustomerPoNo() : "").append("</div>");
        html.append("<div><span class='label'>Salesperson:</span> ")
                .append(salesOrder.getSalespersonName() != null ? salesOrder.getSalespersonName() : "")
                .append("</div>");
        html.append("</td></tr>");
        html.append("</table>");
        html.append("</div>");

        // Items Table
        html.append("<table>");
        html.append("<thead>");
        html.append("<tr>");
        html.append("<th>Item & Description</th>");
        html.append("<th>Quantity</th>");
        html.append("<th>Rate</th>");
        html.append("<th>Tax</th>");
        html.append("<th>Amount</th>");
        html.append("</tr>");
        html.append("</thead>");
        html.append("<tbody>");

        if (salesOrder.getItems() != null) {
            for (SalesOrderItemResponse item : salesOrder.getItems()) {
                html.append("<tr>");
                html.append("<td>").append(item.getItemName()).append("</td>");
                html.append("<td>").append(item.getQuantity()).append("</td>");
                html.append("<td>").append(item.getRate()).append("</td>");
                html.append("<td>").append(item.getTaxValue() != null ? item.getTaxValue() : BigDecimal.ZERO)
                        .append("</td>");
                html.append("<td>").append(item.getAmount()).append("</td>");
                html.append("</tr>");
            }
        }

        html.append("</tbody>");
        html.append("</table>");

        // Totals Section
        html.append("<div class='totals'>");
        html.append("<div class='totals-row'><span class='label'>Sub Total:</span> <span>")
                .append(salesOrder.getSubTotal()).append("</span></div>");
        html.append("<div class='totals-row'><span class='label'>Total Discount:</span> <span>")
                .append(salesOrder.getTotalDiscount()).append("</span></div>");
        html.append("<div class='totals-row'><span class='label'>Total Tax:</span> <span>")
                .append(salesOrder.getTotalTax()).append("</span></div>");
        html.append("<div class='totals-row'><span class='label'>Other Charges:</span> <span>")
                .append(salesOrder.getOtherCharges()).append("</span></div>");
        html.append(
                "<div class='totals-row' style='font-size: 14px; font-weight: bold;'><span class='label'>Net Total:</span> <span>")
                .append(salesOrder.getNetTotal()).append("</span></div>");
        html.append("</div>");

        // Footer / Terms
        html.append("<div style='clear: both;'></div>");
        html.append("<div class='section'>");
        html.append("<div><span class='label'>Terms & Conditions:</span></div>");
        html.append("<div>")
                .append(salesOrder.getTermsAndConditions() != null ? salesOrder.getTermsAndConditions() : "")
                .append("</div>");
        html.append("</div>");

        html.append("<div class='section'>");
        html.append("<div><span class='label'>Notes:</span></div>");
        html.append("<div>").append(salesOrder.getNotes() != null ? salesOrder.getNotes() : "").append("</div>");
        html.append("</div>");

        html.append("</body>");
        html.append("</html>");

        return html.toString();
    }
}
