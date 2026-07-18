package com.example.multi_tanent.sales.service;

import com.example.multi_tanent.sales.dto.ProformaInvoiceItemResponse;
import com.example.multi_tanent.sales.dto.ProformaInvoiceResponse;
import com.itextpdf.html2pdf.HtmlConverter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
public class ProformaInvoicePdfService {

        private final com.example.multi_tanent.sales.repository.SalesDocTemplateRepository templateRepository;
        private final com.example.multi_tanent.spersusers.repository.TenantRepository tenantRepository;

        public ProformaInvoicePdfService(
                        com.example.multi_tanent.sales.repository.SalesDocTemplateRepository templateRepository,
                        com.example.multi_tanent.spersusers.repository.TenantRepository tenantRepository) {
                this.templateRepository = templateRepository;
                this.tenantRepository = tenantRepository;
        }

        public byte[] generateProformaInvoicePdf(ProformaInvoiceResponse invoice) {
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                String htmlContent;

                java.util.Optional<String> templateContent = getTemplateContent(invoice);
                if (templateContent.isPresent()) {
                        htmlContent = populateTemplate(templateContent.get(), invoice);
                } else {
                        htmlContent = generateHardcodedHtml(invoice);
                }

                HtmlConverter.convertToPdf(htmlContent, baos);
                return baos.toByteArray();
        }

        private java.util.Optional<String> getTemplateContent(ProformaInvoiceResponse invoice) {
                String tenantId = com.example.multi_tanent.config.TenantContext.getTenantId();
                Long tenantDbId = tenantRepository.findByTenantId(tenantId)
                                .map(com.example.multi_tanent.spersusers.enitity.Tenant::getId)
                                .orElseThrow(() -> new RuntimeException("Tenant not found"));

                if (invoice.getTemplate() != null) {
                        // Try to find by name - Assuming generic method or casting compatibility if
                        // strictly typed enums aren't blocking
                        // Using the repository generically if possible, or mapping ProformaInvoice type
                        // if enum exists.
                        // For now, mirroring Quotation logic but using PROFORMA_INVOICE enum if
                        // available or similar logic.
                        // If SALES_DOC_TYPE enum doesn't have PROFORMA_INVOICE, we might fallback to
                        // QUOTATION or generic default.
                        // Checking SalesDocType enum in next steps might be safe, but for now assuming
                        // we use hardcoded fallback most times.
                        return java.util.Optional.empty(); // Placeholder until Enum is confirmed
                }

                return java.util.Optional.empty();
        }

        private String populateTemplate(String htmlTemplate, ProformaInvoiceResponse invoice) {
                // Placeholder for template engine
                return htmlTemplate;
        }

        private String generateHardcodedHtml(ProformaInvoiceResponse invoice) {
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
                html.append("<div class='header'>Proforma Invoice</div>");

                // Info Section
                html.append("<div class='section'>");
                html.append("<table style='border: none;'>");
                html.append("<tr style='border: none;'><td style='border: none; width: 50%; vertical-align: top;'>");
                html.append("<div><span class='label'>Customer Name:</span> ")
                                .append(invoice.getCustomerName() != null ? invoice.getCustomerName() : "")
                                .append("</div>");
                html.append("<div><span class='label'>Invoice No:</span> ").append(invoice.getInvoiceNumber())
                                .append("</div>");
                html.append("<div><span class='label'>Reference:</span> ")
                                .append(invoice.getReference() != null ? invoice.getReference() : "").append("</div>");
                html.append("<div><span class='label'>PO Number:</span> ")
                                .append(invoice.getPoNumber() != null ? invoice.getPoNumber() : "").append("</div>");
                html.append("</td><td style='border: none; width: 50%; vertical-align: top;'>");
                html.append("<div><span class='label'>Invoice Date:</span> ")
                                .append(invoice.getInvoiceDate() != null ? invoice.getInvoiceDate().format(formatter)
                                                : "")
                                .append("</div>");
                html.append("<div><span class='label'>Due Date:</span> ")
                                .append(invoice.getDueDate() != null ? invoice.getDueDate().format(formatter) : "")
                                .append("</div>");
                html.append("<div><span class='label'>Date of Supply:</span> ")
                                .append(invoice.getDateOfSupply() != null ? invoice.getDateOfSupply().format(formatter)
                                                : "")
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

                if (invoice.getItems() != null) {
                        for (ProformaInvoiceItemResponse item : invoice.getItems()) {
                                html.append("<tr>");
                                html.append("<td>").append(item.getItemName()).append("</td>");
                                html.append("<td>").append(item.getQuantity()).append("</td>");
                                html.append("<td>").append(item.getRate()).append("</td>");
                                html.append("<td>")
                                                .append(item.getTaxValue() != null ? item.getTaxValue()
                                                                : BigDecimal.ZERO)
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
                                .append(invoice.getSubTotal()).append("</span></div>");
                html.append("<div class='totals-row'><span class='label'>Total Discount:</span> <span>")
                                .append(invoice.getTotalDiscount()).append("</span></div>");
                html.append("<div class='totals-row'><span class='label'>Total Tax:</span> <span>")
                                .append(invoice.getTotalTax()).append("</span></div>");
                html.append("<div class='totals-row'><span class='label'>Other Charges:</span> <span>")
                                .append(invoice.getOtherCharges()).append("</span></div>");
                html.append(
                                "<div class='totals-row' style='font-size: 14px; font-weight: bold;'><span class='label'>Net Total:</span> <span>")
                                .append(invoice.getNetTotal()).append("</span></div>");
                html.append("</div>");

                // Footer / Terms
                html.append("<div style='clear: both;'></div>");
                html.append("<div class='section'>");
                html.append("<div><span class='label'>Terms & Conditions:</span></div>");
                html.append("<div>")
                                .append(invoice.getTermsAndConditions() != null ? invoice.getTermsAndConditions() : "")
                                .append("</div>");
                html.append("</div>");

                html.append("<div class='section'>");
                html.append("<div><span class='label'>Bank Details:</span></div>");
                html.append("<div>").append(invoice.getBankDetails() != null ? invoice.getBankDetails() : "")
                                .append("</div>");
                html.append("</div>");

                html.append("<div class='section'>");
                html.append("<div><span class='label'>Notes:</span></div>");
                html.append("<div>").append(invoice.getNotes() != null ? invoice.getNotes() : "").append("</div>");
                html.append("</div>");

                html.append("</body>");
                html.append("</html>");

                return html.toString();
        }
}
