package com.example.multi_tanent.tenant.employee.dto;

import com.example.multi_tanent.master.enums.Role;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enums.Gender;
import lombok.Data;

import java.time.LocalDate;
import java.util.Set;

@Data
public class BulkEmployeeRowDto {
    private int rowNumber;

    // User details
    private String userEmail;
    private String password;
    private String fullName;
    private Set<Role> roles;

    // Employee details
    private String employeeCode;
    private String firstName;
    private String lastName;
    private String workEmail;
    private String primaryPhone;
    private LocalDate dateOfBirth;
    private Location location;
    private Gender gender;

    // Profile details
    private String address;
    private String city;
    private String state;
    private String country;
    private String postalCode;
    private String bankName;
    private String bankAccountNumber;
    private String ifscCode;

    // Job details
    private String designation;
    private String department;
    private LocalDate dateOfJoining;
    private String reportsTo;


}
