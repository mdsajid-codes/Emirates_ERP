package com.example.multi_tanent.spersusers.dto;

import com.example.multi_tanent.spersusers.enitity.Location;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationResponse {
    private Long id;
    private String name;
    private String address;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private Boolean isPrimary;

    public static LocationResponse fromEntity(Location location) {
        return new LocationResponse(
                location.getId(),
                location.getName(),
                location.getAddress(),
                location.getCity(),
                location.getState(),
                location.getPostalCode(),
                location.getCountry(),
                location.getIsPrimary()
        );
    }
}