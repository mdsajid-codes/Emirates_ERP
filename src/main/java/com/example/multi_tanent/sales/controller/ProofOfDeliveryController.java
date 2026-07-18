package com.example.multi_tanent.sales.controller;

import com.example.multi_tanent.sales.dto.PodRequest;
import com.example.multi_tanent.sales.dto.PodResponse;
import com.example.multi_tanent.sales.service.ProofOfDeliveryService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/sales/delivery-orders/{doId}/pod")
@RequiredArgsConstructor
public class ProofOfDeliveryController {

    private final ProofOfDeliveryService podService;
    private final ObjectMapper objectMapper;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PodResponse> submitPod(
            @PathVariable Long doId,
            @RequestPart("data") String data,
            @RequestPart(value = "signature", required = false) MultipartFile signature,
            @RequestPart(value = "photo", required = false) MultipartFile photo) throws JsonProcessingException {
        
        PodRequest request = objectMapper.readValue(data, PodRequest.class);
        return ResponseEntity.ok(podService.submitPod(doId, request, signature, photo));
    }

    @GetMapping
    public ResponseEntity<PodResponse> getPod(@PathVariable Long doId) {
        return ResponseEntity.ok(podService.getPod(doId));
    }

    @GetMapping("/signature")
    public ResponseEntity<Resource> getSignature(@PathVariable Long doId) {
        PodResponse pod = podService.getPod(doId);
        Resource resource = podService.getPodSignatureImage(pod.getId());
        return serveImage(resource);
    }

    @GetMapping("/photo")
    public ResponseEntity<Resource> getPhoto(@PathVariable Long doId) {
        PodResponse pod = podService.getPod(doId);
        Resource resource = podService.getPodPhoto(pod.getId());
        return serveImage(resource);
    }

    private ResponseEntity<Resource> serveImage(Resource resource) {
        String contentType = "image/jpeg";
        try {
            contentType = java.nio.file.Files.probeContentType(java.nio.file.Paths.get(resource.getURI()));
        } catch (Exception e) {
            // fallback
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
