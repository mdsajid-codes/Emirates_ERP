# 🧪 Exhaustive Manual Testing Guide: All 40 Notification Types
## EmiratesERP HRMS Notification Testing Manual

> **File Reference:** [`NotificationType.java`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/src/main/java/com/example/multi_tanent/tenant/notification/enums/NotificationType.java)  
> **Goal:** Step-by-step instructions to manually trigger and test every single one of the 40 `NotificationType` enum values in your EmiratesERP application.

---

## 🎯 Test Environment Setup

1. **Backend Server:** Running on `http://localhost:8080`
2. **Frontend App:** Running on `http://localhost:5173` (or `3000`)
3. **Roles Needed:**
   - **Role 1 (Employee):** Account e.g., `emp001@emirateserp.ae`
   - **Role 2 (HR Manager / Admin):** Account e.g., `hr@emirateserp.ae`

---

## 📂 Category 1: Leave Management Notifications (11 Types)

### 1.1 `LEAVE_REQUEST_SUBMITTED`
* **Trigger:** Employee submits a new leave request.
* **Frontend Action:** Login as **Employee** -> Go to **Leave Management** (`/leave`) -> Click **"Apply Leave"** -> Select leave type (e.g., Annual Leave), select dates -> Submit.
* **Recipient:** Assigned Approver / HR Manager.
* **Expected Result:** HR receives real-time toast alert & bell badge increment:  
  > 🔔 *New Leave Request Pending Approval: [Employee Name] has submitted an Annual Leave request from [Start Date] to [End Date].*

### 1.2 `LEAVE_REQUEST_APPROVED`
* **Trigger:** Manager approves a pending leave request.
* **Frontend Action:** Login as **HR/Manager** -> Go to **Leave Approvals** -> Click **"Approve"** on a pending request.
* **Recipient:** Employee.
* **Expected Result:** Employee receives real-time alert:  
  > 🔔 *Leave Request Approved: Your Annual Leave request from [Start Date] to [End Date] has been approved.*

### 1.3 `LEAVE_REQUEST_REJECTED`
* **Trigger:** Manager rejects a pending leave request.
* **Frontend Action:** Login as **HR/Manager** -> Go to **Leave Approvals** -> Click **"Reject"** -> Provide a comment.
* **Recipient:** Employee.
* **Expected Result:** Employee receives alert with reason:  
  > 🔔 *Leave Request Rejected: Your Annual Leave request from [Start Date] to [End Date] has been rejected. Reason: [Comment].*

### 1.4 `LEAVE_REQUEST_CANCELLED`
* **Trigger:** Employee cancels their own submitted leave request.
* **Frontend Action:** Login as **Employee** -> Go to **My Leave Requests** -> Click **"Cancel"** on a submitted request.
* **Recipient:** Approver / HR Manager.
* **Expected Result:** Approver receives alert:  
  > 🔔 *Leave Request Cancelled: [Employee Name] has cancelled their Annual Leave request.*

### 1.5 `LEAVE_ENCASHMENT_SUBMITTED`
* **Trigger:** Employee requests encashment of unused leave balance.
* **Frontend Action:** Login as **Employee** -> Go to **Leave Management** -> Click **"Leave Encashment"** -> Enter days -> Submit.
* **Recipient:** HR Manager.
* **Expected Result:** HR receives notification:  
  > 🔔 *Leave Encashment Requested: [Employee Name] requested encashment for 5 days of Annual Leave.*

### 1.6 `LEAVE_ENCASHMENT_APPROVED`
* **Trigger:** HR approves the leave encashment request.
* **Frontend Action:** Login as **HR** -> Go to **Encashment Requests** -> Click **"Approve"**.
* **Recipient:** Employee.
* **Expected Result:** Employee receives approval alert:  
  > 🔔 *Leave Encashment Approved: Your encashment request for 5 days of Annual Leave has been approved.*

### 1.7 `LEAVE_ENCASHMENT_REJECTED`
* **Trigger:** HR rejects the leave encashment request.
* **Frontend Action:** Login as **HR** -> Go to **Encashment Requests** -> Click **"Reject"**.
* **Recipient:** Employee.
* **Expected Result:** Employee receives rejection alert:  
  > 🔔 *Leave Encashment Rejected: Your encashment request for 5 days has been rejected.*

