package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.services.AtsGeoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ats/geo")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsGeoController {

    private final AtsGeoService geoService;

    @GetMapping("/countries")
    public ResponseEntity<List<AtsGeoService.CountryDto>> getCountries() {
        return ResponseEntity.ok(geoService.getCountries());
    }

    @GetMapping("/states")
    public ResponseEntity<List<AtsGeoService.StateDto>> getStates(@RequestParam String country) {
        return ResponseEntity.ok(geoService.getStates(country));
    }
}
