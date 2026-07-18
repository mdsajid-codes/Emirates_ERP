package com.example.multi_tanent.sales.service;

import com.example.multi_tanent.sales.dto.QuotationItemResponse;
import com.example.multi_tanent.sales.dto.QuotationResponse;
import com.itextpdf.html2pdf.HtmlConverter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
public class QuotationPdfService {

    private final com.example.multi_tanent.sales.repository.SalesDocTemplateRepository templateRepository;
    private final com.example.multi_tanent.spersusers.repository.TenantRepository tenantRepository;

    public QuotationPdfService(com.example.multi_tanent.sales.repository.SalesDocTemplateRepository templateRepository,
            com.example.multi_tanent.spersusers.repository.TenantRepository tenantRepository) {
        this.templateRepository = templateRepository;
        this.tenantRepository = tenantRepository;
    }

    public byte[] generateQuotationPdf(QuotationResponse quotation) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        String htmlContent;

        java.util.Optional<String> templateContent = getTemplateContent(quotation);
        if (templateContent.isPresent()) {
            htmlContent = populateTemplate(templateContent.get(), quotation);
        } else {
            htmlContent = generateHardcodedHtml(quotation);
        }

        HtmlConverter.convertToPdf(htmlContent, baos);
        return baos.toByteArray();
    }

    public byte[] generatePdfFromHtml(String htmlContent) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        HtmlConverter.convertToPdf(htmlContent, baos);
        return baos.toByteArray();
    }

    private java.util.Optional<String> getTemplateContent(QuotationResponse quotation) {
        String tenantId = com.example.multi_tanent.config.TenantContext.getTenantId();
        Long tenantDbId = tenantRepository.findByTenantId(tenantId)
                .map(com.example.multi_tanent.spersusers.enitity.Tenant::getId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        if (quotation.getTemplate() != null) {
            // Try to find by name
            java.util.Optional<String> namedTemplate = templateRepository
                    .findByTenantIdAndDocType(tenantDbId, com.example.multi_tanent.sales.enums.SalesDocType.QUOTATION)
                    .stream()
                    .filter(t -> t.getName().equals(quotation.getTemplate()))
                    .findFirst()
                    .map(com.example.multi_tanent.sales.entity.SalesDocTemplate::getTemplateContent);

            if (namedTemplate.isPresent()) {
                return namedTemplate;
            }
        }

        // Fallback to default template
        return templateRepository
                .findByTenantIdAndDocTypeAndIsDefaultTrue(tenantDbId,
                        com.example.multi_tanent.sales.enums.SalesDocType.QUOTATION)
                .map(com.example.multi_tanent.sales.entity.SalesDocTemplate::getTemplateContent);
    }

    private String populateTemplate(String htmlTemplate, QuotationResponse quotation) {
        // Simple placeholder replacement implementation
        String populated = htmlTemplate
                .replace("{{customerName}}", quotation.getCustomerName() != null ? quotation.getCustomerName() : "")
                .replace("{{quotationNumber}}", quotation.getQuotationNumber())
                .replace("{{reference}}", quotation.getReference() != null ? quotation.getReference() : "")
                .replace("{{quotationDate}}",
                        quotation.getQuotationDate() != null
                                ? quotation.getQuotationDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                                : "")
                .replace("{{expiryDate}}",
                        quotation.getExpiryDate() != null
                                ? quotation.getExpiryDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                                : "")
                .replace("{{subTotal}}", String.valueOf(quotation.getSubTotal()))
                .replace("{{totalDiscount}}", String.valueOf(quotation.getTotalDiscount()))
                .replace("{{totalTax}}", String.valueOf(quotation.getTotalTax()))
                .replace("{{otherCharges}}", String.valueOf(quotation.getOtherCharges()))
                .replace("{{netTotal}}", String.valueOf(quotation.getNetTotal()))
                .replace("{{termsAndConditions}}",
                        quotation.getTermsAndConditions() != null ? quotation.getTermsAndConditions() : "")
                .replace("{{notes}}", quotation.getNotes() != null ? quotation.getNotes() : "");

        // Note: Item iteration is not supported in this simple replacement.
        // Real implementation would need a template engine.

        return populated;
    }

    private String generateHardcodedHtml(QuotationResponse quotation) {
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
        html.append("<div class='header'>Quotation</div>");

        // Info Section
        html.append("<div class='section'>");
        html.append("<table style='border: none;'>");
        html.append("<tr style='border: none;'><td style='border: none; width: 50%; vertical-align: top;'>");
        html.append("<div><span class='label'>Customer Name:</span> ")
                .append(quotation.getCustomerName() != null ? quotation.getCustomerName() : "").append("</div>");
        html.append("<div><span class='label'>Quotation No:</span> ").append(quotation.getQuotationNumber())
                .append("</div>");
        html.append("<div><span class='label'>Reference:</span> ")
                .append(quotation.getReference() != null ? quotation.getReference() : "").append("</div>");
        html.append("</td><td style='border: none; width: 50%; vertical-align: top;'>");
        html.append("<div><span class='label'>Date:</span> ")
                .append(quotation.getQuotationDate() != null ? quotation.getQuotationDate().format(formatter) : "")
                .append("</div>");
        html.append("<div><span class='label'>Expiry Date:</span> ")
                .append(quotation.getExpiryDate() != null ? quotation.getExpiryDate().format(formatter) : "")
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

        if (quotation.getItems() != null) {
            for (QuotationItemResponse item : quotation.getItems()) {
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
                .append(quotation.getSubTotal()).append("</span></div>");
        html.append("<div class='totals-row'><span class='label'>Total Discount:</span> <span>")
                .append(quotation.getTotalDiscount()).append("</span></div>");
        html.append("<div class='totals-row'><span class='label'>Total Tax:</span> <span>")
                .append(quotation.getTotalTax()).append("</span></div>");
        html.append("<div class='totals-row'><span class='label'>Other Charges:</span> <span>")
                .append(quotation.getOtherCharges()).append("</span></div>");
        html.append(
                "<div class='totals-row' style='font-size: 14px; font-weight: bold;'><span class='label'>Net Total:</span> <span>")
                .append(quotation.getNetTotal()).append("</span></div>");
        html.append("</div>");

        // Footer / Terms
        html.append("<div style='clear: both;'></div>");
        html.append("<div class='section'>");
        html.append("<div><span class='label'>Terms & Conditions:</span></div>");
        html.append("<div>").append(quotation.getTermsAndConditions() != null ? quotation.getTermsAndConditions() : "")
                .append("</div>");
        html.append("</div>");

        html.append("<div class='section'>");
        html.append("<div><span class='label'>Notes:</span></div>");
        html.append("<div>").append(quotation.getNotes() != null ? quotation.getNotes() : "").append("</div>");
        html.append("</div>");

        html.append("</body>");
        html.append("</html>");

        return html.toString();
    }
}
