package com.example.multi_tanent.tenant.employee.dto;

import com.example.multi_tanent.spersusers.enums.ContractType;
import com.example.multi_tanent.tenant.employee.entity.JobDetails;
import lombok.Data;

import java.time.LocalDate;

@Data
public class JobDetailsResponse {
    private Long id;
    private String employeeCode;
    private String locationName;
    private String actualLocation;
    private String department;
    private String designation;
    private String jobBand;
    private String reportsTo;
    private LocalDate dateOfJoining;
    private LocalDate probationEndDate;
    private String loginId;
    private String profileName;
    private String employeeNumber;
    private String legalEntity;
    private ContractType contractType;

    public static JobDetailsResponse fromEntity(JobDetails jobDetails) {
        JobDetailsResponse dto = new JobDetailsResponse();
        dto.setId(jobDetails.getId());
        if (jobDetails.getEmployee() != null) {
            dto.setEmployeeCode(jobDetails.getEmployee().getEmployeeCode());
        }
        if (jobDetails.getLocation() != null) {
            dto.setLocationName(jobDetails.getLocation().getName());
        }
        // Map all other fields from JobDetails to the DTO
        dto.setActualLocation(jobDetails.getActualLocation());
        dto.setDepartment(jobDetails.getDepartment());
        dto.setDesignation(jobDetails.getDesignation());
        dto.setJobBand(jobDetails.getJobBand());
        dto.setReportsTo(jobDetails.getReportsTo());
        dto.setDateOfJoining(jobDetails.getDateOfJoining());
        dto.setProbationEndDate(jobDetails.getProbationEndDate());
        dto.setLoginId(jobDetails.getLoginId());
        dto.setProfileName(jobDetails.getProfileName());
        dto.setEmployeeNumber(jobDetails.getEmployeeNumber());
        dto.setLegalEntity(jobDetails.getLegalEntity());
        dto.setContractType(jobDetails.getContractType());
        return dto;
    }
}