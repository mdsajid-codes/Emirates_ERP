package com.example.multi_tanent.spersusers.dto;

import jakarta.persistence.Column;
import lombok.Data;

@Data
public class StoreRequest {
    @Column (nullable = false)
    private String name;

    private String address;

    private String currency;

    private String timezone;

    private String vatNumber;
}