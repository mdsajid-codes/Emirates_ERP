package com.example.multi_tanent.tenant.base.dto;

import com.example.multi_tanent.tenant.base.entity.JobBand;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class JobBandResponse {
    private Long id;
    private String name;
    private Integer level;
    private Long minSalary;
    private Long maxSalary;
    private String notes;
    private Long designationId;
    private String designationTitle;

    public static JobBandResponse fromEntity(JobBand jobBand) {
        JobBandResponse dto = new JobBandResponse();
        dto.setId(jobBand.getId());
        dto.setName(jobBand.getName());
        dto.setLevel(jobBand.getLevel());
        dto.setMinSalary(jobBand.getMinSalary());
        dto.setMaxSalary(jobBand.getMaxSalary());
        dto.setNotes(jobBand.getNotes());
        if (jobBand.getDesignation() != null) {
            dto.setDesignationId(jobBand.getDesignation().getId());
            dto.setDesignationTitle(jobBand.getDesignation().getTitle());
        }
        return dto;
    }
}