package com.example.multi_tanent.master.service;

import com.example.multi_tanent.master.entity.MasterTenant;
import com.example.multi_tanent.master.entity.MyCompanyInfo;
import com.example.multi_tanent.master.entity.TenantCompanyInfo;
import com.example.multi_tanent.master.entity.TenantSubscriptionInvoice;
import com.example.multi_tanent.master.repository.MyCompanyInfoRepository;
import com.example.multi_tanent.master.repository.TenantCompanyInfoRepository;
import com.itextpdf.html2pdf.HtmlConverter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TenantInvoicePdfService {

        private final MyCompanyInfoRepository myCompanyInfoRepository;
        private final TenantCompanyInfoRepository tenantCompanyInfoRepository;
        private final TenantSubscriptionInvoiceService invoiceService;

        public byte[] generateInvoicePdf(Long invoiceId) throws IOException {
                TenantSubscriptionInvoice invoice = invoiceService.getInvoiceEntity(invoiceId);
                MasterTenant masterTenant = invoice.getMasterTenant();

                Optional<MyCompanyInfo> hostInfoOpt = myCompanyInfoRepository.findAll().stream().findFirst();
                Optional<TenantCompanyInfo> tenantInfoOpt = tenantCompanyInfoRepository
                                .findByMasterTenantId(masterTenant.getId());

                String htmlContent = generateHtml(hostInfoOpt.orElse(null), tenantInfoOpt.orElse(null), invoice,
                                masterTenant);

                ByteArrayOutputStream out = new ByteArrayOutputStream();
                HtmlConverter.convertToPdf(htmlContent, out);
                return out.toByteArray();
        }

        private String generateHtml(MyCompanyInfo hostInfo, TenantCompanyInfo tenantInfo,
                        TenantSubscriptionInvoice invoice,
                        MasterTenant tenant) {
                StringBuilder html = new StringBuilder();

                html.append("<!DOCTYPE html>");
                html.append("<html lang=\"en\">");
                html.append("<head>");
                html.append("<meta charset=\"UTF-8\">");
                html.append("<title>Tenant Invoice</title>");
                html.append("<style>");
                // Embedding User's Custom CSS
                html.append(
                                "body { font-family: 'Helvetica', Arial, sans-serif; background-color: #ffffff; padding: 20px; font-size: 14px; color: #333; }");
                html.append(".invoice-container { max-width: 800px; margin: 0; background: #fff; padding: 0px; }");

                // Header
                html.append(
                                ".invoice-header { margin-bottom: 20px; }");
                html.append(".host-logo { width: 50%; float: left; }");
                html.append(".host-details { width: 50%; float: right; text-align: right; }");
                html.append(".host-details h1 { margin: 0; color: #333; font-size: 24px; font-weight: bold; }");
                html.append(".host-details p { margin: 2px 0; font-size: 14px; color: #666; }");

                html.append(".clearfix::after { content: \"\"; clear: both; display: table; }");

                // Middle
                html.append(".invoice-middle { margin-top: 30px; }");
                html.append(".bill-to { width: 50%; float: left; }");
                html.append(".invoice-info { width: 40%; float: right; text-align: right; }");
                html.append(".bill-to h3 { margin-bottom: 10px; font-size: 16px; color: #333; font-weight: bold; }");
                html.append(
                                ".invoice-label { color: #0056b3; margin-top: 0; font-size: 32px; font-weight: 800; text-align: right; }");

                // Status Badge Simulation
                html.append(
                                ".status-badge { display: inline-block; background: #e1f5fe; color: #01579b; padding: 4px 12px; border-radius: 4px; font-weight: bold; font-size: 12px; text-transform: uppercase; }");

                // Table
                html.append(".details-table { width: 100%; border-collapse: collapse; margin: 30px 0; }");
                html.append(
                                ".details-table th { background-color: #f1f1f1; text-align: left; padding: 12px; border-bottom: 2px solid #ddd; font-size: 13px; text-transform: uppercase; color: #555; }");
                html.append(".details-table td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }");
                html.append(".text-right { text-align: right; }");
                html.append(".text-gray-400 { color: #9ca3af; }");
                html.append(".font-medium { font-weight: 500; }");
                html.append(".font-bold { font-weight: 700; }");

                // Total
                html.append(
                                ".total-section { text-align: right; font-size: 20px; margin-top: 20px; color: #333; border-top: 2px solid #f1f1f1; padding-top: 10px; }");
                html.append(
                                ".total-row { display: flex; justify-content: flex-end; margin-bottom: 5px; font-size: 14px; color: #666; }");

                // Footer
                html.append(".invoice-footer { margin-top: 50px; border-top: 1px solid #eee; padding-top: 30px; }");
                html.append(".signature-box { float: left; width: 40%; }");
                html.append(".stamp-box { float: right; width: 30%; text-align: right; }");

                // Images / Placeholders
                html.append(".img-responsive { max-width: 100px; max-height: 100px; }");
                html.append(".sig-img { max-width: 150px; max-height: 60px; }");
                html.append(".stamp-img { max-width: 80px; max-height: 80px; }");

                html.append("</style>");
                html.append("</head>");
                html.append("<body>");

                html.append("<div class=\"invoice-container\">");

                // 1. Header
                html.append("<header class=\"invoice-header clearfix\">");

                // Host Logo
                html.append("<div class=\"host-logo\">");
                if (hostInfo != null && hostInfo.getLogoUrl() != null) {
                        html.append("<img src=\"").append(hostInfo.getLogoUrl())
                                        .append("\" class=\"img-responsive\" />");
                }
                html.append("</div>");

                // Host Details
                html.append("<div class=\"host-details\">");
                if (hostInfo != null) {
                        html.append("<h1>").append(hostInfo.getCompanyName()).append("</h1>");
                        html.append("<p>").append(hostInfo.getAddress()).append("</p>");
                        html.append("<p>").append(hostInfo.getCity()).append(", ").append(hostInfo.getCountry())
                                        .append("</p>");
                        if (hostInfo.getTrn() != null)
                                html.append("<p><strong>TRN:</strong> ").append(hostInfo.getTrn()).append("</p>");
                        if (hostInfo.getTradeLicenseNumber() != null)
                                html.append("<p><strong>Trade License:</strong> ")
                                                .append(hostInfo.getTradeLicenseNumber())
                                                .append("</p>");
                }
                html.append("</div>");
                html.append("</header>");

                html.append("<hr style=\"border: 0; border-top: 1px solid #eee; margin: 20px 0;\">");

                // 2. Middle
                html.append("<section class=\"invoice-middle clearfix\">");

                // Bill To
                html.append("<div class=\"bill-to\">");
                html.append("<h3>Bill To:</h3>");
                if (tenantInfo != null) {
                        if (tenantInfo.getLogoUrl() != null) {
                                html.append("<img src=\"").append(tenantInfo.getLogoUrl())
                                                .append("\" style=\"max-width: 60px; max-height: 60px; margin-bottom: 10px;\" />");
                        }
                        html.append("<p class=\"font-bold\">").append(tenantInfo.getCompanyName()).append("</p>");
                        html.append("<p style=\"color: #666;\">").append(tenantInfo.getAddress()).append("</p>");
                        if (tenantInfo.getTaxId() != null)
                                html.append("<p class=\"text-sm\"><strong>Tax ID:</strong> ")
                                                .append(tenantInfo.getTaxId())
                                                .append("</p>");
                        if (tenantInfo.getTrn() != null)
                                html.append("<p class=\"text-sm\"><strong>TRN:</strong> ").append(tenantInfo.getTrn())
                                                .append("</p>");
                } else {
                        html.append("<p class=\"font-bold\">").append(tenant.getCompanyName()).append("</p>");
                        html.append("<p>Tenant ID: ").append(tenant.getTenantId()).append("</p>");
                        html.append("<p>Contact: ").append(tenant.getUsername()).append("</p>");
                }
                html.append("</div>");

                // Invoice Info
                html.append("<div class=\"invoice-info\">");
                html.append("<h2 class=\"invoice-label\">INVOICE</h2>");
                html.append("<p><strong>Invoice #:</strong> ").append(invoice.getInvoiceNumber()).append("</p>");
                html.append("<p><strong>Date:</strong> ")
                                .append(invoice.getGeneratedDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")))
                                .append("</p>");
                html.append("<p><strong>Status:</strong> <span class=\"status-badge\">")
                                .append(invoice.getPaymentStatus())
                                .append("</span></p>");
                html.append("</div>");
                html.append("</section>");

                // Table
                html.append("<table class=\"details-table\">");
                html.append(
                                "<thead><tr><th>Description</th><th>Start Date</th><th>End Date</th><th class=\"text-right\">Amount</th></tr></thead>");
                html.append("<tbody>");

                // Subscription Plan
                html.append("<tr>");
                html.append("<td class=\"font-medium\">Subscription Plan</td>");
                html.append("<td>").append(invoice.getSubscriptionStartDate()).append("</td>");
                html.append("<td>").append(invoice.getSubscriptionEndDate()).append("</td>");
                html.append("<td class=\"text-right\">").append(invoice.getTotalAmount()).append("</td>");
                html.append("</tr>");

                // Locations
                html.append(
                                "<tr><td>Additional Locations</td><td class=\"text-gray-400\">-</td><td class=\"text-gray-400\">-</td><td class=\"text-right\">")
                                .append(tenant.getNumberOfLocations() != null ? tenant.getNumberOfLocations() : 0)
                                .append(" Units</td></tr>");
                // Users
                html.append(
                                "<tr><td>System Users</td><td class=\"text-gray-400\">-</td><td class=\"text-gray-400\">-</td><td class=\"text-right\">")
                                .append(tenant.getNumberOfUsers() != null ? tenant.getNumberOfUsers() : 0)
                                .append(" Users</td></tr>");
                // Stores
                html.append(
                                "<tr><td>Store Modules</td><td class=\"text-gray-400\">-</td><td class=\"text-gray-400\">-</td><td class=\"text-right\">")
                                .append(tenant.getNumberOfStore() != null ? tenant.getNumberOfStore() : 0)
                                .append(" Modules</td></tr>");

                html.append("</tbody>");
                html.append("</table>");

                // Totals
                html.append("<div class=\"total-section\">");

                // Helper for currency
                String currency = invoice.getCurrency() != null ? invoice.getCurrency() : "";

                // Basic Amount
                if (invoice.getBasicAmount() != null) {
                        html.append("<div class=\"total-row\">");
                        html.append("<span>Basic Amount: &nbsp;</span>");
                        html.append("<span>").append(invoice.getBasicAmount()).append(" ").append(currency)
                                        .append("</span>");
                        html.append("</div>");
                }

                // Other Charges
                if (invoice.getOtherCharges() != null
                                && invoice.getOtherCharges().compareTo(java.math.BigDecimal.ZERO) > 0) {
                        html.append("<div class=\"total-row\">");
                        html.append("<span>Other Charges: &nbsp;</span>");
                        html.append("<span>").append(invoice.getOtherCharges()).append(" ").append(currency)
                                        .append("</span>");
                        html.append("</div>");
                }

                // Discount
                if (invoice.getDiscount() != null && invoice.getDiscount().compareTo(java.math.BigDecimal.ZERO) > 0) {
                        html.append("<div class=\"total-row\">");
                        html.append("<span>Discount: &nbsp;</span>");
                        html.append("<span>-").append(invoice.getDiscount()).append(" ").append(currency)
                                        .append("</span>");
                        html.append("</div>");
                }

                // Tax
                if (invoice.getTax() != null && invoice.getTax().compareTo(java.math.BigDecimal.ZERO) > 0) {
                        html.append("<div class=\"total-row\">");
                        html.append("<span>Tax: &nbsp;</span>");
                        html.append("<span>").append(invoice.getTax()).append(" ").append(currency).append("</span>");
                        html.append("</div>");
                }

                // Total Amount
                html.append("<div style=\"margin-top: 10px; border-top: 1px solid #ddd; paddingTop: 10px;\">");
                html.append("<span class=\"font-bold\" style=\"font-size: 18px;\">Total Amount: </span>");
                html.append("<span class=\"font-bold\" style=\"font-size: 18px; color: #0056b3;\">")
                                .append(invoice.getTotalAmount()).append(" ").append(currency).append("</span>");
                html.append("</div>");

                // Advance & Pending
                if (invoice.getAdvanceAmount() != null
                                && invoice.getAdvanceAmount().compareTo(java.math.BigDecimal.ZERO) > 0) {
                        html.append("<div class=\"total-row\" style=\"margin-top: 5px; color: #28a745;\">");
                        html.append("<span>Advance Paid: &nbsp;</span>");
                        html.append("<span>").append(invoice.getAdvanceAmount()).append(" ").append(currency)
                                        .append("</span>");
                        html.append("</div>");
                }
                if (invoice.getPendingAmount() != null) {
                        html.append("<div class=\"total-row\" style=\"color: #dc3545; font-weight: bold;\">");
                        html.append("<span>Balance Due: &nbsp;</span>");
                        html.append("<span>").append(invoice.getPendingAmount()).append(" ").append(currency)
                                        .append("</span>");
                        html.append("</div>");
                }

                html.append("</div>");

                // Footer
                html.append("<footer class=\"invoice-footer clearfix\">");

                // Signature
                html.append("<div class=\"signature-box\">");
                if (hostInfo != null && hostInfo.getSignatureUrl() != null) {
                        html.append("<img src=\"").append(hostInfo.getSignatureUrl()).append("\" class=\"sig-img\" />");
                }
                html.append(
                                "<p style=\"font-size: 12px; color: #666; font-style: italic; margin-top: 5px;\">Authorized Signature</p>");
                html.append("</div>");

                // Stamp
                html.append("<div class=\"stamp-box\">");
                if (hostInfo != null && hostInfo.getStampUrl() != null) {
                        html.append("<img src=\"").append(hostInfo.getStampUrl()).append("\" class=\"stamp-img\" />");
                }
                html.append("</div>");

                html.append("</footer>");

                // Footer Banner
                if (hostInfo != null && hostInfo.getInvoiceFooterUrl() != null) {
                        html.append("<div style=\"margin-top: 40px; text-align: center;\">");
                        html.append("<img src=\"").append(hostInfo.getInvoiceFooterUrl())
                                        .append("\" style=\"width: 100%; max-height: 80px; object-fit: contain;\" />");
                        html.append("</div>");
                }

                html.append("</div>"); // End container
                html.append("</body></html>");

                return html.toString();
        }
}
