package com.example.multi_tanent.tenant.base.controller;

import com.example.multi_tanent.tenant.base.dto.NationalityRequest;
import com.example.multi_tanent.tenant.base.entity.Nationality;
import com.example.multi_tanent.tenant.base.repository.NationalityRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/nationalities")
@CrossOrigin(origins = "*")
@Transactional(transactionManager = "tenantTx")
public class NationalityController {

    private final NationalityRepository nationalityRepository;

    public NationalityController(NationalityRepository nationalityRepository) {
        this.nationalityRepository = nationalityRepository;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<?> createNationality(@RequestBody NationalityRequest request) {
        if (nationalityRepository.findByName(request.getName()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("A nationality with the name '" + request.getName() + "' already exists.");
        }
        if (request.getIsoCode() != null && !request.getIsoCode().isEmpty() && nationalityRepository.findByIsoCode(request.getIsoCode()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("A nationality with the ISO code '" + request.getIsoCode() + "' already exists.");
        }

        Nationality nationality = new Nationality();
        nationality.setName(request.getName());
        nationality.setIsoCode(request.getIsoCode());

        Nationality savedNationality = nationalityRepository.save(nationality);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(savedNationality.getId()).toUri();

        return ResponseEntity.created(location).body(savedNationality);
    }

    @GetMapping
    public ResponseEntity<List<Nationality>> getAllNationalities() {
        return ResponseEntity.ok(nationalityRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Nationality> getNationalityById(@PathVariable Long id) {
        return nationalityRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<?> updateNationality(@PathVariable Long id, @RequestBody NationalityRequest request) {
        Optional<Nationality> existingByName = nationalityRepository.findByName(request.getName());
        if (existingByName.isPresent() && !existingByName.get().getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Another nationality with the name '" + request.getName() + "' already exists.");
        }

        return nationalityRepository.findById(id)
                .map(nationality -> {
                    nationality.setName(request.getName());
                    nationality.setIsoCode(request.getIsoCode());
                    Nationality updatedNationality = nationalityRepository.save(nationality);
                    return ResponseEntity.ok(updatedNationality);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<Void> deleteNationality(@PathVariable Long id) {
        return nationalityRepository.findById(id)
                .map(nationality -> {
                    nationalityRepository.delete(nationality);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
