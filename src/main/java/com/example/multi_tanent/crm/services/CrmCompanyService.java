package com.example.multi_tanent.crm.services;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.crm.dto.CrmCompanyRequest;
import com.example.multi_tanent.crm.dto.CrmCompanyResponse;
import com.example.multi_tanent.crm.entity.CompanyType;
import com.example.multi_tanent.crm.entity.CrmCompany;
import com.example.multi_tanent.spersusers.enitity.CrmIndustry;
import com.example.multi_tanent.crm.repository.*;
import com.example.multi_tanent.spersusers.repository.CrmIndustryRepository;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.LocationRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class CrmCompanyService {

    private final CrmCompanyRepository companyRepository;
    private final TenantRepository tenantRepository;
    private final LocationRepository locationRepository;
    private final CrmCompanyTypeRepository companyTypeRepository;
    private final CrmIndustryRepository industryRepository;

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public CrmCompanyResponse createCompany(CrmCompanyRequest request) {
        Tenant tenant = getCurrentTenant();
        if (companyRepository.existsByTenantIdAndNameIgnoreCase(tenant.getId(), request.getName())) {
            throw new IllegalArgumentException("A company with this name already exists.");
        }
        CrmCompany company = new CrmCompany();
        mapRequestToEntity(request, company, tenant);
        CrmCompany savedCompany = companyRepository.save(company);
        return toResponse(savedCompany);
    }

    public List<CrmCompanyResponse> getAllCompanies() {
        return companyRepository.findByTenantId(getCurrentTenant().getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CrmCompanyResponse getCompanyById(Long id) {
        return companyRepository.findByIdAndTenantId(id, getCurrentTenant().getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Company not found with id: " + id));
    }

    public CrmCompanyResponse updateCompany(Long id, CrmCompanyRequest request) {
        CrmCompany company = companyRepository.findByIdAndTenantId(id, getCurrentTenant().getId())
                .orElseThrow(() -> new EntityNotFoundException("Company not found with id: " + id));

        if (!company.getName().equalsIgnoreCase(request.getName()) &&
                companyRepository.existsByTenantIdAndNameIgnoreCase(company.getTenant().getId(), request.getName())) {
            throw new IllegalArgumentException("A company with this name already exists.");
        }

        mapRequestToEntity(request, company, company.getTenant());
        CrmCompany updatedCompany = companyRepository.save(company);
        return toResponse(updatedCompany);
    }

    public void deleteCompany(Long id) {
        if (!companyRepository.existsById(id)) {
            throw new EntityNotFoundException("Company not found with id: " + id);
        }
        companyRepository.deleteById(id);
    }

    public List<String> bulkCreateCompanies(MultipartFile file) throws IOException {
        List<String> errors = new ArrayList<>();
        Tenant tenant = getCurrentTenant();

        try (InputStream is = file.getInputStream(); Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter formatter = new DataFormatter();

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row))
                    continue;

                try {
                    String name = formatter.formatCellValue(row.getCell(0)).trim();
                    if (name.isEmpty()) {
                        errors.add("Row " + (i + 1) + ": Company Name is required.");
                        continue;
                    }

                    if (companyRepository.existsByTenantIdAndNameIgnoreCase(tenant.getId(), name)) {
                        errors.add("Row " + (i + 1) + ": Company with name '" + name + "' already exists.");
                        continue;
                    }

                    CrmCompanyRequest request = new CrmCompanyRequest();
                    request.setName(name);
                    request.setPhone(formatter.formatCellValue(row.getCell(1)));
                    request.setEmail(formatter.formatCellValue(row.getCell(2)));
                    request.setWebsite(formatter.formatCellValue(row.getCell(3)));
                    request.setCompanyOwner(formatter.formatCellValue(row.getCell(4)));

                    String locationIdStr = formatter.formatCellValue(row.getCell(5));
                    if (!locationIdStr.isEmpty())
                        request.setLocationId(Long.parseLong(locationIdStr));

                    String companyTypeIdStr = formatter.formatCellValue(row.getCell(6));
                    if (!companyTypeIdStr.isEmpty())
                        request.setCompanyTypeId(Long.parseLong(companyTypeIdStr));

                    String industryIdStr = formatter.formatCellValue(row.getCell(7));
                    if (!industryIdStr.isEmpty())
                        request.setIndustryId(Long.parseLong(industryIdStr));

                    String parentCompanyIdStr = formatter.formatCellValue(row.getCell(8));
                    if (!parentCompanyIdStr.isEmpty())
                        request.setParentCompanyId(Long.parseLong(parentCompanyIdStr));

                    CrmCompany company = new CrmCompany();
                    mapRequestToEntity(request, company, tenant);
                    companyRepository.save(company);

                } catch (Exception e) {
                    errors.add("Row " + (i + 1) + ": " + e.getMessage());
                }
            }
        }
        return errors;
    }

    public ResponseEntity<byte[]> generateBulkUploadTemplate() throws IOException {
        String[] headers = {
                "Company Name*", "Phone", "Email", "Website", "Company Owner",
                "Location ID", "Company Type ID", "Industry ID", "Parent Company ID"
        };

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Companies");

            // Header row
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

            // Instructions sheet
            Sheet instructionsSheet = workbook.createSheet("Instructions");
            instructionsSheet.createRow(0).createCell(0).setCellValue("Instructions for Bulk Company Upload");
            instructionsSheet.createRow(2).createCell(0).setCellValue("Columns marked with * are mandatory.");
            instructionsSheet.createRow(3).createCell(0).setCellValue(
                    "For Location ID, Company Type ID, Industry ID, and Parent Company ID, please use the numeric IDs from the system.");

            for (int i = 0; i < 2; i++) {
                instructionsSheet.autoSizeColumn(i);
            }

            workbook.write(out);

            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.setContentType(
                    MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            responseHeaders.setContentDispositionFormData("attachment", "crm_companies_bulk_upload_template.xlsx");

            return ResponseEntity.ok().headers(responseHeaders).body(out.toByteArray());
        }
    }

    private boolean isRowEmpty(Row row) {
        if (row == null)
            return true;
        DataFormatter formatter = new DataFormatter();
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && !formatter.formatCellValue(cell).trim().isEmpty()) {
                return false;
            }
        }
        return true;
    }

    private void mapRequestToEntity(CrmCompanyRequest request, CrmCompany company, Tenant tenant) {
        company.setTenant(tenant);
        company.setName(request.getName());
        company.setPhone(request.getPhone());
        company.setEmail(request.getEmail());
        company.setWebsite(request.getWebsite());
        company.setCompanyOwner(request.getCompanyOwner());

        company.setBillingStreet(request.getBillingStreet());
        company.setBillingCity(request.getBillingCity());
        company.setBillingZip(request.getBillingZip());
        company.setBillingState(request.getBillingState());
        company.setBillingCountry(request.getBillingCountry());

        company.setShippingStreet(request.getShippingStreet());
        company.setShippingCity(request.getShippingCity());
        company.setShippingZip(request.getShippingZip());
        company.setShippingState(request.getShippingState());
        company.setShippingCountry(request.getShippingCountry());

        if (request.getLocationId() != null) {
            Location location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Location not found with id: " + request.getLocationId()));
            company.setLocation(location);
        } else {
            company.setLocation(null);
        }

        if (request.getCompanyTypeId() != null) {
            CompanyType companyType = companyTypeRepository.findById(request.getCompanyTypeId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Company Type not found with id: " + request.getCompanyTypeId()));
            company.setCompanyType(companyType);
        } else {
            company.setCompanyType(null);
        }

        if (request.getIndustryId() != null) {
            CrmIndustry industry = industryRepository.findById(request.getIndustryId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Industry not found with id: " + request.getIndustryId()));
            company.setIndustry(industry);
        } else {
            company.setIndustry(null);
        }

        if (request.getParentCompanyId() != null) {
            CrmCompany parent = companyRepository.findById(request.getParentCompanyId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Parent Company not found with id: " + request.getParentCompanyId()));
            company.setParentCompany(parent);
        } else {
            company.setParentCompany(null);
        }
    }

    private CrmCompanyResponse toResponse(CrmCompany company) {
        CrmCompanyResponse.CrmCompanyResponseBuilder builder = CrmCompanyResponse.builder()
                .id(company.getId())
                .name(company.getName())
                .phone(company.getPhone())
                .email(company.getEmail())
                .website(company.getWebsite())
                .companyOwner(company.getCompanyOwner())
                .billingStreet(company.getBillingStreet())
                .billingCity(company.getBillingCity())
                .billingZip(company.getBillingZip())
                .billingState(company.getBillingState())
                .billingCountry(company.getBillingCountry())
                .shippingStreet(company.getShippingStreet())
                .shippingCity(company.getShippingCity())
                .shippingZip(company.getShippingZip())
                .shippingState(company.getShippingState())
                .shippingCountry(company.getShippingCountry())
                .createdAt(company.getCreatedAt())
                .updatedAt(company.getUpdatedAt());

        if (company.getLocation() != null) {
            builder.locationId(company.getLocation().getId()).locationName(company.getLocation().getName());
        }
        if (company.getCompanyType() != null) {
            builder.companyTypeId(company.getCompanyType().getId()).companyTypeName(company.getCompanyType().getName());
        }
        if (company.getIndustry() != null) {
            builder.industryId(company.getIndustry().getId()).industryName(company.getIndustry().getName());
        }
        if (company.getParentCompany() != null) {
            builder.parentCompanyId(company.getParentCompany().getId())
                    .parentCompanyName(company.getParentCompany().getName());
        }

        return builder.build();
    }
}