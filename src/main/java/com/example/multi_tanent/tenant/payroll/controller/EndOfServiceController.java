package com.example.multi_tanent.tenant.payroll.controller;

import com.example.multi_tanent.tenant.payroll.dto.EndOfServiceCalculationRequest;
import com.example.multi_tanent.tenant.payroll.dto.EndOfServiceResponse;
import com.example.multi_tanent.tenant.payroll.entity.EndOfService;
import com.example.multi_tanent.tenant.payroll.service.PdfGenerationService;
import com.example.multi_tanent.tenant.payroll.service.EndOfServiceCalculationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/eos")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
public class EndOfServiceController {

    private final EndOfServiceCalculationService eosService;
    private final PdfGenerationService pdfGenerationService;

    public EndOfServiceController(EndOfServiceCalculationService eosService, PdfGenerationService pdfGenerationService) {
        this.eosService = eosService;
        this.pdfGenerationService = pdfGenerationService;
    }

    @PostMapping("/calculate/{employeeCode}")
    public ResponseEntity<EndOfServiceResponse> calculateEndOfService(
            @PathVariable String employeeCode,
            @Valid @RequestBody EndOfServiceCalculationRequest request) {

 EndOfService eos = eosService.calculateAndSaveGratuity(employeeCode, request.getLastWorkingDay(), request.getTerminationReason());

        // The service returns null if gratuity is not applicable (e.g., < 1 year of service)
        return ResponseEntity.ok(EndOfServiceResponse.fromEntity(eos));
    }

    @GetMapping("/{employeeCode}")
    public ResponseEntity<EndOfServiceResponse> getEndOfService(@PathVariable String employeeCode) {
        return eosService.getEndOfServiceByEmployeeCode(employeeCode)
                .map(EndOfServiceResponse::fromEntity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/download-settlement/{employeeCode}")
    public ResponseEntity<byte[]> downloadFinalSettlement(@PathVariable String employeeCode) {
        // Find the calculated EndOfService record for the employee
        return eosService.getFinalSettlementDataForPdf(employeeCode)
            .map(pdfData -> {
                byte[] pdfBytes = pdfGenerationService.generateFinalSettlementPdf(pdfData);
        String filename = String.format("Final-Settlement-%s.pdf", employeeCode);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(pdfBytes.length);

        return ResponseEntity.ok().headers(headers).body(pdfBytes);
            })
            .orElse(ResponseEntity.notFound().build());
    }
}