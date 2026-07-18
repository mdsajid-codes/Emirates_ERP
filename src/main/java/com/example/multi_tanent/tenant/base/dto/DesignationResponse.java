package com.example.multi_tanent.tenant.base.dto;

import com.example.multi_tanent.tenant.base.entity.Designation;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class DesignationResponse {
    private Long id;
    private String title;
    private String level;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long departmentId;
    private String departmentCode;
    private String departmentName;

    public static DesignationResponse fromEntity(Designation designation) {
        DesignationResponse dto = new DesignationResponse();
        dto.setId(designation.getId());
        dto.setTitle(designation.getTitle());
        dto.setLevel(designation.getLevel());
        dto.setDescription(designation.getDescription());
        dto.setCreatedAt(designation.getCreatedAt());
        dto.setUpdatedAt(designation.getUpdatedAt());
        if (designation.getDepartment() != null) {
            dto.setDepartmentId(designation.getDepartment().getId());
            dto.setDepartmentCode(designation.getDepartment().getCode());
            dto.setDepartmentName(designation.getDepartment().getName());
        }
        return dto;
    }
}