### 1.8 `LEAVE_ENCASHMENT_PAID`
* **Trigger:** Payroll/Finance processes the encashment payout.
* **Frontend Action:** Login as **Finance** -> Go to **Encashment Payouts** -> Process payment.
* **Recipient:** Employee.
* **Expected Result:** Employee receives payout confirmation:  
  > 🔔 *Leave Encashment Paid: AED X,XXX has been credited for your leave encashment.*

### 1.9 `LEAVE_BALANCE_LOW`
* **Trigger:** Leave balance drops below policy minimum threshold (e.g. < 2 days remaining).
* **Trigger Method:** System check upon leave request approval or manual Balance Service check.
* **Recipient:** Employee.
* **Expected Result:** Employee receives warning:  
  > 🔔 *Low Leave Balance: You have less than 2 days of Annual Leave remaining for this cycle.*

### 1.10 `LEAVE_CARRY_FORWARD_EXPIRY`
* **Trigger:** Carried-forward leaves are approaching their expiry date (e.g. March 31st).
* **Trigger Method:** Daily Cron Scheduler (`HrmsNotificationScheduler`).
* **Recipient:** Employee.
* **Expected Result:** Employee receives alert:  
  > 🔔 *Carried Forward Leaves Expiring Soon: 3 days of carried-forward leave will expire on March 31.*

### 1.11 `LEAVE_YEAR_END_PROCESSED`
* **Trigger:** System completes automated annual leave allocation/reset for the new year.
* **Trigger Method:** Year-End Processing batch job.
* **Recipient:** All Active Employees.
* **Expected Result:** Employees receive notification:  
  > 🔔 *Annual Leave Quota Updated: Your leave balance for the year 2026 has been allocated.*

---

## ⏱️ Category 2: Attendance & Shift Notifications (7 Types)

### 2.1 `ATTENDANCE_REMINDER`
* **Trigger:** Daily check for employees who have not marked check-out by 17:30 Dubai Time.
* **Trigger Method:** Cron Scheduler (`0 30 17 * * MON-FRI`).
* **Manual Test:** Run `HrmsNotificationScheduler.attendanceReminder()`.
* **Recipient:** Employee.
* **Expected Result:**  
  > 🔔 *Attendance Reminder: You haven't marked your check-out for today. Please record attendance.*

### 2.2 `MISSING_ATTENDANCE_SUBMITTED`
* **Trigger:** Employee submits a missing attendance / regularization request.
* **Frontend Action:** Login as **Employee** -> Go to **Attendance** (`/attendance`) -> Click **"Request Regularization"** -> Fill date & missing check-in/out -> Submit.
* **Recipient:** HR / Line Manager.
* **Expected Result:** HR receives alert:  
  > 🔔 *Missing Attendance Request: [Employee Name] submitted a missing attendance request for [Date].*

### 2.3 `MISSING_ATTENDANCE_APPROVED`
* **Trigger:** HR/Manager approves the regularization request.
* **Frontend Action:** Login as **HR** -> Go to **Attendance Requests** -> Click **"Approve"**.
* **Recipient:** Employee.
* **Expected Result:** Employee receives alert:  
  > 🔔 *Attendance Regularization Approved: Your missing attendance request for [Date] has been approved.*

### 2.4 `MISSING_ATTENDANCE_REJECTED`
* **Trigger:** HR/Manager rejects the regularization request.
* **Frontend Action:** Login as **HR** -> Go to **Attendance Requests** -> Click **"Reject"**.
* **Recipient:** Employee.
* **Expected Result:** Employee receives alert:  
  > 🔔 *Attendance Regularization Rejected: Your missing attendance request for [Date] was rejected.*

### 2.5 `SHIFT_ASSIGNED`
* **Trigger:** HR assigns a new shift roster to an employee.
* **Frontend Action:** Login as **HR** -> Go to **Shift Roster** -> Assign employee to a shift for a date.
* **Recipient:** Employee.
* **Expected Result:** Employee receives alert:  
  > 🔔 *New Shift Assigned: You have been assigned to shift 'Morning Shift' for date [Date].*

