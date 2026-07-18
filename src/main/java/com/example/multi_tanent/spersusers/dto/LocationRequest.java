package com.example.multi_tanent.spersusers.dto;

import lombok.Data;

@Data
public class LocationRequest {
    private String name;
    private String address;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private Boolean isPrimary;
}