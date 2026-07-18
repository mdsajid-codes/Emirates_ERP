package com.example.multi_tanent.master.service.impl;

import com.example.multi_tanent.master.dto.*;
import com.example.multi_tanent.master.entity.MyBankDetails;
import com.example.multi_tanent.master.entity.MyCompanyInfo;
import com.example.multi_tanent.master.entity.MyCustomField;
import com.example.multi_tanent.master.repository.MyCompanyInfoRepository;
import com.example.multi_tanent.master.repository.MyBankDetailsRepository;
import com.example.multi_tanent.master.repository.MyCustomFieldRepository;
import com.example.multi_tanent.master.repository.MasterTenantRepository;
import com.example.multi_tanent.master.service.MyCompanyInfoService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.net.MalformedURLException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MyCompanyInfoServiceImpl implements MyCompanyInfoService {

    private final MyCompanyInfoRepository companyInfoRepository;
    private final MyBankDetailsRepository bankDetailsRepository;
    private final MyCustomFieldRepository customFieldRepository;
    // private final MasterTenantRepository masterTenantRepository; // Assuming we
    // link significantly later or pick first

    @Value("${file.upload-dir:upload/myCompany}")
    private String uploadDir;

    @Override
    public MyCompanyInfoResponse saveOrUpdateCompanyInfo(MyCompanyInfoRequest request) throws IOException {
        // For simplicity, we assume we are updating the single company info record if
        // it exists,
        // or creating one if it doesn't.
        // In a real multi-tenant master scenario, we might filtering by the
        // authenticated admin's tenant context.
        // Here we'll treat it as a singleton for the Master Company (SaaS Provider).

        MyCompanyInfo companyInfo = companyInfoRepository.findAll().stream().findFirst()
                .orElse(new MyCompanyInfo());

        // Update basic fields
        updateBasicFields(companyInfo, request);

        // Handle Files
        if (request.getLogoImage() != null && !request.getLogoImage().isEmpty()) {
            companyInfo.setLogoUrl(saveFile(request.getLogoImage()));
        }
        if (request.getSignatureImage() != null && !request.getSignatureImage().isEmpty()) {
            companyInfo.setSignatureUrl(saveFile(request.getSignatureImage()));
        }
        if (request.getStampImage() != null && !request.getStampImage().isEmpty()) {
            companyInfo.setStampUrl(saveFile(request.getStampImage()));
        }
        if (request.getInvoiceHeaderImage() != null && !request.getInvoiceHeaderImage().isEmpty()) {
            companyInfo.setInvoiceHeaderUrl(saveFile(request.getInvoiceHeaderImage()));
        }
        if (request.getInvoiceFooterImage() != null && !request.getInvoiceFooterImage().isEmpty()) {
            companyInfo.setInvoiceFooterUrl(saveFile(request.getInvoiceFooterImage()));
        }
        if (request.getWatermarkImage() != null && !request.getWatermarkImage().isEmpty()) {
            companyInfo.setWatermarkUrl(saveFile(request.getWatermarkImage()));
        }

        // Save parent first to get ID
        MyCompanyInfo savedCompanyInfo = companyInfoRepository.save(companyInfo);

        // Handle Bank Details (Replace all for simplicity or merge)
        // Here we replace all
        if (request.getBankDetails() != null) {
            // Remove existing
            if (savedCompanyInfo.getBankAccounts() != null) {
                savedCompanyInfo.getBankAccounts().clear();
            }

            List<MyBankDetails> banks = request.getBankDetails().stream().map(dto -> {
                MyBankDetails bank = new MyBankDetails();
                bank.setBankName(dto.getBankName());
                bank.setAccountNumber(dto.getAccountNumber());
                bank.setIfscCode(dto.getIfscCode());
                bank.setAccountHolderName(dto.getAccountHolderName());
                bank.setBranchName(dto.getBranchName());
                bank.setSwiftCode(dto.getSwiftCode());
                bank.setIban(dto.getIban());
                bank.setPrimary(dto.isPrimary());
                bank.setMyCompanyInfo(savedCompanyInfo);
                return bank;
            }).collect(Collectors.toList());

            if (savedCompanyInfo.getBankAccounts() == null) {
                savedCompanyInfo.setBankAccounts(banks);
            } else {
                savedCompanyInfo.getBankAccounts().addAll(banks);
            }
        }

        // Handle Custom Fields
        if (request.getCustomFields() != null) {
            if (savedCompanyInfo.getCustomFields() != null) {
                savedCompanyInfo.getCustomFields().clear();
            }

            List<MyCustomField> fields = request.getCustomFields().stream().map(dto -> {
                MyCustomField field = new MyCustomField();
                field.setFieldName(dto.getFieldName());
                field.setFieldValue(dto.getFieldValue());
                field.setFieldType(dto.getFieldType());
                field.setDocumentName(dto.getDocumentName());
                // documentUrl for custom fields woud need individual file handling if sent as
                // multipart
                field.setMyCompanyInfo(savedCompanyInfo);
                return field;
            }).collect(Collectors.toList());

            if (savedCompanyInfo.getCustomFields() == null) {
                savedCompanyInfo.setCustomFields(fields);
            } else {
                savedCompanyInfo.getCustomFields().addAll(fields);
            }
        }

        return MyCompanyInfoResponse.fromEntity(companyInfoRepository.save(savedCompanyInfo));
    }

    @Override
    public MyCompanyInfoResponse getCompanyInfo() {
        return companyInfoRepository.findAll().stream().findFirst()
                .map(MyCompanyInfoResponse::fromEntity)
                .orElse(null);
    }

    @Override
    public void deleteCompanyInfo() {
        companyInfoRepository.deleteAll();
    }

    @Override
    public Resource loadFileAsResource(String fileName) throws IOException {
        Path filePath = Paths.get(uploadDir).resolve(fileName).normalize();
        Resource resource = new UrlResource(filePath.toUri());
        if (resource.exists()) {
            return resource;
        } else {
            throw new EntityNotFoundException("File not found " + fileName);
        }
    }

    private void updateBasicFields(MyCompanyInfo info, MyCompanyInfoRequest req) {
        info.setCompanyName(req.getCompanyName());
        info.setAddress(req.getAddress());
        info.setCity(req.getCity());
        info.setEmirate(req.getEmirate());
        info.setPoBox(req.getPoBox());
        info.setCountry(req.getCountry());
        info.setPhone(req.getPhone());
        info.setEmail(req.getEmail());
        info.setWebsite(req.getWebsite());
        info.setTradeLicenseNumber(req.getTradeLicenseNumber());
        info.setTradeLicenseExpiry(req.getTradeLicenseExpiry());
        info.setTrn(req.getTrn());
        info.setMohreEstablishmentId(req.getMohreEstablishmentId());
        info.setVisaQuotaTotal(req.getVisaQuotaTotal());
        info.setEmployerBankRoutingCode(req.getEmployerBankRoutingCode());
    }

    private String saveFile(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            originalFilename = "file";
        }

        // Sanitize filename specifically? User asked for millisec_name.ext
        long timestamp = System.currentTimeMillis();
        String newFilename = timestamp + "_" + originalFilename;

        Path filePath = uploadPath.resolve(newFilename);
        Files.copy(file.getInputStream(), filePath);

        return filePath.toString();
    }
}
