package com.example.multi_tanent.production.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProToolStationRequest {

    @NotBlank(message = "Station name is required.")
    private String name;

    private Integer position;
}