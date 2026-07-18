package com.example.multi_tanent.crm.services;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.crm.dto.CrmLeadRequest;
import com.example.multi_tanent.crm.dto.LeadFilterRequest;
import com.example.multi_tanent.crm.enums.CrmLeadStatus;
import com.example.multi_tanent.crm.dto.CrmLeadResponse;
import com.example.multi_tanent.crm.entity.*;
import com.example.multi_tanent.crm.repository.*;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.enitity.CrmProduct;
import com.example.multi_tanent.spersusers.enitity.CrmIndustry;
import com.example.multi_tanent.spersusers.repository.CrmProductRepository;
import com.example.multi_tanent.spersusers.repository.CrmIndustryRepository;
import com.example.multi_tanent.spersusers.repository.LocationRepository;
import com.example.multi_tanent.crm.repository.LeadSourceRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;
import java.io.IOException;
import java.io.PrintWriter;
import jakarta.servlet.http.HttpServletResponse;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;
import com.example.multi_tanent.crm.dto.BulkUploadResultDto;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
@lombok.extern.slf4j.Slf4j
public class CrmLeadService {

    private final CrmLeadRepository leadRepository;
    private final TenantRepository tenantRepository;
    private final CrmCompanyRepository companyRepository;
    private final CrmIndustryRepository industryRepository;
    private final CrmProductRepository productRepository;
    private final EmployeeRepository employeeRepository;
    private final CrmLeadStageRepository leadStageRepository;
    private final LocationRepository locationRepository;
    private final ContactService contactService;
    private final LeadSourceRepository leadSourceRepository;
    private final CrmAccessService crmAccessService;
    private final EntityManager entityManager;
    private final CrmAuditService auditService;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public CrmLeadResponse createLead(CrmLeadRequest request) {
        Tenant tenant = currentTenant();
        CrmLead lead = new CrmLead();
        mapReqToEntity(request, lead);

        if (leadRepository.existsByTenantIdAndLeadNo(tenant.getId(), request.getLeadNo())) {
            throw new IllegalArgumentException(
                    "Lead with number '" + request.getLeadNo() + "' already exists for this tenant.");
        }

        lead.setTenant(tenant);
        CrmLead savedLead = leadRepository.save(lead);

        // Use the ContactService to create or update the contact from the lead
        contactService.createOrUpdateContactFromLead(savedLead);

        auditService.log("LEAD_CREATED", "LEAD", savedLead.getId(),
                "Lead #" + savedLead.getLeadNo() + " created for company: " + savedLead.getCompany().getName());

        return toResponse(savedLead);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public Page<CrmLeadResponse> getAllLeads(LeadFilterRequest filter, Pageable pageable) {
        try {
            if (crmAccessService.isOwnerOnly("LEAD")) {
                filter.setOwnerId(crmAccessService.getCurrentEmployeeId());
            }
            Specification<CrmLead> spec = CrmLeadSpecification.build(currentTenant().getId(), filter);
            return leadRepository.findAll(spec, pageable).map(this::toResponse);
        } catch (Exception e) {
            log.error("CRITICAL ERROR in getAllLeads: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public CrmLeadResponse getLeadById(Long id) {
        return leadRepository.findByIdAndTenantId(id, currentTenant().getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Lead not found with id: " + id));
    }

    public CrmLeadResponse updateLead(Long id, CrmLeadRequest request) {
        CrmLead lead = leadRepository.findByIdAndTenantId(id, currentTenant().getId())
                .orElseThrow(() -> new EntityNotFoundException("Lead not found with id: " + id));
        mapReqToEntity(request, lead);

        if (!lead.getLeadNo().equalsIgnoreCase(request.getLeadNo())
                && leadRepository.existsByTenantIdAndLeadNo(currentTenant().getId(), request.getLeadNo())) {
            throw new IllegalArgumentException(
                    "Lead with number '" + request.getLeadNo() + "' already exists for this tenant.");
        }

        CrmLead updatedLead = leadRepository.save(lead);

        // Also update the associated contact
        contactService.createOrUpdateContactFromLead(updatedLead);

        auditService.log("LEAD_UPDATED", "LEAD", updatedLead.getId(),
                "Lead #" + updatedLead.getLeadNo() + " updated");

        return toResponse(updatedLead);
    }

    public int bulkAssignOwner(List<Long> leadIds, Long ownerId) {
        Tenant tenant = currentTenant();
        Employee newOwner = employeeRepository.findById(ownerId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + ownerId));

        List<CrmLead> leads = leadRepository.findAllById(leadIds).stream()
                .filter(l -> l.getTenant().getId().equals(tenant.getId()))
                .collect(Collectors.toList());

        for (CrmLead lead : leads) {
            lead.setOwner(newOwner);
            auditService.log("LEAD_OWNER_ASSIGNED", "LEAD", lead.getId(),
                    "Lead #" + lead.getLeadNo() + " owner changed to " + newOwner.getFirstName() + " " + newOwner.getLastName());
        }

        leadRepository.saveAll(leads);
        return leads.size();
    }

    public void deleteLead(Long id) {
        if (!leadRepository.existsById(id)) {
            throw new EntityNotFoundException("Lead not found with id: " + id);
        }
        
        // Hard delete: Cleanly delete all dependent child records to avoid FK constraint failures
        entityManager.createNativeQuery("DELETE FROM crm_contacts WHERE lead_id = :leadId")
                .setParameter("leadId", id)
                .executeUpdate();

        entityManager.createNativeQuery("DELETE FROM crm_events WHERE lead_id = :leadId")
                .setParameter("leadId", id)
                .executeUpdate();

        entityManager.createNativeQuery("DELETE FROM crm_emails WHERE lead_id = :leadId")
                .setParameter("leadId", id)
                .executeUpdate();

        entityManager.createNativeQuery("DELETE FROM crm_todos WHERE lead_id = :leadId")
                .setParameter("leadId", id)
                .executeUpdate();

        entityManager.createNativeQuery("DELETE FROM crm_lead_attachments WHERE lead_id = :leadId")
                .setParameter("leadId", id)
                .executeUpdate();

        entityManager.createNativeQuery("DELETE FROM crm_call_logs WHERE lead_id = :leadId")
                .setParameter("leadId", id)
                .executeUpdate();

        entityManager.createNativeQuery("DELETE FROM crm_tasks WHERE lead_id = :leadId")
                .setParameter("leadId", id)
                .executeUpdate();

        leadRepository.deleteById(id);

        auditService.log("LEAD_DELETED", "LEAD", id,
                "Lead with ID " + id + " was deleted");
    }

    public void bulkDeleteLeads(List<Long> leadIds) {
        Tenant tenant = currentTenant();
        List<CrmLead> leads = leadRepository.findAllById(leadIds).stream()
                .filter(l -> l.getTenant().getId().equals(tenant.getId()))
                .collect(Collectors.toList());

        for (CrmLead lead : leads) {
            deleteLead(lead.getId());
        }
    }

    public CrmLeadResponse updateLeadStatus(Long id, CrmLeadStatus status) {
        CrmLead lead = leadRepository.findByIdAndTenantId(id, currentTenant().getId())
                .orElseThrow(() -> new EntityNotFoundException("Lead not found with id: " + id));

        lead.setStatus(status);
        return toResponse(leadRepository.save(lead));
    }

    public CrmLeadResponse updateLeadStage(Long leadId, Long stageId) {
        Tenant tenant = currentTenant();
        CrmLead lead = leadRepository.findByIdAndTenantId(leadId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Lead not found with id: " + leadId));

        CrmLeadStage newStage = leadStageRepository.findByIdAndTenantId(stageId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Lead Stage not found with id: " + stageId));

        String oldStageName = lead.getCurrentStage() != null ? lead.getCurrentStage().getName() : "None";
        lead.setCurrentStage(newStage);
        CrmLead savedLead = leadRepository.save(lead);

        auditService.log("LEAD_STAGE_CHANGED", "LEAD", savedLead.getId(),
                "Lead #" + savedLead.getLeadNo() + " stage changed from '" + oldStageName + "' to '" + newStage.getName() + "'");

        return toResponse(savedLead);
    }

    private void mapReqToEntity(CrmLeadRequest r, CrmLead e) {
        e.setFirstName(r.getFirstName());
        e.setLastName(r.getLastName());
        e.setLeadNo(r.getLeadNo());
        e.setDesignation(r.getDesignation());
        e.setPhone(r.getPhone());
        e.setEmail(r.getEmail());
        e.setWebsite(r.getWebsite());
        e.setRequirements(r.getRequirements());
        e.setAddress(r.getAddress());
        e.setNotes(r.getNotes());
        e.setForecastCategory(r.getForecastCategory());
        e.setExpectedCloseDate(r.getExpectedCloseDate());
        e.setAmount(r.getAmount());
        if (r.getStatus() != null)
            e.setStatus(r.getStatus());

        CrmCompany company = companyRepository.findById(r.getCompanyId())
                .orElseThrow(() -> new EntityNotFoundException("Company not found with id: " + r.getCompanyId()));
        e.setCompany(company);
        if (r.getIndustryId() != null)
            e.setIndustry(industryRepository.findById(r.getIndustryId()).orElse(null));
        if (r.getOwnerId() != null)
            e.setOwner(employeeRepository.findById(r.getOwnerId()).orElse(null));
        if (r.getCurrentStageId() != null)
            e.setCurrentStage(leadStageRepository.findById(r.getCurrentStageId()).orElse(null));
        if (r.getLeadSourceId() != null) {
            LeadSource leadSource = leadSourceRepository.findById(r.getLeadSourceId())
                    .orElseThrow(
                            () -> new EntityNotFoundException("LeadSource not found with id: " + r.getLeadSourceId()));
            e.setLeadSource(leadSource);
        }
        if (r.getLocationId() != null)
            e.setLocation(locationRepository.findById(r.getLocationId()).orElse(null));
        if (r.getProductIds() != null)
            e.setProducts(new HashSet<>(productRepository.findAllById(r.getProductIds())));
    }

    private CrmLeadResponse toResponse(CrmLead e) {
        return CrmLeadResponse.builder()
                .id(e.getId()).firstName(e.getFirstName()).lastName(e.getLastName())
                .leadNo(e.getLeadNo())
                .companyId(e.getCompany() != null ? e.getCompany().getId() : null)
                .companyName(e.getCompany() != null ? e.getCompany().getName() : null)
                .industryId(e.getIndustry() != null ? e.getIndustry().getId() : null)
                .industryName(e.getIndustry() != null ? e.getIndustry().getName() : null)
                .designation(e.getDesignation()).phone(e.getPhone()).email(e.getEmail()).website(e.getWebsite())
                .products(e.getProducts().stream().map(p -> new CrmLeadResponse.ProductMini(p.getId(), p.getName()))
                        .collect(Collectors.toSet()))
                .requirements(e.getRequirements()).address(e.getAddress()).notes(e.getNotes())
                .leadSourceId(e.getLeadSource() != null ? e.getLeadSource().getId() : null)
                .leadSourceName(e.getLeadSource() != null ? e.getLeadSource().getName() : null)
                .ownerId(e.getOwner() != null ? e.getOwner().getId() : null)
                .ownerName(e.getOwner() != null ? e.getOwner().getFirstName() + " " + e.getOwner().getLastName() : null)
                .currentStageId(e.getCurrentStage() != null ? e.getCurrentStage().getId() : null)
                .currentStageName(e.getCurrentStage() != null ? e.getCurrentStage().getName() : null)
                .locationId(e.getLocation() != null ? e.getLocation().getId() : null)
                .locationName(e.getLocation() != null ? e.getLocation().getName() : null)
                //
                .status(e.getStatus()).createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt()).build();
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public void exportLeadsToCsv(List<Long> ids, HttpServletResponse response) throws IOException {
        List<CrmLead> leads = leadRepository.findAllById(ids);
        Long tenantId = currentTenant().getId();
        List<CrmLead> filteredLeads = leads.stream()
                .filter(l -> l.getTenant().getId().equals(tenantId))
                .collect(Collectors.toList());

        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"leads.csv\"");

        PrintWriter writer = response.getWriter();
        writer.println("Lead No,First Name,Last Name,Company,Email,Phone,Status,Stage,Created At");

        for (CrmLead lead : filteredLeads) {
            writer.println(String.format("%s,%s,%s,%s,%s,%s,%s,%s,%s",
                    csvSafe(lead.getLeadNo()),
                    csvSafe(lead.getFirstName()),
                    csvSafe(lead.getLastName()),
                    csvSafe(lead.getCompany() != null ? lead.getCompany().getName() : ""),
                    csvSafe(lead.getEmail()),
                    csvSafe(lead.getPhone()),
                    csvSafe(lead.getStatus() != null ? lead.getStatus().name() : ""),
                    csvSafe(lead.getCurrentStage() != null ? lead.getCurrentStage().getName() : ""),
                    lead.getCreatedAt() != null ? lead.getCreatedAt().toString() : ""
            ));
        }
        writer.flush();
    }

    private String csvSafe(String value) {
        if (value == null) return "";
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }

    public void generateExcelTemplate(HttpServletResponse response) throws IOException {
        String[] headers = {
                "Lead No*", "First Name*", "Last Name*", "Email*", "Phone",
                "Company Name", "Lead Source", "Stage", "Industry", "Designation",
                "Website", "Status", "Amount", "Expected Close Date", "Requirements", "Notes"
        };

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Leads Template");

            // Header row style
            Row headerRow = sheet.createRow(0);
            CellStyle headerCellStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerCellStyle.setFont(font);

            for (int col = 0; col < headers.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(headers[col]);
                cell.setCellStyle(headerCellStyle);
                sheet.autoSizeColumn(col);
            }

            // Fill 1 sample row to help the user understand
            Row sampleRow = sheet.createRow(1);
            sampleRow.createCell(0).setCellValue("LEAD-1001");
            sampleRow.createCell(1).setCellValue("John");
            sampleRow.createCell(2).setCellValue("Doe");
            sampleRow.createCell(3).setCellValue("john.doe@example.com");
            sampleRow.createCell(4).setCellValue("+971501234567");
            sampleRow.createCell(5).setCellValue("Acme Corporation");
            sampleRow.createCell(6).setCellValue("Web Search");
            sampleRow.createCell(7).setCellValue("Qualified");
            sampleRow.createCell(8).setCellValue("Technology");
            sampleRow.createCell(9).setCellValue("Sales Manager");
            sampleRow.createCell(10).setCellValue("www.acme.com");
            sampleRow.createCell(11).setCellValue("NEW");
            sampleRow.createCell(12).setCellValue("50000");
            sampleRow.createCell(13).setCellValue("2026-06-30");
            sampleRow.createCell(14).setCellValue("Looking for enterprise software solution.");
            sampleRow.createCell(15).setCellValue("Follow up next Monday.");

            // Create Instructions Sheet
            Sheet instructionsSheet = workbook.createSheet("Instructions");
            instructionsSheet.createRow(0).createCell(0).setCellValue("Instructions for Bulk Lead Upload");
            instructionsSheet.createRow(2).createCell(0).setCellValue("1. Columns with * are strictly mandatory (Lead No, First Name, Last Name, Email).");
            instructionsSheet.createRow(3).createCell(0).setCellValue("2. Company Name: If provided but does not exist, a new company will be created dynamically.");
            instructionsSheet.createRow(4).createCell(0).setCellValue("3. Expected Close Date should be in YYYY-MM-DD format.");
            instructionsSheet.createRow(5).createCell(0).setCellValue("4. Status must be one of: NEW, DUPLICATE, TRANSFERRED, NOT_RESPONDING, JUNK, LOST, UNASSIGNED, PENDING, ACTIVE.");
            instructionsSheet.createRow(6).createCell(0).setCellValue("5. Amount must be a valid decimal number.");

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            instructionsSheet.autoSizeColumn(0);

            workbook.write(out);

            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment; filename=\"leads_bulk_template.xlsx\"");
            response.setContentLength(out.size());
            response.getOutputStream().write(out.toByteArray());
            response.getOutputStream().flush();
        }
    }

    public BulkUploadResultDto bulkUploadLeads(MultipartFile file) throws IOException {
        Tenant tenant = currentTenant();
        List<BulkUploadResultDto.RowError> errors = new java.util.ArrayList<>();
        int successCount = 0;
        int failedCount = 0;
        int totalRows = 0;

        // Fetch optional master data lists for this tenant
        List<CrmLeadStage> stages = leadStageRepository.findByTenantId(tenant.getId());
        List<LeadSource> sources = new java.util.ArrayList<>(leadSourceRepository.findByTenantIdOrderByNameAsc(tenant.getId()));
        List<CrmIndustry> industries = new java.util.ArrayList<>(industryRepository.findByTenantIdOrderByNameAsc(tenant.getId()));

        try (InputStream is = file.getInputStream(); Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter formatter = new DataFormatter();

            // Row 0 is headers, so start from Row 1
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row)) {
                    continue;
                }
                totalRows++;

                try {
                    String leadNo = formatter.formatCellValue(row.getCell(0)).trim();
                    String firstName = formatter.formatCellValue(row.getCell(1)).trim();
                    String lastName = formatter.formatCellValue(row.getCell(2)).trim();
                    String email = formatter.formatCellValue(row.getCell(3)).trim();
                    String phone = formatter.formatCellValue(row.getCell(4)).trim();
                    String companyName = formatter.formatCellValue(row.getCell(5)).trim();
                    String leadSourceStr = formatter.formatCellValue(row.getCell(6)).trim();
                    String stageStr = formatter.formatCellValue(row.getCell(7)).trim();
                    String industryStr = formatter.formatCellValue(row.getCell(8)).trim();
                    String designation = formatter.formatCellValue(row.getCell(9)).trim();
                    String website = formatter.formatCellValue(row.getCell(10)).trim();
                    String statusStr = formatter.formatCellValue(row.getCell(11)).trim();
                    String amountStr = formatter.formatCellValue(row.getCell(12)).trim();
                    String expectedCloseDateStr = formatter.formatCellValue(row.getCell(13)).trim();
                    String requirements = formatter.formatCellValue(row.getCell(14)).trim();
                    String notes = formatter.formatCellValue(row.getCell(15)).trim();

                    // Validation of mandatory fields
                    if (leadNo.isEmpty()) {
                        errors.add(new BulkUploadResultDto.RowError(i + 1, "N/A", "Lead No is mandatory"));
                        failedCount++;
                        continue;
                    }
                    if (firstName.isEmpty()) {
                        errors.add(new BulkUploadResultDto.RowError(i + 1, leadNo, "First Name is mandatory"));
                        failedCount++;
                        continue;
                    }
                    if (lastName.isEmpty()) {
                        errors.add(new BulkUploadResultDto.RowError(i + 1, leadNo, "Last Name is mandatory"));
                        failedCount++;
                        continue;
                    }
                    if (email.isEmpty()) {
                        errors.add(new BulkUploadResultDto.RowError(i + 1, leadNo, "Email is mandatory"));
                        failedCount++;
                        continue;
                    }

                    // Check for duplicate Lead No
                    if (leadRepository.existsByTenantIdAndLeadNo(tenant.getId(), leadNo)) {
                        errors.add(new BulkUploadResultDto.RowError(i + 1, leadNo, "Lead No already exists"));
                        failedCount++;
                        continue;
                    }

                    // Lookup or dynamically create the Company
                    CrmCompany company = null;
                    if (companyName.isEmpty()) {
                        companyName = firstName + " " + lastName + " Company";
                    }
                    Optional<CrmCompany> existingCompany = companyRepository.findByNameAndTenantId(companyName, tenant.getId());
                    if (existingCompany.isPresent()) {
                        company = existingCompany.get();
                    } else {
                        company = new CrmCompany();
                        company.setTenant(tenant);
                        company.setName(companyName);
                        company = companyRepository.save(company);
                    }

                    // Initialize Lead
                    CrmLead lead = new CrmLead();
                    lead.setTenant(tenant);
                    lead.setLeadNo(leadNo);
                    lead.setFirstName(firstName);
                    lead.setLastName(lastName);
                    lead.setEmail(email);
                    lead.setPhone(phone.isEmpty() ? null : phone);
                    lead.setCompany(company);
                    lead.setDesignation(designation.isEmpty() ? null : designation);
                    lead.setWebsite(website.isEmpty() ? null : website);
                    lead.setRequirements(requirements.isEmpty() ? null : requirements);
                    lead.setNotes(notes.isEmpty() ? null : notes);

                    // Map Status (default NEW)
                    CrmLeadStatus status = CrmLeadStatus.NEW;
                    if (!statusStr.isEmpty()) {
                        try {
                            status = CrmLeadStatus.valueOf(statusStr.toUpperCase());
                        } catch (Exception ignored) {}
                    }
                    lead.setStatus(status);

                    // Map Amount
                    if (!amountStr.isEmpty()) {
                        try {
                            lead.setAmount(new java.math.BigDecimal(amountStr));
                        } catch (Exception e) {
                            errors.add(new BulkUploadResultDto.RowError(i + 1, leadNo, "Invalid Amount format: " + amountStr));
                            failedCount++;
                            continue;
                        }
                    }

                    // Map Expected Close Date
                    if (!expectedCloseDateStr.isEmpty()) {
                        try {
                            lead.setExpectedCloseDate(LocalDate.parse(expectedCloseDateStr));
                        } catch (Exception e) {
                            errors.add(new BulkUploadResultDto.RowError(i + 1, leadNo, "Invalid Expected Close Date format: " + expectedCloseDateStr));
                            failedCount++;
                            continue;
                        }
                    }

                    // Map Lead Source (Optional, In-memory case-insensitive match or auto-create)
                    if (!leadSourceStr.isEmpty()) {
                        Optional<LeadSource> matchingSource = sources.stream()
                                .filter(src -> src.getName().equalsIgnoreCase(leadSourceStr))
                                .findFirst();
                        if (matchingSource.isPresent()) {
                            lead.setLeadSource(matchingSource.get());
                        } else {
                            LeadSource newSource = new LeadSource();
                            newSource.setTenant(tenant);
                            newSource.setName(leadSourceStr);
                            newSource = leadSourceRepository.save(newSource);
                            sources.add(newSource);
                            lead.setLeadSource(newSource);
                        }
                    }

                    // Map Lead Stage (Optional, In-memory case-insensitive match)
                    if (!stageStr.isEmpty()) {
                        stages.stream()
                                .filter(stg -> stg.getName().equalsIgnoreCase(stageStr))
                                .findFirst()
                                .ifPresent(lead::setCurrentStage);
                    }

                    // Map Industry (Optional, In-memory case-insensitive match or auto-create)
                    if (!industryStr.isEmpty()) {
                        Optional<CrmIndustry> matchingIndustry = industries.stream()
                                .filter(ind -> ind.getName().equalsIgnoreCase(industryStr))
                                .findFirst();
                        if (matchingIndustry.isPresent()) {
                            lead.setIndustry(matchingIndustry.get());
                        } else {
                            CrmIndustry newIndustry = new CrmIndustry();
                            newIndustry.setTenant(tenant);
                            newIndustry.setName(industryStr);
                            newIndustry = industryRepository.save(newIndustry);
                            industries.add(newIndustry);
                            lead.setIndustry(newIndustry);
                        }
                    }

                    // Save Lead
                    CrmLead savedLead = leadRepository.save(lead);
                    contactService.createOrUpdateContactFromLead(savedLead);
                    successCount++;

                } catch (Exception e) {
                    errors.add(new BulkUploadResultDto.RowError(i + 1, "Row " + (i + 1), e.getMessage()));
                    failedCount++;
                }
            }
        }

        return BulkUploadResultDto.builder()
                .totalRows(totalRows)
                .successCount(successCount)
                .failedCount(failedCount)
                .errors(errors)
                .build();
    }

    private boolean isRowEmpty(Row row) {
        if (row == null) return true;
        DataFormatter formatter = new DataFormatter();
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && !formatter.formatCellValue(cell).trim().isEmpty()) {
                return false;
            }
        }
        return true;
    }
}
