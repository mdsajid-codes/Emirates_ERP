package com.example.multi_tanent.fleet.controller;

import com.example.multi_tanent.fleet.dtos.TripCustomerResponse;
import com.example.multi_tanent.fleet.dtos.CustomerFollowUpResponse;
import com.example.multi_tanent.fleet.entity.TripCustomer;
import com.example.multi_tanent.fleet.service.TripCustomerService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/fleet/trip-customers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TripCustomerController {

    private final TripCustomerService service;

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<TripCustomerResponse> create(
            @RequestPart("customer") TripCustomer customer,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        TripCustomer saved = service.createCustomer(customer, file);
        return ResponseEntity.ok(TripCustomerResponse.fromEntity(saved));
    }

    @GetMapping
    public ResponseEntity<List<TripCustomerResponse>> getAllActive() {
        return ResponseEntity.ok(service.getAllActive().stream()
                .map(TripCustomerResponse::fromEntity)
                .toList());
    }

    @GetMapping("/paginated")
    public ResponseEntity<org.springframework.data.domain.Page<TripCustomerResponse>> listCustomers(
            @RequestParam(required = false) String search,
            org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(service.listCustomers(search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripCustomerResponse> getById(@PathVariable Long id) {
        try {
            TripCustomerResponse customer = service.getTripCustomerById(id);
            return ResponseEntity.ok(customer);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<TripCustomerResponse> update(
            @PathVariable Long id,
            @RequestPart("customer") TripCustomer customer,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        TripCustomer updated = service.updateCustomer(id, customer, file);
        return ResponseEntity.ok(TripCustomerResponse.fromEntity(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deactivateCustomer(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/follow-ups")
    public ResponseEntity<CustomerFollowUpResponse> logFollowUp(
            @PathVariable Long id, 
            @RequestBody com.example.multi_tanent.fleet.entity.CustomerFollowUp followUp) {
        return ResponseEntity.ok(CustomerFollowUpResponse.fromEntity(service.logFollowUp(id, followUp)));
    }

    @GetMapping("/{id}/follow-ups")
    public ResponseEntity<List<CustomerFollowUpResponse>> getFollowUps(@PathVariable Long id) {
        return ResponseEntity.ok(service.getFollowUps(id).stream()
                .map(CustomerFollowUpResponse::fromEntity)
                .toList());
    }
}
