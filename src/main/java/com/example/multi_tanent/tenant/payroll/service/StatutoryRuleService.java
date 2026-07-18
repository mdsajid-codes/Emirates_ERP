package com.example.multi_tanent.tenant.payroll.service;

import com.example.multi_tanent.tenant.payroll.dto.StatutoryRuleRequest;
import com.example.multi_tanent.tenant.payroll.entity.StatutoryRule;
import com.example.multi_tanent.tenant.payroll.repository.StatutoryRuleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
    
@Service
@Transactional(transactionManager = "tenantTx")
public class StatutoryRuleService {

    private final StatutoryRuleRepository statutoryRuleRepository;

    public StatutoryRuleService(StatutoryRuleRepository statutoryRuleRepository) {
        this.statutoryRuleRepository = statutoryRuleRepository;
    }

    public List<StatutoryRule> getAllStatutoryRules() {
        return statutoryRuleRepository.findAll();
    }

    public Optional<StatutoryRule> getStatutoryRuleById(Long id) {
        return statutoryRuleRepository.findById(id);
    }

    public StatutoryRule createStatutoryRule(StatutoryRuleRequest request) {
        StatutoryRule rule = new StatutoryRule();
        mapRequestToEntity(request, rule);
        return statutoryRuleRepository.save(rule);
    }

    public StatutoryRule updateStatutoryRule(Long id, StatutoryRuleRequest request) {
        StatutoryRule rule = statutoryRuleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("StatutoryRule not found with id: " + id));
        mapRequestToEntity(request, rule);
        return statutoryRuleRepository.save(rule);
    }

    public void deleteStatutoryRule(Long id) {
        statutoryRuleRepository.deleteById(id);
    }

    private void mapRequestToEntity(StatutoryRuleRequest req, StatutoryRule entity) {
        entity.setRuleName(req.getRuleName());
        entity.setDescription(req.getDescription());
        entity.setEmployeeContributionRate(req.getEmployeeContributionRate());
        entity.setEmployerContributionRate(req.getEmployerContributionRate());
        entity.setContributionCap(req.getContributionCap());
        entity.setTaxSlabsJson(req.getTaxSlabsJson());
        entity.setIsActive(req.getIsActive());
    }
}