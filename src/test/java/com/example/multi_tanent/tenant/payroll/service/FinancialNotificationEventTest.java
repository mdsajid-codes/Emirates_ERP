package com.example.multi_tanent.tenant.payroll.service;

import com.example.multi_tanent.master.enums.Role;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.User;
import com.example.multi_tanent.spersusers.repository.UserRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import com.example.multi_tanent.tenant.notification.enums.NotificationPriority;
import com.example.multi_tanent.tenant.notification.enums.NotificationType;
import com.example.multi_tanent.tenant.notification.service.NotificationService;
import com.example.multi_tanent.tenant.payroll.dto.EmployeeLoanRequest;
import com.example.multi_tanent.tenant.payroll.dto.ExpensePayoutRequest;
import com.example.multi_tanent.tenant.payroll.dto.ExpenseRequest;
import com.example.multi_tanent.tenant.payroll.entity.EmployeeLoan;
import com.example.multi_tanent.tenant.payroll.entity.Expense;
import com.example.multi_tanent.tenant.payroll.entity.LoanProduct;
import com.example.multi_tanent.tenant.payroll.enums.ExpenseStatus;
import com.example.multi_tanent.tenant.payroll.enums.LoanStatus;
import com.example.multi_tanent.tenant.payroll.repository.EmployeeLoanRepository;
import com.example.multi_tanent.tenant.payroll.repository.ExpenseFileRepository;
import com.example.multi_tanent.tenant.payroll.repository.ExpenseRepository;
import com.example.multi_tanent.tenant.payroll.repository.LoanProductRepository;
import com.example.multi_tanent.tenant.service.FileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FinancialNotificationEventTest {

    // Loan Mocks
    @Mock private EmployeeLoanRepository employeeLoanRepository;
    @Mock private EmployeeRepository employeeRepository;
    @Mock private LoanProductRepository loanProductRepository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;

    // Expense Mocks
    @Mock private ExpenseRepository expenseRepository;
    @Mock private ExpenseFileRepository expenseFileRepository;
    @Mock private FileStorageService fileStorageService;
    @Mock private Authentication authentication;
    @Mock private SecurityContext securityContext;

    @InjectMocks private EmployeeLoanService employeeLoanService;
    @InjectMocks private ExpenseService expenseService;

    private User employeeUser;
    private User hrUser;
    private Employee employee;

    @BeforeEach
    void setUp() {
        employeeUser = new User();
        employeeUser.setId(10L);
        employeeUser.setEmail("emp@emirateserp.ae");

        hrUser = new User();
        hrUser.setId(20L);
        hrUser.setEmail("hr@emirateserp.ae");

        employee = new Employee();
        employee.setId(1L);
        employee.setEmployeeCode("EMP100");
        employee.setFirstName("Ahmed");
        employee.setUser(employeeUser);

        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    @DisplayName("Phase 3: Requesting a Loan sends LOAN_REQUEST_SUBMITTED notification to HR")
    void requestLoan_SendsNotificationToHR() {
        LoanProduct product = new LoanProduct();
        product.setId(5L);
        product.setMaxLoanAmount(BigDecimal.valueOf(50000));
        product.setMaxInstallments(24);

        when(employeeRepository.findByEmployeeCode("EMP100")).thenReturn(Optional.of(employee));
        when(loanProductRepository.findById(5L)).thenReturn(Optional.of(product));
        when(employeeLoanRepository.findByEmployeeEmployeeCodeAndStatus("EMP100", LoanStatus.APPROVED))
            .thenReturn(List.of());
        when(userRepository.findActiveUsersByRole(Role.HR)).thenReturn(List.of(hrUser));

        EmployeeLoan savedLoan = new EmployeeLoan();
        savedLoan.setId(1L);
        savedLoan.setEmployee(employee);
        savedLoan.setLoanAmount(BigDecimal.valueOf(10000));
        savedLoan.setTotalInstallments(12);

        when(employeeLoanRepository.save(any(EmployeeLoan.class))).thenReturn(savedLoan);

        EmployeeLoanRequest req = new EmployeeLoanRequest();
        req.setEmployeeCode("EMP100");
        req.setLoanProductId(5L);
        req.setRequestedAmount(BigDecimal.valueOf(10000));
        req.setInstallments(12);

        employeeLoanService.requestLoan(req);

        verify(notificationService, times(1)).send(
            eq(20L),
            eq(NotificationType.LOAN_REQUEST_SUBMITTED),
            contains("New Loan Request"),
            contains("Ahmed has requested a loan of AED 10000"),
            eq("/payroll-management"),
            eq(1L),
            eq("EMPLOYEE_LOAN"),
            eq(NotificationPriority.MEDIUM)
        );
    }

    @Test
    @DisplayName("Phase 3: Approving a Loan sends LOAN_APPROVED notification to Employee")
    void approveLoan_SendsNotificationToEmployee() {
        EmployeeLoan loan = new EmployeeLoan();
        loan.setId(1L);
        loan.setEmployee(employee);
        loan.setLoanAmount(BigDecimal.valueOf(10000));
        loan.setEmiAmount(BigDecimal.valueOf(833.33));

        when(employeeLoanRepository.findById(1L)).thenReturn(Optional.of(loan));
        when(employeeLoanRepository.save(any(EmployeeLoan.class))).thenReturn(loan);

        employeeLoanService.approveLoan(1L);

        verify(notificationService, times(1)).send(
            eq(10L),
            eq(NotificationType.LOAN_APPROVED),
            contains("Loan Application Approved"),
            contains("AED 10000 has been approved"),
            eq("/payroll-management"),
            eq(1L),
            eq("EMPLOYEE_LOAN"),
            eq(NotificationPriority.HIGH)
        );
    }

    @Test
    @DisplayName("Phase 3: Reimbursing an Expense sends EXPENSE_REIMBURSED notification to Employee")
    void payoutExpense_SendsNotificationToEmployee() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(hrUser);
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(hrUser));

        Expense expense = new Expense();
        expense.setId(99L);
        expense.setEmployee(employee);
        expense.setAmount(BigDecimal.valueOf(450));
        expense.setStatus(ExpenseStatus.APPROVED);

        when(expenseRepository.findById(99L)).thenReturn(Optional.of(expense));
        when(expenseRepository.save(any(Expense.class))).thenReturn(expense);

        ExpensePayoutRequest payoutReq = new ExpensePayoutRequest();
        payoutReq.setPaymentMethod(com.example.multi_tanent.tenant.payroll.enums.PaymentMethod.BANK_TRANSFER);
        payoutReq.setPaidOutDate(LocalDate.now());

        expenseService.payoutExpense(99L, payoutReq);

        verify(notificationService, times(1)).send(
            eq(10L),
            eq(NotificationType.EXPENSE_REIMBURSED),
            contains("Expense Claim Reimbursed"),
            contains("claim of AED 450 has been paid out"),
            eq("/payroll-management"),
            eq(99L),
            eq("EXPENSE"),
            eq(NotificationPriority.HIGH)
        );
    }
}
