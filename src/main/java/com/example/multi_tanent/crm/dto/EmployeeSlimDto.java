package com.example.multi_tanent.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSlimDto {
    private Long id;
    private String firstName;
    private String lastName;
}