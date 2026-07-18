package com.example.multi_tanent.tenant.payroll.service;

import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.repository.UserRepository;
import com.example.multi_tanent.spersusers.enitity.User;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import com.example.multi_tanent.tenant.payroll.dto.ExpenseRequest;
import com.example.multi_tanent.tenant.payroll.dto.ExpensePayoutRequest;
import com.example.multi_tanent.tenant.payroll.entity.ExpenseFile;
import com.example.multi_tanent.tenant.payroll.entity.Expense;
import com.example.multi_tanent.tenant.payroll.enums.ExpenseStatus;
import com.example.multi_tanent.tenant.payroll.repository.ExpenseFileRepository;
import com.example.multi_tanent.tenant.payroll.repository.ExpenseRepository;
import com.example.multi_tanent.tenant.service.FileStorageService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(transactionManager = "tenantTx")
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final EmployeeRepository employeeRepository;
    private final ExpenseFileRepository expenseFileRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public ExpenseService(ExpenseRepository expenseRepository, EmployeeRepository employeeRepository,
            ExpenseFileRepository expenseFileRepository, UserRepository userRepository,
            FileStorageService fileStorageService) {
        this.expenseRepository = expenseRepository;
        this.employeeRepository = employeeRepository;
        this.expenseFileRepository = expenseFileRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    public Expense submitExpense(ExpenseRequest request, MultipartFile[] files) {
        Employee employee = employeeRepository.findByEmployeeCode(request.getEmployeeCode())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Employee not found with code: " + request.getEmployeeCode()));

        Expense expense = new Expense();
        expense.setEmployee(employee);
        expense.setExpenseDate(request.getExpenseDate());
        expense.setCategory(request.getCategory());
        expense.setAmount(request.getAmount());
        expense.setDescription(request.getDescription());
        expense.setBillNumber(request.getBillNumber());
        expense.setMerchantName(request.getMerchentName());
        expense.setStatus(ExpenseStatus.SUBMITTED);
        expense.setSubmittedAt(LocalDateTime.now());

        if (files != null) {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String filePath = fileStorageService.storeFile(file, "expense-attachments");
                    expense.addAttachment(filePath, file.getOriginalFilename());
                }
            }
        }

        return expenseRepository.save(expense);
    }

    public List<Expense> getAllExpenses() {
        List<Expense> expenses = expenseRepository.findAll();
        expenses.forEach(this::initializeExpenseDetails);
        return expenses;
    }

    public Optional<Expense> getExpenseById(Long id) {
        Optional<Expense> expenseOpt = expenseRepository.findById(id);
        expenseOpt.ifPresent(this::initializeExpenseDetails);
        return expenseOpt;
    }

    public ExpenseFile getExpenseFileById(Long fileId) {
        return expenseFileRepository.findById(fileId)
                .orElseThrow(() -> new EntityNotFoundException("Expense file not found with id: " + fileId));
    }

    public List<Expense> getExpensesByEmployeeCode(String employeeCode) {
        List<Expense> expenses = expenseRepository.findByEmployeeEmployeeCode(employeeCode);
        expenses.forEach(this::initializeExpenseDetails);
        return expenses;
    }

    // public List<Expense> getExpensesByEmployeeCode(String employeeCode) {
    // List<Expense> expenses =
    // expenseRepository.findByEmployeeEmployeeCode(employeeCode);
    // expenses.forEach(this::initializeExpenseDetails);
    // return expenses;
    // }

    public Expense approveExpense(Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new EntityNotFoundException("Expense not found with id: " + expenseId));
        initializeExpenseDetails(expense);
        expense.setStatus(ExpenseStatus.APPROVED);
        expense.setProcessedByUserId(getCurrentUserId());
        expense.setProcessedAt(LocalDateTime.now());
        return expenseRepository.save(expense);
    }

    public Expense rejectExpense(Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new EntityNotFoundException("Expense not found with id: " + expenseId));
        initializeExpenseDetails(expense);
        expense.setStatus(ExpenseStatus.REJECTED);
        expense.setProcessedByUserId(getCurrentUserId());
        expense.setProcessedAt(LocalDateTime.now());
        return expenseRepository.save(expense);
    }

    public Expense payoutExpense(Long expenseId, ExpensePayoutRequest payoutRequest) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new EntityNotFoundException("Expense not found with id: " + expenseId));

        if (expense.getStatus() != ExpenseStatus.APPROVED) {
            throw new IllegalStateException(
                    "Only approved expenses can be paid out. Current status: " + expense.getStatus());
        }

        expense.setStatus(ExpenseStatus.REIMBURSED);
        expense.setPaymentMethod(payoutRequest.getPaymentMethod());
        expense.setPaidOutDate(payoutRequest.getPaidOutDate());
        expense.setPaymentDetails(payoutRequest.getPaymentDetails());

        // Record who processed the payout
        expense.setProcessedByUserId(getCurrentUserId());
        expense.setProcessedAt(LocalDateTime.now());

        return expenseRepository.save(expense);
    }

    public void deleteExpense(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Expense not found with id: " + id));

        // Delete all associated files from storage first.
        for (ExpenseFile attachment : expense.getAttachments()) {
            fileStorageService.deleteFile(attachment.getFilePath());
        }
        expenseRepository.delete(expense);
    }

    private void initializeExpenseDetails(Expense expense) {
        if (expense.getEmployee() != null) {
            // Accessing a getter will trigger the lazy loading while the session is active.
            expense.getEmployee().getEmployeeCode();
        }
        if (expense.getAttachments() != null) {
            // Initialize the attachments collection
            expense.getAttachments().size();
        }
    }

    private Long getCurrentUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;

        if (principal instanceof User) {
            username = ((User) principal).getEmail();
        } else if (principal instanceof String) {
            username = (String) principal;
        } else {
            throw new IllegalStateException("Principal is of an unknown type: " + principal.getClass());
        }

        return userRepository.findByEmail(username).map(User::getId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with username: " + username));
    }
}