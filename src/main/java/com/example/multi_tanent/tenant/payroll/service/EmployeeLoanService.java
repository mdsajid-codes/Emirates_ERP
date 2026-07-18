package com.example.multi_tanent.tenant.payroll.service;

import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import com.example.multi_tanent.tenant.payroll.dto.EmployeeLoanRequest;
import com.example.multi_tanent.tenant.payroll.entity.EmployeeLoan;
import com.example.multi_tanent.tenant.payroll.entity.LoanProduct;
import com.example.multi_tanent.tenant.payroll.enums.LoanStatus;
import com.example.multi_tanent.tenant.payroll.repository.EmployeeLoanRepository;
import com.example.multi_tanent.tenant.payroll.repository.LoanProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(transactionManager = "tenantTx")
public class EmployeeLoanService {

    private final EmployeeLoanRepository employeeLoanRepository;
    private final EmployeeRepository employeeRepository;
    private final LoanProductRepository loanProductRepository;

    public EmployeeLoanService(EmployeeLoanRepository employeeLoanRepository, EmployeeRepository employeeRepository, LoanProductRepository loanProductRepository) {
        this.employeeLoanRepository = employeeLoanRepository;
        this.employeeRepository = employeeRepository;
        this.loanProductRepository = loanProductRepository;
    }

    public List<EmployeeLoan> getAllLoans() {
        List<EmployeeLoan> loans = employeeLoanRepository.findAll();
        // Initialize lazy associations to prevent LazyInitializationException in the controller
        loans.forEach(this::initializeLoanDetails);
        return loans;
    }

    public Optional<EmployeeLoan> getLoanById(Long id) {
        Optional<EmployeeLoan> loanOpt = employeeLoanRepository.findById(id);
        // Initialize lazy associations
        loanOpt.ifPresent(this::initializeLoanDetails);
        return loanOpt;
    }

    public List<EmployeeLoan> getLoansByEmployeeCode(String employeeCode) {
        List<EmployeeLoan> loans = employeeRepository.findByEmployeeCode(employeeCode)
                .map(employee -> employeeLoanRepository.findByEmployeeId(employee.getId()))
                .orElse(List.of());
        // Initialize lazy associations
        loans.forEach(this::initializeLoanDetails);
        return loans;
    }

    public EmployeeLoan requestLoan(EmployeeLoanRequest request) {
        Employee employee = employeeRepository.findByEmployeeCode(request.getEmployeeCode())
                .orElseThrow(() -> new RuntimeException("Employee not found with code: " + request.getEmployeeCode()));

        LoanProduct loanProduct = loanProductRepository.findById(request.getLoanProductId())
                .orElseThrow(() -> new RuntimeException("Loan Product not found with id: " + request.getLoanProductId()));

        if (request.getRequestedAmount().compareTo(loanProduct.getMaxLoanAmount()) > 0) {
            throw new IllegalArgumentException("Requested loan amount exceeds the maximum allowed amount for this product.");
        }
        if (request.getInstallments() > loanProduct.getMaxInstallments()) {
            throw new IllegalArgumentException("Requested installments exceed the maximum allowed for this product.");
        }

        List<EmployeeLoan> activeLoans = employeeLoanRepository.findByEmployeeEmployeeCodeAndStatus(request.getEmployeeCode(), LoanStatus.APPROVED);
        if (!activeLoans.isEmpty()) {
            throw new IllegalStateException("Employee already has an active loan. Cannot request a new one.");
        }

        EmployeeLoan loan = new EmployeeLoan();
        loan.setEmployee(employee);
        loan.setLoanProduct(loanProduct);
        loan.setLoanAmount(request.getRequestedAmount());
        loan.setTotalInstallments(request.getInstallments());
        loan.setRemainingInstallments(request.getInstallments());
        
        BigDecimal emi = request.getRequestedAmount().divide(BigDecimal.valueOf(request.getInstallments()), 2, RoundingMode.HALF_UP);
        loan.setEmiAmount(emi);

        loan.setStatus(LoanStatus.SUBMITTED);
        loan.setRequestedAt(LocalDateTime.now());

        return employeeLoanRepository.save(loan);
    }

    public EmployeeLoan approveLoan(Long loanId) {
        EmployeeLoan loan = employeeLoanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("EmployeeLoan not found with id: " + loanId));
        // Initialize lazy associations before returning to prevent LazyInitializationException
        initializeLoanDetails(loan);
        loan.setStatus(LoanStatus.APPROVED);
        loan.setProcessedAt(LocalDateTime.now());
        loan.setStartDate(LocalDate.now().withDayOfMonth(1).plusMonths(1)); // Loan starts from the 1st of next month
        return employeeLoanRepository.save(loan);
    }

    public EmployeeLoan rejectLoan(Long loanId) {
        EmployeeLoan loan = employeeLoanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("EmployeeLoan not found with id: " + loanId));
        // Initialize lazy associations before returning to prevent LazyInitializationException
        initializeLoanDetails(loan);
        loan.setStatus(LoanStatus.REJECTED);
        loan.setProcessedAt(LocalDateTime.now());
        return employeeLoanRepository.save(loan);
    }

    public void deleteLoan(Long id) {
        employeeLoanRepository.deleteById(id);
    }

    private void initializeLoanDetails(EmployeeLoan loan) {
        // Accessing these getters will trigger the lazy loading while the session is active.
        loan.getEmployee().getEmployeeCode(); // Initialize Employee proxy
        if (loan.getLoanProduct() != null) {
            loan.getLoanProduct().getProductName(); // Initialize LoanProduct proxy
        }
    }
}