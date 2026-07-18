package com.example.multi_tanent.spersusers.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.base.PartyBase;
import com.example.multi_tanent.spersusers.enitity.*;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;


import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.example.multi_tanent.spersusers.dto.*;
import com.example.multi_tanent.spersusers.repository.*;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class PartyService {

    private final PartyRepository repository;
    private final TenantRepository tenantRepository;
    private final OtherPersonRepository otherPersonRepository;
    private final BaseBankDetailsRepository bankDetailsRepository;
    private final CustomFieldRepository customFieldRepository;

    // Headers for the Excel template and import logic
    private static final String[] HEADERS = {
            "PartyType (CUSTOMER/VENDOR)", "CompanyName", "CustomerCode", "PrimaryContactPerson",
            "Mobile", "ContactEmail", "ContactPhone", "WorkPhone", "Website",
            "PANNumber", "VATNumber", "VATTreatment (REGISTERED/UNREGISTERED)", "VAT_TRN_Number",
            "City", "Region", "Currency", "OpeningBalance", "OpeningBalanceType (DEBIT/CREDIT)",
            "CreditLimitAllowed", "CreditPeriodAllowed",
            "BillingAddress_Attention", "BillingAddress_AddressLine", "BillingAddress_City", "BillingAddress_State", "BillingAddress_ZipCode", "BillingAddress_Country",
            "ShippingAddress_Attention", "ShippingAddress_AddressLine", "ShippingAddress_City", "ShippingAddress_State", "ShippingAddress_ZipCode", "ShippingAddress_Country",
            // Bank Details
            "BankName", "BankAccountNumber", "BankIFSCCode", "BankIBANCode", "BankCorporateId", "BankBranchLocation", "BankBranchAddress", "BankBeneficiaryEmail"
    };

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found: " + tenantId));
    }

    public PartyResponse create(PartyRequest request) {
        BaseCustomer entity = new BaseCustomer();
        mapRequestToEntity(request, entity);
        entity.setCreatedDate(LocalDateTime.now());
        // entity.setCreatedBy(SecurityContextHolder.getContext().getAuthentication().getName());

        return PartyResponse.fromEntity(repository.save(entity));
    }

    public PartyResponse update(Long id, PartyRequest request) {
        Long tenantId = getCurrentTenant().getId();
        BaseCustomer entity = repository.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new EntityNotFoundException("Party not found: " + id));

        mapRequestToEntity(request, entity);
        return PartyResponse.fromEntity(repository.save(entity));
    }

    @Transactional(readOnly = true)
    public Page<PartyResponse> getAll(PartyBase.PartyType type, Pageable pageable) {
        Long tenantId = getCurrentTenant().getId();
        if (type != null) {
            return repository.findByTenantIdAndPartyType(tenantId, type, pageable).map(PartyResponse::fromEntity);
        }
        return repository.findByTenantId(tenantId, pageable).map(PartyResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public PartyResponse getById(Long id) {
        Long tenantId = getCurrentTenant().getId();
        return repository.findByTenantIdAndId(tenantId, id)
                .map(PartyResponse::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("Party not found: " + id));
    }

    public void delete(Long id) {
        Long tenantId = getCurrentTenant().getId();
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Party not found: " + id);
        }
        repository.deleteById(id);
    }

    // --- Methods for OtherPerson ---

    public List<OtherPersonResponse> getOtherPersonsForParty(Long partyId) {
        if (!repository.existsById(partyId)) throw new EntityNotFoundException("Party not found: " + partyId);
        return otherPersonRepository.findByPartyId(partyId).stream()
                .map(OtherPersonResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public OtherPersonResponse addOtherPersonToParty(Long partyId, OtherPersonRequest request) {
        BaseCustomer party = repository.findById(partyId)
                .orElseThrow(() -> new EntityNotFoundException("Party not found: " + partyId));
        OtherPerson otherPerson = new OtherPerson();
        otherPerson.setParty(party);
        // map fields from request
        otherPerson.setSalutation(request.getSalutation());
        otherPerson.setFirstName(request.getFirstName());
        otherPerson.setLastName(request.getLastName());
        otherPerson.setEmailAddress(request.getEmailAddress());
        otherPerson.setWorkPhone(request.getWorkPhone());
        otherPerson.setMobile(request.getMobile());
        return OtherPersonResponse.fromEntity(otherPersonRepository.save(otherPerson));
    }

    public OtherPersonResponse updateOtherPersonForParty(Long partyId, Long otherPersonId, OtherPersonRequest request) {
        if (!repository.existsById(partyId)) throw new EntityNotFoundException("Party not found: " + partyId);
        OtherPerson otherPerson = otherPersonRepository.findById(otherPersonId)
                .orElseThrow(() -> new EntityNotFoundException("OtherPerson not found: " + otherPersonId));
        if (!otherPerson.getParty().getId().equals(partyId)) {
            throw new IllegalArgumentException("OtherPerson does not belong to the specified Party.");
        }
        // map fields from request
        otherPerson.setSalutation(request.getSalutation());
        otherPerson.setFirstName(request.getFirstName());
        otherPerson.setLastName(request.getLastName());
        otherPerson.setEmailAddress(request.getEmailAddress());
        otherPerson.setWorkPhone(request.getWorkPhone());
        otherPerson.setMobile(request.getMobile());
        return OtherPersonResponse.fromEntity(otherPersonRepository.save(otherPerson));
    }

    public void deleteOtherPersonForParty(Long partyId, Long otherPersonId) {
        if (!repository.existsById(partyId)) throw new EntityNotFoundException("Party not found: " + partyId);
        otherPersonRepository.deleteById(otherPersonId);
    }

    // --- Methods for BaseBankDetails ---

    public List<BaseBankDetailsResponse> getBankDetailsForParty(Long partyId) {
        if (!repository.existsById(partyId)) throw new EntityNotFoundException("Party not found: " + partyId);
        return bankDetailsRepository.findByPartyId(partyId).stream()
                .map(BaseBankDetailsResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public BaseBankDetailsResponse addBankDetailToParty(Long partyId, BaseBankDetailsRequest request) {
        BaseCustomer party = repository.findById(partyId)
                .orElseThrow(() -> new EntityNotFoundException("Party not found: " + partyId));
        BaseBankDetails bankDetails = new BaseBankDetails();
        bankDetails.setParty(party);
        // map fields from request
        bankDetails.setBankName(request.getBankName());
        bankDetails.setAccountNumber(request.getAccountNumber());
        bankDetails.setIfsCode(request.getIfsCode());
        bankDetails.setIbanCode(request.getIbanCode());
        bankDetails.setCorporateId(request.getCorporateId());
        bankDetails.setLocationBranch(request.getLocationBranch());
        bankDetails.setBranchAddress(request.getBranchAddress());
        bankDetails.setBeneficiaryMailId(request.getBeneficiaryMailId());
        return BaseBankDetailsResponse.fromEntity(bankDetailsRepository.save(bankDetails));
    }

    public BaseBankDetailsResponse updateBankDetailForParty(Long partyId, Long bankDetailId, BaseBankDetailsRequest request) {
        if (!repository.existsById(partyId)) throw new EntityNotFoundException("Party not found: " + partyId);
        BaseBankDetails bankDetails = bankDetailsRepository.findById(bankDetailId)
                .orElseThrow(() -> new EntityNotFoundException("BankDetail not found: " + bankDetailId));
        if (!bankDetails.getParty().getId().equals(partyId)) {
            throw new IllegalArgumentException("BankDetail does not belong to the specified Party.");
        }
        // map fields from request
        bankDetails.setBankName(request.getBankName());
        bankDetails.setAccountNumber(request.getAccountNumber());
        // ... map other fields
        return BaseBankDetailsResponse.fromEntity(bankDetailsRepository.save(bankDetails));
    }

    public void deleteBankDetailForParty(Long partyId, Long bankDetailId) {
        if (!repository.existsById(partyId)) throw new EntityNotFoundException("Party not found: " + partyId);
        bankDetailsRepository.deleteById(bankDetailId);
    }

    // --- Methods for CustomField ---

    public List<CustomFieldResponse> getCustomFieldsForParty(Long partyId) {
        if (!repository.existsById(partyId)) throw new EntityNotFoundException("Party not found: " + partyId);
        return customFieldRepository.findByPartyId(partyId).stream()
                .map(CustomFieldResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public CustomFieldResponse addCustomFieldToParty(Long partyId, CustomFieldRequest request) {
        BaseCustomer party = repository.findById(partyId)
                .orElseThrow(() -> new EntityNotFoundException("Party not found: " + partyId));
        CustomField customField = new CustomField();
        customField.setParty(party);
        // map fields from request
        customField.setFieldName(request.getFieldName());
        customField.setFieldValue(request.getFieldValue());
        return CustomFieldResponse.fromEntity(customFieldRepository.save(customField));
    }

    public CustomFieldResponse updateCustomFieldForParty(Long partyId, Long customFieldId, CustomFieldRequest request) {
        if (!repository.existsById(partyId)) throw new EntityNotFoundException("Party not found: " + partyId);
        CustomField customField = customFieldRepository.findById(customFieldId)
                .orElseThrow(() -> new EntityNotFoundException("CustomField not found: " + customFieldId));
        if (!customField.getParty().getId().equals(partyId)) {
            throw new IllegalArgumentException("CustomField does not belong to the specified Party.");
        }
        // map fields from request
        customField.setFieldName(request.getFieldName());
        customField.setFieldValue(request.getFieldValue());
        return CustomFieldResponse.fromEntity(customFieldRepository.save(customField));
    }

    public void deleteCustomFieldForParty(Long partyId, Long customFieldId) {
        if (!repository.existsById(partyId)) throw new EntityNotFoundException("Party not found: " + partyId);
        customFieldRepository.deleteById(customFieldId);
    }

    @Transactional
    public List<String> bulkImportParties(MultipartFile file) throws IOException {
        List<String> errors = new ArrayList<>();
        List<PartyRequest> partyRequests = new ArrayList<>();

        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            int rowNumber = 0;
            for (Row row : sheet) {
                if (rowNumber++ == 0) continue; // Skip header row

                try {
                    PartyRequest request = parseRowToPartyRequest(row);
                    if (request != null) {
                        partyRequests.add(request);
                    }
                } catch (Exception e) {
                    errors.add("Error in row " + rowNumber + ": " + e.getMessage());
                }
            }
        }

        if (!errors.isEmpty()) {
            return errors; // Return parsing errors before attempting to save
        }

        for (int i = 0; i < partyRequests.size(); i++) {
            try {
                create(partyRequests.get(i));
            } catch (Exception e) {
                errors.add("Error saving party from row " + (i + 2) + ": " + e.getMessage());
            }
        }

        return errors;
    }

    private PartyRequest parseRowToPartyRequest(Row row) {
        PartyRequest req = new PartyRequest();

        String partyTypeStr = getCellValueAsString(row.getCell(0));
        if (partyTypeStr == null || partyTypeStr.isBlank()) {
            // If the first column is empty, we assume it's a blank row and skip it.
            return null;
        }
        req.setPartyType(PartyBase.PartyType.valueOf(partyTypeStr.toUpperCase()));

        req.setCompanyName(getCellValueAsString(row.getCell(1)));
        req.setCustomerCode(getCellValueAsString(row.getCell(2)));
        req.setPrimaryContactPerson(getCellValueAsString(row.getCell(3)));
        req.setMobile(getCellValueAsString(row.getCell(4)));
        req.setContactEmail(getCellValueAsString(row.getCell(5)));
        req.setContactPhone(getCellValueAsString(row.getCell(6)));
        req.setWorkPhone(getCellValueAsString(row.getCell(7)));
        req.setWebsite(getCellValueAsString(row.getCell(8)));
        req.setPanNumber(getCellValueAsString(row.getCell(9)));
        req.setVatNumber(getCellValueAsString(row.getCell(10)));
        String vatTreatmentStr = getCellValueAsString(row.getCell(11));
        if (vatTreatmentStr != null && !vatTreatmentStr.isBlank()) {
            req.setVatTreatment(PartyBase.VatTreatment.valueOf(vatTreatmentStr.toUpperCase()));
        }
        req.setVatTrnNumber(getCellValueAsString(row.getCell(12)));
        req.setCity(getCellValueAsString(row.getCell(13)));
        req.setRegion(getCellValueAsString(row.getCell(14)));
        req.setCurrency(getCellValueAsString(row.getCell(15)));
        req.setOpeningBalance(getCellValueAsBigDecimal(row.getCell(16)));
        String balanceTypeStr = getCellValueAsString(row.getCell(17));
        if (balanceTypeStr != null && !balanceTypeStr.isBlank()) {
            req.setOpeningBalanceType(PartyBase.BalanceType.valueOf(balanceTypeStr.toUpperCase()));
        }
        req.setCreditLimitAllowed(getCellValueAsBigDecimal(row.getCell(18)));
        req.setCreditPeriodAllowed(getCellValueAsInteger(row.getCell(19)));

        PartyRequest.AddressRequest billingAddress = new PartyRequest.AddressRequest();
        billingAddress.setAttention(getCellValueAsString(row.getCell(20)));
        billingAddress.setAddressLine(getCellValueAsString(row.getCell(21)));
        billingAddress.setCity(getCellValueAsString(row.getCell(22)));
        billingAddress.setState(getCellValueAsString(row.getCell(23)));
        billingAddress.setZipCode(getCellValueAsString(row.getCell(24)));
        billingAddress.setCountry(getCellValueAsString(row.getCell(25)));
        req.setBillingAddress(billingAddress);

        PartyRequest.AddressRequest shippingAddress = new PartyRequest.AddressRequest();
        shippingAddress.setAttention(getCellValueAsString(row.getCell(26)));
        shippingAddress.setAddressLine(getCellValueAsString(row.getCell(27)));
        shippingAddress.setCity(getCellValueAsString(row.getCell(28)));
        shippingAddress.setState(getCellValueAsString(row.getCell(29)));
        shippingAddress.setZipCode(getCellValueAsString(row.getCell(30)));
        shippingAddress.setCountry(getCellValueAsString(row.getCell(31)));
        req.setShippingAddress(shippingAddress);

        // Parse Bank Details (supports one bank detail entry per row)
        String bankName = getCellValueAsString(row.getCell(32));
        if (bankName != null && !bankName.isBlank()) {
            BaseBankDetailsRequest bankDetailsRequest = new BaseBankDetailsRequest();
            bankDetailsRequest.setBankName(bankName);
            bankDetailsRequest.setAccountNumber(getCellValueAsString(row.getCell(33)));
            bankDetailsRequest.setIfsCode(getCellValueAsString(row.getCell(34)));
            bankDetailsRequest.setIbanCode(getCellValueAsString(row.getCell(35)));
            bankDetailsRequest.setCorporateId(getCellValueAsString(row.getCell(36)));
            bankDetailsRequest.setLocationBranch(getCellValueAsString(row.getCell(37)));
            bankDetailsRequest.setBranchAddress(getCellValueAsString(row.getCell(38)));
            bankDetailsRequest.setBeneficiaryMailId(getCellValueAsString(row.getCell(39)));
            req.setBankDetails(List.of(bankDetailsRequest));
        }

        return req;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null || cell.getCellType() == CellType.BLANK) return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> new DataFormatter().formatCellValue(cell);
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula(); // Or evaluate formula if needed
            default -> null;
        };
    }

    private BigDecimal getCellValueAsBigDecimal(Cell cell) {
        String val = getCellValueAsString(cell);
        return (val != null && !val.isEmpty()) ? new BigDecimal(val) : null;
    }

    private Integer getCellValueAsInteger(Cell cell) {
        String val = getCellValueAsString(cell);
        return (val != null && !val.isEmpty()) ? new BigDecimal(val).intValue() : null;
    }


    public byte[] generateBulkUploadTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Parties");

            // Header Font
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 12);

            // Header Cell Style
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);

            // Create Header Row
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < HEADERS.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(HEADERS[i]);
                cell.setCellStyle(headerCellStyle);
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    public byte[] exportPartiesToExcel() throws IOException {
        Long tenantId = getCurrentTenant().getId();
        List<BaseCustomer> parties = repository.findByTenantId(tenantId);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Parties");

            // Header Font & Style
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);

            // Create Header Row
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < HEADERS.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(HEADERS[i]);
                cell.setCellStyle(headerCellStyle);
            }

            // Create Data Rows
            int rowIdx = 1;
            for (BaseCustomer party : parties) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(party.getPartyType() != null ? party.getPartyType().name() : "");
                row.createCell(1).setCellValue(party.getCompanyName());
                row.createCell(2).setCellValue(party.getCustomerCode());
                row.createCell(3).setCellValue(party.getPrimaryContactPerson());
                row.createCell(4).setCellValue(party.getMobile());
                row.createCell(5).setCellValue(party.getContactEmail());
                row.createCell(6).setCellValue(party.getContactPhone());
                row.createCell(7).setCellValue(party.getWorkPhone());
                row.createCell(8).setCellValue(party.getWebsite());
                row.createCell(9).setCellValue(party.getPanNumber());
                row.createCell(10).setCellValue(party.getVatNumber());
                row.createCell(11).setCellValue(party.getVatTreatment() != null ? party.getVatTreatment().name() : "");
                row.createCell(12).setCellValue(party.getVatTrnNumber());
                row.createCell(13).setCellValue(party.getCity());
                row.createCell(14).setCellValue(party.getRegion());
                row.createCell(15).setCellValue(party.getCurrency());
                row.createCell(16).setCellValue(party.getOpeningBalance() != null ? party.getOpeningBalance().toString() : "");
                row.createCell(17).setCellValue(party.getOpeningBalanceType() != null ? party.getOpeningBalanceType().name() : "");
                row.createCell(18).setCellValue(party.getCreditLimitAllowed() != null ? party.getCreditLimitAllowed().toString() : "");
                row.createCell(19).setCellValue(party.getCreditPeriodAllowed() != null ? party.getCreditPeriodAllowed().toString() : "");

                PartyBase.Address billing = party.getBillingAddress();
                if (billing != null) {
                    row.createCell(20).setCellValue(billing.getAttention());
                    row.createCell(21).setCellValue(billing.getAddressLine());
                    row.createCell(22).setCellValue(billing.getCity());
                    row.createCell(23).setCellValue(billing.getState());
                    row.createCell(24).setCellValue(billing.getZipCode());
                    row.createCell(25).setCellValue(billing.getCountry());
                }

                PartyBase.Address shipping = party.getShippingAddress();
                if (shipping != null) {
                    row.createCell(26).setCellValue(shipping.getAttention());
                    row.createCell(27).setCellValue(shipping.getAddressLine());
                    row.createCell(28).setCellValue(shipping.getCity());
                    row.createCell(29).setCellValue(shipping.getState());
                    row.createCell(30).setCellValue(shipping.getZipCode());
                    row.createCell(31).setCellValue(shipping.getCountry());
                }

                // Export the first bank detail, if available
                if (party.getBankDetails() != null && !party.getBankDetails().isEmpty()) {
                    BaseBankDetails bank = party.getBankDetails().get(0);
                    row.createCell(32).setCellValue(bank.getBankName());
                    row.createCell(33).setCellValue(bank.getAccountNumber());
                    row.createCell(34).setCellValue(bank.getIfsCode());
                    row.createCell(35).setCellValue(bank.getIbanCode());
                    row.createCell(36).setCellValue(bank.getCorporateId());
                    row.createCell(37).setCellValue(bank.getLocationBranch());
                    row.createCell(38).setCellValue(bank.getBranchAddress());
                    row.createCell(39).setCellValue(bank.getBeneficiaryMailId());
                }
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    private void mapRequestToEntity(PartyRequest req, BaseCustomer entity) {
        // Map PartyBase fields
        if (req.getPartyType() == null) {
            throw new IllegalArgumentException("PartyType must be provided and cannot be null.");
        }
        entity.setPartyType(req.getPartyType());
        entity.setTenant(getCurrentTenant());
        entity.setUnder(req.getUnder());
        entity.setPriceCategory(req.getPriceCategory());
        entity.setVendorCustomerCode(req.getVendorCustomerCode());
        entity.setCustomerCode(req.getCustomerCode());
        entity.setPrimaryContactTitle(req.getPrimaryContactTitle());
        entity.setPrimaryFirstName(req.getPrimaryFirstName());
        entity.setPrimaryLastName(req.getPrimaryLastName());
        entity.setPrimaryContactPerson(req.getPrimaryContactPerson());
        entity.setMobile(req.getMobile());
        entity.setContactEmail(req.getContactEmail());
        entity.setContactPhone(req.getContactPhone());
        entity.setWorkPhone(req.getWorkPhone());
        entity.setSkypeNameOrNumber(req.getSkypeNameOrNumber());
        entity.setDesignation(req.getDesignation());
        entity.setDepartment(req.getDepartment());
        entity.setCompanyName(req.getCompanyName());
        entity.setWebsite(req.getWebsite());
        entity.setOwnerCeoName(req.getOwnerCeoName());
        entity.setOwnerCeoContact(req.getOwnerCeoContact());
        entity.setOwnerCeoEmail(req.getOwnerCeoEmail());
        entity.setPanNumber(req.getPanNumber());
        entity.setTanNumber(req.getTanNumber());
        entity.setCinNo(req.getCinNo());
        entity.setVatNumber(req.getVatNumber());
        entity.setVatTreatment(req.getVatTreatment());
        entity.setVatTrnNumber(req.getVatTrnNumber());
        entity.setCity(req.getCity());
        entity.setRegion(req.getRegion());
        entity.setCurrency(req.getCurrency());
        entity.setTermsAndConditionsInternal(req.getTermsAndConditionsInternal());
        entity.setTermsAndConditionsDisplay(req.getTermsAndConditionsDisplay());
        entity.setModeOfPayment(req.getModeOfPayment());
        entity.setDeliveryType(req.getDeliveryType());
        entity.setPaymentTerms(req.getPaymentTerms());
        entity.setTransportDispatchThrough(req.getTransportDispatchThrough());
        entity.setFreightTerms(req.getFreightTerms());
        entity.setSplInstruction(req.getSplInstruction());
        entity.setSalesValuePreviousYear(req.getSalesValuePreviousYear());
        entity.setFacebook(req.getFacebook());
        entity.setTwitter(req.getTwitter());
        entity.setTaxDeducted(req.getTaxDeducted());
        entity.setOpeningBalance(req.getOpeningBalance());
        entity.setOpeningBalanceType(req.getOpeningBalanceType());
        entity.setCreditLimitAllowed(req.getCreditLimitAllowed());
        entity.setCreditPeriodAllowed(req.getCreditPeriodAllowed());
        entity.setBillingAddress(mapAddress(req.getBillingAddress()));
        entity.setShippingAddress(mapAddress(req.getShippingAddress()));
        entity.setShippingSameAsBilling(req.getShippingSameAsBilling());
        entity.setRemarks(req.getRemarks());

        // Map BaseCustomer specific fields
        entity.setPrimaryContactPersonFull(req.getPrimaryContactPersonFull());
        entity.setActive(req.getActive());

        // Map nested lists
        entity.getOtherPersons().clear();
        if (req.getOtherPersons() != null) {
            req.getOtherPersons().forEach(opReq -> {
                OtherPerson op = new OtherPerson();
                op.setParty(entity); // Link to parent
                op.setSalutation(opReq.getSalutation());
                op.setFirstName(opReq.getFirstName());
                op.setLastName(opReq.getLastName());
                op.setEmailAddress(opReq.getEmailAddress());
                op.setWorkPhone(opReq.getWorkPhone());
                op.setMobile(opReq.getMobile());
                op.setSkypeNameOrNumber(opReq.getSkypeNameOrNumber());
                op.setDesignation(opReq.getDesignation());
                op.setDepartment(opReq.getDepartment());
                entity.getOtherPersons().add(op);
            });
        }

        entity.getCustomFields().clear();
        if (req.getCustomFields() != null) {
            req.getCustomFields().forEach(cfReq -> {
                CustomField cf = new CustomField();
                cf.setParty(entity); // Link to parent
                cf.setFieldName(cfReq.getFieldName());
                cf.setFieldValue(cfReq.getFieldValue());
                entity.getCustomFields().add(cf);
            });
        }

        entity.getBankDetails().clear();
        if (req.getBankDetails() != null) {
            req.getBankDetails().forEach(bdReq -> {
                BaseBankDetails bd = new BaseBankDetails();
                bd.setParty(entity); // Link to parent
                bd.setBankName(bdReq.getBankName());
                bd.setAccountNumber(bdReq.getAccountNumber());
                bd.setIfsCode(bdReq.getIfsCode());
                bd.setIbanCode(bdReq.getIbanCode());
                bd.setCorporateId(bdReq.getCorporateId());
                bd.setLocationBranch(bdReq.getLocationBranch());
                bd.setBranchAddress(bdReq.getBranchAddress());
                bd.setBeneficiaryMailId(bdReq.getBeneficiaryMailId());
                entity.getBankDetails().add(bd);
            });
        }
    }

    private PartyBase.Address mapAddress(PartyRequest.AddressRequest req) {
        if (req == null) return null;
        return new PartyBase.Address(req.getAttention(), req.getAddressLine(), req.getCity(), req.getState(), req.getZipCode(), req.getCountry(), req.getPhone(), req.getFax());
    }
}