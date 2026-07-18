package com.example.multi_tanent.spersusers.dto;

import java.time.LocalDate;

import com.example.multi_tanent.spersusers.enums.EmployeeStatus;
import com.example.multi_tanent.spersusers.enums.Gender;
import com.example.multi_tanent.spersusers.enums.MartialStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeRequest {
    private String email;
    private String employeeCode;
    private String firstName;
    private String middleName;
    private String lastName;
    private String emailWork;
    private String emailPersonal;
    private String phonePrimary;
    private LocalDate dob;
    private Gender gender;
    private MartialStatus martialStatus;
    private EmployeeStatus status;
    private String photoPath;
    private Long locationId;
}
