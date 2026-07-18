package com.example.multi_tanent.production.controller;

import com.example.multi_tanent.production.dto.ProToolsDto;
import com.example.multi_tanent.production.dto.ProToolsRequest;
import com.example.multi_tanent.production.services.ProToolsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/production/tools")
@PreAuthorize("isAuthenticated()")
public class ProToolsController {

    private final ProToolsService proToolsService;

    public ProToolsController(ProToolsService proToolsService) {
        this.proToolsService = proToolsService;
    }

    @PostMapping
    public ResponseEntity<ProToolsDto> createTool(@Valid @RequestBody ProToolsRequest request) {
        ProToolsDto createdTool = proToolsService.createTool(request);
        return new ResponseEntity<>(createdTool, HttpStatus.CREATED);
    }

    @GetMapping
    public List<ProToolsDto> getAllTools() {
        return proToolsService.getAllTools();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProToolsDto> getToolById(@PathVariable Long id) {
        ProToolsDto toolDto = proToolsService.getToolById(id);
        return ResponseEntity.ok(toolDto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProToolsDto> updateTool(@PathVariable Long id, @Valid @RequestBody ProToolsRequest request) {
        ProToolsDto updatedTool = proToolsService.updateTool(id, request);
        return ResponseEntity.ok(updatedTool);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTool(@PathVariable Long id) {
        proToolsService.deleteTool(id);
        return ResponseEntity.noContent().build();
    }

}
