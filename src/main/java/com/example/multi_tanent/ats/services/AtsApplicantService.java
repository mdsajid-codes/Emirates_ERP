package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.*;
import com.example.multi_tanent.ats.entity.AtsApplicant;
import com.example.multi_tanent.ats.enums.*;
import com.example.multi_tanent.ats.repository.AtsApplicantRepository;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.enitity.User;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.spersusers.repository.UserRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
@Slf4j
public class AtsApplicantService {

    private final AtsApplicantRepository atsApplicantRepository;
    private final TenantRepository tenantRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public AtsApplicantResponse createApplicant(AtsApplicantRequest request) {
        Tenant tenant = currentTenant();

        if (atsApplicantRepository.existsByEmailAndTenantId(request.getEmail(), tenant.getId())) {
            throw new IllegalArgumentException("Applicant with email '" + request.getEmail() + "' already exists for this tenant.");
        }

        AtsApplicant applicant = new AtsApplicant();
        mapReqToEntity(request, applicant);
        applicant.setTenant(tenant);

        AtsApplicant saved = atsApplicantRepository.save(applicant);
        return toResponse(saved);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public Page<AtsApplicantResponse> getAllApplicants(Pageable pageable) {
        Tenant tenant = currentTenant();
        return atsApplicantRepository.findByTenantId(tenant.getId(), pageable).map(this::toResponse);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsApplicantResponse getApplicantById(Long id) {
        Tenant tenant = currentTenant();
        return atsApplicantRepository.findByIdAndTenantId(id, tenant.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Applicant not found with id: " + id));
    }

    public AtsApplicantResponse updateApplicant(Long id, AtsApplicantRequest request) {
        Tenant tenant = currentTenant();
        AtsApplicant applicant = atsApplicantRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Applicant not found with id: " + id));

        if (!applicant.getEmail().equalsIgnoreCase(request.getEmail())
                && atsApplicantRepository.existsByEmailAndTenantId(request.getEmail(), tenant.getId())) {
            throw new IllegalArgumentException("Applicant with email '" + request.getEmail() + "' already exists for this tenant.");
        }

        mapReqToEntity(request, applicant);
        AtsApplicant updated = atsApplicantRepository.save(applicant);
        return toResponse(updated);
    }

    public void deleteApplicant(Long id) {
        Tenant tenant = currentTenant();
        AtsApplicant applicant = atsApplicantRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Applicant not found with id: " + id));
        atsApplicantRepository.delete(applicant);
    }

    public AtsApplicantResponse blacklistApplicant(Long id, String reason) {
        Tenant tenant = currentTenant();
        AtsApplicant applicant = atsApplicantRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Applicant not found with id: " + id));

        applicant.setIsBlacklisted(true);
        applicant.setApplicantStatus(ApplicantStatus.BLACKLISTED);
        applicant.setAdditionalComments(Optional.ofNullable(applicant.getAdditionalComments()).orElse("") + "\nBlacklist Reason: " + reason);

        AtsApplicant saved = atsApplicantRepository.save(applicant);
        return toResponse(saved);
    }

    private void mapReqToEntity(AtsApplicantRequest r, AtsApplicant e) {
        e.setSalutation(r.getSalutation());
        e.setFirstName(r.getFirstName());
        e.setMiddleName(r.getMiddleName());
        e.setLastName(r.getLastName());
        e.setNickName(r.getNickName());
        e.setEmail(r.getEmail());
        e.setAlternateEmail(r.getAlternateEmail());
        e.setHomePhone(r.getHomePhone());
        e.setMobileNumber(r.getMobileNumber());
        e.setWorkPhone(r.getWorkPhone());
        e.setOtherPhone(r.getOtherPhone());
        e.setSkypeId(r.getSkypeId());
        e.setLinkedinUrl(r.getLinkedinUrl());
        e.setFacebookUrl(r.getFacebookUrl());
        e.setTwitterUrl(r.getTwitterUrl());
        e.setVideoReference(r.getVideoReference());
        e.setWorkAuthorization(r.getWorkAuthorization());
        e.setWorkAuthExpiry(r.getWorkAuthExpiry());
        e.setHasClearance(r.getHasClearance() != null ? r.getHasClearance() : false);
        e.setAddress(r.getAddress());
        e.setSource(r.getSource());
        e.setExperienceYears(r.getExperienceYears());
        e.setExperienceMonths(r.getExperienceMonths());
        e.setReferredBy(r.getReferredBy());
        if (r.getApplicantStatus() != null) {
            e.setApplicantStatus(r.getApplicantStatus());
        }
        e.setApplicantGroup(r.getApplicantGroup());
        e.setJobTitle(r.getJobTitle());
        e.setExpectedPayAmount(r.getExpectedPayAmount());
        e.setExpectedPayCurrency(r.getExpectedPayCurrency());
        e.setExpectedPayPeriod(r.getExpectedPayPeriod());
        e.setAdditionalComments(r.getAdditionalComments());
        e.setWillingToRelocate(r.getWillingToRelocate() != null ? r.getWillingToRelocate() : false);
        e.setPrimarySkills(r.getPrimarySkills());
        e.setTechnology(r.getTechnology());
        e.setTaxTerms(r.getTaxTerms());
        e.setNoticePeriod(r.getNoticePeriod());
        e.setGpa(r.getGpa());
        e.setAadharNumber(r.getAadharNumber());
        e.setNationality(r.getNationality());
        e.setReferenceId(r.getReferenceId());
        e.setPhotoUrl(r.getPhotoUrl());

        // EEO Details
        e.setGender(r.getGender());
        e.setRaceEthnicity(r.getRaceEthnicity());
        e.setVeteranStatus(r.getVeteranStatus());
        e.setDisability(r.getDisability());

        // Owner/Recruiter Linkage
        if (r.getOwnerId() != null) {
            e.setOwner(employeeRepository.findById(r.getOwnerId()).orElse(null));
        } else {
            e.setOwner(null);
        }

        // User Linkage
        if (r.getUserId() != null) {
            e.setUser(userRepository.findById(r.getUserId()).orElse(null));
        } else {
            e.setUser(null);
        }
    }

    private AtsApplicantResponse toResponse(AtsApplicant e) {
        String fullName = (e.getFirstName() != null ? e.getFirstName() : "") + " " + (e.getLastName() != null ? e.getLastName() : "");
        fullName = fullName.trim();

        String experienceDisplay = "";
        if (e.getExperienceYears() != null || e.getExperienceMonths() != null) {
            int yrs = e.getExperienceYears() != null ? e.getExperienceYears() : 0;
            int mths = e.getExperienceMonths() != null ? e.getExperienceMonths() : 0;
            experienceDisplay = yrs + " Years " + mths + " Months";
        }

        List<AtsApplicantDocumentResponse> docs = e.getDocuments() != null ? e.getDocuments().stream().map(doc -> AtsApplicantDocumentResponse.builder()
                .id(doc.getId())
                .applicantId(e.getId())
                .title(doc.getTitle())
                .fileName(doc.getFileName())
                .filePath(doc.getFilePath())
                .documentTypeId(doc.getDocumentType() != null ? doc.getDocumentType().getId() : null)
                .documentTypeName(doc.getDocumentType() != null ? doc.getDocumentType().getName() : null)
                .comments(doc.getComments())
                .build()).collect(Collectors.toList()) : new java.util.ArrayList<>();

        List<AtsApplicantEducationResponse> edus = e.getEducations() != null ? e.getEducations().stream().map(edu -> AtsApplicantEducationResponse.builder()
                .id(edu.getId())
                .applicantId(e.getId())
                .degreeId(edu.getDegree() != null ? edu.getDegree().getId() : null)
                .degreeName(edu.getDegree() != null ? edu.getDegree().getName() : null)
                .schoolName(edu.getSchoolName())
                .yearCompleted(edu.getYearCompleted())
                .majorStudy(edu.getMajorStudy())
                .minorStudy(edu.getMinorStudy())
                .gpa(edu.getGpa())
                .countryId(edu.getCountry() != null ? edu.getCountry().getId() : null)
                .countryName(edu.getCountry() != null ? edu.getCountry().getName() : null)
                .stateId(edu.getState() != null ? edu.getState().getId() : null)
                .stateName(edu.getState() != null ? edu.getState().getName() : null)
                .city(edu.getCity())
                .higherEducation(edu.getHigherEducation())
                .build()).collect(Collectors.toList()) : new java.util.ArrayList<>();

        List<AtsApplicantCertificationResponse> certs = e.getCertifications() != null ? e.getCertifications().stream().map(cert -> AtsApplicantCertificationResponse.builder()
                .id(cert.getId())
                .applicantId(e.getId())
                .certificationName(cert.getCertificationName())
                .completedDate(cert.getCompletedDate())
                .comments(cert.getComments())
                .build()).collect(Collectors.toList()) : new java.util.ArrayList<>();

        List<AtsApplicantLanguageResponse> langs = e.getLanguages() != null ? e.getLanguages().stream().map(lang -> AtsApplicantLanguageResponse.builder()
                .id(lang.getId())
                .applicantId(e.getId())
                .languageName(lang.getLanguageName())
                .canRead(lang.getCanRead())
                .canSpeak(lang.getCanSpeak())
                .canWrite(lang.getCanWrite())
                .build()).collect(Collectors.toList()) : new java.util.ArrayList<>();

        List<AtsApplicantWorkExperienceResponse> exps = e.getWorkExperiences() != null ? e.getWorkExperiences().stream().map(exp -> AtsApplicantWorkExperienceResponse.builder()
                .id(exp.getId())
                .applicantId(e.getId())
                .employerName(exp.getEmployerName())
                .jobTitle(exp.getJobTitle())
                .startDate(exp.getStartDate())
                .endDate(exp.getEndDate())
                .isCurrent(exp.getIsCurrent())
                .location(exp.getLocation())
                .description(exp.getDescription())
                .build()).collect(Collectors.toList()) : new java.util.ArrayList<>();

        return AtsApplicantResponse.builder()
                .id(e.getId())
                .salutation(e.getSalutation())
                .firstName(e.getFirstName())
                .middleName(e.getMiddleName())
                .lastName(e.getLastName())
                .nickName(e.getNickName())
                .fullName(fullName)
                .email(e.getEmail())
                .alternateEmail(e.getAlternateEmail())
                .homePhone(e.getHomePhone())
                .mobileNumber(e.getMobileNumber())
                .workPhone(e.getWorkPhone())
                .otherPhone(e.getOtherPhone())
                .skypeId(e.getSkypeId())
                .linkedinUrl(e.getLinkedinUrl())
                .facebookUrl(e.getFacebookUrl())
                .twitterUrl(e.getTwitterUrl())
                .videoReference(e.getVideoReference())
                .workAuthorization(e.getWorkAuthorization())
                .workAuthExpiry(e.getWorkAuthExpiry())
                .hasClearance(e.getHasClearance())
                .address(e.getAddress())
                .source(e.getSource())
                .experienceYears(e.getExperienceYears())
                .experienceMonths(e.getExperienceMonths())
                .experienceDisplay(experienceDisplay)
                .referredBy(e.getReferredBy())
                .applicantStatus(e.getApplicantStatus())
                .applicantGroup(e.getApplicantGroup())
                .ownerId(e.getOwner() != null ? e.getOwner().getId() : null)
                .ownerName(e.getOwner() != null ? e.getOwner().getFirstName() + " " + e.getOwner().getLastName() : null)
                .jobTitle(e.getJobTitle())
                .expectedPayAmount(e.getExpectedPayAmount())
                .expectedPayCurrency(e.getExpectedPayCurrency())
                .expectedPayPeriod(e.getExpectedPayPeriod())
                .additionalComments(e.getAdditionalComments())
                .willingToRelocate(e.getWillingToRelocate())
                .primarySkills(e.getPrimarySkills())
                .technology(e.getTechnology())
                .taxTerms(e.getTaxTerms())
                .noticePeriod(e.getNoticePeriod())
                .gpa(e.getGpa())
                .aadharNumber(e.getAadharNumber())
                .nationality(e.getNationality())
                .referenceId(e.getReferenceId())
                .photoUrl(e.getPhotoUrl())
                .isBlacklisted(e.getIsBlacklisted())
                .gender(e.getGender())
                .raceEthnicity(e.getRaceEthnicity())
                .veteranStatus(e.getVeteranStatus())
                .disability(e.getDisability())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .createdById(e.getCreatedBy() != null ? e.getCreatedBy().getId() : null)
                .createdByName(e.getCreatedBy() != null ? e.getCreatedBy().getFirstName() + " " + e.getCreatedBy().getLastName() : null)
                .userId(e.getUser() != null ? e.getUser().getId() : null)
                .userName(e.getUser() != null ? e.getUser().getName() : null)
                .documents(docs)
                .educations(edus)
                .certifications(certs)
                .languages(langs)
                .workExperiences(exps)
                .build();
    }
}
