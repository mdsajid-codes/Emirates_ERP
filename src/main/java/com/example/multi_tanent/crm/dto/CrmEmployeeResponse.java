package com.example.multi_tanent.crm.dto;


import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmEmployeeResponse {
    private Long id;
    private String name;
    private String email;
    private Long tenantId;
}
