package com.example.multi_tanent.tenant.payroll.service;

import com.example.multi_tanent.tenant.payroll.entity.PayslipComponent;
import com.example.multi_tanent.tenant.payroll.repository.PayslipComponentRepository;
import com.example.multi_tanent.tenant.payroll.repository.PayslipRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(transactionManager = "tenantTx", readOnly = true)
public class PayslipComponentService {

    private final PayslipComponentRepository payslipComponentRepository;
    private final PayslipRepository payslipRepository;

    public PayslipComponentService(PayslipComponentRepository payslipComponentRepository, PayslipRepository payslipRepository) {
        this.payslipComponentRepository = payslipComponentRepository;
        this.payslipRepository = payslipRepository;
    }

    public List<PayslipComponent> getComponentsByPayslipId(Long payslipId) {
        payslipRepository.findById(payslipId)
                .orElseThrow(() -> new RuntimeException("Payslip not found with id: " + payslipId));
        return payslipComponentRepository.findByPayslipId(payslipId);
    }
}