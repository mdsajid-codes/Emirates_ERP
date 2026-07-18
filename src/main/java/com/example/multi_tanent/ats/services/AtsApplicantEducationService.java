package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsApplicantEducationRequest;
import com.example.multi_tanent.ats.dto.AtsApplicantEducationResponse;
import com.example.multi_tanent.ats.entity.*;
import com.example.multi_tanent.ats.repository.*;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class AtsApplicantEducationService {

    private final AtsApplicantEducationRepository educationRepository;
    private final AtsApplicantRepository applicantRepository;
    private final AtsDegreeRepository degreeRepository;
    private final AtsCountryRepository countryRepository;
    private final AtsStateRepository stateRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public AtsApplicantEducationResponse create(Long applicantId, AtsApplicantEducationRequest request) {
        Tenant tenant = currentTenant();

        AtsApplicant applicant = applicantRepository.findByIdAndTenantId(applicantId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Applicant not found with id: " + applicantId));

        AtsDegree degree = degreeRepository.findByIdAndTenantId(request.getDegreeId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Degree not found with id: " + request.getDegreeId()));

        AtsCountry country = countryRepository.findByIdAndTenantId(request.getCountryId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Country not found with id: " + request.getCountryId()));

        AtsState state = null;
        if (request.getStateId() != null) {
            state = stateRepository.findByIdAndTenantId(request.getStateId(), tenant.getId())
                    .orElseThrow(() -> new EntityNotFoundException("State not found with id: " + request.getStateId()));
        }

        AtsApplicantEducation education = AtsApplicantEducation.builder()
                .tenant(tenant)
                .applicant(applicant)
                .degree(degree)
                .schoolName(request.getSchoolName())
                .yearCompleted(request.getYearCompleted())
                .majorStudy(request.getMajorStudy())
                .minorStudy(request.getMinorStudy())
                .gpa(request.getGpa())
                .country(country)
                .state(state)
                .city(request.getCity())
                .higherEducation(request.getHigherEducation())
                .build();

        AtsApplicantEducation saved = educationRepository.save(education);
        return toResponse(saved);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsApplicantEducationResponse> getAllForApplicant(Long applicantId) {
        Tenant tenant = currentTenant();
        if (!applicantRepository.existsById(applicantId)) {
            throw new EntityNotFoundException("Applicant not found with id: " + applicantId);
        }
        return educationRepository.findByApplicantIdAndTenantId(applicantId, tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsApplicantEducationResponse getById(Long applicantId, Long id) {
        Tenant tenant = currentTenant();
        return educationRepository.findByIdAndApplicantIdAndTenantId(id, applicantId, tenant.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Education not found with id: " + id));
    }

    public AtsApplicantEducationResponse update(Long applicantId, Long id, AtsApplicantEducationRequest request) {
        Tenant tenant = currentTenant();
        AtsApplicantEducation education = educationRepository.findByIdAndApplicantIdAndTenantId(id, applicantId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Education not found with id: " + id));

        AtsDegree degree = degreeRepository.findByIdAndTenantId(request.getDegreeId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Degree not found with id: " + request.getDegreeId()));

        AtsCountry country = countryRepository.findByIdAndTenantId(request.getCountryId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Country not found with id: " + request.getCountryId()));

        AtsState state = null;
        if (request.getStateId() != null) {
            state = stateRepository.findByIdAndTenantId(request.getStateId(), tenant.getId())
                    .orElseThrow(() -> new EntityNotFoundException("State not found with id: " + request.getStateId()));
        }

        education.setDegree(degree);
        education.setSchoolName(request.getSchoolName());
        education.setYearCompleted(request.getYearCompleted());
        education.setMajorStudy(request.getMajorStudy());
        education.setMinorStudy(request.getMinorStudy());
        education.setGpa(request.getGpa());
        education.setCountry(country);
        education.setState(state);
        education.setCity(request.getCity());
        education.setHigherEducation(request.getHigherEducation());

        AtsApplicantEducation updated = educationRepository.save(education);
        return toResponse(updated);
    }

    public void delete(Long applicantId, Long id) {
        Tenant tenant = currentTenant();
        AtsApplicantEducation education = educationRepository.findByIdAndApplicantIdAndTenantId(id, applicantId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Education not found with id: " + id));
        educationRepository.delete(education);
    }

    public AtsApplicantEducationResponse toResponse(AtsApplicantEducation education) {
        return AtsApplicantEducationResponse.builder()
                .id(education.getId())
                .applicantId(education.getApplicant().getId())
                .degreeId(education.getDegree().getId())
                .degreeName(education.getDegree().getName())
                .schoolName(education.getSchoolName())
                .yearCompleted(education.getYearCompleted())
                .majorStudy(education.getMajorStudy())
                .minorStudy(education.getMinorStudy())
                .gpa(education.getGpa())
                .countryId(education.getCountry().getId())
                .countryName(education.getCountry().getName())
                .stateId(education.getState() != null ? education.getState().getId() : null)
                .stateName(education.getState() != null ? education.getState().getName() : null)
                .city(education.getCity())
                .higherEducation(education.getHigherEducation())
                .build();
    }
}
