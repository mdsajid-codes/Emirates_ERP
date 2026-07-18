package com.example.multi_tanent.tenant.payroll.controller;

import com.example.multi_tanent.tenant.payroll.dto.StatutoryRuleRequest;
import com.example.multi_tanent.tenant.payroll.dto.StatutoryRuleResponse;
import com.example.multi_tanent.tenant.payroll.service.StatutoryRuleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/statutory-rules")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
public class StatutoryRuleController {

    private final StatutoryRuleService statutoryRuleService;

    public StatutoryRuleController(StatutoryRuleService statutoryRuleService) {
        this.statutoryRuleService = statutoryRuleService;
    }

    @GetMapping
    public ResponseEntity<List<StatutoryRuleResponse>> getAllStatutoryRules() {
        List<StatutoryRuleResponse> rules = statutoryRuleService.getAllStatutoryRules().stream()
                .map(StatutoryRuleResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(rules);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StatutoryRuleResponse> getStatutoryRuleById(@PathVariable Long id) {
        return statutoryRuleService.getStatutoryRuleById(id)
                .map(rule -> ResponseEntity.ok(StatutoryRuleResponse.fromEntity(rule)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<StatutoryRuleResponse> createStatutoryRule(@RequestBody StatutoryRuleRequest request) {
        var createdRule = statutoryRuleService.createStatutoryRule(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(createdRule.getId()).toUri();
        return ResponseEntity.created(location).body(StatutoryRuleResponse.fromEntity(createdRule));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StatutoryRuleResponse> updateStatutoryRule(@PathVariable Long id, @RequestBody StatutoryRuleRequest request) {
        var updatedRule = statutoryRuleService.updateStatutoryRule(id, request);
        return ResponseEntity.ok(StatutoryRuleResponse.fromEntity(updatedRule));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStatutoryRule(@PathVariable Long id) {
        statutoryRuleService.deleteStatutoryRule(id);
        return ResponseEntity.noContent().build();
    }
}
