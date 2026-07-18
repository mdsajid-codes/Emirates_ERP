package com.example.multi_tanent.master.service.impl;

import com.example.multi_tanent.master.dto.TenantCompanyInfoRequest;
import com.example.multi_tanent.master.dto.TenantCompanyInfoResponse;
import com.example.multi_tanent.master.entity.MasterTenant;
import com.example.multi_tanent.master.entity.TenantCompanyInfo;
import com.example.multi_tanent.master.repository.MasterTenantRepository;
import com.example.multi_tanent.master.repository.TenantCompanyInfoRepository;
import com.example.multi_tanent.master.service.TenantCompanyInfoService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class TenantCompanyInfoServiceImpl implements TenantCompanyInfoService {

    private final TenantCompanyInfoRepository repository;
    private final MasterTenantRepository masterTenantRepository;

    @Value("${file.upload-dir:upload/tenantCompanyInfo}")
    private String uploadDir;

    @Override
    public TenantCompanyInfoResponse saveOrUpdate(Long masterTenantId, TenantCompanyInfoRequest request)
            throws IOException {
        MasterTenant masterTenant = masterTenantRepository.findById(masterTenantId)
                .orElseThrow(() -> new EntityNotFoundException("MasterTenant not found with id: " + masterTenantId));

        TenantCompanyInfo info = repository.findByMasterTenantId(masterTenantId)
                .orElse(new TenantCompanyInfo());

        if (info.getId() == null) {
            info.setMasterTenant(masterTenant);
        }

        updateFields(info, request);

        if (request.getLogoImage() != null && !request.getLogoImage().isEmpty()) {
            info.setLogoUrl(saveFile(request.getLogoImage()));
        }

        return TenantCompanyInfoResponse.fromEntity(repository.save(info));
    }

    @Override
    public TenantCompanyInfoResponse getByMasterTenantId(Long masterTenantId) {
        return repository.findByMasterTenantId(masterTenantId)
                .map(TenantCompanyInfoResponse::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("Company Info not found for tenant: " + masterTenantId));
    }

    @Override
    public void deleteByMasterTenantId(Long masterTenantId) {
        TenantCompanyInfo info = repository.findByMasterTenantId(masterTenantId)
                .orElseThrow(() -> new EntityNotFoundException("Company Info not found for tenant: " + masterTenantId));
        repository.delete(info);
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

    private void updateFields(TenantCompanyInfo info, TenantCompanyInfoRequest req) {
        info.setCompanyName(req.getCompanyName());
        info.setAddress(req.getAddress());
        info.setCity(req.getCity());
        info.setState(req.getState());
        info.setCountry(req.getCountry());
        info.setZipCode(req.getZipCode());
        info.setPhone(req.getPhone());
        info.setEmail(req.getEmail());
        info.setWebsite(req.getWebsite());
        info.setTaxId(req.getTaxId());
        info.setRegistrationNumber(req.getRegistrationNumber());
        info.setEmirate(req.getEmirate());
        info.setPoBox(req.getPoBox());
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

        long timestamp = System.currentTimeMillis();
        String newFilename = timestamp + "_" + originalFilename;

        Path filePath = uploadPath.resolve(newFilename);
        Files.copy(file.getInputStream(), filePath);

        return filePath.toString();
    }
}