### 2.6 `SHIFT_CHANGED`
* **Trigger:** HR modifies or swaps an existing shift assignment for an employee.
* **Frontend Action:** Login as **HR** -> Go to **Shift Roster** -> Edit assigned shift.
* **Recipient:** Employee.
* **Expected Result:** Employee receives alert:  
  > 🔔 *Shift Schedule Updated: Your shift for [Date] has been changed to 'Evening Shift'.*

### 2.7 `LATE_ARRIVAL_FLAGGED`
* **Trigger:** Daily check at 18:00 Dubai time flagging check-ins recorded after the grace period.
* **Trigger Method:** Cron Scheduler (`0 0 18 * * MON-FRI`).
* **Recipient:** Employee & Line Manager.
* **Expected Result:** Employee receives alert:  
  > 🔔 *Late Arrival Flagged: Your check-in at 09:42 on [Date] was flagged as late.*

---

## 💳 Category 3: Payroll & Expense Notifications (7 Types)

### 3.1 `PAYSLIP_GENERATED`
* **Trigger:** Payroll Run status is updated to `PAID`.
* **Frontend Action:** Login as **Payroll Admin** -> Go to **Payroll Management** (`/payroll-management`) -> Select Payroll Run -> Click **"Mark as Paid"**.
* **Recipient:** All employees in the payroll run.
* **Expected Result:** Employees receive alert:  
  > 🔔 *Your Salary Slip Is Ready: Your payslip for August 2026 is ready. Net salary: AED 12,500.00.*

### 3.2 `PAYROLL_RUN_STARTED`
* **Trigger:** HR Admin initiates a new payroll processing run (`createPayrollRun`).
* **Frontend Action:** Login as **Payroll Admin** -> Click **"Create Payroll Run"** for Year/Month.
* **Recipient:** Finance & HR Administrators.
* **Expected Result:** Finance/HR team receives alert:  
  > 🔔 *Payroll Run Started: Payroll run for August 2026 has been initiated.*

### 3.3 `PAYROLL_RUN_COMPLETED`
* **Trigger:** Payroll calculations and verification are completed.
* **Frontend Action:** Login as **Payroll Admin** -> Click **"Complete Calculation"**.
* **Recipient:** HR Manager / Finance.
* **Expected Result:**  
  > 🔔 *Payroll Run Completed: Payroll calculations for August 2026 are completed and ready for review.*

### 3.4 `EXPENSE_SUBMITTED`
* **Trigger:** Employee submits a business expense claim.
* **Frontend Action:** Login as **Employee** -> Go to **Expense Claims** -> Fill category, amount, attach receipt -> Submit.
* **Recipient:** HR / Finance Admin.
* **Expected Result:** Admin receives alert:  
  > 🔔 *New Expense Claim: [Employee Name] submitted an expense claim of AED 450.00 for Travel.*

### 3.5 `EXPENSE_APPROVED`
* **Trigger:** Approver approves the expense claim.
* **Frontend Action:** Login as **Admin** -> Go to **Expense Approvals** -> Click **"Approve"**.
* **Recipient:** Employee.
* **Expected Result:** Employee receives alert:  
  > 🔔 *Expense Claim Approved: Your expense claim of AED 450.00 (Travel) has been approved.*

### 3.6 `EXPENSE_REJECTED`
* **Trigger:** Approver rejects the expense claim.
* **Frontend Action:** Login as **Admin** -> Go to **Expense Approvals** -> Click **"Reject"**.
* **Recipient:** Employee.
* **Expected Result:** Employee receives alert:  
  > 🔔 *Expense Claim Rejected: Your expense claim of AED 450.00 (Travel) was rejected.*

### 3.7 `EXPENSE_REIMBURSED`
* **Trigger:** Finance executes reimbursement payout (`payoutExpense`).
* **Frontend Action:** Login as **Finance** -> Go to **Expense Payouts** -> Process payment.
* **Recipient:** Employee.
* **Expected Result:** Employee receives alert:  
  > 🔔 *Expense Claim Reimbursed: Your expense claim of AED 450.00 has been paid out via BANK_TRANSFER.*

