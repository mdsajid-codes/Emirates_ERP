package com.example.multi_tanent.fleet.service;

import com.example.multi_tanent.accounts.dto.posting.PostingRequest;
import com.example.multi_tanent.accounts.dto.posting.PostingResult;
import com.example.multi_tanent.accounts.entity.enums.DocumentType;
import com.example.multi_tanent.accounts.service.posting.GLPostingEngine;
import com.example.multi_tanent.fleet.entity.FuelEntry;
import com.example.multi_tanent.fleet.entity.VehicleMaintenance;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FleetAccountingIntegrationService {

    private final GLPostingEngine glPostingEngine;

    @Transactional
    public Long postFuelEntry(FuelEntry fuelEntry) {
        try {
            log.info("Posting fuel entry to ledger for vehicle: {}", fuelEntry.getVehicle().getPlateNumber());

            PostingRequest request = new PostingRequest();
            request.setEntryDate(fuelEntry.getFuelDate());
            request.setDocumentType(DocumentType.FLEET_EXPENSE);
            request.setDescription("Fuel purchase for Vehicle: " + fuelEntry.getVehicle().getPlateNumber() 
                    + " (" + fuelEntry.getQuantityLiters() + "L)");
            request.setReferenceNumber("FUEL-" + fuelEntry.getId());
            request.setReferenceId(fuelEntry.getId());

            PostingRequest.Line line = new PostingRequest.Line();
            line.setAmount(fuelEntry.getAmountAed());
            line.setDescription("Fuel Expense - Plate: " + fuelEntry.getVehicle().getPlateNumber());
            line.setDimWarehouse(fuelEntry.getVehicle().getPlateNumber()); // Tag plate number as dimension for tracking
            request.setLines(List.of(line));

            PostingResult result = glPostingEngine.postDocument(request, "SYSTEM");
            if (!result.isSuccess()) {
                throw new RuntimeException(result.getMessage());
            }
            return result.getJournalEntryId();
        } catch (Exception e) {
            log.error("Failed to post fuel entry to ledger: {}", e.getMessage(), e);
            throw new RuntimeException("Accounting Integration Failed: " + e.getMessage(), e);
        }
    }

    @Transactional
    public Long postVehicleMaintenance(VehicleMaintenance maintenance) {
        try {
            log.info("Posting completed vehicle maintenance to ledger for vehicle: {}", maintenance.getVehicle().getPlateNumber());

            BigDecimal cost = maintenance.getActualCost() != null ? maintenance.getActualCost() : maintenance.getEstimatedCost();
            if (cost == null || cost.compareTo(BigDecimal.ZERO) <= 0) {
                log.warn("Maintenance cost is zero or null. Skipping ledger post.");
                return null;
            }

            PostingRequest request = new PostingRequest();
            request.setEntryDate(maintenance.getCompletedDate() != null ? maintenance.getCompletedDate() : maintenance.getRequestedDate());
            request.setDocumentType(DocumentType.FLEET_EXPENSE);
            request.setDescription("Maintenance (" + maintenance.getMaintenanceType() + ") for Vehicle: " 
                    + maintenance.getVehicle().getPlateNumber());
            request.setReferenceNumber("MAINT-" + maintenance.getId());
            request.setReferenceId(maintenance.getId());

            PostingRequest.Line line = new PostingRequest.Line();
            line.setAmount(cost);
            line.setDescription("Maintenance: " + maintenance.getServiceCategory() + " - Plate: " + maintenance.getVehicle().getPlateNumber());
            line.setDimWarehouse(maintenance.getVehicle().getPlateNumber());
            line.setDimExpenseItemId(maintenance.getId()); // To distinguish maintenance vs fuel
            request.setLines(List.of(line));

            PostingResult result = glPostingEngine.postDocument(request, "SYSTEM");
            if (!result.isSuccess()) {
                throw new RuntimeException(result.getMessage());
            }
            return result.getJournalEntryId();
        } catch (Exception e) {
            log.error("Failed to post vehicle maintenance to ledger: {}", e.getMessage(), e);
            throw new RuntimeException("Accounting Integration Failed: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void reverseJournalEntry(Long journalEntryId) {
        if (journalEntryId == null) return;
        try {
            log.info("Reversing journal entry: {}", journalEntryId);
            PostingResult result = glPostingEngine.reverseDocument(journalEntryId, "SYSTEM");
            if (!result.isSuccess()) {
                throw new RuntimeException(result.getMessage());
            }
        } catch (Exception e) {
            log.error("Failed to reverse journal entry {}: {}", journalEntryId, e.getMessage(), e);
            throw new RuntimeException("Accounting Reversal Failed: " + e.getMessage(), e);
        }
    }
}
