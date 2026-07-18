package com.example.multi_tanent.hanger.service;

import com.example.multi_tanent.hanger.dto.HngBatchTimelineResponse;
import com.example.multi_tanent.hanger.dto.HngBatchTimelineResponse.TimelineEvent;
import com.example.multi_tanent.hanger.entity.*;
import com.example.multi_tanent.hanger.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class HngBatchTimelineService {

        private final HngJobCardRepository jobCardRepo;
        private final HngQcLogRepository qcLogRepo;
        private final HngScrapEntryRepository scrapRepo;
        private final HngReworkEntryRepository reworkRepo;
        private final HngMachineDowntimeLogRepository downtimeRepo;
        private final HngBatchPackingRepository packingRepo;

        public HngBatchTimelineResponse getBatchTimeline(HngProductionBatch batch) {
                List<TimelineEvent> events = new ArrayList<>();
                Long batchId = batch.getId();
                Long tenantId = batch.getTenant().getId();

                // 1. Job Cards
                jobCardRepo.findByBatchIdAndTenantId(batchId, tenantId).forEach(jc -> {
                        events.add(TimelineEvent.builder()
                                        .timestamp(jc.getCreatedAt())
                                        .type("JOB_CARD")
                                        .title("Job Card Created")
                                        .description(jc.getJobCardNo() + " at "
                                                        + jc.getWorkstation().getWorkstationName() + " by "
                                                        + jc.getOperator().getFirstName())
                                        .icon("Cpu")
                                        .color("primary")
                                        .referenceId(jc.getId())
                                        .metadata(
                                                        Map.of("produced", jc.getProducedQty(), "oee",
                                                                        jc.getOeePct() != null ? jc.getOeePct() : 0))
                                        .build());
                });

                // 2. QC Logs
                qcLogRepo.findByBatch_IdAndTenantId(batchId, tenantId).forEach(qc -> {
                        events.add(TimelineEvent.builder()
                                        .timestamp(qc.getCreatedAt())
                                        .type("QC_INSPECTION")
                                        .title("QC Inspection")
                                        .description("Result: " + qc.getQcResult() + " (" + qc.getPassedQty() + "/"
                                                        + qc.getSampleSize() + " passed)")
                                        .icon("ShieldCheck")
                                        .color(qc.getQcResult().toString().equals("PASS") ? "green" : "red")
                                        .referenceId(qc.getId())
                                        .build());
                });

                // 3. Scrap Entries
                scrapRepo.findByBatchIdAndTenantId(batchId, tenantId).forEach(scrap -> {
                        events.add(TimelineEvent.builder()
                                        .timestamp(scrap.getCreatedAt())
                                        .type("SCRAP")
                                        .title("Scrap Logged")
                                        .description(scrap.getScrapWeightKg() + " kg of " + scrap.getScrapType()
                                                        + " scrap at "
                                                        + scrap.getStage()
                                                        + " stage")
                                        .icon("Trash2")
                                        .color("orange")
                                        .referenceId(scrap.getId())
                                        .build());
                });

                // 4. Rework Entries
                reworkRepo.findByBatchIdAndTenantId(batchId, tenantId).forEach(rework -> {
                        events.add(TimelineEvent.builder()
                                        .timestamp(rework.getCreatedAt())
                                        .type("REWORK")
                                        .title("Rework Requested")
                                        .description(rework.getReworkQty() + " units assigned to "
                                                        + (rework.getAssignedTo() != null
                                                                        ? rework.getAssignedTo().getFirstName()
                                                                        : "Unassigned"))
                                        .icon("RefreshCw")
                                        .color("amber")
                                        .referenceId(rework.getId())
                                        .metadata(Map.of("status", rework.getStatus()))
                                        .build());
                });

                // 5. Downtime Logs
                downtimeRepo.findByBatch_IdAndTenantId(batchId, tenantId).forEach(dt -> {
                        events.add(TimelineEvent.builder()
                                        .timestamp(dt.getCreatedAt())
                                        .type("DOWNTIME")
                                        .title("Machine Downtime")
                                        .description(dt.getDowntimeCategory() + " downtime for "
                                                        + dt.getDurationMinutes()
                                                        + " mins")
                                        .icon("AlertTriangle")
                                        .color("rose")
                                        .referenceId(dt.getId())
                                        .build());
                });

                // 6. Packing
                packingRepo.findByBatch_IdAndTenantId(batchId, tenantId).forEach(pk -> {
                        events.add(TimelineEvent.builder()
                                        .timestamp(pk.getCreatedAt())
                                        .type("PACKING")
                                        .title("Batch Packed")
                                        .description(pk.getPackedQty() + " units packed in " + pk.getPackingBatchNo())
                                        .icon("Box")
                                        .color("indigo")
                                        .referenceId(pk.getId())
                                        .build());
                });

                // Sort by timestamp descending
                events.sort(Comparator.comparing(TimelineEvent::getTimestamp).reversed());

                return new HngBatchTimelineResponse(events);
        }
}