### 3.8 `BONUS_ADDED`
* **Trigger:** HR/Finance adds an ad-hoc performance bonus or incentive to employee payslip.
* **Frontend Action:** Go to **Payroll Components** -> Add Bonus -> Save.
* **Recipient:** Employee.
* **Expected Result:** Employee receives alert:  
  > 🔔 *Bonus Allocated: A performance bonus of AED 2,000 has been added to your upcoming payroll.*

### 3.9 `WPS_COMPLIANCE_REPORT_READY`
* **Trigger:** System generates the UAE Wage Protection System (WPS) SIF file.
* **Frontend Action:** Click **"Generate WPS File"** in Payroll Management.
* **Recipient:** Payroll Manager / Finance Admin.
* **Expected Result:** Admin receives alert:  
  > 🔔 *WPS File Ready: The SIF payroll file for August 2026 has been generated and validated.*

---

## 🏦 Category 4: Loan Management Notifications (5 Types)

### 4.1 `LOAN_REQUEST_SUBMITTED`
* **Trigger:** Employee applies for an advance/loan.
* **Frontend Action:** Login as **Employee** -> Go to **Loans** -> Request Loan (e.g. AED 10,000 in 12 EMIs) -> Submit.
* **Recipient:** HR Manager.
* **Expected Result:** HR receives alert:  
  > 🔔 *New Loan Request: [Employee Name] has requested a loan of AED 10,000 (12 installments).*

### 4.2 `LOAN_APPROVED`
* **Trigger:** HR approves the loan request.
* **Frontend Action:** Login as **HR** -> Go to **Loan Approvals** -> Click **"Approve"**.
* **Recipient:** Employee.
* **Expected Result:** Employee receives alert:  
  > 🔔 *Loan Application Approved: Your loan request of AED 10,000 has been approved. Monthly EMI: AED 833.33.*

### 4.3 `LOAN_REJECTED`
* **Trigger:** HR rejects the loan request.
* **Frontend Action:** Login as **HR** -> Go to **Loan Approvals** -> Click **"Reject"**.
* **Recipient:** Employee.
* **Expected Result:** Employee receives alert:  
  > 🔔 *Loan Application Rejected: Your loan request of AED 10,000 has been rejected.*

### 4.4 `LOAN_EMI_REMINDER`
* **Trigger:** Upcoming monthly loan EMI deduction notice before payroll execution.
* **Trigger Method:** Monthly Pre-Payroll Scheduler.
* **Recipient:** Employee.
* **Expected Result:**  
  > 🔔 *Upcoming Loan EMI: AED 833.33 will be deducted for your loan EMI in this month's salary.*

### 4.5 `LOAN_PAID_OFF`
* **Trigger:** Final loan installment is processed and remaining balance reaches AED 0.
* **Trigger Method:** Payroll Run Execution or Manual Loan Settlement.
* **Recipient:** Employee.
* **Expected Result:**  
  > 🔔 *Loan Fully Settled: Congratulations! Your loan #102 has been fully paid off.*

---

## 📄 Category 5: Employee Document Notifications (4 Types)

### 5.1 `DOCUMENT_EXPIRY_WARNING` (30 Days Before)
* **Trigger:** Document `end_date` is between 8 and 30 days away.
* **Trigger Method:** Daily Cron Scheduler at 07:00 (`HrmsNotificationScheduler.documentExpiryCheck()`).
* **Recipient:** Employee.
* **Expected Result:**  
  > 🔔 *Document Expiring Soon: Your Passport (ID: A1234567) expires on 2026-09-08. Please upload updated document.*

### 5.2 `DOCUMENT_EXPIRY_IMMINENT` (7 Days Before)
* **Trigger:** Document `end_date` is within the next 7 days.
* **Trigger Method:** Daily Cron Scheduler at 07:00 (`HrmsNotificationScheduler.documentExpiryCheck()`).
* **Recipient:** Employee & HR Managers.
* **Expected Result:**  
  > 🔔 *URGENT: Document Expiring in 7 Days: [Employee Name]'s Emirates ID expires on 2026-08-16. Immediate action required.*

