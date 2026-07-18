package com.example.multi_tanent.crm.dto;



import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmPermissionDto {
    private Long id;
    private String code;
    private String name;
    private String description;
}