### 5.3 `DOCUMENT_UPLOADED`
* **Trigger:** Employee uploads a new or renewed document.
* **Frontend Action:** Login as **Employee** -> Go to **My Profile / Documents** -> Upload document -> Save.
* **Recipient:** HR Admin.
* **Expected Result:** HR receives alert:  
  > 🔔 *New Document Uploaded: [Employee Name] uploaded a renewed Emirates ID for verification.*

### 5.4 `DOCUMENT_VERIFIED`
* **Trigger:** HR verifies and approves the uploaded document.
* **Frontend Action:** Login as **HR** -> Go to **Employee Documents** -> Click **"Verify"**.
* **Recipient:** Employee.
* **Expected Result:** Employee receives alert:  
  > 🔔 *Document Verified: Your renewed Emirates ID has been verified and updated in the system.*

---

## 👤 Category 6: Employee Lifecycle Notifications (6 Types)

### 6.1 `NEW_EMPLOYEE_ONBOARDED`
* **Trigger:** HR creates a new employee profile and user account.
* **Frontend Action:** Login as **HR** -> Go to **Employees** -> Click **"Add Employee"** -> Submit details.
* **Recipient:** All Staff / HR Admin.
* **Expected Result:**  
  > 🔔 *Welcome New Team Member! Please welcome [Employee Name] joining as Senior Accountant.*

### 6.2 `EMPLOYEE_PROFILE_UPDATED`
* **Trigger:** Changes made to core profile data (e.g. Bank details, Passport, Address).
* **Frontend Action:** Login as **Employee** or **HR** -> Update profile details -> Save.
* **Recipient:** Employee (security alert) & HR.
* **Expected Result:**  
  > 🔔 *Profile Information Updated: Your bank account details were updated on 2026-08-09.*

### 6.3 `PROBATION_ENDING`
* **Trigger:** Employee's probation period end date is within 7 days.
* **Trigger Method:** Daily Cron Scheduler at 07:30 (`HrmsNotificationScheduler.probationEndingCheck()`).
* **Recipient:** Employee & Line Manager / HR.
* **Expected Result:**  
  > 🔔 *Probation Period Ending Soon: [Employee Name]'s probation ends on [Date]. Please complete evaluation.*

### 6.4 `CONTRACT_EXPIRY_WARNING`
* **Trigger:** Limited-term employment contract is expiring within 60 days.
* **Trigger Method:** Weekly Contract Expiry Scheduler.
* **Recipient:** HR Manager & Employee.
* **Expected Result:**  
  > 🔔 *Employment Contract Expiring: Contract for [Employee Name] expires on [Date]. Renewal action required.*

### 6.5 `WORK_ANNIVERSARY`
* **Trigger:** Date of joining matches today's month & day.
* **Trigger Method:** Daily Cron Scheduler at 08:00 (`HrmsNotificationScheduler.workAnniversaryCheck()`).
* **Recipient:** Employee & Organization.
* **Expected Result:**  
  > 🔔 *Happy Work Anniversary! 🎉: Congratulations on completing 3 years with EmiratesERP! Thank you for your dedication.*

### 6.6 `BIRTHDAY_REMINDER`
* **Trigger:** Employee's date of birth matches today's month & day.
* **Trigger Method:** Daily Cron Scheduler at 08:30.
* **Recipient:** Employee & Team Members.
* **Expected Result:**  
  > 🔔 *Happy Birthday! 🎂: Wishing [Employee Name] a wonderful birthday!*

---

## 📢 Category 7: Announcements & Policy Notifications (3 Types)

### 7.1 `GENERAL_ANNOUNCEMENT`
* **Trigger:** HR broadcasts a company-wide announcement.
* **Trigger Action:** `POST /api/notifications/announce` with `{ "message": "Notice..." }`.
* **Recipient:** All Active Employees.
* **Expected Result:** Real-time popup to all connected users:  
  > 🔔 *HR Announcement: Office will remain closed on Sunday for UAE National Day.*

### 7.2 `HOLIDAY_ANNOUNCED`
* **Trigger:** HR publishes a new official public holiday.
* **Frontend Action:** Go to **Holiday Management** -> Add Holiday -> Check **"Publish & Notify"**.
* **Recipient:** All Employees.
* **Expected Result:**  
  > 🔔 *Official Holiday Announced: Eid Al Fitr holidays announced from April 10 to April 12.*

### 7.3 `POLICY_UPDATED`
* **Trigger:** HR updates company handbook or HR policies.
* **Frontend Action:** Go to **Policy Management** -> Upload/Update policy document.
* **Recipient:** All Employees.
* **Expected Result:**  
  > 🔔 *HR Policy Updated: The updated Remote Work Policy is now available in the employee portal.*

---

## 📜 Category 8: Compliance & System Notifications (5 Types)

### 8.1 `EMIRATIZATION_REPORT_READY`
* **Trigger:** Monthly Emiratization quota report trigger.
* **Trigger Method:** Monthly Cron Scheduler on 1st of month at 09:00 (`HrmsNotificationScheduler.emiratizationReportReminder()`).
* **Recipient:** HRMS_ADMIN / SUPER_ADMIN.
* **Expected Result:**  
  > 🔔 *Emiratization Report Due: Monthly Emiratization compliance report is due. Tap to view report details.*

### 8.2 `LABOR_CARD_REPORT_READY`
* **Trigger:** MOHRE Labor Card compliance check finding pending/expiring cards.
* **Trigger Method:** Weekly Compliance Scheduler.
* **Recipient:** HR Manager.
* **Expected Result:**  
  > 🔔 *Labor Card Compliance Alert: 2 labor cards require renewal before end of month.*

### 8.3 `HR_COMPLIANCE_REPORT_READY`
* **Trigger:** Quarterly HR compliance audit report generation.
* **Trigger Method:** System Audit Task.
* **Recipient:** Compliance Officer / HR Admin.
* **Expected Result:**  
  > 🔔 *HR Compliance Audit Ready: Q3 HR compliance audit report generated successfully.*

### 8.4 `END_OF_SERVICE_CALCULATED`
* **Trigger:** End of Service (EOS) / UAE Gratuity calculation is performed upon employee resignation/termination.
* **Frontend Action:** Go to **Employee Offboarding** -> Calculate Gratuity.
* **Recipient:** HR & Employee.
* **Expected Result:**  
  > 🔔 *End of Service Gratuity Calculated: Total UAE Law Gratuity computed: AED 34,500.00.*

### 8.5 `END_OF_SERVICE_GRATUITY_PAID`
* **Trigger:** Final settlement and gratuity payment processed.
* **Frontend Action:** Go to **Offboarding Payouts** -> Confirm Settlement.
* **Recipient:** Employee.
* **Expected Result:**  
  > 🔔 *Gratuity Settlement Paid: Your final settlement of AED 34,500.00 has been disbursed.*

---

## ⚡ Quick Direct API Trigger Test (Postman / cURL)

If you want to manually test any notification type instantly without filling out frontend forms, send a direct POST request to trigger the notification service:

```bash
# Example: Triggering a GENERAL_ANNOUNCEMENT broadcast
curl -X POST http://localhost:8080/api/notifications/announce \
  -H "Authorization: Bearer YOUR_HR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Testing Notification System - Manual Verification"
  }'
```

---

## ✅ Summary Matrix

| Category | Total Types | Key Testing Approach |
|----------|------------|----------------------|
| **Leave** | 11 | Submit, Approve, Reject leave & encashment forms |
| **Attendance** | 7 | Submit regularization, assign shifts, run scheduler |
| **Payroll & Expenses** | 9 | Process payroll run, submit/pay expenses, generate WPS |
| **Loans** | 5 | Apply for loan, approve, reject, check EMI |
| **Documents** | 4 | Upload document, verify document, set expiry dates |
| **Lifecycle** | 6 | Add employee, check probation/anniversary schedulers |
| **Announcements** | 3 | Use `/api/notifications/announce` endpoint |
| **Compliance** | 5 | Trigger offboarding gratuity & monthly compliance cron |
| **TOTAL** | **40** | **100% Covered** |
